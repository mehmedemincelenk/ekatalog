#!/usr/bin/env python3
"""
Mürşidoğlu Tam Scraper
_embed ile featured_media dahil — tek pass, hızlı
Çıktı: supabase_mursidoglu.sql
"""
import json, ssl, sys, re, time, urllib.request

BASE = "http://mursidoglu.com.tr"
SLUG = "mursidoglufirca"
OUT  = "scripts/scraper/supabase_mursidoglu.sql"

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def get(url):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "ekatalog/1.0"})
        with urllib.request.urlopen(req, timeout=15, context=ctx) as r:
            return json.loads(r.read().decode())
    except Exception as e:
        print(f"  ⚠ {url[:80]} → {e}", file=sys.stderr)
        return None

def clean(html):
    return re.sub(r'<[^>]+>', '', html or '').strip()

# ── 1. KATEGORİLER ──────────────────────────────────────────────
print("📂 Kategoriler çekiliyor...")
cats_raw = []
page = 1
while True:
    d = get(f"{BASE}/wp-json/wp/v2/categories?per_page=100&page={page}")
    if not d: break
    cats_raw.extend(d)
    if len(d) < 100: break
    page += 1

# parent=0 olmayan üst kategorileri bul — "urunler" slug altındaki direkt çocuklar
# Slug "urunler" id'sini bul
urunler_id = next((c["id"] for c in cats_raw if c["slug"] == "urunler"), None)
print(f"  'urunler' kategori id: {urunler_id}")

# Sadece "Ürünler" parent'ının direkt çocukları = ana kategoriler
ana_cats = [c for c in cats_raw
            if c.get("parent") == urunler_id and c.get("count", 0) > 0]
ana_cats.sort(key=lambda x: -x["count"])  # Ürün sayısına göre sırala

print(f"  ✅ {len(ana_cats)} ana kategori, {len(cats_raw)} toplam")

# id → name map (tüm kategoriler için)
cat_map = {c["id"]: c["name"] for c in cats_raw}

# ── 2. ÜRÜNLER (_embed ile görsel dahil) ─────────────────────────
print("\n📦 Ürünler çekiliyor (_embed)...")
products = []
page = 1
total_pages = 999

while page <= total_pages:
    url = f"{BASE}/wp-json/wp/v2/posts?per_page=100&page={page}&_embed&_fields=id,title,categories,_embedded"
    d = get(url)
    if not d: break

    # İlk sayfada total_pages bilgisini header'dan alamıyoruz,
    # ama sayfa boşaldığında duracak
    if len(d) == 0: break

    for post in d:
        title = clean(post.get("title", {}).get("rendered", ""))
        if not title: continue

        # Görsel — _embedded içinde
        image_url = ""
        try:
            media = post["_embedded"]["wp:featuredmedia"][0]
            image_url = media.get("source_url", "")
        except Exception:
            pass

        # Kategori — en spesifik alt kategori (en yüksek id değil, parent'ı urunler_id olan)
        cat_ids = post.get("categories", [])
        # Önce ana kategoriden birini bul
        cat_name = "Genel"
        for cid in cat_ids:
            if cid in cat_map and cid != urunler_id:
                c = next((x for x in cats_raw if x["id"] == cid), None)
                if c and c.get("parent") == urunler_id:
                    cat_name = cat_map[cid]
                    break
        # Ana kategori bulunamazsa herhangi bir kategori
        if cat_name == "Genel":
            for cid in cat_ids:
                if cid in cat_map and cid != urunler_id:
                    cat_name = cat_map[cid]
                    break

        products.append({
            "name": title,
            "category": cat_name,
            "image_url": image_url,
        })

    print(f"  Sayfa {page}: {len(d)} ürün → toplam {len(products)}")
    if len(d) < 100: break
    page += 1
    time.sleep(0.2)

print(f"\n  ✅ Toplam {len(products)} ürün çekildi")

# ── 3. KATEGORİ SIRASI ───────────────────────────────────────────
# Sadece ürünlerde gerçekten geçen kategoriler
used_cats = sorted(set(p["category"] for p in products))
# Ana kategorileri önce, sonra diğerleri
ana_names = [c["name"] for c in ana_cats if c["name"] in used_cats]
diger = [c for c in used_cats if c not in ana_names]
category_order = ana_names + diger
print(f"\n  📋 {len(category_order)} kategori (ürünlü)")

# ── 4. SQL ÜRET ──────────────────────────────────────────────────
print(f"\n📝 SQL yazılıyor → {OUT}")

store_ref = f"(SELECT id FROM stores WHERE slug = '{SLUG}')"
cat_json = json.dumps(category_order, ensure_ascii=False)

carousel_json = json.dumps({
    "enabled": True,
    "slides": [
        {
            "id": 1,
            "src": "http://mursidoglu.com.tr/wp-content/themes/mursidoglucomtr/images/slider-bg.jpg",
            "bg": "bg-slate-100",
            "label": "Temizlik Arabaları",
            "sub": "İSTOÇ'tan tüm Türkiye'ye toptan fırça ve temizlik ekipmanları"
        },
        {
            "id": 2,
            "src": "http://mursidoglu.com.tr/wp-content/themes/mursidoglucomtr/images/slider-bg.jpg",
            "bg": "bg-stone-100",
            "label": "Endüstriyel Fırça Sistemleri",
            "sub": "1980'den beri üretici güvencesiyle toptan satış"
        }
    ]
}, ensure_ascii=False)

lines = [
    "-- ============================================================",
    f"-- Mürşidoğlu Tam Scrape — {len(products)} ürün, {len(category_order)} kategori",
    "-- ============================================================",
    "",
    "-- 1. STORE GÜNCELLEME",
    f"UPDATE stores SET",
    f"  logo_url       = 'http://mursidoglu.com.tr/wp-content/themes/mursidoglucomtr/images/logo.svg',",
    f"  carousel_data  = '{carousel_json}',",
    f"  category_order = '{cat_json}'",
    f"WHERE slug = '{SLUG}';",
    "",
    "-- 2. ESKİ ÜRÜNLER SİL",
    f"DELETE FROM prods WHERE store_id = {store_ref};",
    "",
    "-- 3. YENİ ÜRÜNLER EKLE",
    f"INSERT INTO prods (store_id, name, category, image_url, price) VALUES",
]

rows = []
for p in products:
    name = p["name"].replace("'", "''")
    cat  = p["category"].replace("'", "''")
    img  = p["image_url"].replace("'", "''")
    rows.append(f"  ({store_ref}, '{name}', '{cat}', '{img}', '0')")

lines.append(",\n".join(rows) + ";")

with open(OUT, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))

print(f"  ✅ {OUT} yazıldı")
print(f"\n{'='*50}")
print(f"  Ürün:     {len(products)}")
print(f"  Kategori: {len(category_order)}")
print(f"  Dosya:    {OUT}")
print(f"{'='*50}")
