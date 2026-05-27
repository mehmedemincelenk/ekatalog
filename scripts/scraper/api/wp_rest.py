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

def build_wp_category_map(base_url, context):
    """
    WordPress sitemap veya kategori sayfalarını tarayarak, 
    her bir ürün URL'sini hangi kategorilere ait olduğunu eşleştiren bir sözlük döner.
    """
    clean_base = base_url.rstrip("/")
    cat_mapping = {}
    
    # 1. Sitemap'leri tarayarak kategori sitemap URL'sini bul veya doğrudan tahmin et
    sitemap_candidates = [
        f"{clean_base}/product_cat-sitemap.xml",
        f"{clean_base}/category-sitemap.xml",
        f"{clean_base}/sitemap.xml",
        f"{clean_base}/sitemap_index.xml"
    ]
    
    cat_urls = []
    
    for s_url in sitemap_candidates:
        req = urllib.request.Request(s_url, headers={'User-Agent': 'Mozilla/5.0'})
        try:
            with urllib.request.urlopen(req, context=context, timeout=4) as r:
                content = r.read().decode("utf-8")
                # Eğer sitemap index ise, içindeki kategori sitemap'lerini bul
                if "sitemap" in s_url:
                    sub_sitemaps = re.findall(r"<loc>([^<]*(?:category|product_cat)[^<]*\.xml)</loc>", content, re.I)
                    if sub_sitemaps:
                        for sub_s in sub_sitemaps:
                            try:
                                sub_req = urllib.request.Request(sub_s, headers={'User-Agent': 'Mozilla/5.0'})
                                with urllib.request.urlopen(sub_req, context=context, timeout=4) as sub_r:
                                    sub_content = sub_r.read().decode("utf-8")
                                    locs = re.findall(r"<loc>([^<]+)</loc>", sub_content)
                                    cat_urls.extend(locs)
                            except:
                                pass
                        if cat_urls:
                            break
                
                # Doğrudan kategori URL'lerini bul
                locs = re.findall(r"<loc>([^<]+)</loc>", content)
                filtered = [l for l in locs if any(x in l.lower() for x in ["/urun-kategori/", "/product-category/", "/category/", "/kategori/"])]
                if filtered:
                    cat_urls.extend(filtered)
                    break
        except Exception:
            continue
            
    # Eğer sitemap'lerden hiç kategori çıkmadıysa, boş döneriz.
    if not cat_urls:
        print("  ℹ️ Kategori sitemap'i bulunamadı veya taranamadı.")
        return {}
        
    cat_urls = list(set(cat_urls))
    print(f"  📂 Kategori Sitemap aktif! {len(cat_urls)} adet kategori sayfası taranıyor...")
    
    # 2. Kategori sayfalarını paralel olarak tarayarak ürün eşleştirmelerini topla
    from concurrent.futures import ThreadPoolExecutor
    
    def fetch_and_parse_cat(url):
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        try:
            with urllib.request.urlopen(req, context=context, timeout=6) as r:
                html_content = r.read().decode("utf-8")
                slug = url.rstrip("/").split("/")[-1]
                cat_name = slug.replace("-", " ").title()
                
                # Ürün linklerini bul (mutlak ve göreceli)
                links = re.findall(r'href=["\'](https?://[^"\'\s>]+/urun/[^"\'\s>]+)["\']', html_content)
                links += re.findall(r'href=["\'](https?://[^"\'\s>]+/product/[^"\'\s>]+)["\']', html_content)
                
                relative_urun = re.findall(r'href=["\'](/urun/[^"\'\s>]+)["\']', html_content)
                for r_ur in relative_urun:
                    links.append(f"{clean_base}{r_ur}")
                    
                relative_prod = re.findall(r'href=["\'](/product/[^"\'\s>]+)["\']', html_content)
                for r_pr in relative_prod:
                    links.append(f"{clean_base}{r_pr}")
                    
                normalized = {l.rstrip("/").lower() for l in links if not any(x in l.lower() for x in ["/urun-kategori/", "/product-category/"])}
                
                # Sayfalama kontrolü
                pages = re.findall(r'/page/(\d+)', html_content)
                max_page = 1
                if pages:
                    max_page = max(int(p) for p in pages)
                    
                return cat_name, normalized, max_page, url
        except Exception:
            return None, set(), 1, url
            
    # İlk parti (Page 1) taraması
    first_batch_urls = cat_urls[:300] # Genişletilmiş üst sınır
    with ThreadPoolExecutor(max_workers=20) as executor:
        results = list(executor.map(fetch_and_parse_cat, first_batch_urls))
        
    paginated_tasks = []
    for cat_name, products_set, max_page, original_url in results:
        if not cat_name:
            continue
            
        # Mapping'e ekle
        for prod_url in products_set:
            if prod_url not in cat_mapping:
                cat_mapping[prod_url] = []
            if cat_name not in cat_mapping[prod_url]:
                cat_mapping[prod_url].append(cat_name)
                
        # Eğer sayfalama varsa ikinci parti için planla
        if max_page > 1:
            for p_num in range(2, min(max_page + 1, 8)): # Max 7. sayfaya kadar çek
                paginated_urls = f"{original_url}page/{p_num}/" if original_url.endswith("/") else f"{original_url}/page/{p_num}/"
                paginated_tasks.append((cat_name, paginated_urls))
                
    # İkinci parti (Pagination Pages) taraması
    if paginated_tasks:
        print(f"  📄 Kategorilerde sayfalama bulundu. {len(paginated_tasks)} adet sayfa paralel taranıyor...")
        def fetch_page_only(task):
            cat_name, p_url = task
            req = urllib.request.Request(p_url, headers={'User-Agent': 'Mozilla/5.0'})
            try:
                with urllib.request.urlopen(req, context=context, timeout=6) as r:
                    html_content = r.read().decode("utf-8")
                    links = re.findall(r'href=["\'](https?://[^"\'\s>]+/urun/[^"\'\s>]+)["\']', html_content)
                    links += re.findall(r'href=["\'](https?://[^"\'\s>]+/product/[^"\'\s>]+)["\']', html_content)
                    relative_urun = re.findall(r'href=["\'](/urun/[^"\'\s>]+)["\']', html_content)
                    for r_ur in relative_urun:
                        links.append(f"{clean_base}{r_ur}")
                    relative_prod = re.findall(r'href=["\'](/product/[^"\'\s>]+)["\']', html_content)
                    for r_pr in relative_prod:
                        links.append(f"{clean_base}{r_pr}")
                    
                    normalized = {l.rstrip("/").lower() for l in links if not any(x in l.lower() for x in ["/urun-kategori/", "/product-category/"])}
                    return cat_name, normalized
            except Exception:
                return cat_name, set()
                
        with ThreadPoolExecutor(max_workers=20) as executor:
            p_results = list(executor.map(fetch_page_only, paginated_tasks))
            
        for cat_name, products_set in p_results:
            for prod_url in products_set:
                if prod_url not in cat_mapping:
                    cat_mapping[prod_url] = []
                if cat_name not in cat_mapping[prod_url]:
                    cat_mapping[prod_url].append(cat_name)
                    
    print(f"  📊 Kategori Eşleştirme Sözlüğü Hazırlandı! Toplam {len(cat_mapping)} ürün eşleştirildi.")
    return cat_mapping

