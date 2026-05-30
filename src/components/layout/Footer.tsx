import { THEME } from '../../data/config';
import { useStore } from '../../store';
import { memo } from 'react';

const Footer = memo(function Footer() {
  const { settings } = useStore();
  const footerTheme = THEME.footer;

  return (
    <footer className={footerTheme.layout}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* MIDDLE BRANDING SECTION */}
        <div className="flex flex-col items-center gap-2">
          {settings?.logoUrl && (
            <img
              src={settings.logoUrl}
              alt={settings.title || 'Store Logo'}
              className="w-[72px] h-[72px] object-contain rounded-[4px] select-none pointer-events-none"
            />
          )}
          <p className="text-[10px] font-black text-stone-900 uppercase tracking-[0.3em] select-none">
            ekatalog | {settings?.title || 'Dijital Kart'}
          </p>
          <p className="text-[9px] font-bold text-stone-400 tracking-tighter uppercase">
            Tüm hakları saklıdır. &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
