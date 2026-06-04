import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Lucide from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { THEME, ANIMATIONS } from '../../data/config/theme';
import { useStore } from '../../store';
import {
  PinModalProps,
  CouponModalProps,
  QuickEditModalProps,
  ProductDetailModalProps,
} from '../../types';
import Button from '../ui/Button';
import BaseModal from './BaseModal';
import FormInput from '../ui/FormInput';
import Turnstile from '../ui/Turnstile';
import SmartImage from '../ui/SmartImage';
import StatusToggle from '../ui/StatusToggle';
import { openExternalMap, openWhatsApp, callPhone } from '../../utils/contact';
import { copyToClipboard } from '../../utils/core';
import { usePinFlow } from '../../hooks/usePinFlow';
import { useEditProdCardFlow } from '../../hooks/useEditProdCardFlow';

// ---------------------------------------------------------------------------
// 1. QR MODAL (Branded & Interactive)
// ---------------------------------------------------------------------------
export function QRModal({
  isOpen,
  onClose,
  isStatic = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  isStatic?: boolean;
}) {
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
      <Button
        onClick={handleCopy}
        variant="secondary"
        className="!h-16"
        mode="rectangle"
        showFingerprint={true}
        fingerprintType="detailed"
      >
        <span className="text-[10px] font-black uppercase tracking-widest text-stone-900">
          {copied ? 'KOPYALANDI ✅' : `${displayUrl} metnini kopyala`}
        </span>
      </Button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      isStatic={isStatic}
      maxWidth="max-w-sm"
      footer={footer}
      noPadding
    >
      <div className="flex flex-col items-center justify-center p-8">
        <div className="relative group p-6 bg-white border border-stone-100 rounded-[2.5rem] shadow-xl shadow-stone-100/50 transition-all duration-500 hover:scale-[1.02]">
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-stone-200 rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-stone-200 rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-stone-200 rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-stone-200 rounded-br-lg" />
          <div className="relative flex items-center justify-center">
            <QRCodeSVG
              value={shopUrl}
              size={200}
              level="H"
              includeMargin={false}
              className="rounded-xl overflow-hidden"
            />
            {storeLogo && (
              <div className="absolute w-14 h-14 bg-white p-1 rounded-2xl shadow-md border border-stone-50 flex items-center justify-center overflow-hidden">
                <img
                  src={storeLogo}
                  alt="Store Logo"
                  className="w-full h-full object-contain rounded-xl"
                />
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
export function LocationModal({
  isOpen,
  onClose,
  address,
  isStatic = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  isStatic?: boolean;
}) {
  const handleOpenMaps = () => {
    openExternalMap(address);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      isStatic={isStatic}
      maxWidth="max-w-sm"
      noPadding
    >
      <div className="flex flex-col bg-stone-50 border-b border-stone-100 rounded-[2rem] shadow-sm overflow-hidden p-7 gap-4">
        <p className="text-[16px] font-black text-stone-900 leading-relaxed text-center px-2">
          {address || 'Adres bilgisi bulunamadı.'}
        </p>
        <Button
          onClick={handleOpenMaps}
          variant="phone"
          mode="rectangle"
          className="w-full !h-16 !rounded-2xl"
          disabled={!address}
          showFingerprint={true}
          icon={<Lucide.MapPin size={18} strokeWidth={2.5} />}
        >
          YOL TARİFİ AL
        </Button>
      </div>
    </BaseModal>
  );
}

// ---------------------------------------------------------------------------
// 3. CONTACT MODAL
// ---------------------------------------------------------------------------
export function ContactModal({
  isOpen,
  onClose,
  phone,
  whatsapp,
  storeName,
  isStatic = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  whatsapp: string;
  storeName: string;
  isStatic?: boolean;
}) {
  const handlePhoneCall = () => {
    callPhone(phone);
  };
  const handleWhatsApp = () => {
    const text = `Selam ${storeName}, Ürünleriniz hakkında bilgi almak istiyorum.`;
    openWhatsApp(whatsapp, text);
  };
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      isStatic={isStatic}
      maxWidth="max-w-sm"
      noPadding
    >
      <div className="flex flex-col bg-stone-50 border-b border-stone-100 rounded-3xl shadow-sm overflow-hidden p-10">
        <div className="flex items-center justify-center gap-8 w-full">
          <Button
            onClick={handlePhoneCall}
            variant="phone"
            mode="circle"
            className="!w-20 !h-20 shadow-2xl transition-all active:scale-90"
            showFingerprint={false}
            icon={<Lucide.Phone size={32} strokeWidth={2.5} />}
          />
          <Button
            onClick={handleWhatsApp}
            variant="whatsapp"
            mode="circle"
            className="!w-20 !h-20 shadow-2xl transition-all active:scale-90 border-none"
            showFingerprint={false}
            icon={
              <div className="w-10 h-10 fill-white">{THEME.icons.whatsapp}</div>
            }
          />
        </div>
      </div>
    </BaseModal>
  );
}

// ---------------------------------------------------------------------------
// 4. COUPON MODAL
// ---------------------------------------------------------------------------
export function CouponModal({
  isOpen,
  onClose,
  onApplyDiscount,
  discountError,
  activeDiscount,
  isStatic = false,
}: CouponModalProps) {
  const [couponCode, setCouponCode] = useState('');
  const { showFeedback } = useStore();
  const handleApply = useCallback(() => {
    if (couponCode.trim()) onApplyDiscount(couponCode.trim().toUpperCase());
  }, [couponCode, onApplyDiscount]);
  useEffect(() => {
    if (isOpen && activeDiscount) {
      showFeedback(
        'success',
        `İNDİRİM UYGULANDI: %${Math.round(activeDiscount.rate * 100)}`,
      );
      onClose();
    }
    if (isOpen && discountError) showFeedback('error', discountError);
  }, [activeDiscount, discountError, isOpen, showFeedback, onClose]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-sm"
      isStatic={isStatic}
      title="İNDİRİM KUPONU"
    >
      <div className="space-y-6 py-2">
        <FormInput
          id="coupon-input"
          type="text"
          value={couponCode}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCouponCode(e.target.value.toUpperCase())
          }
          onKeyDown={(e: React.KeyboardEvent) =>
            e.key === 'Enter' && handleApply()
          }
          placeholder="Kodu buraya yazın"
          className="!text-center !py-6 focus:!border-emerald-500 !text-sm !rounded-3xl shadow-inner"
          autoFocus
        />
        <div className="flex gap-3 w-full">
          <Button
            onClick={onClose}
            variant="secondary"
            className="w-16 h-16 shrink-0"
            mode="rectangle"
          >
            <Lucide.ChevronLeft size={24} strokeWidth={3} />
          </Button>
          <Button
            onClick={handleApply}
            variant="action"
            className="flex-1 h-16 !rounded-[24px]"
            showFingerprint={true}
          >
            <span className="font-black tracking-[0.2em] text-[15px] uppercase">
              UYGULA
            </span>
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}

// ---------------------------------------------------------------------------
// 5. QUICK EDIT MODAL
// ---------------------------------------------------------------------------
export function QuickEditModal({
  isOpen,
  onClose,
  onSave,
  title,
  subtitle,
  initialValue = '',
  placeholder = '',
  type = 'text',
  isStatic = false,
  maxLength,
  keyName,
}: QuickEditModalProps) {
  const parsedInitial = keyName === 'slug'
    ? initialValue.replace(/^www\./i, '').replace(/\.ekatalog\.site$/i, '')
    : initialValue;

  const [value, setValue] = useState(parsedInitial);
  const [prevInitial, setPrevInitial] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  if (initialValue !== prevInitial) {
    setValue(parsedInitial);
    setPrevInitial(initialValue);
  }
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const handleSave = () => {
    onSave(value.trim());
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-sm"
      isStatic={isStatic}
      title={title}
      subtitle={subtitle}
    >
      <div className="flex flex-col gap-6 py-2">
        <div className="relative flex flex-col gap-1 w-full">
          {keyName === 'slug' ? (
            <div className="flex items-center w-full border border-stone-200 focus-within:border-emerald-500 rounded-3xl bg-stone-50/50 shadow-inner px-4 py-4 transition-all">
              <span className="text-stone-400 font-bold select-none text-sm pr-1">www.</span>
              <input
                ref={inputRef as any}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="dukkan-adi"
                className="flex-1 bg-transparent border-none outline-none text-stone-900 font-black text-sm text-center tracking-wide"
                maxLength={30}
              />
              <span className="text-stone-400 font-bold select-none text-sm pl-1">.ekatalog.site</span>
            </div>
          ) : (
            <FormInput
              id="quick-edit-input"
              ref={inputRef}
              type={type}
              value={value}
              maxLength={maxLength}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setValue(e.target.value)
              }
              onKeyDown={(e: React.KeyboardEvent) =>
                e.key === 'Enter' && handleSave()
              }
              placeholder={placeholder}
              className="!text-center !py-6 focus:!border-emerald-500 !text-sm !rounded-3xl shadow-inner w-full"
            />
          )}
          {maxLength && (
            <div className="text-[9px] text-stone-400 font-black tracking-widest text-right pr-4 select-none">
              {value.length}/{maxLength}
            </div>
          )}
        </div>
        <div className="flex gap-3 w-full">
          <Button
            onClick={onClose}
            variant="secondary"
            className="w-16 h-16 shrink-0"
            mode="rectangle"
          >
            <Lucide.ChevronLeft size={24} strokeWidth={3} />
          </Button>
          <Button
            onClick={handleSave}
            variant="action"
            className="flex-1 h-16 !rounded-[24px]"
            showFingerprint={true}
          >
            <span className="font-black tracking-[0.2em] text-[15px] uppercase">
              TAMAM
            </span>
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}

// ---------------------------------------------------------------------------
// 6. PIN MODAL
// ---------------------------------------------------------------------------
export function PinModal({
  onVerify,
  onAuthenticationSuccess,
  onModalClose,
  isLockedOut,
  failedAttempts = 0,
  isStatic = false,
  initialStep,
}: PinModalProps) {
  const flow = usePinFlow(
    onVerify,
    onAuthenticationSuccess,
    isLockedOut ?? false,
    failedAttempts,
    initialStep,
  );
  const theme = THEME.pinModal;
  const globalIcons = THEME.icons;

  return (
    <motion.div
      initial={isStatic ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={isStatic ? 'relative z-0' : `${theme.overlay} z-[10000] cursor-pointer`}
      onClick={onModalClose}
    >
      <motion.div
        initial={isStatic ? undefined : ANIMATIONS.pin.initial}
        animate={isStatic ? undefined : ANIMATIONS.pin.animate}
        exit={isStatic ? undefined : ANIMATIONS.pin.exit}
        transition={isStatic ? undefined : ANIMATIONS.pin.transition}
        className={`${isStatic ? 'relative w-full max-w-sm mx-auto' : theme.container} ${flow.hasAuthError ? theme.animations.shake : ''} cursor-default`}
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {flow.requiresCaptcha && !flow.isRobotVerified ? (
            <motion.div
              key="captcha"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center justify-center w-full py-4"
            >
              <span className="text-[10px] font-black tracking-[0.4em] text-stone-500 uppercase mb-6">
                GÜVENLİK DOĞRULAMASI
              </span>
              <div className="flex items-center justify-center w-full">
                <Turnstile
                  onVerify={() => flow.setIsRobotVerified(true)}
                  options={{ theme: 'light', size: 'compact' }}
                />
              </div>
              <button
                onClick={onModalClose}
                className="mt-6 text-stone-500 hover:text-stone-950 font-black text-[10px] tracking-[0.2em] uppercase transition-colors"
              >
                İPTAL ET
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="pin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <div className="flex items-center justify-center h-12 mb-4 w-full">
                {flow.isVerifying ? (
                  <div className={THEME.loading.spinner + ' w-5 h-5'} />
                ) : flow.activeIsLockedOut ? (
                  <span className="text-base">⏳</span>
                ) : (
                  <div className={theme.dotsWrapper + ' !mb-0'}>
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`${theme.dotBase} ${i < flow.currentPinAttempt.length ? theme.dotActive : theme.dotInactive} ${flow.hasAuthError ? theme.dotError : ''}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div
                className={`${theme.keyboardGrid} ${flow.isInputDisabled ? 'opacity-30 pointer-events-none grayscale' : 'transition-all'}`}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <Button
                    key={num}
                    onClick={() => flow.handleDigitEntry(String(num))}
                    className={theme.keyButton}
                    variant="secondary"
                    mode="circle"
                  >
                    <span className={theme.typography.keyText}>{num}</span>
                  </Button>
                ))}
                <Button
                  onClick={onModalClose}
                  variant="ghost"
                  mode="circle"
                  className={theme.cancelButton}
                >
                  İPTAL
                </Button>
                <Button
                  onClick={() => flow.handleDigitEntry('0')}
                  className={theme.keyButton}
                  variant="secondary"
                  mode="circle"
                >
                  <span className={theme.typography.keyText}>0</span>
                </Button>
                <Button
                  onClick={() => {
                    if (flow.isInputDisabled) return;
                    flow.setCurrentPinAttempt((prev) => prev.slice(0, -1));
                  }}
                  variant="ghost"
                  mode="circle"
                  className={theme.deleteButton}
                  icon={
                    <div className={theme.deleteIconSize}>
                      {globalIcons.backspace}
                    </div>
                  }
                />
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
  showPrice = true,
  isAdmin = false,
  categories = [],
  onUpdate,
  onDelete,
  onImageUpload,
}: ProductDetailModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const flow = useEditProdCardFlow(
    product,
    onDelete || (() => {}),
    onUpdate || (() => {}),
    onImageUpload,
    isOpen,
    onClose,
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-sm"
      className="!p-0"
      noPadding
      isStatic={isStatic}
    >
      <div className="flex flex-col relative bg-white p-4">
        {isAdmin && (
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => flow.handleImageFileChange(e, fileInputRef)}
          />
        )}

        {flow.showDeleteConfirm ? (
          /* DELETE CONFIRMATION INTERFACE (Unified in detail modal) */
          <div className="p-6">
            {!flow.deleteTarget ? (
              /* STEP 1: SELECT TARGET */
              <div className="flex flex-col gap-3 py-6">
                <button
                  onClick={() => flow.setDeleteTarget('PRODUCT')}
                  className="w-full py-4 text-xs font-black uppercase tracking-wider rounded-2xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200 active:scale-95 border border-red-100/50 shadow-sm"
                >
                  ÜRÜNÜ TAMAMEN SİL
                </button>
                <button
                  onClick={() => flow.setDeleteTarget('IMAGE')}
                  className="w-full py-4 text-xs font-black uppercase tracking-wider rounded-2xl bg-stone-50 text-stone-700 hover:bg-stone-100 transition-all duration-200 active:scale-95 border border-stone-100 shadow-sm"
                >
                  SADECE GÖRSELİ KALDIR
                </button>
                <button
                  onClick={() => flow.setShowDeleteConfirm(false)}
                  className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-600 mt-2 transition-colors"
                >
                  İPTAL ET
                </button>
              </div>
            ) : (
              /* STEP 2 & 3: WARNING & FINAL FINGERPRINT CONFIRM */
              <div className="flex flex-col items-center text-center space-y-6 py-6">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center shadow-inner relative">
                  <div className="absolute inset-0 bg-red-500/10 rounded-full animate-ping" />
                  <Lucide.AlertCircle
                    size={32}
                    strokeWidth={2.5}
                    className="relative z-10"
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-stone-900 uppercase tracking-tighter">
                    EMİN MİSİNİZ?
                  </h3>
                  <p className="text-[12px] font-bold text-stone-400 leading-relaxed px-4">
                    {flow.deleteTarget === 'PRODUCT'
                      ? 'Bu ürün dükkandan tamamen ve kalıcı olarak kaldırılacak.'
                      : 'Ürünün görseli kalıcı olarak silinecek, ürün dükkanda kalmaya devam edecek.'}
                    <br />
                    <span className="text-red-500/80 uppercase text-[9px] tracking-widest font-black block mt-2">
                      Bu işlem geri alınamaz!
                    </span>
                  </p>
                </div>

                <div className="w-full space-y-3 pt-2">
                  <Button
                    onClick={flow.finalizeDelete}
                    variant="danger"
                    mode="rectangle"
                    className="w-full !h-16 font-black shadow-2xl shadow-red-200 !rounded-2xl text-xs tracking-widest"
                    showFingerprint={true}
                    fingerprintType="touch"
                  >
                    SİLMEYİ ONAYLA
                  </Button>

                  <Button
                    onClick={() => flow.setDeleteTarget(null)}
                    variant="ghost"
                    mode="rectangle"
                    className="w-full !text-stone-400 hover:!text-stone-900 !text-[10px] font-black uppercase py-2 tracking-widest flex items-center justify-center gap-1.5"
                    icon={<Lucide.ArrowLeft size={14} strokeWidth={3} />}
                  >
                    VAZGEÇ
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* PRODUCT DETAILS & INLINE ACTIONS */
          <>
            <div className="relative aspect-square bg-stone-50 overflow-hidden rounded-2xl border border-stone-100 shadow-inner">
              <SmartImage
                src={highDefinitionImageSource}
                alt={product.name}
                aspectRatio="square"
                className="w-full h-full"
              />
            </div>

            {isAdmin && (
              <div className="mt-3">
                <Button
                  onClick={() => !flow.isUploading && fileInputRef.current?.click()}
                  variant="secondary"
                  mode="rectangle"
                  className="w-full !h-11 !rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-all active:scale-[0.98]"
                  icon={
                    flow.isUploading ? (
                      <div className="w-3.5 h-3.5 border-2 border-stone-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Lucide.Camera size={14} />
                    )
                  }
                >
                  DEĞİŞTİR
                </Button>
              </div>
            )}

            <div className={`pt-6 px-4 space-y-4 text-left ${isAdmin ? 'pb-6' : 'pb-20'}`}>
              <div className="space-y-2">
                <div>
                  {isAdmin && categories && categories.length > 0 ? (
                    <div className="relative inline-block">
                      <select
                        value={product.category}
                        onChange={(e) => flow.handleAction('CATEGORY', e.target.value)}
                        className="appearance-none bg-stone-50 text-stone-500 pl-3 pr-8 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] inline-block border border-stone-100 shadow-sm outline-none cursor-pointer focus:border-stone-300 animate-none"
                        style={{
                          width: `${product.category.length * 6.6 + 44}px`,
                        }}
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-stone-400">
                        <Lucide.ChevronDown size={10} strokeWidth={3} />
                      </div>
                    </div>
                  ) : (
                    <span className="bg-stone-50 text-stone-500 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] inline-block border border-stone-100 shadow-sm">
                      {product.category}
                    </span>
                  )}
                </div>

                {isAdmin ? (
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => onUpdate?.(product.id, { name: e.target.value })}
                    className="text-lg font-black text-stone-900 tracking-tighter leading-tight w-full uppercase bg-transparent outline-none focus:bg-stone-100 hover:bg-stone-50 rounded px-1 -mx-1 border-none focus:ring-0 focus:outline-none transition-all"
                    placeholder="ÜRÜN ADI"
                  />
                ) : (
                  <h3 className="text-lg font-black text-stone-900 tracking-tighter leading-tight max-w-[85%] uppercase">
                    {product.name}
                  </h3>
                )}

                {isAdmin ? (
                  <textarea
                    value={product.description || ''}
                    onChange={(e) => {
                      onUpdate?.(product.id, { description: e.target.value });
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onFocus={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    className="text-stone-500 text-[10px] font-bold leading-relaxed w-full uppercase bg-transparent outline-none focus:bg-stone-100 hover:bg-stone-50 rounded px-1 -mx-1 border-none focus:ring-0 focus:outline-none transition-all resize-none overflow-hidden block"
                    placeholder="ÜRÜN AÇIKLAMASI EKLE"
                    rows={1}
                  />
                ) : (
                  product.description && (
                    <p className="text-stone-500 text-[10px] font-bold leading-relaxed max-w-[95%] uppercase">
                      {product.description}
                    </p>
                  )
                )}
              </div>

              {isAdmin && showPrice && (
                <div className="pt-2">
                  {isPromotionActive ? (
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-stone-300 line-through text-[10px] font-bold">
                        {originalPriceLabel}
                      </span>
                      <span className="text-stone-900 text-xl font-black tracking-tighter">
                        {discountedPriceLabel}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-stone-900 text-xl font-black tracking-tighter">
                        {originalPriceLabel}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* ADMIN CONTROLS BOTTOM ROW */}
              {isAdmin && (
                <div className="flex items-center justify-between border-t border-stone-100 pt-4 mt-6">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-1 select-none">
                      <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">
                        STOK
                      </span>
                      <StatusToggle
                        value={!product.out_of_stock}
                        onChange={(val) => flow.handleAction('STOCK', !val)}
                        variant="compact"
                        activeColor="bg-emerald-500"
                        inactiveColor="bg-stone-200"
                      />
                    </div>
                    <div className="flex flex-col items-center gap-1 select-none">
                      <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">
                        YAYIN
                      </span>
                      <StatusToggle
                        value={!product.is_archived}
                        onChange={(val) => flow.handleAction('ARCHIVE', !val)}
                        variant="compact"
                        activeColor="bg-emerald-500"
                        inactiveColor="bg-stone-200"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => flow.handleAction('DOWNLOAD')}
                      className="w-9 h-9 rounded-xl bg-stone-900/60 hover:bg-stone-900/80 text-white border border-white/20 backdrop-blur-md shadow-xl flex items-center justify-center transition-all active:scale-95 outline-none"
                      title="Görseli İndir"
                    >
                      <Lucide.Download size={16} strokeWidth={2.5} />
                    </button>

                    <button
                      onClick={() => {
                        flow.setShowDeleteConfirm(true);
                        flow.setDeleteTarget(null);
                      }}
                      className="w-9 h-9 rounded-xl bg-stone-900/60 hover:bg-stone-900/80 text-white hover:text-red-300 border border-white/20 backdrop-blur-md shadow-xl flex items-center justify-center transition-all active:scale-95 outline-none"
                      title="Ürünü Sil"
                    >
                      <Lucide.Trash2 size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {!isAdmin && showPrice && (
              <div className="absolute bottom-10 left-8 pointer-events-none">
                <div className="flex flex-col items-start">
                  {isPromotionActive ? (
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-stone-300 line-through text-sm font-bold">
                        {originalPriceLabel}
                      </span>
                      <span className="text-stone-900 text-2xl font-black tracking-tighter">
                        {discountedPriceLabel}
                      </span>
                    </div>
                  ) : (
                    <div className="bg-white/50 backdrop-blur-sm">
                      <span className="text-stone-900 text-2xl font-black tracking-tighter">
                        {originalPriceLabel}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </BaseModal>
  );
}

// ---------------------------------------------------------------------------
// 8. GLOBAL ADD MENU MODAL
// ---------------------------------------------------------------------------
export function GlobalAddMenuModal({
  isOpen,
  onClose,
  onAction,
  isStatic = false,
}: any) {
  const options: {
    id: 'PRODUCT' | 'CATEGORY' | 'REFERENCE' | 'CAROUSEL';
    title: string;
  }[] = [
    { id: 'PRODUCT', title: 'ÜRÜN EKLE' },
    { id: 'CATEGORY', title: 'KATEGORİ EKLE' },
    { id: 'REFERENCE', title: 'REFERANS EKLE' },
    { id: 'CAROUSEL', title: 'AFİŞ EKLE' },
  ];
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-sm"
      isStatic={isStatic}
      title="İŞLEMLER"
    >
      <div className="grid grid-cols-1 gap-2 py-2">
        {options.map((option) => (
          <Button
            key={option.id}
            onClick={() => {
              onAction(option.id);
              if (option.id !== 'PRODUCT') {
                onClose();
              }
            }}
            variant="primary"
            mode="rectangle"
            showFingerprint={true}
            className="!h-16 !rounded-2xl !bg-stone-50 !text-stone-900 border-none hover:!bg-stone-900 hover:!text-white transition-all shadow-none"
          >
            <span className="text-xs font-black uppercase tracking-widest">
              {option.title}
            </span>
          </Button>
        ))}
      </div>
    </BaseModal>
  );
}
