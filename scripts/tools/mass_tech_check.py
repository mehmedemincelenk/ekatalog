import urllib.request
import ssl
import json
import glob
import os
from concurrent.futures import ThreadPoolExecutor
import re

# SSL bypass for legacy/broken sites
ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE

def detect_tech_stack(url):
    if not url or not url.startswith('http'):
        return "Invalid"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"})
        with urllib.request.urlopen(req, timeout=5, context=ssl_ctx) as response:
            html = response.read().decode('utf-8', errors='ignore').lower()
            
            if '/wp-content/' in html or '/wp-includes/' in html or 'wp-json' in html:
                return "WordPress"
            if 'shopify.com' in html or 'cdn.shopify.com' in html:
                return "Shopify"
            if 'wix.com' in html or 'wix-style' in html:
                return "Wix"
            if 'react' in html or '_next' in html or 'static/js/main.' in html:
                return "React/Next.js"
            if 'vue' in html or 'data-v-' in html:
                return "Vue.js"
            
            return "Static/Other"
    except Exception:
        return "Connection Error"

def process_all():
    urls = []
    # Load all leads files
    for filepath in glob.glob('public/leads_*.json'):
        with open(filepath, 'r') as f:
            try:
                data = json.load(f)
                for entry in data:
                    site = entry.get('website')
                    if site and site.strip():
                        urls.append(site.strip())
            except:
                continue
    
    urls = list(set(urls)) # Deduplicate
    print(f"🔍 {len(urls)} benzersiz site analiz ediliyor...")
    
    results = {"WordPress": 0, "Shopify": 0, "Wix": 0, "React/Next.js": 0, "Vue.js": 0, "Static/Other": 0, "Connection Error": 0, "Invalid": 0}
    tech_map = {}
    
    print(f"🚀 Başlatılıyor... (50 workers)")
    with ThreadPoolExecutor(max_workers=50) as executor:
        outcomes = list(executor.map(detect_tech_stack, urls))
        
    for url, outcome in zip(urls, outcomes):
        results[outcome] = results.get(outcome, 0) + 1
        tech_map[url] = outcome
        
    # Kaydet
    with open('public/tech_stacks.json', 'w') as f:
        json.dump(tech_map, f, indent=2)
    print(f"\n✅ Veriler 'public/tech_stacks.json' dosyasına kaydedildi.")
        
    print("\n📊 TEKNOLOJİ ÖZETİ:")
    print("-" * 30)
    for tech, count in sorted(results.items(), key=lambda x: -x[1]):
        percentage = (count / len(urls)) * 100
        print(f"{tech:<20}: {count:>5} (%{percentage:.1f})")
    
    # WP olanları listele (mevcut scriptle çekilebilir)
    wp_ready = results.get("WordPress", 0)
    print(f"\n✅ Mevcut Scraper ile HEMEN çekilebilir: {wp_ready} site")
    print(f"❌ Playwright/Universal Scraper GEREKEN: {len(urls) - wp_ready - results.get('Connection Error', 0)} site")

if __name__ == "__main__":
    process_all()
