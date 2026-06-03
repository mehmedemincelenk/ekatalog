import { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '../layout/Navbar';
import Button from '../ui/Button';
import BaseModal from './BaseModal';
import StatusToggle from '../ui/StatusToggle';
import Loading from '../ui/Loading';
import HeroCarousel from '../layout/HeroCarousel';
import References from '../layout/References';
import BaseFloatingMenu from '../layout/BaseFloatingMenu';
import { DisplaySettingsModalProps } from '../../types';
import { THEME } from '../../data/config';
import { useStore } from '../../store';
import * as Lucide from 'lucide-react';
import { useDisplaySettingsFlow } from '../../hooks/useDisplaySettingsFlow';

const InstagramIcon = ({ className = 'w-5 h-5 text-white' }: { className?: string }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} fill-current`}
  >
    <path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077" />
  </svg>
);

// Reusable Static Configuration Arrays to achieve ultimate DRY compliance
const FLOATING_OPTIONS = [
  { key: 'showCoupons', id: 'coupon', label: 'İndirim Kuponu', icon: <Lucide.Ticket className="w-5 h-5" strokeWidth={2.5} />, variant: 'secondary' as const },
  { key: 'showAddress', id: 'location', label: 'Adres Bilgisi', icon: <Lucide.MapPin className="w-5 h-5" strokeWidth={2.5} />, variant: 'secondary' as const },
  { key: 'showCurrency', id: 'currency', label: 'Döviz Çevirici', icon: <div className="w-full h-full flex items-center justify-center text-[20px] font-medium text-white">₺</div>, variant: 'secondary' as const, closeOnClick: false },
  { key: 'showInstagram', id: 'instagram', label: 'Instagram', icon: <InstagramIcon className="w-5 h-5 text-white" />, variant: 'secondary' as const },
  { key: 'showQR', id: 'qr', label: 'QR Kod Paylaşımı', icon: <Lucide.QrCode className="w-5 h-5" strokeWidth={2.5} />, variant: 'secondary' as const },
  { key: 'showWhatsapp', id: 'whatsapp', label: 'WhatsApp', icon: <Lucide.MessageCircle className="w-5 h-5 text-white" />, variant: 'secondary' as const },
  { key: 'showSearch', id: 'search', label: 'Arama Çubuğu', icon: <Lucide.Search className="w-5 h-5" strokeWidth={2.5} />, variant: 'secondary' as const },
  { key: 'showPhone', id: 'call', label: 'Telefon Arama', icon: <Lucide.Phone className="w-5 h-5" strokeWidth={2.5} />, variant: 'secondary' as const }
] as const;

const TABELA_OPTIONS = [
  { key: 'announcement', label: 'Duyuru Panosu' },
  { key: 'showTitle', label: 'Mağaza Adı' },
  { key: 'showLogo', label: 'Mağaza Logosu' },
  { key: 'showSubtitle', label: 'Slogan / Alt Başlık' },
  { key: 'showWhatsapp', label: 'İletişim Butonu' },
  { key: 'showAddress', label: 'Adres Bilgisi' }
] as const;

const BRANDING_OPTIONS = [
  { key: 'showCarousel', label: 'Ana Sayfa Afişleri' },
  { key: 'showReferences', label: 'Referans Logoları' },
  { key: 'showSearch', label: 'Arama Çubuğu' },
  { key: 'showCategories', label: 'Kategori Filtreleri' }
] as const;

const SYSTEM_OPTIONS = [
  { key: 'showPrice', label: 'Ürün Fiyatları' },
  { key: 'inline', label: 'Hızlı Düzenleme', description: 'Ürün isimlerine, fiyatlarına ve açıklamalarına tıklayarak anında değiştirebilirsiniz.' },
  { key: 'maintenance', label: 'Bakım Modu', description: 'Dükkanınızı geçici olarak ziyaretçilere kapatır.' }
] as const;

interface IdentityFieldItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  isSlug?: boolean;
  isInstagram?: boolean;
  isTextArea?: boolean;
  maxLength?: number;
}

const IDENTITY_FIELDS: IdentityFieldItem[] = [
  { key: 'title', label: 'İşletme adı', icon: <Lucide.Store size={20} /> },
  { key: 'slug', label: 'Dükkan Linki', icon: <Lucide.Link size={20} />, isSlug: true },
  { key: 'subtitle', label: 'Açıklama', icon: <Lucide.Menu size={20} />, maxLength: 35 },
  { key: 'address', label: 'Tam Adres (Yol Tarifi Modalında Gözükür)', icon: <Lucide.MapPin size={20} />, isTextArea: true },
  { key: 'shortAddress', label: 'Şehir / Semt (Navbarda Gözükür)', icon: <Lucide.Map size={20} /> },
  { key: 'whatsapp', label: 'WhatsApp Hattı', icon: <Lucide.MessageSquare size={20} /> },
  { key: 'phoneCall', label: 'Telefon Hattı (Arama)', icon: <Lucide.PhoneCall size={20} /> },
  { key: 'instagram', label: 'Instagram', icon: <InstagramIcon className="w-5 h-5 text-stone-400 group-focus-within:text-stone-900" />, isInstagram: true }
];

interface IdentityFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: React.ReactNode;
  icon: React.ReactNode;
  isTextArea?: boolean;
  rightElement?: React.ReactNode;
}

const IdentityField = ({ label, icon, isTextArea, rightElement, className = '', ...props }: IdentityFieldProps) => (
  <div className="flex items-start gap-4 group">
    <div className="mt-3.5 text-stone-400 group-focus-within:text-stone-900 transition-colors shrink-0 select-none">
      {icon}
    </div>
    <div className="flex-1 flex flex-col gap-1 relative">
      <label className="text-[10px] font-bold text-stone-400 absolute -top-2 left-3 bg-white px-1 z-10 select-none transition-colors group-focus-within:text-stone-900">
        {label}
      </label>
      {isTextArea ? (
        <textarea
          {...(props as any)}
          className="w-full px-3 py-2 border border-stone-200 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 rounded-xl bg-stone-50/10 text-[12px] font-black text-stone-900 outline-none transition-all shadow-inner resize-none min-h-[60px]"
        />
      ) : (
        <input
          {...(props as any)}
          className={`w-full h-11 px-3 border border-stone-200 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 rounded-xl bg-stone-50/10 text-[12px] font-black text-stone-900 outline-none transition-all shadow-inner ${className}`}
        />
      )}
      {rightElement}
    </div>
  </div>
);

const FloatingOptionRow = ({
  option,
  onToggle,
}: {
  option: {
    key: string;
    label: string;
    icon: React.ReactNode;
    isOn: boolean;
  };
  onToggle: () => void;
}) => (
  <div
    onClick={onToggle}
    className={`flex items-center justify-between p-1.5 rounded-xl border transition-all cursor-pointer group h-11 w-full ${
      option.isOn
        ? 'border-stone-900 bg-stone-900/5 hover:bg-stone-900/10'
        : 'border-stone-200 bg-stone-50/50 hover:border-stone-300'
    }`}
  >
    <div 
      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-300 pointer-events-none bg-[#5a5a5a] border-white/15 text-white ${
        option.isOn ? 'opacity-100 shadow-sm' : 'opacity-20'
      }`}
    >
      {option.icon}
    </div>

    <div className="shrink-0 pointer-events-auto ml-2">
      <StatusToggle
        value={option.isOn}
        onChange={onToggle}
        variant="compact"
        activeColor="!bg-emerald-500 !text-white border-none"
      />
    </div>
  </div>
);

