import { useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Lucide from 'lucide-react';
import Button from '../ui/Button';
import { MarqueeText } from '../ui/MarqueeText';

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
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'danger'
    | 'success'
    | 'glass'
    | 'whatsapp'
    | 'kraft'
    | 'instagram'
    | 'phone';
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
  mainIcon,
  activeMainIcon,
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
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
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
    <div
      ref={containerRef}
      className="z-[100] origin-bottom-right"
      style={{ transform: 'scale(0.95)' }}
    >
      <div
        className="flex flex-col items-center rounded-md transition-all duration-300 ease-in-out overflow-hidden bg-stone-900/60 backdrop-blur-xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
        style={{
          width: '110px',
          padding: '5px',
          gap: isExpanded ? '6px' : '0px',
        }}
      >
        {/* ACTION CLUSTER (Above toggle, no gap) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              key="action-cluster"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="w-full flex flex-col items-center overflow-hidden"
            >
              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={{
                  open: {
                    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
                  },
                  closed: {
                    transition: { staggerChildren: 0.02, staggerDirection: -1 },
                  },
                }}
                className="flex flex-col gap-1.5 items-center w-full"
              >
                {/* LABELED ACTIONS */}
                {actions.some((a) => a.label) && (
                  <div className="flex flex-col gap-1 items-center w-full">
                    {actions
                      .filter((a) => a.label)
                      .map((btn) => (
                        <motion.div
                          key={btn.id}
                          variants={{
                            open: { opacity: 1, y: 0, scale: 1 },
                            closed: { opacity: 0, y: 10, scale: 0.8 },
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
                            shrink-0 !rounded-lg ${btn.className || ''} w-full !justify-center px-1 gap-2 h-[40px] transition-all !text-white backdrop-blur-md !shadow-none
                            ${
                              !btn.variant || btn.variant === 'secondary'
                                ? '!bg-white/10 !border-white/10 hover:!bg-white/20'
                                : ''
                            }
                          `}
                          >
                            <div className="flex-1 min-w-0 text-center px-1">
                              <MarqueeText
                                text={btn.label}
                                textClass="text-[11px] font-black uppercase tracking-normal text-white"
                                isAdmin={false}
                              />
                            </div>
                          </Button>
                        </motion.div>
                      ))}
                  </div>
                )}

                {/* ICON ACTIONS GRID */}
                <div className="grid grid-cols-2 gap-1.5 justify-items-center w-full">
                  {actions
                    .filter((a) => !a.label)
                    .map((btn) => (
                      <motion.div
                        key={btn.id}
                        variants={{
                          open: { opacity: 1, y: 0, scale: 1 },
                          closed: { opacity: 0, y: 10, scale: 0.8 },
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
                          ${
                            !btn.variant || btn.variant === 'secondary'
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
        <div className="w-full">
          <Button
            onClick={() => {
              clearTimer();
              setIsExpanded((prev) => !prev);
            }}
            variant="secondary"
            size="sm"
            mode="rectangle"
            style={{
              width: '100px',
              height: '32px',
            }}
            className="hover:scale-[1.02] active:scale-95 transition-all relative overflow-hidden flex items-center justify-center !bg-white border border-white/20 shadow-lg backdrop-blur-md !p-0 !rounded-[2px]"
            aria-label={isExpanded ? 'Menüyü Kapat' : 'Menüyü Aç'}
            icon={
              isExpanded ? (
                activeMainIcon || <Lucide.X size={14} className="text-stone-900" />
              ) : (
                mainIcon || <Lucide.Menu size={14} className="text-stone-900" />
              )
            }
          />
        </div>
      </div>
    </div>
  );
}
