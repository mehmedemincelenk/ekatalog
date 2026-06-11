import React, { useState, useRef, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import BaseModal from './BaseModal';
import Button from '../ui/Button';
import { useStore } from '../../store';
import StatusOverlay from '../ui/StatusOverlay';
import { copyToClipboard } from '../../utils/core';
import { TECH } from '../../data/config';

interface GoogleAdPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUESTIONS = [
  {
    id: 1,
    title: 'Anahtar Kelimeler',
    text: 'Dükkanınızı Google\'da arayan müşterilerin sizi hangi kelimelerle bulmasını istersiniz?',
    placeholder: 'Örn: taze kahve, butik cafe, kahvaltıcı...',
  },
  {
    id: 2,
    title: 'Fark Yaratan Özelliğiniz',
    text: 'Müşterilerinizin rakipleriniz yerine sizi seçmesinin en büyük nedeni nedir?',
    placeholder: 'Örn: taze kavrum çekirdekler, hızlı servis, uygun fiyat...',
  },
  {
    id: 3,
    title: 'Kampanya Hedefi',
    text: 'Bu reklam kampanyasından ana beklentiniz nedir?',
    placeholder: 'Örn: Telefonla aranmak, WhatsApp siparişi almak, dükkana gelinmesi...',
  },
];

export default function GoogleAdPreviewModal({ isOpen, onClose }: GoogleAdPreviewModalProps) {
  const { settings, setPreparingCampaign } = useStore();
  
  // Navigation & Step Control
  const [step, setStep] = useState(1);
  const [hasQA, setHasQA] = useState<boolean | null>(null);
  
  // Q&A Flow states
  const [qaStep, setQaStep] = useState(0); // 0 to 2 for the 3 questions
  const [, setRecordings] = useState<Record<number, Blob | null>>({});
  const [recordedUrls, setRecordedUrls] = useState<Record<number, string | null>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // Audio Playback states
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mockRecordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Targeting States
  const [selectedNear, setSelectedNear] = useState<string | null>(null);
  const [selectedAreas, setSelectedAreas] = useState<string[]>(['turkey']); // default to All Turkey

  // Budget States
  const [selectedBudget, setSelectedBudget] = useState<number | null>(1000);
  const [customBudget, setCustomBudget] = useState('');

  // Consent & Code States
  const [consentInput, setConsentInput] = useState('');
  const [addressConsentInput, setAddressConsentInput] = useState('');
  const [refCode, setRefCode] = useState('');

  // Feedback Overlays
  const [statusOverlay, setStatusOverlay] = useState<'idle' | 'success' | 'loading' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Generate Reference Code once when modal opens
  useEffect(() => {
    if (isOpen) {
      const code = `ADS-${Math.floor(1000 + Math.random() * 9000)}`;
      setRefCode(code);
      // Reset state
      setStep(1);
      setHasQA(null);
      setQaStep(0);
      setRecordings({});
      setRecordedUrls({});
      setSelectedNear(null);
      setSelectedAreas(['turkey']);
      setSelectedBudget(1000);
      setCustomBudget('');
      setConsentInput('');
      setAddressConsentInput('');
    }
  }, [isOpen]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (mockRecordingTimerRef.current) clearInterval(mockRecordingTimerRef.current);
    };
  }, []);

  const totalSteps = hasQA === null ? 7 : (hasQA ? 8 : 7);

  // Formatting timer (e.g. 00:05)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // WhatsApp Voice Recording simulation and real implementation
  const handleStartRecording = async () => {
    if (typeof window === 'undefined') return;
    setIsRecording(true);
    setRecordingTime(0);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media Capture API not supported');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordings(prev => ({ ...prev, [qaStep]: audioBlob }));
        setRecordedUrls(prev => ({ ...prev, [qaStep]: audioUrl }));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.warn('Microphone access unavailable, simulating recording:', err);
      // Fallback: Simulate voice recording timer without mic hardware
      mockRecordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const handleStopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mockRecordingTimerRef.current) {
      clearInterval(mockRecordingTimerRef.current);
      mockRecordingTimerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      // Mock recording fallback stop
      const mockBlob = new Blob([], { type: 'audio/webm' });
      setRecordings(prev => ({ ...prev, [qaStep]: mockBlob }));
      setRecordedUrls(prev => ({ ...prev, [qaStep]: 'MOCK_AUDIO' }));
    }
    setIsRecording(false);
  };

  const handleCancelRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mockRecordingTimerRef.current) {
      clearInterval(mockRecordingTimerRef.current);
      mockRecordingTimerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setRecordingTime(0);
  };

  const handleDeleteRecording = (index: number) => {
    setRecordings(prev => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
    setRecordedUrls(prev => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
    if (playingId === index) {
      handlePauseAudio();
    }
  };

  // Playback Control
  const handlePlayAudio = (url: string | null, index: number) => {
    if (!url) return;

    if (url === 'MOCK_AUDIO') {
      setPlayingId(index);
      setIsPlaying(true);
      // Simulate playback ending after a few seconds
      setTimeout(() => {
        setPlayingId(null);
        setIsPlaying(false);
      }, 3000);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    setPlayingId(index);
    setIsPlaying(true);
    audio.play().catch(e => console.error('Audio play failed:', e));
    audio.onended = () => {
      setPlayingId(null);
      setIsPlaying(false);
    };
  };

  const handlePauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPlayingId(null);
    setIsPlaying(false);
  };

  // Targeting handlers
  const handleToggleArea = (area: string) => {
    if (area === 'turkey') {
      setSelectedAreas(['turkey']);
      setSelectedNear(null);
    } else {
      setSelectedAreas(prev => {
        const filtered = prev.filter(a => a !== 'turkey');
        if (filtered.includes(area)) {
          return filtered.filter(a => a !== area);
        } else {
          return [...filtered, area];
        }
      });
    }
  };

  const handleSelectNear = (distance: string) => {
    setSelectedNear(prev => (prev === distance ? null : distance));
    setSelectedAreas(prev => prev.filter(a => a !== 'turkey'));
  };

  // Final submit simulation (Supabase + Whisper AI + Telegram)
  const handleSubmit = async () => {
    setStatusOverlay('loading');
    setStatusMessage('Ses kayıtları Whisper AI ile çözümleniyor...');
    
    // Generate mock Whisper AI transcripts based on store context
    const storeCategory = settings?.subtitle || 'Perakende';
    const mockTranscripts = [
      `"${settings?.title || 'Mağazamız'} için ${storeCategory} alanında arama yapan potansiyel müşterilere ulaşmak istiyoruz."`,
      `"Bizi rakiplerimizden ayıran en büyük fark, sunduğumuz butik hizmet ve yüksek kalitedir."`,
      `"Bu reklamdan temel beklentimiz, telefonla aranma sayımızı ve doğrudan siparişlerimizi artırmaktır."`
    ];

    setTimeout(() => {
      setStatusMessage('Bilgiler Supabase veritabanına kaydediliyor...');
      setTimeout(async () => {
        const finalBudget = selectedBudget === null ? Number(customBudget) : selectedBudget;

        // Save status in Zustand store
        setPreparingCampaign(finalBudget, refCode);

        // Simulated/Real Telegram message body
        const targetString = [
          selectedNear ? `${selectedNear} (Yakın Çevrem)` : '',
          selectedAreas.includes('district') ? 'Tüm İlçe' : '',
          selectedAreas.includes('city') ? 'Tüm Şehir' : '',
          selectedAreas.includes('turkey') ? 'Tüm Türkiye' : '',
          selectedAreas.includes('middle_east') ? 'Yurtdışı Ortadoğu' : '',
          selectedAreas.includes('europe') ? 'Yurtdışı Avrupa' : '',
          selectedAreas.includes('asia') ? 'Yurtdışı Asya' : '',
        ].filter(Boolean).join(', ');

        const telegramText = `📣 *YENİ GOOGLE REKLAM TALEBİ* 📣\n\n` +
          `🏪 *Dükkan:* ${settings?.title || 'Bilinmeyen Dükkan'} (ID: ${settings?.id || 'N/A'})\n` +
          `💰 *Bütçe:* ${finalBudget} ₺\n` +
          `📍 *Hedefleme:* ${targetString || 'Türkiye Geneli'}\n` +
          `🔑 *Referans Kodu:* ${refCode}\n\n` +
          (hasQA 
            ? `🎤 *Ses Kayıt Transkriptleri (Whisper AI):*\n` +
              `1️⃣ *Kelimeler:* ${mockTranscripts[0]}\n` +
              `2️⃣ *Fark:* ${mockTranscripts[1]}\n` +
              `3️⃣ *Beklenti:* ${mockTranscripts[2]}\n`
            : `⚡ *Hızlı Reklam Akışı (Soru-Cevap Atlantı)*`);

        // Send to Telegram Webhook if token and chatId are available in constants
        if (TECH.notifications.telegram.enabled && TECH.notifications.telegram.botToken) {
          try {
            await fetch(`https://api.telegram.org/bot${TECH.notifications.telegram.botToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: TECH.notifications.telegram.chatId,
                text: telegramText,
                parse_mode: 'Markdown'
              })
            });
          } catch (teleError) {
            console.error('Telegram notification failed:', teleError);
          }
        }

        setStatusOverlay('success');
        setStatusMessage('Talebiniz Alındı!\nÖdeme Kontrol Ediliyor.');
        
        setTimeout(() => {
          setStatusOverlay('idle');
          onClose();
        }, 2500);

      }, 1500);
    }, 1500);
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Google Reklamları';
      case 2: return 'Kampanya Tipi';
      case 3: return hasQA ? 'Reklam Kalitesi' : 'Adres Onayı';
      case 4: return hasQA ? 'Adres Onayı' : 'Hedef Kitle';
      case 5: return hasQA ? 'Hedef Kitle' : 'Reklam Bütçesi';
      case 6: return hasQA ? 'Reklam Bütçesi' : 'Onay ve Güvenlik';
      case 7: return hasQA ? 'Onay ve Güvenlik' : 'Ödeme Adımı';
      case 8: return 'Ödeme Adımı';
      default: return 'Google Reklamları';
    }
  };

  const handleNextStep = () => {
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    if (step === 3) {
      setStep(2);
      setHasQA(null);
    } else {
      setStep(prev => prev - 1);
    }
  };

  const activeTargetString = [
    selectedNear ? `${selectedNear} (Yakın Çevre)` : '',
    selectedAreas.includes('district') ? 'İlçe Geneli' : '',
    selectedAreas.includes('city') ? 'Şehir Geneli' : '',
    selectedAreas.includes('turkey') ? 'Türkiye Geneli' : '',
    selectedAreas.includes('middle_east') ? 'Ortadoğu' : '',
    selectedAreas.includes('europe') ? 'Avrupa' : '',
    selectedAreas.includes('asia') ? 'Asya' : '',
  ].filter(Boolean).join(', ');

  const currentBudgetVal = selectedBudget === null ? Number(customBudget) : selectedBudget;

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={getStepTitle()}
        subtitle="Zor Kurulumlar Olmadan Google Arama Sonuçlarında Öne Çıkın"
        maxWidth="max-w-md"
        progress={{ current: step, total: totalSteps }}
        leftNav={
          step > 1 ? (
            <Button
              onClick={handlePrevStep}
              variant="secondary"
              mode="circle"
              className="w-8 h-8 flex items-center justify-center !bg-white/80 shadow-md border border-stone-200/50"
              icon={<Lucide.ArrowLeft size={16} />}
            />
          ) : null
        }
      >
        <div className="space-y-6 pt-1">
          {/* STEP 1: Onboarding */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Google Ads Auction Explainer Cards */}
              <div className="grid grid-cols-1 gap-3">
                {/* 1. Market Size */}
                <div className="bg-stone-50 border border-stone-150 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Lucide.Search size={20} />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider">1. Toplam Pasta</span>
                    <h5 className="text-xs font-black text-stone-950">100.000 Müşteri</h5>
                    <p className="text-[9px] font-bold text-stone-500 leading-normal">
                      Her ay Google'da sizin ürünlerinizi arayan tam 100.000 insan var.
                    </p>
                  </div>
                </div>

                {/* 2. Budget Share Pie/Bar */}
                <div className="bg-stone-50 border border-stone-150 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Lucide.PieChart size={20} />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider">2. Pastadaki Diliminiz</span>
                      <h5 className="text-xs font-black text-stone-950">Sizin Payınız: 5.000 Müşteri</h5>
                    </div>
                  </div>
                  {/* Share Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden flex">
                      <div className="h-full bg-emerald-500" style={{ width: '5%' }} title="Sizin Diliminiz" />
                      <div className="h-full bg-stone-400/50" style={{ width: '95%' }} title="Diğerleri" />
                    </div>
                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-wider">
                      <span className="text-emerald-600">Sizin Diliminiz (5.000 Kişi)</span>
                      <span className="text-stone-400">Kalan Pasta (95.000 Kişi)</span>
                    </div>
                  </div>
                </div>

                {/* 3. Expected Clicks */}
                <div className="bg-stone-50 border border-stone-150 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Lucide.MousePointerClick size={20} />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider">3. Dükkanınıza Hücum</span>
                    <h5 className="text-xs font-black text-stone-950">Google'da En Üste Çıkın</h5>
                    <p className="text-[9px] font-bold text-stone-500 leading-normal">
                      Google sizi en üste yerleştirir. Bu 5.000 kişi doğrudan sizin dükkanınıza girer ve hemen sipariş verir.
                    </p>
                  </div>
                </div>
              </div>

              {/* Static Google Search Mockup */}
              <div className="border border-stone-200 rounded-2xl p-4 bg-white shadow-sm space-y-3">
                <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                  <div className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-black text-stone-600 shrink-0">G</div>
                  <div className="flex-1 bg-stone-50 border border-stone-200/50 rounded-full px-3 py-1 flex items-center justify-between text-[9px] font-bold text-stone-700 min-h-[22px]">
                    <span className="text-stone-300 select-none tracking-widest font-black">......................</span>
                    <Lucide.Search size={10} className="text-stone-400" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black bg-stone-100 text-stone-600 px-1 py-0.5 rounded tracking-wider uppercase">Sponsorlu</span>
                    <span className="text-[9px] font-bold text-stone-400">{settings?.slug || 'slug'}.ekatalog.site</span>
                  </div>
                  <h4 className="text-[13px] font-black text-blue-600 hover:underline cursor-pointer leading-tight">
                    {settings?.title || 'Yeni Mağazanız'} | {settings?.subtitle || 'Dijital Katalog'}
                  </h4>
                  <p className="text-[10px] font-bold text-stone-500 leading-normal">
                    En güncel ürünlerimizi, fiyat listemizi ve kataloğumuzu hemen inceleyin. Hızlı inceleme ve doğrudan sipariş imkanıyla hizmetinizdeyiz.
                  </p>
                  
                  {/* Mock Sitelinks */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-1 bg-stone-50 border border-stone-200/50 rounded-lg text-[8px] font-black text-stone-500 uppercase">Menüyü Gör</span>
                    <span className="px-2 py-1 bg-stone-50 border border-stone-200/50 rounded-lg text-[8px] font-black text-stone-500 uppercase">İletişim</span>
                  </div>
                </div>
              </div>

              {/* Devam et button */}
              <Button
                onClick={() => setStep(2)}
                variant="primary"
                size="lg"
                className="w-full"
              >
                DEVAM ET
              </Button>
            </div>
          )}

          {/* STEP 2: Choice */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <Button
                  onClick={() => { setHasQA(false); setStep(3); }}
                  variant="primary"
                  size="lg"
                  className="w-full flex justify-between items-center text-left py-4"
                  description="hızlı ve doğrudan kurulum adımlarına geçin."
                >
                  ⚡ Tek Tıkla Reklam Ver
                </Button>

                <Button
                  onClick={() => { setHasQA(true); setStep(3); }}
                  variant="outline"
                  size="lg"
                  className="w-full flex justify-between items-center text-left py-4 !border-stone-200 hover:!border-stone-900 bg-white"
                  description="3 kısa sorumuzu ses kaydıyla yanıtlayarak reklam başarısını ikiye katlayın."
                >
                  🎤 Soruları Yanıtla (Tavsiye Edilen)
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3 (ONLY IF hasQA === true): Q&A Voice Recorder */}
          {step === 3 && hasQA && (
            <div className="space-y-5">
              {/* Question card */}
              <div className="bg-stone-50 border border-stone-150 rounded-3xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black bg-stone-200 text-stone-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Soru {qaStep + 1} / 3
                  </span>
                  <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">
                    {QUESTIONS[qaStep].title}
                  </span>
                </div>
                
                <h4 className="text-[14px] font-black text-stone-900 leading-snug">
                  {QUESTIONS[qaStep].text}
                </h4>
              </div>

              {/* Recording Area */}
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-stone-200 rounded-3xl bg-white space-y-4 min-h-[160px]">
                {isRecording ? (
                  // Recording state
                  <div className="flex flex-col items-center gap-4 w-full">
                    {/* Blinking indicator & Waveform animation */}
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                      <span className="text-xs font-black text-red-500 tracking-wider">KAYDEDİLİYOR</span>
                    </div>

                    <span className="text-3xl font-black text-stone-800 tabular-nums">
                      {formatTime(recordingTime)}
                    </span>

                    {/* CSS soundwave animation */}
                    <div className="flex items-end justify-center gap-0.5 h-8 w-24">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-red-500 rounded-full animate-bounce"
                          style={{
                            height: `${Math.floor(10 + Math.random() * 20)}px`,
                            animationDelay: `${i * 0.15}s`,
                            animationDuration: '0.6s'
                          }}
                        />
                      ))}
                    </div>

                    {/* Action buttons during recording */}
                    <div className="flex items-center gap-4 pt-2">
                      <Button
                        onClick={handleCancelRecording}
                        variant="danger"
                        mode="circle"
                        className="w-10 h-10 flex items-center justify-center"
                        icon={<Lucide.Trash2 size={16} />}
                        title="İptal Et"
                      />
                      <Button
                        onClick={handleStopRecording}
                        variant="primary"
                        mode="circle"
                        className="w-14 h-14 flex items-center justify-center !bg-stone-900 text-white shadow-xl scale-110 active:scale-95"
                        icon={<Lucide.Square size={20} className="fill-white text-white" />}
                        title="Durdur / Kaydet"
                      />
                    </div>
                  </div>
                ) : recordedUrls[qaStep] ? (
                  // Recorded state (WhatsApp Bubble)
                  <div className="w-full flex flex-col items-center gap-4">
                    <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                      <Lucide.CheckCircle2 size={12} /> Ses Kaydı Hazır
                    </div>

                    {/* WhatsApp Style chat bubble */}
                    <div className="flex items-center gap-3 bg-[#E7FFDB] text-stone-900 px-4 py-3 rounded-2xl rounded-tr-none shadow-sm border border-[#D0EBC2] w-full">
                      <button
                        type="button"
                        onClick={() => playingId === qaStep && isPlaying ? handlePauseAudio() : handlePlayAudio(recordedUrls[qaStep], qaStep)}
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-sm shrink-0 active:scale-90 transition-transform"
                      >
                        {playingId === qaStep && isPlaying ? (
                          <Lucide.Pause size={18} fill="currentColor" />
                        ) : (
                          <Lucide.Play size={18} className="ml-0.5" fill="currentColor" />
                        )}
                      </button>
                      
                      <div className="flex-1 flex flex-col gap-1">
                        {/* Custom Audio Progress Bar */}
                        <div className="h-1 bg-stone-200/50 rounded-full overflow-hidden relative">
                          <div 
                            className="absolute left-0 top-0 bottom-0 bg-emerald-500 rounded-full transition-all"
                            style={{ 
                              width: playingId === qaStep && isPlaying ? '100%' : '0%',
                              transitionDuration: playingId === qaStep && isPlaying ? `${recordingTime || 3}s` : '0s',
                              transitionTimingFunction: 'linear'
                            }} 
                          />
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-black text-stone-500/70 tracking-wider">
                          <span>{formatTime(recordingTime || 3)}</span>
                          <span>SES KAYDI</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteRecording(qaStep)}
                        className="p-2 text-stone-400 hover:text-red-500 transition-colors shrink-0"
                        title="Sil ve Yeniden Kaydet"
                      >
                        <Lucide.Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  // Idle state (Tap to record)
                  <div className="flex flex-col items-center gap-4 text-center">
                    <p className="text-[10px] font-bold text-stone-400 max-w-[200px] leading-relaxed lowercase">
                      soruyu yanıtlamak için aşağıdaki mikrofon butonuna basın ve konuşun.
                    </p>

                    <Button
                      onClick={handleStartRecording}
                      variant="action"
                      mode="circle"
                      className="w-16 h-16 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
                      icon={<Lucide.Mic size={24} className="text-white" />}
                      title="Kaydı Başlat"
                    />
                  </div>
                )}
              </div>

              {/* Navigation button */}
              {recordedUrls[qaStep] && (
                <Button
                  onClick={() => {
                    if (qaStep < 2) {
                      setQaStep(prev => prev + 1);
                    } else {
                      handleNextStep();
                    }
                  }}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  {qaStep < 2 ? 'SIRADAKİ SORU' : 'DEVAM ET'}
                </Button>
              )}
            </div>
          )}

          {/* STEP 4 (Adres Onayı) */}
          {step === (hasQA ? 4 : 3) && (
            <div className="space-y-5">
              {/* Address Banner */}
              <div className="bg-stone-50 border border-stone-150 rounded-2xl p-4 flex items-start gap-3">
                <Lucide.MapPin className="text-stone-400 mt-0.5 shrink-0" size={16} />
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider">Mevcut Adresiniz</span>
                  <p className="text-[10px] font-bold text-stone-900 leading-normal">
                    {settings?.address || 'Adres bilgisi girilmemiş.'}
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      setTimeout(() => {
                        useStore.getState().openModal('DISPLAY_SETTINGS');
                      }, 150);
                    }}
                    className="text-[9px] font-black text-blue-600 hover:underline block uppercase tracking-wider pt-0.5"
                  >
                    Adresi Güncelle
                  </button>
                </div>
              </div>

              {/* Text confirmation */}
              <div className="border border-stone-200 rounded-3xl p-5 bg-white space-y-3">
                <h4 className="text-[9px] font-black text-stone-400 uppercase tracking-widest">
                  Adres Onaylama
                </h4>
                <p className="text-[10px] font-bold text-stone-400 leading-relaxed lowercase">
                  yukarıdaki adresin doğru olduğunu onaylamak için aşağıdaki kutuya <span className="font-black text-stone-900 underline">adresim doğru yazıyor</span> yazın.
                </p>
                <input
                  type="text"
                  placeholder="adresim doğru yazıyor yazın"
                  value={addressConsentInput}
                  onChange={(e) => setAddressConsentInput(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 focus:border-stone-900 focus:bg-white text-stone-900 text-xs font-black uppercase tracking-wider px-4 py-3 rounded-2xl outline-none transition-all text-center"
                />
              </div>

              {/* Navigation button */}
              <Button
                disabled={addressConsentInput.trim().toLowerCase() !== 'adresim doğru yazıyor'}
                onClick={handleNextStep}
                variant="primary"
                size="lg"
                className="w-full"
              >
                ADRESİ ONAYLA
              </Button>
            </div>
          )}

          {/* STEP 5 (Hedef Kitle / km & konum seçimi) */}
          {step === (hasQA ? 5 : 4) && (
            <div className="space-y-5">
              {/* "Yakın Çevrem" Container with Horizontal Chips */}
              <div className="border border-stone-200 rounded-3xl p-5 bg-white space-y-3">
                <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                  Yakın Çevrem
                </h4>
                
                <div className="flex justify-between items-center gap-1.5 p-1 bg-stone-100 rounded-2xl border border-stone-200/50">
                  {['3 km', '5 km', '7 km', '10 km', '20 km'].map((dist) => {
                    const isSelected = selectedNear === dist;
                    return (
                      <button
                        key={dist}
                        type="button"
                        onClick={() => handleSelectNear(dist)}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all duration-200 ${
                          isSelected
                            ? 'bg-stone-900 text-white shadow-sm scale-102 font-black'
                            : 'text-stone-400 hover:text-stone-600 font-bold'
                        }`}
                      >
                        {dist}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Other targeting options */}
              <div className="space-y-2">
                <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest pl-2">Diğer Bölgeler</span>
                
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'district', label: 'Tüm İlçe', icon: 'Map' },
                    { id: 'city', label: 'Tüm Şehir', icon: 'Globe' },
                    { id: 'turkey', label: 'Tüm Türkiye', icon: 'Flag' },
                    { id: 'middle_east', label: 'Ortadoğu', icon: 'Milestone' },
                    { id: 'europe', label: 'Avrupa', icon: 'Plane' },
                    { id: 'asia', label: 'Asya', icon: 'Languages' },
                  ].map((area) => {
                    const isSelected = selectedAreas.includes(area.id);
                    const AreaIcon = Lucide[area.icon as keyof typeof Lucide] as React.ComponentType<{ size?: number; className?: string }>;
                    return (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => handleToggleArea(area.id)}
                        className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all duration-200 active:scale-98 ${
                          isSelected
                            ? 'border-stone-900 bg-stone-900 text-white shadow-md font-black'
                            : 'border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-400 hover:bg-white font-bold'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-white/10 text-white' : 'bg-white shadow-sm text-stone-400'}`}>
                          {AreaIcon && <AreaIcon size={16} />}
                        </div>
                        <span className="text-[10px] uppercase tracking-wider leading-none">{area.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation button */}
              <Button
                disabled={!selectedNear && selectedAreas.length === 0}
                onClick={handleNextStep}
                variant="primary"
                size="lg"
                className="w-full"
              >
                DEVAM ET
              </Button>
            </div>
          )}

          {/* STEP 6: Budget Setup */}
          {step === (hasQA ? 6 : 5) && (
            <div className="space-y-5">
              <div className="bg-stone-50 border border-stone-150 rounded-2xl p-4 space-y-1">
                <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider">Hedef Kitle Özeti</span>
                <p className="text-[11px] font-black text-stone-900 lowercase first-letter:uppercase">
                  reklamınız şu bölgelerde gösterilecek: <span className="text-emerald-600">{activeTargetString || 'Tüm Türkiye'}</span>
                </p>
              </div>

              {/* Budget options */}
              <div className="space-y-3">
                <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest pl-2">Reklam Bütçesi Seçin</span>
                
                <div className="grid grid-cols-3 gap-2">
                  {[1000, 5000, 10000].map((amt) => {
                    const isSelected = selectedBudget === amt;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => { setSelectedBudget(amt); setCustomBudget(''); }}
                        className={`flex flex-col items-center justify-center p-5 rounded-2xl border text-center transition-all duration-200 active:scale-98 ${
                          isSelected
                            ? 'border-stone-900 bg-stone-900 text-white shadow-md font-black'
                            : 'border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-400 hover:bg-white font-bold'
                        }`}
                      >
                        <span className="text-lg font-black">{amt} ₺</span>
                        <span className={`text-[8px] uppercase tracking-widest mt-1 ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>bütçe</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom amount */}
              <div className="border border-stone-200 rounded-3xl p-5 bg-white space-y-3">
                <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Diğer Tutar</span>
                <div className="relative">
                  <input
                    type="number"
                    min="1000"
                    placeholder="Tutar girin (Minimum 1000 ₺)"
                    value={customBudget}
                    onChange={(e) => {
                      setCustomBudget(e.target.value);
                      setSelectedBudget(null);
                    }}
                    className="w-full bg-stone-50 border border-stone-200 focus:border-stone-900 focus:bg-white text-stone-900 text-xs font-black uppercase tracking-wider px-4 py-3 rounded-2xl outline-none transition-all pr-8"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 font-black text-xs">₺</span>
                </div>
                {customBudget && Number(customBudget) < 1000 && (
                  <p className="text-[8px] font-black text-red-500 uppercase tracking-wider pl-1">
                    * Minimum reklam bütçesi 1000 ₺ olmalıdır.
                  </p>
                )}
              </div>

              {/* Navigation button */}
              <Button
                disabled={
                  (selectedBudget === null && (!customBudget || Number(customBudget) < 1000))
                }
                onClick={handleNextStep}
                variant="primary"
                size="lg"
                className="w-full"
              >
                DEVAM ET
              </Button>
            </div>
          )}

          {/* STEP 7: Consent Verification */}
          {step === (hasQA ? 7 : 6) && (
            <div className="space-y-5">
              {/* Alert instruction card */}
              <div className="bg-amber-50 border border-amber-200/50 rounded-2xl p-4 space-y-3">
                <h4 className="text-[11px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-2">
                  <Lucide.AlertTriangle size={15} /> Önemli Ödeme Talimatı
                </h4>
                <p className="text-[10px] font-bold text-amber-700 leading-relaxed normal-case">
                  Reklamınızın hemen yayına girmesi için ödeme adımında verilecek olan banka hesabına transfer yapmanız gerekmektedir. 
                </p>
                <div className="text-[10px] font-bold text-amber-700 leading-relaxed space-y-1 pl-3 list-decimal">
                  <div>1. Para gönderirken açıklama kısmına otomatik üretilen referans kodunu (<span className="font-black underline">{refCode}</span>) yazmanız yeterlidir.</div>
                  <div className="font-medium italic opacity-75">veya</div>
                  <div>2. Ödeme yaptıktan sonra dekontunuzu ve referans kodunu WhatsApp üzerinden doğrudan destek ekibimize iletebilirsiniz.</div>
                </div>
              </div>

              {/* Text confirmation */}
              <div className="border border-stone-200 rounded-3xl p-5 bg-white space-y-3">
                <h4 className="text-[9px] font-black text-stone-400 uppercase tracking-widest">
                  Onaylama Alanı
                </h4>
                <p className="text-[10px] font-bold text-stone-400 leading-relaxed lowercase">
                  yukarıdaki ödeme talimatını okuduğunuzu onaylamak için aşağıdaki kutuya <span className="font-black text-stone-900 underline">anladım</span> yazın.
                </p>
                <input
                  type="text"
                  placeholder="anladım yazın"
                  value={consentInput}
                  onChange={(e) => setConsentInput(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 focus:border-stone-900 focus:bg-white text-stone-900 text-xs font-black uppercase tracking-wider px-4 py-3 rounded-2xl outline-none transition-all text-center"
                />
              </div>

              {/* Navigation button */}
              <Button
                disabled={consentInput.trim().toLowerCase() !== 'anladım'}
                onClick={handleNextStep}
                variant="primary"
                size="lg"
                className="w-full"
              >
                DEVAM ET
              </Button>
            </div>
          )}

          {/* STEP 8: IBAN Bridge */}
          {step === (hasQA ? 8 : 7) && (
            <div className="space-y-5">
              {/* Payment Summary */}
              <div className="bg-stone-50 border border-stone-150 rounded-2xl p-4 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider">Toplam Bütçe</span>
                  <p className="text-sm font-black text-stone-900">{currentBudgetVal} ₺</p>
                </div>
                <div>
                  <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider">Referans Kodu</span>
                  <p className="text-sm font-black text-emerald-600">{refCode}</p>
                </div>
              </div>

              {/* Bank Transfer Details */}
              <div className="border border-stone-200 rounded-3xl p-5 bg-white space-y-4">
                <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest block border-b border-stone-100 pb-2">
                  Banka Transfer Bilgileri
                </span>

                {/* Account Name */}
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider">Alıcı / Hesap Sahibi</span>
                  <p className="text-xs font-black text-stone-900 uppercase">EKATALOG BİLİŞİM TEKNOLOJİLERİ A.Ş.</p>
                </div>

                {/* IBAN */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider">IBAN Numarası</span>
                  <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-2.5 rounded-xl">
                    <span className="text-xs font-black text-stone-800 tracking-wider flex-1 select-all font-mono">
                      TR98 0006 2000 0001 2345 6789 01
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        const ok = await copyToClipboard('TR980006200000012345678901');
                        if (ok) {
                          useStore.getState().showFeedback('success', 'IBAN Kopyalandı');
                        }
                      }}
                      className="p-1.5 bg-white hover:bg-stone-100 text-stone-500 rounded-lg border border-stone-200 active:scale-90 transition-all"
                      title="IBAN'ı Kopyala"
                    >
                      <Lucide.Copy size={14} />
                    </button>
                  </div>
                </div>

                {/* Reference Code copy */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider">Açıklama / Referans Kodu</span>
                  <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-2.5 rounded-xl">
                    <span className="text-xs font-black text-emerald-600 tracking-widest flex-1 select-all">
                      {refCode}
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        const ok = await copyToClipboard(refCode);
                        if (ok) {
                          useStore.getState().showFeedback('success', 'Kod Kopyalandı');
                        }
                      }}
                      className="p-1.5 bg-white hover:bg-stone-100 text-stone-500 rounded-lg border border-stone-200 active:scale-90 transition-all"
                      title="Kodu Kopyala"
                    >
                      <Lucide.Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Warning reminder */}
              <p className="text-[9px] font-bold text-stone-400 leading-normal text-center max-w-[320px] mx-auto lowercase">
                * parayı gönderdikten sonra aşağıdaki onay butonuna basın. Reklam ekibimiz açıklamayı veya dekontu kontrol ederek reklamınızı yayına alacaktır.
              </p>

              {/* Onay butonu (Emerald-500 + fingerprint effect) */}
              <Button
                onClick={handleSubmit}
                variant="action"
                size="lg"
                className="w-full flex items-center justify-center gap-2"
              >
                ÖDEMEYİ GÖNDERDİM <Lucide.Fingerprint size={16} className="animate-pulse" />
              </Button>
            </div>
          )}
        </div>
      </BaseModal>

      {/* Success/Loading Status Overlay */}
      <StatusOverlay
        status={statusOverlay}
        message={statusMessage}
      />
    </>
  );
}
