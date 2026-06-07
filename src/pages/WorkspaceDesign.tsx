import { useState, useRef } from 'react';
import * as Lucide from 'lucide-react';
import html2canvas from 'html2canvas';
import StudioKazanacaklar from '../components/layout/StudioKazanacaklar';

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

  // Editable "Kazanacaklarınız" Content
  const [header, setHeader] = useState('ekatalog ile Neler Kazanacaksınız?');
  const [items, setItems] = useState([
    'Tasarımcı beklemeden anında fiyat güncelleme',
    'WhatsApp üzerinden doğrudan sipariş alma',
    'Telefon faturası ile tek tıkla reklam verme',
  ]);
  const [website, setWebsite] = useState('www.dukkaniniz.ekatalog.site');

  const exportRef = useRef<HTMLDivElement>(null);

  const handleItemChange = (idx: number, value: string) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? value : item)));
  };

  const addItem = () => {
    if (items.length < 5) {
      setItems((prev) => [...prev, '']);
    }
  };

  const removeItem = (idx: number) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== idx));
    }
  };

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
      link.download = `ekatalog_kazanacaklar_${activeFormatId}.png`;
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
          <p className="text-xs text-stone-500 font-medium">Kazanacaklarınız Şablon Tasarımcısı</p>
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
            <span className="text-[10px] font-bold text-stone-500 uppercase">Katalog Adresi (Alt Bilgi)</span>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="Örn: www.dukkaniniz.ekatalog.site"
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
            <span className="text-[10px] font-bold text-stone-500 uppercase">Görsel Ana Başlığı</span>
            <input
              type="text"
              value={header}
              onChange={(e) => setHeader(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs font-bold text-stone-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-stone-500 uppercase">Kazanılacak Maddeler</span>
              {items.length < 5 && (
                <button
                  onClick={addItem}
                  className="text-[10px] font-bold text-emerald-500 hover:underline flex items-center gap-0.5"
                >
                  <Lucide.Plus size={10} /> Madde Ekle
                </button>
              )}
            </div>

            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleItemChange(idx, e.target.value)}
                  placeholder="Madde yazın..."
                  className="flex-1 bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs font-medium text-stone-200 focus:outline-none focus:border-emerald-500"
                />
                {items.length > 1 && (
                  <button
                    onClick={() => removeItem(idx)}
                    className="p-2 text-stone-500 hover:text-red-400 transition-colors"
                  >
                    <Lucide.Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
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
            <div ref={exportRef} className="w-full h-full">
              <StudioKazanacaklar
                header={header}
                items={items}
                website={website}
                presetClass={activePreset.class}
                glowColor={glowColorVal}
                isLight={isLight}
                formatType={activeFormat.type}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
