import { useState, useRef } from 'react';
import * as Lucide from 'lucide-react';
import html2canvas from 'html2canvas';
import StudioWebAdres from '../components/layout/StudioWebAdres';
import StudioKazanacaklar from '../components/layout/StudioKazanacaklar';
import StudioB2BRehber from '../components/layout/StudioB2BRehber';
import StudioKurtulacaklar from '../components/layout/StudioKurtulacaklar';
import StudioKazanacaklarCarousel from '../components/layout/StudioKazanacaklarCarousel';

const PRESETS = [
  {
    id: 'emerald',
    name: 'Emerald Glow',
    class: 'bg-gradient-to-tr from-emerald-950 via-stone-950 to-stone-900 text-white',
    glowColor: 'rgba(16,185,129,0.12)',
    colorMode: 'dark',
  },
  {
    id: 'dark',
    name: 'Sleek Dark',
    class: 'bg-stone-950 text-white',
    glowColor: 'rgba(255,255,255,0.03)',
    colorMode: 'dark',
  },
  {
    id: 'kraft',
    name: 'Kraft Earthy',
    class: 'bg-gradient-to-tr from-[#2F1F13] via-[#1C120B] to-stone-950 text-white',
    glowColor: 'rgba(166,123,91,0.12)',
    colorMode: 'dark',
  },
  {
    id: 'pink',
    name: 'Sunset Pink',
    class: 'bg-gradient-to-tr from-[#3D0C27] via-[#1A0612] to-stone-950 text-white',
    glowColor: 'rgba(255,0,105,0.12)',
    colorMode: 'dark',
  },
  {
    id: 'light',
    name: 'Clean Light',
    class: 'bg-stone-50 text-stone-900 border border-stone-200/50',
    glowColor: 'rgba(0,0,0,0.02)',
    colorMode: 'light',
  },
];

const FORMATS = [
  { id: 'highlight', name: 'Instagram Hikaye (9:16)', width: 1080, height: 1920, previewScale: 0.35, type: 'story' as const },
  { id: 'post', name: 'Instagram Gönderi (1:1)', width: 1080, height: 1080, previewScale: 0.52, type: 'post' as const },
];

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'list' | 'select';
  defaultValue: any;
  options?: { value: any; label: string }[];
}

interface ProductionConfig {
  id: string;
  name: string;
  icon: string;
  fields: FieldConfig[];
  render: (
    values: any,
    presetClass: string,
    glowColor: string,
    isLight: boolean,
    formatType: 'story' | 'post'
  ) => React.ReactNode;
}

