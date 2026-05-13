import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Lucide from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { THEME } from '../../data/config';
import { useStore } from '../../store';
import { 
  PinModalProps, 
  CouponModalProps, 
  QuickEditModalProps,
  ProductDetailModalProps
} from '../../types';
import Button from '../ui/Button';
import BaseModal from './BaseModal';
import FormInput from '../ui/FormInput';
import Turnstile from '../ui/Turnstile';
import SmartImage from '../ui/SmartImage';
import { openExternalMap, openWhatsApp, callPhone } from '../../utils/contact';
import { copyToClipboard } from '../../utils/core';

// ---------------------------------------------------------------------------
// 1. QR MODAL (Branded & Interactive)
// ---------------------------------------------------------------------------
export function QRModal({ isOpen, onClose, isStatic = false }: { isOpen: boolean; onClose: () => void; isStatic?: boolean }) {
  const { settings } = useStore();
  const shopUrl = typeof window !== 'undefined' ? window.location.href : '';
  const [copied, setCopied] = useState(false);
  const storeLogo = settings?.logoUrl;

  const handleCopy = async () => {
    if (isStatic) return;
    const isSuccess = await copyToClipboard(shopUrl);
    if (isSuccess) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const displayUrl = shopUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

  const footer = (
    <div className="flex flex-col gap-3 w-full">
      <Button onClick={handleCopy} variant="secondary" className="!h-16" mode="rectangle" showFingerprint={true} fingerprintType="detailed">
        <span className="text-[10px] font-black uppercase tracking-widest text-stone-900">
          {copied ? 'KOPYALANDI ✅' : `${displayUrl} metnini kopyala`}
        </span>
      </Button>
    </div>
  );

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} isStatic={isStatic} maxWidth="max-w-sm" footer={footer} noPadding>
      <div className="flex flex-col items-center justify-center p-8">
        <div className="relative group p-6 bg-white border border-stone-100 rounded-[2.5rem] shadow-xl shadow-stone-100/50 transition-all duration-500 hover:scale-[1.02]">
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-stone-200 rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-stone-200 rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-stone-200 rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-stone-200 rounded-br-lg" />
          <div className="relative flex items-center justify-center">
            <QRCodeSVG value={shopUrl} size={200} level="H" includeMargin={false} className="rounded-xl overflow-hidden" />
            {storeLogo && (
              <div className="absolute w-14 h-14 bg-white p-1 rounded-2xl shadow-md border border-stone-50 flex items-center justify-center overflow-hidden">
                <img src={storeLogo} alt="Store Logo" className="w-full h-full object-contain rounded-xl" />
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

// ---------------------------------------------------------------------------
// 2. LOCATION MODAL
// ---------------------------------------------------------------------------
export function LocationModal({ isOpen, onClose, address, isStatic = false }: { isOpen: boolean; onClose: () => void; address: string; isStatic?: boolean }) {
  const handleOpenMaps = () => {
    openExternalMap(address);
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} isStatic={isStatic} maxWidth="max-w-sm" noPadding>
      <div className="flex flex-col bg-stone-50 border-b border-stone-100 rounded-[2rem] shadow-sm overflow-hidden p-7 gap-4">
        <p className="text-[16px] font-black text-stone-900 leading-relaxed text-center px-2">{address || 'Adres bilgisi bulunamadı.'}</p>
        <Button onClick={handleOpenMaps} variant="phone" mode="rectangle" className="w-full !h-16 !rounded-2xl" disabled={!address} showFingerprint={true} icon={<Lucide.MapPin size={18} strokeWidth={2.5} />}>
          YOL TARİFİ AL
        </Button>
      </div>
    </BaseModal>
  );
}

// ---------------------------------------------------------------------------
// 3. CONTACT MODAL
// ---------------------------------------------------------------------------
export function ContactModal({ isOpen, onClose, phone, storeName, isStatic = false }: { isOpen: boolean; onClose: () => void; phone: string; storeName: string; isStatic?: boolean }) {
  const handlePhoneCall = () => {
    callPhone(phone);
  };
  const handleWhatsApp = () => {
    const text = `Selam ${storeName}, Ürünleriniz hakkında bilgi almak istiyorum.`;
    openWhatsApp(phone, text);
  };
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} isStatic={isStatic} maxWidth="max-w-sm" noPadding>
      <div className="flex flex-col bg-stone-50 border-b border-stone-100 rounded-3xl shadow-sm overflow-hidden p-10">
        <div className="flex items-center justify-center gap-8 w-full">
          <Button onClick={handlePhoneCall} variant="phone" mode="circle" className="!w-20 !h-20 shadow-2xl transition-all active:scale-90" showFingerprint={false} icon={<Lucide.Phone size={32} strokeWidth={2.5} />} />
          <Button onClick={handleWhatsApp} variant="whatsapp" mode="circle" className="!w-20 !h-20 shadow-2xl transition-all active:scale-90 border-none" showFingerprint={false} icon={<div className="w-10 h-10 fill-white">{THEME.icons.whatsapp}</div>} />
        </div>
      </div>
    </BaseModal>
  );
}

