#!/usr/bin/env python3
"""
Diamond Scraper — Universal Multi-Faceted B2B & Services Crawler
=================================================================
Automated technology detection:
1. WordPress REST API (if available) -> fetches exact posts, categories, and embedded media.
2. Deep HTML Crawling (fallback) -> crawls internal links recursively, extracts corporate metadata,
   contact info, logos, carousel candidates (with dimension check), and services/products catalog.

Outputs high-fidelity SQL ready for direct enjection into Supabase tables `stores` and `prods`.
"""

import os
import re
import ssl
import sys
import json
import time
import subprocess
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor

# SSL & Global Headers configuration (bypassing strict checks)
ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "tr,en-US;q=0.7,en;q=0.3"
}

def fetch_html(url, timeout=12):
    """Fetch raw HTML from a URL with custom headers and SSL bypass."""
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=timeout, context=ssl_ctx) as r:
            return r.read().decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"  ⚠ HTTP Fetch Failed: {url[:60]} -> {e}", file=sys.stderr)
        return ""

def fetch_json(url, timeout=10):
    """Fetch JSON data directly with SSL bypass."""
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=timeout, context=ssl_ctx) as r:
            return json.loads(r.read().decode("utf-8"))
    except Exception:
        return None

def get_image_dimensions(url):
    """Hacker Level: Resolve exact image width and height using curl + file command."""
    if not url or any(x in url.lower() for x in ['icon', 'favicon', '.svg']):
        return 0, 0
    try:
        # Avoid hanging on huge downloads: read head or limit transmission size
        cmd = f"curl -sL --insecure --max-time 6 '{url}' | file -"
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        out = result.stdout
        # Handle formats like "1920x1080", "1920 x 1080", or "JPEG image data, TM, 800x600"
        m = re.search(r'(\d{3,5})\s*x\s*(\d{3,5})', out)
        if m:
            return int(m.group(1)), int(m.group(2))
    except Exception:
        pass
    return 0, 0

def is_landscape(w, h):
    """Verify if the image dimensions qualify for premium carousel (ratio > 1.45, width >= 800)."""
    return w >= 800 and h > 0 and (w / h) >= 1.45

class SimpleHTMLParser:
    """Lightweight, resilient regex-based HTML parsing for maximum speed and simplicity."""
    def __init__(self, html, base_url):
        self.html = html
        self.base_url = base_url
        self.domain = urllib.parse.urlparse(base_url).netloc

    def extract_links(self):
        """Extract all internal links from anchor tags."""
        found = re.findall(r'href=["\']([^"\']+)["\']', self.html, re.I)
        internal = set()
        for link in found:
            # Skip anchor fragments and JavaScript calls
            if link.startswith('#') or link.startswith('javascript:'):
                continue
            full_url = urllib.parse.urljoin(self.base_url, link)
            parsed = urllib.parse.urlparse(full_url)
            # Filter internal links and avoid static media files
            if parsed.netloc == self.domain:
                path = parsed.path.lower()
                if not any(path.endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.zip', '.svg', '.webp']):
                    # Normalize by removing query parameters & fragments
                    normalized = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
                    internal.add(normalized)
        return internal

    def extract_images(self):
        """Extract all image sources."""
        srcs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', self.html, re.I)
        data_srcs = re.findall(r'<img[^>]+data-src=["\']([^"\']+)["\']', self.html, re.I)
        # Combine all found images
        all_imgs = set(srcs + data_srcs)
        resolved = set()
        for img in all_imgs:
            if img.startswith('data:image'):
                continue
            resolved.add(urllib.parse.urljoin(self.base_url, img))
        return resolved

    def get_meta_og_image(self):
        """Extract Open Graph featured image."""
        m = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']', self.html, re.I)
        if not m:
            m = re.search(r'<meta[^>]+name=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']', self.html, re.I)
        if m:
            return urllib.parse.urljoin(self.base_url, m.group(1))
        return ""

    def get_title(self):
        """Get page title."""
        m = re.search(r'<title>(.*?)</title>', self.html, re.I | re.S)
        if m:
            return re.sub(r'<[^>]+>', '', m.group(1)).strip()
        return ""

    def get_h1(self):
        """Get first h1 tag content."""
        m = re.search(r'<h1[^>]*>(.*?)</h1>', self.html, re.I | re.S)
        if m:
            return re.sub(r'<[^>]+>', '', m.group(1)).strip()
        return ""

    def extract_contact_info(self):
        """Scan page content for phone, email and address wrappers."""
        info = {"phone": "", "email": "", "address": ""}
        # 1. Phone search via tel:
        tel = re.findall(r'href=["\']tel:([^"\']+)["\']', self.html, re.I)
        if tel:
            info["phone"] = re.sub(r'[^\d+]', '', tel[0])
            if not info["phone"].startswith('+') and not info["phone"].startswith('90'):
                info["phone"] = "+90" + info["phone"].lstrip('0')
        # 2. Email search via mailto:
        mail = re.findall(r'href=["\']mailto:([^"\']+)["\']', self.html, re.I)
        if mail:
            info["email"] = mail[0].strip()
        # 3. Address heuristic search (common Turkish address patterns)
        addr_match = re.search(r'([^<>\n]+(?:Mahallesi|Mah\.|Sokak|Sok\.|No:|Kat:|İlçe|İstanbul|Ankara|İzmir)[^<>\n]+)', self.html, re.I)
        if addr_match:
            addr_text = re.sub(r'<[^>]+>', '', addr_match.group(1)).strip()
            if len(addr_text) > 15 and len(addr_text) < 150:
                info["address"] = addr_text
        return info


