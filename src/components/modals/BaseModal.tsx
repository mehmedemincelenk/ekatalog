// FILE ROLE: Foundation Component for all Modals (Diamond Standard)
// DEPENDS ON: framer-motion, THEME tokens
// CONSUMED BY: AddProductModal, EditProdCard, etc.

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Lucide from 'lucide-react';
import { createPortal } from 'react-dom';
import Button from '../ui/Button';

import { BaseModalProps } from '../../types';
import { useModalBehavior } from '../../hooks/useCommon';

interface ExtendedBaseModalProps extends BaseModalProps {
  leftNav?: React.ReactNode;
  rightNav?: React.ReactNode;
  navY?: 'center' | 'bottom';
  accentColor?: string;
  position?: 'center' | 'bottom-right';
}

export default function BaseModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  icon,
  maxWidth = 'max-w-md',
  disableClickOutside = false,
  isStatic = false,
  leftNav,
  rightNav,
  navY = 'center',
  accentColor = 'bg-emerald-500',
  position = 'center',
  className = '',
  hideCloseButton = false,
  progress,
  footer,
  noPadding = false,
}: ExtendedBaseModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = React.useId();
  const descId = React.useId();

  // 1. MODULAR ORCHESTRATION (Diamond UI Hooks)
  useModalBehavior(isOpen, modalRef as React.RefObject<HTMLElement>, onClose, disableClickOutside, isStatic);

  const handleBackdropClick = () => {
    if (!disableClickOutside) {
      onClose();
    }
  };

  if (typeof document === 'undefined') return null;

  const content = (
    <AnimatePresence>
      {isOpen && (
        <div className={isStatic ? "relative z-0" : `fixed inset-0 z-[200] flex ${position === 'bottom-right' ? 'items-end justify-end p-4' : 'items-start sm:items-center justify-center p-4 pt-16 sm:pt-4'} print:p-0 print:block print:relative print:z-auto`}>
          {/* BACKDROP */}
          {!isStatic && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleBackdropClick}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm print:hidden"
            />
          )}

          {/* MODAL CONTAINER */}
          <motion.div
            ref={modalRef}
            initial={isStatic ? undefined : { opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={isStatic ? undefined : { opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`
              relative w-full ${maxWidth} mx-auto
              rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] 
              flex flex-col max-h-[85vh] 
              print:max-h-none print:shadow-none print:border-none print:w-full print:max-w-full print:rounded-none
              ${className}
            `}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={subtitle ? descId : undefined}
            tabIndex={-1}
          >
            {/* NAVIGATION CONTROLS (Diamond Corner/Edge Positioning) */}
            {leftNav && (
              <div className={`absolute z-[70] shrink-0 print:hidden -left-10 ${
                navY === 'bottom' ? 'bottom-[3.2rem]' : 'top-1/2 -translate-y-1/2'
              }`}>
                {leftNav}
              </div>
            )}
            {rightNav && (
              <div className={`absolute z-[70] shrink-0 print:hidden -right-5 ${
                navY === 'bottom' ? 'bottom-[3.2rem]' : 'top-1/2 -translate-y-1/2'
              }`}>
                {rightNav}
              </div>
            )}

            {/* CLOSE BUTTON (Diamond Corner Position - Outside Overflow) */}
            {!hideCloseButton && (
              <div className="absolute -top-2 -right-2 z-[70] shrink-0 print:hidden">
                <Button
                  onClick={onClose}
                  variant="secondary"
                  size="sm"
                  mode="circle"
                  className="relative !bg-white !text-stone-900/50 hover:!text-stone-900 hover:!bg-stone-50 shadow-xl border-2 border-stone-100 w-8 h-8 flex items-center justify-center transition-all hover:scale-110 active:scale-90 before:content-[''] before:absolute before:-inset-2 before:z-[-1]"
                  icon={<Lucide.X size={16} strokeWidth={3} />}
                  title="Kapat"
                />
              </div>
            )}

            {/* CONTENT WRAPPER (Preserves Corner Masking) */}
            <div className="bg-white rounded-3xl overflow-hidden flex flex-col flex-1 border border-stone-100 relative">
              {/* HEADER AREA */}
              {(title || icon) && !progress && (
                <div className="flex flex-col items-start mt-6 px-6 text-left shrink-0 print:hidden">
                  {icon && (
                    <div className="w-16 h-16 bg-stone-50 text-stone-500 rounded-full flex items-center justify-center text-3xl mb-4 border border-stone-100 shadow-inner">
                      {icon}
                    </div>
                  )}
                  {title && (
                    <h3
                      id={titleId}
                      className="text-xl font-black text-stone-900 uppercase tracking-tight leading-tight"
                    >
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p
                      id={descId}
                      className="text-[11px] font-bold text-stone-400 mt-2"
                    >
                      {subtitle}
                    </p>
                  )}
                </div>
              )}

              {/* WIZARD HEADER (Title + Progress Dots) */}
              {progress && (
                <div className="flex items-center justify-between p-5 border-b border-stone-100 bg-stone-50/50 print:hidden shrink-0">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 mb-4">
                      {Array.from({ length: progress.total }).map((_, idx) => {
                        const stepNumber = idx + 1;
                        const isActive = progress.current >= stepNumber;
                        return (
                          <div
                            key={stepNumber}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              isActive ? `${accentColor} w-6` : 'bg-stone-200 w-3'
                            }`}
                          />
                        );
                      })}
                    </div>
                    {title && (
                      <h3 className="text-[15px] font-black text-stone-900 uppercase tracking-widest leading-none">
                        {title}
                      </h3>
                    )}
                    {subtitle && (
                      <p className="text-[10px] font-bold text-stone-400 mt-2">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* SCROLLABLE BODY */}
              <div className={`flex-1 overflow-y-auto print:overflow-visible custom-scrollbar print:h-auto ${noPadding ? '' : 'px-6 py-6'}`}>
                {children}
              </div>

              {/* FOOTER ACTIONS */}
              {footer && (
                <div className="p-4 border-t border-stone-100 bg-stone-50/50 print:hidden shrink-0 mt-auto">
                  {footer}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const portalTarget = (typeof document !== 'undefined' && document.getElementById('mobile-viewport')) || document.body;
  return isStatic ? content : createPortal(content, portalTarget);
}
