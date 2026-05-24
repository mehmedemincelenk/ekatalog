import { useRef } from 'react';
import Button from '../ui/Button';
import BaseModal from './BaseModal';
import StatusToggle from '../ui/StatusToggle';
import Loading from '../ui/Loading';
import { DisplaySettingsModalProps } from '../../types';
import { THEME } from '../../data/config';
import { QuickEditModal } from './UtilityModals';
import * as Lucide from 'lucide-react';
import { useDisplaySettingsFlow } from '../../hooks/useDisplaySettingsFlow';

interface HelpInfo {
  title: string;
  onText: string;
  offText: string;
}

interface SettingOption {
  key: string;
  label: string;
  isOn: boolean;
  onToggle: () => void;
  hasHelp?: boolean;
}

const HELP_CONTENTS: Record<string, HelpInfo> = {
  inline: {
    title: 'Hızlı Düzenleme Nedir?',
    onText:
      'Dükkanınızdaki ürünlerin isimlerine, fiyatlarına veya açıklamalarına doğrudan tıklayarak anında değiştirebilirsiniz.',
    offText: 'Ürünlerin üzerine tıklandığında sadece ürün detayı açılır.',
  },
  maintenance: {
    title: 'Bakım Modu Nedir?',
    onText: 'Dükkanınız geçici olarak ziyaretçilere kapatılır.',
    offText: 'Dükkanınız herkese açıktır.',
  },
};

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

  if (!settings) return null;

  const groups = [
    {
      id: 'identity',
      title: 'İşletme Bilgileri',
      isIdentity: true,
      options: [
        {
          key: 'title',
          label: 'İşletme adı',
          value: settings.title,
          icon: <Lucide.Store size={20} />,
        },
        {
          key: 'subtitle',
          label: 'Açıklama',
          value: settings.subtitle,
          icon: <Lucide.Menu size={20} />,
        },
        {
          key: 'address',
          label: 'Adres',
          value: settings.address,
          icon: <Lucide.MapPin size={20} />,
        },
        {
          key: 'whatsapp',
          label: 'WhatsApp Hattı',
          value: settings.whatsapp,
          icon: <Lucide.Phone size={20} />,
        },
        {
          key: 'instagram',
          label: 'Instagram',
          value: settings.instagram?.split('/').pop() || '',
          icon: <Lucide.Instagram size={20} />,
        },
      ],
    },
    {
      id: 'floating',
      title: 'YÜZEN MENÜ BİLEŞENLERİ',
      options: [
        {
          key: 'showWhatsapp',
          label: 'WhatsApp',
          isOn: flow.getOptionState('showWhatsapp'),
          onToggle: () => flow.toggleOption('showWhatsapp'),
        },
        {
          key: 'showInstagram',
          label: 'Instagram',
          isOn: flow.getOptionState('showInstagram'),
          onToggle: () => flow.toggleOption('showInstagram'),
        },
        {
          key: 'showAddress',
          label: 'Adres Bilgisi',
          isOn: flow.getOptionState('showAddress'),
          onToggle: () => flow.toggleOption('showAddress'),
        },
        {
          key: 'showCurrency',
          label: 'Döviz Çevirici',
          isOn: flow.getOptionState('showCurrency'),
          onToggle: () => flow.toggleOption('showCurrency'),
        },
        {
          key: 'showPriceList',
          label: 'Fiyat Listesi',
          isOn: flow.getOptionState('showPriceList'),
          onToggle: () => flow.toggleOption('showPriceList'),
        },
        {
          key: 'showCoupons',
          label: 'İndirim Kuponu',
          isOn: flow.getOptionState('showCoupons'),
          onToggle: () => flow.toggleOption('showCoupons'),
        },
      ],
    },
    {
      id: 'branding',
      title: 'VİTRİN VE TASARIM',
      options: [
        {
          key: 'showLogo',
          label: 'Mağaza Logosu',
          isOn: flow.getOptionState('showLogo'),
          onToggle: () => flow.toggleOption('showLogo'),
        },
        {
          key: 'showSubtitle',
          label: 'Slogan / Alt Başlık',
          isOn: flow.getOptionState('showSubtitle'),
          onToggle: () => flow.toggleOption('showSubtitle'),
        },
        {
          key: 'showCarousel',
          label: 'Ana Sayfa Afişleri',
          isOn: flow.getOptionState('showCarousel'),
          onToggle: () => flow.toggleOption('showCarousel'),
        },
        {
          key: 'showReferences',
          label: 'Referans Logoları',
          isOn: flow.getOptionState('showReferences'),
          onToggle: () => flow.toggleOption('showReferences'),
        },
        {
          key: 'showPrice',
          label: 'Ürün Fiyatları',
          isOn: flow.getOptionState('showPrice'),
          onToggle: () => flow.toggleOption('showPrice'),
        },
        {
          key: 'announcement',
          label: 'Duyuru Panosu',
          isOn: flow.localAnnouncement,
          onToggle: flow.toggleAnnouncement,
        },
      ],
    },
    {
      id: 'system',
      title: 'SİSTEM YÖNETİMİ',
      options: [
        {
          key: 'showSearch',
          label: 'Arama Çubuğu',
          isOn: flow.getOptionState('showSearch'),
          onToggle: () => flow.toggleOption('showSearch'),
        },
        {
          key: 'showCategories',
          label: 'Kategori Filtreleri',
          isOn: flow.getOptionState('showCategories'),
          onToggle: () => flow.toggleOption('showCategories'),
        },
        {
          key: 'inline',
          label: 'Hızlı Düzenleme',
          isOn: flow.localInline,
          onToggle: flow.handleToggleInline,
          hasHelp: true,
        },
        {
          key: 'maintenance',
          label: 'Bakım Modu',
          isOn: flow.localMaintenance,
          onToggle: flow.toggleMaintenance,
          hasHelp: true,
        },
      ],
    },
  ];

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
              <div className="w-32 h-32 rounded-full border-4 border-stone-100 shadow-xl overflow-hidden bg-stone-50 flex items-center justify-center">
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
                variant="primary"
                mode="rectangle"
                size="sm"
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 !rounded-full px-4 border-2 border-white shadow-lg !bg-[#16a34a] hover:!bg-[#15803d]"
                icon={<Lucide.Camera size={16} className="text-white" />}
              >
                <span className="text-[10px] font-bold text-white normal-case">Düzenle</span>
              </Button>
            </div>
          </div>

          {groups.map((group) => (
            <div key={group.id} className="flex flex-col gap-3">
              <div className="px-1 flex items-baseline gap-2 mt-4 mb-2 pl-2">
                <h5 className={`font-black text-stone-900 ${group.isIdentity ? 'text-lg font-serif italic' : 'text-[10px] uppercase tracking-[0.2em]'}`}>
                  {group.title}
                </h5>
              </div>
              <div className={group.isIdentity ? 'flex flex-col gap-6 px-2' : 'grid grid-cols-2 gap-2'}>
                {group.options.map((option: any) =>
                  group.isIdentity ? (
                    <div
                      key={option.key}
                      onClick={() =>
                        flow.handleIdentityClick(option, fileInputRef)
                      }
                      className="flex items-start gap-4 group cursor-pointer"
                    >
                      <div className="mt-5 text-stone-400 group-hover:text-stone-900 transition-colors shrink-0">
                        {option.icon}
                      </div>
                      <div className="flex-1 flex flex-col gap-1 relative">
                        <label className="text-[10px] font-bold text-stone-400 absolute -top-2 left-3 bg-white px-1 z-10">
                          {option.label}
                        </label>
                        <div className="w-full min-h-[44px] px-3 py-3 border border-stone-200 rounded-xl bg-stone-50/30 group-hover:border-stone-900 transition-all text-[12px] font-medium text-stone-900 flex items-center">
                          {option.value || <span className="text-stone-300 italic">Belirtilmemiş...</span>}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <SettingCard
                      key={option.key}
                      option={option as any}
                      onHelpTrigger={flow.setHelpId}
                      isHiddenHelp={flow.hiddenHelpIds.includes(option.key)}
                    />
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </BaseModal>

      {/* IDENTITY QUICK EDIT */}
      <div className="z-[100000]">
        {flow.quickEdit && (
          <QuickEditModal
            isOpen={!!flow.quickEdit}
            onClose={() => flow.setQuickEdit(null)}
            onSave={flow.handleQuickSave}
            initialValue={flow.quickEdit.value || ''}
            placeholder={`${flow.quickEdit.title} girin...`}
          />
        )}
      </div>

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
                {HELP_CONTENTS[flow.helpId].onText}
              </p>
            </div>
            <div className="bg-stone-50 border border-stone-100 p-5 rounded-3xl opacity-60 text-stone-500 flex items-center gap-4">
              <div className="w-8 h-8 bg-stone-200 rounded-xl flex items-center justify-center shrink-0 text-stone-400">
                <Lucide.X size={18} strokeWidth={3} />
              </div>
              <p className="text-[11px] leading-relaxed font-bold">
                {HELP_CONTENTS[flow.helpId].offText}
              </p>
            </div>
          </div>
        )}
      </BaseModal>
    </>
  );
}
