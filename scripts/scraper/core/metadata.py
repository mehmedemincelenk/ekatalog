import os
import sys
import re
import json
import urllib.request

# Ensure parent directory is in python path
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

def validate_and_clean_phone(raw_phone):
    """
    raw_phone'un gerçek bir Türkiye telefon numarası gibi görünüp görünmediğini doğrular.
    Formatı standartlaştırır: 90XXXXXXXXXX veya geçersizse boş string döner.
    """
    if not raw_phone:
        return ""
    digits = "".join(filter(str.isdigit, raw_phone))
    if len(digits) not in [10, 11, 12]:
        return ""
        
    # 90XXXXXXXXXX'e dönüştür
    if digits.startswith("0"):
        digits = "90" + digits[1:]
    elif not digits.startswith("90") and len(digits) == 10:
        digits = "90" + digits
        
    if len(digits) != 12 or not digits.startswith("90"):
        return ""
        
    # Alan kodunu çek (90'dan sonraki 3 hane)
    area_code = digits[2:5]
    
    # Türkiye alan kodları
    valid_prefixes = {
        # Sabit hatlar
        "212", "216", "222", "224", "226", "228", "232", "236", "242", "246", "248", "252", "256", "258", "262", "264", "266", 
        "272", "274", "276", "282", "284", "286", "288", "312", "318", "322", "324", "326", "328", "332", "338", "342", "344", 
        "346", "348", "352", "354", "356", "358", "362", "364", "366", "368", "370", "372", "374", "376", "378", "380", "382", 
        "384", "386", "388", "412", "414", "416", "422", "424", "426", "428", "432", "434", "436", "438", "442", "446", "452", 
        "454", "456", "458", "462", "464", "466", "472", "474", "476", "478", "482", "484", "486", "488",
        # Cep telefonları
        "501", "505", "506", "507", "530", "531", "532", "533", "534", "535", "536", "537", "538", "539", "540", "541", "542", 
        "543", "544", "545", "546", "547", "549", "551", "552", "553", "554", "555", "559", "561",
        # Kurumsal
        "850", "444"
    }
    
    if area_code not in valid_prefixes:
        return ""
        
    return digits

