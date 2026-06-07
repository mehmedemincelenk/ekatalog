import { useState, useRef } from 'react';
import * as Lucide from 'lucide-react';
import html2canvas from 'html2canvas';

// Background Preset Gradients
const PRESETS = [
  {
    name: 'Sleek Dark',
    class: 'bg-stone-950 text-white',
    glow: 'from-emerald-500/10 to-transparent',
  },
  {
    name: 'Emerald Glow',
    class: 'bg-gradient-to-tr from-emerald-950 via-stone-950 to-stone-900 text-white',
    glow: 'from-emerald-400/20 to-transparent',
  },
  {
    name: 'Kraft Earthy',
    class: 'bg-gradient-to-tr from-[#5C3E26] via-[#2F1F13] to-stone-950 text-white',
    glow: 'from-[#A67B5B]/20 to-transparent',
  },
  {
    name: 'Deep Blue',
    class: 'bg-gradient-to-tr from-blue-950 via-stone-950 to-stone-900 text-white',
    glow: 'from-blue-500/10 to-transparent',
  },
];

const TEMPLATES = [
  {
    id: 'kurtulacaklar',
    name: 'Kurtulacaklarınız',
    header: 'kurtulacaklarınız',
    icon: '✕',
    color: 'text-red-500',
    items: [
      'fiyat değiştikçe her gün yeni PDF hazırlamaktan',
      'eski PDF fiyatına bakıp indirim isteyenlerle tartışmaktan',
      'günde 50 kez "bunun fiyatı ne kadar?" sorusunu cevaplamaktan',
      'stok bittiği halde sipariş alıp mahcup olmaktan',
      'dosya boyutu büyük diye açılmayan, kasan PDF\'lerden',
      'tasarımcı ve yazılımcı beklemekten yorulmaktan',
      'mesai saatleri dışında fiyat veremeyip müşteri kaçırmaktan',
    ],
  },
  {
    id: 'kazanacaklar',
    name: 'Kazanacaklarınız',
    header: 'kazanacaklarınız',
    icon: '✓',
    color: 'text-emerald-500',
    items: [
      'kendi web siteniz (www.firmaniz.com veya markaniz.ekatalog.site)',
      'telefondan fiyatları saniyeler içinde anında güncelleme',
      'hem web adresi hem mobil uygulama olarak kurulum kolaylığı',
      'dilediğiniz müşteriye özel geçici fiyat ve indirim tanımlama',
      'TL, USD ve EUR arası tek tıkla döviz çevirici',
      '4 haneli PIN kodu ile dükkanınıza hızlı ve güvenli erişim',
      'portfoys.pro işbirliğiyle dilediğiniz sektörün bilgilerine ulaşım',
      'ürünleri tek tıkla Instagram/WhatsApp reklam görseline dönüştürme',
      'tüm dükkanda toplu fiyat güncelleme ile saatler kazanma',
      'tek tıkla telefon faturanıza yansıyan reklam otomasyonu',
    ],
  },
];

