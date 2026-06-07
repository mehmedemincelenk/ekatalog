import { useState, useRef } from 'react';
import * as Lucide from 'lucide-react';
import html2canvas from 'html2canvas';
import StudioWebAdres from '../components/layout/StudioWebAdres';

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
    id: 'light',
    name: 'Clean Light',
    class: 'bg-stone-50 text-stone-900 border border-stone-200/50',
    glow: 'from-stone-200/40 to-transparent',
    colorMode: 'light',
  },
];

const FORMATS = [
  { id: 'highlight', name: 'Instagram Hikaye (9:16)', width: 1080, height: 1920, previewScale: 0.35, type: 'story' as const },
  { id: 'post', name: 'Instagram Gönderi (1:1)', width: 1080, height: 1080, previewScale: 0.52, type: 'post' as const },
];

export default function WorkspaceDesign() {
  const [activeFormatId, setActiveFormatId] = useState('highlight');
  const activeFormat = FORMATS.find((f) => f.id === activeFormatId) || FORMATS[0];

  const [activePreset, setActivePreset] = useState(PRESETS[0]);
  const [isExporting, setIsExporting] = useState(false);

  // Editable inputs for the first feature: Web Address
  const [title, setTitle] = useState('Kendi Web Adresiniz');
  const [desc, setDesc] = useState("ekatalog'un hediyesi www.sirketadim.ekatalog.site adresiyle dükkanınız 7/24 kesintisiz yayın yapar.");
  const [website, setWebsite] = useState('www.sirketadim.ekatalog.site');

  const exportRef = useRef<HTMLDivElement>(null);

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
      link.download = `ekatalog_web_adresi_${activeFormatId}.png`;
      link.href = imgData;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const isLight = activePreset.colorMode === 'light';
  const glowColorVal = activePreset.glow.split(' ')[0].includes('emerald')
    ? 'rgba(16,185,129,0.12)'
    : activePreset.glow.split(' ')[0].includes('#A67B5B')
    ? 'rgba(166,123,91,0.15)'
    : 'rgba(220,38,38,0.12)';

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 font-sans flex flex-col md:flex-row">
      {/* SIDEBAR CONTROL */}
      <div className="w-full md:w-[420px] border-b md:border-b-0 md:border-r border-stone-800 bg-stone-950 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 custom-scrollbar">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <img src="/images/logo_dark.svg?v=5" alt="ekatalog" className="w-6 h-6" />
            <h1 className="text-xl font-black tracking-tight">ekatalog stüdyo</h1>
          </div>
          <p className="text-xs text-stone-500 font-medium">Özellik Tasarım Stüdyosu (1. Web Adresi)</p>
        </div>

        {/* FORMAT SEÇİMİ */}
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

        {/* TEMA VE BAĞLANTI */}
        <div className="border border-stone-900 bg-stone-900/20 rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-stone-900">
            <Lucide.Palette size={14} className="text-emerald-500" />
            <span className="text-xs font-black uppercase tracking-wider text-stone-400">2. Stil & Web Adresi</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-stone-500 uppercase">Görsel Teması</label>
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
            <span className="text-[10px] font-bold text-stone-500 uppercase">Görsel Web Adresi (Örnek)</span>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="Örn: www.firmaniz.com"
              className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs font-medium text-stone-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* İÇERİK EDİTÖRÜ */}
        <div className="border border-stone-900 bg-stone-900/20 rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-stone-900">
            <Lucide.ListTodo size={14} className="text-emerald-500" />
            <span className="text-xs font-black uppercase tracking-wider text-stone-400">3. İçerik Düzenleme</span>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-stone-500 uppercase">Özellik Başlığı</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs font-bold text-stone-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-stone-500 uppercase">Özellik Açıklaması</span>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs font-medium text-stone-300 focus:outline-none focus:border-emerald-500 resize-none custom-scrollbar"
            />
          </div>
        </div>

        {/* DIŞA AKTAR BUTTON */}
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
              <span>PNG Olarak Kaydet</span>
            </>
          )}
        </button>
      </div>

      {/* Off-screen high-res container for exporting (no CSS scale transforms) */}
      <div 
        style={{ 
          position: 'absolute',
          left: '-9999px',
          top: '-9999px',
          width: `${activeFormat.width}px`,
          height: `${activeFormat.height}px`,
          pointerEvents: 'none',
        }}
      >
        <div 
          ref={exportRef} 
          style={{ width: `${activeFormat.width}px`, height: `${activeFormat.height}px` }}
          className="relative"
        >
          <StudioWebAdres
            title={title}
            desc={desc}
            website={website}
            presetClass={activePreset.class}
            glowColor={glowColorVal}
            isLight={isLight}
          />
        </div>
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
            <div 
              style={{ width: `${activeFormat.width}px`, height: `${activeFormat.height}px` }}
              className="relative"
            >
              <StudioWebAdres
                title={title}
                desc={desc}
                website={website}
                presetClass={activePreset.class}
                glowColor={glowColorVal}
                isLight={isLight}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
