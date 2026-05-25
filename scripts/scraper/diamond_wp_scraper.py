import os
import json
import ssl
import sys
import time
import re
import urllib.request
import subprocess
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urljoin, urlparse

# Diamond Standard: SSL & Header Setup
ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ekatalog-diamond-bot/2.0"}

def fetch_html(url, timeout=10):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=timeout, context=ssl_ctx) as r:
            return r.read().decode("utf-8", errors="ignore")
    except Exception:
        return ""

def fetch_json(url, timeout=10):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=timeout, context=ssl_ctx) as r:
            return json.loads(r.read().decode("utf-8"))
    except Exception:
        return None

def get_img_dims(url):
    """Hacker Level: Check image dimensions via curl + file command."""
    try:
        if any(x in url.lower() for x in ['icon', 'favicon', 'logo', '.svg']):
            return 0, 0
        cmd = f"curl -sL --insecure --max-time 5 '{url}' | file -"
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        out = result.stdout
        m = re.search(r'(\d{3,5})\s*x\s*(\d{3,5})', out)
        if m:
            return int(m.group(1)), int(m.group(2))
    except:
        pass
    return 0, 0

def is_landscape(w, h):
    return w >= 800 and (w / h) > 1.3

class DiamondScraper:
    def __init__(self, base_url, slug):
        self.base_url = base_url.rstrip('/')
        self.slug = slug
        self.domain = urlparse(base_url).netloc
        self.results = {
            "slug": slug,
            "url": base_url,
            "logo": "",
            "carousel": {}, # Deduplicated by URL
            "categories": set(),
            "products": {},  # Deduplicated by Name
            "meta": {"title": "", "desc": ""}
        }

    def add_product(self, name, category, image):
        if not name: return
        name = re.sub(r'<[^>]+>', '', name).strip()
        if not name or len(name) < 2: return
        if name not in self.results["products"]:
            self.results["products"][name] = {"name": name, "category": category or "Genel", "image": image or ""}
            if category: self.results["categories"].add(category)

    def add_carousel(self, url, w, h):
        if not url or url in self.results["carousel"]: return
        if is_landscape(w, h):
            self.results["carousel"][url] = {"url": url, "w": w, "h": h}

    def get_branding_meta(self):
        html = fetch_html(self.base_url)
        t = re.search(r'<title>(.*?)</title>', html, re.I)
        d = re.search(r'<meta name="description" content="(.*?)"', html, re.I)
        self.results["meta"]["title"] = t.group(1) if t else ""
        self.results["meta"]["desc"] = d.group(1) if d else ""
        logo = re.search(r'src=["\']([^"\']*logo[^"\']*\.(?:svg|png|jpg|jpeg))["\']', html, re.I)
        if logo:
            self.results["logo"] = urljoin(self.base_url, logo.group(1))

    def scrape_via_api(self):
        """Method 1: Official WP REST API."""
        cats_data = fetch_json(f"{self.base_url}/wp-json/wp/v2/categories?per_page=100")
        cat_map = {c["id"]: c["name"] for c in cats_data} if cats_data else {}
        page = 1
        while page <= 10:
            data = fetch_json(f"{self.base_url}/wp-json/wp/v2/posts?per_page=100&page={page}&_embed")
            if not data: break
            for post in data:
                img = ""
                try: img = post["_embedded"]["wp:featuredmedia"][0]["source_url"]
                except: pass
                post_cats = post.get("categories", [])
                cat_name = cat_map.get(post_cats[0], "Genel") if post_cats else "Genel"
                self.add_product(post.get("title", {}).get("rendered"), cat_name, img)
            if len(data) < 100: break
            page += 1

    def scrape_via_schema(self):
        """Method 2: JSON-LD / Schema.org Extraction."""
        html = fetch_html(self.base_url)
        schemas = re.findall(r'<script type=["\']application/ld\+json["\']>(.*?)</script>', html, re.S)
        for s in schemas:
            try:
                data = json.loads(s)
                items = data.get("@graph", [data]) if isinstance(data, dict) else []
                for item in items:
                    if item.get("@type") == "Product":
                        self.add_product(item.get("name"), "Ürünler", item.get("image"))
            except: pass

    def deep_image_hunt(self):
        """Multi-Vector Image Hunting."""
        # Vector A: Media API
        media = fetch_json(f"{self.base_url}/wp-json/wp/v2/media?per_page=50")
        all_candidates = set([m["source_url"] for m in media if m.get("source_url")] if media else [])
        
        # Vector B: Meta & Links
        html = fetch_html(self.base_url)
        all_candidates.update(re.findall(r'property=["\']og:image["\'] content=["\']([^"\']+)["\']', html))
        
        # Vector C: Deep Link Crawl (Top 10 pages)
        links = re.findall(r'href=["\'](https?://' + self.domain + r'/[^"\']+)["\']', html)
        for link in list(set(links))[:10]:
            p_html = fetch_html(link)
            all_candidates.update(re.findall(r'src=["\']([^"\']+\.(?:jpg|jpeg|png|webp))["\']', p_html))

        full_urls = [urljoin(self.base_url, img) for img in all_candidates if len(img) > 5]
        with ThreadPoolExecutor(max_workers=10) as executor:
            dims = list(executor.map(get_img_dims, full_urls))
        for url, (w, h) in zip(full_urls, dims):
            self.add_carousel(url, w, h)

    def run(self):
        self.get_branding_meta()
        with ThreadPoolExecutor(max_workers=2) as executor:
            executor.submit(self.scrape_via_api)
            executor.submit(self.scrape_via_schema)
        self.deep_image_hunt()
        return {
            "slug": self.slug,
            "url": self.base_url,
            "logo": self.results["logo"],
            "carousel": list(self.results["carousel"].values())[:6],
            "categories": list(self.results["categories"]),
            "products": list(self.results["products"].values()),
            "meta": self.results["meta"]
        }

