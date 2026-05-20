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
                      <SmartImage
                        src={flow.settings.logoUrl || DEFAULT_COMPANY.logoUrl}
                        alt="Store Logo"
                        className="w-9 h-9 rounded-md"
                        objectFit="contain"
                      />
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
                            'subtitle',
                            flow.settings!.subtitle || DEFAULT_COMPANY.tagline,
                            'Slogan/Açıklama',
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
                <div className="flex flex-col items-end gap-0.5 shrink-0">
                  {/* Desktop Address */}
                  {flow.settings.displayConfig.showAddress && (
                    <div
                      contentEditable={flow.isAdmin && isInlineEnabled}
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        flow.updateSetting(
                          'address',
                          e.currentTarget.textContent || '',
                        )
                      }
                      onKeyDown={(e) =>
                        e.key === 'Enter' &&
                        (e.preventDefault(), e.currentTarget.blur())
                      }
                      onClick={() =>
                        flow.handleTextEdit(
                          'address',
                          flow.settings!.address,
                          'Adres',
                        )
                      }
                      className={`order-2 !text-[0.7rem] text-stone-600 hover:text-stone-900 transition-colors font-bold text-right leading-tight px-1 ${editStyle}`}
                    >
                      {flow.settings.address}
                    </div>
                  )}

                  {/* Actions Group */}
                  <div className="order-1 flex items-center gap-1 shrink-0">
                    {/* Instagram Button */}
                    {flow.settings.displayConfig.showInstagram && (
                      <Button
                        onClick={flow.handleInstagramAction}
                        variant="ghost"
                        mode="square"
                        size="sm"
                        className={`!w-6 !h-6 !p-0 !bg-transparent !border-none flex items-center justify-center ${flow.isAdmin ? 'text-pink-600' : 'text-stone-400 hover:text-pink-600 shadow-none'}`}
                        icon={
                          <svg
                            viewBox="0 0 24 24"
                            className="w-4 h-4 fill-current"
                          >
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                          </svg>
                        }
                      />
                    )}

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
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-3 h-3 text-white opacity-60"
                          >
                            <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
                            <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
                            <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
                            <path d="M2 12a10 10 0 0 1 18-6" />
                            <path d="M2 16h.01" />
                            <path d="M21.8 16c.2-2 .131-5.354 0-6" />
                            <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
                            <path d="M8.65 22c.21-.66.45-1.32.57-2" />
                            <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
                          </svg>
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
        />
      </>
    );
  },
);

export default Navbar;
