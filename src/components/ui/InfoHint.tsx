import { useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

import { InfoHintProps } from '../../types';

/**
 * INFOHINT COMPONENT (Diamond Guidance)
 * -----------------------------------------------------------
 * A sophisticated "?" button that reveals context-rich tooltips via Portal.
 */
export default function InfoHint({
  message,
  className = '',
  position = 'top',
}: InfoHintProps) {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  }, [isVisible]);

  const getPositionStyles = () => {
    const spacing = 8;
    switch (position) {
      case 'top':
        return {
          top: coords.top - spacing,
          left: coords.left + 12, // 12 is half of button width
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          top: coords.top + 24 + spacing,
          left: coords.left + 12,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        return {
          top: coords.top + 12,
          left: coords.left - spacing,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          top: coords.top + 12,
          left: coords.left + 24 + spacing,
          transform: 'translate(0, -50%)',
        };
      default:
        return {};
    }
  };

  return (
    <div
      ref={triggerRef}
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      <Button
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible((prev) => !prev);
        }}
        variant="ghost"
        mode="circle"
        size="sm"
        className="!p-1 !w-6 !h-6 shadow-none border-none !text-blue-500 hover:!bg-blue-50 transition-colors"
        icon={<HelpCircle size={14} strokeWidth={2.5} />}
      />

      <AnimatePresence>
        {isVisible &&
          createPortal(
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                position: 'absolute',
                ...getPositionStyles(),
                zIndex: 9999,
              }}
              className="w-48 p-3 rounded-2xl bg-stone-900 text-white text-[10px] font-bold leading-relaxed shadow-2xl pointer-events-none text-center"
            >
              {message}
              {/* TOOLTIP ARROW */}
              <div
                className={`
                  absolute w-2 h-2 bg-stone-900 rotate-45
                  ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' : ''}
                  ${position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' : ''}
                  ${position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' : ''}
                  ${position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' : ''}
                `}
              />
            </motion.div>,
            document.body,
          )}
      </AnimatePresence>
    </div>
  );
}
