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

const Navbar = memo(
  ({ onLogoPointerDown, onLogoPointerUp, isInlineEnabled }: NavbarProps) => {
    const flow = useNavbarFlow(
      onLogoPointerDown,
      onLogoPointerUp,
      isInlineEnabled,
    );

    const theme = THEME.navbar;
    const globalIcons = THEME.icons;

    if (!flow.settings) return null;

    const editStyle = flow.isAdmin
      ? 'outline-none focus:ring-0 rounded px-1 -mx-1 transition-colors duration-200 hover:bg-stone-50 cursor-text motion-fix'
      : '';

    const config = flow.settings.displayConfig;
    const isRightSideVisible =
      config.showInstagram || config.showAddress || config.showWhatsapp;
    const isTitleOnly =
      !isRightSideVisible && !config.showLogo && !config.showSubtitle;

    const announcementBarTheme = THEME.announcementBar;
    const announcementConfig = flow.settings.announcementBar ?? {
      enabled: false,
      text: '',
    };
    const showAnnouncementBar =
      announcementConfig.enabled && announcementConfig.text;

    return (
      <>
        {/* ANNOUNCEMENT BAR */}
        {(showAnnouncementBar ||
          (flow.isAdmin && announcementConfig.enabled)) && (
          <div className={announcementBarTheme.wrapper}>
            <span
              className={`${announcementBarTheme.text} ${flow.isAdmin && isInlineEnabled ? announcementBarTheme.adminEditStyle : ''}`}
              contentEditable={flow.isAdmin && isInlineEnabled}
              suppressContentEditableWarning
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
                  !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) &&
                  !e.metaKey &&
                  !e.ctrlKey
                ) {
                  e.preventDefault();
                }
              }}
            >
              {announcementConfig.text ||
                (flow.isAdmin ? 'Duyuru metnini buraya yazın...' : '')}
            </span>
            {/* X Button Removed by request */}
          </div>
        )}

        <nav className={theme.layout}>
          <div className={theme.container}>
            <div
              className={`${theme.innerWrapper} ${isTitleOnly ? 'justify-center' : 'justify-between'}`}
            >
              <div className="flex items-center flex-1 gap-0.5 min-w-0">
                {/* BRAND SECTION */}
                <div
                  className={`${theme.brand.wrapper} relative flex items-center transition-all duration-200 ${flow.isLogoPressed ? 'scale-95 opacity-80' : 'scale-100'}`}
                  onContextMenu={(e) => e.preventDefault()}
                  style={{
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    touchAction: 'none',
                  }}
                >
                  {/* FALLBACK ADMIN OVERLAY (Only active if logo is hidden) */}
                  {!flow.settings.displayConfig.showLogo && (
                    <div
                      className="absolute inset-0 z-[40] cursor-pointer touch-none"
                      onPointerDown={flow.handlePressStart}
                      onPointerUp={flow.handlePressEnd}
                      onPointerLeave={flow.handlePressEnd}
                    />
                  )}

                  {flow.settings.displayConfig.showLogo && (
                    <div
                      className={`${theme.brand.logoWrapper} select-none touch-none cursor-pointer overflow-hidden flex items-center justify-center relative z-[30]`}
                    >
                      {/* UNIFIED LONG-PRESS DETECTOR OVERLAY (RESTRICTED TO LOGO) */}
                      <div
                        className="absolute inset-0 z-[40] cursor-pointer touch-none"
                        onPointerDown={flow.handlePressStart}
                        onPointerUp={flow.handlePressEnd}
                        onPointerLeave={flow.handlePressEnd}
                      />

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
                          className="w-9 h-9 rounded-md"
                          objectFit="contain"
                        />
                      ) : (
                        <span className="w-9 h-9 flex items-center justify-center text-2xl select-none rounded-md bg-stone-100">
                          📦
                        </span>
                      )}
                    </div>
                  )}

                  <div
                    className={`${theme.brand.textWrapper} relative z-[30] pointer-events-none`}
                  >
                    <div className="flex items-center">
                      <span
                        contentEditable={flow.isAdmin && isInlineEnabled}
                        suppressContentEditableWarning
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
                        className={`!text-[0.85rem] font-black tracking-tighter text-stone-900 ${editStyle} ${flow.isAdmin ? 'pointer-events-auto' : ''}`}
                      >
                        {flow.settings.title ||
                          flow.settings.name ||
                          DEFAULT_COMPANY.name}
                      </span>
                    </div>
                    {flow.settings.displayConfig.showSubtitle && (
                      <span
                        contentEditable={flow.isAdmin && isInlineEnabled}
                        suppressContentEditableWarning
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
                            !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab'].includes(e.key) &&
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
                        className={`!text-[0.55rem] text-stone-400 font-medium ${editStyle} ${flow.isAdmin ? 'pointer-events-auto' : ''}`}
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
                      className={`order-2 !text-[0.7rem] text-stone-600 hover:text-stone-900 transition-colors font-bold text-right leading-tight px-1 truncate max-w-[10rem] xs:max-w-[14rem] sm:max-w-[20rem] md:max-w-[28rem] block ${editStyle}`}
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
                          useStore.getState().openModal('CONTACT');
                        }}
                        variant="glass"
                        mode="rectangle"
                        className="!bg-stone-900/60 backdrop-blur-md border border-white/20 !text-white !px-3 !py-1 !rounded-lg hover:!bg-stone-900/80 !shadow-xl transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            contentEditable={flow.isAdmin && isInlineEnabled}
                            suppressContentEditableWarning
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
  },
);

export default Navbar;
