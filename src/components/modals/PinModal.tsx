import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEME } from '../../data/config';
import Turnstile from '../ui/Turnstile';
import Button from '../ui/Button';

import { PinModalProps } from '../../types';

const PIN_LENGTH = 4;

export default function PinModal({
  isModalOpen,
  onVerify,
  onAuthenticationSuccess,
  onModalClose,
  isLockedOut,
  failedAttempts = 0,
  isStatic = false,
  initialStep,
}: PinModalProps) {
  const [overrideIsLockedOut, setOverrideIsLockedOut] = useState<boolean | undefined>();
  const [overrideFailedAttempts, setOverrideFailedAttempts] = useState<number | undefined>();

  const activeIsLockedOut = overrideIsLockedOut !== undefined ? overrideIsLockedOut : isLockedOut;
  const activeFailedAttempts = overrideFailedAttempts !== undefined ? overrideFailedAttempts : failedAttempts;

  const [currentPinAttempt, setCurrentPinAttempt] = useState('');
  const [hasAuthError, setHasAuthError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRobotVerified, setIsRobotVerified] = useState(false);

  const requiresCaptcha = activeFailedAttempts >= 2;
  const isInputDisabled =
    activeIsLockedOut || isVerifying || (requiresCaptcha && !isRobotVerified);

  const theme = THEME.pinModal;
  const globalIcons = THEME.icons;

  // Workspace Sync
  useState(() => {
    if (initialStep !== undefined) {
      if (initialStep === 1) {
        setOverrideIsLockedOut(false);
        setOverrideFailedAttempts(0);
      } else if (initialStep === 2) {
        setOverrideIsLockedOut(false);
        setOverrideFailedAttempts(2);
      } else if (initialStep === 3) {
        setOverrideIsLockedOut(true);
        setOverrideFailedAttempts(0);
      }
    }
  });

  // Handle prop changes (important for workspace buttons)
  if (initialStep !== undefined) {
    if (initialStep === 1 && (activeIsLockedOut || activeFailedAttempts !== 0)) {
      setOverrideIsLockedOut(false);
      setOverrideFailedAttempts(0);
    } else if (initialStep === 2 && (activeIsLockedOut || activeFailedAttempts !== 2)) {
      setOverrideIsLockedOut(false);
      setOverrideFailedAttempts(2);
    } else if (initialStep === 3 && !activeIsLockedOut) {
      setOverrideIsLockedOut(true);
      setOverrideFailedAttempts(0);
    }
  }

  const [prevIsOpen, setPrevIsOpen] = useState(isModalOpen);
  if (isModalOpen !== prevIsOpen) {
    setPrevIsOpen(isModalOpen);
    if (!isModalOpen) {
      setCurrentPinAttempt('');
      setHasAuthError(false);
    }
  }

  const handleDigitEntry = async (digit: string) => {
    if (isInputDisabled || currentPinAttempt.length >= PIN_LENGTH) return;

    const newAttempt = currentPinAttempt + digit;
    setCurrentPinAttempt(newAttempt);
    setHasAuthError(false);

    if (newAttempt.length === PIN_LENGTH) {
      setIsVerifying(true);
      const isValid = await onVerify(newAttempt);

      if (isValid) {
        onAuthenticationSuccess();
      } else {
        setHasAuthError(true);
        setTimeout(() => {
          setCurrentPinAttempt('');
          setHasAuthError(false);
        }, 600);
      }
      setIsVerifying(false);
    }
  };

  const handleDeleteDigit = () => {
    if (isInputDisabled) return;
    setCurrentPinAttempt((prev) => prev.slice(0, -1));
  };

  return (
    <motion.div
      initial={isStatic ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={isStatic ? "relative z-0" : `${theme.overlay} z-[10000]`}
    >
      <motion.div
        initial={isStatic ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
        transition={{ 
          type: 'spring', 
          damping: 25, 
          stiffness: 300,
          duration: 0.4
        }}
        className={`${isStatic ? "relative w-full max-w-sm mx-auto" : theme.container} ${hasAuthError ? theme.animations.shake : ''}`}
      >
        <AnimatePresence mode="wait">
          {requiresCaptcha && !isRobotVerified ? (
            /* CAPTCHA VIEW (ISOLATED) */
            <motion.div
              key="captcha"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center justify-center min-h-[320px] w-full"
            >
              <span className="text-[10px] font-black tracking-[0.4em] text-white/40 uppercase mb-10">
                GÜVENLİK DOĞRULAMASI
              </span>
              <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/10 shadow-2xl">
                <Turnstile
                  onVerify={() => setIsRobotVerified(true)}
                  options={{ theme: 'dark', size: 'normal' }}
                />
              </div>
              <Button
                onClick={onModalClose}
                variant="ghost"
                className="mt-10 text-white/30 hover:text-white font-black text-[10px] tracking-[0.2em] uppercase transition-colors"
              >
                İPTAL ET
              </Button>
            </motion.div>
          ) : (
            /* PIN VIEW (DOTS + KEYBOARD) */
            <motion.div
              key="pin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              {/* HEADER SECTION (Icon Only) */}
              <div className="flex flex-col items-center justify-center h-20 shrink-0 mb-4">
                <div className={theme.headerIconWrapper + ' !mb-0'}>
                  <div className={theme.headerIconSize}>
                    {isVerifying ? (
                      <div className={THEME.loading.spinner + ' w-5 h-5'} />
                    ) : activeIsLockedOut ? (
                      '⏳'
                    ) : (
                      globalIcons.lock
                    )}
                  </div>
                </div>
              </div>

              {/* DOTS INDICATOR */}
              <div className={theme.dotsWrapper}>
                {[...Array(PIN_LENGTH)].map((_, i) => (
                  <div
                    key={i}
                    className={`
                      ${theme.dotBase} 
                      ${i < currentPinAttempt.length ? (isVerifying && !hasAuthError ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : theme.dotActive) : theme.dotInactive}
                      ${hasAuthError ? theme.dotError : ''}
                    `}
                  />
                ))}
              </div>

              {/* KEYBOARD GRID */}
              <div
                className={`${theme.keyboardGrid} ${isInputDisabled ? 'opacity-30 pointer-events-none grayscale' : 'transition-all duration-500'}`}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <Button
                    key={num}
                    disabled={isInputDisabled}
                    onClick={() => handleDigitEntry(String(num))}
                    className={theme.keyButton}
                    variant="secondary"
                    mode="circle"
                  >
                    <span className={theme.typography.keyText}>{num}</span>
                  </Button>
                ))}

                <Button
                  onClick={onModalClose}
                  variant="ghost"
                  mode="rectangle"
                  className={theme.cancelButton}
                >
                  İPTAL
                </Button>
                <Button
                  disabled={isInputDisabled}
                  onClick={() => handleDigitEntry('0')}
                  className={theme.keyButton}
                  variant="secondary"
                  mode="circle"
                >
                  <span className={theme.typography.keyText}>0</span>
                </Button>
                <Button
                  disabled={isInputDisabled}
                  onClick={handleDeleteDigit}
                  variant="ghost"
                  mode="circle"
                  className={theme.deleteButton}
                  icon={
                    <div className={theme.deleteIconSize}>
                      {globalIcons.backspace}
                    </div>
                  }
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
