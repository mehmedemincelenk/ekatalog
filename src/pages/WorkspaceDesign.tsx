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
  const [activeTemplate, setActiveTemplate] = useState(TEMPLATES[0]);
  const [items, setItems] = useState<string[]>(TEMPLATES[0].items);
  const [header, setHeader] = useState(TEMPLATES[0].header);
  const [activePreset, setActivePreset] = useState(PRESETS[0]);
  const [isExporting, setIsExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const handleTemplateChange = (templateId: string) => {
    const temp = TEMPLATES.find((t) => t.id === templateId);
    if (temp) {
      setActiveTemplate(temp);
      setItems(temp.items);
      setHeader(temp.header);
    }
  };

  const handleItemChange = (index: number, val: string) => {
    const updated = [...items];
    updated[index] = val;
    setItems(updated);
  };

  // Advanced Pixel-Perfect Export using html2canvas API
  const exportAsPng = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);

    try {
      // Ensure all custom fonts are completely loaded before capturing
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
      link.download = `ekatalog_story_${activeTemplate.id}.png`;
      link.href = imgData;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Math-based continuous scaling engine to prevent layout breakages:
  const N = items.length;
  
  // Font sizes scale continuously based on item count
  const fontSizePx = Math.max(28, Math.min(38, Math.round(44 - (N * 1.5))));
  const titleSizePx = Math.max(74, Math.min(100, Math.round(112 - (N * 3.6))));
  const iconSizePx = Math.max(54, Math.min(74, Math.round(86 - (N * 3.2))));
  
  // Padding & Gaps scale continuously
  const paddingYPx = Math.max(16, Math.min(32, Math.round(36 - (N * 2))));
  const gapPx = Math.max(20, Math.min(60, Math.round(220 / (N - 2 || 1))));

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 font-sans flex flex-col md:flex-row">
      {/* SIDEBAR: CONTROLS */}
      <div className="w-full md:w-[400px] border-b md:border-b-0 md:border-r border-stone-800 bg-stone-950 p-6 flex flex-col gap-6 overflow-y-auto shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <img src="/images/logo_dark.svg?v=5" alt="ekatalog" className="w-6 h-6" />
            <h1 className="text-xl font-black tracking-tight">ekatalog stüdyo</h1>
          </div>
          <p className="text-xs text-stone-500 font-medium">Instagram Öne Çıkarılanlar ve Hikaye Görseli Tasarımcısı</p>
        </div>

        {/* 1. Şablon Seçici */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-stone-400">1. Şablon Seçin</label>
          <div className="grid grid-cols-1 gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTemplateChange(t.id)}
                className={`py-2.5 px-4 rounded-xl text-left text-sm font-bold border transition-all ${
                  activeTemplate.id === t.id
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-850'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Renk Teması */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-stone-400">2. Arkaplan Teması</label>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => setActivePreset(p)}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all text-center ${
                  activePreset.name === p.name
                    ? 'border-white text-white bg-stone-800'
                    : 'border-stone-800 text-stone-400 bg-stone-900 hover:bg-stone-850'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* 3. İçerik Düzenleme */}
        <div className="space-y-3 flex-1">
          <label className="text-xs font-black uppercase tracking-wider text-stone-400">3. Görsel İçeriği Düzenle</label>
          
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase">Başlık</span>
            <input
              type="text"
              value={header}
              onChange={(e) => setHeader(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-sm font-bold text-stone-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-2.5 pt-2">
            <span className="text-[10px] font-bold text-stone-500 uppercase">Maddeler</span>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <span className={`font-black text-sm mt-1.5 shrink-0 ${activeTemplate.color}`}>
                  {activeTemplate.icon}
                </span>
                <textarea
                  value={item}
                  onChange={(e) => handleItemChange(idx, e.target.value)}
                  rows={2}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg py-1.5 px-3 text-xs font-medium text-stone-300 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 4. Dışa Aktar Butonu */}
        <button
          onClick={exportAsPng}
          disabled={isExporting}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 disabled:opacity-50"
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
            {/* Glowing mesh effects */}
            <div className={`absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial ${activePreset.glow} rounded-full blur-[120px] pointer-events-none`}></div>
            <div className={`absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-radial ${activePreset.glow} rounded-full blur-[140px] pointer-events-none`}></div>

            {/* HEADER */}
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-4">
                <img src="/images/logo_dark.svg?v=5" alt="ekatalog" className="w-14 h-14" />
                <span className="text-3xl font-black tracking-tighter uppercase">ekatalog</span>
              </div>
              <span className="text-xl font-bold tracking-[0.3em] text-stone-500 uppercase">hikaye stüdyosu</span>
            </div>

            {/* MAIN CARD CONTENT */}
            <div className="relative z-10 flex-1 flex flex-col justify-center my-8">
              <h2 
                className="font-black tracking-tighter leading-tight capitalize max-w-3xl text-stone-100 mb-8"
                style={{ fontSize: `${titleSizePx}px` }}
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
                    className="px-8 rounded-[1.8rem] bg-white/[0.02] border border-white/[0.04] backdrop-blur-md flex gap-6 items-start"
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
                    <div className="flex-1 pt-2.5">
                      <p 
                        className="font-bold text-stone-200 leading-snug"
                        style={{ fontSize: `${fontSizePx}px` }}
                      >
                        {item}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FOOTER BAR */}
            <div className="border-t border-white/10 pt-10 flex justify-between items-center relative z-10">
              <div className="space-y-1">
                <span className="text-lg font-black text-stone-500 uppercase tracking-widest">KOLAYLAŞTIRIR & SATAR</span>
                <p className="text-2xl font-black text-stone-200">www.sirketiniz.ekatalog.site</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-stone-500 uppercase tracking-widest">DESTEK HATTI</span>
                <p className="text-2xl font-black text-emerald-400">+90 537 342 01 61</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
