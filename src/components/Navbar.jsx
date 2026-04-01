import { useState } from 'react';
import { COMPANY, NAVBAR } from '../data/config';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const n = NAVBAR;

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Logo */}
          <div className="flex items-center gap-2 select-none">
            <span className={n.logoEmojiSize}>{COMPANY.logoEmoji}</span>
            <div className="flex flex-col">
              <div className={`${n.logoNameSize} ${n.logoNameWeight} text-stone-900 leading-none tracking-tight`}>
                {COMPANY.name}
              </div>
              <div className={`${n.logoTaglineSize} ${n.logoTaglineColor} font-medium`}>
                {COMPANY.tagline}
              </div>
            </div>
          </div>

          {/* Contact Info (Desktop) */}
          <div className="hidden md:flex flex-col items-end gap-0.5">
            <a
              href={COMPANY.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 px-2 py-1 ${n.whatsappBg} ${n.whatsappHoverBg} ${n.whatsappRounded} text-white transition-colors`}
              aria-label="WhatsApp ile İletişim"
            >
              <svg viewBox="0 0 24 24" className={`${n.whatsappIconSize} fill-current shrink-0`} aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.117 1.524 5.845L0 24l6.338-1.503A11.927 11.927 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.79 9.79 0 01-5.013-1.381l-.36-.213-3.761.892.944-3.652-.235-.374A9.779 9.779 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
              </svg>
              <span className={`${n.phoneSize} ${n.phoneWeight}`}>{COMPANY.phone}</span>
            </a>
            <p className={`${n.addressSize} ${n.addressColor} text-right`}>{COMPANY.address}</p>
          </div>

          {/* Hamburger (Mobile) */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-stone-500 hover:text-stone-900 focus:outline-none"
              aria-label="Menüyü aç"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen 
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-stone-50 px-4 py-3 flex flex-col gap-2">
          <a
            href={COMPANY.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 w-full px-3 py-2 ${n.whatsappBg} ${n.whatsappHoverBg} text-white ${n.whatsappRounded} text-sm font-semibold justify-center`}
          >
            <span className="text-lg">💬</span> WhatsApp: {COMPANY.phone}
          </a>
          <p className="text-xs text-stone-500 text-center mt-1 pb-1">
            {COMPANY.address}
          </p>
        </div>
      )}
    </nav>
  );
}
