import { useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import { MarqueeText } from '../ui/MarqueeText';
import { X, LayoutGrid } from 'lucide-react';


/**
 * BASE FLOATING MENU (DIAMOND FRAME)
 * -----------------------------------------------------------
 * Unified orchestrator for AssistiveTouch-style menus.
 * Handles expansion, auto-close, and outside-click logic.
 */

export interface FloatingAction {
  id: string;
  icon: ReactNode;
  action: () => void;
  label: string;
  primary?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'glass' | 'whatsapp' | 'kraft' | 'instagram' | 'phone';
  closeOnClick?: boolean; // Diamond logic: Some actions (like currency) shouldn't close the menu
}

interface BaseFloatingMenuProps {
  actions: FloatingAction[];
  autoCloseDelay?: number;
  mainIcon?: ReactNode;
  activeMainIcon?: ReactNode;
  isPrimaryToggle?: boolean;
  labelText?: string;
  theme?: 'light' | 'dark'; // Diamond: Support multiple visual identities
}

export default function BaseFloatingMenu({
  actions,
  autoCloseDelay = 5000,
  mainIcon = <LayoutGrid className="w-full h-full p-0.5" strokeWidth={2.5} />,
  activeMainIcon = <X className="w-full h-full p-0.5" strokeWidth={2.5} />,
  labelText = 'MENÜ',
}: BaseFloatingMenuProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleAction = (btn: FloatingAction) => {
    clearTimer();
    btn.action();
    
    // Diamond Standard: Persistent actions (like currency) stay open for UX flow
    if (btn.closeOnClick !== false) {
      setIsExpanded(false);
    } else {
      // Refresh the auto-close timer for persistent actions
      timerRef.current = setTimeout(() => setIsExpanded(false), autoCloseDelay);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('pointerdown', handleClickOutside);
      clearTimer();
      timerRef.current = setTimeout(() => setIsExpanded(false), autoCloseDelay);
    } else {
      document.removeEventListener('pointerdown', handleClickOutside);
      clearTimer();
    }

    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      clearTimer();
    };
  }, [isExpanded, autoCloseDelay, clearTimer]);

  return (
    <div ref={containerRef} className="z-[100] origin-bottom-right" style={{ transform: 'scale(0.95)' }}>
      <div 
        className={`
          flex flex-col items-center p-1 rounded-2xl transition-all duration-300 ease-in-out overflow-hidden w-[110px]
          bg-stone-900/60 backdrop-blur-xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)]
        `}
      >
        {/* ACTION CLUSTER (Above toggle, no gap) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              key="action-cluster"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="w-full flex flex-col items-center overflow-hidden"
            >
              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={{
                  open: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
                  closed: { transition: { staggerChildren: 0.02, staggerDirection: -1 } }
                }}
                className="flex flex-col gap-1 items-center w-full py-1 px-0.5"
              >
                {/* LABELED ACTIONS */}
                <div className="flex flex-col gap-1 items-center w-full">
                  {actions.filter(a => a.label).map((btn) => (
                    <motion.div
                      key={btn.id}
                      variants={{
                        open: { opacity: 1, y: 0, scale: 1 },
                        closed: { opacity: 0, y: 10, scale: 0.8 }
                      }}
                      className="w-full"
                    >
                      <Button
                        onClick={() => handleAction(btn)}
                        icon={btn.icon}
                        variant={btn.variant || 'secondary'}
                        size="sm"
                        mode="rectangle"
                        className={`
                          shrink-0 !rounded-lg ${btn.className || ''} w-full !justify-start px-2 gap-2 h-[40px] transition-all !text-white backdrop-blur-md !shadow-none
                          ${(!btn.variant || btn.variant === 'secondary') 
                            ? '!bg-white/10 !border-white/10 hover:!bg-white/20' 
                            : ''
                          }
                        `}
                      >
                        <div className="flex-1 min-w-0 overflow-hidden text-left">
                          <MarqueeText
                            text={btn.label}
                            textClass="text-[8px] font-black uppercase tracking-tighter text-white"
                            isAdmin={false}
                          />
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>

                {/* ICON ACTIONS GRID */}
                <div className="grid grid-cols-2 gap-1 justify-items-center w-full px-0.5">
                  {actions.filter(a => !a.label).map((btn) => (
                    <motion.div
                      key={btn.id}
                      variants={{
                        open: { opacity: 1, y: 0, scale: 1 },
                        closed: { opacity: 0, y: 10, scale: 0.8 }
                      }}
                      className="w-full"
                    >
                      <Button
                        onClick={() => handleAction(btn)}
                        icon={btn.icon}
                        variant={btn.variant || 'secondary'}
                        size="sm"
                        mode="rectangle"
                        className={`
                          shrink-0 !rounded-lg ${btn.className || ''} w-full h-[46px] !p-0 transition-all !text-white backdrop-blur-md !shadow-none
                          ${(!btn.variant || btn.variant === 'secondary') 
                            ? '!bg-white/10 !border-white/10 hover:!bg-white/20'
                            : 'hover:scale-[1.05]'
                          }
                        `}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MASTER TOGGLE */}
        <div className="w-full p-0.5">
          <Button
            onClick={() => {
              clearTimer();
              setIsExpanded((prev) => !prev);
            }}
            variant="secondary"
            size="sm"
            mode="rectangle"
            className={`
              hover:scale-[1.02] active:scale-95 transition-all h-12 w-full shadow-lg !rounded-lg relative overflow-hidden backdrop-blur-md
              ${isExpanded 
                ? '!bg-white !text-stone-900 border-white/20' 
                : '!bg-stone-900/60 !text-white border-white/10'}
            `}
            aria-label={isExpanded ? 'Menüyü Kapat' : 'Menüyü Aç'}
          >
            <div className="flex flex-row items-center justify-center gap-2.5 w-full h-full px-1">
              <span className="text-[11px] font-black uppercase tracking-tight leading-none">
                {labelText}
              </span>
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                {isExpanded ? activeMainIcon : mainIcon}
              </div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