def process_single(url, url_to_lead):
    def clean_url(u):
        return u.rstrip('/').replace('https://', '').replace('http://', '').replace('www.', '')
    cleaned = clean_url(url)
    lead = url_to_lead.get(cleaned, {"slug": cleaned.split('.')[0], "name": cleaned})
    slug = lead.get("slug")
    print(f"💎 [{slug}] MASTER SCRAPE ACTIVE...")
    scraper = DiamondScraper(url, slug)
    try:
        return scraper.run()
    except Exception as e:
        print(f"  ❌ [{slug}] Failed: {e}")
        return None

def batch_process():
    if not os.path.exists('public/tech_stacks.json'): return
    with open('public/tech_stacks.json', 'r') as f:
        tech_map = json.load(f)
    leads = []
    for path in ['public/leads_gold.json', 'public/leads_silver.json']:
        if os.path.exists(path):
            with open(path, 'r') as f:
                leads.extend(json.load(f))
    def clean_url(u):
        return u.rstrip('/').replace('https://', '').replace('http://', '').replace('www.', '')
    url_to_lead = {clean_url(l["website"]): l for l in leads if l.get("website")}
    wp_urls = [url for url, tech in tech_map.items() if tech == "WordPress"]
    print(f"🚀 Starting Multi-Vector Diamond Scrape for {len(wp_urls)} WordPress sites...")
    all_results = []
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(process_single, url, url_to_lead) for url in wp_urls]
        for i, future in enumerate(futures):
            res = future.result()
            if res: all_results.append(res)
            if (i+1) % 5 == 0:
                print(f"  📊 Progress: {i+1}/{len(wp_urls)} completed.")
                with open('public/diamond_scrape_results.json', 'w') as f:
                    json.dump(all_results, f, indent=2)
    with open('public/diamond_scrape_results.json', 'w') as f:
        json.dump(all_results, f, indent=2)
    print(f"\n🏁 ALL DONE! {len(all_results)} sites processed successfully.")

if __name__ == "__main__":
    batch_process()
