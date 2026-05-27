import os
import socket

# Tüm network soketleri, DNS aramaları ve HTTP istekleri için 3.0s kesin global zaman aşımı
socket.setdefaulttimeout(3.0)

def load_env():
    """Script veya workspace dizinlerindeki .env dosyasını otomatik yükler."""
    possible_paths = [
        os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env"),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".env"),
    ]
    for path in possible_paths:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        v_val = v.strip()
                        if v_val.startswith('"') and v_val.endswith('"'):
                            v_val = v_val[1:-1]
                        elif v_val.startswith("'") and v_val.endswith("'"):
                            v_val = v_val[1:-1]
                        os.environ[k.strip()] = v_val
            break

load_env()
OPENAI_KEY = os.getenv("OPENAI_API_KEY", "")
JINA_BASE = "https://r.jina.ai/"

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://qadfjqvtpknjojfymxdq.supabase.co")
SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", os.getenv("SERVICE_ROLE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhZGZqcXZ0cGtuam9qZnlteGRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTkxMDU4NCwiZXhwIjoyMDkxNDg2NTg0fQ.arUJRJjyHoqX_GWQUQsXcD6TuNFO8-dNvq9fZzxI_x4"))

# Central Shared Utilities (Diamond Standard 💎)
import json
import socket
import urllib.request
import urllib.error
import re
import concurrent.futures

def make_supabase_request(url, method="GET", data=None):
    """Supabase REST API call helper with central error handling and authorization headers."""
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }
    req_data = None
    if data is not None:
        req_data = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=5) as res:
            body = res.read().decode("utf-8")
            if not body or not body.strip():
                return None
            return json.loads(body)
    except Exception as e:
        print(f"  ⚠ Supabase API Hatası: {e}")
        return None