class UniversalScraper:
    def __init__(self, base_url, slug):
        self.base_url = base_url.rstrip('/')
        self.slug = slug
        self.domain = urllib.parse.urlparse(base_url).netloc
        self.results = {
            "slug": slug,
            "url": base_url,
            "logo": "",
            "phone": "",
            "email": "",
            "address": "",
            "tagline": "Profesyonel Kurumsal Çözümler",
            "carousel": {},      # Deduplicated by URL
            "categories": set(),
            "products": {}       # Deduplicated by clean Title
        }
        self.visited_urls = set()
        self.urls_to_visit = [self.base_url]

    def add_product(self, name, category, image, desc=""):
        if not name:
            return
        name = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', name)).strip()
        if len(name) < 3 or any(kw in name.lower() for kw in ['anasayfa', 'iletişim', 'hakkımızda', 'galeri', 'blog', 'sepet', 'hesabım']):
            return
        if name not in self.results["products"]:
            self.results["products"][name] = {
                "name": name,
                "category": category or "Genel",
                "image": image or "",
                "description": desc or f"{category} alanında profesyonel, güvenilir çözümler."
            }
            if category:
                self.results["categories"].add(category)

    def test_wordpress(self):
        """Detect if the website supports WordPress REST API endpoints."""
        print("🔍 Web site altyapısı kontrol ediliyor...")
        test_url = f"{self.base_url}/wp-json/wp/v2/posts?per_page=1"
        data = fetch_json(test_url)
        if data is not None and isinstance(data, list):
            print("  🤖 WordPress REST API algılandı! WordPress moduna geçiliyor.")
            return True
        print("  🌐 Özel CMS / HTML yapısı algılandı! Derin HTML tarama moduna geçiliyor.")
        return False

    # ── METOD 1: WORDPRESS REST API EXTRACTION ──────────────────────
    def scrape_via_wp_api(self):
        print("📂 WordPress kategorileri çekiliyor...")
        cats_data = fetch_json(f"{self.base_url}/wp-json/wp/v2/categories?per_page=100")
        cat_map = {c["id"]: c["name"] for c in cats_data} if cats_data else {}
        
        # Get logo & metadata
        html = fetch_html(self.base_url)
        self.parse_corporate_assets(html)

        print("📦 WordPress postları sızdırılıyor...")
        page = 1
        while page <= 10:
            posts = fetch_json(f"{self.base_url}/wp-json/wp/v2/posts?per_page=100&page={page}&_embed")
            if not posts:
                break
            for post in posts:
                title = post.get("title", {}).get("rendered", "")
                img = ""
                try:
                    img = post["_embedded"]["wp:featuredmedia"][0]["source_url"]
                except Exception:
                    pass
                
                post_cats = post.get("categories", [])
                category = cat_map.get(post_cats[0], "Genel") if post_cats else "Genel"
                desc = re.sub(r'<[^>]+>', '', post.get("excerpt", {}).get("rendered", "")).strip()
                self.add_product(title, category, img, desc)
                
            if len(posts) < 100:
                break
            page += 1

    # ── METOD 2: DEEP HTML CRAWLING (Universal Fallback) ────────────
    def scrape_via_deep_crawl(self):
        print("🕷️ Sayfalar taranıyor (Derinlik limitli recursive crawl)...")
        max_pages = 40
        crawled_count = 0
        all_found_images = set()

        while self.urls_to_visit and crawled_count < max_pages:
            url = self.urls_to_visit.pop(0)
            if url in self.visited_urls:
                continue
            
            print(f"  [{crawled_count+1}/{max_pages}] Tarama: {url}")
            self.visited_urls.add(url)
            # Polite delay to prevent rate limits
            time.sleep(1.0)
            html = fetch_html(url)
            if not html:
                continue

            crawled_count += 1
            parser = SimpleHTMLParser(html, url)
            
            # Parse corporate assets & contact on home or first few pages
            if crawled_count == 1:
                self.parse_corporate_assets(html)
            self.parse_contact_info(html)

            # Link discovery
            discovered_links = parser.extract_links()
            for link in discovered_links:
                if link not in self.visited_urls and link not in self.urls_to_visit:
                    # Prioritize service/product/category links
                    path = link.lower()
                    if any(kw in path for kw in ['/hizmet', '/urun', '/product', '/category', '/service', '/portfolio']):
                        self.urls_to_visit.insert(0, link) # LIFO priority
                    else:
                        self.urls_to_visit.append(link)   # FIFO fallback

            # Extract page images for carousel candidates
            all_found_images.update(parser.extract_images())

            # Detect leaf pages representing product/service
            self.evaluate_leaf_page(parser, url)
            
            time.sleep(0.1)

        # Hunt for premium landscape images for our carousel
        self.hunt_carousel_images(all_found_images)

    def parse_corporate_assets(self, html):
        """Extract metadata, slogans and dominant corporate logo."""
        parser = SimpleHTMLParser(html, self.base_url)
        title = parser.get_title()
        if title:
            # Generate 35-char maximum slogan from meta title
            clean_title = re.sub(r'[-|].*', '', title).strip()
            self.results["tagline"] = clean_title[:35]

        # Search logo URL
        logo_matches = re.findall(r'src=["\']([^"\']*logo[^"\']*\.(?:svg|png|jpg|jpeg|webp))["\']', html, re.I)
        if logo_matches:
            self.results["logo"] = urllib.parse.urljoin(self.base_url, logo_matches[0])
        else:
            # Fallback to og:image if it seems to contain a logo, otherwise empty
            og_img = parser.get_meta_og_image()
            if og_img and 'logo' in og_img.lower():
                self.results["logo"] = og_img

    def parse_contact_info(self, html):
        """Extract communication credentials (address, phone, email) if found on page."""
        parser = SimpleHTMLParser(html, self.base_url)
        info = parser.extract_contact_info()
        if info["phone"] and not self.results["phone"]:
            self.results["phone"] = info["phone"]
        if info["email"] and not self.results["email"]:
            self.results["email"] = info["email"]
        if info["address"] and not self.results["address"]:
            self.results["address"] = info["address"]

    def evaluate_leaf_page(self, parser, url):
        """Determine if a page represents a B2B product/service and extract its details."""
        path = url.lower().rstrip('/')
        filename = path.split('/')[-1]
        
        blacklist = [
            'index.html', 'index.php', 'index',
            'hakkimizda.html', 'hakkimizda', 'about.html', 'about',
            'iletisim.html', 'iletisim', 'contact.html', 'contact',
            'portfolio.html', 'portfolio', 'galeri.html', 'galeri', 'gallery.html', 'gallery',
            'referanslar.html', 'referanslar', 'referans',
            'sss.html', 'sss', 'faq',
            'ekibimiz.html', 'ekibimiz', 'team',
            'is-basvurusu.html', 'is-basvurusu', 'career',
            'blog.html', 'blog'
        ]
        
        if filename in blacklist or not filename:
            return

        is_page = filename.endswith('.html') or filename.endswith('.php') or '.' not in filename
        if not is_page:
            return

        h1 = parser.get_h1()
        if not h1:
            title = parser.get_title()
            if title:
                h1 = re.sub(r'[-|].*', '', title).strip()

        if not h1 or len(h1) < 4:
            return

        if any(kw in h1.lower() for kw in ['anasayfa', 'iletişim', 'hakkımızda', 'galeri', 'blog', 'sepet', 'hesabım', 'please wait', 'cloudflare', 'rate limit', 'captcha', 'attention required', 'access denied', 'checking your browser']):
            return

        # Sanitize name
        h1 = h1.replace(' - Aparan Temizlik', '').replace(' - Uygun Fiyat, Garantili Temizlik', '').strip()

        # Deduce category based on url slug
        category = "Temizlik Hizmetleri"
        if any(x in filename for x in ['ev', 'villa', 'daire']):
            category = "Ev Temizliği"
        elif any(x in filename for x in ['isyeri', 'ofis', 'buro', 'magaza']):
            category = "Kurumsal Temizlik"
        elif any(x in filename for x in ['dis-cephe', 'cam']):
            category = "Dış Cephe ve Cam Temizliği"
        elif any(x in filename for x in ['endustriyel', 'zemin', 'tadilat', 'insaat']):
            category = "Endüstriyel & İnşaat Temizliği"
        elif any(x in filename for x in ['bina', 'merdiven']):
            category = "Apartman Temizliği"

        # Check for image
        img = parser.get_meta_og_image()
        if not img:
            page_imgs = parser.extract_images()
            for p_img in page_imgs:
                if any(x in p_img.lower() for x in ['logo', 'icon', 'bg', 'banner', 'slider', 'button', 'favicon']):
                    continue
                img = p_img
                break

        # Extract authentic description
        # Extract authentic description
        desc = ""
        p_matches = re.findall(r'<p[^>]*>(.*?)</p>', parser.html, re.I | re.S)
        if p_matches:
            longest_p = ""
            for p in p_matches:
                p_clean = re.sub(r'<[^>]+>', '', p).strip()
                # Clean up newlines and extra spaces
                p_clean = re.sub(r'\s+', ' ', p_clean)
                
                # Check for legal/footer boilerplates
                is_boilerplate = any(kw in p_clean.lower() for kw in [
                    'copyright', '©', 'tüm hakları', 'yasal', 'korunmaktadır', 
                    'telif', 'saklıdır', 'tasarım', 'yazılım', 'tarafından', 'copy'
                ])
                
                # Real descriptions are at least 30 chars
                if len(p_clean) >= 30 and len(p_clean) > len(longest_p) and len(p_clean) < 300 and not is_boilerplate:
                    longest_p = p_clean
            if longest_p:
                desc = longest_p

        if not desc:
            desc = f"{h1} alanında tecrübeli ve profesyonel ekiplerimizle en ince ayrıntısına kadar hijyenik ve garantili temizlik hizmeti."

        self.add_product(h1, category, img, desc)

    def hunt_carousel_images(self, images):
        """Validate and select optimal landscape images for B2B storefront carousel."""
        print(f"🎠 {len(images)} görsel taranıyor (Karusel adayları boyutu doğrulanıyor)...")
        candidates = list(images)
        
        # Parallel image dimension fetching using standard python ThreadPool
        with ThreadPoolExecutor(max_workers=8) as executor:
            dims = list(executor.map(get_image_dimensions, candidates))

        for img_url, (w, h) in zip(candidates, dims):
            if is_landscape(w, h):
                self.results["carousel"][img_url] = {
                    "src": img_url,
                    "width": w,
                    "height": h
                }
                print(f"  ✅ YATAY BANNER: {img_url[:60]} ({w}x{h})")

    def run(self):
        is_wp = self.test_wordpress()
        if is_wp:
            self.scrape_via_wp_api()
        else:
            self.scrape_via_deep_crawl()

        # Build clean visual carousel slides list (max 4 slides)
        slides = []
        for i, img in enumerate(list(self.results["carousel"].values())[:4]):
            slides.append({
                "id": i + 1,
                "src": img["src"],
                "label": "Kurumsal Hizmet Standartları",
                "sub": "Yaşam ve çalışma alanlarınızda güvenli, titiz ve hijyenik temizlik çözümleri.",
                "bg": "bg-stone-100"
            })

        return {
            "slug": self.slug,
            "name": self.slug.replace('-', ' ').title(),
            "logo": self.results["logo"] or "📦",
            "tagline": self.results["tagline"] or "Profesyonel Kurumsal Hizmetler",
            "phone": self.results["phone"] or "905334126960", # default fallback
            "email": self.results["email"] or "info@ekatalog.com",
            "address": self.results["address"] or "İstanbul, Türkiye",
            "carousel": slides,
            "categories": sorted(list(self.results["categories"])),
            "products": list(self.results["products"].values())
        }


