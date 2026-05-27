import os
import sys
import re
import io
import urllib.request
from urllib.parse import urljoin
from PIL import Image

# Ensure parent directory is in python path
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from core.crawler import resolve_url

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def generate_unified_logos_banner(logo_urls, output_path, title="Referanslarımız"):
    """
    Logo URL listesini indirir ve tek bir şık, minimal, birleştirilmiş banner görseli oluşturur.
    En-boy oranlarını korur, logoları ortalar ve beyaz arka plan üzerine padding ile yerleştirir.
    """
    downloaded_images = []
    for url in logo_urls:
        try:
            req = urllib.request.Request(url, headers=DEFAULT_HEADERS)
            with urllib.request.urlopen(req, timeout=5) as res:
                img_data = res.read()
                img = Image.open(io.BytesIO(img_data))
                if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                    img = img.convert('RGBA')
                else:
                    img = img.convert('RGB')
                downloaded_images.append(img)
        except Exception:
            continue
            
    if not downloaded_images:
        return False
        
    max_w, max_h = 160, 80
    resized_images = []
    for img in downloaded_images:
        w, h = img.size
        ratio = min(max_w / w, max_h / h)
        new_w, new_h = int(w * ratio), int(h * ratio)
        new_w = max(1, new_w)
        new_h = max(1, new_h)
        img_resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        resized_images.append(img_resized)
        
    num_logos = len(resized_images)
    canvas_w = 1200
    if num_logos <= 6:
        canvas_h = 240
        canvas = Image.new("RGBA", (canvas_w, canvas_h), (255, 255, 255, 255))
        total_logo_w = sum(img.size[0] for img in resized_images)
        remaining_space = canvas_w - total_logo_w
        spacing = remaining_space / (num_logos + 1)
        
        current_x = spacing
        for img in resized_images:
            w, h = img.size
            y = int((canvas_h - h) / 2)
            logo_bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
            if img.mode == 'RGBA':
                logo_bg.alpha_composite(img)
                paste_img = logo_bg.convert('RGB')
            else:
                paste_img = img.convert('RGB')
                
            canvas.paste(paste_img, (int(current_x), y))
            current_x += w + spacing
    else:
        logos_per_row = 5
        rows = (num_logos + logos_per_row - 1) // logos_per_row
        row_h = 160
        canvas_h = row_h * rows + 80
        canvas = Image.new("RGBA", (canvas_w, canvas_h), (255, 255, 255, 255))
        
        for row in range(rows):
            row_logos = resized_images[row * logos_per_row : (row + 1) * logos_per_row]
            total_logo_w = sum(img.size[0] for img in row_logos)
            remaining_space = canvas_w - total_logo_w
            spacing = remaining_space / (len(row_logos) + 1)
            
            current_x = spacing
            y_offset = row * row_h + 40
            for img in row_logos:
                w, h = img.size
                y = y_offset + int((row_h - h) / 2)
                logo_bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
                if img.mode == 'RGBA':
                    logo_bg.alpha_composite(img)
                    paste_img = logo_bg.convert('RGB')
                else:
                    paste_img = img.convert('RGB')
                    
                canvas.paste(paste_img, (int(current_x), y))
                current_x += w + spacing
                
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    canvas.convert('RGB').save(output_path, "PNG", quality=95)
    return True

