// FILE ROLE: Secure PIN Update Modal UI (Diamond Standard)
// DEPENDS ON: useSettingsHub, BaseModal, StatusOverlay
// CONSUMED BY: AppModals.tsx, DisplaySettingsModal.tsx
import React, { useState } from 'react';
import BaseModal from './BaseModal';
import Button from '../ui/Button';
import * as Lucide from 'lucide-react';
import StatusOverlay from '../ui/StatusOverlay';
import { useSettings } from '../../hooks/useSettingsHub';
import { useStore } from '../../store';

interface ChangePinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePinModal({ isOpen, onClose }: ChangePinModalProps) {
  const { isAdmin } = useStore();
  const { changePin } = useSettings(isAdmin);

  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [shake, setShake] = useState(false);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading) return;

    // Validation
    if (!/^\d{4}$/.test(currentPin)) {
      triggerError('Mevcut şifre 4 haneli bir sayı olmalıdır.');
      return;
    }
    if (!/^\d{4}$/.test(newPin)) {
      triggerError('Yeni şifre 4 haneli bir sayı olmalıdır.');
      return;
    }
    if (newPin !== confirmPin) {
      triggerError('Yeni şifreler eşleşmiyor.');
      return;
    }
    if (currentPin === newPin) {
      triggerError('Yeni şifre mevcut şifre ile aynı olamaz.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      await changePin(currentPin, newPin);
      setStatus('success');
      // Update local storage PIN so they don't get logged out instantly
      const setAdminPin = useStore.getState().setAdminPin;
      setAdminPin(newPin);
      setTimeout(() => {
        setStatus('idle');
        onClose();
        // Reset form
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      triggerError(err.message || 'Şifre güncellenemedi. Mevcut şifreyi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setStatus('error');
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const footer = (
    <div className="flex gap-3 w-full">
      <Button
        onClick={onClose}
        variant="secondary"
        mode="rectangle"
        className="w-16 h-16 shrink-0"
      >
        <Lucide.ChevronLeft size={24} strokeWidth={4} />
      </Button>
      <Button
        onClick={() => handleSave()}
        variant="action"
        disabled={loading || !currentPin || !newPin || !confirmPin}
        className="flex-1 h-16 !rounded-[24px]"
        showFingerprint={true}
      >
        {loading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <span className="text-[12px] font-black uppercase tracking-wider text-white">TAMAM</span>
        )}
      </Button>
    </div>
  );

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        maxWidth="max-w-sm"
        footer={footer}
      >
        <div className={`p-4 space-y-6 ${shake ? 'animate-shake' : ''}`}>
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Lucide.Lock size={20} />
            </div>
            <h4 className="text-lg font-serif italic text-stone-900 pl-1">
              Yönetici Şifresini Değiştir
            </h4>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest pl-1">
              Güvenliğiniz için 4 haneli PIN
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex flex-col gap-1 relative">
              <label className="text-[10px] font-bold text-stone-400 absolute -top-2 left-3 bg-white px-1 z-10">
                Mevcut Şifre
              </label>
              <input
                type="password"
                pattern="\d*"
                maxLength={4}
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                className="w-full h-12 px-3 border border-stone-200 rounded-xl focus:border-stone-950 focus:outline-none text-center text-lg font-black tracking-[0.5em] bg-stone-50/30"
                placeholder="••••"
                required
              />
            </div>

            <div className="flex flex-col gap-1 relative">
              <label className="text-[10px] font-bold text-stone-400 absolute -top-2 left-3 bg-white px-1 z-10">
                Yeni Şifre
              </label>
              <input
                type="password"
                pattern="\d*"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                className="w-full h-12 px-3 border border-stone-200 rounded-xl focus:border-stone-950 focus:outline-none text-center text-lg font-black tracking-[0.5em] bg-stone-50/30"
                placeholder="••••"
                required
              />
            </div>

            <div className="flex flex-col gap-1 relative">
              <label className="text-[10px] font-bold text-stone-400 absolute -top-2 left-3 bg-white px-1 z-10">
                Yeni Şifre (Tekrar)
              </label>
              <input
                type="password"
                pattern="\d*"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                className="w-full h-12 px-3 border border-stone-200 rounded-xl focus:border-stone-950 focus:outline-none text-center text-lg font-black tracking-[0.5em] bg-stone-50/30"
                placeholder="••••"
                required
              />
            </div>
          </form>

          {/* Error Message */}
          {status === 'error' && errorMessage && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-700">
              <Lucide.AlertCircle size={18} className="shrink-0" />
              <span className="text-[10px] font-bold leading-relaxed">{errorMessage}</span>
            </div>
          )}
        </div>
      </BaseModal>

      {/* Success/Error Overlay */}
      <StatusOverlay
        status={status === 'success' ? 'success' : status === 'error' ? 'error' : 'idle'}
        message={status === 'success' ? 'Şifre başarıyla güncellendi!' : errorMessage}
        onClose={() => setStatus('idle')}
      />
    </>
  );
}
