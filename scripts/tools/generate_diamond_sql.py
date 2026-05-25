import json
import os
import re

def clean_url(u):
    return u.rstrip('/').replace('https://', '').replace('http://', '').replace('www.', '')

def generate_sql():
    if not os.path.exists('public/diamond_scrape_results.json'):
        print("❌ Scrape results not found!")
        return

    with open('public/diamond_scrape_results.json', 'r') as f:
        results = json.load(f)

    # Load leads to enrich stores with actual contact details
    leads = []
    for path in ['public/leads_gold.json', 'public/leads_silver.json']:
        if os.path.exists(path):
            with open(path, 'r') as f:
                leads.extend(json.load(f))

    url_to_lead = {clean_url(l['website']): l for l in leads if l.get('website')}

    sql_lines = [
        "-- Diamond Standard Batch Injection",
        "-- Total Stores: " + str(len(results)),
        "BEGIN;",
        ""
    ]

    for store in results:
        slug = store['slug']
        cleaned_url = clean_url(store['url'])
        lead = url_to_lead.get(cleaned_url)

        # 1. Company Name Cleaning (Diamond Standard - Remove B2B official title noises)
        lead_name = lead.get('name') if lead else ""
        if lead_name:
            noises = [
                r"\bLTD\.?\s*ŞTİ\.?\b", r"\bLTD\.?\b", r"\bŞTİ\.?\b", r"\bA\.Ş\.?\b", r"\bA\.S\.?\b",
                r"\bLİMİTED\b", r"\bŞİRKETİ\b", r"\bTİCARET\b", r"\bSANAYİ\b", r"\bSAN\b", r"\bTİC\b",
                r"\bGRUP\b", r"\bGROUP\b", r"\bCO\b", r"\bINC\b"
            ]
            for noise in noises:
                lead_name = re.sub(noise, "", lead_name, flags=re.IGNORECASE)
            lead_name = re.sub(r"\s+", " ", lead_name).strip().strip("-").strip()
        
        name = lead_name or store['meta']['title'].split('|')[0].split('-')[0].strip() or slug
        if len(name) > 50: name = name[:47] + "..."

        # 2. Tagline / Slogan Generation (Diamond Standard - Max 20 chars, original and punchy)
        tagline = ""
        if store['meta']['desc']:
            tagline = store['meta']['desc'].strip()
            # Clean out any self-mentions of store name or slug
            tagline = re.sub(re.escape(name), "", tagline, flags=re.IGNORECASE)
            tagline = re.sub(re.escape(slug), "", tagline, flags=re.IGNORECASE)
            tagline = re.sub(r"\s+", " ", tagline).strip()
            tagline = tagline[:20].strip()
        
        if not tagline or len(tagline) < 5:
            # Context-aware default based on slug/name heuristics
            if any(w in name.lower() for w in ["temizlik", "hijyen", "deterjan"]):
                tagline = "Endüstriyel Temizlik"
            elif any(w in name.lower() for w in ["ambalaj", "kutu", "poşet"]):
                tagline = "Toptan Ambalaj"
            elif any(w in name.lower() for w in ["sunger", "firca", "kopuk"]):
                tagline = "Yerli Üretim Sünger"
            else:
                tagline = "Toptan Tedarik"

        # 3. Carousel Data
        slides = []
        for i, img in enumerate(store['carousel']):
            slides.append({
                "id": i + 1,
                "src": img['url'],
                "label": "Profesyonel Çözümler",
                "sub": "En uygun fiyatlarla toptan tedarik",
                "bg": "bg-stone-100"
            })
        
        carousel_json = json.dumps({"enabled": len(slides) > 0, "slides": slides}, ensure_ascii=False).replace("'", "''")
        category_order = json.dumps(store['categories'], ensure_ascii=False).replace("'", "''")
        logo_url = store['logo'] or "https://via.placeholder.com/200x80?text=LOGO"

        # 4. Real Contact Details Enrichment
        phone = lead.get('phone', '') if lead else ''
        address = lead.get('address', store['url']) if lead else store['url']

        # Store Update/Insert SQL Lines
        sql_lines.append(f"-- Processing: {name} ({slug})")
        sql_lines.append(f"INSERT INTO stores (name, slug, logo_url, tagline, carousel_data, category_order, address, phone) ")
        sql_lines.append(f"VALUES ('{name.replace(chr(39), chr(39)+chr(39))}', '{slug}', '{logo_url}', '{tagline.replace(chr(39), chr(39)+chr(39))}', '{carousel_json}', '{category_order}', '{address.replace(chr(39), chr(39)+chr(39))}', '{phone.replace(chr(39), chr(39)+chr(39))}')")
        sql_lines.append(f"ON CONFLICT (slug) DO UPDATE SET ")
        sql_lines.append(f"  logo_url = EXCLUDED.logo_url, tagline = EXCLUDED.tagline, carousel_data = EXCLUDED.carousel_data, category_order = EXCLUDED.category_order, address = EXCLUDED.address, phone = EXCLUDED.phone;")
        
        # 5. Products Update/Insert
        if store['products']:
            store_ref = f"(SELECT id FROM stores WHERE slug = '{slug}')"
            sql_lines.append(f"DELETE FROM prods WHERE store_id = {store_ref};")
            
            # Batch products in chunks of 100 to avoid long query parameters
            for i in range(0, len(store['products']), 100):
                chunk = store['products'][i:i+100]
                values = []
                for p in chunk:
                    p_name = p['name'].replace("'", "''")
                    p_cat = p['category'].replace("'", "''")
                    p_img = p['image'].replace("'", "''")
                    values.append(f"({store_ref}, '{p_name}', '{p_cat}', '{p_img}', '0')")
                
                sql_lines.append(f"INSERT INTO prods (store_id, name, category, image_url, price) VALUES " + ", ".join(values) + ";")
        
        sql_lines.append("")

    sql_lines.append("COMMIT;")

    with open('public/diamond_batch_inject.sql', 'w', encoding='utf-8') as f:
        f.write("\n".join(sql_lines))
    
    print(f"✅ SQL generated: public/diamond_batch_inject.sql ({len(results)} stores with lead enrichment)")

if __name__ == "__main__":
    generate_sql()