def openai_extract_meta(homepage_md, store_name, openai_key=None):
    """Sadece ana sayfadan şirket logosu, sloganı ve iletişim bilgilerini OpenAI veya ÇEVRİMDIŞI kurallarla yüksek hassasiyetle çıkarır."""
    meta = {
        "logo_url": "",
        "tagline": "Toptan Kurumsal Tedarikçi 💼",
        "phone": "",
        "whatsapp": "",
        "address": "",
        "short_address": "",
        "instagram": "",
        "announcement": "Kurumsal toptan satış kataloğumuza hoş geldiniz!"
    }
    
    if openai_key and openai_key.startswith("sk-"):
        try:
            prompt = f"""You are a master metadata extraction assistant for E-Katalog B2B platform.
Analyze the following markdown content of a B2B company's homepage and extract/standardize key corporate metadata.

Company Name: {store_name}

Extract the following fields and return ONLY a valid JSON object. Do not include markdown codeblocks or other text.
Fields:
1. "logo_url": Find the absolute URL of the primary company logo. If not found, return empty string.
2. "tagline": Generate a catchy, highly professional Turkish tagline/slogan (max 35 characters). Use the term "Kurumsal" instead of "B2B". It must NEVER be empty. Example: "Güvenilir Kurumsal İş Ortağınız".
3. "phone": Standardized primary phone number. Look for Turkish numbers. Return ONLY digits including the country code '90' (e.g. 902124859979). Remove any leading '0', '+', spaces, or formatting. If it's a random filename or false positive, return empty string.
4. "whatsapp": Standardized WhatsApp number. Same formatting rules as 'phone'. If not found, return empty string.
5. "address": The full official open address of the company. If not found, return empty string.
6. "short_address": Clean short address in the format "District / City" (İlçe / Şehir) or just "City" (Şehir) if only city is found. District should be a recognized district like Başakşehir, İkitelli, Tuzla, Nilüfer, etc., and City should be a recognized Turkish city. If not found, return empty string.
7. "instagram": The username or URL of the company's Instagram account. If not found, return empty string.
8. "announcement": A warm corporate announcement welcoming visitors (max 60 characters).

Markdown to analyze:
{homepage_md[:45000]}
"""
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {openai_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": "You are a professional metadata extraction system that returns only raw JSON."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.1
            }
            req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=45) as res:
                response_data = json.loads(res.read().decode("utf-8"))
                content = response_data["choices"][0]["message"]["content"].strip()
                if content.startswith("```json"):
                    content = content[7:]
                if content.endswith("```"):
                    content = content[:-3]
                parsed = json.loads(content.strip())
                for k in meta:
                    if k in parsed and parsed[k]:
                        meta[k] = str(parsed[k]).strip()
                print("  ✅ [AI] Şirket bilgileri OpenAI GPT-4o-mini ile yüksek doğrulukla çıkarıldı!")
                
                if meta["phone"]:
                    meta["phone"] = validate_and_clean_phone(meta["phone"])
                if meta["whatsapp"]:
                    meta["whatsapp"] = validate_and_clean_phone(meta["whatsapp"])
        except Exception as e:
            print(f"  ⚠ OpenAI API Hatası (Çevrimdışı kurallarla devam edilecek): {e}")

    # Fallback / Offline rules if needed
    if not meta["logo_url"]:
        logo_match = re.search(r'!\[([^\]]*logo[^\]]*)\]\((https?://[^\s\(\)]+(?:\([^\s\(\)]*\)[^\s\(\)]*)*)\)', homepage_md, re.I)
        if not logo_match:
            logo_match = re.search(r'src=["\'](https?://[^"\']*(?:logo)[^"\']+)["\']', homepage_md, re.I)
        if not logo_match:
            logo_match = re.search(r'!\[([^\]]*)\]\((https?://[^\s\(\)]+(?:\([^\s\(\)]*\)[^\s\(\)]*)*)\)', homepage_md)
        if logo_match:
            meta["logo_url"] = logo_match.group(2) if len(logo_match.groups()) >= 2 else logo_match.group(1)

    if not meta["phone"]:
        clean_text_for_phone = re.sub(r'https?://[^\s\)\)]+', '', homepage_md)
        clean_text_for_phone = re.sub(r'www\.[^\s\)\)]+', '', clean_text_for_phone)
        tel_link_match = re.search(r'tel:[:\s\-\+]*(\d+)', homepage_md, re.I)
        if tel_link_match:
            meta["phone"] = validate_and_clean_phone(tel_link_match.group(1))
        else:
            phone_match = re.search(r'(?:tel|telefon|gsm|iletisim|iletişim|mobil|sabit)?[:\s\-\+]*(90\s?\d{3}\s?\d{3}\s?\d{2}\s?\d{2}|0\s?\d{3}\s?\d{3}\s?\d{2}\s?\d{2}|\+90\s?\d{3}\s?\d{3}\s?\d{2}\s?\d{2}|[2-9]\d{2}\s?\d{3}\s?\d{2}\s?\d{2})', clean_text_for_phone, re.I)
            if phone_match:
                meta["phone"] = validate_and_clean_phone(phone_match.group(1))

    if not meta["address"]:
        # Clean markdown links to prevent matching inside URLs
        clean_text = re.sub(r'!\[.*?\]\(.*?\)', '', homepage_md) # Remove image links
        clean_text = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', clean_text) # Convert links to plain text
        
        # 1. First priority: look for explicit "adres" / "address"
        address_match = re.search(r'\b(?:adres|address)\b[:\s\-\/]*([^.\n\[\]()]{15,150})', clean_text, re.I)
        if address_match:
            meta["address"] = address_match.group(1).strip().strip(" :-–—")
            
        # 2. Second priority: look for other location keywords, but only if they contain typical Turkish address terms
        if not meta["address"]:
            other_match = re.search(r'\b(?:fabrik|merkez|ofis|depo)\b[:\s\-\/]*([^.\n\[\]()]{15,150})', clean_text, re.I)
            if other_match:
                cand = other_match.group(1).strip().strip(" :-–—")
                cand_lower = cand.lower()
                if any(x in cand_lower for x in ["mah", "cad", "sok", "sk", "no:", "yolu", "bulvar", "ist", "ank", "izm", "turk", "organize"]):
                    meta["address"] = cand
                    
        # 3. Third priority: look directly for Turkish address patterns
        if not meta["address"]:
            direct_match = re.search(r'([^.\n\[\]()]{5,100}\b(?:mahallesi|mah|caddesi|cad|sokak|sok|sk|organize sanayi|osb)\b[^.\n\[\]()]{10,100})', clean_text, re.I)
            if direct_match:
                meta["address"] = direct_match.group(1).strip().strip(" :-–—")

    # Enforce district and city formatting on address
    addr_val = meta.get("address", "")
    short_val = meta.get("short_address", "")
    if addr_val:
        cities = {
            "İstanbul": ["başakşehir", "ikitelli", "pendik", "tuzla", "esenyurt", "avcılar", "bağcılar", "ümraniye", "esenevler", "kağıthane", "maslak", "beylikdüzü", "hadımköy", "sultanbeyli", "kartal", "maltepe", "şişli", "beşiktaş", "fatih", "zeytinburnu", "bayrampaşa", "gaziosmanpaşa", "arnavutköy", "silivri", "çatalca", "büyükçekmece", "sarıyer", "eyüpsultan", "üsküdar", "kadıköy", "beykoz", "şile", "çekmeköy", "sancaktepe"],
            "Ankara": ["yenimahalle", "ostim", "ivedik", "çankaya", "mamak", "altındağ", "etimesgut", "sincan", "gölbaşı", "pursaklar", "akyurt", "kahramankazan"],
            "İzmir": ["bornova", "çiğli", "karşıyaka", "konak", "buca", "kemalpaşa", "torbalı", "gaziemir", "menemen", "aliağa"],
            "Bursa": ["nilüfer", "osmangazi", "yıldırım", "kestel", "gürsu", "inegöl", "gemlik"],
            "Kocaeli": ["gebze", "dilovası", "izmit", "körfez", "derince", "kartepe", "gölcük", "başiskele", "çayırova", "darıca"],
            "Konya": ["karatay", "selçuklu", "meram"],
            "Adana": ["seyhan", "yüreğir", "çukurova", "sarıçam"],
            "Gaziantep": ["şahinbey", "şehitkamil", "oğuzeli"],
            "Antalya": ["muratpaşa", "kepez", "konyaaltı", "aksu", "döşemealtı"],
            "Tekirdağ": ["çorlu", "ergene", "çerkezköy", "süleymanpaşa", "kapaklı"],
            "Denizli": ["merkezefendi", "pamukkale"],
            "Manisa": ["yunusemre", "şehzadeler", "turgutlu", "akhisar", "soma"],
            "Kayseri": ["melikgazi", "kocasinan", "talas"],
            "Mersin": ["akdeniz", "yenişehir", "toroslar", "mezitli"],
            "Sakarya": ["adapazarı", "serdivan", "erenler", "arifiye"]
        }
        addr_lower = addr_val.lower()
        found_city = ""
        found_district = ""
        
        if short_val and "/" in short_val:
            parts = [p.strip() for p in short_val.split("/")]
            if len(parts) == 2:
                found_district, found_city = parts[0], parts[1]
                
        if not (found_district and found_city):
            for city, districts in cities.items():
                if city.lower() in addr_lower:
                    found_city = city
                    for dist in districts:
                        if dist in addr_lower:
                            found_district = dist.capitalize()
                            break
                    break
            
            if not found_city:
                for city, districts in cities.items():
                    for dist in districts:
                        if dist in addr_lower:
                            found_city = city
                            found_district = dist.capitalize()
                            break
                    if found_city:
                        break
                        
        if found_city:
            if found_district:
                meta["short_address"] = f"{found_district} / {found_city}"
            else:
                meta["short_address"] = found_city
        else:
            meta["short_address"] = short_val if short_val else ""
    else:
        meta["address"] = ""
        meta["short_address"] = ""

    if not meta["instagram"]:
        insta_match = re.search(r'(?:instagram\.com\/)([a-zA-Z0-9_\-\.]+)', homepage_md, re.I)
        if insta_match:
            meta["instagram"] = f"https://instagram.com/{insta_match.group(1).strip()}"

    # Tagline Sanitization
    tagline = meta.get("tagline", "")
    if tagline:
        tagline = re.sub(r'^["\'\-\s\:\=\#\.\,]+|["\'\-\s\:\=\#\.\,]+$', '', tagline).strip()
        tagline = tagline.replace('"', '').replace("'", "")
        if len(tagline) > 35:
            tagline = tagline[:32].strip() + "..."
            
    if not tagline or len(tagline) < 5:
        name_lower = store_name.lower() if store_name else ""
        if any(x in name_lower for x in ["temizlik", "hijyen", "deterjan", "kimya"]):
            tagline = "Temizlikte Güvenilir Çözüm 🧼"
        elif any(x in name_lower for x in ["fırça", "firca", "plastik"]):
            tagline = "Endüstriyel Üretim & Kalite 🛠️"
        elif any(x in name_lower for x in ["gıda", "gida", "market", "toptan"]):
            tagline = "Toptan Gıda & Kurumsal Tedarik 📦"
        elif any(x in name_lower for x in ["ambalaj", "paket"]):
            tagline = "Güvenli Ambalaj Çözümleri 📦"
        else:
            tagline = "Güvenilir Kurumsal İş Ortağınız 🤝"
            
    meta["tagline"] = tagline.replace("B2B", "Kurumsal").replace("b2b", "kurumsal")
    return meta