def is_website_alive(url):
    """Sitenin aktif ve hızlıca yanıt verip vermediğini doğrular (Curl ile asma/kilitlenmeleri kesin önler)."""
    import subprocess
    try:
        # Curl ile hızlıca HTTP durum kodunu al
        cmd = [
            "curl", "-o", "/dev/null", "-s", "-w", "%{http_code}",
            "--connect-timeout", "3", "--max-time", "4", "-k", "-L", url
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode == 0:
            code = res.stdout.strip()
            # 2xx veya 3xx (yönlendirme) kodları sitenin aktif olduğunu gösterir
            return code.startswith("2") or code.startswith("3")
        return False
    except Exception:
        return False


def check_website_diagnostics(url):
    """Sitenin aktifliğini, hızını, mobil uyumluluğunu, SSL sertifikasını ve diğer teknik kriterleri tek adımda Curl ile teşhis eder."""
    import subprocess
    import re
    
    result = {
        "is_alive": False,
        "http_code": "000",
        "time_total": 0.0,
        "is_ssl": False,
        "issues": []
    }
    
    try:
        cmd = [
            "curl", "-s", "-k", "-L",
            "--connect-timeout", "3",
            "--max-time", "5",
            "-w", "\nHTTP_STATUS:%{http_code}\nTIME_TOTAL:%{time_total}\nURL_EFFECTIVE:%{url_effective}",
            url
        ]
        res = subprocess.run(cmd, capture_output=True, text=True, errors="ignore")
        if res.returncode != 0 or not res.stdout:
            result["issues"].append("Web sitesi aktif değil / sunucu veya DNS bağlantı hatası yaşanıyor.")
            return result
            
        stdout = res.stdout
        
        # Son 3 satırı ayrıştır
        lines = stdout.splitlines()
        http_code = "000"
        time_total = 0.0
        url_effective = url
        
        body_lines = []
        for line in lines:
            if line.startswith("HTTP_STATUS:"):
                http_code = line.split(":", 1)[1].strip()
            elif line.startswith("TIME_TOTAL:"):
                try:
                    time_total = float(line.split(":", 1)[1].strip())
                except:
                    pass
            elif line.startswith("URL_EFFECTIVE:"):
                url_effective = line.split(":", 1)[1].strip()
            else:
                body_lines.append(line)
                
        html_text = "\n".join(body_lines)
        result["http_code"] = http_code
        result["time_total"] = time_total
        
        # Durum kodu kontrolü
        if not (http_code.startswith("2") or http_code.startswith("3")):
            result["issues"].append(f"Web sitenize şu anda girilemiyor veya sayfa bulunamıyor (Bağlantı kesilmiş görünüyor).")
            return result
            
        result["is_alive"] = True
        
        # SSL / Güvenlik Kontrolü
        if url_effective.lower().startswith("https://") and not url.lower().startswith("http://localhost"):
            result["is_ssl"] = True
        else:
            result["issues"].append("Sitenizde güvenlik sertifikası (güvenli kilit simgesi) aktif değil, bu durum müşterilerinizde 'güvensiz site' endişesi oluşturabilir.")
            
        # Performans / Hız Kontrolü
        if time_total > 1.8:
            result["issues"].append("Siteniz biraz yavaş açılıyor. Müşterileriniz ürünlerinize ulaşmaya çalışırken beklemekten sıkılıp sayfayı kapatabilir.")
            
        # Mobil Uyum Kontrolü (HTML analizi)
        html_lower = html_text.lower()
        
        # meta viewport etiketi kontrolü
        if '<meta name="viewport"' not in html_lower and "<meta name='viewport'" not in html_lower and 'content="width=device-width' not in html_lower:
            result["issues"].append("Siteniz cep telefonlarıyla tam uyumlu değil. Telefonlardan bakıldığında yazılar ve resimler çok küçük görünüyor, ekran kayıyor.")
            
        # eski nesil frameset / frame kullanımı
        if "<frameset" in html_lower or "<frame " in html_lower:
            result["issues"].append("Sitenizin altyapısı oldukça eski kalmış; günümüz telefonlarında ve Google aramalarında görünmenizi zorlaştırıyor.")
            
        # table sayfa yerleşimi kontrolü (devasa sayıda table)
        table_count = html_lower.count("<table")
        if table_count > 8 and "grid" not in html_lower and "flex" not in html_lower:
            result["issues"].append("Siteniz eski tarz tablolarla tasarlanmış. Bu yüzden telefonlarda ekranın dışına taşıyor ve müşterilerinizin ürünleri incelemesini zorlaştırıyor.")
            
        # Arama Motoru Optimizasyonu (SEO) Eksikleri
        if "<title" not in html_lower or "<title></title>" in html_lower or re.search(r'<title>\s*</title>', html_lower):
            result["issues"].append("Sitenizin Google'a kendisini tanıttığı başlık alanı eksik veya boş. Bu durum Google'da müşterilerinizin sizi bulmasını çok zorlaştırır.")
            
        if 'name="description"' not in html_lower and "name='description'" not in html_lower:
            result["issues"].append("Sitenizin Google arama sonuçlarındaki tanıtım yazısı (açıklama) eksik. Google aramalarında dükkanınızın altında açıklayıcı bir bilgi görünmüyor.")
            
    except Exception as e:
        result["issues"].append(f"Web sitesi teknik kontrol sırasında küçük bir hata verdi: {e}")
        
    return result



def is_strict_product_supplier(company_name, website):
    """Sadece fiziksel ürün satan firmaları kabul eder, saf hizmet şirketlerini filtreler."""
    def clean(val):
        val = val.lower()
        val = val.replace("i\u0307", "i").replace("i̇", "i")
        val = val.replace("ı", "i").replace("ş", "s").replace("ğ", "g").replace("ü", "u").replace("ö", "o").replace("ç", "c")
        return val
        
    text = clean(f"{company_name} {website}")
    
    # Hizmet kelimeleri varsa elenir
    service_keywords = [
        "hizmet", "hizmetleri", "sirketi", "yikama", 
        "baca", "hali", "servis", "temizlik sirketi",
        "apartman temizli", "ofis temizli", "ev temizli", "ilaclama", "dagcilik"
    ]
    if any(clean(k) in text for k in service_keywords):
        return False
        
    # Fiziksel ürün anahtar kelimeleri (B2B Toptan, Ambalaj, Eldiven, Mutfak, Kozmetik, Temizlik Ürünleri)
    product_keywords = [
        "urun", "ambalaj", "tedarik", "krem", "pasta", "kimya", "deterjan", "toptan", "market", 
        "firca", "plastik", "imalat", "eldiven", "mutfak", "ekipman", "gida", "sarf", "hijyen", 
        "kagit", "vindex", "temizlik urunleri", "bez", "sunger", "mop"
    ]
    return any(clean(k) in text for k in product_keywords)

def extract_slug(website, metadata=None):
    """Web sitesi adresinden temiz, güvenli ve şema bağımsız dükkan slug'ı üretir."""
    slug = (metadata or {}).get("slug", "") if metadata else ""
    if not slug:
        clean_domain = re.sub(r'^https?://', '', website, flags=re.IGNORECASE)
        clean_domain = re.sub(r'^www\.', '', clean_domain, flags=re.IGNORECASE)
        clean_domain = clean_domain.split('/')[0].split('?')[0].split(':')[0]
        parts = clean_domain.split('.')
        slug = parts[0].lower() if parts else "store"
    return slug