const PRODUCTIONS: ProductionConfig[] = [
  {
    id: 'web-adres',
    name: 'Web Adresi',
    icon: 'Link',
    fields: [
      { key: 'title', label: 'Özellik Başlığı', type: 'text', defaultValue: 'Kendi Web Adresiniz' },
      {
        key: 'desc',
        label: 'Özellik Açıklaması',
        type: 'textarea',
        defaultValue: "ekatalog'un hediyesi www.sirketadim.ekatalog.site adresiyle dükkanınız 7/24 kesintisiz yayın yapar.",
      },
      { key: 'website', label: 'Görsel Web Adresi', type: 'text', defaultValue: 'www.sirketadim.ekatalog.site' },
    ],
    render: (values, presetClass, glowColor, isLight) => (
      <StudioWebAdres
        title={values.title}
        desc={values.desc}
        website={values.website}
        presetClass={presetClass}
        glowColor={glowColor}
        isLight={isLight}
      />
    ),
  },
  {
    id: 'b2b-rehber',
    name: 'B2B Rehber',
    icon: 'Users',
    fields: [
      { key: 'title', label: 'Özellik Başlığı', type: 'text', defaultValue: 'eKatalog Rehberim & B2B Müşteri Bulucu' },
      {
        key: 'desc',
        label: 'Özellik Açıklaması',
        type: 'textarea',
        defaultValue: 'Sektörünüzdeki diğer kurumsal firmalara, toptancılara veya potansiyel müşterilere tek tıkla ulaşın.',
      },
      { key: 'searchQuery', label: 'Görsel Arama Terimi', type: 'text', defaultValue: 'Oto Çekici' },
      { key: 'leadName1', label: '1. Şirket Adı', type: 'text', defaultValue: 'Kaya Ambalaj A.Ş.' },
      { key: 'leadInfo1', label: '1. Şirket Detayı', type: 'text', defaultValue: 'Toptan Karton Kutu İmalatı' },
      { key: 'leadName2', label: '2. Şirket Adı', type: 'text', defaultValue: 'Başakşehir Oto Çekici' },
      { key: 'leadInfo2', label: '2. Şirket Detayı', type: 'text', defaultValue: 'Yol Yardım & Çekici Hizmetleri' },
      { key: 'website', label: 'Görsel Web Adresi', type: 'text', defaultValue: 'www.sirketadim.ekatalog.site' },
    ],
    render: (values, presetClass, glowColor, isLight, formatType) => (
      <StudioB2BRehber
        title={values.title}
        desc={values.desc}
        searchQuery={values.searchQuery}
        leadName1={values.leadName1}
        leadInfo1={values.leadInfo1}
        leadName2={values.leadName2}
        leadInfo2={values.leadInfo2}
        website={values.website}
        presetClass={presetClass}
        glowColor={glowColor}
        isLight={isLight}
        formatType={formatType}
      />
    ),
  },
  {
    id: 'kazanacaklar',
    name: 'Kazanacaklarınız',
    icon: 'CheckSquare',
    fields: [
      { key: 'header', label: 'Başlık', type: 'text', defaultValue: 'ekatalog ile Neler Kazanacaksınız?' },
      {
        key: 'items',
        label: 'Maddeler',
        type: 'list',
        defaultValue: [
          '7/24 Kesintisiz Sipariş Alımı',
          'Sıfır Komisyon, Doğrudan Satış',
          'Arama Motorlarında Kolay Bulunma',
        ],
      },
      { key: 'website', label: 'Görsel Web Adresi', type: 'text', defaultValue: 'www.sirketadim.ekatalog.site' },
    ],
    render: (values, presetClass, glowColor, isLight, formatType) => (
      <StudioKazanacaklar
        header={values.header}
        items={values.items}
        website={values.website}
        presetClass={presetClass}
        glowColor={glowColor}
        isLight={isLight}
        formatType={formatType}
      />
    ),
  },
  {
    id: 'kurtulacaklar',
    name: 'Kurtulacaklarınız',
    icon: 'AlertTriangle',
    fields: [
      { key: 'header', label: 'Başlık', type: 'text', defaultValue: 'bikaç tıkla kurtulacaklarınız' },
      {
        key: 'items',
        label: 'Maddeler',
        type: 'list',
        defaultValue: [
          'fiyat değişikliklerine yetişememek',
          'tasarımcı/yazılımcı beklemek',
          'karmaşa',
          'maliyetler',
        ],
      },
      { key: 'website', label: 'Görsel Web Adresi', type: 'text', defaultValue: 'www.sirketadim.ekatalog.site' },
    ],
    render: (values, presetClass, glowColor, isLight, formatType) => (
      <StudioKurtulacaklar
        header={values.header}
        items={values.items}
        website={values.website}
        presetClass={presetClass}
        glowColor={glowColor}
        isLight={isLight}
        formatType={formatType}
      />
    ),
  },
  {
    id: 'kazanacaklar-carousel',
    name: 'Kazanacaklar (Kaydırmalı)',
    icon: 'Copy',
    fields: [
      {
        key: 'activeSlide',
        label: 'Aktif Slayt (Kaydırarak İndirin)',
        type: 'select',
        defaultValue: 0,
        options: [
          { value: 0, label: '1. Slayt - Giriş/Kapak' },
          { value: 1, label: '2. Slayt - Teknoloji' },
          { value: 2, label: '3. Slayt - Reklam' },
          { value: 3, label: '4. Slayt - Tasarım' },
          { value: 4, label: '5. Slayt - Değerler/Badges' },
        ],
      },
      { key: 'website', label: 'Görsel Web Adresi', type: 'text', defaultValue: 'www.sirketadim.ekatalog.site' },
    ],
    render: (values, presetClass, glowColor, isLight, formatType) => (
      <StudioKazanacaklarCarousel
        activeSlide={values.activeSlide ?? 0}
        website={values.website}
        presetClass={presetClass}
        glowColor={glowColor}
        isLight={isLight}
        formatType={formatType}
      />
    ),
  },
];

