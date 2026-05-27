#!/usr/bin/env python3
"""
Kurumsal Ürün Onboarding Orkestratörü (Unified) - Diamond Standard 💎
======================================================================
Çift betikli yapıyı teke indiren, --count N parametresi destekli,
%100 DRY ve hata töleranslı kurumsal dükkan onboarding motoru.
"""
import os
import sys
import json
import random
import subprocess
import socket
import argparse

# Tüm socket işlemlerine 3 saniye global zaman aşımı
socket.setdefaulttimeout(3)

# Ebeveyn dizini python path'ine ekle
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from config import SUPABASE_URL, make_supabase_request, check_website_diagnostics, is_strict_product_supplier, extract_slug

def onboard_single_lead(candidate):
    """
    Tek bir lead adayını modüler scraper ile işler ve Supabase üzerinde yayına alır.
    Başarılı olursa True, aksi halde False döner.
    """
    web = candidate.get("website")
    company_name = candidate.get("company_name")
    lead_id = candidate.get("id")
    raw_metadata = candidate.get("metadata") or {}
    slug = extract_slug(web, raw_metadata)
    
    # Adres gibi gereksiz ham verileri temizliyor, sadece gereken alanları tutuyoruz
    metadata = {
        "slug": slug
    }
    
    print(f"\n🔎 Sitenin aktifliği ve teknik özellikleri analiz ediliyor: {web}...")
    diag = check_website_diagnostics(web)
    
    if not diag["is_alive"]:
        print("  ❌ Siteye erişilemedi, atlanıyor...")
        update_url = f"{SUPABASE_URL}/rest/v1/leads?id=eq.{lead_id}"
        issues = diag["issues"]
        if not issues:
            issues = ["Web sitesi aktif değil / sunucu veya DNS bağlantı zaman aşımı yaşanıyor."]
        
        snippet = "Ufak bir dost tavsiyesi olarak, mevcut web sitenizde müşterilerinizin işini kolaylaştıracak birkaç küçük eksiklik fark ettik:\n" + "\n".join(f"- {issue}" for issue in issues)
        metadata["audit_report"] = {
            "status": "critical",
            "issues": issues,
            "whatsapp_snippet": snippet
        }
        make_supabase_request(update_url, "PATCH", {"onboarded": False, "phone": "ERIŞILEMEDI", "metadata": metadata})
        return False
        
    print(f"🌟 SEÇİLEN AKTİF ÜRÜN TEDARİKÇİSİ ADAYI: {company_name}")
    print(f"🔗 Web Adresi:  {web}")
    print(f"🔑 Slug:        {slug}")
    print(f"🆔 Lead ID:     {lead_id}")
    
    # 1. Modüler Scraper & Sync'i tek adımda çalıştır (Diamond Standard 💎)
    print("🤖 Modüler Scraper ve Sync başlatılıyor...")
    scraper_cmd = ["python3", "main.py", "--url", web, "--name", company_name, "--slug", slug, "--sync"]
    res_scrape = subprocess.run(scraper_cmd)
    
    if res_scrape.returncode != 0:
        print("  ❌ Scraper ve Sync adımı hata verdi, sonraki adaya geçiliyor...")
        update_url = f"{SUPABASE_URL}/rest/v1/leads?id=eq.{lead_id}"
        issues = diag["issues"] + ["Web sitesi taranırken teknik engel veya altyapı uyumsuzluğuyla karşılaşıldı."]
        snippet = "Ufak bir dost tavsiyesi olarak, mevcut web sitenizde müşterilerinizin işini kolaylaştıracak birkaç küçük eksiklik fark ettik:\n" + "\n".join(f"- {issue}" for issue in issues)
        metadata["audit_report"] = {
            "status": "critical",
            "issues": issues,
            "whatsapp_snippet": snippet
        }
        make_supabase_request(update_url, "PATCH", {"onboarded": False, "metadata": metadata})
        return False
        
    json_path = os.path.join(current_dir, "results", f"result_{slug}.json")
    if not os.path.exists(json_path):
        print("  ❌ JSON çıktı dosyası bulunamadı, sonraki adaya geçiliyor...")
        update_url = f"{SUPABASE_URL}/rest/v1/leads?id=eq.{lead_id}"
        issues = diag["issues"] + ["Sitenizde koruma sistemi aktif olduğundan dolayı ürünlerinizi otomatik listeleyemedik."]
        snippet = "Ufak bir dost tavsiyesi olarak, mevcut web sitenizde müşterilerinizin işini kolaylaştıracak birkaç küçük eksiklik fark ettik:\n" + "\n".join(f"- {issue}" for issue in issues)
        metadata["audit_report"] = {
            "status": "critical",
            "issues": issues,
            "whatsapp_snippet": snippet
        }
        make_supabase_request(update_url, "PATCH", {"onboarded": False, "metadata": metadata})
        return False
        
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            scraped_data = json.load(f)
    except Exception as e:
        print(f"  ❌ JSON okuma hatası: {e}, sonraki adaya geçiliyor...")
        update_url = f"{SUPABASE_URL}/rest/v1/leads?id=eq.{lead_id}"
        issues = diag["issues"] + [f"Sitenizdeki ürün listesi formatı okunamadı: {e}"]
        snippet = "Ufak bir dost tavsiyesi olarak, mevcut web sitenizde müşterilerinizin işini kolaylaştıracak birkaç küçük eksiklik fark ettik:\n" + "\n".join(f"- {issue}" for issue in issues)
        metadata["audit_report"] = {
            "status": "critical",
            "issues": issues,
            "whatsapp_snippet": snippet
        }
        make_supabase_request(update_url, "PATCH", {"onboarded": False, "metadata": metadata})
        return False
        
    products = scraped_data.get("products", [])
    if not products:
        print("  ⚠ Sitede hiç ürün bulunamadı! Sonraki adaya geçiliyor...")
        update_url = f"{SUPABASE_URL}/rest/v1/leads?id=eq.{lead_id}"
        issues = diag["issues"] + ["Web sitenizde müşterilerinizin kolayca seçebileceği, güncel ve düzenli bir ürün kataloğu bulamadık."]
        snippet = "Ufak bir dost tavsiyesi olarak, mevcut web sitenizde müşterilerinizin işini kolaylaştıracak birkaç küçük eksiklik fark ettik:\n" + "\n".join(f"- {issue}" for issue in issues)
        metadata["audit_report"] = {
            "status": "warning",
            "issues": issues,
            "whatsapp_snippet": snippet
        }
        make_supabase_request(update_url, "PATCH", {"onboarded": False, "metadata": metadata})
        return False
        
    # 2. Lead kaydını 'onboarded = true' olarak güncelle
    print("🔄 Leads tablosundaki durum 'onboarded = true' olarak güncelleniyor...")
    update_url = f"{SUPABASE_URL}/rest/v1/leads?id=eq.{lead_id}"
    
    issues = diag["issues"]
    status = "healthy" if not issues else "warning"
    snippet = ""
    if issues:
        snippet = "Ufak bir dost tavsiyesi olarak, mevcut web sitenizde müşterilerinizin işini kolaylaştıracak birkaç küçük eksiklik fark ettik:\n" + "\n".join(f"- {issue}" for issue in issues)
        
    metadata["audit_report"] = {
        "status": status,
        "issues": issues,
        "whatsapp_snippet": snippet
    }
    make_supabase_request(update_url, "PATCH", {"onboarded": True, "phone": scraped_data.get("phone", ""), "metadata": metadata})
    
    # 3. Başarılı Sonuç Detayı
    candidate["slug"] = slug
    candidate["products_count"] = len(products)
    candidate["phone"] = scraped_data.get("phone", "Yok")
    
    print("\n" + "="*55)
    print(f"🎉 {company_name} UÇTAN UCA BAŞARIYLA ONBOARD EDİLDİ!")
    print("="*55)
    return True

