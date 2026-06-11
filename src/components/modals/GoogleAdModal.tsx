import { useState, useRef, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import BaseModal from './BaseModal';
import Button from '../ui/Button';
import FormInput from '../ui/FormInput';
import { useStore } from '../../store';

/**
 * GOOGLE AD MODAL (DIAMOND STANDARD)
 * ---------------------------------
 * A premium, multi-step modal flow for One-Click Google Ads.
 * Steps:
 * 1. Introduction (Google Ads value proposition)
 * 2. 3 Golden Questions via Voice Recording
 * 3. Target Area Selection (District, City, Country)
 * 4. Budget Selection (1000, 5000, 10000, Custom)
 * 5. Pre-IBAN Warning (Input "anladım" validation)
 * 6. IBAN Bridge & Confirmation
 */

export default function GoogleAdModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { settings, activeCampaign, setActiveCampaign, showFeedback } = useStore();
  
  // Step navigation (1 to 6)
  const [step, setStep] = useState(1);
  
  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Target Area state
  const [targetArea, setTargetArea] = useState('Bulunduğum İlçe');

  // Budget state
  const [selectedBudget, setSelectedBudget] = useState<number | 'custom'>(1000);
  const [customBudgetValue, setCustomBudgetValue] = useState('1000');

  // Pre-IBAN verification
  const [understandText, setUnderstandText] = useState('');

  // Generated Ref Code (stored locally during flow)
  const [generatedRefCode, setGeneratedRefCode] = useState('');

  // Generate unique code on open or step 5
  useEffect(() => {
    if (isOpen && !generatedRefCode) {
      const code = `ADS-${Math.floor(1000 + Math.random() * 9000)}`;
      setGeneratedRefCode(code);
    }
  }, [isOpen, generatedRefCode]);

  if (!isOpen) return null;

  // Extract city/district from address
  const getCityAndDistrict = () => {
    const address = settings?.address || '';
    if (!address) return { city: 'İstanbul', district: 'Kadıköy' };
    
    // Simple address parsing for mock display
    const parts = address.split(/[\/,]/);
    if (parts.length >= 2) {
      const city = parts[parts.length - 1].trim();
      const district = parts[parts.length - 2].trim();
      return { city, district };
    }
    return { city: 'İstanbul', district: 'Kadıköy' };
  };

  const { city, district } = getCityAndDistrict();

  // Voice recording controls
  const handleStartRecording = async () => {
    try {
      setAudioUrl(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      mediaRecorderRef.current = mediaRecorder;
      streamRef.current = stream;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordTime((t) => t + 1);
      }, 1000);
    } catch (err) {
      console.warn('MediaRecorder permission denied or unsupported. Falling back to mock recording.', err);
      // Mock Recording fallback for environment compatibility
      setIsRecording(true);
      setRecordTime(0);
      timerRef.current = setInterval(() => {
        setRecordTime((t) => t + 1);
      }, 1000);
    }
  };

  const handleStopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      // Mock recording stop
      setAudioUrl('MOCK_RECORDED_AUDIO');
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    setIsRecording(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Get active budget value
  const getBudgetValue = () => {
    if (selectedBudget === 'custom') {
      const parsed = parseInt(customBudgetValue, 10);
      return isNaN(parsed) ? 1000 : parsed;
    }
    return selectedBudget;
  };

  // Submit flow - mark campaign as pending
  const handleCampaignSubmit = () => {
    setActiveCampaign({
      status: 'pending',
      budget: getBudgetValue(),
      targetArea,
      refCode: generatedRefCode,
      voiceUrl: audioUrl,
    });
    showFeedback('success', 'Reklam bütçesi transfer onayı bekleniyor.');
  };

  // WhatsApp transfer bridge link builder
  const getWhatsAppLink = (refCode: string) => {
    const waNumber = settings?.whatsapp || '905373420161';
    const text = encodeURIComponent(
      `Merhaba, dükkanım için yaptığım reklam bütçesi ödemesinin dekontu ektedir. Referans Kodum: ${refCode}`
    );
    return `https://wa.me/${waNumber}?text=${text}`;
  };

  // -------------------------------------------------------------
  // RENDERING SCREENS (IF STATUS IS PENDING OR ACTIVE)
  // -------------------------------------------------------------
  if (activeCampaign.status === 'active') {
    return (
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title="KAMPANYA DURUMU"
        maxWidth="max-w-md"
      >
        <style>{`
          @keyframes pulseRadar {
            0% { transform: scale(0.95); opacity: 0.2; }
            50% { transform: scale(1.3); opacity: 0.5; }
            100% { transform: scale(0.95); opacity: 0.2; }
          }
        `}</style>
        <div className="p-6 space-y-6 text-center">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20" style={{ animation: 'pulseRadar 2s infinite' }} />
            <div className="absolute w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Lucide.CheckCircle2 className="text-emerald-500 w-10 h-10 animate-bounce" strokeWidth={2.5} />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest">
              REKLAMINIZ YAYINDA
            </h3>
            <p className="text-[12px] font-bold text-stone-600 leading-relaxed bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-100">
              reklamınız şuan yayında, müşterileriniz sizi görüyor.
            </p>
          </div>

          <div className="bg-stone-50 border border-stone-100 rounded-[24px] p-4 text-left space-y-2.5 text-[11px] font-bold text-stone-600">
            <div className="flex justify-between border-b border-stone-200/50 pb-2">
              <span className="uppercase text-stone-400">BÜTÇE:</span>
              <span className="text-stone-900 font-black">{activeCampaign.budget.toLocaleString('tr-TR')} ₺</span>
            </div>
            <div className="flex justify-between border-b border-stone-200/50 pb-2">
              <span className="uppercase text-stone-400">HEDEF BÖLGE:</span>
              <span className="text-stone-900 font-black">{activeCampaign.targetArea}</span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="uppercase text-stone-400">REFERANS KODU:</span>
              <span className="text-stone-900 font-black">{activeCampaign.refCode}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={() => {
                setActiveCampaign({ status: 'idle', budget: 0, targetArea: 'Bulunduğum İlçe', refCode: '' });
                setStep(1);
                setAudioUrl(null);
                setUnderstandText('');
                showFeedback('success', 'Kampanya durduruldu.');
              }}
              variant="danger"
              className="w-full h-14 !rounded-[20px]"
            >
              KAMPANYAYI DURDUR
            </Button>
            <Button
              onClick={onClose}
              variant="secondary"
              className="w-full h-12 !rounded-[16px]"
            >
              KAPAT
            </Button>
          </div>
        </div>
      </BaseModal>
    );
  }

  if (activeCampaign.status === 'pending') {
    return (
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title="ONAY BEKLENİYOR"
        maxWidth="max-w-md"
      >
        <div className="p-6 space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto animate-pulse">
            <Lucide.Clock size={32} strokeWidth={2.5} />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest">
              ÖDEME ONAYI BEKLENİYOR
            </h3>
            <p className="text-[11px] font-bold text-stone-500 leading-relaxed max-w-sm">
              Ödemenizi kontrol ediyoruz. Havale yaparken açıklama kısmına referans kodunuzu eklediyseniz reklamınız otomatik olarak aktifleşecektir.
            </p>
          </div>

          <div className="bg-stone-50 border border-stone-100 rounded-[24px] p-5 text-left space-y-3.5 text-[11px] font-bold text-stone-600">
            <div className="flex justify-between border-b border-stone-200/50 pb-2">
              <span className="text-stone-400">TUTAR:</span>
              <span className="text-stone-900 font-black">{activeCampaign.budget.toLocaleString('tr-TR')} ₺</span>
            </div>
            <div className="flex justify-between border-b border-stone-200/50 pb-2">
              <span className="text-stone-400">REFERANS KODU:</span>
              <span className="text-emerald-600 font-black tracking-wider">{activeCampaign.refCode}</span>
            </div>
            <div className="space-y-1">
              <span className="text-stone-400 block">IBAN:</span>
              <div className="bg-white p-2.5 rounded-xl border border-stone-150 flex items-center justify-between font-mono text-stone-800 text-[10px]">
                <span>TR98 0006 2000 0001 2345 6789 01</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('TR980006200000012345678901');
                    showFeedback('success', 'IBAN kopyalandı.');
                  }}
                  className="text-stone-400 hover:text-stone-900 transition-colors"
                >
                  <Lucide.Copy size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={() => window.open(getWhatsAppLink(activeCampaign.refCode), '_blank')}
              variant="whatsapp"
              className="w-full h-14 !rounded-[20px]"
              icon={<Lucide.MessageCircle size={18} strokeWidth={3} />}
            >
              DEKONTU WHATSAPP'TAN GÖNDER
            </Button>
            
            {/* Simulation trigger to active */}
            <Button
              onClick={() => {
                setActiveCampaign({ ...activeCampaign, status: 'active' });
                showFeedback('success', 'Reklamınız aktifleştirildi.');
              }}
              variant="action"
              className="w-full h-14 !rounded-[20px]"
              icon={<Lucide.Fingerprint size={18} />}
            >
              ÖDEMEYİ ONAYLA (SİMÜLE ET)
            </Button>

            <Button
              onClick={() => {
                setActiveCampaign({ status: 'idle', budget: 0, targetArea: 'Bulunduğum İlçe', refCode: '' });
                setStep(1);
                setAudioUrl(null);
                setUnderstandText('');
                showFeedback('success', 'Kampanya iptal edildi.');
              }}
              variant="ghost"
              className="w-full h-12 !rounded-[16px] text-red-500 hover:bg-red-50"
            >
              KAMPANYAYI İPTAL ET
            </Button>
          </div>
        </div>
      </BaseModal>
    );
  }

  // -------------------------------------------------------------
  // WIZARD FLOW RENDERERS
  // -------------------------------------------------------------
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 1 ? 'GOOGLE REKLAMI' : `ADIM ${step - 1}`}
      maxWidth="max-w-md"
      progress={step > 1 ? { current: step - 1, total: 5 } : undefined}
    >
      <style>{`
        @keyframes pulseWave {
          0% { height: 15%; }
          100% { height: 100%; }
        }
      `}</style>

      <div className="p-5 space-y-6">
        {/* STEP 1: VALUE PROPOSITION */}
        {step === 1 && (
          <div className="space-y-6 fade-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto shadow-md">
              <Lucide.Megaphone size={28} strokeWidth={2.5} />
            </div>

            <div className="space-y-3 text-center">
              <h3 className="text-[13px] font-black text-stone-900 uppercase tracking-widest">
                Dükkanınızı Google'da Öne Çıkarın
              </h3>
              <p className="text-[11px] font-bold text-stone-500 leading-relaxed max-w-sm mx-auto">
                Google Reklamları, dükkanınızı veya ürünlerinizi arayan potansiyel müşterilerin sizi Google arama sonuçlarında en üstte görmesini sağlar. Karmaşık bütçe ve reklam yönetimi panelleriyle uğraşmadan, ekataloğunuzu hedef bölgenizdeki gerçek alıcılara tek tıkla ulaştırıyoruz.
              </p>
            </div>

            <Button
              onClick={() => setStep(2)}
              variant="primary"
              className="w-full h-14 !rounded-[20px]"
            >
              Hemen Başla
            </Button>
          </div>
        )}

        {/* STEP 2: VOICE QUESTIONS */}
        {step === 2 && (
          <div className="space-y-6 fade-in">
            <div className="bg-stone-50 border border-stone-100 rounded-[28px] p-5 space-y-4">
              <h3 className="text-[11px] font-black text-stone-950 uppercase tracking-wider text-center">
                Müşteri Bulucu için 3 Altın Soru
              </h3>
              <p className="text-[10px] font-bold text-stone-500 leading-relaxed text-center">
                Lütfen aşağıdaki soruları tek bir ses kaydı alarak yanıtlayın. Reklamınızı bu bilgilere göre optimize edeceğiz:
              </p>
              
              <ul className="space-y-3.5 text-[10px] font-black text-stone-800">
                <li className="flex gap-2">
                  <span className="text-emerald-500">1.</span>
                  <span>Dükkanınızın en öne çıkan özelliği/ürünü nedir?</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500">2.</span>
                  <span>Müşterileriniz sizi neden tercih ediyor?</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500">3.</span>
                  <span>Vurgulamak istediğiniz özel bir kampanya var mı?</span>
                </li>
              </ul>
            </div>

            {/* AUDIO RECORDER INTERFACE */}
            <div className="bg-stone-50 border border-stone-100 rounded-[28px] p-5 flex flex-col items-center justify-center space-y-4 min-h-[160px]">
              {isRecording ? (
                <>
                  <div className="flex items-center gap-1 h-12 py-2">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 rounded-full bg-red-500"
                        style={{
                          height: '100%',
                          animation: `pulseWave 0.6s ease-in-out infinite alternate`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-black text-red-500 tracking-wider">KAYDEDİLİYOR</span>
                    <span className="block text-xl font-bold text-stone-900 mt-1">{formatTime(recordTime)}</span>
                  </div>
                  <button
                    onClick={handleStopRecording}
                    className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-105 active:scale-95 shadow-lg shadow-red-200 transition-all cursor-pointer"
                  >
                    <Lucide.Square size={18} strokeWidth={3} />
                  </button>
                </>
              ) : audioUrl ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                    <Lucide.CheckCircle2 size={24} />
                  </div>
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Kayıt Tamamlandı!</span>
                    <audio src={audioUrl === 'MOCK_RECORDED_AUDIO' ? undefined : audioUrl} controls className="h-10 mx-auto mt-2 scale-90" />
                  </div>
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={handleStartRecording}
                      className="flex-1 py-3 text-[10px] font-black text-stone-500 hover:text-stone-900 border border-stone-200 rounded-xl bg-white hover:bg-stone-50 transition-colors cursor-pointer"
                    >
                      YENİDEN KAYDET
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center">
                    <Lucide.Mic size={24} />
                  </div>
                  <p className="text-[9px] font-bold text-stone-400 text-center">Kaydı başlatmak için mikrofona basın.</p>
                  <button
                    onClick={handleStartRecording}
                    className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-105 active:scale-95 shadow-lg shadow-red-200 transition-all cursor-pointer animate-pulse"
                  >
                    <Lucide.Mic size={24} strokeWidth={2.5} />
                  </button>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep(1)}
                variant="secondary"
                className="w-20 h-14 shrink-0 !rounded-[20px]"
              >
                Geri
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!audioUrl && !isRecording}
                variant="primary"
                className="flex-1 h-14 !rounded-[20px]"
              >
                DEVAM
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: TARGET AREA */}
        {step === 3 && (
          <div className="space-y-6 fade-in">
            <div className="space-y-2 text-center">
              <h3 className="text-[12px] font-black text-stone-900 uppercase tracking-widest">
                Reklam Hedef Bölgesi
              </h3>
              <p className="text-[10px] font-bold text-stone-500">
                Reklamınızın gösterileceği coğrafi hedeflemeyi seçin.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              {[
                { id: 'Bulunduğum İlçe', text: `Bulunduğum İlçe`, sub: district ? `${district} çevresi` : 'Yakın dükkan çevresi' },
                { id: 'Bulunduğum İl', text: `Bulunduğum İl`, sub: city ? `${city} geneli` : 'Tüm şehir geneli' },
                { id: 'Bulunduğum Ülke', text: `Bulunduğum Ülke`, sub: 'Tüm Türkiye geneli' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setTargetArea(opt.id)}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between group cursor-pointer ${
                    targetArea === opt.id
                      ? 'border-stone-900 bg-stone-950 text-white shadow-xl scale-[1.01]'
                      : 'border-stone-150 bg-stone-50 hover:bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-black uppercase tracking-wider block">{opt.text}</span>
                    <span className={`text-[9px] font-medium block ${targetArea === opt.id ? 'text-stone-300' : 'text-stone-400'}`}>
                      {opt.sub}
                    </span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    targetArea === opt.id ? 'border-emerald-400 bg-emerald-500 text-stone-950' : 'border-stone-300'
                  }`}>
                    {targetArea === opt.id && <Lucide.Check size={12} strokeWidth={4} />}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep(2)}
                variant="secondary"
                className="w-20 h-14 shrink-0 !rounded-[20px]"
              >
                Geri
              </Button>
              <Button
                onClick={() => setStep(4)}
                variant="primary"
                className="flex-1 h-14 !rounded-[20px]"
              >
                DEVAM
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: BUDGET SELECTION */}
        {step === 4 && (
          <div className="space-y-6 fade-in">
            <div className="space-y-2 text-center">
              <h3 className="text-[12px] font-black text-stone-900 uppercase tracking-widest">
                Reklam Bütçesi
              </h3>
              <p className="text-[10px] font-bold text-stone-500">
                Bütçe arttıkça reklamınızın gösterileceği kişi sayısı artar.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[1000, 5000, 10000].map((budgetVal) => (
                <button
                  key={budgetVal}
                  onClick={() => setSelectedBudget(budgetVal)}
                  className={`py-4 px-2 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    selectedBudget === budgetVal
                      ? 'border-stone-900 bg-stone-950 text-white shadow-xl'
                      : 'border-stone-150 bg-stone-50 hover:bg-white hover:border-stone-300'
                  }`}
                >
                  <span className="text-[13px] font-black">{budgetVal.toLocaleString('tr-TR')} ₺</span>
                  <span className={`text-[8px] font-bold uppercase tracking-widest leading-none ${
                    selectedBudget === budgetVal ? 'text-emerald-400' : 'text-stone-400'
                  }`}>
                    BÜTÇE
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setSelectedBudget('custom')}
              className={`p-4 w-full rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                selectedBudget === 'custom'
                  ? 'border-stone-900 bg-stone-950 text-white shadow-xl'
                  : 'border-stone-150 bg-stone-50 hover:bg-white hover:border-stone-300'
              }`}
            >
              <span className="text-[11px] font-black uppercase tracking-wider">Diğer Tutar</span>
              <span className={`text-[9px] font-bold uppercase ${selectedBudget === 'custom' ? 'text-emerald-400' : 'text-stone-400'}`}>
                MİKTAR BELİRLE
              </span>
            </button>

            {selectedBudget === 'custom' && (
              <div className="relative fade-in">
                <FormInput
                  id="custom-budget-input"
                  labelText="TUTAR (MİN: 1.000 ₺)"
                  type="number"
                  min="1000"
                  value={customBudgetValue}
                  onChange={(e) => setCustomBudgetValue(e.target.value)}
                  placeholder="Bütçe girin"
                  className="!text-center !text-lg !font-black !py-3"
                  autoFocus
                />
                <span className="absolute right-4 top-9 text-xs font-black text-stone-300 pointer-events-none">₺</span>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => setStep(3)}
                variant="secondary"
                className="w-20 h-14 shrink-0 !rounded-[20px]"
              >
                Geri
              </Button>
              <Button
                onClick={() => setStep(5)}
                disabled={selectedBudget === 'custom' && (!customBudgetValue || parseInt(customBudgetValue, 10) < 1000)}
                variant="primary"
                className="flex-1 h-14 !rounded-[20px]"
              >
                DEVAM
              </Button>
            </div>
          </div>
        )}

        {/* STEP 5: PRE-IBAN WARNING */}
        {step === 5 && (
          <div className="space-y-6 fade-in">
            <div className="bg-red-50 border border-red-100 rounded-[28px] p-5 space-y-4">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <Lucide.AlertTriangle size={20} strokeWidth={2.5} />
              </div>
              <h3 className="text-[11px] font-black text-red-950 uppercase tracking-wider text-center">
                ÖNEMLİ UYARI
              </h3>
              <p className="text-[10px] font-bold text-red-700 leading-relaxed text-center">
                Az sonra dükkanınız için reklam bütçesi ödemesi yapabileceğiniz IBAN adresini ve ödemenizi eşleştirebilmemiz için girmeniz gereken **Açıklama Kodunu** vereceğiz. Ödemeyi yaptıktan sonra dekontu bize WhatsApp üzerinden de iletebilirsiniz.
              </p>
            </div>

            <div className="space-y-2">
              <FormInput
                id="pre-iban-confirm"
                labelText='İLERLEMEK İÇİN "ANLADIM" YAZIN'
                value={understandText}
                onChange={(e) => setUnderstandText(e.target.value)}
                placeholder="anladım"
                className="!text-center !font-black !py-3"
                autoComplete="off"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep(4)}
                variant="secondary"
                className="w-20 h-14 shrink-0 !rounded-[20px]"
              >
                Geri
              </Button>
              <Button
                onClick={() => setStep(6)}
                disabled={understandText.trim().toLowerCase() !== 'anladım'}
                variant="primary"
                className="flex-1 h-14 !rounded-[20px]"
              >
                DEVAM
              </Button>
            </div>
          </div>
        )}

        {/* STEP 6: IBAN BRIDGE */}
        {step === 6 && (
          <div className="space-y-6 fade-in">
            <div className="space-y-2 text-center">
              <h3 className="text-[12px] font-black text-stone-900 uppercase tracking-widest">
                Bütçe Transferi
              </h3>
              <p className="text-[10px] font-bold text-stone-500 leading-normal max-w-sm mx-auto">
                Lütfen banka transferi yaparken açıklama kısmına aşağıdaki kodu yazmayı unutmayın. Veya transfer sonrası dekontu doğrudan WhatsApp hattımıza iletebilirsiniz.
              </p>
            </div>

            <div className="bg-stone-50 border border-stone-100 rounded-[28px] p-5 space-y-4 text-[11px] font-bold text-stone-600">
              <div className="flex justify-between border-b border-stone-200/50 pb-2">
                <span className="text-stone-400">TUTAR:</span>
                <span className="text-stone-900 font-black text-sm">{getBudgetValue().toLocaleString('tr-TR')} ₺</span>
              </div>
              
              <div className="space-y-1.5">
                <span className="text-stone-400 block">IBAN:</span>
                <div className="bg-white p-3 rounded-xl border border-stone-150 flex items-center justify-between font-mono text-stone-800 text-[10px]">
                  <span>TR98 0006 2000 0001 2345 6789 01</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('TR980006200000012345678901');
                      showFeedback('success', 'IBAN kopyalandı.');
                    }}
                    className="text-stone-400 hover:text-stone-950 transition-colors p-1"
                  >
                    <Lucide.Copy size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-stone-400 block">AÇIKLAMA KODU:</span>
                <div className="bg-white p-3 rounded-xl border border-stone-150 flex items-center justify-between text-stone-850 font-black tracking-wider text-xs">
                  <span className="text-emerald-600">{generatedRefCode}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedRefCode);
                      showFeedback('success', 'Açıklama kodu kopyalandı.');
                    }}
                    className="text-stone-400 hover:text-stone-950 transition-colors p-1"
                  >
                    <Lucide.Copy size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep(5)}
                variant="secondary"
                className="w-20 h-16 shrink-0 !rounded-[20px]"
              >
                Geri
              </Button>
              
              {/* Confirm / Finish Button: Green with Fingerprint effect */}
              <Button
                onClick={handleCampaignSubmit}
                variant="action"
                className="flex-1 h-16 !rounded-[24px]"
                icon={<Lucide.Fingerprint size={20} className="animate-pulse" />}
              >
                TAMAM
              </Button>
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  );
}
