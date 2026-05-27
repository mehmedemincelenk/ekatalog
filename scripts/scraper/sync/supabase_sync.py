import os
import sys
import json
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor

# Ensure parent directory is in python path
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from config import SUPABASE_URL, SERVICE_ROLE_KEY

HEADERS = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def make_request(url, method="GET", data=None, custom_headers=None):
    headers = HEADERS.copy()
    if custom_headers:
        headers.update(custom_headers)
        
    req_data = None
    if data is not None:
        req_data = json.dumps(data).encode("utf-8")
        
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as res:
            body = res.read().decode("utf-8")
            if not body or not body.strip():
                return None
            return json.loads(body)
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"❌ HTTP Error {e.code}: {e.reason}", file=sys.stderr)
        print(f"Details: {error_body}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"❌ Connection Error: {e}", file=sys.stderr)
        return None

def upload_image_to_supabase(image_url, store_slug):
    """Görseli indirir ve Supabase Storage public bucket'ına yedekler."""
    if not image_url or not image_url.startswith("http"):
        return image_url
        
    import mimetypes
    import hashlib
    import re
    
    # 1. Dosya adını ve uzantısını belirle (veya hash oluştur)
    base_name = image_url.split('?')[0].split('/')[-1]
    name, ext = os.path.splitext(base_name)
    if not ext:
        ext = ".jpg"
        
    # URL'nin hash'ini kullanarak çakışmaları önle
    url_hash = hashlib.md5(image_url.encode('utf-8')).hexdigest()[:10]
    safe_name = re.sub(r'[^a-zA-Z0-9_\-]', '', name)
    filename = f"{safe_name}_{url_hash}{ext}"
    
    # MIME tipini belirle
    mime_type, _ = mimetypes.guess_type(filename)
    if not mime_type:
        mime_type = "image/jpeg"
        
    # 2. Görseli indir
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        req_dl = urllib.request.Request(image_url, headers=headers)
        with urllib.request.urlopen(req_dl, timeout=5) as res_dl:
            img_data = res_dl.read()
            
        # 3. Supabase Storage'a yükle (x-upsert = true ile)
        upload_url = f"{SUPABASE_URL}/storage/v1/object/stores/{store_slug}/{filename}"
        
        headers_ul = {
            "apikey": SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
            "Content-Type": mime_type,
            "x-upsert": "true"
        }
        
        req_ul = urllib.request.Request(upload_url, data=img_data, headers=headers_ul, method="POST")
        with urllib.request.urlopen(req_ul, timeout=10) as res_ul:
            res_ul.read()
            
        # 4. Public URL'yi döndür
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/stores/{store_slug}/{filename}"
        return public_url
    except Exception as e:
        print(f"  ⚠ Görsel yedeklenemedi ({image_url}): {e}")
        return image_url

def sync_store_to_supabase(slug, name, data):
    """
    Mağaza verilerini (meta, carousel, referanslar ve ürünler) Supabase'e aktarır.
    İdempotent dükkan güncellemesi ve hızlı chunked ürün yükleme gerçekleştirir.
    """
    products = data.get("products", [])
    print(f"📂 Veriler aktarıma hazır. Toplam {len(products)} ürün bulunuyor.")
    
    # 1. Mağaza var mı kontrol et veya oluştur
    print(f"🕵️ Mağaza kontrol ediliyor: {slug}...")
    store_url = f"{SUPABASE_URL}/rest/v1/stores?slug=eq.{slug}"
    stores = make_request(store_url, "GET")
    
    store_id = None
    if stores:
        store_id = stores[0]["id"]
        print(f"  ✅ Mağaza bulundu. ID: {store_id}")
    else:
        print(f"  🆕 Mağaza bulunamadı, yeni oluşturuluyor...")
        insert_url = f"{SUPABASE_URL}/rest/v1/stores"
        new_store = {
            "name": name,
            "slug": slug
        }
        res = make_request(insert_url, "POST", data=new_store)
        if res:
            store_id = res[0]["id"]
            print(f"  ✅ Mağaza başarıyla oluşturuldu. ID: {store_id}")
        else:
            print("❌ Mağaza oluşturulamadı.")
            return False

    # 2. Görselleri paralel olarak Supabase Storage'a yedekle (Mirroring)
    print("📸 Görseller Supabase Storage'a yedekleniyor (Mirroring)...")
    distinct_img_urls = list(set([p.get("image_url", "") for p in products if p.get("image_url")]))
    
    # Mağaza logosunu da listeye ekleyelim
    scraped_logo = data.get("logo_url", "")
    if scraped_logo and scraped_logo.startswith("http"):
        distinct_img_urls.append(scraped_logo)
        
    url_mapping = {}
    
    def process_url(url):
        new_url = upload_image_to_supabase(url, slug)
        return url, new_url
        
    # 15 worker ile paralel hızlı yükleme
    print(f"  🔄 {len(distinct_img_urls)} adet benzersiz görsel buluta aktarılıyor...")
    with ThreadPoolExecutor(max_workers=15) as executor:
        results = executor.map(process_url, distinct_img_urls)
        for orig, new_u in results:
            url_mapping[orig] = new_u
            
    # Aynalanmış logo
    uploaded_logo = url_mapping.get(scraped_logo, scraped_logo)
            
    # 3. Mağaza meta verilerini güncelle
    print("🔄 Mağaza meta verileri güncelleniyor...")
    update_url = f"{SUPABASE_URL}/rest/v1/stores?id=eq.{store_id}"
    
    # Fiyat var mı kontrol et (Herhangi bir üründe sıfır veya Sorunuz dışında bir fiyat var mı?)
    has_prices = False
    for p in products:
        price_val = p.get("price", "0")
        if price_val and str(price_val).strip() not in ["", "0", "0.0", "0,00", "0.00", "Sorunuz", "Fiyat Sor"]:
            has_prices = True
            break

    # Referans logoları var mı kontrol et
    references = data.get("references_data", [])
    has_references = len(references) > 0

    # Mevcut display_config'i koru
    existing_config = {}
    if stores and stores[0].get("display_config"):
        existing_config = stores[0]["display_config"]
        if isinstance(existing_config, str):
            try:
                existing_config = json.loads(existing_config)
            except:
                existing_config = {}
                
    display_config = {
        "showLogo": existing_config.get("showLogo", True),
        "showSearch": existing_config.get("showSearch", True),
        "showAddress": True if data.get("address") else False,
        "showInstagram": True if data.get("instagram") else False,
        "showCategories": existing_config.get("showCategories", True),
        "showPrice": has_prices,
        "showReferences": has_references,
        "showCarousel": len(data.get("carousel_data", {}).get("slides", [])) > 0
    }
    
    store_update = {
        "name": name,
        "logo_url": uploaded_logo,
        "tagline": data.get("tagline", "")[:35] if data.get("tagline") else "",
        "phone": data.get("phone", ""),
        "address": data.get("address", "")[:200] if data.get("address") else "",
        "short_address": data.get("short_address", ""),
        "instagram_url": data.get("instagram", ""),
        "category_order": data.get("categories", []),
        "carousel_data": data.get("carousel_data", {"enabled": False, "slides": []}),
        "references_data": references,
        "display_config": display_config
    }
    make_request(update_url, "PATCH", data=store_update)
    print("  ✅ Mağaza meta verileri başarıyla güncellendi.")
    
    # 4. Eski ürünleri temizle
    print("🧹 Eski ürünler siliniyor...")
    delete_url = f"{SUPABASE_URL}/rest/v1/prods?store_id=eq.{store_id}"
    del_headers = {"Prefer": "return=minimal"}
    make_request(delete_url, "DELETE", custom_headers=del_headers)
    print("  ✅ Eski ürünler silindi.")
    
    # 5. Yeni ürünleri chunk'lar halinde yükle
    chunk_size = 300
    total_products = len(products)
    
    print(f"🚀 {total_products} ürün {chunk_size} adetlik chunklar halinde yükleniyor...")
    
    for idx in range(0, total_products, chunk_size):
        chunk = products[idx:idx + chunk_size]
        payload = []
        for p in chunk:
            orig_img = p.get("image_url", "")
            mirrored_img = url_mapping.get(orig_img, orig_img)
            
            payload.append({
                "store_id": store_id,
                "name": p.get("name", "")[:200],
                "category": p.get("category", "Genel"),
                "image_url": mirrored_img,
                "price": p.get("price", "0")
            })
            
        print(f"  📥 Chunk {idx // chunk_size + 1}: {len(payload)} ürün yükleniyor...")
        make_request(f"{SUPABASE_URL}/rest/v1/prods", "POST", data=payload)
        
    print(f"🎉 TEBRİKLER! {total_products} ürün ve tüm görseller başarıyla Supabase bulutuna aktarıldı!")
    return True
