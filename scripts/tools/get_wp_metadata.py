import json
import urllib.request
import ssl
from concurrent.futures import ThreadPoolExecutor

ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE

def get_meta(url):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=5, context=ssl_ctx) as res:
            html = res.read().decode('utf-8', errors='ignore').lower()
            
            # Title bul
            import re
            title = re.search(r'<title>(.*?)</title>', html)
            title = title.group(1) if title else ""
            
            # Description bul
            desc = re.search(r'<meta name="description" content="(.*?)"', html)
            desc = desc.group(1) if desc else ""
            
            return {"url": url, "title": title.strip(), "description": desc.strip()}
    except:
        return {"url": url, "title": "Error", "description": ""}

def main():
    with open('public/tech_stacks.json', 'r') as f:
        tech_map = json.load(f)
    
    wp_urls = [url for url, tech in tech_map.items() if tech == "WordPress"]
    print(f"📡 {len(wp_urls)} WordPress sitesinden metadata toplanıyor...")
    
    with ThreadPoolExecutor(max_workers=30) as executor:
        results = list(executor.map(get_meta, wp_urls))
    
    with open('public/wp_metadata.json', 'w') as f:
        json.dump(results, f, indent=2)
    print("✅ Metadata 'public/wp_metadata.json' dosyasına kaydedildi.")

if __name__ == "__main__":
    main()
