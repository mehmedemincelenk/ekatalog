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

def make_neutral_lower(s):
    """
    Metni küçük harfe dönüştürür, Türkçe karakterleri normalize eder ve 
    Jina/combining dot karakter uyumsuzluklarını sıfırlar (Diamond Standard 💎).
    """
    if not s:
        return ""
    s = s.lower()
    s = s.replace("ı", "i").replace("ü", "u").replace("ö", "o").replace("ş", "s").replace("ğ", "g").replace("ç", "c")
    s = s.replace("i̇", "i") # combining dot temizle
    return s.strip()

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

def is_valid_category_name(cat):
    """Kategori isminin geçerli olup olmadığını doğrular."""
    if not cat:
        return False
    cat_clean = cat.strip()
    if len(cat_clean) < 2:
        return False
    # Parantez veya sadece noktalama işaretlerinden ibaret olmasın
    if re.match(r'^[()>\-/\|➔➢➣➤\s\d\.:]+$', cat_clean):
        return False
    # Kara liste kelimeleri ele (Diamond Standard 💎)
    blacklist = {
        "english", "turkish", "deutsch", "turkce", "language", "markdown content:", 
        "url source:", "title:", "images:", "links/buttons:", "anasayfa", "home", 
        "sayfa", "sayfalar", "product", "products", "urun", "urunler", "shop", "magaza",
        "iletisim", "contact", "contact us", "ulasim", "bize ulasin", "bizeulasin",
        "hakkimizda", "about", "about us", "biz kimiz", "vizyon", "misyon", "degerlerimiz",
        "giris", "sepet", "sepetim", "sepetiniz", "cart", "checkout", "odeme",
        "blog", "haberler", "duyurular", "galeri", "resimler", "videolar", "referanslar", "referanslarimiz",
        "kvkk", "gizlilik", "gizlilik politikasi", "sozlesme", "sartlar",
        "sitemap", "site haritasi", "arama", "search", "genel"
    }
    if make_neutral_lower(cat_clean) in blacklist:
        return False
    return True

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
            # URL'lerin bir parçasıysa (örn. http.../home/) veya link içindeki dil seçeneğiyse es geç
            match_start = match.start()
            pre_text = page_md[max(0, match_start-15):match_start].lower()
            if "http" in pre_text or "www" in pre_text or ".tr" in pre_text or ".com" in pre_text or "/" in pre_text:
                continue
                
            content = match.group(1).strip()
            links = re.findall(r'\[([^\]]+)\]\([^)]+\)', content)
            if not links:
                parts = [p.strip() for p in re.split(r'[➔➢➣➤>\-/|]', content) if p.strip()]
                if parts:
                    cand = parts[-2] if len(parts) > 1 else parts[-1]
                    if is_valid_category_name(cand):
                        return cand.strip()
            else:
                valid_links = [l.strip() for l in links if l.strip().lower() not in ["anasayfa", "home", "ürünler", "products", "shop", "mağaza", "evriva sayfa", "sayfa"]]
                if valid_links:
                    cand = valid_links[-1]
                    if is_valid_category_name(cand):
                        return cand.strip()
    return None

