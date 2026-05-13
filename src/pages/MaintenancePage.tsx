import { useState } from 'react';
import { motion } from 'framer-motion';
import * as Lucide from 'lucide-react';
import Numpad from '../components/ui/Numpad';
import { useSettings } from '../hooks/useSettingsHub';
import { MaintenancePageProps } from '../types';

/**
 * MAINTENANCE PAGE (Diamond Standard v2.0)
 * -----------------------------------------------------------
 * A professional downtime interface with lead capture and hidden admin access.
 */
export default function MaintenancePage({ onLogoPointerDown, onLogoPointerUp }: MaintenancePageProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const { settings, addVisitorLead } = useSettings(false);
  const [isLogoPressed, setIsLogoPressed] = useState(false);

  const handlePressStart = () => {
    setIsLogoPressed(true);
    onLogoPointerDown();
  };

  const handlePressEnd = () => {
    setIsLogoPressed(false);
    onLogoPointerUp();
  };

  const handleLeadSubmit = async (phone: string) => {
    try {
      await addVisitorLead(phone);
      setIsSuccess(true);
    } catch (err) {
      console.error('Maintenance lead failed', err);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/50 flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden relative">
      <div className="max-w-md w-full space-y-16 relative z-10">
        {/* BRANDING (HIDDEN ADMIN ACCESS) */}
        <div 
          className={`flex flex-col items-center space-y-6 transition-all duration-300 cursor-pointer touch-none ${isLogoPressed ? 'scale-95 opacity-50' : 'scale-100'}`}
          onPointerDown={handlePressStart}
          onPointerUp={handlePressEnd}
          onPointerLeave={handlePressEnd}
          onContextMenu={(e) => e.preventDefault()}
          style={{ userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'none' }}
        >
          {settings?.logoUrl ? (
            <img 
              src={settings.logoUrl} 
              alt={settings.title} 
              className="h-24 w-auto object-contain pointer-events-none drop-shadow-sm" 
            />
          ) : (
            <div className="w-16 h-16 bg-stone-900 rounded-3xl flex items-center justify-center text-white text-2xl font-black shadow-xl">
              {settings?.title?.charAt(0) || 'E'}
            </div>
          )}
          <div className="space-y-3">
            <h1 className="text-sm font-black text-stone-400 tracking-[0.5em] uppercase">{settings?.title || 'KATALOG'}</h1>
            <div className="h-0.5 w-8 bg-stone-900/5 mx-auto rounded-full" />
          </div>
        </div>

        <div className="relative">
          {/* SUCCESS STATE */}
          {isSuccess ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center space-y-4"
            >
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <Lucide.Check size={24} strokeWidth={3} />
              </div>
              <p className="text-stone-400 text-[10px] font-black uppercase tracking-[0.2em]">KAYDINIZ ALINDI, GÖRÜŞMEK ÜZERE.</p>
            </motion.div>
          ) : (
            <div className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-xs font-black text-stone-300 tracking-[1em] uppercase leading-none">
                  GÜNCELLEME YAPILIYOR
                </h2>
              </div>

              {/* LEAD CAPTURE SECTION - MINIMALIST */}
              <div className="space-y-8">
                <div className="text-center">
                  <p className="text-base font-black text-stone-800 tracking-tight uppercase">Sizi Arayalım</p>
                  <p className="text-[10px] text-stone-400 font-bold uppercase mt-1 opacity-60">Açılışta haber vermek için numaranızı bırakın</p>
                </div>
                
                <div className="max-w-[280px] mx-auto bg-white rounded-3xl p-6 shadow-xl shadow-stone-200/20 border border-stone-100">
                  <Numpad onSubmit={handleLeadSubmit} maxDigits={10} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="pt-12">
          <p className="text-[8px] font-black text-stone-300 uppercase tracking-[0.8em]">
            DIAMOND INFRASTRUCTURE
          </p>
        </div>
      </div>
    </div>
  );
}
