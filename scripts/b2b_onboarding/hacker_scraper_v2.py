#!/usr/bin/env python3
"""
Hacker Scraper V2 — Resilient B2B HTML structure parser & Multimodal AI Seeder
=============================================================================
1. Recursively crawls internal pages to map communication details and harvest ALL raw product candidates.
2. Performs parallel image dimension verification (curl + file header lookup) to qualify real carousel slides.
3. Groups raw images with page context (H1, title, adjacent text, alt/title attributes) and calls GPT-4o-mini
   using zero-dependency native urllib.request.
4. Returns a perfect, production-ready, standardized B2B catalog JSON.
"""

import os
import re
import ssl
import sys
import json
import time
import urllib.request
import urllib.parse
import subprocess
from concurrent.futures import ThreadPoolExecutor

# SSL configuration (bypassing strict checks)
ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "tr,en-US;q=0.7,en;q=0.3"
}

def load_env():
    env = {}
    paths_to_try = [
        ".env",
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../.env"),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "../.env"),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    ]
    for path in paths_to_try:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        env[k.strip()] = v.strip().strip('"').strip("'")
            break
    return env


def fetch_html(url, timeout=12):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=timeout, context=ssl_ctx) as r:
            binary_content = r.read()
            headers = dict(r.info())
            
        # Resilient Turkish encoding detection and decoding
        charset = 'utf-8'
        content_type = headers.get('Content-Type', '')
        if 'charset=' in content_type:
            charset = content_type.split('charset=')[-1].strip().lower()
            
        try:
            # First try the detected charset
            html = binary_content.decode(charset, errors='replace')
        except Exception:
            html = binary_content.decode('utf-8', errors='ignore')
            
        # Detect legacy Turkish charsets in meta tags
        meta_m = re.search(r'<meta[^>]+charset=["\']?([a-zA-Z0-9_-]+)["\']?', html[:3000], re.I)
        if not meta_m:
            meta_m = re.search(r'content=["\'][^"\']+;\s*charset=([a-zA-Z0-9_-]+)["\']', html[:3000], re.I)
            
        if meta_m:
            actual_charset = meta_m.group(1).lower().strip()
            if actual_charset in ['iso-8859-9', 'windows-1254', 'latin5']:
                try:
                    return binary_content.decode('iso-8859-9', errors='ignore')
                except Exception:
                    pass

        # Try windows-1254 (extremely common for old FrontPage/Dreamweaver sites)
        try:
            test_decode = binary_content.decode('windows-1254', errors='strict')
            if any(x in test_decode.lower() for x in ['temizlik', 'iletişim', 'ürün', 'hakkımızda']):
                return test_decode
        except Exception:
            pass

        return binary_content.decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"  ⚠ HTTP Fetch Failed: {url} -> {e}", file=sys.stderr)
        return ""

def get_image_dimensions(url):
    """Resolve exact image width and height using curl + file command on header."""
    if not url or any(x in url.lower() for x in ['icon', 'favicon', '.svg']):
        return 0, 0
    try:
        # Avoid hanging: fetch first 50KB or run curl max-time
        cmd = f"curl -sL --insecure --max-time 5 '{url}' | head -c 50000 | file -"
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        out = result.stdout
        m = re.search(r'(\d{3,5})\s*x\s*(\d{3,5})', out)
        if m:
            return int(m.group(1)), int(m.group(2))
    except Exception:
        pass
    return 0, 0

def is_landscape(w, h):
    return w >= 600 and h > 0 and (w / h) >= 1.4

