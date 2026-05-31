import { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import Button from '../ui/Button';
import Loading from '../ui/Loading';
import { PORTFOYS_COUNTRIES, PRESET_CATEGORIES } from '../../utils/portfoysLocations';
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
  getCities: (country: string) => Promise<string[]>;
  getDistricts: (country: string, city: string) => Promise<string[]>;
  onSaveLead: (lead: PortfoysLead, context: { country: string; city: string; district: string }) => Promise<void>;
  isLeadAlreadySaved: (phone: string | null) => boolean;
  
  // Hoisted state to sync with main modal header
  activeStep: number;
  setActiveStep: (step: number) => void;
  showConfirm: boolean;
  setShowConfirm: (show: boolean) => void;
}

export default function PortfoysSearchView({
  credits,
  storeName,
  storeId,
  status,
  leads,
  apiError,
  startScan,
  clearScan,
  getCities,
  getDistricts,
  onSaveLead,
  isLeadAlreadySaved,
  activeStep,
  setActiveStep,
  showConfirm,
  setShowConfirm,
}: PortfoysSearchViewProps) {
  // Form states
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');

  // Dropdown options loading states
  const [cities, setCities] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [loadingLocations, setLoadingLocations] = useState<boolean>(false);

  // Load cities when country changes
  useEffect(() => {
    if (selectedCountry) {
      setLoadingLocations(true);
      getCities(selectedCountry).then((res) => {
        setCities(res);
        setLoadingLocations(false);
      });
    } else {
      setCities([]);
    }
    setSelectedCity('');
    setSelectedDistrict('');
  }, [selectedCountry, getCities]);

  // Load districts when city changes
  useEffect(() => {
    if (selectedCity && selectedCountry) {
      setLoadingLocations(true);
      getDistricts(selectedCountry, selectedCity).then((res) => {
        setDistricts(res);
        setLoadingLocations(false);
      });
    } else {
      setDistricts([]);
    }
    setSelectedDistrict('');
  }, [selectedCity, selectedCountry, getDistricts]);

  // Auto-advance step handlers
  const handleSelectCountry = (country: string) => {
    setSelectedCountry(country);
    setActiveStep(2);
  };

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    setActiveStep(3);
  };

  const handleSelectDistrict = (district: string) => {
    setSelectedDistrict(district);
    setActiveStep(4);
  };

  // Perform search
  const handleSearchSubmit = async () => {
    if (!selectedCountry || !selectedCity || !keyword.trim()) return;
    setShowConfirm(true);
  };

  const confirmAndSearch = async () => {
    setShowConfirm(false);
    try {
      await startScan({
        storeId,
        country: selectedCountry,
        city: selectedCity,
        district: selectedDistrict || undefined,
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
            Bu işlem, **yıllık 2 aramalık** kullanım kotanızdan **1 adedini** tüketecektir. Onaylıyor musunuz?
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
            {selectedCity} {selectedDistrict ? `- ${selectedDistrict}` : ''} bölgesindeki {keyword} dükkanları aranıyor. Lütfen bekleyin...
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
          <span className="text-[9px] px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full font-bold uppercase tracking-wider">
            {selectedCity} {selectedDistrict ? `/ ${selectedDistrict}` : ''}
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
            {leads.map((lead) => {
              const isSaved = isLeadAlreadySaved(lead.phone);
              return (
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

                  <div className="shrink-0">
                    {isSaved ? (
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner">
                        <Lucide.Check size={16} strokeWidth={3} />
                      </div>
                    ) : (
                      <Button
                        variant="action"
                        size="xs"
                        mode="circle"
                        icon={<Lucide.UserPlus size={12} strokeWidth={3} />}
                        onClick={() => onSaveLead(lead, { country: selectedCountry, city: selectedCity, district: selectedDistrict })}
                        className="w-8 h-8 hover:scale-110 active:scale-95"
                        title="Rehbere Kaydet"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Multi-step Wizard Flow
  return (
    <div className="space-y-6">
      {activeStep === 1 && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="text-center space-y-1">
            <h4 className="text-xs font-black uppercase tracking-widest text-stone-500">1. Ülke Seçin</h4>
            <p className="text-[10px] font-bold text-stone-400">Arama yapacağınız ülkeye dokunun</p>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {PORTFOYS_COUNTRIES.map((c) => (
              <button
                key={c.code}
                onClick={() => handleSelectCountry(c.name)}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-300 active:scale-98 ${
                  selectedCountry === c.name
                    ? 'border-stone-900 bg-stone-900 text-white shadow-lg'
                    : 'border-stone-150 bg-stone-50 hover:bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{c.flag}</span>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider">{c.name}</h4>
                    <p className={`text-[9px] ${selectedCountry === c.name ? 'text-stone-300' : 'text-stone-400'} font-bold`}>{c.desc}</p>
                  </div>
                </div>
                <Lucide.ChevronRight size={16} strokeWidth={3} className={selectedCountry === c.name ? 'text-white' : 'text-stone-400'} />
              </button>
            ))}
          </div>
        </div>
      )}

      {activeStep === 2 && (
        <div className="space-y-4 animate-in slide-in-from-right duration-300">
          <div className="text-center space-y-1">
            <h4 className="text-xs font-black uppercase tracking-widest text-stone-500">2. Şehir Seçin</h4>
            <p className="text-[10px] font-bold text-stone-400">Listeden arama yapacağınız şehre dokunun</p>
          </div>

          {loadingLocations ? (
            <Loading size="md" variant="dark" label="İller Yükleniyor..." className="py-8" />
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-[35vh] overflow-y-auto pr-1 custom-scrollbar">
              {cities.length === 0 ? (
                <div className="col-span-2 text-center py-6 text-stone-400 text-[10px] font-bold uppercase">
                  İl verisi yüklenemedi. Lütfen geri dönüp tekrar deneyin.
                </div>
              ) : (
                cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => handleSelectCity(city)}
                    className={`p-3 rounded-xl border text-center font-black uppercase text-[10px] tracking-wider transition-all active:scale-95 ${
                      selectedCity === city
                        ? 'border-stone-900 bg-stone-900 text-white shadow-md'
                        : 'border-stone-150 bg-stone-50 hover:bg-white hover:border-stone-350 text-stone-700'
                    }`}
                  >
                    {city}
                  </button>
                ))
              )}
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveStep(1)}
              className="flex-1"
            >
              Geri Dön
            </Button>
          </div>
        </div>
      )}

      {activeStep === 3 && (
        <div className="space-y-4 animate-in slide-in-from-right duration-300">
          <div className="text-center space-y-1">
            <h4 className="text-xs font-black uppercase tracking-widest text-stone-500">3. İlçe Seçin</h4>
            <p className="text-[10px] font-bold text-stone-400">Yılda 2 kez kullanım hakkınız kapsamında, {selectedCity} içinde arama yapacağınız ilçeye dokunun</p>
          </div>

          {loadingLocations ? (
            <Loading size="md" variant="dark" label="İlçeler Yükleniyor..." className="py-8" />
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 max-h-[35vh] overflow-y-auto pr-1 custom-scrollbar">
                {districts.map((dist) => (
                  <button
                    key={dist}
                    onClick={() => handleSelectDistrict(dist)}
                    className={`p-3 rounded-xl border text-center font-black uppercase text-[10px] tracking-wider transition-all active:scale-95 ${
                      selectedDistrict === dist
                        ? 'border-stone-900 bg-stone-900 text-white shadow-md'
                        : 'border-stone-150 bg-stone-50 hover:bg-white hover:border-stone-350 text-stone-700'
                    }`}
                  >
                    {dist}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveStep(2)}
              className="flex-1"
            >
              Geri Dön
            </Button>
          </div>
        </div>
      )}

      {activeStep === 4 && (
        <div className="space-y-5 animate-in slide-in-from-right duration-300">
          <div className="text-center space-y-1">
            <h4 className="text-xs font-black uppercase tracking-widest text-stone-500">4. Ne Satıyorlar?</h4>
            <p className="text-[10px] font-bold text-stone-400">Bulmak istediğiniz dükkan türünü yazın veya seçin</p>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Lucide.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full h-12 pl-10 pr-4 border border-stone-200 rounded-xl focus:border-stone-950 focus:outline-none text-xs font-black uppercase tracking-wider bg-stone-50/50"
                placeholder="örn: Butik, Restoran, Eczane..."
              />
            </div>

            {/* Preset Chips */}
            <div className="space-y-1.5">
              <span className="text-[8px] font-black uppercase tracking-widest text-stone-400">En Çok Arananlar</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setKeyword(cat)}
                    className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-200 ${
                      keyword === cat
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveStep(3)}
              className="w-1/3"
            >
              Geri
            </Button>
            <Button
              variant="action"
              size="sm"
              disabled={!keyword.trim()}
              onClick={handleSearchSubmit}
              className="flex-1 text-white"
              showFingerprint={true}
            >
              Dükkanları Bul
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