def extract_description_from_markdown(page_md, target_name):
    """
    Sayfa markdown içeriğinden, hedeflenen ürün/hizmet ismiyle en çok eşleşen metin bloğunu
    temiz bir açıklama olarak ayıklar (Diamond Standard 💎).
    """
    if not page_md or not target_name:
        return ""
        
    lines = page_md.split("\n")
    target_neutral = make_neutral_lower(target_name)
    
    # 1. Başlık altındaki ilk anlamlı paragrafları çekmeyi dene
    content_lines = []
    found_header = False
    
    # WooCommerce ve UI gürültü kelimeleri (Diamond Standard 💎)
    noise_keywords = [
        "sepet", "giris", "uye ol", "menu", "anasayfa", "copyright", "telefon", "adres",
        "stokta", "stok var", "sku:", "kategori:", "fiyat:", "taksit", "kargo", "yorum",
        "inceleme", "sepete ekle", "whatsapp ile", "hakkımızda", "iletisim", "ürün açıklaması",
        "change language", "english", "turkish", "dil seçin", "müşteri incelemesi", "stars",
        "rating", "kullanılabilirlik", "click to", "enlarge", "facebook", "twitter", "instagram"
    ]
    
    for line in lines:
        line_clean = line.strip()
        if not line_clean:
            continue
            
        # Başlık tespiti: hem markdown başlığı (#) hem de kalın/büyük harf veya tam eşleşen satırlar
        line_stripped_meta = line_clean.strip("*_#[] ").strip()
        line_neutral = make_neutral_lower(line_stripped_meta)
        
        # Eğer henüz başlık bulunmadıysa ve bu satır hedef adımıza çok benziyorsa
        if not found_header:
            is_header = False
            if line_clean.startswith("#"):
                header_text = make_neutral_lower(line_clean.lstrip("#"))
                if target_neutral in header_text or header_text in target_neutral:
                    is_header = True
            elif line_clean.startswith("**") and line_clean.endswith("**"):
                inner = make_neutral_lower(line_clean.strip("* "))
                if target_neutral == inner or (len(inner) > 3 and target_neutral in inner):
                    is_header = True
            elif line_neutral == target_neutral:
                is_header = True
                
            if is_header:
                found_header = True
                continue
        
        # Başlık bulunduktan sonraki anlamlı satırları topla
        if found_header:
            # Eğer başka bir ana başlığa geçildiyse dur
            if line_clean.startswith("#") and not line_clean.startswith("####"):
                if content_lines:
                    break
            
            # Markdown linklerini, resimlerini ve biçimlendirmelerini temizle
            clean_text = re.sub(r'!\[.*?\]\(.*?\)', '', line_clean) # Resimleri sil
            clean_text = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', clean_text) # Linkleri düz metne çevir
            clean_text = re.sub(r'[*_`#]', '', clean_text) # Stil işaretlerini temizle
            clean_text = clean_text.strip()
            
            clean_neutral = make_neutral_lower(clean_text)
            
            # Metadata veya gürültü satırlarını atla
            if any(k in clean_neutral for k in ["url source:", "published time:", "markdown content:", "author:", "reading time:", "original url:"]):
                continue
                
            if any(k in clean_neutral for k in noise_keywords):
                continue
                
            # Menü, footer, veya buton gibi duran kısa şeyleri es geç
            if clean_text and len(clean_text) > 15:
                content_lines.append(clean_text)
                if len(content_lines) >= 3: # En fazla 3 paragraf alalım
                    break
                    
    if content_lines:
        combined = "\n\n".join(content_lines)
        if len(combined) > 300:
            combined = combined[:297] + "..."
        return combined
        
    # 2. Eğer başlık eşleşmesi bulunamadıysa, sayfa genelinde hedef adı içeren bir metin bloğu bulmaya çalış
    for line in lines:
        line_clean = line.strip()
        if not line_clean or line_clean.startswith("#"):
            continue
            
        clean_text = re.sub(r'!\[.*?\]\(.*?\)', '', line_clean)
        clean_text = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', clean_text)
        clean_text = re.sub(r'[*_`#]', '', clean_text).strip()
        
        clean_neutral = make_neutral_lower(clean_text)
        
        if any(k in clean_neutral for k in ["url source:", "published time:", "markdown content:", "author:", "reading time:", "original url:"]):
            continue
            
        if any(k in clean_neutral for k in noise_keywords):
            continue
            
        # Eğer bu satır hedef adını içeriyor ve makul bir uzunluktaysa, harika bir açıklamadır!
        if target_neutral in clean_neutral and 25 < len(clean_text) < 300:
            return clean_text
            
    # 3. Son çare olarak, sayfanın genelindeki ilk uzun anlamlı metin bloğunu al
    fallback_lines = []
    for line in lines:
        line_clean = line.strip()
        if line_clean and not line_clean.startswith("#"):
            clean_text = re.sub(r'!\[.*?\]\(.*?\)', '', line_clean)
            clean_text = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', clean_text)
            clean_text = re.sub(r'[*_`#]', '', clean_text).strip()
            
            clean_neutral = make_neutral_lower(clean_text)
            
            if any(k in clean_neutral for k in ["url source:", "published time:", "markdown content:", "author:", "reading time:", "original url:"]):
                continue
                
            if any(k in clean_neutral for k in noise_keywords):
                continue
                
            if len(clean_text) > 40:
                fallback_lines.append(clean_text)
                if len(fallback_lines) >= 2:
                    break
                    
    combined_fallback = "\n\n".join(fallback_lines)
    if len(combined_fallback) > 300:
        combined_fallback = combined_fallback[:297] + "..."
    return combined_fallback

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

    def get_page_priority(p):
        url = p.get("url", "").lower()
        if "/bolge/" in url or "/ilce/" in url or any(d in url for d in districts):
            return 10
        if any(x in url for x in ["/hizmet/", "/urun/", "/product/", "/service/", "/portfolio/", "/kategori/"]):
            return 1
        return 5

    sorted_pages = sorted(pages, key=get_page_priority)

    for page in sorted_pages:
        page_url = page.get("url", base_url)
        page_md = page.get("content", "")
        if not page_md:
            continue
            
        # İletişim, Hakkımızda, KVKK gibi kurumsal sayfaları ürün taramasından tamamen çıkaralım (Diamond Standard 💎)
        page_url_neutral = make_neutral_lower(page_url)
        if any(x in page_url_neutral for x in ["iletisim", "contact", "hakkimizda", "about", "kvkk", "gizlilik", "politika", "sartlar", "sozlesme", "sepet", "cart", "checkout"]):
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

        # Son bir kez kategorinin geçerliliğini doğrula (Diamond Standard 💎)
        if not is_valid_category_name(category_name):
            category_name = "Genel"

        # Local DRY clean code helper functions (Diamond Standard 💎)
        def is_invalid_url_or_text(text):
            if not text:
                return True
            text_lower = text.lower()
            if any(k in text_lower for k in ignored_keywords):
                return True
            if any(dist in text_lower for dist in districts):
                return True
            if any(term in text_lower for term in spam_terms):
                return True
            return False

        def is_invalid_product(name, img_url):
            if not name or len(name) < 3:
                return True
            if img_url.lower().endswith(".gif"):
                return True
            return is_invalid_url_or_text(name) or is_invalid_url_or_text(img_url)

        def add_product_if_valid(prod_name, img_url):
            prod_name_clean = prod_name.strip()
            img_url_clean = img_url.strip()
            if is_invalid_product(prod_name_clean, img_url_clean):
                return
            prod_name_lower = prod_name_clean.lower()
            if prod_name_lower not in seen_prods:
                seen_prods.add(prod_name_lower)
                abs_img_url = resolve_url(base_url, img_url_clean)
                products.append({
                    "name": prod_name_clean,
                    "image_url": abs_img_url,
                    "category": category_name,
                    "price": "0",
                    "description": extract_description_from_markdown(page_md, prod_name_clean)
                })

        # A. ÖNCE DIŞ LİNK + İÇ RESİM KALIPLARINI TARA
        matches_outer_1 = outer_pattern_1.findall(page_md)
        for alt, img_url, prod_name, link_url in matches_outer_1:
            add_product_if_valid(prod_name, img_url)

        matches_outer_2 = outer_pattern_2.findall(page_md)
        for prod_name, alt, img_url, link_url in matches_outer_2:
            add_product_if_valid(prod_name, img_url)

        # B. STANDART RESİM ETİKETLERİNİ TARA
        matches_std = img_pattern.findall(page_md)
        for alt, img_url in matches_std:
            alt_clean = alt.strip()
            img_url_clean = img_url.strip()
            if is_invalid_product(alt_clean, img_url_clean):
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
                    "price": "0",
                    "description": extract_description_from_markdown(page_md, prod_name)
                })
                
        # C. GALERİ / BÜYÜTÜLEBİLİR RESİM ETİKETLERİNİ TARA
        matches_gallery = gallery_pattern.findall(page_md)
        for alt, placeholder_url, target_img_url in matches_gallery:
            target_img_clean = target_img_url.strip()
            if is_invalid_url_or_text(target_img_clean) or target_img_clean.lower().endswith(".gif"):
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
                    "price": "0",
                    "description": extract_description_from_markdown(page_md, prod_name)
                })
                 
    return products
