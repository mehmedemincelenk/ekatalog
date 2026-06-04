// FILE ROLE: Global Navigation & Brand Header
// DEPENDS ON: THEME, CompanySettings, Image Utilities, Contact Helpers
// CONSUMED BY: App.tsx
import { memo } from 'react';
import { THEME, DEFAULT_COMPANY } from '../../data/config';
import Button from '../ui/Button';
import SmartImage from '../ui/SmartImage';
import FormInput from '../ui/FormInput';
import { QuickEditModal } from '../modals/UtilityModals';
import { useStore } from '../../store';

/**
 * NAVBAR COMPONENT (Layout Correction)
 * -----------------------------------------------------------
 * Fully utilizes atomic Button component for all header interactions.
 */

import { useNavbarFlow } from '../../hooks/useNavbarFlow';

import { NavbarProps } from '../../types';

const Navbar = memo(({ isInlineEnabled, isPreview }: NavbarProps) => {
  const flow = useNavbarFlow(isInlineEnabled, isPreview);

  const theme = THEME.navbar;
  const globalIcons = THEME.icons;

  if (!flow.settings) return null;

  const editStyle = flow.isAdmin
    ? 'outline-none focus:ring-0 rounded px-1 -mx-1 transition-colors duration-200 hover:bg-stone-50 cursor-text motion-fix'
    : '';

  const config = flow.settings.displayConfig;
  const isRightSideVisible =
    config.showInstagram || config.showAddress || config.showWhatsapp;
  const showTitle = config.showTitle !== false;
  const isTitleOnly =
    !isRightSideVisible &&
    !config.showLogo &&
    !config.showSubtitle &&
    showTitle;

  const announcementBarTheme = THEME.announcementBar;
  const announcementConfig = flow.settings.announcementBar ?? {
    enabled: false,
    text: '',
  };
  const showAnnouncementBar =
    announcementConfig.enabled &&
    (announcementConfig.text || flow.isAdmin || isPreview);

  return (
    <>
      {/* ANNOUNCEMENT BAR */}
      {showAnnouncementBar && (
        <div className={announcementBarTheme.wrapper}>
          <span
            className={`${announcementBarTheme.text} ${flow.isAdmin && isInlineEnabled ? announcementBarTheme.adminEditStyle : ''}`}
            contentEditable={flow.isAdmin && isInlineEnabled}
            suppressContentEditableWarning
            spellCheck={false}
            onBlur={flow.handleAnnouncementBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.currentTarget.blur();
                return;
              }
              if (
                e.currentTarget.textContent &&
                e.currentTarget.textContent.length >= 60 &&
                ![
                  'Backspace',
                  'Delete',
                  'ArrowLeft',
                  'ArrowRight',
                  'ArrowUp',
                  'ArrowDown',
                ].includes(e.key) &&
                !e.metaKey &&
                !e.ctrlKey
              ) {
                e.preventDefault();
              }
            }}
          >
            {announcementConfig.text ||
              (flow.isAdmin || isPreview
                ? 'Duyuru metnini buraya yazın...'
                : '')}
          </span>
          {/* X Button Removed by request */}
        </div>
      )}

      <nav className={theme.layout}>
        <div className={theme.container}>
          <div
            className={`${theme.innerWrapper} ${isTitleOnly ? 'justify-center' : 'justify-between'}`}
            style={{
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
            }}
          >
            <div className="flex items-center flex-1 gap-0.5 min-w-0">
              {/* BRAND SECTION */}
              <div
                className={`${theme.brand.wrapper} relative flex items-center transition-all duration-200`}
                onContextMenu={(e) => e.preventDefault()}
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                }}
              >
                {/* FALLBACK ADMIN OVERLAY (Only active if logo is hidden and we are Admin) */}
                {!flow.settings.displayConfig.showLogo && flow.isAdmin && (
                  <div
                    className="absolute inset-0 z-[40] cursor-pointer"
                    onClick={() =>
                      document.getElementById('logo-upload-input')?.click()
                    }
                  />
                )}

                {flow.settings.displayConfig.showLogo && (
                  <div
                    className={`${theme.brand.logoWrapper} select-none overflow-hidden flex items-center justify-center relative z-[30] ${
                      flow.isAdmin ? 'cursor-pointer' : 'pointer-events-none'
                    }`}
                  >
                    {/* SIMPLE CLICK UPLOADER FOR ADMIN */}
                    {flow.isAdmin && (
                      <div
                        className="absolute inset-0 z-[40] cursor-pointer"
                        onClick={() =>
                          document.getElementById('logo-upload-input')?.click()
                        }
                      />
                    )}

                    <input
                      id="logo-upload-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        flow.handleLogoUpload(e.target.files[0])
                      }
                    />
                    {flow.settings.logoUrl ? (
                      <SmartImage
                        src={flow.settings.logoUrl}
                        alt="Store Logo"
                        className="w-9 h-9 rounded-[4px]"
                        objectFit="contain"
                      />
                    ) : (
                      <span className="w-9 h-9 flex items-center justify-center text-2xl select-none rounded-[4px] bg-white/10 text-white">
                        📦
                      </span>
                    )}
                  </div>
                )}

                <div
                  className={`${theme.brand.textWrapper} relative z-[30] pointer-events-none`}
                >
                  {showTitle && (
                    <div className="flex items-center">
                      <span
                        contentEditable={flow.isAdmin && isInlineEnabled}
                        suppressContentEditableWarning
                        spellCheck={false}
                        onBlur={(e) =>
                          flow.updateSetting(
                            'title',
                            e.currentTarget.textContent || '',
                          )
                        }
                        onKeyDown={(e) =>
                          e.key === 'Enter' &&
                          (e.preventDefault(), e.currentTarget.blur())
                        }
                        onClick={(e) => {
                          if (!flow.isAdmin) return;
                          e.stopPropagation();
                          flow.handleTextEdit(
                            'title',
                            flow.settings!.title ||
                              flow.settings!.name ||
                              DEFAULT_COMPANY.name,
                            'Mağaza Adı',
                          );
                        }}
                        style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}
                        className={`!text-[0.85rem] font-black tracking-tighter text-white ${editStyle} ${flow.isAdmin ? 'pointer-events-auto' : ''}`}
                      >
                        {flow.settings.title ||
                          flow.settings.name ||
                          DEFAULT_COMPANY.name}
                      </span>
                    </div>
                  )}
                  {flow.settings.displayConfig.showSubtitle && (
                    <span
                      contentEditable={flow.isAdmin && isInlineEnabled}
                      suppressContentEditableWarning
                      spellCheck={false}
                      onBlur={(e) =>
                        flow.updateSetting(
                          'subtitle',
                          (e.currentTarget.textContent || '').slice(0, 20),
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.currentTarget.blur();
                          return;
                        }
                        const text = e.currentTarget.textContent || '';
                        if (
                          text.length >= 20 &&
                          ![
                            'Backspace',
                            'Delete',
                            'ArrowLeft',
                            'ArrowRight',
                            'ArrowUp',
                            'ArrowDown',
                            'Tab',
                          ].includes(e.key) &&
                          !e.ctrlKey &&
                          !e.metaKey
                        ) {
                          e.preventDefault();
                        }
                      }}
                      onClick={(e) => {
                        if (!flow.isAdmin) return;
                        e.stopPropagation();
                        flow.handleTextEdit(
                          'subtitle',
                          flow.settings!.subtitle || DEFAULT_COMPANY.tagline,
                          'Slogan/Açıklama',
                          20,
                        );
                      }}
                      style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}
                      className={`!text-[0.55rem] text-stone-200/95 font-semibold ${editStyle} ${flow.isAdmin ? 'pointer-events-auto' : ''}`}
                    >
                      {flow.settings.subtitle || DEFAULT_COMPANY.tagline}
                    </span>
                  )}
                </div>
              </div>

              {/* SEARCH BOX */}
              {flow.settings.displayConfig.showSearch && (
                <div className="hidden items-center w-full max-w-[10rem] ml-1">
                  <div className="relative w-full">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400">
                      {globalIcons.search}
                    </div>
                    <FormInput
                      id="desktop-search-input"
                      type="text"
                      value={flow.internalSearch}
                      onChange={(e) => flow.setInternalSearch(e.target.value)}
                      placeholder="Ara..."
                      className="!pl-9 !text-[0.65rem] !py-2 !bg-stone-50/50"
                      containerClassName="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {isRightSideVisible && (
              <div className="flex flex-col items-end gap-0.5 shrink-0 min-w-0">
                {/* Desktop Address */}
                {flow.settings.displayConfig.showAddress && (
                  <div
                    contentEditable={flow.isAdmin && isInlineEnabled}
                    suppressContentEditableWarning
                    spellCheck={false}
                    title={flow.settings.address}
                    onBlur={(e) =>
                      flow.updateSetting(
                        'shortAddress',
                        e.currentTarget.textContent || '',
                      )
                    }
                    onKeyDown={(e) =>
                      e.key === 'Enter' &&
                      (e.preventDefault(), e.currentTarget.blur())
                    }
                    onClick={() =>
                      flow.handleTextEdit(
                        'shortAddress',
                        flow.settings!.shortAddress || '',
                        'Şehir / Semt (Navbarda Gözükür)',
                      )
                    }
                    style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}
                    className={`order-2 !text-[0.7rem] text-stone-200 hover:text-white transition-colors font-bold text-right leading-tight px-1 truncate max-w-[10rem] xs:max-w-[14rem] sm:max-w-[20rem] md:max-w-[28rem] block ${editStyle}`}
                  >
                    {flow.settings.shortAddress || flow.settings.address}
                  </div>
                )}

                {/* Actions Group */}
                <div className="order-1 flex items-center gap-1 shrink-0">
                  {/* Contact Button */}
                  {flow.settings.displayConfig.showWhatsapp && (
                    <Button
                      onClick={() => {
                        if (isPreview) return;
                        useStore.getState().openModal('CONTACT');
                      }}
                      variant="glass"
                      mode="rectangle"
                      className="!bg-stone-900/75 backdrop-blur-xl border border-white/10 !text-white !px-3 !py-1.5 !rounded-xl hover:!bg-stone-900/90 hover:scale-[1.03] active:scale-95 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_6px_20px_-4px_rgba(0,0,0,0.15)] transition-all duration-200"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          contentEditable={flow.isAdmin && isInlineEnabled}
                          suppressContentEditableWarning
                          spellCheck={false}
                          onBlur={(e) =>
                            flow.updateSetting(
                              'whatsapp',
                              e.currentTarget.textContent || '',
                            )
                          }
                          onKeyDown={(e) =>
                            e.key === 'Enter' &&
                            (e.preventDefault(), e.currentTarget.blur())
                          }
                          className={`!text-[0.6rem] font-black tracking-tight leading-normal flex items-center ${flow.isAdmin && isInlineEnabled ? 'min-w-[40px] focus:bg-white/10' : ''}`}
                        >
                          {flow.settings.whatsapp || 'SİPARİŞ VER'}
                        </span>
                      </div>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
      <QuickEditModal
        isOpen={!!flow.quickEdit}
        onClose={() => flow.setQuickEdit(null)}
        onSave={flow.handleQuickSave}
        initialValue={flow.quickEdit?.value || ''}
        placeholder={`${flow.quickEdit?.title} girin...`}
        maxLength={flow.quickEdit?.maxLength}
      />
    </>
  );
});

export default Navbar;
