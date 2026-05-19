import { useState } from 'react';

export function usePinFlow(
  onVerify: (pin: string) => Promise<boolean>,
  onAuthenticationSuccess: () => void,
  isLockedOut: boolean,
  failedAttempts: number = 0,
  initialStep?: number,
) {
  const [overrideIsLockedOut, setOverrideIsLockedOut] = useState<boolean | undefined>();
  const [overrideFailedAttempts, setOverrideFailedAttempts] = useState<number | undefined>();
  const activeIsLockedOut = overrideIsLockedOut !== undefined ? overrideIsLockedOut : isLockedOut;
  const activeFailedAttempts = overrideFailedAttempts !== undefined ? overrideFailedAttempts : failedAttempts;

  const [currentPinAttempt, setCurrentPinAttempt] = useState('');
  const [hasAuthError, setHasAuthError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRobotVerified, setIsRobotVerified] = useState(false);

  const requiresCaptcha = activeFailedAttempts >= 2;
  const isInputDisabled = activeIsLockedOut || isVerifying || (requiresCaptcha && !isRobotVerified);

  const [prevInitialStep, setPrevInitialStep] = useState(initialStep);
  if (initialStep !== prevInitialStep) {
    setPrevInitialStep(initialStep);
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

  const handleDigitEntry = async (digit: string) => {
    if (isInputDisabled || currentPinAttempt.length >= 4) return;
    const newAttempt = currentPinAttempt + digit;
    setCurrentPinAttempt(newAttempt);
    if (newAttempt.length === 4) {
      setIsVerifying(true);
      if (await onVerify(newAttempt)) {
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

  return {
    activeIsLockedOut,
    activeFailedAttempts,
    currentPinAttempt,
    setCurrentPinAttempt,
    hasAuthError,
    isVerifying,
    isRobotVerified,
    setIsRobotVerified,
    requiresCaptcha,
    isInputDisabled,
    handleDigitEntry,
  };
}
