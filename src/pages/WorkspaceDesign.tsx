import { useState, useRef, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';

// Background Preset Gradients
const PRESETS = [
  {
    id: 'emerald',
    name: 'Emerald Glow',
    class: 'bg-gradient-to-tr from-emerald-950 via-stone-950 to-stone-900 text-white',
    glow: 'from-emerald-400/20 to-transparent',
    colorMode: 'dark',
  },
  {
    id: 'dark',
    name: 'Sleek Dark',
    class: 'bg-stone-950 text-white',
    glow: 'from-emerald-500/10 to-transparent',
    colorMode: 'dark',
  },
  {
    id: 'kraft',
    name: 'Kraft Earthy',
    class: 'bg-gradient-to-tr from-[#5C3E26] via-[#2F1F13] to-stone-950 text-white',
    glow: 'from-[#A67B5B]/20 to-transparent',
    colorMode: 'dark',
  },
  {
    id: 'blue',
    name: 'Deep Blue',
    class: 'bg-gradient-to-tr from-blue-950 via-stone-950 to-stone-900 text-white',
    glow: 'from-blue-500/10 to-transparent',
    colorMode: 'dark',
  },
  {
    id: 'purple',
    name: 'Purple Magic',
    class: 'bg-gradient-to-tr from-purple-950 via-stone-950 to-stone-900 text-white',
    glow: 'from-purple-500/10 to-transparent',
    colorMode: 'dark',
  },
  {
    id: 'light',
    name: 'Clean Light',
    class: 'bg-stone-50 text-stone-900 border border-stone-200/50',
    glow: 'from-stone-200/40 to-transparent',
    colorMode: 'light',
  },
];

const FORMATS = [
  { id: 'highlight', name: 'Instagram Hikaye (9:16)', width: 1080, height: 1920, previewScale: 0.35 },
  { id: 'post', name: 'Instagram Gönderi (1:1)', width: 1080, height: 1080, previewScale: 0.52 },
  { id: 'print', name: 'Masa Kartı / Kartvizit (2:3)', width: 1000, height: 1500, previewScale: 0.40 },
];

const TEMPLATES = [
  // HIGHLIGHTS (9:16)
  {
    id: 'mobil_yonetim',
    format: 'highlight',
    name: 'Mobil Fiyat Yönetimi',
    header: 'Fiyatlar Saniyeler İçinde Cepte',
    subtitle: 'tasarımcı ve yazılımcı beklemeden, cep telefonunuzdan dükkan fiyatlarını anında güncelleyin.',
    mockupType: 'mobil_yonetim',
    theme: 'emerald',
  },
  {
    id: 'kayan_menu',
    format: 'highlight',
    name: 'WhatsApp & Arama Kayan Menü',
    header: 'Sipariş & Yol Tarifi Her An Aktif',
    subtitle: 'müşterileriniz dilediği an WhatsApp ile sipariş versin, sizi tek tıkla arasın veya yol tarifi alsın.',
    mockupType: 'kayan_menu',
    theme: 'emerald',
  },
  {
    id: 'pin_kodu',
    format: 'highlight',
    name: 'PIN Kodu Güvenliği',
    header: '4 Haneli Hızlı Giriş',
    subtitle: 'karmaşık şifrelerle uğraşmayın. telefon ekranı gibi 4 haneli PIN koduyla dükkanınızı yönetin.',
    mockupType: 'pin_kodu',
    theme: 'emerald',
  },
  {
    id: 'doviz_cevirici',
    format: 'highlight',
    name: 'Döviz Çevirici',
    header: 'Döviz Kurlarına Tam Uyum',
    subtitle: 'dükkandaki tüm fiyatları tek tıkla USD, EUR veya TL cinsine çevirin, kur farklarından etkilenmeyin.',
    mockupType: 'doviz_cevirici',
    theme: 'blue',
  },
  {
    id: 'tek_tikla_reklam',
    format: 'highlight',
    name: 'Tek Tıkla Reklam',
    header: 'Faturaya Yansıyan Reklam',
    subtitle: 'reklam bütçenizi dükkanınızdan seçin, reklamınız çıksın. ödeme telefon faturanıza yansısın.',
    mockupType: 'tek_tikla_reklam',
    theme: 'purple',
  },
  {
    id: 'ozel_indirim',
    format: 'highlight',
    name: 'Müşteriye Özel İndirim',
    header: 'Müşteriye Özel İndirimler',
    subtitle: 'dilediğiniz müşteriye özel geçici kuponlar ve indirimli sepet tutarları tanımlayın.',
    mockupType: 'ozel_indirim',
    theme: 'emerald',
  },

  // POSTS (1:1)
  {
    id: 'post_duyuru',
    format: 'post',
    name: 'Duyuru: Yayındayız',
    header: 'Yeni Dijital Kataloğumuz Yayında!',
    subtitle: 'güncel ürün listemizi ve fiyatlarımızı incelemek için QR kodu taratabilir veya profildeki linke tıklayabilirsiniz.',
    mockupType: 'qr_code',
    theme: 'emerald',
  },
  {
    id: 'post_acilar',
    format: 'post',
    name: 'Sorun: PDF Angaryası',
    header: 'PDF Gönderme Devri Kapandı!',
    subtitle: 'büyük dosya boyutu yüzünden açılmayan, kasan, fiyatları her gün değiştiği için eskiyen PDF dosyalarına son veriyoruz.',
    mockupType: 'pdf_angaryasi',
    theme: 'dark',
  },
  {
    id: 'post_indirim',
    format: 'post',
    name: 'Duyuru: Sepet Kampanyası',
    header: '%20 İndirim Fırsatı Başladı!',
    subtitle: 'web sitemizi ziyaret edin, indirimli sepet fiyatlarından ve kampanyalarımızdan anında yararlanın.',
    mockupType: 'ozel_indirim',
    theme: 'emerald',
  },

  // CARDS (2:3)
  {
    id: 'print_kraft',
    format: 'print',
    name: 'Masa Kartı: Kraft',
    header: 'Dijital Menümüzü İnceleyin',
    subtitle: 'ürünleri ve güncel fiyatları görmek için telefonunuzun kamerasıyla okutun.',
    mockupType: 'qr_code_large',
    theme: 'kraft',
  },
  {
    id: 'print_dark',
    format: 'print',
    name: 'Masa Kartı: Sleek Dark',
    header: 'Dijital Kataloğumuz',
    subtitle: 'ürünleri ve güncel fiyatları görmek için telefonunuzun kamerasıyla okutun.',
    mockupType: 'qr_code_large',
    theme: 'dark',
  },
  {
    id: 'print_light',
    format: 'print',
    name: 'Masa Kartı: Minimalist Beyaz',
    header: 'Dijital Menümüz',
    subtitle: 'ürünleri ve güncel fiyatları görmek için telefonunuzun kamerasıyla okutun.',
    mockupType: 'qr_code_large',
    theme: 'light',
  },
];

// Inner Mockup Components
function MobilYonetimMockup() {
  return (
    <div className="w-[380px] h-[520px] bg-stone-900 border-[6px] border-stone-850 rounded-[3rem] p-6 shadow-2xl relative flex flex-col gap-4 text-left overflow-hidden select-none">
      <div className="flex justify-between items-center px-2 text-[10px] font-black text-stone-500 tracking-wider">
        <span>14:50</span>
        <div className="flex gap-1 items-center">
          <Lucide.Signal size={10} />
          <Lucide.Wifi size={10} />
          <Lucide.Battery size={12} />
        </div>
      </div>
      
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Lucide.Sliders size={14} className="text-emerald-500" />
          </div>
          <div>
            <span className="text-xs font-black text-stone-300 block">Yönetim Paneli</span>
            <span className="text-[9px] text-stone-500 font-bold">Dükkanınızı Düzenleyin</span>
          </div>
        </div>
        <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Bağlı</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-3 justify-center py-2">
        <div className="bg-stone-950/50 border border-stone-800/80 rounded-2xl p-3 flex justify-between items-center opacity-60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-stone-800" />
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-stone-400 block">Papatya Buketi</span>
              <span className="text-[9px] text-stone-600 block">Kategori: Çiçek</span>
            </div>
          </div>
          <span className="text-xs font-black text-stone-400">₺299</span>
        </div>

        <div className="bg-stone-950/80 border-2 border-emerald-500/50 rounded-2xl p-4 flex flex-col gap-3 relative shadow-lg shadow-emerald-500/5">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-stone-200">Gül Buketi (11\'li)</span>
            <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Düzenleniyor</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-stone-900 border border-emerald-500/50 rounded-xl px-3 py-2 flex items-center justify-between">
              <span className="text-[10px] text-stone-500 font-bold">Fiyat</span>
              <div className="flex items-center gap-1">
                <span className="text-xs font-black text-stone-200">₺</span>
                <span className="text-xs font-black text-emerald-400">299</span>
                <span className="w-0.5 h-3 bg-emerald-400 animate-ping" />
              </div>
            </div>
            <div className="bg-emerald-500 text-stone-950 px-4 rounded-xl flex items-center justify-center font-bold text-[11px] relative">
              <Lucide.Check size={14} strokeWidth={3} />
              <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-emerald-400/30 rounded-full animate-ping pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="bg-stone-950/50 border border-stone-800/80 rounded-2xl p-3 flex justify-between items-center opacity-60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-stone-800" />
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-stone-400 block">Saksı Orkide</span>
              <span className="text-[9px] text-stone-600 block">Kategori: Çiçek</span>
            </div>
          </div>
          <span className="text-xs font-black text-stone-400">₺650</span>
        </div>
      </div>
      <div className="w-24 h-1 bg-stone-800 rounded-full mx-auto mt-auto shrink-0" />
    </div>
  );
}

function KayanMenuMockup() {
  return (
    <div className="w-[380px] h-[520px] bg-stone-900 border-[6px] border-stone-850 rounded-[3rem] p-6 shadow-2xl relative flex flex-col justify-between text-left overflow-hidden select-none">
      <div className="flex justify-between items-center px-2 text-[10px] font-black text-stone-500 tracking-wider">
        <span>14:50</span>
        <div className="flex gap-1 items-center">
          <Lucide.Signal size={10} />
          <Lucide.Wifi size={10} />
          <Lucide.Battery size={12} />
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-stone-800/50 pb-3">
        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
          <span className="text-xs font-bold text-emerald-400">💐</span>
        </div>
        <div>
          <span className="text-xs font-bold text-stone-300 block leading-none">Çiçek Dükkanım</span>
          <span className="text-[8px] text-stone-500">Katalog</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-3 py-3 overflow-hidden">
        {[
          { name: 'Papatya Seti', price: '₺299' },
          { name: 'Gül Demeti', price: '₺399' },
          { name: 'Orkide Çiçeği', price: '₺699' },
          { name: 'Lale Buketi', price: '₺180' }
        ].map((item, idx) => (
          <div key={idx} className="bg-stone-950/40 border border-stone-800/65 rounded-2xl p-2.5 flex flex-col gap-2 relative">
            <div className="w-full h-16 rounded-xl bg-stone-900 border border-stone-800/60 relative overflow-hidden flex items-center justify-center">
              <span className="text-xl">🌸</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-stone-300 block truncate">{item.name}</span>
              <span className="text-[9px] font-black text-emerald-400 block">{item.price}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="relative pb-1 z-20">
        <div className="bg-emerald-500 text-stone-950 font-black flex items-center justify-between px-5 py-3.5 rounded-2xl shadow-xl shadow-emerald-950/20 w-full mx-auto relative border border-emerald-400/30">
          <div className="flex items-center gap-2 text-stone-950 font-black text-[10px] uppercase tracking-wider">
            <Lucide.MapPin size={13} strokeWidth={2.5} />
            <span>Konum</span>
          </div>
          <div className="flex items-center gap-2 text-stone-950 font-black text-[10px] uppercase tracking-wider relative">
            <Lucide.MessageSquare size={13} strokeWidth={2.5} />
            <span>WhatsApp</span>
            <span className="absolute -top-2 -right-3 w-8 h-8 bg-white/40 rounded-full animate-ping pointer-events-none" />
          </div>
          <div className="flex items-center gap-2 text-stone-950 font-black text-[10px] uppercase tracking-wider">
            <Lucide.Phone size={13} strokeWidth={2.5} />
            <span>Arama</span>
          </div>
        </div>
      </div>

      <div className="w-24 h-1 bg-stone-800 rounded-full mx-auto shrink-0 z-10" />
    </div>
  );
}

function PinKoduMockup() {
  return (
    <div className="w-[380px] h-[520px] bg-stone-950 border-[6px] border-stone-850 rounded-[3rem] p-8 shadow-2xl relative flex flex-col justify-between items-center text-center overflow-hidden select-none">
      <div className="space-y-2 mt-6">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-1">
          <Lucide.Lock size={16} className="text-emerald-500 animate-pulse" />
        </div>
        <span className="text-[10px] font-black tracking-[0.3em] text-stone-400 uppercase block">GÜVENLİK KİLİDİ</span>
        <span className="text-[9px] text-stone-600 block">Dükkan yönetim paneline giriş yapın.</span>
      </div>

      <div className="flex justify-center gap-3 my-4">
        <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/20" />
        <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/20" />
        <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/20" />
        <div className="w-3.5 h-3.5 rounded-full bg-stone-800 border border-stone-700 animate-pulse" />
      </div>

      <div className="grid grid-cols-3 gap-x-5 gap-y-3 mb-4 w-full max-w-[240px] mx-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <div
            key={num}
            className="w-12 h-12 rounded-full border border-stone-800 bg-stone-900/50 flex items-center justify-center text-stone-300 text-sm font-bold"
          >
            {num}
          </div>
        ))}
        <div className="w-12 h-12 flex items-center justify-center text-stone-600 text-[10px] font-bold">
          İPTAL
        </div>
        <div className="w-12 h-12 rounded-full border border-stone-800 bg-stone-900/50 flex items-center justify-center text-stone-300 text-sm font-bold relative">
          0
          <span className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping pointer-events-none" />
        </div>
        <div className="w-12 h-12 flex items-center justify-center text-stone-500">
          <Lucide.Delete size={14} />
        </div>
      </div>
      <div className="w-24 h-1 bg-stone-800 rounded-full mx-auto shrink-0 mt-auto" />
    </div>
  );
}

function DovizCeviriciMockup() {
  return (
    <div className="w-[420px] bg-white/[0.02] border border-white/[0.06] rounded-[2.5rem] p-8 backdrop-blur-md text-left flex flex-col gap-6 select-none relative overflow-hidden">
      <span className="absolute -top-5 -right-5 text-9xl font-black text-white/[0.01] pointer-events-none select-none">$ € ₺</span>
      
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Lucide.Globe size={14} className="text-blue-400" />
          </div>
          <div>
            <span className="text-xs font-black text-stone-300 block">Döviz Çevirici</span>
            <span className="text-[9px] text-stone-500">Tek Tıkla Kur Dönüşümü</span>
          </div>
        </div>
        <div className="flex gap-1.5 bg-stone-900 border border-stone-800 p-0.5 rounded-lg">
          <span className="px-2 py-0.5 rounded text-[8px] font-black text-stone-500">TRY</span>
          <span className="px-2 py-0.5 rounded bg-blue-500 text-stone-950 text-[8px] font-black relative">
            USD
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-stone-900 animate-pulse" />
          </span>
          <span className="px-2 py-0.5 rounded text-[8px] font-black text-stone-500">EUR</span>
        </div>
      </div>

      <div className="flex items-center justify-between py-2 bg-stone-900/40 border border-stone-850 rounded-2xl p-4">
        <div className="space-y-1">
          <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Ürün Fiyatı</span>
          <span className="text-lg font-bold text-stone-400 block line-through leading-none">₺350.00</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-white">$10</span>
            <span className="text-sm font-black text-blue-400">.00</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Lucide.RefreshCw size={18} className="text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
      </div>
      <div className="flex justify-between items-center text-[9px] font-medium text-stone-500 px-2">
        <span>Anlık Merkez Bankası Kuru</span>
        <span className="font-bold text-stone-400">1 USD = 35.00 TRY</span>
      </div>
    </div>
  );
}

function TekTiklaReklamMockup() {
  return (
    <div className="w-[420px] bg-white/[0.02] border border-white/[0.06] rounded-[2.5rem] p-8 backdrop-blur-md text-left flex flex-col gap-5 select-none relative overflow-hidden">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
            <Lucide.Megaphone size={14} className="text-purple-400" />
          </div>
          <div>
            <span className="text-xs font-black text-stone-300 block">Reklam Otomasyonu</span>
            <span className="text-[9px] text-stone-500">Kolay Sosyal Medya Tanıtımı</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Günlük Reklam Bütçesi</span>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-stone-900/30 border border-stone-850 rounded-2xl p-4 flex flex-col gap-1 opacity-50">
            <span className="text-xs font-bold text-stone-400">Minimum</span>
            <span className="text-xl font-black text-stone-300">₺200 / gün</span>
          </div>
          <div className="bg-purple-500/10 border-2 border-purple-500 rounded-2xl p-4 flex flex-col gap-1 relative shadow-lg shadow-purple-500/5">
            <span className="text-xs font-bold text-purple-400">Popüler</span>
            <span className="text-xl font-black text-white">₺500 / gün</span>
            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-purple-400 rounded-full border-2 border-stone-950" />
          </div>
        </div>
      </div>

      <div className="bg-stone-900/50 border border-stone-850 rounded-2xl p-4 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[9px] text-stone-500 font-bold uppercase tracking-wider block">ÖDEME YÖNTEMİ</span>
          <span className="text-xs font-black text-stone-200">Mobil Ödeme (GSM Faturası)</span>
        </div>
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-red-650 text-white rounded text-[8px] font-black uppercase">Vodafone</span>
          <span className="px-2 py-1 bg-yellow-600 text-stone-950 rounded text-[8px] font-black uppercase">Turkcell</span>
        </div>
      </div>
    </div>
  );
}

function OzelIndirimMockup() {
  return (
    <div className="w-[420px] bg-gradient-to-r from-emerald-500/5 to-emerald-500/15 border border-emerald-500/20 rounded-[2.5rem] p-8 backdrop-blur-md flex items-center justify-between select-none relative overflow-hidden">
      <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-stone-950 border border-stone-900/40 -translate-y-1/2 z-10" />
      <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-stone-950 border border-stone-900/40 -translate-y-1/2 z-10" />
      
      <div className="flex flex-col gap-2 relative z-0">
        <div className="px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black tracking-widest uppercase inline-block w-fit">
          KUPON: EKATALOG20
        </div>
        <div>
          <span className="text-xl font-black text-stone-100 block">%20 SEPET İNDİRİMİ</span>
          <span className="text-[9px] text-stone-500">Tüm kategorilerde sepette geçerlidir.</span>
        </div>
      </div>

      <div className="flex flex-col items-end shrink-0 pl-4 border-l border-white/5 relative z-0">
        <span className="text-xs text-stone-500 line-through">₺200</span>
        <span className="text-2xl font-black text-emerald-400">₺160</span>
      </div>
    </div>
  );
}

function PdfAngaryasiMockup() {
  return (
    <div className="w-[380px] bg-white/[0.02] border border-white/[0.06] rounded-[2.5rem] p-8 backdrop-blur-md text-left flex flex-col gap-5 select-none relative overflow-hidden">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <Lucide.FileWarning size={14} className="text-red-400" />
          </div>
          <div>
            <span className="text-xs font-black text-stone-300 block">PDF Dosya Angaryası</span>
            <span className="text-[9px] text-stone-500">Statik, Hantal ve Güncellenemez</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex flex-col gap-2">
          <div className="flex justify-between items-center text-[10px] text-red-400 font-bold">
            <span>KATALOG_2026_SON.PDF</span>
            <span>28.4 MB (Çok Büyük!)</span>
          </div>
          <div className="w-full bg-stone-900 h-2 rounded-full overflow-hidden">
            <div className="bg-red-500 w-[70%] h-full animate-pulse" />
          </div>
          <span className="text-[9px] text-stone-500 block leading-normal">
            ❌ Müşteriler dosya boyutu büyük olduğu için açamıyor, kasmalar yaşanıyor.
          </span>
        </div>

        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex flex-col gap-2">
          <div className="flex justify-between items-center text-[10px] text-red-400 font-bold">
            <span>Fiyat Güncellemesi</span>
            <span>Eski Fiyat Krizi</span>
          </div>
          <span className="text-[9px] text-stone-500 block leading-normal">
            ❌ Dolar kuru değiştiğinde tüm PDF\'i baştan düzenlemek ve tüm rehbere tekrar göndermek zorundasınız.
          </span>
        </div>
      </div>
    </div>
  );
}

function MockupRenderer({ 
  type, 
  website, 
  logo 
}: { 
  type: string; 
  website: string; 
  logo: string | null;
}) {
  switch (type) {
    case 'mobil_yonetim':
      return <MobilYonetimMockup />;
    case 'kayan_menu':
      return <KayanMenuMockup />;
    case 'pin_kodu':
      return <PinKoduMockup />;
    case 'doviz_cevirici':
      return <DovizCeviriciMockup />;
    case 'tek_tikla_reklam':
      return <TekTiklaReklamMockup />;
    case 'ozel_indirim':
      return <OzelIndirimMockup />;
    case 'pdf_angaryasi':
      return <PdfAngaryasiMockup />;
    case 'qr_code':
      return (
        <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-stone-250 flex items-center justify-center relative select-none">
          <QRCodeSVG
            value={website.startsWith('http') ? website : `https://${website}`}
            size={220}
            level="H"
            includeMargin={false}
            imageSettings={logo ? {
              src: logo,
              x: undefined,
              y: undefined,
              height: 45,
              width: 45,
              excavate: true,
            } : undefined}
          />
        </div>
      );
    case 'qr_code_large':
      return (
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-stone-300 flex items-center justify-center relative scale-110 select-none">
          <QRCodeSVG
            value={website.startsWith('http') ? website : `https://${website}`}
            size={300}
            level="H"
            includeMargin={false}
            imageSettings={logo ? {
              src: logo,
              x: undefined,
              y: undefined,
              height: 60,
              width: 60,
              excavate: true,
            } : undefined}
          />
        </div>
      );
    default:
      return null;
  }
}

export default function WorkspaceDesign() {
  const [activeFormatId, setActiveFormatId] = useState('highlight');
  const filteredTemplates = TEMPLATES.filter((t) => t.format === activeFormatId);
  const [activeTemplateId, setActiveTemplateId] = useState(filteredTemplates[0]?.id || TEMPLATES[0].id);

  // Preserve user edits of titles/subtitles per template
  const [customHeaders, setCustomHeaders] = useState<{ [key: string]: string }>({});
  const [customSubtitles, setCustomSubtitles] = useState<{ [key: string]: string }>({});

  const [activePreset, setActivePreset] = useState(PRESETS[0]);
  const [isExporting, setIsExporting] = useState(false);
  
  // Custom Company Details
  const [companyName, setCompanyName] = useState('dükkanım');
  const [companyWebsite, setCompanyWebsite] = useState('www.dukkanim.ekatalog.site');
  const [companyPhone, setCompanyPhone] = useState('+90 532 123 45 67');
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

  const exportRef = useRef<HTMLDivElement>(null);

  // Sync templates and presets when format changes
  useEffect(() => {
    const defaultTemplate = TEMPLATES.find((t) => t.format === activeFormatId);
    if (defaultTemplate) {
      setActiveTemplateId(defaultTemplate.id);
      const matchingPreset = PRESETS.find((p) => p.id === defaultTemplate.theme);
      if (matchingPreset) {
        setActivePreset(matchingPreset);
      }
    }
  }, [activeFormatId]);

  const activeTemplate = TEMPLATES.find((t) => t.id === activeTemplateId) || TEMPLATES[0];
  const header = customHeaders[activeTemplateId] ?? activeTemplate.header;
  const subtitle = customSubtitles[activeTemplateId] ?? activeTemplate.subtitle;
  const activeFormat = FORMATS.find((f) => f.id === activeFormatId) || FORMATS[0];

  const handleHeaderChange = (val: string) => {
    setCustomHeaders((prev) => ({ ...prev, [activeTemplateId]: val }));
  };

  const handleSubtitleChange = (val: string) => {
    setCustomSubtitles((prev) => ({ ...prev, [activeTemplateId]: val }));
  };

  // High Quality PNG Export
  const exportAsPng = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);

    try {
      if (document.fonts) {
        await document.fonts.ready;
      }

      const canvas = await html2canvas(exportRef.current, {
        scale: 2, // High resolution rendering
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        width: activeFormat.width,
        height: activeFormat.height,
        windowWidth: activeFormat.width,
        windowHeight: activeFormat.height,
        scrollX: 0,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `ekatalog_${activeFormatId}_${activeTemplateId}.png`;
      link.href = imgData;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const isLight = activePreset.colorMode === 'light';

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 font-sans flex flex-col md:flex-row">
      {/* SIDEBAR */}
      <div className="w-full md:w-[420px] border-b md:border-b-0 md:border-r border-stone-800 bg-stone-950 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 custom-scrollbar">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <img src="/images/logo_dark.svg?v=5" alt="ekatalog" className="w-6 h-6" />
            <h1 className="text-xl font-black tracking-tight">ekatalog stüdyo</h1>
          </div>
          <p className="text-xs text-stone-500 font-medium">Sosyal Medya ve Basılı QR Materyali Tasarımcısı</p>
        </div>

        {/* 1. FORMAT SEÇİMİ */}
        <div className="border border-stone-900 bg-stone-900/20 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-stone-900">
            <Lucide.Maximize size={14} className="text-emerald-500" />
            <span className="text-xs font-black uppercase tracking-wider text-stone-400">1. Görsel Formatı</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {FORMATS.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFormatId(f.id)}
                className={`py-2.5 px-3 rounded-xl text-left text-xs font-bold border transition-all flex justify-between items-center ${
                  activeFormatId === f.id
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                    : 'bg-stone-900 border-stone-850 text-stone-400 hover:bg-stone-850'
                }`}
              >
                <span>{f.name}</span>
                <span className="text-[10px] text-stone-500 font-mono">{f.width}x{f.height}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. ŞABLON VE ARKA PLAN */}
        <div className="border border-stone-900 bg-stone-900/20 rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-stone-900">
            <Lucide.Palette size={14} className="text-emerald-500" />
            <span className="text-xs font-black uppercase tracking-wider text-stone-400">2. Şablon & Tema</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-stone-500 uppercase">Özellik / Şablon Seçin</label>
            <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTemplateId(t.id);
                    const matchingPreset = PRESETS.find((p) => p.id === t.theme);
                    if (matchingPreset) setActivePreset(matchingPreset);
                  }}
                  className={`py-2 px-3 rounded-xl text-left text-xs font-bold border transition-all truncate block ${
                    activeTemplateId === t.id
                      ? 'bg-stone-850 border-emerald-500 text-emerald-400'
                      : 'bg-stone-900 border-stone-850 text-stone-400 hover:bg-stone-850'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-stone-500 uppercase">Arkaplan Teması</label>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setActivePreset(p)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                    activePreset.name === p.name
                      ? 'border-emerald-500 text-emerald-400 bg-stone-900/50'
                      : 'border-stone-850 text-stone-400 bg-stone-900 hover:bg-stone-850'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. ŞİRKET BİLGİLERİ */}
        <div className="border border-stone-900 bg-stone-900/20 rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-stone-900">
            <Lucide.Building2 size={14} className="text-emerald-500" />
            <span className="text-xs font-black uppercase tracking-wider text-stone-400">3. Şirket Profili</span>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase">Şirket Logosu</span>
            <div className="flex items-center gap-3">
              {companyLogo ? (
                <div className="relative w-12 h-12 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center p-1.5">
                  <img src={companyLogo} alt="Logo" className="w-full h-full object-contain rounded" />
                  <button
                    onClick={() => setCompanyLogo(null)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white p-0.5 rounded-full shadow transition-colors"
                    title="Logoyu Kaldır"
                  >
                    <Lucide.X size={10} />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer py-2 px-3 border border-dashed border-stone-800 rounded-xl text-xs font-bold text-stone-400 hover:text-stone-300 hover:border-stone-700 transition-colors flex items-center justify-center gap-1.5 w-full">
                  <Lucide.Upload size={14} />
                  <span>Logo Yükle (PNG/JPG)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setCompanyLogo(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase">Şirket Adı</span>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Örn: Mert Çiçekçilik"
              className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs font-bold text-stone-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase">Web Adresi</span>
            <input
              type="text"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              placeholder="Örn: www.dukkanim.ekatalog.site"
              className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs font-medium text-stone-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase">Destek Hattı / Telefon</span>
            <input
              type="text"
              value={companyPhone}
              onChange={(e) => setCompanyPhone(e.target.value)}
              placeholder="Örn: +90 532 123 45 67"
              className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs font-medium text-stone-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* 4. İÇERİK EDİTÖRÜ */}
        <div className="border border-stone-900 bg-stone-900/20 rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-stone-900">
            <Lucide.ListTodo size={14} className="text-emerald-500" />
            <span className="text-xs font-black uppercase tracking-wider text-stone-400">4. Görsel İçeriği</span>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase">Görsel Başlığı</span>
            <input
              type="text"
              value={header}
              onChange={(e) => handleHeaderChange(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs font-bold text-stone-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase">Görsel Açıklaması</span>
            <textarea
              value={subtitle}
              onChange={(e) => handleSubtitleChange(e.target.value)}
              rows={3}
              className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs font-medium text-stone-300 focus:outline-none focus:border-emerald-500 resize-none custom-scrollbar"
            />
          </div>
        </div>

        {/* 5. DIŞA AKTAR */}
        <button
          onClick={exportAsPng}
          disabled={isExporting}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black py-3.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 disabled:opacity-50 mt-auto shrink-0"
        >
          {isExporting ? (
            <>
              <Lucide.Loader2 size={16} className="animate-spin" />
              <span>Görsel Hazırlanıyor...</span>
            </>
          ) : (
            <>
              <Lucide.Download size={16} />
              <span>Görseli PNG Olarak İndir</span>
            </>
          )}
        </button>
      </div>

      {/* CANVAS PREVIEW AREA */}
      <div className="flex-1 bg-stone-900 flex items-center justify-center p-4 md:p-8 overflow-auto">
        <div 
          className="origin-center shrink-0 shadow-[0_30px_90px_rgba(0,0,0,0.8)] rounded-[2.5rem] overflow-hidden relative border-8 border-stone-950"
          style={{ 
            width: `${activeFormat.width * activeFormat.previewScale}px`, 
            height: `${activeFormat.height * activeFormat.previewScale}px` 
          }}
        >
          <div 
            className="origin-top-left absolute select-none"
            style={{ 
              transform: `scale(${activeFormat.previewScale})`,
              width: `${activeFormat.width}px`,
              height: `${activeFormat.height}px`,
            }}
          >
            {/* The 1:1, 9:16 or 2:3 Canvas Frame */}
            <div
              ref={exportRef}
              className={`w-full h-full relative flex flex-col justify-between p-20 select-none overflow-hidden ${activePreset.class}`}
            >
              {/* Background gradient mesh/glow (Dark modes only) */}
              {!isLight && (
                <>
                  <div 
                    className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none bg-[radial-gradient(circle,_var(--tw-gradient-stops))]"
                    style={{ backgroundImage: `radial-gradient(circle, ${activePreset.glow.split(' ')[0].includes('emerald') ? 'rgba(16,185,129,0.12)' : activePreset.glow.split(' ')[0].includes('#A67B5B') ? 'rgba(166,123,91,0.15)' : activePreset.glow.split(' ')[0].includes('blue') ? 'rgba(59,130,246,0.12)' : activePreset.glow.split(' ')[0].includes('purple') ? 'rgba(168,85,247,0.12)' : 'rgba(220,38,38,0.12)'} 0%, transparent 70%)` }}
                  ></div>
                  <div 
                    className="absolute bottom-0 left-0 w-[700px] h-[700px] rounded-full blur-[140px] pointer-events-none bg-[radial-gradient(circle,_var(--tw-gradient-stops))]"
                    style={{ backgroundImage: `radial-gradient(circle, ${activePreset.glow.split(' ')[0].includes('emerald') ? 'rgba(16,185,129,0.12)' : activePreset.glow.split(' ')[0].includes('#A67B5B') ? 'rgba(166,123,91,0.15)' : activePreset.glow.split(' ')[0].includes('blue') ? 'rgba(59,130,246,0.12)' : activePreset.glow.split(' ')[0].includes('purple') ? 'rgba(168,85,247,0.12)' : 'rgba(220,38,38,0.12)'} 0%, transparent 70%)` }}
                  ></div>
                </>
              )}

              {/* -------------------- LAYOUT: STORY (9:16) -------------------- */}
              {activeFormatId === 'highlight' && (
                <>
                  {/* Header */}
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-4">
                      {companyLogo ? (
                        <img src={companyLogo} alt={companyName} className="w-14 h-14 object-contain rounded-xl" />
                      ) : (
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-2xl ${isLight ? 'bg-stone-200 text-stone-900 border border-stone-300' : 'bg-white/5 border border-white/10 text-white'}`}>
                          {companyName.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <span className={`text-3xl font-black tracking-tighter uppercase truncate max-w-[480px] ${isLight ? 'text-stone-900' : 'text-stone-100'}`}>
                        {companyName}
                      </span>
                    </div>
                    <span className="text-xl font-bold tracking-[0.3em] text-stone-500 uppercase">ÖNE ÇIKARILANLAR</span>
                  </div>

                  {/* Body Content */}
                  <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center gap-10 my-6">
                    <div className="space-y-4 max-w-[850px] mx-auto">
                      <h2 className={`text-5xl md:text-6xl font-black tracking-tighter leading-tight capitalize ${isLight ? 'text-stone-900' : 'text-stone-100'}`}>
                        {header}
                      </h2>
                      <p className={`text-2xl font-medium leading-relaxed max-w-2xl mx-auto ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
                        {subtitle}
                      </p>
                    </div>

                    <div className="w-full flex items-center justify-center scale-105">
                      <MockupRenderer type={activeTemplate.mockupType} website={companyWebsite} logo={companyLogo} />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className={`border-t pt-10 flex justify-between items-center relative z-10 ${isLight ? 'border-stone-200' : 'border-white/10'}`}>
                    <div className="space-y-1 text-left max-w-[420px]">
                      <span className="text-lg font-black text-stone-500 uppercase tracking-widest">KOLAYLAŞTIRIR & SATAR</span>
                      <p className={`text-2xl font-black truncate ${isLight ? 'text-stone-900' : 'text-stone-200'}`}>{companyWebsite}</p>
                    </div>
                    <div className="text-right max-w-[420px]">
                      <span className="text-lg font-black text-stone-500 uppercase tracking-widest">DESTEK HATTI</span>
                      <p className="text-2xl font-black text-emerald-600 truncate">{companyPhone}</p>
                    </div>
                  </div>
                </>
              )}

              {/* -------------------- LAYOUT: FEED POST (1:1) -------------------- */}
              {activeFormatId === 'post' && (
                <>
                  {/* Header */}
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-4">
                      {companyLogo ? (
                        <img src={companyLogo} alt={companyName} className="w-12 h-12 object-contain rounded-xl" />
                      ) : (
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl ${isLight ? 'bg-stone-200 text-stone-900 border border-stone-300' : 'bg-white/5 border border-white/10 text-white'}`}>
                          {companyName.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <span className={`text-2xl font-black tracking-tighter uppercase truncate max-w-[480px] ${isLight ? 'text-stone-900' : 'text-stone-100'}`}>
                        {companyName}
                      </span>
                    </div>
                    <span className="text-lg font-bold tracking-[0.2em] text-stone-500 uppercase">DUYURU</span>
                  </div>

                  {/* Body Content */}
                  <div className="relative z-10 flex-1 grid grid-cols-2 gap-8 items-center my-4">
                    <div className="space-y-4 text-left">
                      <h2 className={`text-5xl font-black tracking-tighter leading-tight capitalize ${isLight ? 'text-stone-900' : 'text-stone-100'}`}>
                        {header}
                      </h2>
                      <p className={`text-xl font-medium leading-relaxed ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
                        {subtitle}
                      </p>
                    </div>
                    <div className="w-full flex items-center justify-center">
                      <MockupRenderer type={activeTemplate.mockupType} website={companyWebsite} logo={companyLogo} />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className={`border-t pt-8 flex justify-between items-center relative z-10 ${isLight ? 'border-stone-200' : 'border-white/10'}`}>
                    <span className={`text-2xl font-black ${isLight ? 'text-stone-900' : 'text-stone-200'}`}>{companyWebsite}</span>
                    <span className="text-2xl font-black text-emerald-600">{companyPhone}</span>
                  </div>
                </>
              )}

              {/* -------------------- LAYOUT: PRINT CARD (2:3) -------------------- */}
              {activeFormatId === 'print' && (
                <>
                  {/* Top Branding Section */}
                  <div className="flex flex-col items-center text-center gap-3 relative z-10 mt-6">
                    {companyLogo ? (
                      <img src={companyLogo} alt={companyName} className="w-20 h-20 object-contain rounded-2xl p-1 bg-white shadow-md border border-stone-200" />
                    ) : (
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center font-black text-4xl shadow-md ${isLight ? 'bg-stone-200 text-stone-900 border border-stone-300' : 'bg-white/5 border border-white/10 text-white'}`}>
                        {companyName.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <h3 className={`text-3xl font-black tracking-tighter uppercase ${isLight ? 'text-stone-900' : 'text-stone-100'}`}>
                      {companyName}
                    </h3>
                  </div>

                  {/* Main QR Code & Instruction Block */}
                  <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center gap-10 my-4">
                    <div className="scale-105">
                      <MockupRenderer type={activeTemplate.mockupType} website={companyWebsite} logo={companyLogo} />
                    </div>
                    
                    <div className="space-y-3 max-w-[720px] mx-auto">
                      <h2 className={`text-4xl font-black tracking-tight leading-tight ${isLight ? 'text-stone-900' : 'text-stone-100'}`}>
                        {header}
                      </h2>
                      <p className={`text-xl font-medium leading-relaxed ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
                        {subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Footer Web link */}
                  <div className="flex flex-col items-center justify-center relative z-10 mb-6 gap-2">
                    <span className="text-sm font-black text-stone-500 uppercase tracking-widest">GÜNCEL KATALOG ADRESİMİZ</span>
                    <span className={`text-3xl font-black ${isLight ? 'text-stone-900' : 'text-stone-100'}`}>
                      {companyWebsite}
                    </span>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
