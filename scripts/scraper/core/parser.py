import os
import sys
import re
import html
import urllib.parse
from urllib.parse import urlparse

# Ensure parent directory is in python path
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from core.crawler import resolve_url

def clean_product_name_from_url(url):
    """Resim URL'sinden temiz, anlaşılır bir ürün ismi türetir (percent-encoding'i çözer)."""
    url = urllib.parse.unquote(url)
    base = os.path.basename(url.split('?')[0])
    name, ext = os.path.splitext(base)
    if not name:
        return ""
    # Seperatörleri temizle ve olduğu gibi kelimeleri koru
    name = name.replace("-", " ").replace("_", " ")
    return name.strip().title()

def extract_category_from_breadcrumbs(page_md):
    """Markdown içeriğinden ekmek kırıntılarını (breadcrumbs) tarayarak en derin kategori ismini bulur."""
    if not page_md:
        return None
    breadcrumb_patterns = [
        r'(?:\[Ana\s*Sayfa\]|\[Home\]|\[Anasayfa\])\([^)]+\)(.*?)(?:\n|$)',
        r'(?:Ana\s*Sayfa|Home|Anasayfa)\s*>\s*(.*?)(?:\n|$)',
        r'(?:Ana\s*Sayfa|Home|Anasayfa)\s*/\s*(.*?)(?:\n|$)',
    ]
    for pat in breadcrumb_patterns:
        match = re.search(pat, page_md, re.I)
        if match:
            content = match.group(1).strip()
            links = re.findall(r'\[([^\]]+)\]\([^)]+\)', content)
            if not links:
                parts = [p.strip() for p in re.split(r'[➔➢➣➤>\-/|]', content) if p.strip()]
                if parts:
                    if len(parts) > 1:
                        return parts[-2]
                    return parts[-1]
            else:
                valid_links = [l.strip() for l in links if l.strip().lower() not in ["anasayfa", "home", "ürünler", "products", "shop", "mağaza", "evriva sayfa", "sayfa"]]
                if valid_links:
                    return valid_links[-1]
    return None