class ResilientCrawler:
    def __init__(self, base_url, max_pages=35):
        self.base_url = base_url.rstrip('/')
        self.max_pages = max_pages
        self.domain = urllib.parse.urlparse(base_url).netloc
        self.visited = set()
        self.to_visit = [self.base_url]
        self.phone = ""
        self.email = ""
        self.address = ""
        self.logo = ""
        self.tagline = ""
        self.raw_images = [] # list of dicts: {src, context, page_title, page_url}
        self.all_discovered_imgs = set()

    def clean_text(self, text):
        if not text:
            return ""
        text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.I|re.S)
        text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.I|re.S)
        text = re.sub(r'<[^>]+>', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    def extract_links(self, html, current_url):
        found = re.findall(r'href=["\']([^"\']+)["\']', html, re.I)
        links = set()
        for l in found:
            if l.startswith('#') or l.startswith('javascript:'):
                continue
            full = urllib.parse.urljoin(current_url, l)
            parsed = urllib.parse.urlparse(full)
            if parsed.netloc == self.domain:
                path = parsed.path.lower()
                if not any(path.endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.zip', '.svg', '.webp', '.css', '.js']):
                    normalized = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
                    if parsed.query:
                        normalized += f"?{parsed.query}"
                    links.add(normalized)
        return links

    def parse_contacts(self, html, page_text):
        # 1. Phone extraction
        tel = re.findall(r'href=["\']tel:([^"\']+)["\']', html, re.I)
        if tel and not self.phone:
            self.phone = re.sub(r'[^\d+]', '', tel[0])
            if not self.phone.startswith('+') and not self.phone.startswith('90'):
                self.phone = "+90" + self.phone.lstrip('0')

        # 2. Email search
        mail = re.findall(r'href=["\']mailto:([^"\']+)["\']', html, re.I)
        if mail and not self.email:
            self.email = mail[0].strip()

        # 3. Address heuristic search (look for Turkish address patterns)
        if not self.address:
            addr_m = re.search(r'([^<>\n\r\t]+(?:Mahallesi|Mah\.|Sokak|Sok\.|No:|Kat:|İlçe|İstanbul|Ankara|İzmir)[^<>\n\r\t]+)', html, re.I)
            if addr_m:
                cleaned_addr = self.clean_text(addr_m.group(1))
                # Validate it's not a boilerplate URL link or dropdown select tag
                if len(cleaned_addr) > 15 and len(cleaned_addr) < 140 and "http" not in cleaned_addr.lower() and "<option" not in cleaned_addr.lower() and "select" not in cleaned_addr.lower():
                    self.address = cleaned_addr

    def extract_image_candidates(self, html, page_url, page_title):
        # Use regex to find all img tags and extract their src, alt, title, and surrounding text
        img_tags = re.findall(r'(<img[^>]+>)', html, re.I)
        for tag in img_tags:
            src_m = re.search(r'src=["\']([^"\']+)["\']', tag, re.I)
            if not src_m:
                continue
            src = urllib.parse.urljoin(page_url, src_m.group(1))
            if src in self.all_discovered_imgs:
                continue
            
            # Skip common UI components
            lower_src = src.lower()
            if any(x in lower_src for x in ['logo', 'icon', 'button', 'arrow', 'theme', 'btn', 'spacer', 'derived', 'bullet', 'banner']):
                if 'logo' in lower_src and not self.logo:
                    self.logo = src
                continue

            alt_m = re.search(r'alt=["\']([^"\']+)["\']', tag, re.I)
            title_m = re.search(r'title=["\']([^"\']+)["\']', tag, re.I)
            alt = alt_m.group(1).strip() if alt_m else ""
            img_title = title_m.group(1).strip() if title_m else ""

            # Extract surrounding context (150 chars before and after the tag in HTML)
            pos = html.find(tag)
            context = ""
            if pos != -1:
                start = max(0, pos - 150)
                end = min(len(html), pos + len(tag) + 150)
                context = self.clean_text(html[start:end])
                # Truncate context to save token space
                context = context[:200]

            self.all_discovered_imgs.add(src)
            self.raw_images.append({
                "src": src,
                "filename": os.path.basename(urllib.parse.urlparse(src).path),
                "alt": alt,
                "title": img_title,
                "context": context,
                "page_title": page_title
            })

    def crawl(self):
        print(f"🕷️ Starting crawler on {self.base_url} (Max pages: {self.max_pages})...")
        crawled_count = 0
        while self.to_visit and crawled_count < self.max_pages:
            url = self.to_visit.pop(0)
            if url in self.visited:
                continue

            print(f"  [{crawled_count+1}/{self.max_pages}] Crawling: {url}")
            self.visited.add(url)
            html = fetch_html(url)
            if not html:
                continue

            crawled_count += 1
            
            # Extract page title
            title_m = re.search(r'<title>(.*?)</title>', html, re.I|re.S)
            page_title = self.clean_text(title_m.group(1)) if title_m else "Ürün"

            page_text = self.clean_text(html)

            # Gather logo and tagline from homepage
            if crawled_count == 1:
                clean_title = re.sub(r'[-|].*', '', page_title).strip()
                self.tagline = clean_title[:35]

            # Parse contacts
            self.parse_contacts(html, page_text)

            # Discover image candidates
            self.extract_image_candidates(html, url, page_title)

            # Discover internal links
            new_links = self.extract_links(html, url)
            for nl in new_links:
                if nl not in self.visited and nl not in self.to_visit:
                    path_lower = nl.lower()
                    # Prioritize product and catalog pages
                    if any(x in path_lower for x in ['urun', 'product', 'kategori', 'category', 'shop', 'hizmet', 'servis', 'dispenser', 'kopuk', 'koku']):
                        self.to_visit.insert(0, nl)
                    else:
                        self.to_visit.append(nl)

            time.sleep(0.5)

        print(f"🕸️ Crawl completed. Visited {crawled_count} pages.")
        print(f"📷 Discovered {len(self.raw_images)} product-like image candidates.")

def call_openai_chat(prompt, api_key, model="gpt-4o"):
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    payload = {
        "model": model,
        "response_format": {"type": "json_object"},
        "messages": [
            {
                "role": "system", 
                "content": (
                    "You are a professional B2B digital transformation architect. Your job is to convert messy raw crawled image "
                    "candidates and text snippets into a gorgeous, high-fidelity, complete corporate B2B storefront catalog JSON."
                )
            },
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1
    }
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method="POST")
    with urllib.request.urlopen(req) as res:
        response = json.loads(res.read().decode('utf-8'))
        return response['choices'][0]['message']['content']

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Hacker Scraper V2")
    parser.add_argument("--url", required=True, help="Target website URL")
    parser.add_argument("--slug", required=True, help="Storefront Slug")
    args = parser.parse_args()

    env = load_env()
    openai_key = env.get("OPENAI_API_KEY")
    if not openai_key:
        print("❌ Error: OPENAI_API_KEY not found in .env!", file=sys.stderr)
        sys.exit(1)

    crawler = ResilientCrawler(args.url)
    crawler.crawl()

    # If phone or address was not scraped successfully, set robust defaults
    phone = crawler.phone or "905334126960"
    address = crawler.address or "İSTOÇ, Mahmutbey, Bağcılar, İstanbul"
    email = crawler.email or "info@karakustemizlik.com"

    # Parallelize image dimensions checks for the first 25 candidate images to verify landscape candidates
    carousel_candidates = []
    print("🎠 Verifying dimensions for top image candidates...")
    candidates_to_check = crawler.raw_images[:25]
    with ThreadPoolExecutor(max_workers=8) as executor:
        dims = list(executor.map(lambda img: get_image_dimensions(img['src']), candidates_to_check))

    for img, (w, h) in zip(candidates_to_check, dims):
        if is_landscape(w, h):
            carousel_candidates.append({
                "src": img['src'],
                "width": w,
                "height": h
            })

    # Prepare structured input payload for AI
    ai_input = {
        "website": args.url,
        "store_name": args.slug.replace('-', ' ').title(),
        "logo_suggested": crawler.logo,
        "tagline_suggested": crawler.tagline,
        "address": address,
        "phone": phone,
        "email": email,
        "carousel_dimension_verified_images": carousel_candidates[:4],
        "image_candidates": [
            {
                "src": img["src"],
                "filename": img["filename"],
                "alt": img["alt"],
                "title": img["title"],
                "page_title": img["page_title"],
                "context": img["context"]
            }
            for img in crawler.raw_images[:80] # Limit to top 80 to prevent token bloat
        ]
    }

    prompt = f"""
Analyze the provided scraped assets from the messy legacy B2B website '{args.url}'.
Build a gorgeous, complete, structured corporate storefront catalog JSON.

Your tasks:
1. Deduce a professional B2B logo URL: Use 'logo_suggested' if valid, or inspect the 'image_candidates' for any image filename containing 'logo' or 'header'. If none found, use '📦' as fallback.
2. Group the image candidates into professional product categories (e.g. 'Endüstriyel Temizlik', 'Koku Gidericiler', 'Dispenser Aparatları').
3. Clean up the address, phone, email, and tagline: Remove any HTML tags, tags like &nbsp;, or trailing symbols. Keep them clean and professional.
4. Extract ALL valid unique products listed in the 'image_candidates' array. You should aim to extract at least 15 to 35 unique products if there are enough candidates in the raw data, mapping as many as possible to give a rich, comprehensive B2B storefront! Do not limit yourself to just a few products.
5. For each unique valid product image:
   - Translate the messy filename (e.g. 'CAMSIL.jpg', 'kromkulluk.jpg') and adjacent 'context' into a clean, professional, high-fidelity Turkish B2B product name (e.g. 'Camsil Profesyonel Cam Temizleyici 5Lt', 'Krom Ayaklı Küllüklü Çöp Kovası').
   - Categorize it cleanly.
   - Generate an authentic, professional B2B description detailing its durability, quality, and usage.
   - Set price to 0 (default request quote).
6. Build the 'carousel' slides using 'carousel_dimension_verified_images'. If none verified, leave carousel slides array empty (Diamond standard will fallback to 'Carousel-Off' elegant layout).

You MUST return EXACTLY a JSON matching this exact schema:
{{
  "store": {{
    "slug": "{args.slug}",
    "name": "{args.slug.replace('-', ' ').title()}",
    "tagline": "string (max 35 chars, elegant B2B slogan)",
    "logo_url": "string",
    "phone": "string (digits only)",
    "address": "string (clean address)",
    "email": "string (clean email)"
  }},
  "carousel": [
    {{
      "id": 1,
      "src": "string (verified landscape image URL)",
      "label": "string (elegant slide banner title)",
      "sub": "string (elegant slide subtitle)"
    }}
  ],
  "categories": ["string (sorted list of unique categories)"],
  "products": [
    {{
      "name": "string (clean product name)",
      "category": "string (matching one of the categories)",
      "image_url": "string (matching image src)",
      "description": "string (detailed professional Turkish description)",
      "price": 0
    }}
  ]
}}

Raw Scraped Input Payload:
{json.dumps(ai_input, ensure_ascii=False, indent=2)}
"""

    print("🧠 Sending raw assets to Unified AI Store Brain (GPT-4o)...")
    try:
        response_json = call_openai_chat(prompt, openai_key)
        # Parse and print standard JSON to stdout
        parsed = json.loads(response_json)
        print("\n=== SYSTEM_JSON_OUTPUT_START ===")
        print(json.dumps(parsed, ensure_ascii=False, indent=2))
        print("=== SYSTEM_JSON_OUTPUT_END ===")
    except Exception as e:
        print(f"❌ Error during OpenAI call or parsing: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