interface SettingOption {
  key: string;
  label: string;
  isOn: boolean;
  onToggle: () => void;
}

const SettingCard = ({
  option,
  description,
}: {
  option: SettingOption;
  description?: string;
}) => (
  <div
    onClick={option.onToggle}
    className={`relative flex flex-col justify-center p-3 rounded-2xl border transition-all cursor-pointer group min-h-12 shadow-sm overflow-hidden ${
      option.isOn
        ? 'border-stone-900 bg-stone-900 text-white shadow-stone-200'
        : 'border-stone-100 bg-stone-50 text-stone-400 hover:border-stone-200'
    }`}
  >
    <div className="relative z-10 flex items-center justify-between w-full">
      <span className="text-[10px] font-black uppercase tracking-tight leading-none truncate">
        {option.label}
      </span>
      <div className="shrink-0 ml-2 pointer-events-auto">
        <StatusToggle
          value={option.isOn}
          onChange={option.onToggle}
          variant="compact"
          activeColor="!bg-emerald-500 !text-white border-none"
        />
      </div>
    </div>
    {description && (
      <p className={`text-[8px] font-semibold mt-1 leading-tight z-10 relative transition-colors ${
        option.isOn ? 'text-stone-300' : 'text-stone-400'
      }`}>
        {description}
      </p>
    )}
  </div>
);

