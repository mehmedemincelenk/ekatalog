import { COMPANY } from '../data/config';

export default function Footer({ onLogoClick, isAdmin }) {
  return (
    <footer className="bg-white border-t border-stone-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center gap-3">
        {/* Logo — 7 rapid clicks = activate admin, 1 click = exit admin */}
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2 select-none focus:outline-none"
          aria-label="Marka logosu"
          title={isAdmin ? 'Admin modu aktif — çıkmak için tıkla' : ''}
        >
          <span className="text-3xl">{COMPANY.logoEmoji}</span>
          <div className="flex flex-col items-start leading-none text-left">
            <span className="font-bold text-stone-900 tracking-tight text-lg">{COMPANY.name}</span>
            <span className="text-[11px] text-kraft-600 mt-0.5">{COMPANY.tagline}</span>
          </div>
          {isAdmin && (
            <span className="ml-2 text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded">
              ADMİN
            </span>
          )}
        </button>

        <p className="text-xs text-stone-400 text-center mt-2">
          © {new Date().getFullYear()} {COMPANY.name}. Tüm hakları saklıdır.
        </p>
        
        {/* Adres */}
        <a 
          href={`https://maps.google.com/?q=${encodeURIComponent(COMPANY.address)}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-stone-400 text-center hover:text-stone-600 hover:underline transition-colors"
          title="Google Haritalar'da Aç"
        >
          {COMPANY.address}
        </a>
      </div>
    </footer>
  );
}
