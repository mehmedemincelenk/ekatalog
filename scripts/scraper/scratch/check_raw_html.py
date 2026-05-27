import urllib.request
import re

url = "https://zaferendustriyelmutfak.com/markalarimiz/"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=10) as r:
        html = r.read().decode('utf-8', errors='ignore')
        imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html)
        print("Found images:")
        for img in imgs:
            print(img)
except Exception as e:
    print("Error:", e)
