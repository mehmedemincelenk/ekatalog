import os
import sys
import re
import time
import subprocess
from urllib.parse import urljoin, urlparse

# Ensure parent directory is in python path
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from config import JINA_BASE

def resolve_url(base_url, relative_url):
    """Göreli URL'leri mutlak (absolute) URL'ye çevirir."""
    if not relative_url:
        return ""
    relative_url = relative_url.strip()
    if relative_url.startswith("http://") or relative_url.startswith("https://"):
        return relative_url
    if relative_url.startswith("//"):
        return "https:" + relative_url
    return urljoin(base_url, relative_url)

def jina_fetch(url, timeout=25, retries=2):
    """Jina AI ile herhangi bir URL'yi temiz markdown'a çevir."""
    jina_url = JINA_BASE + url.strip()
    cmd = [
        "curl", "-sL", jina_url,
        "-H", "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "-H", "Accept: text/plain",
        "-H", "X-With-Images-Summary: true",
        "-H", "X-With-Links-Summary: true",
        "-H", "x-no-cache: true",
        "--max-time", str(timeout)
    ]
    
    for attempt in range(retries + 1):
        try:
            res = subprocess.run(cmd, capture_output=True, text=True, check=True)
            if res.stdout and len(res.stdout) > 200:
                if "Rate limit exceeded" in res.stdout:
                    print(f"  ⏳ [Jina] Rate limit algılandı, bekleniyor... (Deneme {attempt + 1}/{retries + 1})")
                elif any(err in res.stdout for err in ["AssertionFailureError", "Failed to goto", "ERR_CERT_", "readableMessage"]):
                    pass
                else:
                    return res.stdout
        except Exception as e:
            if attempt == retries:
                print(f"  ⚠ Jina hatası [{url[:50]}]: {e}", file=sys.stderr)
        
        if attempt < retries:
            time.sleep(2 + attempt * 2)
            
    return ""

def fetch_url_raw(url, timeout=10):
    """Any URL fetch helper."""
    cmd = [
        "curl", "-sLk", url,
        "-H", "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "--max-time", str(timeout)
    ]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return res.stdout
    except Exception:
        return ""

def discover_pages(homepage_md, base_url):
    """Ana sayfa markdown'ından iç linkleri keşfeder (TÜM sayfaları toplayacak şekilde genişletildi)."""
    # Capture both absolute and relative links in markdown [Text](URL)
    all_links = re.findall(r'\[([^\]]*)\]\(([^)]+)\)', homepage_md)
    footnote_links = re.findall(r'^\[\d+\]:\s*(\S+)', homepage_md, re.M)
    
    combined_urls = []
    
    # Extract clean domain
    domain = re.sub(r'https?://', '', base_url).split('/')[0].split('?')[0]
    clean_domain = domain.replace("www.", "")
    
    for text, url in all_links:
        url_stripped = url.split(" ")[0].strip(" '\"")
        # Skip empty, anchor, script or direct action links
        if not url_stripped or url_stripped.startswith(("#", "javascript:", "mailto:", "tel:")):
            continue
        # Convert relative to absolute url
        abs_url = resolve_url(base_url, url_stripped)
        if abs_url:
            combined_urls.append(abs_url)
            
    for url in footnote_links:
        url_stripped = url.split(" ")[0].strip(" '\"")
        if not url_stripped or url_stripped.startswith(("#", "javascript:", "mailto:", "tel:")):
            continue
        abs_url = resolve_url(base_url, url_stripped)
        if abs_url:
            combined_urls.append(abs_url)

    seen = set()
    high_priority = []
    medium_priority = []
    low_priority = []

    for url in combined_urls:
        url_clean = url.split('?')[0].rstrip('/')
        # Enforce that discovered pages belong to the same domain
        url_domain = re.sub(r'https?://', '', url_clean).split('/')[0].split('?')[0]
        if clean_domain not in url_domain.replace("www.", "") or url_clean in seen:
            continue
        
        seen.add(url_clean)
        url_lower = url_clean.lower()
        
        if any(url_lower.endswith(ext) for ext in [".pdf", ".png", ".jpg", ".jpeg", ".zip", ".docx"]):
            continue

        if any(kw in url_lower for kw in ["urunler", "products", "shop", "katalog", "catalog", "urunlerimiz", "magaza"]):
            high_priority.append(url)
        elif any(kw in url_lower for kw in ["kategori", "category", "urun-kategori", "product-category"]):
            medium_priority.append(url)
        else:
            low_priority.append(url)
            
    return (high_priority + medium_priority + low_priority)[:50]

def get_sitemap_categories(base_url):
    """Sitemap üzerinden B2B kategori index sayfalarını bulur."""
    sitemap_url = urljoin(base_url, "/sitemap.xml")
    print(f"🔍 Sitemap taranıyor: {sitemap_url}...")
    xml_content = fetch_url_raw(sitemap_url)
    if not xml_content:
        return []
    
    urls = re.findall(r'<loc>([^<]+)</loc>', xml_content)
    category_urls = []
    
    for u in urls:
        u_lower = u.lower()
        if "sitemap" in u_lower and any(kw in u_lower for kw in ["category", "kategori", "product-category", "urun-kategori"]):
            print(f"  📂 Kategori alt-sitemapi bulundu: {u}")
            sub_xml = fetch_url_raw(u)
            if sub_xml:
                sub_urls = re.findall(r'<loc>([^<]+)</loc>', sub_xml)
                category_urls.extend(sub_urls)
        elif any(kw in u_lower for kw in ["/kategori/", "/category/", "/urun-kategori/", "/product-category/"]):
            category_urls.append(u)
        elif re.search(r'/[a-z]{2}/\d+-', u_lower) or re.search(r'/\d+-', u_lower):
            if not any(x in u_lower for x in ["contact", "about", "hakkimizda", "iletisim", "sepet", "cart", "checkout", "login", "register", ".jpg", ".png", ".jpeg", ".gif", ".pdf"]):
                category_urls.append(u)
            
    for u in urls:
        u_lower = u.lower()
        if any(kw in u_lower for kw in ["/kategori/", "/category/", "/urun-kategori/", "/product-category/"]):
            if u not in category_urls:
                category_urls.append(u)
        elif re.search(r'/[a-z]{2}/\d+-', u_lower) or re.search(r'/\d+-', u_lower):
            if not any(x in u_lower for x in ["contact", "about", "hakkimizda", "iletisim", "sepet", "cart", "checkout", "login", "register", ".jpg", ".png", ".jpeg", ".gif", ".pdf"]):
                if u not in category_urls:
                    category_urls.append(u)
                
    unique_categories = list(set(category_urls))
    print(f"  ✅ Sitemap üzerinden {len(unique_categories)} adet kategori/katalog adresi keşfedildi.")
    return unique_categories

def discover_pagination_links(page_md, base_url):
    """Markdown sayfa içeriğinden pagination (?pg=2, ?page=2 vb.) linklerini ayıklar."""
    if not page_md:
        return []
    md_links = re.findall(r'\[[^\]]+\]\(([^\s\(\)]+(?:\([^\s\(\)]*\)[^\s\(\)]*)*(?:\?|&)(?:pg|page|p|pgno)=\d+)\)', page_md)
    raw_links = re.findall(r'(https?://[^\s\)]+(?:\?|&)(?:pg|page|p|pgno)=\d+)', page_md)
    
    links = []
    for l in md_links + raw_links:
        abs_l = resolve_url(base_url, l)
        if abs_l not in links:
            links.append(abs_l)
    return links
