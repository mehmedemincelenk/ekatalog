// FILE ROLE: Foundation Component for all Modals (Diamond Standard)
// DEPENDS ON: framer-motion, THEME tokens
// CONSUMED BY: AddProductModal, EditProdCard, etc.

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Lucide from 'lucide-react';
import { createPortal } from 'react-dom';
import Button from '../ui/Button';

import { BaseModalProps } from '../../types';
import { useModalBehavior } from '../../hooks/useCommon';
import { ANIMATIONS } from '../../data/config/theme';

interface ExtendedBaseModalProps extends BaseModalProps {
  leftNav?: React.ReactNode;
  rightNav?: React.ReactNode;
  navY?: 'center' | 'bottom';
  accentColor?: string;
  position?: 'center' | 'bottom-right';
  centerHeader?: boolean;
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
  centerHeader = false,
}: ExtendedBaseModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = React.useId();
  const descId = React.useId();

  // 1. MODULAR ORCHESTRATION (Diamond UI Hooks)
  useModalBehavior(
    isOpen,
    modalRef as React.RefObject<HTMLElement>,
    onClose,
    disableClickOutside,
    isStatic,
  );

  const handleBackdropClick = () => {
    if (!disableClickOutside) {
      onClose();
    }
  };

  if (typeof document === 'undefined') return null;

  const content = (
    <AnimatePresence>
      {isOpen && (
        <div
          className={
            isStatic
              ? 'relative z-0'
              : `fixed inset-0 z-[200] flex ${position === 'bottom-right' ? 'items-end justify-end p-4' : 'items-center justify-center p-4'} print:p-0 print:block print:relative print:z-auto`
          }
        >
          {/* BACKDROP */}
          {!isStatic && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleBackdropClick}
              className="absolute inset-0 bg-stone-950/10 backdrop-blur-sm print:hidden"
            />
          )}

          {/* MODAL CONTAINER */}
          <motion.div
            ref={modalRef}
            initial={isStatic ? undefined : ANIMATIONS.modal.initial}
            animate={isStatic ? undefined : ANIMATIONS.modal.animate}
            exit={isStatic ? undefined : ANIMATIONS.modal.exit}
            transition={isStatic ? undefined : ANIMATIONS.modal.transition}
            onClick={(e) => e.stopPropagation()}
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
              <div
                className={`absolute z-[70] shrink-0 print:hidden -left-10 ${
                  navY === 'bottom'
                    ? 'bottom-[3.2rem]'
                    : 'top-1/2 -translate-y-1/2'
                }`}
              >
                {leftNav}
              </div>
            )}
            {rightNav && (
              <div
                className={`absolute z-[70] shrink-0 print:hidden -right-5 ${
                  navY === 'bottom'
                    ? 'bottom-[3.2rem]'
                    : 'top-1/2 -translate-y-1/2'
                }`}
              >
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
                  className="relative !bg-white/80 backdrop-blur-md !text-stone-900/60 hover:!text-stone-900 hover:!bg-white shadow-lg border border-white/30 w-8 h-8 flex items-center justify-center transition-all hover:scale-110 active:scale-90 before:content-[''] before:absolute before:-inset-2 before:z-[-1]"
                  icon={<Lucide.X size={16} strokeWidth={3} />}
                  title="Kapat"
                />
              </div>
            )}

            {/* CONTENT WRAPPER (Preserves Corner Masking) */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col flex-1 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] relative">
              {/* HEADER AREA */}
              {(title || icon) && !progress && (
                <div
                  className={`flex flex-col mt-6 px-6 shrink-0 print:hidden ${
                    centerHeader
                      ? 'items-center text-center'
                      : 'items-start text-left'
                  }`}
                >
                  {icon && (
                    <div className="w-16 h-16 bg-stone-50 text-stone-500 rounded-full flex items-center justify-center text-3xl mb-4 border border-stone-100 shadow-inner">
                      {icon}
                    </div>
                  )}
                  {title && (
                    <h3
                      id={titleId}
                      className="text-xl font-black text-stone-900 uppercase tracking-tight leading-tight w-full"
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
                <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/20 print:hidden shrink-0">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 mb-4">
                      {Array.from({ length: progress.total }).map((_, idx) => {
                        const stepNumber = idx + 1;
                        const isActive = progress.current >= stepNumber;
                        return (
                          <div
                            key={stepNumber}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              isActive
                                ? `${accentColor} w-6`
                                : 'bg-stone-200 w-3'
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
              <div
                className={`flex-1 overflow-y-auto print:overflow-visible custom-scrollbar print:h-auto ${noPadding ? '' : 'px-6 py-6'}`}
              >
                {children}
              </div>

              {/* FOOTER ACTIONS */}
              {footer && (
                <div className="p-4 border-t border-white/10 bg-white/20 print:hidden shrink-0 mt-auto">
                  {footer}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const portalTarget =
    (typeof document !== 'undefined' &&
      document.getElementById('mobile-viewport')) ||
    document.body;
  return isStatic ? content : createPortal(content, portalTarget);
}
