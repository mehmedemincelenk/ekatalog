import { useState, useRef } from 'react';
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
  { id: 'highlight', name: 'Instagram Hikaye (9:16)', width: 1080, height: 1920, previewScale: 0.35, type: 'list' },
  { id: 'post', name: 'Instagram Gönderi (1:1)', width: 1080, height: 1080, previewScale: 0.52, type: 'list' },
  { id: 'print', name: 'Masa Kartı / Kartvizit (2:3)', width: 1000, height: 1500, previewScale: 0.40, type: 'qr' },
];

const DEFAULT_FEATURES = [
  {
    id: 'yonetim',
    title: 'Anında Fiyat Güncelleme',
    desc: 'Tasarımcı beklemeden tüm fiyatlarınızı cep telefonunuzdan saniyeler içinde anında güncelleyin.',
    iconName: 'Sliders' as const,
    color: 'text-emerald-400',
  },
  {
    id: 'kayan_menu',
    title: 'Kayan WhatsApp Menüsü',
    desc: 'Müşterileriniz tek tıkla sipariş versin, arama yapsın veya anında yol tarifi alsın.',
    iconName: 'MessageSquare' as const,
    color: 'text-emerald-400',
  },
  {
    id: 'doviz',
    title: 'Döviz Çevirici Entegrasyonu',
    desc: 'Dükkandaki fiyatları tek tıkla USD, EUR ve TRY arasında kur farkı olmadan dönüştürün.',
    iconName: 'Globe' as const,
    color: 'text-blue-400',
  },
  {
    id: 'reklam',
    title: 'Tek Tıkla Reklam Verme',
    desc: 'Sosyal medya reklamlarınızı dükkanınızdan başlatın, bedeli cep telefonu faturanıza yansısın.',
    iconName: 'Megaphone' as const,
    color: 'text-purple-400',
  },
];

function DynamicIcon({ name, className, size = 24 }: { name: string; className?: string; size?: number }) {
  switch (name) {
    case 'Sliders':
      return <Lucide.Sliders className={className} size={size} />;
    case 'MessageSquare':
      return <Lucide.MessageSquare className={className} size={size} />;
    case 'Globe':
      return <Lucide.Globe className={className} size={size} />;
    case 'Megaphone':
      return <Lucide.Megaphone className={className} size={size} />;
    default:
      return <Lucide.Check className={className} size={size} />;
  }
}

