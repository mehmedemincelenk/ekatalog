import urllib.request
import ssl
import sys
import re

ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE

def detect_tech_stack(url):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; TechStackDetector/1.0)"})
        with urllib.request.urlopen(req, timeout=10, context=ssl_ctx) as response:
            html = response.read().decode('utf-8', errors='ignore').lower()
            
            is_wp = False
            if '/wp-content/' in html or '/wp-includes/' in html or 'wp-json' in html:
                is_wp = True
            
            is_react = False
            if 'react' in html or '_next' in html or 'static/js/main.' in html:
                is_react = True
                
            is_vue = False
            if 'vue' in html or 'data-v-' in html:
                is_vue = True
                
            is_wix = False
            if 'wix.com' in html or 'wix-style' in html:
                is_wix = True
            
            is_shopify = False
            if 'shopify.com' in html or 'cdn.shopify.com' in html:
                is_shopify = True

            if is_wp: return "WordPress (✅ Scraper Uyumlu)"
            if is_shopify: return "Shopify (⚠️ Kısmi Uyumlu)"
            if is_wix: return "Wix (❌ Playwright Gerekli)"
            if is_react: return "React/Next.js (❌ Playwright Gerekli)"
            if is_vue: return "Vue.js (❌ Playwright Gerekli)"
            
            return "Statik/Bilinmeyen (❓ Manuel Kontrol)"
            
    except Exception as e:
        return f"Hata: {str(e)}"

if __name__ == "__main__":
    urls = [
        "http://www.mursidoglu.com.tr/",
        "https://aparantemizlik.com.tr/",
        "http://fureltem.com/",
        "https://gultemizlik.com.tr/",
        "https://temizlikmakinesi.com/",
        "https://uraltedarik.com/",
        "https://www.toptansunger.com/",
        "https://endustriyelmutfakservisi.com/",
        "http://ekonomikambalaj.com.tr/",
        "http://meymedikal.com/",
        "https://yildizeliendustriyel.com.tr/"
    ]
    
    print(f"{'Site URL':<40} | {'Teknoloji Durumu'}")
    print("-" * 70)
    for url in urls:
        status = detect_tech_stack(url)
        print(f"{url:<40} | {status}")
