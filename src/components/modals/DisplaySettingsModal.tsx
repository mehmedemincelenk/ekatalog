import { useStore } from '../../store';
import { useState, useEffect, useRef } from 'react';
import Button from '../ui/Button';
import BaseModal from './BaseModal';
import StatusToggle from '../ui/StatusToggle';
import Loading from '../ui/Loading';
import { DisplaySettingsModalProps, DisplayConfig } from '../../types';

import { THEME } from '../../data/config';
import { storage } from '../../utils/storage';
import { QuickEditModal } from './UtilityModals';
import * as Lucide from 'lucide-react';

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
    offText:
      'Ürünlerin üzerine tıklandığında sadece ürün detayı açılır.',
  },
  maintenance: {
    title: 'Bakım Modu Nedir?',
    onText:
      'Dükkanınız geçici olarak ziyaretçilere kapatılır.',
    offText:
      'Dükkanınız herkese açıktır.',
  },
};

const SettingCard = ({ 
  option, 
  onHelpTrigger, 
  isHiddenHelp 
}: { 
  option: SettingOption, 
  onHelpTrigger: (id: string) => void,
  isHiddenHelp: boolean
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
      <div className={`absolute -right-4 -bottom-4 opacity-[0.08] pointer-events-none transition-transform duration-500 group-hover:scale-110 ${option.isOn ? 'text-white' : 'text-stone-900'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" viewBox="0 0 16 16" style={{ transform: 'scaleX(-1) rotate(15deg)' }}>
          <path d="M8.06 6.5a.5.5 0 0 1 .5.5v.776a11.5 11.5 0 0 1-.552 3.519l-1.331 4.14a.5.5 0 0 1-.952-.305l1.33-4.141a10.5 10.5 0 0 0 .504-3.213V7a.5.5 0 0 1 .5-.5Z"/>
          <path d="M6.06 7a2 2 0 1 1 4 0 .5.5 0 1 1-1 0 1 1 0 1 0-2 0v.332q0 .613-.066 1.221A.5.5 0 0 1 6 8.447q.06-.555.06-1.115zm3.509 1a.5.5 0 0 1 .487.513 11.5 11.5 0 0 1-.587 3.339l-1.266 3.8a.5.5 0 0 1-.949-.317l1.267-3.8a10.5 10.5 0 0 0 .535-3.048A.5.5 0 0 1 9.569 8m-3.356 2.115a.5.5 0 0 1 .33.626L5.24 14.939a.5.5 0 1 1-.955-.296l1.303-4.199a.5.5 0 0 1 .625-.329"/>
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
}

export default function DisplaySettingsModal({
  isOpen,
  onClose,
  settings,
  updateSetting,
  isInlineEnabled,
  onToggleInline,
  isStatic = false,
}: DisplaySettingsModalProps) {
    const { showFeedback, adminPin } = useStore();
    const [isUploading, setIsUploading] = useState(false);
    const [helpId, setHelpId] = useState<string | null>(null);
    const [hiddenHelpIds, setHiddenHelpIds] = useState<string[]>(() => {
      return storage.get('ekatalog_hidden_help_ids', []);
    });

    const [localConfig, setLocalConfig] = useState(settings?.displayConfig || {});
    const [localAnnouncement, setLocalAnnouncement] = useState(settings?.announcementBar?.enabled || false);
    const [localMaintenance, setLocalMaintenance] = useState(settings?.maintenanceMode?.enabled || false);
    const [localInline, setLocalInline] = useState(isInlineEnabled);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (!isOpen) return;
      setLocalConfig(settings?.displayConfig || {});
      setLocalAnnouncement(settings?.announcementBar?.enabled || false);
      setLocalMaintenance(settings?.maintenanceMode?.enabled || false);
      setLocalInline(isInlineEnabled);
    }, [settings, isInlineEnabled, isOpen]);

    if (!settings) return null;

    const getOptionState = (key: keyof DisplayConfig) => {
      const val = localConfig[key];
      if (key === 'showPrice') return val !== false;
      if (key === 'showWhatsapp') return val !== false;
      if (key === 'showCarousel') return val !== false;
      if (key === 'showCategories') return val !== false;
      if (key === 'showSearch') return val !== false;
      return !!val;
    };

    const toggleOption = async (key: keyof DisplayConfig) => {
      const currentVal = getOptionState(key);
      const newVal = !currentVal;
      setLocalConfig(prev => ({ ...prev, [key]: newVal }));
      try {
        await updateSetting('displayConfig', {
          ...settings.displayConfig,
          [key]: newVal,
        });
      } catch (err) {
        setLocalConfig(settings.displayConfig || {});
      }
    };

    const toggleAnnouncement = async () => {
      const newVal = !localAnnouncement;
      setLocalAnnouncement(newVal);
      try {
        await updateSetting('announcementBar', { ...settings.announcementBar, enabled: newVal });
      } catch (err) {
        setLocalAnnouncement(settings.announcementBar?.enabled || false);
      }
    };

    const toggleMaintenance = async () => {
      const newVal = !localMaintenance;
      setLocalMaintenance(newVal);
      try {
        await updateSetting('maintenanceMode', { ...settings.maintenanceMode, enabled: newVal });
      } catch (err) {
        setLocalMaintenance(settings.maintenanceMode?.enabled || false);
      }
    };

    const handleToggleInline = () => {
      setLocalInline(!localInline);
      onToggleInline();
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !adminPin) return;
      setIsUploading(true);
      try {
        const { secureUploadVisualAsset } = await import('../../utils/image');
        const finalizedUrl = await secureUploadVisualAsset({
          file,
          folder: 'logos',
          adminPin,
          oldUrl: settings.logoUrl,
          slugBaseName: settings.name,
          uniqueIdPrefix: 'logo',
          isDualQuality: false
        });
        
        await updateSetting('logoUrl', finalizedUrl);
        showFeedback('success', 'Logo başarıyla güncellendi');
      } catch (err) {
        showFeedback('error', 'Logo yüklenirken bir hata oluştu');
      } finally {
        setIsUploading(false);
      }
    };

    const hideHelpPermanently = (id: string) => {
      const updated = [...hiddenHelpIds, id];
      setHiddenHelpIds(updated);
      storage.set('ekatalog_hidden_help_ids', updated);
      setHelpId(null);
    };

    const groups = [
      {
        id: 'floating',
        title: 'YÜZEN MENÜ BİLEŞENLERİ',
        options: [
          { key: 'showWhatsapp', label: 'WhatsApp', isOn: getOptionState('showWhatsapp'), onToggle: () => toggleOption('showWhatsapp') },
          { key: 'showInstagram', label: 'Instagram', isOn: getOptionState('showInstagram'), onToggle: () => toggleOption('showInstagram') },
          { key: 'showAddress', label: 'Adres Bilgisi', isOn: getOptionState('showAddress'), onToggle: () => toggleOption('showAddress') },
          { key: 'showCurrency', label: 'Döviz Çevirici', isOn: getOptionState('showCurrency'), onToggle: () => toggleOption('showCurrency') },
          { key: 'showPriceList', label: 'Fiyat Listesi', isOn: getOptionState('showPriceList'), onToggle: () => toggleOption('showPriceList') },
          { key: 'showCoupons', label: 'İndirim Kuponu', isOn: getOptionState('showCoupons'), onToggle: () => toggleOption('showCoupons') },
        ]
      },
      {
        id: 'branding',
        title: 'VİTRİN VE TASARIM',
        options: [
          { key: 'showLogo', label: 'Mağaza Logosu', isOn: getOptionState('showLogo'), onToggle: () => toggleOption('showLogo') },
          { key: 'showSubtitle', label: 'Slogan / Alt Başlık', isOn: getOptionState('showSubtitle'), onToggle: () => toggleOption('showSubtitle') },
          { key: 'showCarousel', label: 'Ana Sayfa Afişleri', isOn: getOptionState('showCarousel'), onToggle: () => toggleOption('showCarousel') },
          { key: 'showReferences', label: 'Referans Logoları', isOn: getOptionState('showReferences'), onToggle: () => toggleOption('showReferences') },
          { key: 'showPrice', label: 'Ürün Fiyatları', isOn: getOptionState('showPrice'), onToggle: () => toggleOption('showPrice') },
          { key: 'announcement', label: 'Duyuru Panosu', isOn: localAnnouncement, onToggle: toggleAnnouncement },
        ]
      },
      {
        id: 'system',
        title: 'SİSTEM YÖNETİMİ',
        options: [
          { key: 'showSearch', label: 'Arama Çubuğu', isOn: getOptionState('showSearch'), onToggle: () => toggleOption('showSearch') },
          { key: 'showCategories', label: 'Kategori Filtreleri', isOn: getOptionState('showCategories'), onToggle: () => toggleOption('showCategories') },
          { key: 'inline', label: 'Hızlı Düzenleme', isOn: localInline, onToggle: handleToggleInline, hasHelp: true },
          { key: 'maintenance', label: 'Bakım Modu', isOn: localMaintenance, onToggle: toggleMaintenance, hasHelp: true },
        ]
      },
      {
        id: 'identity',
        title: 'MAĞAZA KİMLİĞİ',
        isIdentity: true,
        options: [
          { key: 'logo', label: 'Mağaza Logosu', value: settings.logoUrl ? 'GÖRSEL AYARLANDI' : 'GÖRSEL EKSİK', icon: <Lucide.Camera size={14} />, isLogo: true },
          { key: 'title', label: 'Mağaza Adı', value: settings.title, icon: <Lucide.Settings2 size={14} /> },
          { key: 'subtitle', label: 'Alt Başlık / Slogan', value: settings.subtitle, icon: <Lucide.Tags size={14} /> },
          { key: 'whatsapp', label: 'WhatsApp Hattı', value: settings.whatsapp, icon: <Lucide.Phone size={14} /> },
          { key: 'instagram', label: 'Instagram Kullanıcı Adı', value: settings.instagram?.split('/').pop() || '', icon: <Lucide.Camera size={14} /> },
          { key: 'address', label: 'Mağaza Adresi', value: settings.address, icon: <Lucide.MapPin size={14} /> },
        ]
      }
    ];

    const [quickEdit, setQuickEdit] = useState<{
      key: string;
      value: string;
      title: string;
    } | null>(null);

    const handleIdentityClick = (option: any) => {
      if (option.isLogo) {
        fileInputRef.current?.click();
        return;
      }
      setQuickEdit({
        key: option.key,
        value: option.value,
        title: option.label
      });
    };

    const handleQuickSave = (newVal: string) => {
      if (!quickEdit) return;
      if (quickEdit.key === 'instagram') {
        const sanitized = newVal.trim().replace(/^@/, '');
        updateSetting('instagram', sanitized ? `https://www.instagram.com/${sanitized}` : '');
      } else {
        updateSetting(quickEdit.key as any, newVal);
      }
      setQuickEdit(null);
    };

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
              <Button onClick={onClose} variant="secondary" mode="rectangle" className={`w-16 h-16 !bg-stone-50 border-stone-100 shrink-0 ${THEME.shadows.sm}`}>
                <Lucide.ChevronLeft size={24} strokeWidth={4} />
              </Button>
              <Button onClick={onClose} variant="action" size="md" className="flex-1 h-16 !rounded-[24px]">
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
              onChange={handleLogoUpload} 
              disabled={isUploading} 
            />

            {groups.map((group) => (
              <div key={group.id} className="grid grid-cols-2 gap-x-2 gap-y-2">
                <div className="col-span-2 px-1 flex items-baseline gap-2 mt-2 mb-1 pl-4 border-l-2 border-stone-900">
                  <h5 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.2em]">{group.title}</h5>
                </div>
                {group.options.map((option: any) => (
                  group.isIdentity ? (
                    <div
                      key={option.key}
                      onClick={() => handleIdentityClick(option)}
                      className="col-span-2 flex items-center justify-between p-3 rounded-2xl border border-stone-100 bg-white text-stone-900 shadow-sm hover:border-stone-900 cursor-pointer transition-all group h-12"
                    >
                      <div className="flex items-center gap-2 overflow-hidden flex-1">
                        <div className="w-6 h-6 flex items-center justify-center text-stone-400 group-hover:text-stone-900 transition-colors">
                          {isUploading && option.isLogo ? (
                            <Loading size="sm" variant="dark" />
                          ) : (
                            option.icon
                          )}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-[8px] font-black uppercase text-stone-400 leading-none mb-0.5">{option.label}</span>
                          <div className="flex items-center gap-2">
                            {option.isLogo && settings.logoUrl && !isUploading && (
                              <img src={settings.logoUrl} className="w-4 h-4 object-contain rounded-sm bg-stone-50" alt="Mini Logo" />
                            )}
                            <span className="text-[10px] font-bold truncate">
                              {isUploading && option.isLogo ? 'YÜKLENİYOR...' : (option.value || 'Girilmemiş')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Lucide.ChevronRight size={14} className="text-stone-300 group-hover:text-stone-900" />
                    </div>
                  ) : (
                    <SettingCard 
                      key={option.key} 
                      option={option as any} 
                      onHelpTrigger={setHelpId} 
                      isHiddenHelp={hiddenHelpIds.includes(option.key)} 
                    />
                  )
                ))}
              </div>
            ))}
          </div>
        </BaseModal>

        {/* IDENTITY QUICK EDIT */}
        <div className="z-[100000]">
          {quickEdit && (
            <QuickEditModal
              isOpen={!!quickEdit}
              onClose={() => setQuickEdit(null)}
              onSave={handleQuickSave}
              initialValue={quickEdit.value || ''}
              placeholder={`${quickEdit.title} girin...`}
            />
          )}
        </div>

        <BaseModal isOpen={!!helpId} onClose={() => setHelpId(null)} maxWidth="max-w-sm" isStatic={isStatic} footer={
          <div className="flex flex-col gap-2 w-full">
            <Button onClick={() => setHelpId(null)} variant="primary" size="md" className="w-full !py-4 font-black" mode="rectangle">KAPAT</Button>
            <Button onClick={() => helpId && hideHelpPermanently(helpId)} variant="ghost" size="sm" className="w-full !text-stone-400 !text-[9px] font-black hover:!text-stone-900 underline px-6 text-center leading-tight shadow-none" mode="rectangle">Bu ipucunu tekrar gösterme</Button>
          </div>
        }>
          {helpId && (
            <div className="space-y-4 py-2">
              <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-3xl flex gap-4">
                <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"><Lucide.Check size={18} /></div>
                <p className="text-[11px] text-emerald-800 leading-relaxed font-bold">{HELP_CONTENTS[helpId].onText}</p>
              </div>
              <div className="bg-stone-50 border border-stone-100 p-5 rounded-3xl opacity-60 text-stone-500 flex items-center gap-4">
                <div className="w-8 h-8 bg-stone-200 rounded-xl flex items-center justify-center shrink-0 text-stone-400">
                  <Lucide.X size={18} strokeWidth={3} />
                </div>
                <p className="text-[11px] leading-relaxed font-bold">{HELP_CONTENTS[helpId].offText}</p>
              </div>
            </div>
          )}
        </BaseModal>
      </>
    );
}