def parse_products_from_markdown(pages, base_url, brand_name=""):
    """Ürünleri ve resimleri markdown çıktısından tamamen ÜCRETSİZ ve yüksek doğrulukla süzen regex parser."""
    products = []
    seen_prods = set()
    
    outer_pattern_1 = re.compile(r'\[\s*!\[([^\]]*)\]\((https?://[^\s\(\)]+(?:\([^\s\(\)]*\)[^\s\(\)]*)*)\)\s*([^\]\n]+)\s*\]\((https?://[^\s\(\)]+(?:\([^\s\(\)]*\)[^\s\(\)]*)*)\)')
    outer_pattern_2 = re.compile(r'\[\s*([^\]\n]+)\s*!\[([^\]]*)\]\((https?://[^\s\(\)]+(?:\([^\s\(\)]*\)[^\s\(\)]*)*)\)\s*\]\((https?://[^\s\(\)]+(?:\([^\s\(\)]*\)[^\s\(\)]*)*)\)')
    img_pattern = re.compile(r'!\[([^\]]*)\]\((https?://[^\s\(\)]+(?:\([^\s\(\)]*\)[^\s\(\)]*)*)\)')
    gallery_pattern = re.compile(r'\[\s*!\[([^\]]*)\]\((https?://[^\s\(\)]+(?:\([^\s\(\)]*\)[^\s\(\)]*)*)\)\s*\]\((https?://[^\s\(\)]+(?:\([^\s\(\)]*\)[^\s\(\)]*)*)\)', re.I)
    
    ignored_keywords = ["logo", "banner", "slider", "bg", "background", "icon", "placeholder", "map", "sepet", "cart", "avatar", "menu", "facebook", "twitter", "instagram", "youtube", "linkedin", "social", "pinterest", "google", "clients", "testimonial", "refresh", "captcha", "code", "reload", "loading"]
    districts = [
        "mecidiyekoy", "mecidiyeköy", "sisli", "şişli", "kozyatagi", "kozyatağı", "arnavutkoy", "arnavutköy",
        "avcilar", "avcılar", "atasehir", "ataşehir", "bahcelievler", "bahçelievler", "bagcilar", "bağcılar",
        "basaksehir", "başakşehir", "bakirkoy", "bakırköy", "besiktas", "beşiktaş", "bayrampasa", "bayrampaşa",
        "beylikduzu", "beylikdüzü", "beykoz", "buyukcekmece", "büyükçekmece", "beyoglu", "beyoğlu", "cekmekoy",
        "çekmeköy", "catalca", "çatalca", "eyupsultan", "eyüpsultan", "esenyurt", "esenler", "gaziosmanpasa",
        "gaziosmanpaşa", "fatih", "kadikoy", "kadıköy", "gungoren", "güngören", "kartal", "kagithane",
        "kağıthane", "maltepe", "kucukcekmece", "küçükçekmece", "sancaktepe", "adalar", "pendik", "sariyer",
        "sarıyer", "sile", "şile", "silivri", "sultanbeyli", "sultangazi", "tuzla", "umraniye", "ümraniye",
        "uskudar", "üsküdar", "zeytinburnu", "istanbul", "ankara", "izmir", "bursa", "turkiye", "türkiye", "tim mutfak"
    ]
    spam_terms = [
        "alımı", "alimi", "satışı", "satisi", "hizmeti", "hizmetlerimiz", "nedir", "nasıl yapılır", 
        "nasil yapilir", "dikkat edilmesi", "doğru adres", "dogru adres", "doğru tercih", "dogru tercih", 
        "avantajları", "avantajlari", "alanlar", "yapanlar", "fiyat teklifi", "kilavuzu", "kılavuzu", 
        "rehberi", "tavsiyeler", "yorumları", "yorumlar", "hakkımızda", "hakkimizda", "iletisim", 
        "iletişim", "galeri", "referanslar", "blog", "anasayfa", "cropped-", "elementor/thumbs",
        "ürün bulunmamaktadır", "urun bulunmamaktadir", "urunyok", "slide-urun", "refresh the code",
        "kodu yenile", "kodunu yenile", "güvenlik kodu", "captcha", "giriş yap", "sepeti güncelle", 
        "sepetim", "sepetiniz", "hesabım", "profilim", "şifremi unuttum"
    ]

    for page in pages:
        page_url = page.get("url", base_url)
        page_md = page.get("content", "")
        if not page_md:
            continue
            
        category_name = "Genel"
        
        # 1. Önce ekmek kırıntılarından (breadcrumbs) gerçek kategoriyi çekmeye çalış
        breadcrumb_cat = extract_category_from_breadcrumbs(page_md)
        if breadcrumb_cat:
            category_name = breadcrumb_cat
        else:
            # 2. Ekmek kırıntısı yoksa sayfa başlığına bak
            title_match = re.search(r'^#\s+([^\n]+)', page_md, re.M)
            if title_match:
                cand = title_match.group(1).strip()
                cand = re.sub(r'^(Ürünler|Products|Kategoriler|Categories|Arşiv|Archive)\s*[-–—|:]\s*', '', cand, flags=re.I).strip()
                
                # Başlık bir ürün adına mı benziyor (uzunsa veya birimler içeriyorsa ürün detayıdır)?
                is_probably_product_page = False
                cand_lower = cand.lower()
                if any(w in cand_lower for w in ["kg", "lt", "ml", "adet", "gr", "pack", "x", "mm", "cm"]):
                    is_probably_product_page = True
                if len(cand.split()) > 4:
                    is_probably_product_page = True
                    
                if is_probably_product_page:
                    # Detay sayfasıysa ve breadcrumb yoksa, URL yolundan kategori türetmeyi dene
                    parsed_url = urlparse(page_url)
                    path_parts = [p for p in parsed_url.path.split('/') if p]
                    if len(path_parts) > 1:
                        cat_part = path_parts[-2]
                        cat_part = re.sub(r'-\d+$', '', cat_part) # ID'leri temizle
                        cat_part = cat_part.replace("-", " ").replace("_", " ").strip().title()
                        if cat_part.lower() not in ["product", "products", "urun", "urunler", "shop", "item", "p"]:
                            category_name = cat_part
                        else:
                            category_name = "Genel"
                    else:
                        category_name = "Genel"
                else:
                    # Normal kategori/arşiv sayfası başlığı ise temizle ve kullan
                    for sep in [" - ", " – ", " — ", " | ", " :: "]:
                        if sep in cand:
                            parts = cand.split(sep)
                            left = parts[0].strip()
                            right = parts[1].strip()
                            brand_words = set(re.findall(r'\w+', brand_name.lower())) if brand_name else set()
                            right_words = set(re.findall(r'\w+', right.lower()))
                            stop_words = {"ve", "veya", "ile", "de", "da", "grubu", "urunleri", "ürünleri", "fırça", "firca"}
                            overlap = (brand_words & right_words) - stop_words
                            if overlap or any(w in right.lower() for w in ["temizlik", "mursidoglu", "ltd", "sti", "şti", "ticaret", "a.s", "aş"]):
                                cand = left
                                break
                    
                    if brand_name:
                        brand_lower = brand_name.lower()
                        if brand_lower in cand.lower():
                            idx = cand.lower().rfind(brand_lower)
                            if idx > 0:
                                prefix = cand[:idx].strip()
                                while prefix and prefix[-1] in ["-", "–", "—", "|", ":", "/"]:
                                    prefix = prefix[:-1].strip()
                                if prefix:
                                    cand = prefix
                                    
                    if cand.lower() not in ["anasayfa", "home", "hakkımızda", "hakkimizda", "iletişim", "iletisim", "ürünler", "products", "haberler", "blog", "e-katalog", "e katalog"]:
                        category_name = cand
            else:
                # 3. URL yapısından kategori bulmayı dene (örn. /category/oto-bakim)
                url_lower = page_url.lower()
                if "/category/" in url_lower or "/kategori/" in url_lower:
                    parts = [p for p in page_url.split('/') if p]
                    if parts:
                        last_part = parts[-1].replace("-", " ").strip()
                        if last_part:
                            category_name = last_part.title()

        # A. ÖNCE DIŞ LİNK + İÇ RESİM KALIPLARINI TARA
        matches_outer_1 = outer_pattern_1.findall(page_md)
        for alt, img_url, prod_name, link_url in matches_outer_1:
            prod_name_clean = prod_name.strip()
            img_url_clean = img_url.strip()
            if not prod_name_clean or len(prod_name_clean) < 3:
                continue
            
            prod_name_lower = prod_name_clean.lower()
            img_url_lower = img_url_clean.lower()
            
            if any(k in prod_name_lower or k in img_url_lower for k in ignored_keywords):
                continue
            if any(dist in prod_name_lower or dist in img_url_lower for dist in districts):
                continue
            if any(term in prod_name_lower or term in img_url_lower for term in spam_terms):
                continue
            if img_url_clean.lower().endswith(".gif"):
                continue
                
            if prod_name_lower not in seen_prods:
                seen_prods.add(prod_name_lower)
                abs_img_url = resolve_url(base_url, img_url_clean)
                products.append({
                    "name": prod_name_clean,
                    "image_url": abs_img_url,
                    "category": category_name,
                    "price": "0"
                })

        matches_outer_2 = outer_pattern_2.findall(page_md)
        for prod_name, alt, img_url, link_url in matches_outer_2:
            prod_name_clean = prod_name.strip()
            img_url_clean = img_url.strip()
            if not prod_name_clean or len(prod_name_clean) < 3:
                continue
            
            prod_name_lower = prod_name_clean.lower()
            img_url_lower = img_url_clean.lower()
            
            if any(k in prod_name_lower or k in img_url_lower for k in ignored_keywords):
                continue
            if any(dist in prod_name_lower or dist in img_url_lower for dist in districts):
                continue
            if any(term in prod_name_lower or term in img_url_lower for term in spam_terms):
                continue
            if img_url_clean.lower().endswith(".gif"):
                continue
                
            if prod_name_lower not in seen_prods:
                seen_prods.add(prod_name_lower)
                abs_img_url = resolve_url(base_url, img_url_clean)
                products.append({
                    "name": prod_name_clean,
                    "image_url": abs_img_url,
                    "category": category_name,
                    "price": "0"
                })

        # B. STANDART RESİM ETİKETLERİNİ TARA
        matches_std = img_pattern.findall(page_md)
        for alt, img_url in matches_std:
            alt_clean = alt.strip()
            img_url_clean = img_url.strip()
            if not alt_clean or len(alt_clean) < 3:
                continue
            
            alt_lower = alt_clean.lower()
            img_url_lower = img_url_clean.lower()
            
            if any(k in alt_lower or k in img_url_lower for k in ignored_keywords):
                continue
            if any(dist in alt_lower or dist in img_url_lower for dist in districts):
                continue
            if any(term in alt_lower or term in img_url_lower for term in spam_terms):
                continue
            if img_url_clean.lower().endswith(".gif"):
                continue
                
            prod_name = re.sub(r'^(Image|Resim)\s*\d+[,:\s]*', '', alt_clean, flags=re.I).strip()
            prod_name = re.sub(r'^\d+[\.,\d]*\s*[:\-]*\s*', '', prod_name).strip()
            
            if not prod_name or len(prod_name) < 4:
                continue
                
            prod_name_lower = prod_name.lower()
            if prod_name_lower in ["start", "giriş", "üye girişi", "üye ol", "sepetim", "sepetiniz", "menü", "anasayfa", "profil"]:
                continue
                
            if prod_name_lower not in seen_prods:
                seen_prods.add(prod_name_lower)
                abs_img_url = resolve_url(base_url, img_url_clean)
                products.append({
                    "name": prod_name,
                    "image_url": abs_img_url,
                    "category": category_name,
                    "price": "0"
                })
                
        # C. GALERİ / BÜYÜTÜLEBİLİR RESİM ETİKETLERİNİ TARA
        matches_gallery = gallery_pattern.findall(page_md)
        for alt, placeholder_url, target_img_url in matches_gallery:
            target_img_clean = target_img_url.strip()
            target_img_lower = target_img_clean.lower()
            
            if any(k in target_img_lower for k in ignored_keywords):
                continue
            if any(dist in target_img_lower for dist in districts):
                continue
            if any(term in target_img_lower for term in spam_terms):
                continue
            if target_img_clean.lower().endswith(".gif"):
                continue
                
            prod_name = alt.strip()
            prod_name = re.sub(r'(?i)click\s+to\s+enlarge\s+image', '', prod_name).strip()
            prod_name = re.sub(r'(?i)^(image|resim)\s*\d+[,:\s]*', '', prod_name).strip()
            prod_name = re.sub(r'(?i)\.(?:jpe?g|png|webp|gif)$', '', prod_name).strip()
            prod_name = prod_name.replace("_", " ").replace("-", " ").strip()
            
            if not prod_name or len(prod_name) < 4 or any(x in prod_name.lower() for x in ["click", "enlarge", "transparent"]):
                prod_name = clean_product_name_from_url(target_img_clean)
                
            if not prod_name or len(prod_name) < 4:
                continue
                
            prod_name_lower = prod_name.lower()
            if prod_name_lower in ["start", "giriş", "üye girişi", "üye ol", "sepetim", "sepetiniz", "menü", "anasayfa", "profil"]:
                continue
                
            if prod_name_lower not in seen_prods:
                seen_prods.add(prod_name_lower)
                abs_img_url = resolve_url(base_url, target_img_clean)
                products.append({
                    "name": prod_name,
                    "image_url": abs_img_url,
                    "category": category_name,
                    "price": "0"
                })
                 
    return products