def extract_background_sliders(base_url):
    """
    CSS veya inline style ile yüklenen Swiper/Elementor slider arka plan resimlerini 
    HTML ve CSS dosyalarını tarayarak akıllıca yakalar (Prestashop/WordPress uyumlu).
    """
    candidates = []
    try:
        req = urllib.request.Request(base_url, headers=DEFAULT_HEADERS)
        with urllib.request.urlopen(req, timeout=4) as res:
            html_text = res.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"  ℹ️ [Background Slider] Ham HTML çekilemedi (Pas geçiliyor): {e}")
        return candidates

    repeater_classes = set(re.findall(r'class=["\'][^"\']*(elementor-repeater-item-[a-f0-9]+|swiper-slide|slick-slide)[^"\']*["\']', html_text))
    if not repeater_classes:
        repeater_classes = {"swiper-slide", "slick-slide"}
        
    css_urls = re.findall(r'<link[^>]*href=["\']([^"\']+\.css[^"\']*)["\']', html_text)
    filtered_css = []
    for url in css_urls:
        abs_css = urljoin(base_url, url)
        if any(k in abs_css.lower() for k in ["elementor", "axon", "post-", "custom", "theme", "style"]):
            filtered_css.append(abs_css)
            
    style_blocks = re.findall(r'<style[^>]*>(.*?)</style>', html_text, re.DOTALL)
    all_css_sources = [("Inline Style", block) for block in style_blocks]
    
    for css_url in filtered_css[:6]:
        try:
            req_css = urllib.request.Request(css_url, headers=DEFAULT_HEADERS)
            with urllib.request.urlopen(req_css, timeout=2) as res_css:
                css_text = res_css.read().decode('utf-8', errors='ignore')
                all_css_sources.append((css_url, css_text))
        except Exception:
            continue
            
    for name, css_text in all_css_sources:
        # Split by curly braces safely to avoid catastrophic backtracking
        blocks = css_text.split("}")
        for block in blocks:
            if "{" not in block:
                continue
            parts_b = block.split("{", 1)
            if len(parts_b) < 2:
                continue
            selector, properties = parts_b
            if any(cls in selector for cls in repeater_classes):
                if "background-image" in properties.lower() or "background:" in properties.lower():
                    match = re.search(r"url\(['\"]?([^'\"]+?)['\"]?\)", properties, re.IGNORECASE)
                    if match:
                        m_clean = match.group(1).replace("\\", "").strip()
                        abs_img = urljoin(base_url, m_clean)
                        if abs_img not in candidates:
                            candidates.append(abs_img)
                            print(f"  🎯 [Background Slider] Slayt görseli bulundu: {abs_img}")
                        
    return candidates

def is_widescreen_banner(img_url):
    """Görselin en-boy oranını kontrol ederek 16:9 veya benzeri yatay geniş formatta olup olmadığını belirler."""
    from PIL import ImageFile
    try:
        req = urllib.request.Request(img_url, headers=DEFAULT_HEADERS)
        with urllib.request.urlopen(req, timeout=1.5) as res:
            img_data = res.read(16384) # Sadece ilk 16KB'ı indir
            p = ImageFile.Parser()
            p.feed(img_data)
            if p.image:
                w, h = p.image.size
                if w >= 500 and h >= 200:
                    aspect = w / h
                    if aspect >= 1.4: # 16:9 veya benzeri yatay geniş format
                        return True
    except Exception:
        pass
    return False

def extract_raw_images_from_url(page_url):
    """
    Page URL'inin ham HTML kodunu indirip regex ile tüm olası görsel adreslerini (lazy-loaded, data-src, src, inline background vb.) yakalar.
    """
    candidates = []
    try:
        req = urllib.request.Request(page_url, headers=DEFAULT_HEADERS)
        with urllib.request.urlopen(req, timeout=5) as res:
            html_text = res.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"  ℹ️ [Raw Image Extractor] HTML çekilemedi (Pas geçiliyor): {e}")
        return candidates

    # 1. <img> taglarındaki her türlü src/data-src varyantını bul
    img_attrs = ["src", "data-src", "data-lazy-src", "data-lazy", "data-lazyload", "data-original", "srcset"]
    for attr in img_attrs:
        pattern = rf'{attr}\s*=\s*["\']([^"\']+\.(?:png|jpg|jpeg|webp|gif|svg)(?:\?[^"\']*)?)["\']'
        matches = re.findall(pattern, html_text, re.IGNORECASE)
        for m in matches:
            abs_url = urljoin(page_url, m.strip())
            if abs_url not in candidates:
                candidates.append(abs_url)

    # srcset içindeki virgülle ayrılmış URL'leri de yakala
    srcset_pattern = r'srcset\s*=\s*["\']([^"\']+)["\']'
    srcset_matches = re.findall(srcset_pattern, html_text, re.IGNORECASE)
    for srcset in srcset_matches:
        parts = srcset.split(",")
        for part in parts:
            part = part.strip().split(" ")[0].strip()
            if part:
                if any(ext in part.lower() for ext in [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]):
                    abs_url = urljoin(page_url, part)
                    if abs_url not in candidates:
                        candidates.append(abs_url)

    # 2. background-image: url(...) veya style="..." içinde url(...) olanları bul
    bg_matches = re.findall(r"url\(['\"]?([^'\"]+?\.(?:png|jpg|jpeg|webp|gif|svg)(?:\?[^'\"]*)?)['\"]?\)", html_text, re.IGNORECASE)
    for m in bg_matches:
        m_clean = m.replace("\\", "").strip()
        abs_url = urljoin(page_url, m_clean)
        if abs_url not in candidates:
            candidates.append(abs_url)
 
    return candidates

