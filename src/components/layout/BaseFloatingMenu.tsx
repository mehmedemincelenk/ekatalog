import { useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  dividerAfter?: boolean; // If true, render a premium thin border/line underneath this action
}

interface BaseFloatingMenuProps {
  actions: FloatingAction[];
  autoCloseDelay?: number;
  mainIcon?: ReactNode;
  activeMainIcon?: ReactNode;
  isPrimaryToggle?: boolean;
  labelText?: string;
  theme?: 'light' | 'dark'; // Diamond: Support multiple visual identities
  onPointerDown?: () => void;
  onPointerUp?: () => void;
  forceExpanded?: boolean;
  isPreview?: boolean;
  onMasterClick?: () => void;
}

export default function BaseFloatingMenu({
  actions,
  autoCloseDelay = 5000,
  mainIcon,
  activeMainIcon,
  labelText,
  onPointerDown,
  onPointerUp,
  forceExpanded = false,
  isPreview = false,
  onMasterClick,
}: BaseFloatingMenuProps) {
  const [isExpandedState, setIsExpandedState] = useState(false);
  const isExpanded = actions.length > 0 && (forceExpanded || isExpandedState);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pointerDownTime = useRef(0);

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
      setIsExpandedState(false);
    } else {
      // Refresh the auto-close timer for persistent actions
      if (!forceExpanded) {
        timerRef.current = setTimeout(() => setIsExpandedState(false), autoCloseDelay);
      }
    }
  };

  useEffect(() => {
    if (forceExpanded) return;

    const handleClickOutside = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsExpandedState(false);
      }
    };

    if (isExpandedState) {
      document.addEventListener('pointerdown', handleClickOutside);
      clearTimer();
      timerRef.current = setTimeout(() => setIsExpandedState(false), autoCloseDelay);
    } else {
      document.removeEventListener('pointerdown', handleClickOutside);
      clearTimer();
    }

    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      clearTimer();
    };
  }, [isExpandedState, autoCloseDelay, clearTimer, forceExpanded]);

  return (
    <div
      ref={containerRef}
      className={`z-[100] ${isPreview ? 'origin-top-left' : 'origin-bottom-right'}`}
      style={isPreview ? undefined : { transform: 'scale(0.95)' }}
    >
      <div
        className={`flex flex-col items-center rounded-2xl overflow-hidden bg-black/55 border border-white/10 ${
          isPreview ? '' : 'shadow-[0_20px_50px_rgba(0,0,0,0.4)]'
        }`}
        style={{
          width: '110px',
          padding: '5px',
          gap: '6px',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
        }}
      >
        {/* ACTION CLUSTER (Above toggle, no gap) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              key="action-cluster"
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="w-full flex flex-col items-center overflow-hidden"
            >
              <div className="flex flex-col gap-1.5 items-center w-full">
                {/* LABELED ACTIONS */}
                {actions.some((a) => a.label) && (
                  <div className="flex flex-col gap-1 items-center w-full">
                    {actions
                      .filter((a) => a.label)
                      .map((btn) => (
                        <div key={btn.id} className="w-full flex flex-col items-center">
                          <Button
                            onClick={() => handleAction(btn)}
                            icon={btn.icon}
                            variant={btn.variant === 'secondary' ? 'ghost' : (btn.variant || 'ghost')}
                            size="sm"
                            mode="rectangle"
                            className={`
                            shrink-0 !rounded-lg ${btn.className || ''} w-full !justify-center px-1 gap-2 h-[40px] !text-white [transition-property:transform] backdrop-blur-md !shadow-none
                            ${
                              !btn.variant || btn.variant === 'secondary' || btn.variant === 'ghost'
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
                          {btn.dividerAfter && (
                            <div className="w-[85%] h-[1px] bg-white/15 my-1.5 shrink-0" />
                          )}
                        </div>
                      ))}
                  </div>
                )}

                {/* ICON ACTIONS GRID */}
                <div className="grid grid-cols-2 gap-1.5 justify-items-center w-full">
                  {actions
                    .filter((a) => !a.label)
                    .map((btn) => (
                      <div key={btn.id} className="w-full">
                        <Button
                          onClick={() => handleAction(btn)}
                          icon={btn.icon}
                          variant={btn.variant === 'secondary' ? 'ghost' : (btn.variant || 'ghost')}
                          size="sm"
                          mode="square"
                          className={`
                          shrink-0 !rounded-lg ${btn.className || ''} w-full aspect-square h-auto !p-0 !text-white [transition-property:transform] backdrop-blur-md !shadow-none
                          ${
                            !btn.variant || btn.variant === 'secondary' || btn.variant === 'ghost'
                              ? '!bg-white/10 !border-white/10 hover:!bg-white/20'
                              : 'hover:scale-[1.05]'
                          }
                        `}
                        />
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MASTER TOGGLE */}
        <div className="w-full flex">
          <div
            onClick={() => {
              clearTimer();
              const pressDuration = Date.now() - pointerDownTime.current;
              if (pressDuration > 800) {
                // It was a long press, ignore the normal click toggle!
                return;
              }
              if (actions.length === 0) {
                onMasterClick?.();
              } else {
                setIsExpandedState((prev) => !prev);
              }
            }}
            onPointerDown={() => {
              pointerDownTime.current = Date.now();
              onPointerDown?.();
            }}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            role="button"
            tabIndex={0}
            style={{
              width: '100px',
              height: '32px',
              touchAction: 'none',
            }}
            className="hover:scale-[1.02] active:scale-95 transition-all relative overflow-hidden flex items-center justify-center bg-white border border-white/20 shadow-lg backdrop-blur-md p-0 rounded-xl cursor-pointer outline-none select-none px-2 gap-1"
            aria-label={isExpanded ? 'Menüyü Kapat' : 'Menüyü Aç'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                clearTimer();
                if (actions.length === 0) {
                  onMasterClick?.();
                } else {
                  setIsExpandedState((prev) => !prev);
                }
              }
            }}
          >
            {isExpanded ? (
              activeMainIcon || <Lucide.ChevronDown size={16} className="text-stone-900 animate-in fade-in" strokeWidth={2.5} />
            ) : (
              <div className="flex items-center gap-1 text-stone-900 justify-center w-full h-full">
                {mainIcon || <Lucide.Menu size={16} strokeWidth={2.5} />}
                {labelText && (
                  <span className="text-[10px] font-black tracking-wider uppercase leading-none truncate max-w-[65px]">{labelText}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
