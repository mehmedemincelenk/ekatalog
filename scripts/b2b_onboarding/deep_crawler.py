#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
DIAMOND CRAWLER: Platform-Agnostic Recursive B2B Crawler
------------------------------------------------------
Recursively crawls a domain's internal links, scrapes all text, logo candidates,
widescreen/horizontal images, and product entities.
Outputs a clean raw JSON dump for AI curation.
"""

import os
import sys
import json
import re
import struct
from urllib.parse import urlparse, urljoin
import requests
from html.parser import HTMLParser

# --- 1. HTML PARSING UTILS ---

class GenericLinkAndImageParser(HTMLParser):
    """Parses internal links, images (src, alt), and text content from HTML."""
    def __init__(self, base_url):
        super().__init__()
        self.base_url = base_url
        self.base_href = base_url
        self.domain = urlparse(base_url).netloc
        self.internal_links = set()
        self.images = []
        self.headings = []
        self.paragraphs = []
        self.page_title = ""
        self.meta_tags = {}
        self.json_ld = []
        
        # State tracking
        self.current_tag = ""
        self.in_title = False
        self.in_heading = False
        self.in_paragraph = False
        self.current_heading_level = 0
        self.current_text = []
        
        self.in_script = False
        self.current_script_type = ""
        self.script_content = []

    def handle_starttag(self, tag, attrs):
        self.current_tag = tag
        attr_dict = dict(attrs)
        
        # 0. Base href tracking
        if tag == 'base' and 'href' in attr_dict:
            href = attr_dict['href'].strip()
            self.base_href = urljoin(self.base_url, href)
            
        # 1. Meta tags tracking (Open Graph, generic tags)
        elif tag == 'meta':
            name = attr_dict.get('name', attr_dict.get('property', '')).lower()
            content = attr_dict.get('content', '')
            if name and content:
                self.meta_tags[name] = content

        # 2. JSON-LD scripts tracking
        elif tag == 'script':
            script_type = attr_dict.get('type', '').lower()
            if 'application/ld+json' in script_type:
                self.in_script = True
                self.current_script_type = script_type
                self.script_content = []
            
        # 3. Links extraction
        elif tag == 'a' and 'href' in attr_dict:
            href = attr_dict['href'].strip()
            # Resolve relative URLs against base_href
            full_url = urljoin(self.base_href, href)
            parsed_url = urlparse(full_url)
            
            # Keep only internal links (same domain) and skip anchors/queries if they point to the same page
            if parsed_url.netloc == self.domain:
                # Normalize by stripping fragment and queries that don't change content (like ?replytocom)
                clean_url = parsed_url._replace(fragment='', query='').geturl()
                # Exclude static assets or direct downloads
                if not any(clean_url.lower().endswith(ext) for ext in ['.jpg', '.png', '.jpeg', '.pdf', '.zip', '.docx', '.xlsx', '.svg']):
                    # Skip SEO region pages, team members, blog details, and references to keep queue relevant
                    if not any(pat in clean_url.lower() for pat in ['/bolge/', '/ekip/', '/referans/']):
                        self.internal_links.add(clean_url)
                    
        # 4. Modern/Lazy-Loaded Images extraction
        elif tag == 'img':
            src = None
            # Check lazy-loading and responsive image tags in order of quality
            for attr in ['data-src', 'data-lazy-src', 'data-original', 'srcset', 'data-srcset', 'src']:
                if attr in attr_dict and attr_dict[attr].strip():
                    val = attr_dict[attr].strip()
                    if attr in ['srcset', 'data-srcset']:
                        # Parse responsive srcset to extract the highest resolution image
                        candidates = []
                        for part in val.split(','):
                            part = part.strip()
                            if not part:
                                continue
                            subparts = part.split()
                            if not subparts:
                                continue
                            img_url = subparts[0]
                            width = 0
                            if len(subparts) > 1:
                                match = re.match(r'(\d+)w', subparts[1])
                                if match:
                                    width = int(match.group(1))
                            candidates.append((img_url, width))
                        if candidates:
                            candidates.sort(key=lambda x: x[1], reverse=True)
                            src = candidates[0][0]
                    else:
                        src = val
                    if src:
                        break
            
            if src:
                full_src = urljoin(self.base_href, src)
                alt = attr_dict.get('alt', '').strip()
                title = attr_dict.get('title', '').strip()
                self.images.append({
                    'src': full_src,
                    'alt': alt,
                    'title': title,
                    'class': attr_dict.get('class', '')
                })
            
        # 5. Text structures tracking
        elif tag == 'title':
            self.in_title = True
        elif tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            self.in_heading = True
            self.current_heading_level = int(tag[1])
        elif tag == 'p':
            self.in_paragraph = True

    def handle_data(self, data):
        cleaned_data = data.strip()
        if not cleaned_data:
            return
            
        if self.in_title:
            self.page_title = (self.page_title + " " + cleaned_data).strip()
        elif self.in_heading:
            self.current_text.append(cleaned_data)
        elif self.in_paragraph:
            self.current_text.append(cleaned_data)
        elif self.in_script:
            self.script_content.append(data)

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False
        elif tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            self.in_heading = False
            heading_text = " ".join(self.current_text).strip()
            if heading_text:
                self.headings.append({
                    'level': self.current_heading_level,
                    'text': heading_text
                })
            self.current_text = []
        elif tag == 'p':
            self.in_paragraph = False
            para_text = " ".join(self.current_text).strip()
            if para_text:
                self.paragraphs.append(para_text)
            self.current_text = []
        elif tag == 'script':
            self.in_script = False
            if 'application/ld+json' in self.current_script_type:
                full_script = "".join(self.script_content).strip()
                try:
                    parsed_json = json.loads(full_script)
                    self.json_ld.append(parsed_json)
                except Exception:
                    pass
            self.script_content = []
            self.current_script_type = ""
        self.current_tag = ""

# --- 2. FAST IMAGE DIMENSION DETECTOR (STREAMING HEADERS) ---

def get_image_size(url):
    """
    Fetches the first 1KB of the image and parses its header to extract width and height.
    Supports PNG, JPEG, GIF, and WEBP. Extremely fast, doesn't load the full file.
    """
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    try:
        # Request only the first 1024 bytes
        response = requests.get(url, headers=headers, stream=True, timeout=5)
        response.raise_for_status()
        data = response.raw.read(1024)
        
        size = len(data)
        if size < 24:
            return None

        # 1. PNG
        if data.startswith(b'\x89PNG\r\n\x1a\n'):
            w, h = struct.unpack('>ii', data[16:24])
            return int(w), int(h)
            
        # 2. GIF
        elif data.startswith(b'GIF87a') or data.startswith(b'GIF89a'):
            w, h = struct.unpack('<HH', data[6:10])
            return int(w), int(h)
            
        # 3. JPEG
        elif data.startswith(b'\xff\xd8'):
            # Parse JPEG segments
            idx = 2
            while idx < size:
                # Marker
                if data[idx] != 0xFF:
                    break
                marker = data[idx+1]
                if marker == 0xD9 or marker == 0xDA: # End of image or start of scan
                    break
                
                # Length of segment
                seg_len = struct.unpack('>H', data[idx+2:idx+4])[0]
                # Check for SOF markers (SOF0 to SOF15, except SOF4, SOF8, SOF12)
                if marker in [0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF]:
                    h, w = struct.unpack('>HH', data[idx+5:idx+9])
                    return int(w), int(h)
                
                idx += 2 + seg_len
            
        # 4. WEBP
        elif data.startswith(b'RIFF') and data[8:12] == b'WEBP':
            # Check format type
            vp8_type = data[12:16]
            if vp8_type == b'VP8 ':
                # Lossy WebP
                w, h = struct.unpack('<HH', data[26:30])
                # Mask out top two bits which are scale factors
                return int(w & 0x3FFF), int(h & 0x3FFF)
            elif vp8_type == b'VP8L':
                # Lossless WebP
                b1, b2, b3, b4 = struct.unpack('<BBBB', data[21:25])
                w = 1 + (((b2 & 0x3F) << 8) | b1)
                h = 1 + (((b4 & 0xF) << 10) | (b3 << 2) | ((b2 & 0xC0) >> 6))
                return int(w), int(h)
            elif vp8_type == b'VP8X':
                # Extended WebP
                w_bytes = data[24:27] + b'\x00'
                h_bytes = data[27:30] + b'\x00'
                w = struct.unpack('<I', w_bytes)[0] + 1
                h = struct.unpack('<I', h_bytes)[0] + 1
                return int(w), int(h)
                
        return None
    except Exception as e:
        # Silently fail, returns None
        return None

# --- 3. RECURSIVE DOMAIN CRAWLER ---

class DeepCrawler:
    def __init__(self, start_url, max_pages=100, max_depth=3):
        self.start_url = start_url
        self.max_pages = max_pages
        self.max_depth = max_depth
        self.visited_urls = set()
        self.pages_data = []
        self.all_images = {}  # src -> data mapping to deduplicate and cache sizes
        
    def crawl(self):
        print(f"[*] Starting deep recursive crawl for: {self.start_url}")
        queue = [(self.start_url, 0)] # (url, current_depth)
        
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        
        while queue and len(self.visited_urls) < self.max_pages:
            url, depth = queue.pop(0)
            
            if url in self.visited_urls:
                continue
                
            if depth > self.max_depth:
                continue
                
            print(f"[*] Crawling page {len(self.visited_urls)+1}/{self.max_pages} [Depth {depth}]: {url}")
            self.visited_urls.add(url)
            
            try:
                response = requests.get(url, headers=headers, timeout=10)
                if response.status_code != 200:
                    print(f"[!] Skip {url} (HTTP {response.status_code})")
                    continue
                    
                content_type = response.headers.get('Content-Type', '')
                if 'text/html' not in content_type:
                    print(f"[!] Skip {url} (Non-HTML Content-Type: {content_type})")
                    continue
                    
                html = response.text
                parser = GenericLinkAndImageParser(url)
                parser.feed(html)
                
                # Record page details
                self.pages_data.append({
                    'url': url,
                    'title': parser.page_title,
                    'headings': parser.headings,
                    'paragraphs': parser.paragraphs,
                    'meta_tags': parser.meta_tags,
                    'json_ld': parser.json_ld
                })
                
                # Process discovered internal links
                for link in parser.internal_links:
                    if link not in self.visited_urls:
                        queue.append((link, depth + 1))
                        
                # Process discovered images
                for img in parser.images:
                    src = img['src']
                    if src not in self.all_images:
                        self.all_images[src] = {
                            'src': src,
                            'alt': img['alt'],
                            'title': img['title'],
                            'class': img['class'],
                            'pages_found_on': [url]
                        }
                    else:
                        if url not in self.all_images[src]['pages_found_on']:
                            self.all_images[src]['pages_found_on'].append(url)
                            
            except Exception as e:
                print(f"[x] Error crawling {url}: {e}")
                
        # Resolve sizes of unique images
        print(f"\n[*] Resolving aspect-ratios for {len(self.all_images)} unique images...")
        resolved_images = []
        for idx, (src, img_data) in enumerate(self.all_images.items()):
            if idx % 10 == 0:
                print(f"  Processed {idx}/{len(self.all_images)} images...")
            
            dimensions = get_image_size(src)
            img_data['width'] = dimensions[0] if dimensions else None
            img_data['height'] = dimensions[1] if dimensions else None
            img_data['is_horizontal'] = (dimensions[0] > dimensions[1]) if dimensions else False
            resolved_images.append(img_data)
            
        return self.pages_data, resolved_images

# --- 4. MAIN ENTRY POINT ---

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 deep_crawler.py <slug> <url>")
        sys.exit(1)
        
    slug = sys.argv[1].strip()
    url = sys.argv[2].strip()
    
    # Normalize start URL
    if not url.startswith('http://') and not url.startswith('https://'):
        url = 'https://' + url
        
    crawler = DeepCrawler(url, max_pages=100, max_depth=3)
    pages, images = crawler.crawl()
    
    # Prepare B2B structured raw dump
    raw_dump = {
        'slug': slug,
        'url': url,
        'crawled_pages_count': len(pages),
        'total_images_found': len(images),
        'pages': pages,
        'images': images
    }
    
    # Save output
    output_dir = 'public/scraped_dumps'
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, f"{slug}_raw.json")
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(raw_dump, f, ensure_ascii=False, indent=2)
        
    print(f"\n[+] Raw scraping completed for {slug}!")
    print(f"[+] Total pages crawled: {len(pages)}")
    print(f"[+] Total unique images extracted: {len(images)}")
    print(f"[+] Raw JSON output saved to: {output_path}")

if __name__ == '__main__':
    main()
