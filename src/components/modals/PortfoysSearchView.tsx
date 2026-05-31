import { useState } from 'react';
import * as Lucide from 'lucide-react';
import Button from '../ui/Button';
import { PortfoysLead } from '../../hooks/usePortfoysScraper';

interface PortfoysSearchViewProps {
  credits: number;
  storeName: string;
  storeId: string;
  status: 'idle' | 'scanning' | 'completed' | 'error';
  leads: PortfoysLead[];
  apiError: string | null;
  startScan: (params: { storeId: string; country: string; city: string; district?: string; keyword: string }) => Promise<void>;
  clearScan: () => void;
  
  // Confirmation state
  showConfirm: boolean;
  setShowConfirm: (show: boolean) => void;
}

const PRESET_CATEGORIES = ['Toptancı', 'Kuaför', 'Otel', 'Market', 'Kafe', 'Eczane'];

export default function PortfoysSearchView({
  credits,
  storeName,
  storeId,
  status,
  leads,
  apiError,
  startScan,
  clearScan,
  showConfirm,
  setShowConfirm,
}: PortfoysSearchViewProps) {
  // Form states
  const [keyword, setKeyword] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [district, setDistrict] = useState<string>('');

  // Validate and prompt confirmation
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim() || !city.trim()) return;
    setShowConfirm(true);
  };

  const confirmAndSearch = async () => {
    setShowConfirm(false);
    try {
      await startScan({
        storeId,
        country: 'Türkiye',
        city: city.trim(),
        district: district.trim() || undefined,
        keyword: keyword.trim(),
      });
    } catch (err) {
      console.error('[portfoys] failed to start scan:', err);
    }
  };

  // Lockout screen if quota exhausted
  if (credits <= 0) {
    const whatsappUrl = `https://wa.me/905373420161?text=Merhaba,%20eKatalog%20B2B%20Müşteri%20Bulucu%20paketimi%20yükseltmek%20istiyorum.%20Dükkan:%20${encodeURIComponent(storeName)}`;
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-inner">
          <Lucide.Lock size={36} />
        </div>
        <div className="space-y-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-stone-900 leading-tight">
            YILLIK ARAMA KOTANIZ TÜKENMİŞTİR
          </h4>
          <p className="text-[10px] font-bold text-stone-400 max-w-xs mx-auto leading-relaxed">
            Yıllık 2 arama hakkından oluşan kullanım kotanızı doldurdunuz. Tüm şehir veya Türkiye geneli B2B rehber verilerine sınırsız erişim sağlamak için paketinizi hemen yükseltin!
          </p>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
        >
          <Button
            variant="whatsapp"
            size="md"
            className="w-full flex items-center justify-center gap-2 !py-4 font-black shadow-lg shadow-emerald-100"
          >
            <Lucide.MessageSquare size={16} strokeWidth={3} />
            WHATSAPP İLE YÜKSELT
          </Button>
        </a>
      </div>
    );
  }

  // Confirmation step before spending credit
  if (showConfirm) {
    return (
      <div className="space-y-6 py-6 text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
          <Lucide.HelpCircle size={28} strokeWidth={3} />
        </div>
        <div className="space-y-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-stone-900">
            Aramayı Başlatmak İstiyor Musunuz?
          </h4>
          <p className="text-[10px] font-bold text-stone-400 max-w-xs mx-auto leading-relaxed">
            <strong>{city} {district ? `(${district})` : ''}</strong> bölgesindeki <strong>"{keyword}"</strong> araması, <strong>yıllık 2 aramalık</strong> kullanım kotanızdan <strong>1 adedini</strong> tüketecektir.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfirm(false)}
            className="flex-1"
          >
            İPTAL
          </Button>
          <Button
            variant="action"
            size="sm"
            onClick={confirmAndSearch}
            className="flex-1 text-white"
            showFingerprint={true}
          >
            TAMAM, BAŞLAT
          </Button>
        </div>
      </div>
    );
  }

  // Scanning radar view
  if (status === 'scanning') {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <div className="relative flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <div className="absolute w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
            <Lucide.Search className="text-emerald-500 animate-pulse" size={28} />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-stone-900">
            Dükkanlar Aranıyor
          </h4>
          <p className="text-[10px] font-bold text-stone-400 max-w-xs leading-relaxed">
            {city} {district ? `- ${district}` : ''} bölgesindeki "{keyword}" dükkanları aranıyor. Lütfen bekleyin...
          </p>
        </div>
      </div>
    );
  }

  // Search Results view
  if (status === 'completed' || status === 'error') {
    return (
      <div className="space-y-5 animate-in fade-in duration-300">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              mode="circle"
              onClick={() => clearScan()}
              icon={<Lucide.ArrowLeft size={16} strokeWidth={3} />}
              className="w-8 h-8"
            />
            <span className="text-[11px] font-black uppercase tracking-wider text-stone-500">
              Arama Sonuçları ({leads.length})
            </span>
          </div>
          <span className="text-[9px] px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full font-bold uppercase tracking-wider max-w-[150px] truncate">
            {city} {district ? `/ ${district}` : ''}
          </span>
        </div>

        {status === 'error' && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3 text-red-700">
            <Lucide.AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-[11px] font-black uppercase tracking-widest text-red-900">Arama Başarısız</h5>
              <p className="text-[10px] font-medium leading-relaxed">{apiError}</p>
            </div>
          </div>
        )}

        {status === 'completed' && leads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-stone-400 space-y-3">
            <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center">
              <Lucide.UserX size={24} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Aradığınız kriterlerde müşteri bulunamadı</p>
          </div>
        )}

        {status === 'completed' && leads.length > 0 && (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="p-4 bg-stone-50 border border-stone-100 rounded-2xl flex items-center justify-between gap-4 hover:bg-white hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black uppercase text-stone-900 truncate tracking-tight">
                      {lead.name}
                    </h4>
                    <span className="text-[8px] px-1.5 py-0.5 bg-stone-200/50 text-stone-600 rounded font-black uppercase tracking-wider">
                      {lead.category}
                    </span>
                  </div>
                  <p className="text-[9px] text-stone-400 font-bold tracking-tight line-clamp-1">
                    {lead.address}
                  </p>
                  {lead.website && (
                    <a
                      href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] text-blue-500 font-black hover:underline inline-flex items-center gap-0.5"
                    >
                      {lead.website}
                      <Lucide.ExternalLink size={8} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Pure Minimalist Single-Screen Search Form (No Wizards, No Dropdowns)
  return (
    <form onSubmit={handleSearchSubmit} className="space-y-5 animate-in fade-in duration-300">
      <div className="text-center space-y-1">
        <h4 className="text-xs font-black uppercase tracking-widest text-stone-500">Müşteri Bulucu</h4>
        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Hedef Sektör ve Bölgenizi Yazıp Aramayı Başlatın</p>
      </div>

      <div className="space-y-4">
        {/* Keyword field */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">Ne Arıyorsunuz? (Sektör)</label>
          <div className="relative">
            <input
              type="text"
              required
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Örn: Kuaför, Toptancı, Market, Kırtasiye..."
              className="w-full px-4 py-3 bg-stone-50 border border-stone-150 rounded-2xl text-xs font-bold text-stone-900 placeholder:text-stone-350 focus:outline-none focus:border-stone-900 focus:bg-white transition-all"
            />
            <Lucide.Search size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-450" />
          </div>
          
          {/* Quick preset categories */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {PRESET_CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setKeyword(cat)}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-200 ${
                  keyword.toLowerCase() === cat.toLowerCase()
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-stone-50 text-stone-500 hover:bg-stone-100 hover:text-stone-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Location Row (City + District) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">Hangi Şehirde?</label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Örn: İstanbul, Adana"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-150 rounded-2xl text-xs font-bold text-stone-900 placeholder:text-stone-350 focus:outline-none focus:border-stone-900 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">Hangi İlçede?</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="İlçe (İsteğe bağlı)"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-150 rounded-2xl text-xs font-bold text-stone-900 placeholder:text-stone-350 focus:outline-none focus:border-stone-900 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        disabled={!keyword.trim() || !city.trim()}
        className="w-full font-black uppercase tracking-widest py-4 mt-2 shadow-lg hover:shadow-stone-200"
      >
        Müşterileri Bul
      </Button>
    </form>
  );
}
