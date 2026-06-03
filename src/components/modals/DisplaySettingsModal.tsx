import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '../layout/Navbar';
import Button from '../ui/Button';
import BaseModal from './BaseModal';
import StatusToggle from '../ui/StatusToggle';
import Loading from '../ui/Loading';
import { DisplaySettingsModalProps } from '../../types';
import { THEME } from '../../data/config';
import * as Lucide from 'lucide-react';
import { useDisplaySettingsFlow } from '../../hooks/useDisplaySettingsFlow';
import { useStore } from '../../store';
import { supabase } from '../../supabase';
import HeroCarousel from '../layout/HeroCarousel';
import References from '../layout/References';
import BaseFloatingMenu from '../layout/BaseFloatingMenu';

// Custom clean icons
const WhatsappIcon = ({ className = "w-5 h-5 fill-current" }: { className?: string }) => (
  <div className="w-5 h-5 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 24 24" className={`fill-current ${className}`}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.431 5.633 1.432h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  </div>
);

const InstagramIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <div className="w-5 h-5 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 24 24" className={`fill-current ${className}`}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  </div>
);

// Reusable Static Configuration Arrays to achieve ultimate DRY compliance
const FLOATING_OPTIONS = [
  { 
    key: 'showCoupons', 
    id: 'coupon',
    label: 'İndirim Kuponu', 
    icon: <Lucide.Ticket size={16} />, 
    menuIcon: <Lucide.Ticket className="w-5 h-5" strokeWidth={2.5} />,
    variant: 'secondary' as const 
  },
  { 
    key: 'showAddress', 
    id: 'location',
    label: 'Adres Bilgisi', 
    icon: <Lucide.MapPin size={16} />, 
    menuIcon: <Lucide.MapPin className="w-5 h-5" strokeWidth={2.5} />,
    variant: 'secondary' as const 
  },
  { 
    key: 'showCurrency', 
    id: 'currency',
    label: 'Döviz Çevirici', 
    icon: <span className="font-extrabold text-[13px] leading-none">₺</span>, 
    menuIcon: (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-[20px] font-medium leading-none text-white select-none">₺</span>
      </div>
    ),
    variant: 'secondary' as const,
    closeOnClick: false
  },
  { 
    key: 'showInstagram', 
    id: 'instagram',
    label: 'Instagram', 
    icon: <InstagramIcon />, 
    menuIcon: <InstagramIcon className="w-5 h-5 text-white" />,
    variant: 'secondary' as const 
  },
  { 
    key: 'showQR', 
    id: 'qr',
    label: 'QR Kod Paylaşımı', 
    icon: <Lucide.QrCode size={16} />, 
    menuIcon: <Lucide.QrCode className="w-5 h-5" strokeWidth={2.5} />,
    variant: 'secondary' as const 
  },
  { 
    key: 'showWhatsapp', 
    id: 'whatsapp',
    label: 'WhatsApp', 
    icon: <WhatsappIcon />, 
    menuIcon: <WhatsappIcon className="w-5 h-5 text-white" />,
    variant: 'secondary' as const 
  },
  { 
    key: 'showSearch', 
    id: 'search',
    label: 'Arama Çubuğu', 
    icon: <Lucide.Search size={16} />, 
    menuIcon: <Lucide.Search className="w-5 h-5" strokeWidth={2.5} />,
    variant: 'secondary' as const 
  },
  { 
    key: 'showPhone', 
    id: 'call',
    label: 'Telefon Arama', 
    icon: <Lucide.Phone size={16} />, 
    menuIcon: <Lucide.Phone className="w-5 h-5" strokeWidth={2.5} />,
    variant: 'secondary' as const 
  }
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
  { key: 'inline', label: 'Hızlı Düzenleme', hasHelp: true },
  { key: 'maintenance', label: 'Bakım Modu', hasHelp: true }
] as const;

const HELP_CONTENTS = {
  inline: {
    title: 'Hızlı Düzenleme Nedir?',
    onText: 'Dükkanınızdaki ürünlerin isimlerine, fiyatlarına veya açıklamalarına doğrudan tıklayarak anında değiştirebilirsiniz.',
    offText: 'Ürünlerin üzerine tıklandığında sadece ürün detayı açılır.'
  },
  maintenance: {
    title: 'Bakım Modu Nedir?',
    onText: 'Dükkanınız geçici olarak ziyaretçilere kapatılır.',
    offText: 'Dükkanınız herkese açıktır.'
  }
} as const;

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
  { key: 'whatsapp', label: 'WhatsApp Hattı', icon: <WhatsappIcon /> },
  { key: 'phoneCall', label: 'Telefon Hattı (Arama)', icon: <Lucide.PhoneCall size={20} /> },
  { key: 'instagram', label: 'Instagram', icon: <InstagramIcon />, isInstagram: true }
];