// ---------------------------------------------------------------------------
// 4. COUPON MODAL
// ---------------------------------------------------------------------------
export function CouponModal({ isOpen, onClose, onApplyDiscount, discountError, activeDiscount, isStatic = false }: CouponModalProps) {
  const [couponCode, setCouponCode] = useState('');
  const { showFeedback } = useStore();
  const handleApply = useCallback(() => {
    if (couponCode.trim()) onApplyDiscount(couponCode.trim().toUpperCase());
  }, [couponCode, onApplyDiscount]);
  useEffect(() => {
    if (isOpen && activeDiscount) { showFeedback('success', `İNDİRİM UYGULANDI: %${Math.round(activeDiscount.rate * 100)}`); onClose(); }
    if (isOpen && discountError) showFeedback('error', discountError);
  }, [activeDiscount, discountError, isOpen, showFeedback, onClose]);

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-sm" isStatic={isStatic} title="İNDİRİM KUPONU">
      <div className="space-y-6 py-2">
        <FormInput id="coupon-input" type="text" value={couponCode} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCouponCode(e.target.value.toUpperCase())} onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleApply()} placeholder="Kodu buraya yazın" className="!text-center !py-6 focus:!border-emerald-500 !text-sm !rounded-3xl shadow-inner" autoFocus />
        <div className="flex gap-3 w-full">
          <Button onClick={onClose} variant="secondary" className="w-16 h-16 shrink-0" mode="rectangle"><Lucide.ChevronLeft size={24} strokeWidth={3} /></Button>
          <Button onClick={handleApply} variant="action" className="flex-1 h-16 !rounded-[24px]" showFingerprint={true}><span className="font-black tracking-[0.2em] text-[15px] uppercase">UYGULA</span></Button>
        </div>
      </div>
    </BaseModal>
  );
}

// ---------------------------------------------------------------------------
// 5. QUICK EDIT MODAL
// ---------------------------------------------------------------------------
export function QuickEditModal({ isOpen, onClose, onSave, initialValue = '', placeholder = '', type = 'text', isStatic = false }: Omit<QuickEditModalProps, 'title' | 'subtitle'>) {
  const [value, setValue] = useState(initialValue);
  const [prevInitial, setPrevInitial] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  if (initialValue !== prevInitial) { setValue(initialValue); setPrevInitial(initialValue); }
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 100); }, [isOpen]);
  const handleSave = () => { onSave(value.trim()); onClose(); };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-sm" isStatic={isStatic}>
      <div className="flex flex-col gap-6 py-2">
        <FormInput id="quick-edit-input" ref={inputRef} type={type} value={value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)} onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleSave()} placeholder={placeholder} className="!text-center !py-6 focus:!border-emerald-500 !text-sm !rounded-3xl shadow-inner" />
        <div className="flex gap-3 w-full">
          <Button onClick={onClose} variant="secondary" className="w-16 h-16 shrink-0" mode="rectangle"><Lucide.ChevronLeft size={24} strokeWidth={3} /></Button>
          <Button onClick={handleSave} variant="action" className="flex-1 h-16 !rounded-[24px]" showFingerprint={true}><span className="font-black tracking-[0.2em] text-[15px] uppercase">TAMAM</span></Button>
        </div>
      </div>
    </BaseModal>
  );
}

