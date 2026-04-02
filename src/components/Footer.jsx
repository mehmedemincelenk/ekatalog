export default function Footer({ onLogoClick, isAdmin, settings }) {
  const s = settings;
  
  return (
    <footer className="bg-white border-t border-stone-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center gap-3">
        {/* Logo — 7 rapid clicks = activate admin, 1 click = exit admin */}
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2 select-none focus:outline-none"
          aria-label="Marka logosu"
          title={isAdmin ? 'Mağaza Yönetimi Aktif — çıkmak için tıkla' : ''}
        >
          <span className="text-3xl">{s.logoEmoji}</span>
          <div className="flex flex-col items-start leading-none text-left">
            <span className="font-bold text-stone-900 tracking-tight text-lg">{s.name}</span>
            <span className="text-[11px] text-stone-500 mt-0.5">{s.tagline}</span>
          </div>
          {isAdmin && (
            <span className="ml-2 text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded">
              MAĞAZA YÖNETİMİ
            </span>
          )}
        </button>

        <p className="text-xs text-stone-400 text-center mt-2">
          © {new Date().getFullYear()} {s.name}. Tüm hakları saklıdır.
        </p>
        
        {/* Adres */}
        {s.address && (
          <a 
            href={`https://maps.google.com/?q=${encodeURIComponent(s.address)}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-stone-400 text-center hover:text-stone-600 hover:underline transition-colors"
            title="Google Haritalar'da Aç"
          >
            {s.address}
          </a>
        )}
      </div>
    </footer>
  );
}
