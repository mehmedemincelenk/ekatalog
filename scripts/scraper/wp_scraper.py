#!/usr/bin/env python3
"""
ekatalog B2B WordPress Site Scraper
=====================================
Diamond Standard: Tüm kategori, ürün ve görsel verilerini WP REST API'den çeker.
Çıktı: SQL INSERT ifadeleri → Supabase'e direkt uygulanabilir.

Kullanım:
  python3 wp_scraper.py --url http://mursidoglu.com.tr --slug mursidoglufirca --limit 20
"""

import argparse
import json
import sys
import time
import urllib.request
import urllib.error
import subprocess
import ssl

ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE


def fetch(url, timeout=10):
    """HTTP GET — SSL bypass."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "ekatalog-scraper/1.0"})
        with urllib.request.urlopen(req, timeout=timeout, context=ssl_ctx) as r:
            return json.loads(r.read().decode("utf-8"))
    except Exception as e:
        print(f"  ⚠️  {url} → {e}", file=sys.stderr)
        return None


def get_image_dimensions(url):
    """curl + file komutu ile görsel boyutu al."""
    try:
        result = subprocess.run(
            f"curl -sL --insecure --max-time 8 '{url}' | file -",
            shell=True, capture_output=True, text=True
        )
        out = result.stdout
        import re
        # "precision 8, 1920x770" veya "1920 x 770" formatlarını yakala
        # JPEG'lerde EXIF density (72x72) değil pixel boyutunu al
        # "precision 8, WxH" → JPEG gerçek boyut
        m = re.search(r'precision \d+, (\d+)x(\d+)', out)
        if m:
            return int(m.group(1)), int(m.group(2))
        # PNG: "WxH, 8-bit"
        m = re.search(r',\s*(\d+)\s*x\s*(\d+)\s*,', out)
        if m:
            return int(m.group(1)), int(m.group(2))
        # Genel fallback
        m = re.search(r'(\d{3,5})x(\d{3,5})', out)
        if m:
            return int(m.group(1)), int(m.group(2))
    except Exception:
        pass
    return None, None


def is_landscape(w, h):
    """Carousel uygunluğu: yatay ve min 800px."""
    return w and h and w >= 800 and (w / h) > 1.5


def scrape_categories(base_url, limit=None):
    """Tüm kategorileri çek."""
    print("📂 Kategoriler çekiliyor...")
    cats = []
    page = 1
    while True:
        data = fetch(f"{base_url}/wp-json/wp/v2/categories?per_page=100&page={page}")
        if not data:
            break
        cats.extend(data)
        if len(data) < 100:
            break
        page += 1
    
    # Genel/uncategorized'i ele
    cats = [c for c in cats if c.get("slug") not in ("uncategorized", "genel") and c.get("count", 0) > 0]
    print(f"  ✅ {len(cats)} kategori bulundu")
    return cats


def scrape_products_for_category(base_url, cat_id, cat_name, limit=None):
    """Bir kategorideki tüm ürünleri çek."""
    products = []
    page = 1
    per_page = limit if limit else 100
    
    while True:
        data = fetch(f"{base_url}/wp-json/wp/v2/posts?categories={cat_id}&per_page={per_page}&page={page}&_fields=id,title,content,featured_media,_links")
        if not data:
            break
        
        for post in data:
            title = post.get("title", {}).get("rendered", "").strip()
            # HTML temizle
            import re
            title = re.sub(r'<[^>]+>', '', title)
            
            # Görsel URL'si
            image_url = None
            media_id = post.get("featured_media")
            if media_id:
                media = fetch(f"{base_url}/wp-json/wp/v2/media/{media_id}?_fields=source_url")
                if media:
                    image_url = media.get("source_url")
            
            products.append({
                "name": title,
                "category": cat_name,
                "image_url": image_url or "",
                "price": "0",
            })
        
        if limit or len(data) < per_page:
            break
        page += 1
    
    return products


def scrape_carousel_images(base_url):
    """Ana sayfadan yatay banner görselleri çek."""
    print("🎠 Carousel görselleri taranıyor...")
    candidates = []
    
    try:
        result = subprocess.run(
            f"curl -sL --insecure --max-time 10 '{base_url}' | grep -oEi 'src=\"[^\"]+\\.(jpg|png|jpeg|webp)\"'",
            shell=True, capture_output=True, text=True
        )
        import re
        urls = re.findall(r'src="([^"]+)"', result.stdout)
        
        # Background-image URL'leri de kontrol et
        result2 = subprocess.run(
            f"curl -sL --insecure --max-time 10 '{base_url}' | grep -oEi \"background:url\\('[^']+\\.jpg'\\)\"",
            shell=True, capture_output=True, text=True
        )
        bg_urls = re.findall(r"url\('([^']+)'\)", result2.stdout)
        urls.extend(bg_urls)
        
        # Benzersiz, logo/icon/placeholder olmayan URL'ler
        seen = set()
        for url in urls:
            if any(x in url.lower() for x in ['logo', 'icon', 'favicon', 'placeholder', 'avatar']):
                continue
            if url in seen:
                continue
            seen.add(url)
            
            w, h = get_image_dimensions(url)
            if is_landscape(w, h):
                candidates.append({"url": url, "width": w, "height": h})
                print(f"  ✅ YATAY: {url} ({w}x{h})")
            else:
                print(f"  ❌ KARE/DİKEY: {url} ({w}x{h})")
    
    except Exception as e:
        print(f"  ⚠️ Carousel tarama hatası: {e}")
    
    return candidates


def scrape_logo(base_url):
    """Logo URL'sini çek ve doğrula."""
    print("🏷️  Logo aranıyor...")
    try:
        result = subprocess.run(
            f"curl -sL --insecure --max-time 10 '{base_url}' | grep -oEi 'src=\"[^\"]+logo[^\"]+\"'",
            shell=True, capture_output=True, text=True
        )
        import re
        urls = re.findall(r'src="([^"]+)"', result.stdout)
        for url in urls:
            # HTTP HEAD kontrolü
            check = subprocess.run(
                f"curl -sL --insecure -o /dev/null -w '%{{http_code}}' --max-time 5 '{url}'",
                shell=True, capture_output=True, text=True
            )
            if check.stdout.strip() == "200":
                print(f"  ✅ Logo: {url}")
                return url
    except Exception as e:
        print(f"  ⚠️ Logo hatası: {e}")
    return None


