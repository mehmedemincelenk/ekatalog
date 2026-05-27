import json

json_path = "/home/mec/Desktop/codes/ekatalog/scripts/b2b_onboarding/n8n_universal_scraper_workflow.json"

print(f"Reading workflow from {json_path}...")
with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

for node in data.get("nodes", []):
    nname = node.get("name")
    
    if nname == "Smart Sitemap Separator":
        node["parameters"] = {
            "mode": "runOnceForEachItem",
            "jsCode": """const xml = $json.data || $json.body || '';
const infoPages = [];
const catalogPages = [];
const matches = typeof xml === 'string' ? xml.match(/<loc>(.*?)<\/loc>/g) : null;

const infoRegex = /(iletisim|contact|ulasin|about|hakkimizda|biz-kimiz|kurumsal|adres|phone|tel)/i;
const catalogRegex = /(urun|product|kategori|category|shop|hizmet|servis|portfolio|item|store|p-)/i;

if (matches) {
  for (let match of matches) {
    let u = match.replace('<loc>', '').replace('</loc>', '').trim();
    if (infoRegex.test(u) || u === $node["Process Store One-by-One"].json.website) {
      infoPages.push(u);
    } else if (catalogRegex.test(u)) {
      catalogPages.push(u);
    }
  }
}

const website = $node["Process Store One-by-One"].json.website || '';
if (infoPages.length === 0 && website) {
  infoPages.push(website);
}
if (catalogPages.length === 0 && website) {
  catalogPages.push(website);
}

return {
  website: website,
  store_name: $node["Process Store One-by-One"].json.company_name,
  infoPages: infoPages.slice(0, 5),
  catalogPages: catalogPages.slice(0, 10)
};"""
        }
        print(f"Fixed: {nname}")
        
    elif nname == "Map Products with Store ID":
        node["parameters"] = {
            "mode": "runOnceForAllItems",
            "jsCode": """const products = $node["Unified AI Store Brain"].json.products || [];
const store_id = $node["Upsert Storefront Metadata"].json.id;

return products.map(p => ({
  json: {
    store_id: store_id,
    name: p.name || "",
    category: p.category || "",
    image_url: p.image_url || "",
    description: p.description || "",
    price: Number(p.price) || 0
  }
}));"""
        }
        print(f"Fixed: {nname}")

print(f"Saving updated workflow JSON back to {json_path}...")
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print("Done!")
