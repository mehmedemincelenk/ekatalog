import os
import sys
import re
import io
import urllib.request
from urllib.parse import urljoin
from PIL import Image

# Ensure parent directory is in python path
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from core.crawler import resolve_url

def generate_unified_logos_banner(logo_urls, output_path, title="Referanslarımız"):
    """
    Logo URL listesini indirir ve tek bir şık, minimal, birleştirilmiş banner görseli oluşturur.
    En-boy oranlarını korur, logoları ortalar ve beyaz arka plan üzerine padding ile yerleştirir.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    downloaded_images = []
    for url in logo_urls:
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=5) as res:
                img_data = res.read()
                img = Image.open(io.BytesIO(img_data))
                if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                    img = img.convert('RGBA')
                else:
                    img = img.convert('RGB')
                downloaded_images.append(img)
        except Exception:
            continue
            
    if not downloaded_images:
        return False
        
    max_w, max_h = 160, 80
    resized_images = []
    for img in downloaded_images:
        w, h = img.size
        ratio = min(max_w / w, max_h / h)
        new_w, new_h = int(w * ratio), int(h * ratio)
        new_w = max(1, new_w)
        new_h = max(1, new_h)
        img_resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        resized_images.append(img_resized)
        
    num_logos = len(resized_images)
    canvas_w = 1200
    if num_logos <= 6:
        canvas_h = 240
        canvas = Image.new("RGBA", (canvas_w, canvas_h), (255, 255, 255, 255))
        total_logo_w = sum(img.size[0] for img in resized_images)
        remaining_space = canvas_w - total_logo_w
        spacing = remaining_space / (num_logos + 1)
        
        current_x = spacing
        for img in resized_images:
            w, h = img.size
            y = int((canvas_h - h) / 2)
            logo_bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
            if img.mode == 'RGBA':
                logo_bg.alpha_composite(img)
                paste_img = logo_bg.convert('RGB')
            else:
                paste_img = img.convert('RGB')
                
            canvas.paste(paste_img, (int(current_x), y))
            current_x += w + spacing
    else:
        logos_per_row = 5
        rows = (num_logos + logos_per_row - 1) // logos_per_row
        row_h = 160
        canvas_h = row_h * rows + 80
        canvas = Image.new("RGBA", (canvas_w, canvas_h), (255, 255, 255, 255))
        
        for row in range(rows):
            row_logos = resized_images[row * logos_per_row : (row + 1) * logos_per_row]
            total_logo_w = sum(img.size[0] for img in row_logos)
            remaining_space = canvas_w - total_logo_w
            spacing = remaining_space / (len(row_logos) + 1)
            
            current_x = spacing
            y_offset = row * row_h + 40
            for img in row_logos:
                w, h = img.size
                y = y_offset + int((row_h - h) / 2)
                logo_bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
                if img.mode == 'RGBA':
                    logo_bg.alpha_composite(img)
                    paste_img = logo_bg.convert('RGB')
                else:
                    paste_img = img.convert('RGB')
                    
                canvas.paste(paste_img, (int(current_x), y))
                current_x += w + spacing
                
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    canvas.convert('RGB').save(output_path, "PNG", quality=95)
    return True

def extract_background_sliders(base_url):
    """
    CSS veya inline style ile yüklenen Swiper/Elementor slider arka plan resimlerini 
    HTML ve CSS dosyalarını tarayarak akıllıca yakalar (Prestashop/WordPress uyumlu).
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    candidates = []
    try:
        req = urllib.request.Request(base_url, headers=headers)
        with urllib.request.urlopen(req, timeout=4) as res:
            html_text = res.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"  ℹ️ [Background Slider] Ham HTML çekilemedi (Pas geçiliyor): {e}")
        return candidates

    repeater_classes = set(re.findall(r'class=["\'][^"\']*(elementor-repeater-item-[a-f0-9]+|swiper-slide|slick-slide)[^"\']*["\']', html_text))
    if not repeater_classes:
        repeater_classes = {"swiper-slide", "slick-slide"}
        
    css_urls = re.findall(r'<link[^>]*href=["\']([^"\']+\.css[^"\']*)["\']', html_text)
    filtered_css = []
    for url in css_urls:
        abs_css = urljoin(base_url, url)
        if any(k in abs_css.lower() for k in ["elementor", "axon", "post-", "custom", "theme", "style"]):
            filtered_css.append(abs_css)
            
    style_blocks = re.findall(r'<style[^>]*>(.*?)</style>', html_text, re.DOTALL)
    all_css_sources = [("Inline Style", block) for block in style_blocks]
    
    for css_url in filtered_css[:6]:
        try:
            req_css = urllib.request.Request(css_url, headers=headers)
            with urllib.request.urlopen(req_css, timeout=2) as res_css:
                css_text = res_css.read().decode('utf-8', errors='ignore')
                all_css_sources.append((css_url, css_text))
        except Exception:
            continue
            
    for name, css_text in all_css_sources:
        for cls in repeater_classes:
            if cls in css_text:
                pattern = rf"\.{cls}[^{{]*\{{[^}}]*background-image:[^;}}]*url\(['\"]?([^'\"]+?)['\"]?\)"
                matches = re.findall(pattern, css_text, re.IGNORECASE)
                for m in matches:
                    m_clean = m.replace("\\", "")
                    abs_img = urljoin(base_url, m_clean)
                    if abs_img not in candidates:
                        candidates.append(abs_img)
                        print(f"  🎯 [Background Slider] Slayt görseli bulundu: {abs_img}")
                        
    return candidates

def is_widescreen_banner(img_url):
    """Görselin en-boy oranını kontrol ederek 16:9 veya benzeri yatay geniş formatta olup olmadığını belirler."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        req = urllib.request.Request(img_url, headers=headers)
        with urllib.request.urlopen(req, timeout=3) as res:
            img_data = res.read()
            img = Image.open(io.BytesIO(img_data))
            w, h = img.size
            if w >= 500 and h >= 200:
                aspect = w / h
                if aspect >= 1.4: # 16:9 veya benzeri yatay geniş format
                    return True
    except Exception:
        pass
    return False