export default function DisplaySettingsModal({
  isOpen,
  onClose,
  settings,
  updateSetting,
  isInlineEnabled,
  onToggleInline,
  isStatic = false,
}: DisplaySettingsModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const flow = useDisplaySettingsFlow(
    isOpen,
    settings,
    updateSetting,
    isInlineEnabled,
    onToggleInline,
  );

  const guestActions = FLOATING_OPTIONS
    .filter((opt) => flow.getOptionState(opt.key))
    .map((opt) => ({
      id: opt.id,
      icon: opt.icon,
      action: () => {},
      label: '',
      variant: opt.variant,
      closeOnClick: 'closeOnClick' in opt ? opt.closeOnClick : true,
    }));

  if (!settings) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-lg"
      isStatic={isStatic}
      noPadding={true}
      footer={
        <div className="flex gap-3 w-full">
          <Button
            onClick={onClose}
            variant="secondary"
            mode="rectangle"
            className={`w-16 h-16 !bg-stone-50 border-stone-100 shrink-0 ${THEME.shadows.sm}`}
          >
            <Lucide.ChevronLeft size={24} strokeWidth={4} />
          </Button>
          <Button
            onClick={onClose}
            variant="action"
            size="md"
            className="flex-1 h-16 !rounded-[24px]"
          >
            <Lucide.Check size={28} strokeWidth={4} />
          </Button>
        </div>
      }
    >
      <div className="p-4 flex flex-col gap-4 pb-2 max-h-[70vh] overflow-y-auto custom-scrollbar">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={flow.handleLogoUpload}
          disabled={flow.isUploading}
        />

        {/* IDENTITY HEADER (PHOTO) */}
        <div className="flex flex-col items-center py-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-xl border-4 border-stone-100 shadow-xl overflow-hidden bg-stone-50 flex items-center justify-center">
              {flow.isUploading ? (
                <Loading size="lg" variant="dark" />
              ) : settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  className="w-full h-full object-cover"
                  alt="Store Logo"
                />
              ) : (
                <Lucide.Store size={48} className="text-stone-300" />
              )}
            </div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="action"
              mode="rectangle"
              size="sm"
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 !rounded-full px-4 border-2 border-white shadow-lg"
              icon={<Lucide.Camera size={16} className="text-white" />}
            >
              <span className="text-[10px] font-bold text-white normal-case">Düzenle</span>
            </Button>
          </div>
        </div>

        {/* İŞLETME BİLGİLERİ */}
        <div className="flex flex-col gap-3">
          <div className="w-full flex justify-center gap-2 mt-4 mb-2">
            <h5 className="font-black text-stone-900 text-lg font-serif italic text-center">
              İşletme Bilgileri
            </h5>
          </div>
          <div className="flex flex-col gap-6 px-2">
            {IDENTITY_FIELDS.map((field) => {
              if (field.isSlug) {
                return (
                  <div key={field.key} className="flex items-start gap-4 group">
                    <div className="mt-3.5 text-stone-400 group-focus-within:text-stone-900 transition-colors shrink-0 select-none">
                      {field.icon}
                    </div>
                    <div className="flex-1 flex flex-col gap-1 relative">
                      <label className="text-[10px] font-bold text-stone-400 absolute -top-2 left-3 bg-white px-1 z-10 select-none transition-colors group-focus-within:text-stone-900">
                        www.<span className="text-emerald-500 font-extrabold">{flow.formState.slug || 'slug'}</span>.ekatalog.site
                      </label>
                      <input
                        type="text"
                        value={flow.formState.slug}
                        disabled={flow.checkingSlug}
                        onChange={(e) => {
                          const cleaned = e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '');
                          flow.handleFieldChange('slug', cleaned);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur();
                          }
                        }}
                        onBlur={() => flow.handleSlugCheck(flow.formState.slug)}
                        placeholder="dükkan-linki"
                        className="w-full h-11 px-3 border border-stone-200 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 rounded-xl bg-stone-50/10 text-[12px] font-extrabold text-emerald-500 outline-none transition-all shadow-inner disabled:opacity-50"
                      />
                      {flow.checkingSlug && (
                        <div className="absolute right-3 top-3.5 select-none flex items-center gap-1 text-stone-400">
                          <Lucide.Loader className="animate-spin text-stone-400" size={12} />
                          <span className="text-[8px] font-bold">kontrol ediliyor...</span>
                        </div>
                      )}
                      {flow.slugConfirm && (
                        <div className="mt-2 p-3 bg-stone-50 border border-stone-100 rounded-xl flex flex-col gap-2 relative overflow-hidden transition-all duration-300">
                          <div className="flex items-start gap-2">
                            <div className="p-1 bg-stone-100 rounded text-stone-600 shrink-0">
                              <Lucide.Globe size={14} />
                            </div>
                            <div className="flex-1">
                              <p className="text-[10px] font-black text-stone-900 leading-tight uppercase tracking-wider">
                                YENİ DÜKKAN ADRESİNİ ONAYLIYOR MUSUNUZ?
                              </p>
                              <p className="text-[9px] font-bold text-stone-400 mt-0.5 leading-normal">
                                Linkiniz <span className="text-emerald-500 font-extrabold">www.{flow.slugConfirm}.ekatalog.site</span> olarak güncellenecek ve yeni adrese yönlendirileceksiniz.
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-end gap-1.5 mt-1 border-t border-stone-200/40 pt-2 shrink-0">
                            <button
                              onClick={() => {
                                flow.setSlugConfirm(null);
                                flow.handleFieldChange('slug', settings.slug || '');
                              }}
                              className="h-7 px-3 rounded-lg text-[9px] font-bold text-stone-400 hover:text-stone-900 transition-colors bg-white hover:bg-stone-50 border border-stone-100 active:scale-95 duration-150"
                            >
                              İPTAL
                            </button>
                            <button
                              onClick={async () => {
                                if (!flow.slugConfirm) return;
                                try {
                                  await updateSetting('slug', flow.slugConfirm);
                                  useStore.getState().showFeedback('success', 'Dükkan adresi başarıyla güncellendi!');
                                  setTimeout(() => {
                                    window.location.replace('/' + flow.slugConfirm);
                                  }, 1200);
                                } catch (err: any) {
                                  console.error(err);
                                  useStore.getState().showFeedback('error', 'Güncelleme sırasında bir hata oluştu');
                                  flow.setSlugConfirm(null);
                                  flow.handleFieldChange('slug', settings.slug || '');
                                }
                              }}
                              className="h-7 px-3 rounded-lg text-[9px] font-black text-white hover:bg-emerald-600 bg-emerald-500 transition-all active:scale-95 duration-150 shadow-sm"
                            >
                              TAMAM
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <IdentityField
                  key={field.key}
                  label={field.label}
                  icon={field.icon}
                  isTextArea={'isTextArea' in field ? field.isTextArea : undefined}
                  maxLength={'maxLength' in field ? field.maxLength : undefined}
                  value={flow.formState[field.key as keyof typeof flow.formState]}
                  onChange={(e) => {
                    let val = e.target.value;
                    if ('isInstagram' in field && field.isInstagram) {
                      val = val.trim().replace(/^@/, '');
                    }
                    flow.handleFieldChange(field.key, val);
                  }}
                  onBlur={() => flow.handleFieldBlur(field.key)}
                  rightElement={
                    'maxLength' in field && field.maxLength ? (
                      <div className="text-[8px] text-stone-400 font-bold select-none absolute right-3 bottom-3 opacity-60">
                        {flow.formState[field.key as keyof typeof flow.formState].length}/{field.maxLength}
                      </div>
                    ) : undefined
                  }
                />
              );
            })}
          </div>
        </div>

        {/* TABELA */}
        <div className="flex flex-col gap-3">
          <div className="w-full flex justify-center gap-2 mt-4 mb-1">
            <h5 className="text-[10px] uppercase tracking-[0.2em] font-black text-stone-900 text-center">
              TABELA (NAVBAR BİLEŞENLERİ)
            </h5>
          </div>

          {/* Live Tabela Preview */}
          <div className="select-none pointer-events-none w-full my-1">
            <div className="w-full overflow-hidden rounded-xl border border-stone-200/60 shadow-sm bg-white/5">
              <Navbar isInlineEnabled={false} isPreview={true} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {TABELA_OPTIONS.map((opt) => (
              <SettingCard
                key={opt.key}
                option={{
                  key: opt.key,
                  label: opt.label,
                  isOn: opt.key === 'announcement' ? flow.localAnnouncement : flow.getOptionState(opt.key),
                  onToggle: opt.key === 'announcement' ? flow.toggleAnnouncement : () => flow.toggleOption(opt.key),
                }}
              />
            ))}
          </div>
        </div>

        {/* VİTRİN VE TASARIM */}
        <div className="flex flex-col gap-3">
          <div className="w-full flex justify-center gap-2 mt-4">
            <h5 className="text-[10px] uppercase tracking-[0.2em] font-black text-stone-900 text-center">
              VİTRİN VE TASARIM
            </h5>
          </div>

          <div className="flex flex-col gap-4 bg-stone-50/30 border border-stone-100 rounded-3xl p-4 my-1">
            {/* Live Vitrin Preview */}
            <div className="w-full flex flex-col gap-2 relative overflow-hidden select-none pointer-events-none">
              <AnimatePresence initial={false} mode="popLayout">
                {flow.getOptionState('showCarousel') && (
                  <motion.div
                    key="preview-carousel"
                    initial={{ height: 0, opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ height: 'auto', opacity: 1, scale: 1, y: 0 }}
                    exit={{ height: 0, opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                    className="w-full overflow-hidden shrink-0 origin-top"
                  >
                    <HeroCarousel isAdminModeActive={false} isStatic={true} />
                  </motion.div>
                )}

                {flow.getOptionState('showReferences') && (
                  <motion.div
                    key="preview-references"
                    initial={{ height: 0, opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ height: 'auto', opacity: 1, scale: 1, y: 0 }}
                    exit={{ height: 0, opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                    className="w-full overflow-hidden shrink-0 origin-top"
                  >
                    <References isInlineEnabled={false} isAdmin={false} isPaused={true} />
                  </motion.div>
                )}

                {(flow.getOptionState('showSearch') || flow.getOptionState('showCategories')) && (
                  <motion.div
                    key="preview-search-filter"
                    initial={{ height: 0, opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ height: 'auto', opacity: 1, scale: 1, y: 0 }}
                    exit={{ height: 0, opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                    className="w-full flex flex-row items-center gap-2 shrink-0 origin-top py-0.5"
                  >
                    {flow.getOptionState('showSearch') && (
                      <div className="relative flex-1 h-11 flex items-center border-2 border-stone-200 bg-white rounded-md overflow-hidden select-none">
                        <Lucide.Search className="absolute left-3 w-4 h-4 text-stone-400" strokeWidth={2} />
                        <input
                          type="text"
                          disabled
                          placeholder="Ürün ara..."
                          className="w-full h-full pl-9 pr-8 border-none bg-transparent text-xs font-bold text-stone-900 placeholder:text-stone-400 select-none outline-none"
                        />
                      </div>
                    )}

                    {flow.getOptionState('showCategories') && (
                      <div className={`h-11 flex-none flex items-center justify-center rounded-lg bg-stone-900/60 backdrop-blur-md border border-white/20 text-white shadow-xl select-none transition-all ${
                        !flow.getOptionState('showSearch') ? 'w-full gap-2 px-4' : 'w-11'
                      }`}>
                        {!flow.getOptionState('showSearch') && (
                          <span className="text-[11px] font-black uppercase tracking-widest">KATEGORİLER</span>
                        )}
                        <Lucide.ChevronDown size={20} strokeWidth={2.2} />
                      </div>
                    )}
                  </motion.div>
                )}

                {!flow.getOptionState('showCarousel') &&
                  !flow.getOptionState('showReferences') &&
                  !flow.getOptionState('showSearch') &&
                  !flow.getOptionState('showCategories') && (
                    <motion.div
                      key="preview-empty"
                      initial={{ height: 0, opacity: 0, scale: 0.95 }}
                      animate={{ height: 'auto', opacity: 1, scale: 1 }}
                      exit={{ height: 0, opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                      className="w-full py-4 flex flex-col items-center justify-center select-none text-[10px] font-black tracking-wider text-stone-400 uppercase origin-center"
                    >
                      Vitrin Bileşenleri Kapalı
                    </motion.div>
                  )}
              </AnimatePresence>
            </div>

            {/* Toggles Area (Grid with 2 columns) */}
            <div className="grid grid-cols-2 gap-2">
              {BRANDING_OPTIONS.map((opt) => (
                <SettingCard
                  key={opt.key}
                  option={{
                    key: opt.key,
                    label: opt.label,
                    isOn: flow.getOptionState(opt.key),
                    onToggle: () => flow.toggleOption(opt.key),
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* YÜZEN MENÜ BİLEŞENLERİ */}
        <div className="flex flex-col gap-3">
          <div className="w-full flex justify-center gap-2 mt-4">
            <h5 className="text-[10px] uppercase tracking-[0.2em] font-black text-stone-900 text-center">
              YÜZEN MENÜ BİLEŞENLERİ
            </h5>
          </div>

          <div className="grid grid-cols-1 my-2 px-2 gap-4">
            {/* Live Preview Container (Centered & Compact) */}
            <div className="flex justify-center py-2 select-none pointer-events-none bg-stone-50 border border-stone-100 rounded-2xl">
              <BaseFloatingMenu actions={guestActions} forceExpanded={true} isPreview={true} />
            </div>

            {/* Grid of Switches (2 columns for compact look) */}
            <div className="grid grid-cols-2 gap-2">
              {FLOATING_OPTIONS.map((opt) => (
                <FloatingOptionRow
                  key={opt.key}
                  option={{
                    key: opt.key,
                    label: opt.label,
                    icon: opt.icon,
                    isOn: flow.getOptionState(opt.key),
                  }}
                  onToggle={() => flow.toggleOption(opt.key)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* SİSTEM YÖNETİMİ */}
        <div className="flex flex-col gap-3">
          <div className="w-full flex justify-center gap-2 mt-4 mb-2">
            <h5 className="text-[10px] uppercase tracking-[0.2em] font-black text-stone-900 text-center">
              SİSTEM YÖNETİMİ
            </h5>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {SYSTEM_OPTIONS.map((opt) => (
              <SettingCard
                key={opt.key}
                option={{
                  key: opt.key,
                  label: opt.label,
                  isOn: opt.key === 'inline' ? flow.localInline : opt.key === 'maintenance' ? flow.localMaintenance : flow.getOptionState(opt.key),
                  onToggle: opt.key === 'inline' ? flow.handleToggleInline : opt.key === 'maintenance' ? flow.toggleMaintenance : () => flow.toggleOption(opt.key),
                }}
                description={'description' in opt ? opt.description : undefined}
              />
            ))}
          </div>
        </div>

        {/* GÜVENLİK */}
        <div className="flex flex-col gap-3">
          <div className="w-full flex justify-center gap-2 mt-4 mb-2">
            <h5 className="text-[10px] uppercase tracking-[0.2em] font-black text-stone-900 text-center">
              GÜVENLİK
            </h5>
          </div>
          <div className="px-2">
            <div
              onClick={() => useStore.getState().openModal('CHANGE_PIN')}
              className="flex items-center justify-between p-4 border border-stone-200 hover:border-stone-950 rounded-2xl bg-stone-50/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="text-stone-400 group-hover:text-stone-900 transition-colors shrink-0">
                  <Lucide.Lock size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-stone-900 leading-tight">Yönetici Şifresini Değiştir</span>
                  <span className="text-[10px] font-medium text-stone-400">4 Haneli admin panel şifresi</span>
                </div>
              </div>
              <Lucide.ChevronRight size={18} className="text-stone-400 group-hover:text-stone-900 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