def try_wp_rest_extract(base_url, store_name):
    """
    WordPress REST API üzerinden tüm ürünleri, resimleri ve kategorileri saniyeler içinde çeker.
    Hem '/wp-json/wp/v2/product' (WooCommerce) hem de '/wp-json/wp/v2/posts' endpoint'lerini kontrol eder.
    """
    context = ssl._create_unverified_context()
    clean_base = base_url.rstrip("/")
    
    # Kategori eşleştirme tablosunu oluştur
    cat_mapping = build_wp_category_map(base_url, context)
    
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
        
        product_link = item.get("link", "").rstrip("/").lower()
        if (not categories or all(c.lower() in ["genel", "uncategorized"] for c in categories)) and product_link in cat_mapping:
            categories = cat_mapping[product_link]
            
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
            
        excerpt_html = item.get("excerpt", {}).get("rendered", "") or ""
        content_html = item.get("content", {}).get("rendered", "") or ""
        
        desc = ""
        # 1. Önce WooCommerce kısa açıklaması (excerpt) değerlendirilir
        if excerpt_html:
            clean_excerpt = re.sub(r'<h[1-6][^>]*>.*?</h[1-6]>', ' ', excerpt_html, flags=re.I|re.S)
            clean_excerpt = re.sub(r'<[^>]+>', ' ', clean_excerpt)
            clean_excerpt = html.unescape(clean_excerpt).strip()
            clean_excerpt = re.sub(r'\s+', ' ', clean_excerpt).strip()
            
            # Ürün başlığı ile aynı olan kısımları temizle
            title_pat = re.escape(title)
            clean_excerpt = re.sub(r'^' + title_pat + r'\s*[:\-–—\s]*', '', clean_excerpt, flags=re.I).strip()
            
            if len(clean_excerpt) > 10:
                desc = clean_excerpt

        # 2. Eğer kısa açıklama yoksa, uzun içerikten (content) düz metin ayıklanır
        if not desc and content_html:
            clean_content = content_html
            # Hem tablo hem de paragraf varsa tablo kısmını temizle (sadece pazarlama metni kalsın)
            if "<p" in clean_content.lower() and "<table" in clean_content.lower():
                clean_content = re.sub(r'<table[^>]*>.*?</table>', ' ', clean_content, flags=re.I|re.S)
                
            clean_content = re.sub(r'<h[1-6][^>]*>.*?</h[1-6]>', ' ', clean_content, flags=re.I|re.S)
            clean_content = re.sub(r'<[^>]+>', ' ', clean_content)
            clean_content = html.unescape(clean_content).strip()
            clean_content = re.sub(r'\s+', ' ', clean_content).strip()
            
            title_pat = re.escape(title)
            clean_content = re.sub(r'^' + title_pat + r'\s*[:\-–—\s]*', '', clean_content, flags=re.I).strip()
            
            if len(clean_content) > 10:
                desc = clean_content

        # Karakter limiti koruması
        if desc:
            if len(desc) > 300:
                desc = desc[:297] + "..."
        else:
            desc = ""

        title_norm = title.lower()
        if title_norm not in seen_prods:
            seen_prods.add(title_norm)
            products.append({
                "name": title,
                "image_url": media_url,
                "category": category,
                "price": "0",
                "description": desc
            })
            
    print(f"  ✅ WordPress REST API ile {len(products)} adet benzersiz ürün başarıyla çıkarıldı!")
    return products
