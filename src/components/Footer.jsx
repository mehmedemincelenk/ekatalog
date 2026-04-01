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
        <p className="text-xs text-stone-400 text-center">{COMPANY.address}</p>

        {/* Developer Contact */}
        <div className="mt-4 flex items-center justify-center">
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[11px] text-stone-400 hover:text-stone-600 transition-colors opacity-70 hover:opacity-100"
            title="Geliştiriciye Ulaş"
          >
            <span>💻 Websitemizi Geliştirene Ulaş</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M11.95 0C5.353 0 0 5.353 0 11.95c0 2.12.553 4.146 1.545 5.92L.038 23.366l5.63-1.488a11.895 11.895 0 006.282 1.772h.005c6.594 0 11.947-5.352 11.947-11.95S18.544 0 11.95 0h.001zm0 21.64c-1.802 0-3.565-.484-5.111-1.398l-.367-.217-3.8.995 1.01-3.7-.238-.38a9.855 9.855 0 01-1.5-5.295C1.944 5.463 6.305 1.107 11.95 1.107c2.72 0 5.275 1.06 7.198 2.984a10.125 10.125 0 012.981 7.204c-.001 5.642-4.362 9.998-10.006 10.003h-.001h-.17zm5.547-7.514c-.304-.152-1.796-.887-2.074-.988-.278-.102-.482-.152-.684.152-.203.304-.783.988-.96 1.19-.177.203-.355.228-.659.076-1.483-.717-2.617-1.328-3.626-2.923-.203-.321.203-.298.497-.887.098-.194.048-.363-.028-.516-.076-.152-.684-1.645-.937-2.253-.245-.59-.496-.51-.684-.52-.178-.009-.381-.009-.584-.009s-.532.076-.811.38c-.28.304-1.065 1.039-1.065 2.533s1.09 2.938 1.242 3.14c.152.203 2.14 3.267 5.183 4.568 2.052.879 2.876.953 3.931.803 1.144-.162 3.522-1.438 4.01-2.83.488-1.393.488-2.584.342-2.83-.146-.246-.546-.398-.85-.55z"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
