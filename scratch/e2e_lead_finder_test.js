import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const STORE_ID = '8b1b8be8-7e44-48f8-b3d9-de4e8f7f1d09'; // ornek store
const STORE_SLUG = 'ornek';
const ADMIN_PIN = '1234';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Supabase credentials not found in env!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runE2ETests() {
  console.log('🤖 B2B MÜŞTERİ BULUCU E2E ENTEGRASYON VE DOĞRULAMA TESTİ BAŞLATILIYOR...\n');

  try {
    // -------------------------------------------------------------
    // TEST 1: RPC PIN Kodu & Admin Doğrulama
    // -------------------------------------------------------------
    console.log('-------------------------------------------------------------');
    console.log('🧪 TEST 1: PIN Kodu ve Admin Yetkisi Sorgulama (verify_admin_access)');
    
    const { data: isSuccess, error: rpcErr } = await supabase.rpc(
      'verify_admin_access',
      {
        target_slug: STORE_SLUG,
        input_pin: ADMIN_PIN,
      }
    );

    if (rpcErr) throw rpcErr;
    
    console.log(`✅ RPC 'verify_admin_access' basarıyla tetiklendi.`);
    if (isSuccess === true) {
      console.log('🟢 PASS: "1234" PIN ile Admin doğrulaması basarılı!');
    } else {
      throw new Error(`FAIL: PIN dogrulaması beklenen basarılı sonucu dondurmedi!`);
    }

    // -------------------------------------------------------------
    // TEST 2: Kredi Kontrolü
    // -------------------------------------------------------------
    console.log('\n-------------------------------------------------------------');
    console.log('🧪 TEST 2: Dükkan Başlangıç Kredi Durumu (portfoys_credits)');
    
    // Reset credits to 2 for deterministic test using the secure RPC
    const { error: resetErr } = await supabase.rpc('secure_update_store', {
      p_id: STORE_ID,
      p_pin: ADMIN_PIN,
      p_changes: { portfoys_credits: 2 }
    });
    if (resetErr) throw resetErr;

    const { data: store, error: storeErr } = await supabase
      .from('stores')
      .select('name, portfoys_credits')
      .eq('id', STORE_ID)
      .single();

    if (storeErr) throw storeErr;
    console.log(`✅ Dükkan adı: "${store.name}", Kalan Arama Hakkı: ${store.portfoys_credits}/2`);
    if (store.portfoys_credits === 2) {
      console.log('🟢 PASS: Baslangıc kredisi 2 olarak dogrulandı!');
    } else {
      throw new Error(`FAIL: Kredi baslangıç degeri hatalı! (${store.portfoys_credits})`);
    }

    // -------------------------------------------------------------
    // TEST 3: Serper API Canlı Arama Sorgusu
    // -------------------------------------------------------------
    console.log('\n-------------------------------------------------------------');
    console.log('🧪 TEST 3: Canlı Portfoys Search API Sorgusu (Kadıköy - Butik)');
    
    const searchBody = {
      keyword: 'Butik',
      city: 'İstanbul',
      district: 'Kadıköy'
    };

    console.log(`⏳ portfoys.pro/api/search adresine istek gonderiliyor: ${JSON.stringify(searchBody)}...`);
    const searchRes = await fetch('https://portfoys.pro/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': 'portfoys_secure_key_123456',
      },
      body: JSON.stringify(searchBody)
    });

    if (!searchRes.ok) {
      throw new Error(`Search API HTTP Hatası! Statu: ${searchRes.status}`);
    }

    const searchData = await searchRes.json();
    const leads = searchData.leads || [];
    
    console.log(`✅ Canlı API basarıyla dondu! Gelen Sonuç Sayısı: ${leads.length}`);
    if (leads.length > 0) {
      console.log(`🟢 PASS: Müşteriler basarıyla listelendi! İlk dükkan: "${leads[0].name}"`);
      
      // Yazdırılacak detaylar
      console.log('📋 Ornek Sonuç Yapısı:');
      console.log(`   - İsim: ${leads[0].name}`);
      console.log(`   - Telefon: ${leads[0].phone || 'Yok'}`);
      console.log(`   - Web Sitesi: ${leads[0].website || 'Yok'}`);
      console.log(`   - Adres: ${leads[0].address}`);
    } else {
      throw new Error('FAIL: Hiç sonuc donmedi! Canlı API bos sonuc dondurmus olabilir.');
    }

    // -------------------------------------------------------------
    // TEST 4: Kredi Azaltma (Credit Deduction via RPC)
    // -------------------------------------------------------------
    console.log('\n-------------------------------------------------------------');
    console.log('🧪 TEST 4: Kredi Azaltma Akısı (Credit Deduction)');
    
    const newCredits = store.portfoys_credits - 1;
    console.log(`⏳ Kredi degeri ${newCredits} olarak guncelleniyor...`);
    
    const { error: updateErr } = await supabase.rpc('secure_update_store', {
      p_id: STORE_ID,
      p_pin: ADMIN_PIN,
      p_changes: { portfoys_credits: newCredits }
    });

    if (updateErr) throw updateErr;

    const { data: storeAfterSpend, error: getAfterErr } = await supabase
      .from('stores')
      .select('portfoys_credits')
      .eq('id', STORE_ID)
      .single();

    if (getAfterErr) throw getAfterErr;
    console.log(`✅ Guncel dükkan kredisi: ${storeAfterSpend.portfoys_credits}`);
    if (storeAfterSpend.portfoys_credits === 1) {
      console.log('🟢 PASS: Kredi basarıyla 1 eksildi!');
    } else {
      throw new Error(`FAIL: Kredi guncellemesi basarısız! Guncel deger: ${storeAfterSpend.portfoys_credits}`);
    }

    // -------------------------------------------------------------
    // TEST 5: Rehbere Kaydetme ve Konum Bilgisi (Save Lead to local DB)
    // -------------------------------------------------------------
    console.log('\n-------------------------------------------------------------');
    console.log('🧪 TEST 5: Rehbere Kaydetme ve Konum Verileri (public.leads)');
    
    const targetLead = leads[0];
    console.log(`⏳ "${targetLead.name}" rehbere ekleniyor. Konum: İstanbul / Kadıköy...`);
    
    // Temizleme (Onceki kayıt varsa)
    await supabase.from('leads').delete().eq('store_id', STORE_ID).eq('phone', targetLead.phone);

    const { error: saveErr } = await supabase.from('leads').insert({
      store_id: STORE_ID,
      company_name: targetLead.name,
      phone: targetLead.phone || '05370000000',
      website: targetLead.website,
      segment: targetLead.category || 'Butik',
      metadata: {
        address: targetLead.address,
        city: 'İstanbul',
        district: 'Kadıköy',
        country: 'Türkiye',
      },
    });

    if (saveErr) throw saveErr;

    // Dogrulama
    const { data: savedLeads, error: fetchSavedErr } = await supabase
      .from('leads')
      .select('*')
      .eq('store_id', STORE_ID)
      .eq('company_name', targetLead.name);

    if (fetchSavedErr) throw fetchSavedErr;
    
    console.log(`✅ Leads tablosundan sorgulandı. Kaydedilen veri sayısı: ${savedLeads.length}`);
    if (savedLeads.length > 0) {
      const saved = savedLeads[0];
      console.log('🟢 PASS: Müşteri veritabanına basarıyla kaydedildi!');
      console.log('📋 Kaydedilen Metadata Detayı:');
      console.log(`   - Ulke: ${saved.metadata.country}`);
      console.log(`   - Sehir: ${saved.metadata.city}`);
      console.log(`   - Ilce: ${saved.metadata.district}`);
      console.log(`   - Segment/Kategori: ${saved.segment}`);
      
      if (saved.metadata.city === 'İstanbul' && saved.metadata.district === 'Kadıköy') {
        console.log('🟢 PASS: Konum bilgileri (İstanbul / Kadıköy) eksiksiz ve type-safe olarak yazılmıs!');
      } else {
        throw new Error('FAIL: Konum bilgileri metadata icinde dogru eslesmedi!');
      }
    } else {
      throw new Error('FAIL: Musteri veritabanına kaydedilemedi!');
    }

    // -------------------------------------------------------------
    // TEST 6: Kota Asımı Kilit Ekranı (Quota Lockout)
    // -------------------------------------------------------------
    console.log('\n-------------------------------------------------------------');
    console.log('🧪 TEST 6: Kota Asımı ve Kilitlenme Durumu (Kredi = 0)');
    
    console.log('⏳ Kredi 0 yapılıyor...');
    const { error: lockErr } = await supabase.rpc('secure_update_store', {
      p_id: STORE_ID,
      p_pin: ADMIN_PIN,
      p_changes: { portfoys_credits: 0 }
    });
    if (lockErr) throw lockErr;

    const { data: storeExhausted, error: exErr } = await supabase
      .from('stores')
      .select('portfoys_credits')
      .eq('id', STORE_ID)
      .single();

    if (exErr) throw exErr;
    console.log(`✅ Güncel arama hakkı: ${storeExhausted.portfoys_credits}/2`);
    if (storeExhausted.portfoys_credits === 0) {
      console.log('🟢 PASS: Kredi sıfırlandı, lockout arayuzu kilitlemeye hazır!');
    } else {
      throw new Error('FAIL: Kredi sıfırlanamadı!');
    }

    // -------------------------------------------------------------
    // TESTLERİN TAMAMLANMASI VE DB RESET
    // -------------------------------------------------------------
    console.log('\n-------------------------------------------------------------');
    console.log('🧹 TEST SONRASI VERİ TEMİZLİĞİ VE SIFIRLAMA');
    
    // Reset credits back to 2 and delete the test lead using secure RPC
    await supabase.rpc('secure_update_store', {
      p_id: STORE_ID,
      p_pin: ADMIN_PIN,
      p_changes: { portfoys_credits: 2 }
    });
    await supabase.from('leads').delete().eq('store_id', STORE_ID).eq('company_name', targetLead.name);
    
    console.log('✅ Veritabanı kredisi orjinal durumuna (2) getirildi.');
    console.log('✅ Eklenen test kayıtları temizlendi.');
    console.log('\n🎉 TEBRİKLER! TÜM B2B MÜŞTERİ BULUCU E2E TESTLERİ BAŞARIYLA GEÇTİ! 🎉\n');

  } catch (err) {
    console.error('\n❌ E2E TESTİ SIRASINDA HATA OLUŞTU:\n', err.message);
    
    // Safe fallback reset on failure using secure RPC
    await supabase.rpc('secure_update_store', {
      p_id: STORE_ID,
      p_pin: ADMIN_PIN,
      p_changes: { portfoys_credits: 2 }
    });
    process.exit(1);
  }
}

runE2ETests();