def main():
    parser = argparse.ArgumentParser(description="E-Katalog Unified Onboarding Motoru")
    parser.add_argument("--count", type=int, default=1, help="Onboard edilecek hedef dükkan sayısı")
    args = parser.parse_args()
    
    print("="*60)
    print(f"🚀 UNIFIED ONBOARDER — {args.count} ADET DÜKKAN HEDEFLENİYOR")
    print("="*60)
    
    print("🕵️ Bekleyen leads listesi Supabase'den çekiliyor...")
    url = f"{SUPABASE_URL}/rest/v1/leads?onboarded=is.null&limit=200"
    leads = make_supabase_request(url)
    if not leads:
        url_false = f"{SUPABASE_URL}/rest/v1/leads?onboarded=eq.false&limit=200"
        leads = make_supabase_request(url_false)
        
    if not leads:
        print("❌ Bekleyen lead bulunamadı!")
        sys.exit(1)
        
    print(f"📋 Toplam {len(leads)} adet bekleyen lead çekildi.")
    
    # Sadece fiziksel ürün tedarikçilerini al
    product_leads = [
        lead for lead in leads 
        if lead.get("company_name") and lead.get("website") 
        and is_strict_product_supplier(lead["company_name"], lead["website"])
    ]
    
    if not product_leads:
        print("❌ Filtreleme sonrası uygun (ürün satan) lead kalmadı!")
        sys.exit(1)
        
    print(f"🎯 Filtreleme Sonrası Kalan Gerçek Ürün Tedarikçisi Sayısı: {len(product_leads)}")
    
    successful_onboards = []
    
    while len(successful_onboards) < args.count and product_leads:
        candidate = random.choice(product_leads)
        product_leads.remove(candidate)
        
        print(f"\n⚡ [{len(successful_onboards)+1}/{args.count}] İşleniyor: {candidate.get('company_name')}...")
        success = onboard_single_lead(candidate)
        if success:
            successful_onboards.append(candidate)
            
    # Toplu Sonuç Raporu
    print("\n" + "="*70)
    print("🎉 UNIFIED ONBOARDER TAMAMLANDI — TOPLU RAPOR")
    print("="*70)
    for idx, store in enumerate(successful_onboards, 1):
        print(f"{idx}. 🏢 {store.get('company_name')}")
        print(f"   🌐 Web Adresi:  {store.get('website')}")
        print(f"   🔑 Slug:        {store.get('slug')}")
        print(f"   📦 Ürün Sayısı:    {store.get('products_count')} adet")
        print(f"   📞 İletişim:       {store.get('phone')}")
        print("-"*70)
    
    if len(successful_onboards) < args.count:
        print(f"⚠ UYARI: Hedeflenen {args.count} dükkandan sadece {len(successful_onboards)} tanesi onboard edilebildi!")
    else:
        print(f"🏆 {args.count} Dükkan başarıyla ve sorunsuz olarak tamamen yayına alındı!")
    print("="*70 + "\n")

if __name__ == "__main__":
    main()