export default function WorkspaceDesign() {
  const [activeTemplateId, setActiveTemplateId] = useState(TEMPLATES[0].id);
  const activeTemplate = TEMPLATES.find((t) => t.id === activeTemplateId) || TEMPLATES[0];

  // Preserved states for each template to avoid data loss
  const [templateItems, setTemplateItems] = useState<{ [key: string]: string[] }>({
    kurtulacaklar: TEMPLATES[0].items,
    kazanacaklar: TEMPLATES[1].items,
  });
  const [templateHeaders, setTemplateHeaders] = useState<{ [key: string]: string }>({
    kurtulacaklar: TEMPLATES[0].header,
    kazanacaklar: TEMPLATES[1].header,
  });

  const [activePreset, setActivePreset] = useState(PRESETS[0]);
  const [isExporting, setIsExporting] = useState(false);
  
  // Custom Company Details
  const [companyName, setCompanyName] = useState('ekatalog');
  const [companyWebsite, setCompanyWebsite] = useState('www.sirketiniz.ekatalog.site');
  const [companyPhone, setCompanyPhone] = useState('+90 537 342 01 61');
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

  const exportRef = useRef<HTMLDivElement>(null);

  const items = templateItems[activeTemplateId] || [];
  const header = templateHeaders[activeTemplateId] || '';

  const handleItemChange = (index: number, val: string) => {
    setTemplateItems((prev) => ({
      ...prev,
      [activeTemplateId]: prev[activeTemplateId].map((item, i) => (i === index ? val : item)),
    }));
  };

  const handleHeaderChange = (val: string) => {
    setTemplateHeaders((prev) => ({
      ...prev,
      [activeTemplateId]: val,
    }));
  };

  const handleAddItem = () => {
    setTemplateItems((prev) => ({
      ...prev,
      [activeTemplateId]: [...(prev[activeTemplateId] || []), ''],
    }));
  };

  const handleRemoveItem = (index: number) => {
    if ((templateItems[activeTemplateId] || []).length <= 3) return;
    setTemplateItems((prev) => ({
      ...prev,
      [activeTemplateId]: (prev[activeTemplateId] || []).filter((_, i) => i !== index),
    }));
  };

  // Advanced Pixel-Perfect Export using html2canvas API
  const exportAsPng = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);

    try {
      if (document.fonts) {
        await document.fonts.ready;
      }

      const canvas = await html2canvas(exportRef.current, {
        scale: 2, // High DPI scaling
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        width: 1080,
        height: 1920,
        windowWidth: 1080,
        windowHeight: 1920,
        scrollX: 0,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `ekatalog_story_${activeTemplateId}.png`;
      link.href = imgData;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Constrained Proportional Scaling Layout Engine
  const N = items.length;
  
  // Base preferred sizes (ideal for N <= 5)
  let prefFontSize = 38;
  let prefTitleSize = 100;
  let prefIconSize = 76;
  let prefPaddingY = 40;
  let prefTitleMb = 80;
  let prefGap = 60;

  // Scale down base targets as N increases to keep layout reasonably compact initially
  if (N > 5) {
    const diff = N - 5;
    prefFontSize = Math.max(28, 38 - diff * 1.8);
    prefTitleSize = Math.max(70, 100 - diff * 4);
    prefIconSize = Math.max(54, 76 - diff * 3);
    prefPaddingY = Math.max(20, 40 - diff * 3);
    prefTitleMb = Math.max(40, 80 - diff * 5);
    prefGap = Math.max(20, 60 - diff * 6);
  }

  // Estimate total content height
  const estTitleHeight = prefTitleSize * 1.25;
  const estAvgLines = 1.8;
  const estItemContentHeight = Math.max(prefIconSize, prefFontSize * 1.35 * estAvgLines);
  const estItemHeight = prefPaddingY * 2 + estItemContentHeight;
  const estListHeight = N * estItemHeight + (N - 1) * prefGap;
  const estTotalHeight = estTitleHeight + prefTitleMb + estListHeight;

  // Max height budget for Title + List + Margins inside 1920px height
  const maxAvailableHeight = 1470;

  let scale = 1.0;
  if (estTotalHeight > maxAvailableHeight) {
    scale = maxAvailableHeight / estTotalHeight;
  }

  // Calculate final layout values based on global scale factor
  const fontSizePx = Math.max(24, Math.round(prefFontSize * scale)); // minimum 24px
  const titleSizePx = Math.round(prefTitleSize * scale);
  const iconSizePx = Math.round(prefIconSize * scale);
  const paddingYPx = Math.round(prefPaddingY * scale);
  const titleMbPx = Math.round(prefTitleMb * scale);
  const gapPx = Math.round(prefGap * scale);
  
  // Mathematically align text and icon centers
  const textPadTopPx = Math.max(0, Math.round((iconSizePx - (fontSizePx * 1.35)) / 2));

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 font-sans flex flex-col md:flex-row">
      {/* SIDEBAR: CONTROLS */}
      <div className="w-full md:w-[420px] border-b md:border-b-0 md:border-r border-stone-800 bg-stone-950 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 custom-scrollbar">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <img src="/images/logo_dark.svg?v=5" alt="ekatalog" className="w-6 h-6" />
            <h1 className="text-xl font-black tracking-tight">ekatalog stüdyo</h1>
          </div>
          <p className="text-xs text-stone-500 font-medium">Instagram Öne Çıkarılanlar ve Hikaye Görseli Tasarımcısı</p>
        </div>

        {/* 1. TASARIM VE TEMA AYARLARI */}
        <div className="border border-stone-900 bg-stone-900/20 rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-stone-900">
            <Lucide.Palette size={14} className="text-emerald-500" />
            <span className="text-xs font-black uppercase tracking-wider text-stone-400">1. Tasarım & Tema</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-stone-500 uppercase">Şablon Seçin</label>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTemplateId(t.id)}
                  className={`py-2 px-3 rounded-xl text-center text-xs font-bold border transition-all ${
                    activeTemplateId === t.id
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
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
                      ? 'border-emerald-500 text-emerald-400 bg-stone-900/50 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                      : 'border-stone-850 text-stone-400 bg-stone-900 hover:bg-stone-850'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. ŞİRKET BİLGİLERİ */}
        <div className="border border-stone-900 bg-stone-900/20 rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-stone-900">
            <Lucide.Building2 size={14} className="text-emerald-500" />
            <span className="text-xs font-black uppercase tracking-wider text-stone-400">2. Şirket Profili</span>
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
              placeholder="Örn: www.firmaniz.ekatalog.site"
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

        {/* 3. İÇERİK EDİTÖRÜ */}
        <div className="border border-stone-900 bg-stone-900/20 rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-stone-900">
            <Lucide.ListTodo size={14} className="text-emerald-500" />
            <span className="text-xs font-black uppercase tracking-wider text-stone-400">3. Görsel İçeriği</span>
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

          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-bold text-stone-500 uppercase">Maddeler ({N}/12)</span>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-start group">
                  <span className={`font-black text-xs mt-2.5 shrink-0 ${activeTemplate.color}`}>
                    {activeTemplate.icon}
                  </span>
                  <div className="flex-1 relative">
                    <textarea
                      value={item}
                      onChange={(e) => handleItemChange(idx, e.target.value)}
                      placeholder="Madde açıklaması girin..."
                      rows={2}
                      className="w-full bg-stone-900 border border-stone-850 rounded-xl py-2 pr-8 pl-3 text-xs font-medium text-stone-300 focus:outline-none focus:border-emerald-500 resize-none custom-scrollbar"
                    />
                    {items.length > 3 && (
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="absolute right-2 top-2 text-stone-600 hover:text-red-400 p-0.5 rounded transition-colors"
                        title="Maddeyi Sil"
                      >
                        <Lucide.Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {items.length < 12 && (
              <button
                onClick={handleAddItem}
                className="w-full py-2 px-3 border border-dashed border-stone-800 rounded-xl text-xs font-bold text-stone-400 hover:text-stone-300 hover:border-stone-700 transition-colors flex items-center justify-center gap-1.5 mt-2"
              >
                <Lucide.Plus size={12} />
                <span>Yeni Madde Ekle</span>
              </button>
            )}
          </div>
        </div>

        {/* 4. DIŞA AKTAR BUTONU */}
        <button
          onClick={exportAsPng}
          disabled={isExporting}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 disabled:opacity-50 mt-auto shrink-0"
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
        <div className="scale-[0.55] sm:scale-[0.6] md:scale-[0.42] lg:scale-[0.48] xl:scale-[0.52] origin-center shrink-0 shadow-[0_30px_90px_rgba(0,0,0,0.8)] rounded-[2.5rem] overflow-hidden border-8 border-stone-950 relative">
          
          {/* Actual 1080x1920 (9:16) rendering frame */}
          <div
            ref={exportRef}
            className={`w-[1080px] h-[1920px] relative flex flex-col justify-between p-24 select-none overflow-hidden ${activePreset.class}`}
          >
            {/* Glowing mesh effects using custom radial gradient */}
            <div 
              className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none bg-[radial-gradient(circle,_var(--tw-gradient-stops))]"
              style={{ backgroundImage: `radial-gradient(circle, ${activePreset.glow.split(' ')[0].includes('emerald') ? 'rgba(16,185,129,0.15)' : activePreset.glow.split(' ')[0].includes('#A67B5B') ? 'rgba(166,123,91,0.2)' : 'rgba(59,130,246,0.15)'} 0%, transparent 70%)` }}
            ></div>
            <div 
              className="absolute bottom-0 left-0 w-[700px] h-[700px] rounded-full blur-[140px] pointer-events-none bg-[radial-gradient(circle,_var(--tw-gradient-stops))]"
              style={{ backgroundImage: `radial-gradient(circle, ${activePreset.glow.split(' ')[0].includes('emerald') ? 'rgba(16,185,129,0.15)' : activePreset.glow.split(' ')[0].includes('#A67B5B') ? 'rgba(166,123,91,0.2)' : 'rgba(59,130,246,0.15)'} 0%, transparent 70%)` }}
            ></div>

            {/* HEADER */}
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-4">
                {companyLogo ? (
                  <img src={companyLogo} alt={companyName} className="w-14 h-14 object-contain rounded-xl" />
                ) : (
                  <img src="/images/logo_dark.svg?v=5" alt="ekatalog" className="w-14 h-14" />
                )}
                <span className="text-3xl font-black tracking-tighter uppercase truncate max-w-[480px]">
                  {companyName}
                </span>
              </div>
              <span className="text-xl font-bold tracking-[0.3em] text-stone-500 uppercase">hikaye stüdyosu</span>
            </div>

            {/* MAIN CARD CONTENT */}
            <div className="relative z-10 flex-1 flex flex-col justify-center my-8">
              <h2 
                className="font-black tracking-tighter leading-tight capitalize max-w-3xl text-stone-100"
                style={{ 
                  fontSize: `${titleSizePx}px`,
                  marginBottom: `${titleMbPx}px` 
                }}
              >
                {header}
              </h2>

              <div 
                className="max-w-4xl flex flex-col"
                style={{ gap: `${gapPx}px` }}
              >
                {items.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="px-10 rounded-[1.8rem] bg-white/[0.02] border border-white/[0.04] backdrop-blur-md flex gap-6 items-start"
                    style={{ 
                      paddingTop: `${paddingYPx}px`, 
                      paddingBottom: `${paddingYPx}px` 
                    }}
                  >
                    <div className="shrink-0">
                      <div 
                        className="rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center font-black"
                        style={{ 
                          width: `${iconSizePx}px`, 
                          height: `${iconSizePx}px`,
                          fontSize: `${iconSizePx * 0.45}px`
                        }}
                      >
                        <span className={activeTemplate.color}>{activeTemplate.icon}</span>
                      </div>
                    </div>
                    <div className="flex-1" style={{ paddingTop: `${textPadTopPx}px` }}>
                      <p 
                        className="font-bold text-stone-200 leading-snug"
                        style={{ fontSize: `${fontSizePx}px` }}
                      >
                        {item || 'Madde açıklaması...'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FOOTER BAR */}
            <div className="border-t border-white/10 pt-10 flex justify-between items-center relative z-10 font-sans">
              <div className="space-y-1 max-w-[420px]">
                <span className="text-lg font-black text-stone-500 uppercase tracking-widest">KOLAYLAŞTIRIR & SATAR</span>
                <p className="text-2xl font-black text-stone-200 truncate">{companyWebsite}</p>
              </div>
              <div className="text-right max-w-[420px]">
                <span className="text-lg font-black text-stone-500 uppercase tracking-widest">DESTEK HATTI</span>
                <p className="text-2xl font-black text-emerald-400 truncate">{companyPhone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
