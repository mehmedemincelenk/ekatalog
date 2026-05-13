import { THEME } from '../../data/config';
import { useStore } from '../../store';
import { memo } from 'react';

const Footer = memo(function Footer() {
  const { settings } = useStore();
  const footerTheme = THEME.footer;

  return (
    <footer className={footerTheme.layout}>
      <div className={footerTheme.container}>
        <div className={footerTheme.grid}>
          {/* CONTENT REMOVED - Clean design */}
        </div>

        {/* MIDDLE BRANDING SECTION */}
        <div className="mt-8 mb-4 flex flex-col items-center gap-2">
          <div className="h-[1px] w-12 bg-stone-200 mb-2"></div>
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
