import json

json_path = "/home/mec/Desktop/codes/ekatalog/scripts/b2b_onboarding/n8n_universal_scraper_workflow.json"

print(f"Reading workflow from {json_path}...")
with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

supabase_cred = {
    "supabaseApi": {
        "id": "k4tP7D04HQrdKbOY",
        "name": "Supabase account"
    }
}

openai_cred = {
    "openAiApi": {
        "id": "r2BN2uuCxJXx47PI",
        "name": "OpenAI account"
    }
}

modified_count = 0
for node in data.get("nodes", []):
    ntype = node.get("type")
    nname = node.get("name")
    
    if ntype == "n8n-nodes-base.supabase":
        node["credentials"] = supabase_cred
        print(f"Added Supabase credentials to node: {nname}")
        modified_count += 1
    elif ntype == "n8n-nodes-base.openAi":
        node["credentials"] = openai_cred
        print(f"Added OpenAI credentials to node: {nname}")
        modified_count += 1

if modified_count > 0:
    print(f"Saving updated workflow JSON back to {json_path}...")
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("Done!")
else:
    print("No nodes were modified.")
