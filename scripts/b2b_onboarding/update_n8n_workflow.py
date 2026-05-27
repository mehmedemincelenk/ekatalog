import json
import urllib.request
import os
import urllib.error

api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YmQ5NTllNC03MTBmLTQ0MWQtYTRhMC04YWNlNGE1OWJmZGIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiYzg2M2FkMGYtNDdlMS00MzFjLThiZDYtMmY2YTI4YTE1YzEwIiwiaWF0IjoxNzc5NzQ0MTMwLCJleHAiOjE3ODIyNzM2MDB9.TjUGwcvYzDQuIXOfhYnUmyh91LjxY--BShIznMbe0z4"
workflow_id = "ADRNOqUbvi7M4ICY"
json_path = "/home/mec/Desktop/codes/ekatalog/scripts/b2b_onboarding/n8n_universal_scraper_workflow.json"

print(f"Reading local workflow from {json_path}...")
with open(json_path, 'r', encoding='utf-8') as f:
    workflow_data = json.load(f)

# Get current server workflow state
url = f"http://localhost:5678/api/v1/workflows/{workflow_id}"
print(f"Fetching current workflow from {url} to preserve custom/UI-configured nodes...")
get_req = urllib.request.Request(
    url,
    headers={"X-N8N-API-KEY": api_key},
    method="GET"
)

server_openai_node = None
try:
    with urllib.request.urlopen(get_req) as res:
        server_data = json.loads(res.read().decode('utf-8'))
        server_nodes = server_data.get("nodes", [])
        for node in server_nodes:
            if node.get("name") == "Unified AI Store Brain":
                server_openai_node = node
                print("Found 'Unified AI Store Brain' node on the server! Preserving its parameters & credentials.")
                break
except Exception as e:
    print(f"Warning: Failed to fetch current server workflow ({e}). Will proceed with local version.")

# Merge/replace in the local nodes list
local_nodes = workflow_data.get("nodes", [])
updated_nodes = []
for node in local_nodes:
    if node.get("name") == "Unified AI Store Brain":
        if server_openai_node:
            print("Successfully merged and preserved the server-side OpenAI node configuration.")
            updated_nodes.append(server_openai_node)
        else:
            print("No server-side OpenAI node found. Keeping the local version.")
            updated_nodes.append(node)
    else:
        updated_nodes.append(node)

# Prepare the PUT payload
payload = {
    "name": workflow_data.get("name"),
    "nodes": updated_nodes,
    "connections": workflow_data.get("connections"),
    "settings": workflow_data.get("settings", {})
}

payload["settings"]["availableInMCP"] = True

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
    print(f"Uploading workflow to {url}...")
    with urllib.request.urlopen(req) as res:
        response = res.read().decode('utf-8')
        print("Success! Workflow updated successfully.")
        print(response[:300] + "...")
except urllib.error.HTTPError as e:
    error_body = e.read().decode('utf-8')
    print(f"HTTP Error {e.code}: {e.reason}")
    print(f"Error Details: {error_body}")
    
    # If it failed, let's retry without it in settings
    print("Retrying without availableInMCP in settings...")
    if "availableInMCP" in payload["settings"]:
        del payload["settings"]["availableInMCP"]
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
            print("Success! Workflow updated successfully without availableInMCP in settings.")
            print(response[:300] + "...")
    except Exception as retry_err:
        print("Retry failed:", retry_err)
except Exception as e:
    print("Failed to update workflow:", e)

