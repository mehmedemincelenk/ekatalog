#!/usr/bin/env python3
import http.server
import socketserver
import json
import subprocess
import os
import sys

PORT = 8000

class ScraperHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/scrape':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                target_url = data.get('url')
                slug = data.get('slug')
                
                if not target_url or not slug:
                    self.send_error(400, "Missing 'url' or 'slug' in request body")
                    return
                
                print(f"🚀 Triggering Hacker Scraper V2 for URL: {target_url}, Slug: {slug}")
                
                # Execute hacker_scraper_v2.py as a subprocess
                script_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "hacker_scraper_v2.py")
                cmd = [sys.executable, script_path, "--url", target_url, "--slug", slug]
                
                result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding='utf-8')
                
                if result.returncode != 0:
                    print(f"❌ Scraper script failed with error: {result.stderr}")
                    self.send_response(500)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        "error": "Scraper execution failed",
                        "details": result.stderr
                    }).encode('utf-8'))
                    return
                
                stdout = result.stdout
                start_token = "=== SYSTEM_JSON_OUTPUT_START ==="
                end_token = "=== SYSTEM_JSON_OUTPUT_END ==="
                start_idx = stdout.find(start_token)
                end_idx = stdout.find(end_token)
                
                if start_idx == -1 or end_idx == -1:
                    print("❌ Could not locate JSON output boundaries in scraper stdout")
                    self.send_response(500)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        "error": "Failed to parse scraper output: missing JSON delimiters",
                        "stdout_preview": stdout[:1000]
                    }).encode('utf-8'))
                    return
                
                json_str = stdout[start_idx + len(start_token):end_idx].strip()
                parsed_catalog = json.loads(json_str)
                
                # Send back the perfect JSON payload
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(parsed_catalog, ensure_ascii=False, indent=2).encode('utf-8'))
                print("🎉 Successfully crawled, structured and returned B2B storefront catalog!")
                
            except json.JSONDecodeError:
                self.send_error(400, "Invalid JSON body")
            except Exception as e:
                print(f"❌ Exception in handler: {e}")
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": str(e)
                }).encode('utf-8'))
        else:
            self.send_error(404, "Not Found")

def run():
    # Use socketserver to allow reusing address to prevent "address already in use" errors on restarts
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), ScraperHandler) as httpd:
        print(f"🌐 Resilient Scraper Microservice running on port {PORT}...")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down microservice server.")

if __name__ == '__main__':
    run()
