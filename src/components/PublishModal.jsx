import React, { useState } from 'react';
import { useTenant } from '../hooks/useTenant';

export default function PublishModal({ onClose }) {
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setIsSubmitting(true);

    // Simüle edilmiş API isteği (WhatsApp mesajı gönderme)
    setTimeout(() => {
      console.log(`[MOCK] WhatsApp mesajı gönderildi -> No: ${phone}`);
      setIsSubmitting(false);
      setIsSuccess(true);

      // Gerçek senaryoda burada sunucudan gelen slug ile yönlendirme yapılır
      // window.location.href = `http://${yeniSlug}.ekatalog.co`;
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 transform transition-all">

        {!isSuccess ? (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚀</span>
              </div>
              <h2 className="text-2xl font-semibold text-stone-900 mb-2" style={{ letterSpacing: '-0.02em' }}>
                Kataloğunuz Hazır!
              </h2>
              <p className="text-[15px] text-stone-500 leading-relaxed">
                Size dükkan linkinizi ve yönetim bilgilerinizi gönderebilmemiz için lütfen WhatsApp numaranızı girin.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div>
                <label className="block text-[13px] font-medium text-stone-700 mb-2">WhatsApp Numarası</label>
                <input
                  type="tel"
                  placeholder="05XX XXX XX XX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-[16px] text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 px-4 rounded-xl text-[15px] font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !phone.trim()}
                  className="flex-[2] py-3.5 px-4 rounded-xl text-[15px] font-semibold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                >
                  {isSubmitting ? 'Onaylanıyor...' : 'DÜKKANIMI YAYINLA'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl text-green-500">✓</span>
            </div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3" style={{ letterSpacing: '-0.02em' }}>
              Tebrikler, Dükkanınız Kuruldu!
            </h2>
            <p className="text-[16px] text-stone-600 leading-relaxed mb-8">
              Onay mesajını ve dükkan linkinizi WhatsApp'tan ilettik. Lütfen telefonunuzu kontrol edin.
            </p>
            <button
              onClick={onClose}
              className="w-full py-4 px-4 rounded-xl text-[16px] font-semibold text-white bg-stone-900 hover:bg-stone-800 transition-all shadow-md"
            >
              Tamam
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