// ---------------------------------------------------------------------------
// 6. PIN MODAL
// ---------------------------------------------------------------------------
export function PinModal({ onVerify, onAuthenticationSuccess, onModalClose, isLockedOut, failedAttempts = 0, isStatic = false, initialStep }: PinModalProps) {
  const [overrideIsLockedOut, setOverrideIsLockedOut] = useState<boolean | undefined>();
  const [overrideFailedAttempts, setOverrideFailedAttempts] = useState<number | undefined>();
  const activeIsLockedOut = overrideIsLockedOut !== undefined ? overrideIsLockedOut : isLockedOut;
  const activeFailedAttempts = overrideFailedAttempts !== undefined ? overrideFailedAttempts : failedAttempts;
  const [currentPinAttempt, setCurrentPinAttempt] = useState('');
  const [hasAuthError, setHasAuthError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRobotVerified, setIsRobotVerified] = useState(false);
  const requiresCaptcha = activeFailedAttempts >= 2;
  const isInputDisabled = activeIsLockedOut || isVerifying || (requiresCaptcha && !isRobotVerified);
  const theme = THEME.pinModal;
  const globalIcons = THEME.icons;

  useEffect(() => {
    if (initialStep === 1) { setOverrideIsLockedOut(false); setOverrideFailedAttempts(0); }
    else if (initialStep === 2) { setOverrideIsLockedOut(false); setOverrideFailedAttempts(2); }
    else if (initialStep === 3) { setOverrideIsLockedOut(true); setOverrideFailedAttempts(0); }
  }, [initialStep]);

  const handleDigitEntry = async (digit: string) => {
    if (isInputDisabled || currentPinAttempt.length >= 4) return;
    const newAttempt = currentPinAttempt + digit;
    setCurrentPinAttempt(newAttempt);
    if (newAttempt.length === 4) {
      setIsVerifying(true);
      if (await onVerify(newAttempt)) onAuthenticationSuccess();
      else { setHasAuthError(true); setTimeout(() => { setCurrentPinAttempt(''); setHasAuthError(false); }, 600); }
      setIsVerifying(false);
    }
  };

  return (
    <motion.div initial={isStatic ? { opacity: 1 } : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={isStatic ? "relative z-0" : `${theme.overlay} z-[10000]`}>
      <motion.div initial={isStatic ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8, filter: 'blur(10px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }} transition={{ type: 'spring', damping: 25, stiffness: 300, duration: 0.4 }} className={`${isStatic ? "relative w-full max-w-sm mx-auto" : theme.container} ${hasAuthError ? theme.animations.shake : ''}`}>
        <AnimatePresence mode="wait">
          {requiresCaptcha && !isRobotVerified ? (
            <motion.div key="captcha" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="flex flex-col items-center justify-center min-h-[320px] w-full">
              <span className="text-[10px] font-black tracking-[0.4em] text-white/40 uppercase mb-10">GÜVENLİK DOĞRULAMASI</span>
              <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/10 shadow-2xl">
                <Turnstile onVerify={() => setIsRobotVerified(true)} options={{ theme: 'dark', size: 'normal' }} />
              </div>
              <Button onClick={onModalClose} variant="ghost" className="mt-10 text-white/30 hover:text-white font-black text-[10px] tracking-[0.2em] uppercase">İPTAL ET</Button>
            </motion.div>
          ) : (
            <motion.div key="pin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
              <div className="flex flex-col items-center justify-center h-20 mb-4">
                <div className={theme.headerIconWrapper + ' !mb-0'}><div className={theme.headerIconSize}>{isVerifying ? <div className={THEME.loading.spinner + ' w-5 h-5'} /> : activeIsLockedOut ? '⏳' : globalIcons.lock}</div></div>
              </div>
              <div className={theme.dotsWrapper}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`${theme.dotBase} ${i < currentPinAttempt.length ? (isVerifying && !hasAuthError ? `bg-emerald-500 ${THEME.shadows.glow}` : theme.dotActive) : theme.dotInactive} ${hasAuthError ? theme.dotError : ''}`} />
                ))}
              </div>
              <div className={`${theme.keyboardGrid} ${isInputDisabled ? 'opacity-30 pointer-events-none grayscale' : 'transition-all'}`}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <Button key={num} onClick={() => handleDigitEntry(String(num))} className={theme.keyButton} variant="secondary" mode="circle"><span className={theme.typography.keyText}>{num}</span></Button>
                ))}
                <Button onClick={onModalClose} variant="ghost" mode="rectangle" className={theme.cancelButton}>İPTAL</Button>
                <Button onClick={() => handleDigitEntry('0')} className={theme.keyButton} variant="secondary" mode="circle"><span className={theme.typography.keyText}>0</span></Button>
                <Button onClick={() => setCurrentPinAttempt(prev => prev.slice(0, -1))} variant="ghost" mode="circle" className={theme.deleteButton} icon={<div className={theme.deleteIconSize}>{globalIcons.backspace}</div>} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// 7. PRODUCT DETAIL MODAL
