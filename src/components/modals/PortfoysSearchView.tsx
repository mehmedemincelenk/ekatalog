import { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import Button from '../ui/Button';
import { PortfoysLead } from '../../hooks/usePortfoysScraper';
import { fetchCities, fetchDistricts, PORTFOYS_COUNTRIES, PRESET_CATEGORIES } from '../../utils/portfoysLocations';

interface PortfoysSearchViewProps {
  credits: number;
  storeName: string;
  storeId: string;
  status: 'idle' | 'scanning' | 'completed' | 'error';
  leads: PortfoysLead[];
  apiError: string | null;
  startScan: (params: { storeId: string; country: string; city: string; district?: string; keyword: string }) => Promise<void>;
  clearScan: () => void;
  
  // Keep interface compatibility
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
}: PortfoysSearchViewProps) {
  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [keyword, setKeyword] = useState<string>('');
  const [country, setCountry] = useState<string>('Türkiye');
  const [city, setCity] = useState<string>('');
  const [district, setDistrict] = useState<string>('');

  // Location helpers states
  const [cities, setCities] = useState<string[]>([]);

  const [districts, setDistricts] = useState<string[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState<boolean>(false);
  const [districtSearch, setDistrictSearch] = useState<string>('');

  // Fetch cities when country changes
  useEffect(() => {
    if (country) {
      fetchCities(country)
        .then((res) => {
          setCities(res || []);
          setCity(''); // Reset selected city
          setDistrict(''); // Reset selected district
        })
        .catch((err) => console.error('[portfoys] fetchCities error:', err));
    }
  }, [country]);

  // Fetch districts when city changes
  useEffect(() => {
    if (country && city) {
      setLoadingDistricts(true);
      fetchDistricts(country, city)
        .then((res) => {
          setDistricts(res || []);
          setDistrict(''); // Reset selected district
        })
        .catch((err) => console.error('[portfoys] fetchDistricts error:', err))
        .finally(() => setLoadingDistricts(false));
    } else {
      setDistricts([]);
      setDistrict('');
    }
  }, [country, city]);

  const confirmAndSearch = async () => {
    try {
      await startScan({
        storeId,
        country,
        city: city.trim(),
        district: district.trim() || undefined,
        keyword: keyword.trim(),
      });
    } catch (err) {
      console.error('[portfoys] failed to start scan:', err);
    }
  };

  const handleClear = () => {
    setStep(1);
    clearScan();
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
            Yıllık kullanım kotanızı doldurdunuz. Tüm şehir veya Türkiye geneli B2B rehber verilerine sınırsız erişim sağlamak için paketinizi hemen yükseltin!
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
              onClick={handleClear}
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
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Müşteri bulunamadı</p>
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

  // Filtered lists for locations
  const filteredDistricts = districts.filter((d) =>
    d.toLowerCase().includes(districtSearch.toLowerCase())
  );

  const popularCities = country === 'Türkiye' ? ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana'] : [];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Sleek Step Indicator Progress Bar */}
      <div className="w-full flex items-center justify-between gap-1.5 px-1 pb-1">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              step >= s ? 'bg-stone-900 shadow-sm' : 'bg-stone-150'
            }`}
          />
        ))}
      </div>

      {/* Step 1: Sector / Keyword */}
      {step === 1 && (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">
              Ne Arıyorsunuz? (Sektör)
            </label>
            <div className="relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Örn: Kuaför, Butik, Otel, Kafe..."
                className="w-full px-4 py-3 bg-stone-50 border border-stone-150 rounded-2xl text-xs font-bold text-stone-900 placeholder:text-stone-350 focus:outline-none focus:border-stone-900 focus:bg-white transition-all"
              />
              <Lucide.Search size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-450" />
            </div>
            
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

          <Button
            type="button"
            variant="primary"
            size="md"
            disabled={!keyword.trim()}
            onClick={() => setStep(2)}
            className="w-full py-4 mt-2"
          >
            DEVAM
          </Button>
        </div>
      )}

      {/* Step 2: Country Selection */}
      {step === 2 && (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">
              Müşterilerin Bulunduğu Ülke
            </label>
            <div className="space-y-2">
              {PORTFOYS_COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    setCountry(c.name);
                    setStep(3);
                  }}
                  className={`w-full flex items-center justify-between p-4 bg-stone-50 border rounded-2xl hover:bg-stone-100 transition-all ${
                    country === c.name ? 'border-stone-900 bg-stone-50/50 shadow-sm' : 'border-stone-150'
                  }`}
                >
                  <div className="flex items-center gap-3 text-left">
                    <span className="text-2xl shrink-0">{c.flag}</span>
                    <div>
                      <h5 className="text-[11px] font-black uppercase text-stone-900 tracking-tight">{c.name}</h5>
                      <p className="text-[9px] text-stone-400 font-bold mt-0.5">{c.desc}</p>
                    </div>
                  </div>
                  {country === c.name && (
                    <div className="w-5 h-5 rounded-full bg-stone-900 flex items-center justify-center animate-in zoom-in duration-200">
                      <Lucide.Check size={10} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep(1)}
              className="flex-1"
            >
              GERİ
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!country}
              onClick={() => setStep(3)}
              className="flex-1"
            >
              DEVAM
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: City Selection */}
      {step === 3 && (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">
              Hangi Şehirde?
            </label>
            
            {popularCities.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[8px] font-black uppercase tracking-widest text-stone-400">Popüler Şehirler</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {popularCities.map((pc) => (
                    <button
                      key={pc}
                      type="button"
                      onClick={() => {
                        setCity(pc);
                        setStep(4);
                      }}
                      className={`px-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 border ${
                        city === pc
                          ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                          : 'bg-stone-50 text-stone-600 border-stone-100 hover:bg-stone-100 hover:border-stone-200'
                      }`}
                    >
                      {pc}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <span className="text-[8px] font-black uppercase tracking-widest text-stone-400">
                Tüm Şehirler
              </span>
              <div className="max-h-[190px] overflow-y-auto border border-stone-100 rounded-2xl p-2 bg-stone-50/50 space-y-1 custom-scrollbar">
                {cities.length === 0 ? (
                  <div className="text-center py-6 text-[9px] font-black uppercase tracking-widest text-stone-400">
                    Şehir bulunamadı
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5">
                    {cities.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setCity(c);
                          setStep(4);
                        }}
                        className={`text-left px-3.5 py-2.5 text-[10px] font-bold uppercase rounded-xl transition-all border ${
                          city === c
                            ? 'bg-stone-900 text-white border-stone-900 shadow-sm font-black'
                            : 'text-stone-600 bg-white border-stone-100/70 hover:bg-stone-100 hover:border-stone-200'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep(2)}
              className="flex-1"
            >
              GERİ
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!city}
              onClick={() => setStep(4)}
              className="flex-1"
            >
              DEVAM
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: District Selection & Confirmation */}
      {step === 4 && (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">
              Hangi Semt / İlçede?
            </label>
            
            <div className="relative">
              <input
                type="text"
                value={districtSearch}
                onChange={(e) => setDistrictSearch(e.target.value)}
                placeholder="İlçe/Semt adı arayın (Örn: Kadıköy)..."
                className="w-full px-4 py-3 bg-stone-50 border border-stone-150 rounded-2xl text-xs font-bold text-stone-900 placeholder:text-stone-350 focus:outline-none focus:border-stone-900 focus:bg-white transition-all"
              />
              <Lucide.Search size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-450" />
            </div>

            {loadingDistricts ? (
              <div className="flex items-center justify-center py-6 gap-2">
                <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                <span className="text-[9px] font-black uppercase tracking-wider text-stone-400">İlçeler Yükleniyor...</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="max-h-[140px] overflow-y-auto border border-stone-100 rounded-2xl p-1.5 bg-stone-50/50 space-y-0.5 custom-scrollbar">
                  <button
                    type="button"
                    onClick={() => setDistrict('')}
                    className={`w-full text-left px-3.5 py-2 text-[10px] font-bold uppercase rounded-xl transition-all ${
                      district === ''
                        ? 'bg-stone-900 text-white shadow-sm font-black'
                        : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'
                    }`}
                  >
                    ✨ TÜMÜ (İLÇE FARKETMEZ)
                  </button>

                  {filteredDistricts.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDistrict(d)}
                      className={`w-full text-left px-3.5 py-2 text-[10px] font-bold uppercase rounded-xl transition-all ${
                        district === d
                          ? 'bg-stone-900 text-white shadow-sm font-black'
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Minimalist Premium Confirmation Card */}
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-center animate-in zoom-in duration-200">
            <p className="text-[10px] font-bold text-stone-500 leading-relaxed uppercase tracking-wide">
              <strong>{city}{district ? ` (${district})` : ''}</strong>, <strong>{country}</strong> bölgesindeki <strong>"{keyword}"</strong> araması, 1 kullanım kredinizi tüketecektir. <span className="block text-[9px] text-stone-400 mt-1 font-semibold normal-case">yıllık arama hakkınız 2 adettir. (kalan: {credits}/2)</span>
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep(3)}
              className="flex-1"
            >
              GERİ
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
      )}
    </div>
  );
}
