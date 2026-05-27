import json

json_path = "/home/mec/Desktop/codes/ekatalog/scripts/b2b_onboarding/n8n_universal_scraper_workflow.json"

print(f"Reading workflow from {json_path}...")
with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

for node in data.get("nodes", []):
    nname = node.get("name")
    
    if nname == "Fetch Pending Leads from DB":
        node["parameters"] = {
            "operation": "getAll",
            "tableId": "leads",
            "returnAll": False,
            "limit": 1,
            "filterType": "manual",
            "matchType": "allFilters",
            "filters": {
                "conditions": [
                    {
                        "keyName": "onboarded",
                        "condition": "eq",
                        "keyValue": "false"
                    },
                    {
                        "keyName": "website",
                        "condition": "neq",
                        "keyValue": ""
                    }
                ]
            }
        }
        print(f"Fixed parameters for: {nname}")
        
    elif nname == "Upsert Storefront Metadata":
        node["parameters"] = {
            "operation": "create",
            "tableId": "stores",
            "dataToSend": "defineBelow",
            "fieldsUi": {
                "fieldValues": [
                    {
                        "fieldId": "name",
                        "fieldValue": "={{$node[\"Smart Sitemap Separator\"].json.store_name}}"
                    },
                    {
                        "fieldId": "slogan",
                        "fieldValue": "={{$json.metadata.slogan}}"
                    },
                    {
                        "fieldId": "description",
                        "fieldValue": "={{$json.metadata.about_us}}"
                    },
                    {
                        "fieldId": "address",
                        "fieldValue": "={{$json.metadata.address}}"
                    },
                    {
                        "fieldId": "phone",
                        "fieldValue": "={{$json.metadata.phone}}"
                    },
                    {
                        "fieldId": "logo_url",
                        "fieldValue": "={{$json.metadata.logo_url}}"
                    },
                    {
                        "fieldId": "website",
                        "fieldValue": "={{$node[\"Smart Sitemap Separator\"].json.website}}"
                    }
                ]
            }
        }
        print(f"Fixed parameters for: {nname}")
        
    elif nname == "Bulk Inject Products to DB":
        node["parameters"] = {
            "operation": "create",
            "tableId": "prods",
            "dataToSend": "defineBelow",
            "fieldsUi": {
                "fieldValues": [
                    {
                        "fieldId": "store_id",
                        "fieldValue": "={{$json.store_id}}"
                    },
                    {
                        "fieldId": "name",
                        "fieldValue": "={{$json.name}}"
                    },
                    {
                        "fieldId": "category",
                        "fieldValue": "={{$json.category}}"
                    },
                    {
                        "fieldId": "image_url",
                        "fieldValue": "={{$json.image_url}}"
                    },
                    {
                        "fieldId": "description",
                        "fieldValue": "={{$json.description}}"
                    },
                    {
                        "fieldId": "price",
                        "fieldValue": "={{$json.price}}"
                    }
                ]
            }
        }
        print(f"Fixed parameters for: {nname}")
        
    elif nname == "Mark Lead as Onboarded":
        node["parameters"] = {
            "operation": "update",
            "tableId": "leads",
            "filterType": "manual",
            "filters": {
                "conditions": [
                    {
                        "keyName": "id",
                        "condition": "eq",
                        "keyValue": "={{$node[\"Process Store One-by-One\"].json.id}}"
                    }
                ]
            },
            "dataToSend": "defineBelow",
            "fieldsUi": {
                "fieldValues": [
                    {
                        "fieldId": "onboarded",
                        "fieldValue": "true"
                    }
                ]
            }
        }
        print(f"Fixed parameters for: {nname}")

print(f"Saving updated workflow JSON back to {json_path}...")
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print("Done!")