// ---------------------------------------------------------------------------
export function ProductDetailModal({
  isOpen,
  onClose,
  product,
  isPromotionActive,
  originalPriceLabel,
  discountedPriceLabel,
  highDefinitionImageSource,
  isStatic = false,
}: ProductDetailModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-sm" className="!p-0" noPadding isStatic={isStatic}>
      <div className="flex flex-col relative bg-white p-4">
        <div className="relative aspect-square bg-stone-50 overflow-hidden rounded-2xl border border-stone-100 shadow-inner">
          <SmartImage src={highDefinitionImageSource} alt={product.name} aspectRatio="square" className="w-full h-full" />
        </div>
        <div className="pt-6 pb-20 px-4 space-y-4">
          <div className="space-y-2 text-left">
            <div><span className="bg-stone-50 text-stone-500 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] inline-block border border-stone-100 shadow-sm">{product.category}</span></div>
            <h3 className="text-lg font-black text-stone-900 tracking-tighter leading-tight max-w-[85%] uppercase">{product.name}</h3>
            {product.description && <p className="text-stone-500 text-[10px] font-bold leading-relaxed max-w-[95%] uppercase">{product.description}</p>}
          </div>
        </div>
        <div className="absolute bottom-10 left-8 pointer-events-none">
          <div className="flex flex-col items-start">
            {isPromotionActive ? (
              <div className="flex flex-col items-start gap-1">
                <span className="text-stone-300 line-through text-sm font-bold">{originalPriceLabel}</span>
                <span className="text-stone-900 text-2xl font-black tracking-tighter">{discountedPriceLabel}</span>
              </div>
            ) : (
              <div className="bg-white/50 backdrop-blur-sm"><span className="text-stone-900 text-2xl font-black tracking-tighter">{originalPriceLabel}</span></div>
            )}
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

// ---------------------------------------------------------------------------
// 8. GLOBAL ADD MENU MODAL
// ---------------------------------------------------------------------------
export function GlobalAddMenuModal({ isOpen, onClose, onAction, isStatic = false }: any) {
  const options: { id: 'PRODUCT' | 'CATEGORY' | 'REFERENCE' | 'CAROUSEL'; title: string }[] = [
    { id: 'PRODUCT', title: 'ÜRÜN EKLE' },
    { id: 'CATEGORY', title: 'KATEGORİ EKLE' },
    { id: 'REFERENCE', title: 'REFERANS EKLE' },
    { id: 'CAROUSEL', title: 'AFİŞ EKLE' },
  ];
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-sm" isStatic={isStatic} title="İŞLEMLER">
      <div className="grid grid-cols-1 gap-2 py-2">
        {options.map((option) => (
          <Button key={option.id} onClick={() => { onAction(option.id); onClose(); }} variant="primary" mode="rectangle" showFingerprint={true} className="!h-16 !rounded-2xl !bg-stone-50 !text-stone-900 border-none hover:!bg-stone-900 hover:!text-white transition-all shadow-none">
            <span className="text-xs font-black uppercase tracking-widest">{option.title}</span>
          </Button>
        ))}
      </div>
    </BaseModal>
  );
}
