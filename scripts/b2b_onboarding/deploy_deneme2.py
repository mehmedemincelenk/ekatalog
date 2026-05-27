#!/usr/bin/env python3
import json
import urllib.request
import urllib.error
import sys

api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YmQ5NTllNC03MTBmLTQ0MWQtYTRhMC04YWNlNGE1OWJmZGIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiYzg2M2FkMGYtNDdlMS00MzFjLThiZDYtMmY2YTI4YTE1YzEwIiwiaWF0IjoxNzc5NzQ0MTMwLCJleHAiOjE3ODIyNzM2MDB9.TjUGwcvYzDQuIXOfhYnUmyh91LjxY--BShIznMbe0z4"
workflow_id = "TYe8NHX9gd6BpHPj" # DENEME-2 Workflow ID

print("🛠️ Generating clean, native B2B microservice orchestrator for DENEME-2...")

nodes = [
  {
    "parameters": {},
    "id": "e8fb29ba-8a19-4809-b68e-5b1234567907",
    "name": "When clicking ‘Test workflow’",
    "type": "n8n-nodes-base.manualTrigger",
    "typeVersion": 1,
    "position": [100, 360]
  },
  {
    "parameters": {
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
            "condition": "like",
            "keyValue": "%uraltedarik%"
          }
        ]
      }
    },
    "id": "e8fb29ba-8a19-4809-b68e-5b1234567890",
    "name": "Fetch Pending Leads from DB",
    "type": "n8n-nodes-base.supabase",
    "typeVersion": 1,
    "position": [300, 360],
    "credentials": {
      "supabaseApi": {
        "id": "k4tP7D04HQrdKbOY",
        "name": "Supabase account"
      }
    }
  },
  {
    "parameters": {
      "method": "POST",
      "url": "http://192.168.1.103:8000/scrape",
      "sendBody": True,
      "specifyBody": "keypair",
      "bodyParameters": {
        "parameters": [
          {
            "name": "url",
            "value": "={{ $json.website }}"
          },
          {
            "name": "slug",
            "value": "={{ $json.company_name.toLowerCase().replace(/[çğışöü]/g, function(m) { return { 'ç':'c', 'ğ':'g', 'ı':'i', 'ö':'o', 'ş':'s', 'ü':'u' }[m]; }).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') }}"
          }
        ]
      },
      "options": {
        "timeout": 300000
      }
    },
    "id": "c8fb29ba-8a19-4809-b68e-5b1234567801",
    "name": "Execute Diamond Scraper V2",
    "type": "n8n-nodes-base.httpRequest",
    "typeVersion": 4,
    "position": [500, 360]
  },
  {
    "parameters": {
      "method": "POST",
      "url": "https://qadfjqvtpknjojfymxdq.supabase.co/rest/v1/stores?on_conflict=slug",
      "sendHeaders": True,
      "specifyHeaders": "keypair",
      "headerParameters": {
        "parameters": [
          {
            "name": "apikey",
            "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhZGZqcXZ0cGtuam9qZnlteGRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTkxMDU4NCwiZXhwIjoyMDkxNDg2NTg0fQ.arUJRJjyHoqX_GWQUQsXcD6TuNFO8-dNvq9fZzxI_x4"
          },
          {
            "name": "Authorization",
            "value": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhZGZqcXZ0cGtuam9qZnlteGRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTkxMDU4NCwiZXhwIjoyMDkxNDg2NTg0fQ.arUJRJjyHoqX_GWQUQsXcD6TuNFO8-dNvq9fZzxI_x4"
          },
          {
            "name": "Prefer",
            "value": "resolution=merge-duplicates, return=representation"
          }
        ]
      },
      "sendBody": True,
      "contentType": "json",
      "specifyBody": "keypair",
      "bodyParameters": {
        "parameters": [
          {
            "name": "slug",
            "value": "={{ $json.store.slug }}"
          },
          {
            "name": "name",
            "value": "={{ $json.store.name }}"
          },
          {
            "name": "tagline",
            "value": "={{ $json.store.tagline }}"
          },
          {
            "name": "logo_url",
            "value": "={{ $json.store.logo_url }}"
          },
          {
            "name": "phone",
            "value": "={{ $json.store.phone }}"
          },
          {
            "name": "address",
            "value": "={{ $json.store.address }}"
          },
          {
            "name": "carousel_data",
            "value": "={{ { slides: $json.carousel } }}"
          },
          {
            "name": "category_order",
            "value": "={{ $json.categories }}"
          }
        ]
      }
    },
    "id": "c8fb29ba-8a19-4809-b68e-5b1234567803",
    "name": "Upsert Storefront Metadata",
    "type": "n8n-nodes-base.httpRequest",
    "typeVersion": 4,
    "position": [700, 360]
  },
  {
    "parameters": {
      "operation": "delete",
      "tableId": "prods",
      "filterType": "manual",
      "filters": {
        "conditions": [
          {
            "keyName": "store_id",
            "condition": "eq",
            "keyValue": "={{ $('Upsert Storefront Metadata').first().json.id }}"
          }
        ]
      }
    },
    "alwaysOutputData": True,
    "id": "c8fb29ba-8a19-4809-b68e-5b1234567804",
    "name": "Clear Old Products",
    "type": "n8n-nodes-base.supabase",
    "typeVersion": 1,
    "position": [900, 260],
    "credentials": {
      "supabaseApi": {
        "id": "k4tP7D04HQrdKbOY",
        "name": "Supabase account"
      }
    }
  },
  {
    "parameters": {
      "mode": "runOnceForAllItems",
      "jsCode": "const scrapedData = $('Execute Diamond Scraper V2').first().json;\nconst products = scrapedData.products || [];\nconst store_id = $('Upsert Storefront Metadata').first().json.id;\n\nreturn products.map(p => ({\n  json: {\n    store_id: store_id,\n    name: p.name || \"\",\n    category: p.category || \"\",\n    image_url: p.image_url || \"\",\n    description: p.description || \"\",\n    price: Number(p.price) || 0\n  }\n}));"
    },
    "id": "c8fb29ba-8a19-4809-b68e-5b1234567805",
    "name": "Map Products with Store ID",
    "type": "n8n-nodes-base.code",
    "typeVersion": 2,
    "position": [1100, 360]
  },
  {
    "parameters": {
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
    },
    "id": "c8fb29ba-8a19-4809-b68e-5b1234567806",
    "name": "Bulk Inject Products to DB",
    "type": "n8n-nodes-base.supabase",
    "typeVersion": 1,
    "position": [1300, 360],
    "credentials": {
      "supabaseApi": {
        "id": "k4tP7D04HQrdKbOY",
        "name": "Supabase account"
      }
    }
  },
  {
    "parameters": {
      "operation": "update",
      "tableId": "leads",
      "filterType": "manual",
      "filters": {
        "conditions": [
          {
            "keyName": "id",
            "condition": "eq",
            "keyValue": "={{ $('Fetch Pending Leads from DB').first().json.id }}"
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
    },
    "id": "c8fb29ba-8a19-4809-b68e-5b1234567807",
    "name": "Mark Lead as Onboarded",
    "type": "n8n-nodes-base.supabase",
    "typeVersion": 1,
    "position": [1500, 360],
    "credentials": {
      "supabaseApi": {
        "id": "k4tP7D04HQrdKbOY",
        "name": "Supabase account"
      }
    }
  }
]

connections = {
  "When clicking ‘Test workflow’": {
    "main": [
      [
        {
          "node": "Fetch Pending Leads from DB",
          "type": "main",
          "index": 0
        }
      ]
    ]
  },
  "Fetch Pending Leads from DB": {
    "main": [
      [
        {
          "node": "Execute Diamond Scraper V2",
          "type": "main",
          "index": 0
        }
      ]
    ]
  },
  "Execute Diamond Scraper V2": {
    "main": [
      [
        {
          "node": "Upsert Storefront Metadata",
          "type": "main",
          "index": 0
        }
      ]
    ]
  },
  "Upsert Storefront Metadata": {
    "main": [
      [
        {
          "node": "Clear Old Products",
          "type": "main",
          "index": 0
        }
      ]
    ]
  },
  "Clear Old Products": {
    "main": [
      [
        {
          "node": "Map Products with Store ID",
          "type": "main",
          "index": 0
        }
      ]
    ]
  },
  "Map Products with Store ID": {
    "main": [
      [
        {
          "node": "Bulk Inject Products to DB",
          "type": "main",
          "index": 0
        }
      ]
    ]
  },
  "Bulk Inject Products to DB": {
    "main": [
      [
        {
          "node": "Mark Lead as Onboarded",
          "type": "main",
          "index": 0
        }
      ]
    ]
  }
}

payload = {
  "name": "DENEME-2",
  "nodes": nodes,
  "connections": connections,
  "settings": {
    "availableInMCP": True
  }
}

url = f"http://localhost:5678/api/v1/workflows/{workflow_id}"
print(f"Uploading B2B microservice orchestrator to {url}...")
req_data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(
    url,
    data=req_data,
    headers={
        "Content-Type": "application/json",
        "X-N8N-API-KEY": api_key
    },
    method="PUT"
)

try:
    with urllib.request.urlopen(req) as res:
        response = res.read().decode('utf-8')
        print("🎉 Success! DENEME-2 workflow deployed successfully.")
        print(response[:500] + "...")
except urllib.error.HTTPError as e:
    error_body = e.read().decode('utf-8')
    print(f"❌ HTTP Error {e.code}: {e.reason}", file=sys.stderr)
    print(f"Error Details: {error_body}", file=sys.stderr)
    sys.exit(1)
except Exception as e:
    print(f"❌ Failed to update workflow: {e}", file=sys.stderr)
    sys.exit(1)