def main():
    parser = argparse.ArgumentParser(description="ekatalog WP Scraper")
    parser.add_argument("--url", required=True, help="Site URL (http://example.com)")
    parser.add_argument("--slug", required=True, help="Store slug (mursidoglufirca)")
    parser.add_argument("--limit", type=int, default=None, help="Kategori başına max ürün (test için)")
    parser.add_argument("--cats-only", action="store_true", help="Sadece kategorileri listele")
    args = parser.parse_args()

    base_url = args.url.rstrip("/")
    
    print(f"\n🚀 [B2B_ALL_INCLUSIVE_CRAWLER_ACTIVE]")
    print(f"   Hedef: {base_url}")
    print(f"   Slug:  {args.slug}\n")

    # AŞAMA 1: Logo
    logo_url = scrape_logo(base_url)

    # AŞAMA 2: Carousel
    carousel = scrape_carousel_images(base_url)
    
    # AŞAMA 3: Kategoriler
    categories = scrape_categories(base_url)
    
    if args.cats_only:
        print("\n📋 KATEGORİ LİSTESİ:")
        for c in categories:
            print(f"  [{c['count']:4}] {c['name']}")
        return

    # AŞAMA 4: Ürünler
    all_products = []
    print(f"\n📦 Ürünler çekiliyor ({len(categories)} kategori)...")
    for cat in categories:
        print(f"  → {cat['name']} ({cat['count']} ürün)...")
        prods = scrape_products_for_category(base_url, cat["id"], cat["name"], args.limit)
        all_products.extend(prods)
        time.sleep(0.3)  # Rate limiting

    # ÖZET RAPOR
    print(f"\n{'='*60}")
    print(f"📊 SCRAPE TAMAMLANDI")
    print(f"{'='*60}")
    print(f"Logo:        {logo_url or '❌ Bulunamadı'}")
    print(f"Carousel:    {len(carousel)} yatay görsel")
    print(f"Kategoriler: {len(categories)}")
    print(f"Ürünler:     {len(all_products)}")
    
    # SQL ÇIKTISI
    print(f"\n-- ===== SQL OUTPUT =====")
    print(f"-- Slug: {args.slug}")
    
    if logo_url:
        print(f"\nUPDATE stores SET logo_url = '{logo_url}' WHERE slug = '{args.slug}';")
    
    if carousel:
        slides = []
        for i, img in enumerate(carousel[:5]):  # Max 5 slide
            slides.append({
                "id": i + 1,
                "src": img["url"],
                "bg": "bg-stone-100",
                "label": f"Slayt {i+1}",
                "sub": "Toptan fiyat avantajı"
            })
        carousel_json = json.dumps({"enabled": True, "slides": slides}, ensure_ascii=False)
        print(f"\nUPDATE stores SET carousel_data = '{carousel_json}' WHERE slug = '{args.slug}';")
    
    cat_names = [c["name"] for c in categories]
    cat_json = json.dumps(cat_names, ensure_ascii=False)
    print(f"\nUPDATE stores SET category_order = '{cat_json}' WHERE slug = '{args.slug}';")
    
    if all_products:
        store_query = f"(SELECT id FROM stores WHERE slug = '{args.slug}')"
        print(f"\n-- {len(all_products)} ürün INSERT")
        print(f"DELETE FROM prods WHERE store_id = {store_query};")
        print(f"INSERT INTO prods (store_id, name, category, image_url, price) VALUES")
        rows = []
        for p in all_products:
            name = p['name'].replace("'", "''")
            cat = p['category'].replace("'", "''")
            img = p['image_url'].replace("'", "''")
            rows.append(f"  ({store_query}, '{name}', '{cat}', '{img}', '{p['price']}')")
        print(",\n".join(rows) + ";")


if __name__ == "__main__":
    main()
