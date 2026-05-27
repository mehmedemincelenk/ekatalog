#!/usr/bin/env python3
"""
Jina AI Evrensel B2B Scraper - Diamond Standard Modular Edition 💎
==================================================================
Modüler mimariye sahip, paralel istek destekli ve WooCommerce REST API entegrasyonlu B2B Scraper.
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

# Ensure current directory and parents are in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from config import OPENAI_KEY
from core.crawler import jina_fetch, resolve_url, discover_pages, get_sitemap_categories, discover_pagination_links
from core.parser import parse_products_from_markdown
from core.metadata import openai_extract_meta
from core.media import generate_unified_logos_banner, extract_background_sliders, is_widescreen_banner, extract_raw_images_from_url
from api.wp_rest import try_wp_rest_extract
from sync.supabase_sync import sync_store_to_supabase

def main():
    parser = argparse.ArgumentParser(description="Jina B2B Scraper - Diamond Standard Modular")
    parser.add_argument("--url", required=True, help="Hedef web sitesi URL'i")
    parser.add_argument("--name", required=True, help="Şirket ismi (maksimum 3 kelime)")
    parser.add_argument("--slug", default="", help="Mağaza slug'ı")
    parser.add_argument("--sync", action="store_true", help="Supabase veritabanına otomatik eşitle")
    args = parser.parse_args()
    
    # Şirket adı en fazla 3 kelime olmalı (ekatalog şirket adı)
    if args.name:
        name_clean = args.name.replace("#", "").strip()
        words = name_clean.split()
        if len(words) > 3:
            args.name = " ".join(words[:3])
        else:
            args.name = " ".join(words)

    if not args.slug:
        # Protokolü temizle
        clean_domain = re.sub(r'^https?://', '', args.url, flags=re.IGNORECASE)
        # www'yi temizle
        clean_domain = re.sub(r'^www\.', '', clean_domain, flags=re.IGNORECASE)
        # hostname kısmını al
        clean_domain = clean_domain.split('/')[0].split('?')[0].split(':')[0]
        # ilk parçayı al
        parts = clean_domain.split('.')
        args.slug = parts[0].lower() if parts else "store"

    raw_url = args.url.rstrip("/")
    base_url = raw_url.split("?")[0]
    query_suffix = "?" + raw_url.split("?")[1] if "?" in raw_url else ""

    print(f"\n💎 [DIAMOND SCRAPER] {args.name}")
    print(f"   Hedef URL: {base_url}\n")

    print("📄 Ana sayfa çekiliyor...")
    homepage_md = jina_fetch(base_url + query_suffix)
    if not homepage_md and base_url.startswith("https://"):
        print("  ⚠️ HTTPS yükleme hatası algılandı, HTTP protokolü ile tekrar deneniyor...")
        base_url = "http://" + base_url[8:]
        homepage_md = jina_fetch(base_url + query_suffix)
        
    if not homepage_md:
        print("❌ Ana sayfa indirilemedi.")
        sys.exit(1)
        
    pages = [{"url": base_url, "content": homepage_md}]
 
    products = try_wp_rest_extract(base_url, args.name)
    
    if products is not None:
        print(f"🚀 WordPress REST API ile tüm ürünler başarıyla çekildi. Standart crawling atlanıyor.")
        # İletişim veya Hakkımızda sayfalarını keşfedip indirerek meta verileri zenginleştiriyoruz (Diamond Standard 💎)
        print("📞 [Meta Veri Zenginleştirme] İletişim ve Hakkımızda sayfaları aranıyor...")
        contact_urls = []
        discovered_urls = discover_pages(homepage_md, base_url)
        for u in discovered_urls:
            u_lower = u.lower()
            if any(x in u_lower for x in ["iletisim", "iletişim", "contact", "hakkimizda", "hakkımızda", "about", "referans", "reference", "brand", "marka", "partner", "sponsor", "bayi", "musteri", "müşteri", "customer", "isortag", "is-ortak"]) or (any(x in u_lower for x in ["/ulas/", "/ulaş/", "/ulasim/", "/ulaşim/", "-ulas-", "-ulaş-", "/ulas-bize", "/ulaş-bize"]) or u_lower.endswith("/ulas") or u_lower.endswith("/ulaş") or u_lower.endswith("ulasim") or u_lower.endswith("ulaşim")):
                if u not in contact_urls and u != base_url:
                    contact_urls.append(u)
                    
        if contact_urls:
            print(f"📥 Keşfedilen iletişim/hakkımızda sayfaları indiriliyor: {contact_urls}")
            def fetch_contact_page(url_to_fetch):
                res_md = jina_fetch(url_to_fetch, timeout=20)
                if res_md and len(res_md) > 200:
                    return {"url": url_to_fetch.split("?")[0], "content": res_md}
                return None
                
            with ThreadPoolExecutor(max_workers=4) as executor:
                contact_results = list(executor.map(fetch_contact_page, contact_urls))
                
            for cr in contact_results:
                if cr:
                    pages.append(cr)
    else:
        sitemap_urls = get_sitemap_categories(base_url)
        print("🔍 Ana sayfa link analizi (crawler) başlatılıyor...")
        crawler_urls = discover_pages(homepage_md, base_url)
        
        # Sitemap URL'leri ile Crawler URL'lerini birleştir
        pass1_urls = list(set(sitemap_urls + crawler_urls))
        print(f"✅ Keşif tamamlandı. Sitemap ({len(sitemap_urls)} sayfa) ve Crawler ({len(crawler_urls)} sayfa) birleştirildi. Toplam eşsiz sayfa: {len(pass1_urls)}")
        
        pass1_urls = list(set(pass1_urls))[:60]
        
        pass1_pages = []
        if pass1_urls:
            print(f"🔗 [Pass 1] {len(pass1_urls)} B2B kategori sayfası PARALEL indiriliyor...")
            fetch_urls = [u + ("&" if "?" in u else "?") + query_suffix.lstrip("?") if query_suffix else u for u in pass1_urls]
            
            def fetch_single(item):
                idx, u = item
                print(f"    📥 [Sayfa {idx}/{len(fetch_urls)}] İndiriliyor: {u}")
                res_md = jina_fetch(u, timeout=20)
                if res_md and len(res_md) > 200:
                    return {"url": u.split("?")[0], "content": res_md}
                return None

            with ThreadPoolExecutor(max_workers=8) as executor:
                results = list(executor.map(fetch_single, enumerate(fetch_urls, 1)))
                
            for res in results:
                if res:
                    pages.append(res)
                    pass1_pages.append(res)
            print(f"  ✅ [Pass 1] Bitti. Toplam {len(pass1_pages)} sayfa başarıyla indirildi.")
     
        deep_category_urls = []
        for page in pass1_pages:
            page_md = page["content"]
            new_urls = discover_pages(page_md, base_url)
            for u in new_urls:
                if u not in pass1_urls and u not in deep_category_urls and u != base_url:
                    deep_category_urls.append(u)
                    
        deep_category_urls = deep_category_urls[:40]
        if deep_category_urls:
            print(f"🔗 [Pass 1b - Deep Discovery] {len(deep_category_urls)} adet derin katalog sayfası PARALEL indiriliyor...")
            fetch_urls_deep = [u + ("&" if "?" in u else "?") + query_suffix.lstrip("?") if query_suffix else u for u in deep_category_urls]
            
            def fetch_deep_single(item):
                idx, u = item
                print(f"    📥 [Derin Sayfa {idx}/{len(fetch_urls_deep)}] İndiriliyor: {u}")
                res_md = jina_fetch(u, timeout=20)
                if res_md and len(res_md) > 200:
                    return {"url": u.split("?")[0], "content": res_md}
                return None

            with ThreadPoolExecutor(max_workers=8) as executor:
                results_deep = list(executor.map(fetch_deep_single, enumerate(fetch_urls_deep, 1)))
                
            p1b_count = 0
            for res in results_deep:
                if res:
                    pages.append(res)
                    pass1_pages.append(res)
                    p1b_count += 1
            print(f"  ✅ [Pass 1b] Bitti. Derin keşifle {p1b_count} adet yeni sayfa eklendi.")
     
        pass2_urls = []
        for page in pass1_pages:
            page_md = page["content"]
            pagination_links = discover_pagination_links(page_md, base_url)
            for url in pagination_links:
                if url not in pass1_urls and url not in pass2_urls and url != base_url:
                    pass2_urls.append(url)
                    
        pass2_urls = pass2_urls[:30]
        if pass2_urls:
            print(f"🔗 [Pass 2 - Pagination] {len(pass2_urls)} adet ek sayfa PARALEL indiriliyor...")
            fetch_urls_p2 = [u + ("&" if "?" in u else "?") + query_suffix.lstrip("?") if query_suffix else u for u in pass2_urls]
            
            def fetch_p2_single(item):
                idx, u = item
                print(f"    📥 [Pagination Sayfa {idx}/{len(fetch_urls_p2)}] İndiriliyor: {u}")
                res_md = jina_fetch(u, timeout=20)
                if res_md and len(res_md) > 200:
                    return {"url": u.split("?")[0], "content": res_md}
                return None

            with ThreadPoolExecutor(max_workers=8) as executor:
                results_p2 = list(executor.map(fetch_p2_single, enumerate(fetch_urls_p2, 1)))
                
            p2_count = 0
            for res in results_p2:
                if res:
                    pages.append(res)
                    p2_count += 1
            print(f"  ✅ [Pass 2] Bitti. Toplam {p2_count} adet pagination sayfası başarıyla indirildi.")
 
    # İletişim veya Hakkımızda sayfalarını birleştirerek meta veri kalitesini maksimize edelim (Diamond Standard 💎)
    contact_md = ""
    for p in pages:
        p_url = p["url"].lower()
        if any(x in p_url for x in ["iletisim", "iletişim", "contact", "hakkimizda", "hakkımızda", "about"]) or (any(x in p_url for x in ["ulas", "ulaş"]) and "bulas" not in p_url):
            contact_md += "\n\n" + p["content"]
            
    combined_meta_text = homepage_md + contact_md

    print("\n🤖 Şirket meta verileri OpenAI ile çıkarılıyor...")
    meta = openai_extract_meta(combined_meta_text, args.name, OPENAI_KEY)
  
    if products is None:
        print("🧹 Ürün ve resimler Markdown parser ile ayıklanıyor...")
        products = parse_products_from_markdown(pages, base_url, brand_name=args.name)

    logo_url = resolve_url(base_url, meta.get("logo_url", ""))
    img_pattern = re.compile(r'!\[([^\]]*)\]\((https?://[^\s\(\)]+(?:\([^\s\(\)]*\)[^\s\(\)]*)*)\)')
    
    # Görselleri sınıflandırmak için yardımcı fonksiyon (Diamond Standard 💎 - 3 Iteration Edition)
    def is_reference_logo(url_str, alt_str="", source_page_url=""):
        url_l = urllib.parse.unquote(url_str).lower()
        alt_l = alt_str.lower()
        
        # 1. TEMEL KARA LİSTELER (0ms): Kesinlikle referans logosu olamayacak durumlar
        if not url_str:
            return False
            
        # Ana logo mu?
        if logo_url and (url_str == logo_url or url_l == logo_url.lower()):
            return False
            
        # Ana logonun dosya adı ile aynı mı? (Örn: noix-logo-zeminli vs noix-logo)
        if logo_url:
            logo_filename = logo_url.split("/")[-1].split("?")[0].lower()
            img_filename = url_str.split("/")[-1].split("?")[0].lower()
            if logo_filename and img_filename:
                if logo_filename in img_filename or img_filename in logo_filename:
                    return False
                
        # Şirket ismini/slugını barındıran ana logo mu?
        company_slug = args.slug.lower() if args.slug else args.name.lower().replace(" ", "")
        if company_slug and company_slug in url_l and "logo" in url_l:
            return False

        # WordPress Tema, Eklenti veya statik arayüz varlıklarını filtrele (Diamond Standard Heuristic 💎)
        if "/wp-content/" in url_l and "/uploads/" not in url_l:
            return False
            
        # Kesinlikle çöp sosyal medya ve dil bayrakları/ikonları
        strict_trash_keywords = [
            "tr.png", "en.png", "flag", "instagram", "facebook", "twitter", "linkedin", 
            "youtube", "social", "whatsapp", "phone", "mail", "email", "secure", "lock", "cart", "basket",
            "search", "user", "avatar", "profile", "loading", "spinner", "arrow", "chevron", "bullet", 
            "bg", "pattern", "check", "close", "cancel", "next", "prev", "icon"
        ]
        if any(k in url_l or k in alt_l for k in strict_trash_keywords):
            return False

        # Kampanya, reklam, fırsat, iletişim ve kategori afişlerini dışla
        ui_and_promo_keywords = [
            "taksit", "kargo", "fiyat", "enuygun", "odeme", "ödeme", "kredikarti", "kredi-karti", "credit-card",
            "firsat", "fırsat", "kampanya", "indirim", "discount", "promo", "banner", "reklam", "ad-", "adsense", 
            "slider", "vitrin", "pop-up", "popup", "tel", "phone", "adres", "address", "iletisim", "contact", 
            "ulas", "ulaş", "hakkimizda", "hakkımızda", "about", "default", "widget", "sidebar", "theme", "plugin", 
            "yazfirsati", "yazfırsatı", "kategori", "category", "urun-kategori", "product-category", "tag", "etiket"
        ]
        if any(k in url_l or k in alt_l for k in ui_and_promo_keywords):
            return False

        # Kesinlikle referans logosu olamayacak B2B ürün ve kategori isimleri (Diamond Standard Heuristic 💎)
        product_trash_keywords = [
            "kulluk", "küllük", "bardak", "tabak", "dolap", "makinesi", "makine", "tava", "ekipman", 
            "bicak", "bıçak", "kasik", "kaşık", "catal", "çatal", "spatula", "tost", "mixer", "mikser",
            "serbet", "şerbet", "ayran", "firin", "fırın", "evrak", "masa", "sandalye", "buz", "temizlik", 
            "hali", "halı", "yikama", "yıkama", "baca", "vantilator", "vantilatör", "kanal", "kase", "kâse", 
            "tencere", "temizleme", "pastasi", "paspas", "deterjan", "bulasik", "bulaşık", "tezgah", "tezgâh",
            "evye", "kuzine", "benmari", "ızgara", "izgara", "ocak", "fritöz", "fritoz", "blender", "sebil"
        ]
        if any(k in url_l or k in alt_l for k in product_trash_keywords):
            return False

        # 2. REFERANS SAYFASI KONTROLÜ
        is_on_reference_page = False
        if source_page_url:
            sp_url_l = source_page_url.lower()
            if any(ref_slug in sp_url_l for ref_slug in ["referans", "reference", "brand", "marka", "partner", "sponsor", "bayi", "musteri", "müşteri", "customer", "isortag", "is-ortak"]):
                is_on_reference_page = True

        # 3. ÜRÜN RESMİ KONTROLÜ
        try:
            if "product_images_set" in locals() or "product_images_set" in globals():
                if url_str in product_images_set:
                    return False
        except Exception:
            pass
        
        product_keywords = ["/product/", "/urun/", "/shop/"]
        if any(pk in url_l for pk in product_keywords):
            return False

        # 4. ANAHTAR KELİME KONTROLÜ (Normal sayfalardaki görseller için)
        if not is_on_reference_page:
            ref_keywords = [
                "logo", "marka", "brand", "ref", "referans", "partner", "sponsor", 
                "client", "customer", "bayi", "distributor", "isortag", "ortak", "cooperation",
                "coop", "referanslar", "temsilcilik", "uretici", "markalarimiz", "our-brands",
                "servis", "unox", "remta", "kitchenaid", "robotcoupe", "oztiryakiler", "inoksan",
                "rational", "hobart", "winterhalter", "fagor", "brema", "scotsman",
                "endustriyel", "industrial", "mutfak", "kitchen", "otel", "hotel", "restaurant",
                "cafe", "pastane", "bakery", "distribütör", "üretici", "is-ortak"
            ]
            has_keyword = any(k in url_l or k in alt_l for k in ref_keywords)
            if not has_keyword:
                return False

        # 5. PİKSEL VE BOYUT KONTROLLERİ (En-boy oranı ve ideal aralık)
        # 5.1 URL içerisindeki WordPress boyut eklerini yakalayalım (Örn: -150x150.png)
        size_match = re.search(r'-(\d+)x(\d+)\.(?:jpg|jpeg|png|webp|gif|svg)', url_l)
        if size_match:
            try:
                w = int(size_match.group(1))
                h = int(size_match.group(2))
                aspect = w / h
                # En-boy oranı kontrolü: 0.3 ile 4.0 arasında olmalı (Geniş logo standartı 💎)
                if 0.3 <= aspect <= 4.0:
                    if is_on_reference_page:
                        # Referans sayfasında daha büyük görsellere izin ver (Örn: 30px-1200px)
                        if 30 <= w <= 1200 and 30 <= h <= 1000:
                            return True
                    else:
                        # Normal sayfalarda sadece küçük logo boyutlarını kabul et
                        if 30 <= w <= 300 and 30 <= h <= 200:
                            return True
                return False
            except ValueError:
                pass

        # SVG dosyaları her zaman logo/vektör simgesidir, boyut sorgusu gerekmez
        if url_l.endswith(".svg"):
            return True

        # 5.2 Canlı Header/Pillow Analizi
        try:
            import urllib.request
            from PIL import ImageFile
            
            req = urllib.request.Request(url_str, headers={'User-Agent': 'Mozilla/5.0'})
            # Çok hızlı timeout ile ilk 16KB okuyoruz (Logo dosyaları için fazlasıyla yeterli)
            with urllib.request.urlopen(req, timeout=1.0) as response:
                chunk = response.read(16384)
                p = ImageFile.Parser()
                p.feed(chunk)
                if p.image:
                    w, h = p.image.size
                    aspect = w / h
                    # En-boy oranı kontrolü: 0.3 ile 4.0 arasında olmalı (Geniş logo standartı 💎)
                    if 0.3 <= aspect <= 4.0:
                        if is_on_reference_page:
                            # Referans sayfasında daha büyük görsellere izin ver
                            if 30 <= w <= 1200 and 30 <= h <= 1000:
                                return True
                        else:
                            # Normal sayfalarda küçük logo boyutları
                            if 30 <= w <= 400 and 30 <= h <= 250:
                                return True
                    return False
                else:
                    return False
        except Exception:
            # İnternet/bağlantı hatası durumunda, güvenli bir şekilde metin eşleşmesi fallback'ine dönüyoruz
            return True

    def is_navbar_footer_or_logo(url_str, alt_str=""):
        url_l = url_str.lower()
        alt_l = alt_str.lower()
        
        # 1. Ana logo veya türevleri mi?
        if logo_url and (url_str == logo_url or url_l == logo_url.lower()):
            return True
            
        if logo_url:
            logo_filename = logo_url.split("/")[-1].split("?")[0].lower()
            img_filename = url_str.split("/")[-1].split("?")[0].lower()
            if logo_filename and img_filename:
                if logo_filename in img_filename or img_filename in logo_filename:
                    return True
                    
        # 2. Şirket slugı + logo kelimesi mi?
        company_slug = args.slug.lower() if args.slug else args.name.lower().replace(" ", "")
        if company_slug and company_slug in url_l and "logo" in url_l:
            return True
            
        # 3. Navbar / Footer / Sosyal Medya / Kart / İkon kelimeleri
        nav_footer_keywords = [
            "logo", "brand", "header", "footer", "nav-", "navbar", "menu", 
            "logo-", "-logo", "social", "instagram", "facebook", "twitter", 
            "youtube", "linkedin", "whatsapp", "icon", "avatar", "profile",
            "flag", "payment", "kartlar", "visa", "mastercard", "maestro", "troy",
            "amex", "secure", "lock", "sepet", "cart", "basket", "search", "ara"
        ]
        if any(k in url_l or k in alt_l for k in nav_footer_keywords):
            return True
            
        return False

    raw_candidates = []
    
    # 1. Standart Markdown resimlerini tara
    for page in pages:
        page_md = page["content"]
        page_url = page["url"]
        matches = img_pattern.findall(page_md)
        for alt, img_url in matches:
            abs_url = resolve_url(base_url, img_url)
            if abs_url and abs_url != logo_url:
                if (alt, abs_url, page_url) not in raw_candidates:
                    raw_candidates.append((alt, abs_url, page_url))

        # Akıllı Ekstraksiyon: Sayfa yüksek öncelikli kurumsal veya referans sayfasıysa
        # ham HTML üzerinden regex tabanlı tüm görsel bağlantılarını yakala (Diamond Standard Heuristic 💎)
        page_url_l = page_url.lower()
        is_priority_page = any(x in page_url_l for x in ["iletisim", "iletişim", "contact", "hakkimizda", "hakkımızda", "about", "referans", "reference", "brand", "marka", "partner", "sponsor", "bayi", "musteri", "müşteri", "customer", "isortag", "is-ortak"])
        if is_priority_page:
            print(f"🕵️  [Raw HTML Extraction] '{page_url}' sayfası için ham görsel bağlantıları taranıyor...")
            raw_html_imgs = extract_raw_images_from_url(page_url)
            added_count = 0
            for raw_img in raw_html_imgs:
                if raw_img and raw_img != logo_url:
                    if not any(raw_img == c[1] for c in raw_candidates):
                        raw_candidates.append(("", raw_img, page_url))
                        added_count += 1
            if added_count > 0:
                print(f"  ✅ Ham HTML'den {added_count} adet yeni görsel bağlantısı yakalandı.")

    # 2. Akıllı Arka Plan/Elementor Swiper Slaytlarını Çek
    print("🔍 CSS ve Swiper arka plan slaytları akıllıca aranıyor...")
    bg_slides = extract_background_sliders(base_url)
    for slide_url in bg_slides:
        if slide_url and slide_url != logo_url:
            if ("", slide_url, base_url) not in raw_candidates:
                raw_candidates.append(("", slide_url, base_url))

    # Ürün resimlerini toplu olarak belirle ve bunları carousel/banner listesinden kesinlikle hariç tut
    product_images_set = set()
    if products:
        for p in products:
            img = p.get("image_url")
            if img:
                product_images_set.add(img)
                abs_img = resolve_url(base_url, img)
                if abs_img:
                    product_images_set.add(abs_img)

    carousel_slides = []
    reference_logos = []
    brand_logos = []
    ref_banner_url = ""
    brand_banner_url = ""

    unique_ref_map = {}
    unique_brand_map = {}

    for alt, img_url, source_page in raw_candidates:
        # Eğer bu resim bir ürün resmi ise, bunu asla carousel veya referans logosuna ekleme
        if img_url in product_images_set:
            continue
            
        if is_reference_logo(img_url, alt, source_page):
            url_l = img_url.lower()
            alt_l = alt.lower()
            
            # WP Boyutlarını ve uzantıyı temizleyip temel dosya adını çıkar
            filename = img_url.split("/")[-1].split("?")[0]
            base_name = re.sub(r'-\d+x\d+$', '', filename.split(".")[0]).lower()
            
            # Dosya adında boyut bilgisi var mı kontrol et (-150x150 gibi)
            has_dim = bool(re.search(r'-\d+x\d+\.(?:jpg|jpeg|png|webp|gif|svg)$', url_l))
            
            # Marka logosu mu kontrol et
            is_brand = any(k in url_l or k in alt_l for k in ["marka", "brand", "markalarimiz", "temsilcilik", "uretici", "distributor"])
            
            target_map = unique_brand_map if is_brand else unique_ref_map
            
            if base_name not in target_map:
                target_map[base_name] = (img_url, has_dim)
            else:
                old_url, old_has_dim = target_map[base_name]
                # Eğer eski görsel küçük boyutlu (thumbnail) ise ve yeni olan orijinal (boyutsuz) ise orijinali tercih et
                if old_has_dim and not has_dim:
                    target_map[base_name] = (img_url, has_dim)
        else:
            # Slayt adayları için de navbar/footer ve logo kontrolleri (Diamond Standard 💎)
            if is_navbar_footer_or_logo(img_url, alt):
                continue
                
            # Eğer zaten 5 veya daha fazla slayt bulduysak, yeni network istekleri yapıp vakit kaybetmeyelim
            is_slider_or_bg = any(k in alt.lower() or k in img_url.lower() for k in ["banner", "slider", "slayt", "vitrin", "promo"]) or img_url in bg_slides or "bg" in img_url.lower()
            
            if not is_slider_or_bg and len(carousel_slides) < 5:
                # Sadece 5 slayttan az olduğunda canlı genişlik testi yap
                is_slider_or_bg = is_widescreen_banner(img_url)
                
            if is_slider_or_bg:
                if img_url not in carousel_slides:
                    carousel_slides.append(img_url)
                    print(f"  🎬 [Carousel Slide] Slayt eklendi: {img_url}")

    # Benzersiz logoları asıl listelere aktar
    for base_name, (url, _) in unique_brand_map.items():
        brand_logos.append(url)
        
    for base_name, (url, _) in unique_ref_map.items():
        reference_logos.append(url)

    # 1. Banners Generation (Pillow)
    if args.slug:
        slug = args.slug
        root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        public_dir = os.path.join(root_dir, "public", "generated")
        
        if reference_logos:
            ref_path = os.path.join(public_dir, f"references_{slug}.png")
            print(f"🎨 Referans logoları Pillow ile tek bir minimal banner görseline dönüştürülüyor...")
            success = generate_unified_logos_banner(reference_logos, ref_path, title="Referanslarımız")
            if success:
                ref_banner_url = f"/generated/references_{slug}.png"
                print(f"  ✅ Referans görseli başarıyla oluşturuldu: {ref_banner_url}")
            else:
                print("  ❌ Referans görseli oluşturulamadı.")
                
        if brand_logos:
            brand_path = os.path.join(public_dir, f"brands_{slug}.png")
            print(f"🎨 Marka logoları Pillow ile tek bir minimal banner görseline dönüştürülüyor...")
            success = generate_unified_logos_banner(brand_logos, brand_path, title="Markalarımız")
            if success:
                brand_banner_url = f"/generated/brands_{slug}.png"
                print(f"  ✅ Marka görseli başarıyla oluşturuldu: {brand_banner_url}")
            else:
                print("  ❌ Marka görseli oluşturulamadı.")

    # 2. Build Carousel Slides
    slides = []
    slide_id = 1
    for src in carousel_slides[:5]:
        slides.append({
            "id": slide_id,
            "src": src,
            "bg": "bg-stone-50",
            "label": args.name,
            "sub": "Kurumsal Ürün Kataloğu"
        })
        slide_id += 1

    # Referanslar mevcutsa carousel'e tek bir minimal "REFERANSLARIMIZ" slaytı ekle
    if ref_banner_url:
        slides.append({
            "id": slide_id,
            "src": ref_banner_url,
            "bg": "bg-stone-50",
            "label": "REFERANSLARIMIZ",
            "sub": "Çözüm Ortaklarımız & Seçkin Markalarımız"
        })
        slide_id += 1
    elif reference_logos:
        slides.append({
            "id": slide_id,
            "src": reference_logos[0],
            "bg": "bg-stone-50",
            "label": "REFERANSLARIMIZ",
            "sub": "Çözüm Ortaklarımız & Seçkin Markalarımız"
        })
        slide_id += 1

    # Markalar mevcutsa carousel'e tek bir minimal "MARKALARIMIZ" slaytı ekle
    if brand_banner_url:
        slides.append({
            "id": slide_id,
            "src": brand_banner_url,
            "bg": "bg-stone-50",
            "label": "MARKALARIMIZ",
            "sub": "En Seçkin Ürün ve Marka Çeşitlerimiz"
        })
        slide_id += 1
    elif brand_logos:
        slides.append({
            "id": slide_id,
            "src": brand_logos[0],
            "bg": "bg-stone-50",
            "label": "MARKALARIMIZ",
            "sub": "En Seçkin Ürün ve Marka Çeşitlerimiz"
        })
        slide_id += 1

    carousel_data = {
        "enabled": len(slides) > 0,
        "slides": slides
    }

    # references_data tablosunu doldur (Logo, Name)
    references_data = []
    combined_logos = reference_logos + brand_logos
    for i, ref_url in enumerate(combined_logos[:15]):
        references_data.append({
            "id": i + 1,
            "name": f"Partner {i + 1}",
            "logo": ref_url
        })

    categories = list(set([p["category"] for p in products]))
    if not categories:
        categories = ["Genel"]

    print(f"\n{'='*55}")
    print(f"✅ DIAMOND SCRAPE TAMAMLANDI — {args.name}")
    print(f"{'='*55}")
    print(f"  Logo:      {logo_url[:60] or '❌'}")
    print(f"  Slogan:    {meta.get('tagline', '') or '❌'}")
    print(f"  Telefon:   {meta.get('phone', '') or '❌'}")
    print(f"  Adres:     {meta.get('short_address', '') or '❌'}")
    print(f"  Carousel:  {len(slides)} adet slide (Referans slaytı dahil)")
    print(f"  Referans:  {len(references_data)} adet marka logosu tespit edildi")
    print(f"  Kategori:  {len(categories)} adet")
    print(f"  Ürün:      {len(products)} adet (Tamamen Ücretsiz!)")

    # Save to files
    if args.slug:
        slug = args.slug
        results_dir = os.path.join(current_dir, "results")
        os.makedirs(results_dir, exist_ok=True)
        
        md_file = os.path.join(results_dir, f"result_{slug}.md")
        with open(md_file, "w", encoding="utf-8") as f:
            for idx, p in enumerate(pages, 1):
                f.write(f"\n# PAGE {idx}: {p['url']}\n")
                f.write(p["content"])
                f.write("\n\n" + "="*80 + "\n\n")
        print(f"💾 Markdown: {md_file}")
        
        json_out = {
            "logo_url": logo_url,
            "tagline": meta.get("tagline", ""),
            "phone": meta.get("phone", ""),
            "whatsapp": meta.get("whatsapp", ""),
            "address": meta.get("address", ""),
            "short_address": meta.get("short_address", ""),
            "instagram": meta.get("instagram", ""),
            "categories": categories,
            "carousel_data": carousel_data,
            "references_data": references_data,
            "products": products
        }
        json_file = os.path.join(results_dir, f"result_{slug}.json")
        with open(json_file, "w", encoding="utf-8") as f:
            json.dump(json_out, f, ensure_ascii=False, indent=2)
        print(f"💾 JSON:     {json_file}")

        # Otomatik Supabase senkronizasyonu
        if args.sync:
            print("\n🔄 Otomatik Supabase senkronizasyonu başlatılıyor...")
            sync_store_to_supabase(slug, args.name, json_out)

if __name__ == "__main__":
    main()