export default function WorkspaceDesign() {
  const [activeFormatId, setActiveFormatId] = useState('highlight');
  const activeFormat = FORMATS.find((f) => f.id === activeFormatId) || FORMATS[0];

  const [activePreset, setActivePreset] = useState(PRESETS[0]);
  const [isExporting, setIsExporting] = useState(false);

  const [activeProductionId, setActiveProductionId] = useState('web-adres');
  const activeProduction = PRODUCTIONS.find((p) => p.id === activeProductionId) || PRODUCTIONS[0];

  // Dynamic state container grouped by production template id to avoid input data loss during switching
  const [productionValues, setProductionValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    PRODUCTIONS.forEach((prod) => {
      initial[prod.id] = {};
      prod.fields.forEach((f) => {
        initial[prod.id][f.key] = f.defaultValue;
      });
    });
    return initial;
  });

  const values = productionValues[activeProductionId] || {};

  const updateValue = (key: string, val: any) => {
    setProductionValues((prev) => ({
      ...prev,
      [activeProductionId]: {
        ...prev[activeProductionId],
        [key]: val,
      },
    }));
  };

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
      link.download = `ekatalog_${activeProductionId}_${activeFormatId}.png`;
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
      {/* SIDEBAR CONTROL */}
      <div className="w-full md:w-[420px] border-b md:border-b-0 md:border-r border-stone-800 bg-stone-950 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 custom-scrollbar">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <img src="/images/logo_dark.svg?v=5" alt="ekatalog" className="w-6 h-6" />
            <h1 className="text-xl font-black tracking-tight">ekatalog stüdyo</h1>
          </div>
          <p className="text-xs text-stone-500 font-medium">Özellik Tasarım Stüdyosu ({activeProduction.name})</p>
        </div>

        {/* ÜRETİM POSTU SEÇİMİ */}
        <div className="border border-stone-900 bg-stone-900/20 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-stone-900">
            <Lucide.Layers size={14} className="text-emerald-500" />
            <span className="text-xs font-black uppercase tracking-wider text-stone-400">1. Post Seçimi</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {PRODUCTIONS.map((prod) => {
              const isSelected = activeProductionId === prod.id;
              const Icon = (Lucide as any)[prod.icon] || Lucide.FileText;
              return (
                <button
                  key={prod.id}
                  onClick={() => setActiveProductionId(prod.id)}
                  className={`py-2.5 px-3 rounded-xl text-left text-xs font-bold border transition-all flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                      : 'bg-stone-900 border-stone-850 text-stone-400 hover:bg-stone-850'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon size={14} />
                    <span>{prod.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* FORMAT SEÇİMİ */}
        <div className="border border-stone-900 bg-stone-900/20 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-stone-900">
            <Lucide.Maximize size={14} className="text-emerald-500" />
            <span className="text-xs font-black uppercase tracking-wider text-stone-400">2. Görsel Formatı</span>
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
            <span className="text-xs font-black uppercase tracking-wider text-stone-400">3. Stil ve Tema</span>
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
        </div>

        {/* İÇERİK EDİTÖRÜ */}
        <div className="border border-stone-900 bg-stone-900/20 rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-stone-900">
            <Lucide.ListTodo size={14} className="text-emerald-500" />
            <span className="text-xs font-black uppercase tracking-wider text-stone-400">4. İçerik Düzenleme</span>
          </div>

          {activeProduction.fields.map((field) => {
            if (field.type === 'text') {
              return (
                <div key={field.key} className="space-y-2">
                  <span className="text-[10px] font-bold text-stone-500 uppercase">{field.label}</span>
                  <input
                    type="text"
                    value={values[field.key] || ''}
                    onChange={(e) => updateValue(field.key, e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs font-bold text-stone-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              );
            }
            if (field.type === 'textarea') {
              return (
                <div key={field.key} className="space-y-2">
                  <span className="text-[10px] font-bold text-stone-500 uppercase">{field.label}</span>
                  <textarea
                    value={values[field.key] || ''}
                    onChange={(e) => updateValue(field.key, e.target.value)}
                    rows={3}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs font-medium text-stone-300 focus:outline-none focus:border-emerald-500 resize-none custom-scrollbar"
                  />
                </div>
              );
            }
            if (field.type === 'list') {
              return (
                <div key={field.key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-stone-500 uppercase">{field.label}</span>
                    <button
                      onClick={() => {
                        const currentList = values[field.key] || [];
                        updateValue(field.key, [...currentList, '']);
                      }}
                      className="text-[10px] font-black text-emerald-500 hover:text-emerald-400 flex items-center gap-1"
                    >
                      <Lucide.Plus size={10} strokeWidth={3} /> Ekle
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                    {(values[field.key] || []).map((item: string, index: number) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const newList = [...(values[field.key] || [])];
                            newList[index] = e.target.value;
                            updateValue(field.key, newList);
                          }}
                          className="flex-1 bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs font-medium text-stone-200 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          onClick={() => {
                            const newList = (values[field.key] || []).filter((_: any, i: number) => i !== index);
                            updateValue(field.key, newList);
                          }}
                          className="p-2 text-stone-500 hover:text-red-400 bg-stone-900 border border-stone-800 rounded-lg flex items-center justify-center shrink-0"
                        >
                          <Lucide.Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            if (field.type === 'select') {
              return (
                <div key={field.key} className="space-y-2">
                  <span className="text-[10px] font-bold text-stone-500 uppercase">{field.label}</span>
                  <select
                    value={values[field.key] ?? field.defaultValue}
                    onChange={(e) => updateValue(field.key, Number(e.target.value))}
                    className="w-full bg-stone-900 border border-stone-850 rounded-lg py-2 px-3 text-xs font-bold text-stone-200 focus:outline-none focus:border-emerald-500"
                  >
                    {(field.options || []).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }
            return null;
          })}
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
          {activeProduction.render(
            values,
            activePreset.class,
            activePreset.glowColor,
            isLight,
            activeFormat.type
          )}
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
              {activeProduction.render(
                values,
                activePreset.class,
                activePreset.glowColor,
                isLight,
                activeFormat.type
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