// Reusable static field layout component to dramatically reduce boilerplate code
interface IdentityFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: React.ReactNode;
  icon: React.ReactNode;
  isTextArea?: boolean;
  rightElement?: React.ReactNode;
}

const IdentityField = ({ label, icon, isTextArea, rightElement, className = '', ...props }: IdentityFieldProps) => {
  return (
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
};




const FloatingOptionRow = ({
  option,
  onToggle,
}: {
  option: {
    key: string;
    label: string;
    icon: React.ReactNode;
    variant: any;
    isOn: boolean;
  };
  onToggle: () => void;
}) => {
  return (
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
          option.isOn 
            ? 'opacity-100 shadow-sm' 
            : 'opacity-20'
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
};

interface SettingOption {
  key: string;
  label: string;
  isOn: boolean;
  onToggle: () => void;
  hasHelp?: boolean;
}

const SettingCard = ({
  option,
  onHelpTrigger,
  isHiddenHelp,
}: {
  option: SettingOption;
  onHelpTrigger: (id: string) => void;
  isHiddenHelp: boolean;
}) => {
  return (
    <div
      onClick={option.onToggle}
      className={`relative flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer group h-12 shadow-sm overflow-hidden ${
        option.isOn
          ? 'border-stone-900 bg-stone-900 text-white shadow-stone-200'
          : 'border-stone-100 bg-stone-50 text-stone-400 hover:border-stone-200'
      }`}
    >
      <div
        className={`absolute -right-4 -bottom-4 opacity-[0.08] pointer-events-none transition-transform duration-500 group-hover:scale-110 ${option.isOn ? 'text-white' : 'text-stone-900'}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="80"
          height="80"
          fill="currentColor"
          viewBox="0 0 16 16"
          style={{ transform: 'scaleX(-1) rotate(15deg)' }}
        >
          <path d="M8.06 6.5a.5.5 0 0 1 .5.5v.776a11.5 11.5 0 0 1-.552 3.519l-1.331 4.14a.5.5 0 0 1-.952-.305l1.33-4.141a10.5 10.5 0 0 0 .504-3.213V7a.5.5 0 0 1 .5-.5Z" />
          <path d="M6.06 7a2 2 0 1 1 4 0 .5.5 0 1 1-1 0 1 1 0 1 0-2 0v.332q0 .613-.066 1.221A.5.5 0 0 1 6 8.447q.06-.555.06-1.115zm3.509 1a.5.5 0 0 1 .487.513 11.5 11.5 0 0 1-.587 3.339l-1.266 3.8a.5.5 0 0 1-.949-.317l1.267-3.8a10.5 10.5 0 0 0 .535-3.048A.5.5 0 0 1 9.569 8m-3.356 2.115a.5.5 0 0 1 .33.626L5.24 14.939a.5.5 0 1 1-.955-.296l1.303-4.199a.5.5 0 0 1 .625-.329" />
        </svg>
      </div>

      <div className="relative z-10 flex items-center gap-1.5 overflow-hidden flex-1">
        {option.hasHelp && !isHiddenHelp && (
          <Button
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onHelpTrigger(option.key);
            }}
            variant="ghost"
            mode="circle"
            size="sm"
            className={`!shrink-0 !p-0 !w-6 !h-6 shadow-none border-none transition-all ${option.isOn ? '!text-emerald-400' : '!text-stone-300 hover:!text-stone-950'}`}
            icon={<Lucide.HelpCircle size={14} />}
          />
        )}
        <span className="text-[10px] font-black uppercase tracking-tight leading-none truncate">
          {option.label}
        </span>
      </div>

      <div className="relative z-10 shrink-0 ml-2 pointer-events-auto">
        <StatusToggle
          value={option.isOn}
          onChange={option.onToggle}
          variant="compact"
          activeColor="!bg-emerald-500 !text-white border-none"
        />
      </div>
    </div>
  );
};

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

  const [menuLayout, setMenuLayout] = useState({ scale: 1.5, width: 165 });
  const menuRef = useRef<HTMLDivElement>(null);
  const togglesRef = useRef<HTMLDivElement>(null);

  const guestActions = FLOATING_OPTIONS
    .filter((opt) => flow.getOptionState(opt.key))
    .map((opt) => ({
      id: opt.id,
      icon: opt.menuIcon,
      action: () => {},
      label: '',
      variant: opt.variant,
      closeOnClick: 'closeOnClick' in opt ? opt.closeOnClick : true,
    }));

  useEffect(() => {
    if (!isOpen) return;

    const updateLayout = () => {
      if (!togglesRef.current || !menuRef.current) return;
      const togglesHeight = togglesRef.current.offsetHeight;
      const menuNaturalHeight = menuRef.current.offsetHeight;
      if (menuNaturalHeight > 50 && togglesHeight > 50) {
        const calculatedScale = (togglesHeight / menuNaturalHeight) * 1.03;
        const safeScale = Math.min(2.0, Math.max(0.8, calculatedScale));
        setMenuLayout({
          scale: safeScale,
          width: 110 * safeScale
        });
      }
    };

    updateLayout();
    const timer = setTimeout(updateLayout, 350);
    window.addEventListener('resize', updateLayout);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateLayout);
    };
  }, [isOpen, guestActions.length]);

  // Single formState object to dramatically shrink lines and hooks count
  const [formState, setFormState] = useState({
    title: '',
    slug: '',
    subtitle: '',
    address: '',
    shortAddress: '',
    whatsapp: '',
    phoneCall: '',
    instagram: '',
  });

  const [slugConfirm, setSlugConfirm] = useState<string | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormState({
        title: settings.title || '',
        slug: settings.slug || '',
        subtitle: settings.subtitle || '',
        address: settings.address || '',
        shortAddress: settings.shortAddress || '',
        whatsapp: settings.whatsapp || '',
        phoneCall: settings.phoneCall || '',
        instagram: settings.instagram?.split('/').pop()?.replace(/\//g, '') || '',
      });
      setSlugConfirm(null);
    }
  }, [isOpen, settings]);

  const handleFieldChange = (key: string, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleFieldBlur = (key: string) => {
    const value = formState[key as keyof typeof formState].trim();
    if (key === 'title' && !value) return;

    if (key === 'subtitle') {
      const sliced = value.slice(0, 35);
      if (sliced !== settings.subtitle) {
        updateSetting('subtitle', sliced);
      }
    } else if (key === 'instagram') {
      const fullUrl = value ? `https://www.instagram.com/${value}` : '';
      if (fullUrl !== settings.instagram) {
        updateSetting('instagram', fullUrl);
      }
    } else if (key !== 'slug') {
      if (value !== settings[key as keyof typeof settings]) {
        updateSetting(key as any, value);
      }
    }
  };

  const handleSlugCheck = async (newSlug: string) => {
    const cleaned = newSlug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (!cleaned) {
      handleFieldChange('slug', settings.slug || '');
      setSlugConfirm(null);
      return;
    }
    if (cleaned === settings.slug) {
      setSlugConfirm(null);
      return;
    }

    setCheckingSlug(true);

    try {
      const { data, error } = await supabase
        .from('stores')
        .select('id')
        .eq('slug', cleaned)
        .maybeSingle();

      if (error) throw error;

      if (data && data.id !== settings.id) {
        useStore.getState().showFeedback('error', 'Bu dükkan adresi zaten başka bir işletme tarafından kullanılıyor!');
        handleFieldChange('slug', settings.slug || '');
        setSlugConfirm(null);
      } else {
        setSlugConfirm(cleaned);
      }
    } catch (err) {
      console.error(err);
      useStore.getState().showFeedback('error', 'Bağlantı adresi kontrol edilirken hata oluştu.');
    } finally {
      setCheckingSlug(false);
    }
  };

  if (!settings) return null;

  return (
    <>
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
                          www.<span className="text-emerald-500 font-extrabold">{formState.slug || 'slug'}</span>.ekatalog.site
                        </label>
                        <input
                          type="text"
                          value={formState.slug}
                          disabled={checkingSlug}
                          onChange={(e) => {
                            const cleaned = e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '');
                            handleFieldChange('slug', cleaned);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                          }}
                          onBlur={() => handleSlugCheck(formState.slug)}
                          placeholder="dükkan-linki"
                          className="w-full h-11 px-3 border border-stone-200 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 rounded-xl bg-stone-50/10 text-[12px] font-extrabold text-emerald-500 outline-none transition-all shadow-inner disabled:opacity-50"
                        />
                        {checkingSlug && (
                          <div className="absolute right-3 top-3.5 select-none flex items-center gap-1 text-stone-400">
                            <Lucide.Loader className="animate-spin text-stone-400" size={12} />
                            <span className="text-[8px] font-bold">kontrol ediliyor...</span>
                          </div>
                        )}
                        {slugConfirm && (
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
                                  Linkiniz <span className="text-emerald-500 font-extrabold">www.{slugConfirm}.ekatalog.site</span> olarak güncellenecek ve yeni adrese yönlendirileceksiniz.
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-end gap-1.5 mt-1 border-t border-stone-200/40 pt-2 shrink-0">
                              <button
                                onClick={() => {
                                  setSlugConfirm(null);
                                  handleFieldChange('slug', settings.slug || '');
                                }}
                                className="h-7 px-3 rounded-lg text-[9px] font-bold text-stone-400 hover:text-stone-900 transition-colors bg-white hover:bg-stone-50 border border-stone-100 active:scale-95 duration-150"
                              >
                                İPTAL
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    await updateSetting('slug', slugConfirm);
                                    useStore.getState().showFeedback('success', 'Dükkan adresi başarıyla güncellendi!');
                                    setTimeout(() => {
                                      window.location.replace('/' + slugConfirm);
                                    }, 1200);
                                  } catch (err: any) {
                                    console.error(err);
                                    useStore.getState().showFeedback('error', 'Güncelleme sırasında bir hata oluştu');
                                    setSlugConfirm(null);
                                    handleFieldChange('slug', settings.slug || '');
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
                    value={formState[field.key as keyof typeof formState]}
                    onChange={(e) => {
                      let val = e.target.value;
                      if ('isInstagram' in field && field.isInstagram) {
                        val = val.trim().replace(/^@/, '');
                      }
                      handleFieldChange(field.key, val);
                    }}
                    onBlur={() => handleFieldBlur(field.key)}
                    rightElement={
                      'maxLength' in field && field.maxLength ? (
                        <div className="text-[8px] text-stone-400 font-bold select-none absolute right-3 bottom-3 opacity-60">
                          {formState[field.key as keyof typeof formState].length}/{field.maxLength}
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
                <Navbar isInlineEnabled={false} />
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
                  onHelpTrigger={flow.setHelpId}
                  isHiddenHelp={flow.hiddenHelpIds.includes(opt.key)}
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
                    onHelpTrigger={flow.setHelpId}
                    isHiddenHelp={flow.hiddenHelpIds.includes(opt.key)}
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

            <div 
              style={{ gridTemplateColumns: `${menuLayout.width}px 1fr` }}
              className="grid gap-6 my-2 px-2 items-start"
            >
              {/* Sol Taraf: Live Preview */}
              <div 
                ref={menuRef}
                style={{ transform: `scale(${menuLayout.scale})` }} 
                className="origin-top-left shrink-0 select-none transition-transform duration-300 pointer-events-none"
              >
                <BaseFloatingMenu actions={guestActions} forceExpanded={true} isPreview={true} />
              </div>

              {/* Sağ Taraf: Active Option Row Switches (Toggles in 1 column) */}
              <div ref={togglesRef} className="flex flex-col gap-1.5 w-full">
                {FLOATING_OPTIONS.map((opt) => (
                  <FloatingOptionRow
                    key={opt.key}
                    option={{
                      key: opt.key,
                      label: opt.label,
                      icon: opt.icon,
                      variant: opt.variant,
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
                    hasHelp: 'hasHelp' in opt ? opt.hasHelp : undefined,
                  }}
                  onHelpTrigger={flow.setHelpId}
                  isHiddenHelp={flow.hiddenHelpIds.includes(opt.key)}
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

      <BaseModal
        isOpen={!!flow.helpId}
        onClose={() => flow.setHelpId(null)}
        maxWidth="max-w-sm"
        isStatic={isStatic}
        footer={
          <div className="flex flex-col gap-2 w-full">
            <Button
              onClick={() => flow.setHelpId(null)}
              variant="primary"
              size="md"
              className="w-full !py-4 font-black"
              mode="rectangle"
            >
              KAPAT
            </Button>
            <Button
              onClick={() =>
                flow.helpId && flow.hideHelpPermanently(flow.helpId)
              }
              variant="ghost"
              size="sm"
              className="w-full !text-stone-400 !text-[9px] font-black hover:!text-stone-900 underline px-6 text-center leading-tight shadow-none"
              mode="rectangle"
            >
              Bu ipucunu tekrar gösterme
            </Button>
          </div>
        }
      >
        {flow.helpId && (
          <div className="space-y-4 py-2">
            <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-3xl flex gap-4">
              <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm">
                <Lucide.Check size={18} />
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed font-bold">
                {HELP_CONTENTS[flow.helpId as keyof typeof HELP_CONTENTS].onText}
              </p>
            </div>
            <div className="bg-stone-50 border border-stone-100 p-5 rounded-3xl opacity-60 text-stone-500 flex items-center gap-4">
              <div className="w-8 h-8 bg-stone-200 rounded-xl flex items-center justify-center shrink-0 text-stone-400">
                <Lucide.X size={18} strokeWidth={3} />
              </div>
              <p className="text-[11px] leading-relaxed font-bold">
                {HELP_CONTENTS[flow.helpId as keyof typeof HELP_CONTENTS].offText}
              </p>
            </div>
          </div>
        )}
      </BaseModal>
    </>
  );
}
