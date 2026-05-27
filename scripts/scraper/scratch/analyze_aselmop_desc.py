import urllib.request
import ssl
import json
import re

context = ssl._create_unverified_context()
url = "https://aselmop.com/wp-json/wp/v2/product?per_page=100"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})

try:
    with urllib.request.urlopen(req, context=context) as r:
        data = json.loads(r.read().decode("utf-8"))
        for item in data:
            title = item.get("title", {}).get("rendered", "")
            if "Mops" in title or "Mop" in title:
                print(f"TITLE: {title}")
                print("CONTENT:")
                print(item.get("content", {}).get("rendered", "")[:300])
                print("EXCERPT:")
                print(item.get("excerpt", {}).get("rendered", "")[:300])
                print("-" * 50)
except Exception as e:
    print("Error:", e)