def is_reference_logo(url_str, alt_str="", source_page_url="", logo_url="", company_slug="", company_name="", product_images_set=None):
    """
    Görselin kurumsal bir referans logosu olup olmadığını Diamond Standard 💎 kriterlerine göre denetler.
    """
    import urllib.parse
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
    c_slug = company_slug.lower() if company_slug else (company_name.lower().replace(" ", "") if company_name else "")
    if c_slug and c_slug in url_l and "logo" in url_l:
        return False

    # WordPress Tema, Eklenti veya statik arayüz varlıklarını filtrele (Diamond Standard Heuristic 💎)
    if "/wp-content/" in url_l and "/uploads/" not in url_l:
        return False

    # 2. REFERANS SAYFASI VE DOĞRUDAN ANAHTAR KELİME TESPİTİ
    is_on_reference_page = False
    if source_page_url:
        sp_url_l = source_page_url.lower()
        if any(ref_slug in sp_url_l for ref_slug in ["referans", "reference", "brand", "marka", "partner", "sponsor", "bayi", "musteri", "müşteri", "customer", "isortag", "is-ortak"]):
            is_on_reference_page = True
            
    has_direct_ref_keyword = any(k in url_l or k in alt_l for k in ["referans", "reference", "referanslar", "referanslarimiz", "references"])

    # Kesinlikle çöp sosyal medya ve dil bayrakları/ikonları
    strict_trash_keywords = [
        "tr.png", "en.png", "flag", "instagram", "facebook", "twitter", "linkedin", 
        "youtube", "social", "whatsapp", "phone", "mail", "email", "secure", "lock", "cart", "basket",
        "search", "user", "avatar", "profile", "loading", "spinner", "arrow", "chevron", "bullet", 
        "bg", "pattern", "check", "close", "cancel", "next", "prev", "icon"
    ]
    if any(k in url_l or k in alt_l for k in strict_trash_keywords):
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

    # 3. ÜRÜN RESMİ KONTROLÜ
    if product_images_set and (url_str in product_images_set or url_l in product_images_set):
        return False
    
    product_keywords = ["/product/", "/urun/", "/shop/"]
    if any(pk in url_l for pk in product_keywords):
        return False

    # EĞER REFERANS SAYFASINDAYSAK VEYA GÖRSELİN İSMİNDE DOĞRUDAN REFERANS KELİMESİ GEÇİYORSA:
    # Katı boyut ve placeholder filtrelerini aşarak DİREKT kabul ediyoruz (Diamond Standard 💎)
    if is_on_reference_page or has_direct_ref_keyword:
        dev_trash = ["localhost", "127.0.0.1", "dummy", "placeholder", "404-page"]
        if any(p in url_l or p in alt_l for p in dev_trash):
            return False
            
        size_match = re.search(r'-(\d+)x(\d+)\.(?:jpg|jpeg|png|webp|gif|svg)', url_l)
        if size_match:
            try:
                w = int(size_match.group(1))
                h = int(size_match.group(2))
                aspect = w / h
                if 0.3 <= aspect <= 5.0:
                    if 30 <= w <= 2500 and 30 <= h <= 2000:
                        return True
                return False
            except ValueError:
                pass

        if url_l.endswith(".svg"):
            return True

        try:
            from PIL import ImageFile
            req = urllib.request.Request(url_str, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=1.0) as response:
                chunk = response.read(16384)
                p = ImageFile.Parser()
                p.feed(chunk)
                if p.image:
                    w, h = p.image.size
                    aspect = w / h
                    if 0.3 <= aspect <= 5.0:
                        if 30 <= w <= 2500 and 30 <= h <= 2000:
                            return True
                    return False
        except Exception:
            return True
        return True

    # EĞER NORMAL BİR SAYFADAYSAK (Klasik sıkı denetimler)
    dev_placeholder_keywords = [
        "localhost", "127.0.0.1", "themetechmount", "boldman", "/themes/", "/wp-content/themes/",
        "404-page", "uconstruction", "coming-soon", "login-bg", "floatingbar-bg", "placeholder",
        "dummy", "default-", "bg-", "-bg", "bg.", "slider-bg", "banner-bg", "slider", "banner"
    ]
    if any(p in url_l or p in alt_l for p in dev_placeholder_keywords):
        return False

    ui_and_promo_keywords = [
        "taksit", "kargo", "fiyat", "enuygun", "odeme", "ödeme", "kredikarti", "kredi-karti", "credit-card",
        "firsat", "fırsat", "kampanya", "indirim", "discount", "promo", "banner", "reklam", "ad-", "adsense", 
        "slider", "vitrin", "pop-up", "popup", "tel", "phone", "adres", "address", "iletisim", "contact", 
        "ulas", "ulaş", "hakkimizda", "hakkımızda", "about", "default", "widget", "sidebar", "theme", "plugin", 
        "yazfirsati", "yazfırsatı", "kategori", "category", "urun-kategori", "product-category", "tag", "etiket"
    ]
    if any(k in url_l or k in alt_l for k in ui_and_promo_keywords):
        return False

    # 4. ANAHTAR KELİME KONTROLÜ (Normal sayfalardaki görseller için)
    ref_keywords = [
        "logo", "marka", "brand", "ref", "referans", "partner", "sponsor", 
        "client", "customer", "bayi", "distributor", "isortag", "ortak", "cooperation",
        "coop", "referanslar", "temsilcilik", "uretici", "markalarimiz", "our-brands",
        "servis", "unox", "remta", "kitchenaid", "robotcoupe", "oztiryakiler", "inoksan",
        "rational", "hobart", "winterhalter", "fagor", "brema", "scotsman",
        "distribütör", "üretici", "is-ortak"
    ]
    url_path = urllib.parse.urlparse(url_str).path.lower()
    has_keyword = any(k in url_path or k in alt_l for k in ref_keywords)
    if not has_keyword:
        return False

    # 5. PİKSEL VE BOYUT KONTROLLERİ (En-boy oranı ve ideal aralık)
    size_match = re.search(r'-(\d+)x(\d+)\.(?:jpg|jpeg|png|webp|gif|svg)', url_l)
    if size_match:
        try:
            w = int(size_match.group(1))
            h = int(size_match.group(2))
            aspect = w / h
            if 0.3 <= aspect <= 4.0:
                if 30 <= w <= 300 and 30 <= h <= 200:
                    return True
            return False
        except ValueError:
            pass

    if url_l.endswith(".svg"):
        return True

    try:
        from PIL import ImageFile
        req = urllib.request.Request(url_str, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=1.0) as response:
            chunk = response.read(16384)
            p = ImageFile.Parser()
            p.feed(chunk)
            if p.image:
                w, h = p.image.size
                aspect = w / h
                if 0.3 <= aspect <= 4.0:
                    if 30 <= w <= 400 and 30 <= h <= 250:
                        return True
                return False
    except Exception:
        return True
    return False

def is_navbar_footer_or_logo(url_str, alt_str="", logo_url="", company_slug="", company_name=""):
    """
    Görselin menü, footer, sosyal medya veya ana logo gibi arayüz parçası olup olmadığını doğrular.
    """
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
    c_slug = company_slug.lower() if company_slug else (company_name.lower().replace(" ", "") if company_name else "")
    if c_slug and c_slug in url_l and "logo" in url_l:
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
        
    # 4. Geliştirici ve placeholder/tema/tasarım/demo varlıklarını filtrele (Diamond Standard Heuristic 💎)
    dev_placeholder_keywords = [
        "localhost", "127.0.0.1", "themetechmount", "boldman", "/themes/", "/wp-content/themes/",
        "404-page", "uconstruction", "coming-soon", "login-bg", "floatingbar-bg", "placeholder",
        "dummy", "default-", "bg-", "-bg", "bg.", "slider-bg", "banner-bg"
    ]
    if any(p in url_l for p in dev_placeholder_keywords):
        return True
        
    return False
