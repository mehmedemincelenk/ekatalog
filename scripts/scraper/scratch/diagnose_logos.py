import urllib.parse
import urllib.request
import re
from PIL import ImageFile

class MockArgs:
    slug = "zafer"
    name = "Zafer Endüstriyel Mutfak"

args = MockArgs()
logo_url = "https://zaferendustriyelmutfak.com/wp-content/uploads/2017/07/logo-son-1.png"

def is_reference_logo(url_str, alt_str="", source_page_url=""):
    url_l = urllib.parse.unquote(url_str).lower()
    alt_l = alt_str.lower()
    
    # 1. TEMEL KARA LİSTELER
    if not url_str:
        return "False (no url)"
        
    if logo_url and (url_str == logo_url or url_l == logo_url.lower()):
        return "False (is main logo)"
        
    if logo_url:
        logo_filename = logo_url.split("/")[-1].split("?")[0].lower()
        img_filename = url_str.split("/")[-1].split("?")[0].lower()
        if logo_filename and img_filename:
            if logo_filename in img_filename or img_filename in logo_filename:
                return "False (logo name match)"
            
    company_slug = args.slug.lower() if args.slug else args.name.lower().replace(" ", "")
    if company_slug and company_slug in url_l and "logo" in url_l:
        return "False (company slug logo)"

    if "/wp-content/" in url_l and "/uploads/" not in url_l:
        return "False (wp-content theme/plugin)"
        
    strict_trash_keywords = [
        "tr.png", "en.png", "flag", "instagram", "facebook", "twitter", "linkedin", 
        "youtube", "social", "whatsapp", "phone", "mail", "email", "secure", "lock", "cart", "basket",
        "search", "user", "avatar", "profile", "loading", "spinner", "arrow", "chevron", "bullet", 
        "bg", "pattern", "check", "close", "cancel", "next", "prev", "icon"
    ]
    if any(k in url_l or k in alt_l for k in strict_trash_keywords):
        return f"False (strict trash: matched { [k for k in strict_trash_keywords if k in url_l or k in alt_l] })"

    ui_and_promo_keywords = [
        "taksit", "kargo", "fiyat", "enuygun", "odeme", "ödeme", "kredikarti", "kredi-karti", "credit-card",
        "firsat", "fırsat", "kampanya", "indirim", "discount", "promo", "banner", "reklam", "ad-", "adsense", 
        "slider", "vitrin", "pop-up", "popup", "tel", "phone", "adres", "address", "iletisim", "contact", 
        "ulas", "ulaş", "hakkimizda", "hakkımızda", "about", "default", "widget", "sidebar", "theme", "plugin", 
        "yazfirsati", "yazfırsatı", "kategori", "category", "urun-kategori", "product-category", "tag", "etiket"
    ]
    if any(k in url_l or k in alt_l for k in ui_and_promo_keywords):
        return f"False (ui/promo: matched { [k for k in ui_and_promo_keywords if k in url_l or k in alt_l] })"

    product_trash_keywords = [
        "kulluk", "küllük", "bardak", "tabak", "dolap", "makinesi", "makine", "tava", "ekipman", 
        "bicak", "bıçak", "kasik", "kaşık", "catal", "çatal", "spatula", "tost", "mixer", "mikser",
        "serbet", "şerbet", "ayran", "firin", "fırın", "evrak", "masa", "sandalye", "buz", "temizlik", 
        "hali", "halı", "yikama", "yıkama", "baca", "vantilator", "vantilatör", "kanal", "kase", "kâse", 
        "tencere", "temizleme", "pastasi", "paspas", "deterjan", "bulasik", "bulaşık", "tezgah", "tezgâh",
        "evye", "kuzine", "benmari", "ızgara", "izgara", "ocak", "fritöz", "fritoz", "blender", "sebil"
    ]
    if any(k in url_l or k in alt_l for k in product_trash_keywords):
        return f"False (product trash: matched { [k for k in product_trash_keywords if k in url_l or k in alt_l] })"

    # 2. REFERANS SAYFASI KONTROLÜ
    is_on_reference_page = False
    if source_page_url:
        sp_url_l = source_page_url.lower()
        if any(ref_slug in sp_url_l for ref_slug in ["referans", "reference", "brand", "marka", "partner", "sponsor", "bayi", "musteri", "müşteri", "customer", "isortag", "is-ortak"]):
            is_on_reference_page = True

    # 3. ÜRÜN RESMİ KONTROLÜ
    product_keywords = ["/product/", "/urun/", "/shop/"]
    if any(pk in url_l for pk in product_keywords):
        return "False (product path)"

    # 4. ANAHTAR KELİME KONTROLÜ (Normal sayfalardaki görseller için)
    if not is_on_reference_page:
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
            return "False (no ref keyword on normal page)"

    # 5. PİKSEL VE BOYUT KONTROLLERİ (En-boy oranı ve ideal aralık)
    size_match = re.search(r'-(\d+)x(\d+)\.(?:jpg|jpeg|png|webp|gif|svg)', url_l)
    if size_match:
        try:
            w = int(size_match.group(1))
            h = int(size_match.group(2))
            aspect = w / h
            if 0.3 <= aspect <= 4.0:
                if is_on_reference_page:
                    if 30 <= w <= 550 and 30 <= h <= 300:
                        return "True (WP size ref page)"
                else:
                    if 30 <= w <= 300 and 30 <= h <= 200:
                        return "True (WP size normal page)"
            return f"False (aspect or size out of range: {w}x{h}, aspect={aspect:.2f})"
        except ValueError:
            pass

    if url_l.endswith(".svg"):
        return "True (SVG)"

    # 5.2 Canlı Header/Pillow Analizi
    try:
        req = urllib.request.Request(url_str, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5.0) as response:
            chunk = response.read(16384)
            p = ImageFile.Parser()
            p.feed(chunk)
            if p.image:
                w, h = p.image.size
                aspect = w / h
                if 0.3 <= aspect <= 4.0:
                    if is_on_reference_page:
                        if 30 <= w <= 550 and 30 <= h <= 300:
                            return f"True (Live Pillow ref page: {w}x{h}, aspect={aspect:.2f})"
                    else:
                        if 30 <= w <= 400 and 30 <= h <= 250:
                            return f"True (Live Pillow normal page: {w}x{h}, aspect={aspect:.2f})"
                return f"False (Live aspect or size out of range: {w}x{h}, aspect={aspect:.2f})"
            else:
                return "False (Live Pillow failed to parse image)"
    except Exception as e:
        return f"Fallback True (Live exception: {e})"

test_urls = [
    ("https://zaferendustriyelmutfak.com/wp-content/uploads/2016/11/BAREK%C4%B0PMANLARI-1.jpg", "https://zaferendustriyelmutfak.com/iletisim/"),
    ("https://zaferendustriyelmutfak.com/wp-content/uploads/2017/06/referanslarimiz.jpg", "https://zaferendustriyelmutfak.com/referanslarimiz/")
]

for t_url, src_page in test_urls:
    print(f"{t_url} (source: {src_page}) -> {is_reference_logo(t_url, source_page_url=src_page)}")