def generate_sql(data, output_file):
    """Compile scraped B2B/Services data into optimized SQL transactions."""
    store_ref = f"(SELECT id FROM stores WHERE slug = '{data['slug']}')"
    
    # Render carousel and categories
    carousel_json = json.dumps({"enabled": len(data["carousel"]) > 0, "slides": data["carousel"]}, ensure_ascii=False)
    cat_json = json.dumps(data["categories"], ensure_ascii=False)
    
    # Render announcement bar
    announcement_bar_json = json.dumps({"text": f"📦 {data['name']} B2B Sipariş ve Talep Kataloğu Yayında!", "enabled": True}, ensure_ascii=False)

    lines = [
        "-- ============================================================",
        f"-- Target Store: {data['name']} ({data['slug']})",
        f"-- Generated at: {time.strftime('%Y-%m-%d %H:%M:%S')}",
        f"-- Scraped: {len(data['products'])} products, {len(data['categories'])} categories",
        "-- ============================================================",
        "",
        "DO $$",
        "DECLARE",
        "    v_store_id uuid;",
        "BEGIN",
        "    -- 1. UPSERT STORE",
        "    INSERT INTO stores (slug, name, tagline, logo_url, phone, address, category_order, carousel_data, announcement_bar)",
        f"    VALUES ('{data['slug']}', '{data['name']}', '{data['tagline']}', '{data['logo']}', '{data['phone']}', '{data['address']}', '{cat_json}'::jsonb, '{carousel_json}'::jsonb, '{announcement_bar_json}'::jsonb)",
        "    ON CONFLICT (slug) DO UPDATE SET",
        f"        name = EXCLUDED.name,",
        f"        tagline = EXCLUDED.tagline,",
        f"        logo_url = EXCLUDED.logo_url,",
        f"        phone = EXCLUDED.phone,",
        f"        address = EXCLUDED.address,",
        f"        category_order = EXCLUDED.category_order,",
        f"        carousel_data = EXCLUDED.carousel_data,",
        f"        announcement_bar = EXCLUDED.announcement_bar;",
        "",
        f"    SELECT id INTO v_store_id FROM stores WHERE slug = '{data['slug']}';",
        "",
        "    -- 2. RESET EXISTING PRODUCTS",
        "    DELETE FROM prods WHERE store_id = v_store_id;",
        "",
        "    -- 3. INSERT PRODUCTS",
    ]

    if data["products"]:
        lines.append("    INSERT INTO prods (store_id, name, category, image_url, description, price) VALUES")
        rows = []
        for p in data["products"]:
            name = p["name"].replace("'", "''")
            cat  = p["category"].replace("'", "''")
            img  = p["image"].replace("'", "''")
            desc = p["description"].replace("'", "''")
            rows.append(f"        (v_store_id, '{name}', '{cat}', '{img}', '{desc}', '0')")
        lines.append(",\n".join(rows) + ";")
    else:
        lines.append("    -- No products scraped.")

    lines.extend([
        "END $$;",
        ""
    ])

    # Ensure target folder exists
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"\n✅ SQL yazıldı: {output_file}")


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Universal Multi-Faceted B2B Scraper")
    parser.add_argument("--url", required=True, help="Hedef website adresi (örn: http://aparantemizlik.com.tr)")
    parser.add_argument("--slug", required=True, help="Dükkan slug değeri (örn: aparan)")
    parser.add_argument("--out", default=None, help="Çıktı SQL dosyası")
    args = parser.parse_args()

    out_file = args.out or f"public/scraped_dumps/{args.slug}_inject.sql"
    
    print("\n" + "="*60)
    print("💎 [B2B_ALL_INCLUSIVE_CRAWLER_ACTIVE] 💎")
    print(f"Hedef: {args.url}")
    print(f"Slug:  {args.slug}")
    print("="*60 + "\n")

    scraper = UniversalScraper(args.url, args.slug)
    data = scraper.run()

    print("\n" + "="*40 + " SCRAPE RAPORU " + "="*40)
    print(f"Logo URL:     {data['logo']}")
    print(f"Slogan:       {data['tagline']}")
    print(f"İletişim:     Tel: {data['phone']} | Email: {data['email']}")
    print(f"Adres:        {data['address']}")
    print(f"Kategoriler:  {', '.join(data['categories'])}")
    print(f"Ürün/Hizmet:  {len(data['products'])} adet")
    print(f"Afiş/Carousel:{len(data['carousel'])} adet yatay görsel")
    print("="*95 + "\n")

    generate_sql(data, out_file)


if __name__ == "__main__":
    main()
