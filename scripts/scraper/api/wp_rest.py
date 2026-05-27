import os
import sys
import re
import html
import ssl
import json
import time
import urllib.request

# Ensure parent directory is in python path
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

def try_wp_rest_extract(base_url, store_name):
    """
    WordPress REST API üzerinden tüm ürünleri, resimleri ve kategorileri saniyeler içinde çeker.
    Hem '/wp-json/wp/v2/product' (WooCommerce) hem de '/wp-json/wp/v2/posts' endpoint'lerini kontrol eder.
    """
    context = ssl._create_unverified_context()
    clean_base = base_url.rstrip("/")
    endpoints = ["/wp-json/wp/v2/product", "/wp-json/wp/v2/posts"]
    api_url = None
    total_posts = 0
    
    for endpoint in endpoints:
        test_url = f"{clean_base}{endpoint}?per_page=1"
        print(f"🕵️ WordPress REST API kontrol ediliyor: {test_url}")
        req = urllib.request.Request(test_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        try:
            with urllib.request.urlopen(req, context=context, timeout=10) as r:
                if r.status == 200:
                    headers = r.info()
                    total = int(headers.get("X-WP-Total", 0))
                    if total > 0:
                        api_url = f"{clean_base}{endpoint}"
                        total_posts = total
                        print(f"  🔥 WordPress REST API Aktif! ({endpoint}) Toplam {total_posts} adet ürün/yazı tespit edildi.")
                        break
        except Exception as e:
            print(f"  ℹ️ Endpoint {endpoint} aktif değil veya erişilemez: {e}")
            
    if not api_url:
        return None

    # Sunucuyu yormamak için sayfa başı 30 ürün ve sıralı (sequential) çekim
    per_page = 30
    total_pages = (total_posts + per_page - 1) // per_page
    
    print(f"  📥 {total_posts} ürün {total_pages} sayfa halinde sıralı (sequential) olarak çekiliyor...")
    
    all_data = []
    for page_num in range(1, total_pages + 1):
        # Önce embed'li deneyelim, başarısız olursa embed'siz deneyeceğiz
        page_url = f"{api_url}?per_page={per_page}&page={page_num}&_embed"
        print(f"    📄 Sayfa {page_num}/{total_pages} çekiliyor...")
        
        success = False
        for attempt in range(1, 4):
            req = urllib.request.Request(page_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
            try:
                with urllib.request.urlopen(req, context=context, timeout=15) as response:
                    res_json = json.loads(response.read().decode('utf-8'))
                    if isinstance(res_json, list):
                        all_data.extend(res_json)
                        success = True
                        break
            except Exception as ex:
                print(f"      ⚠ Sayfa {page_num} embed deneme {attempt}/3 başarısız: {ex}")
                time.sleep(1)
                
        # Eğer embed'li çekim tamamen başarısız olursa, embed'siz deneyelim
        if not success:
            page_url_no_embed = f"{api_url}?per_page={per_page}&page={page_num}"
            print(f"      🔄 Sayfa {page_num} embed'siz deneniyor...")
            for attempt in range(1, 4):
                req = urllib.request.Request(page_url_no_embed, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
                try:
                    with urllib.request.urlopen(req, context=context, timeout=12) as response:
                        res_json = json.loads(response.read().decode('utf-8'))
                        if isinstance(res_json, list):
                            all_data.extend(res_json)
                            success = True
                            break
                except Exception as ex:
                    print(f"      ❌ Sayfa {page_num} embed'siz deneme {attempt}/3 başarısız: {ex}")
                    time.sleep(1)
                    
        time.sleep(0.3)  # Sayfalar arası hafif gecikme (cool-off)
                
    if not all_data:
        return None

    products = []
    seen_prods = set()
    ignored_keywords = ["logo", "banner", "slider", "bg", "background", "icon", "placeholder", "map", "sepet", "cart", "avatar", "menu"]
    spam_terms = ["alımı", "alimi", "satışı", "satisi", "hizmeti", "hizmetlerimiz", "nedir", "nasıl yapılır", 
                  "nasil yapilir", "dikkat edilmesi", "doğru adres", "dogru adres", "doğru tercih", "dogru tercih", 
                  "avantajları", "avantajlari", "alanlar", "yapanlar", "fiyat teklifi", "kilavuzu", "kılavuzu", 
                  "rehberi", "tavsiyeler", "yorumları", "yorumlar", "hakkımızda", "hakkimizda", "iletisim", 
                  "iletişim", "galeri", "referanslar", "blog", "anasayfa", "cropped-", "elementor/thumbs",
                  "ürün bulunmamaktadır", "urun bulunmamaktadir", "urunyok", "slide-urun"]

    for item in all_data:
        title = item.get("title", {}).get("rendered", "")
        title = html.unescape(title).strip()
        
        title_lower = title.lower()
        if not title or len(title) < 2:
            continue
        if any(k in title_lower for k in ignored_keywords):
            continue
        if any(term in title_lower for term in spam_terms):
            continue
            
        categories = []
        term_list = item.get("_embedded", {}).get("wp:term", [])
        for term_group in term_list:
            for term in term_group:
                if term.get("taxonomy") in ["category", "product_cat"]:
                    cat_name = term.get("name", "").strip()
                    cat_name = html.unescape(cat_name).strip()
                    cat_name = re.sub(r'^(Ürünler|Products|Kategoriler|Categories|Arşiv|Archive)\s*[-–—|:]\s*', '', cat_name, flags=re.I).strip()
                    if cat_name.lower() not in ["genel", "uncategorized", "ürünler", "products", "haberler", "blog", "e-katalog", "e katalog"]:
                        categories.append(cat_name)
        
        category = "Genel"
        if categories:
            category = categories[0]
            for cat in categories:
                if any(x in cat.lower() for x in ["grubu", "malzemeleri", "seti", "eldivenler", "urunler", "aparat"]):
                    category = cat
                    break
        
        media_url = ""
        # 1. wp:featuredmedia kontrol et (embed'li gelmişse)
        media_list = item.get("_embedded", {}).get("wp:featuredmedia", [])
        if media_list and isinstance(media_list, list) and len(media_list) > 0:
            media_url = media_list[0].get("source_url", "")
            
        # 2. yoast_head_json -> og_image kontrol et
        if not media_url:
            yoast_imgs = item.get("yoast_head_json", {}).get("og_image", [])
            if yoast_imgs and isinstance(yoast_imgs, list) and len(yoast_imgs) > 0:
                media_url = yoast_imgs[0].get("url", "")
                
        # 3. İçerik içindeki ilk img etiketini kontrol et
        if not media_url:
            content = item.get("content", {}).get("rendered", "")
            img_match = re.search(r'<img[^>]+src=["\'](https?://[^"\']+)["\']', content)
            if img_match:
                media_url = img_match.group(1)

        if not media_url:
            continue
            
        title_norm = title.lower()
        if title_norm not in seen_prods:
            seen_prods.add(title_norm)
            products.append({
                "name": title,
                "image_url": media_url,
                "category": category,
                "price": "0"
            })
            
    print(f"  ✅ WordPress REST API ile {len(products)} adet benzersiz ürün başarıyla çıkarıldı!")
    return products