export default function WorkspaceDesign() {
  const [activeFormatId, setActiveFormatId] = useState('highlight');
  const activeFormat = FORMATS.find((f) => f.id === activeFormatId) || FORMATS[0];

  const [activePreset, setActivePreset] = useState(PRESETS[0]);
  const [isExporting, setIsExporting] = useState(false);

  // Editable Titles / Texts
  const [mainHeader, setMainHeader] = useState('Kazanacaklarınız');
  const [qrHeader, setQrHeader] = useState('Dijital Menümüzü İnceleyin');
  const [qrSubtitle, setQrSubtitle] = useState('Ürünleri ve güncel fiyatları görmek için telefonunuzun kamerasıyla okutun.');

  const [features, setFeatures] = useState(DEFAULT_FEATURES);
  const [companyWebsite, setCompanyWebsite] = useState('www.dukkanim.ekatalog.site');

  const exportRef = useRef<HTMLDivElement>(null);

  // Sync preset colors on print format selection
  const handleFormatChange = (formatId: string) => {
    setActiveFormatId(formatId);
    if (formatId === 'print') {
      setActivePreset(PRESETS.find((p) => p.id === 'kraft') || PRESETS[2]);
    } else {
      setActivePreset(PRESETS.find((p) => p.id === 'emerald') || PRESETS[0]);
    }
  };

  const handleFeatureChange = (id: string, field: 'title' | 'desc', val: string) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: val } : f))
    );
  };

  // High Resolution PNG Export
  const exportAsPng = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);

    try {
      if (document.fonts) {
        await document.fonts.ready;
      }

      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
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
      link.download = `ekatalog_${activeFormatId}.png`;
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
                onClick={() => handleFormatChange(f.id)}
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

        {/* 2. ARKA PLAN VE ADRES */}
        <div className="border border-stone-900 bg-stone-900/20 rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-stone-900">
            <Lucide.Palette size={14} className="text-emerald-500" />
            <span className="text-xs font-black uppercase tracking-wider text-stone-400">2. Tema & Bağlantı</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-stone-500 uppercase">Tema Seçin</label>
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

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase">Katalog Web Adresi</span>
            <input
              type="text"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              placeholder="Örn: www.dukkanim.ekatalog.site"
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

          {activeFormat.type === 'list' ? (
            <>
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-stone-500 uppercase">Görsel Başlığı</span>
                <input
                  type="text"
                  value={mainHeader}
                  onChange={(e) => setMainHeader(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs font-bold text-stone-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-4 pt-2">
                <span className="text-[10px] font-bold text-stone-500 uppercase">Kritik Özellikler</span>
                {features.map((f) => (
                  <div key={f.id} className="space-y-2 border-l border-stone-800 pl-3">
                    <input
                      type="text"
                      value={f.title}
                      onChange={(e) => handleFeatureChange(f.id, 'title', e.target.value)}
                      placeholder="Özellik Başlığı"
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg py-1.5 px-3 text-xs font-bold text-stone-200 focus:outline-none focus:border-emerald-500"
                    />
                    <textarea
                      value={f.desc}
                      onChange={(e) => handleFeatureChange(f.id, 'desc', e.target.value)}
                      placeholder="Özellik Açıklaması"
                      rows={2}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg py-1.5 px-3 text-xs font-medium text-stone-300 focus:outline-none focus:border-emerald-500 resize-none custom-scrollbar"
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-stone-500 uppercase">Görsel Başlığı</span>
                <input
                  type="text"
                  value={qrHeader}
                  onChange={(e) => setQrHeader(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs font-bold text-stone-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-stone-500 uppercase">Yönlendirme Açıklaması</span>
                <textarea
                  value={qrSubtitle}
                  onChange={(e) => setQrSubtitle(e.target.value)}
                  rows={3}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs font-medium text-stone-300 focus:outline-none focus:border-emerald-500 resize-none custom-scrollbar"
                />
              </div>
            </>
          )}
        </div>

        {/* 4. DIŞA AKTAR */}
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
              className={`w-full h-full relative flex flex-col justify-between p-24 select-none overflow-hidden ${activePreset.class}`}
            >
              {/* Background gradient glow (Dark modes only) */}
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

              {/* -------------------- LAYOUT: FEATURES LIST (Hikaye / Gönderi) -------------------- */}
              {activeFormat.type === 'list' && (
                <>
                  {/* Top Header */}
                  <div className="flex justify-between items-center relative z-10">
                    <span className="text-xl font-bold tracking-[0.3em] text-stone-500 uppercase">Kazanacaklarınız</span>
                    <span className="text-sm font-bold tracking-[0.1em] text-stone-500 uppercase">{activeFormatId === 'highlight' ? 'Instagram Hikaye' : 'Instagram Gönderi'}</span>
                  </div>

                  {/* Body Content */}
                  <div className="relative z-10 flex-1 flex flex-col justify-center gap-12 my-6">
                    <h2 className={`text-6xl font-black tracking-tighter leading-tight ${isLight ? 'text-stone-900' : 'text-stone-100'} pl-2`}>
                      {mainHeader}
                    </h2>

                    <div className="flex flex-col gap-6">
                      {features.map((f) => (
                        <div 
                          key={f.id}
                          className={`p-8 rounded-[2rem] border backdrop-blur-md flex gap-6 items-center transition-all ${
                            isLight 
                              ? 'bg-stone-100/40 border-stone-200/50' 
                              : 'bg-white/[0.02] border-white/[0.04]'
                          }`}
                        >
                          <div className="shrink-0">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isLight ? 'bg-stone-200 text-stone-900 border border-stone-300' : 'bg-white/[0.03] border border-white/[0.06]'}`}>
                              <DynamicIcon name={f.iconName} className={isLight ? 'text-stone-850' : f.color} size={24} />
                            </div>
                          </div>
                          <div className="flex-1 space-y-1 text-left">
                            <h4 className={`text-2xl font-black tracking-tight ${isLight ? 'text-stone-900' : 'text-stone-100'}`}>
                              {f.title}
                            </h4>
                            <p className={`text-[17px] font-medium leading-relaxed ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
                              {f.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Minimal Bottom Link */}
                  <div className="flex justify-center items-center relative z-10">
                    <span className={`text-2xl font-black tracking-wide ${isLight ? 'text-stone-900' : 'text-stone-200'}`}>
                      {companyWebsite}
                    </span>
                  </div>
                </>
              )}

              {/* -------------------- LAYOUT: QR CODE PRINT CARD (Masa Kartı) -------------------- */}
              {activeFormat.type === 'qr' && (
                <>
                  {/* Space at top */}
                  <div className="relative z-10 mt-6" />

                  {/* Main QR Code & Instruction Block */}
                  <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center gap-10">
                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-stone-200 flex items-center justify-center relative scale-110">
                      <QRCodeSVG
                        value={companyWebsite.startsWith('http') ? companyWebsite : `https://${companyWebsite}`}
                        size={320}
                        level="H"
                        includeMargin={false}
                      />
                    </div>
                    
                    <div className="space-y-4 max-w-[720px] mx-auto mt-6">
                      <h2 className={`text-5xl font-black tracking-tight leading-tight ${isLight ? 'text-stone-900' : 'text-stone-100'}`}>
                        {qrHeader}
                      </h2>
                      <p className={`text-2xl font-medium leading-relaxed ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
                        {qrSubtitle}
                      </p>
                    </div>
                  </div>

                  {/* Footer Web link */}
                  <div className="flex flex-col items-center justify-center relative z-10 mb-6 gap-2">
                    <span className="text-xs font-black text-stone-500 uppercase tracking-widest">GÜNCEL KATALOG ADRESİMİZ</span>
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
