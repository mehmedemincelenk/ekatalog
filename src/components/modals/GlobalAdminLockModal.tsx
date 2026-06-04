import * as Lucide from 'lucide-react';
import Button from '../ui/Button';

interface GlobalAdminLockModalProps {
  daysLeft: number;
  isSubscriptionExpired?: boolean;
}

export default function GlobalAdminLockModal({ daysLeft, isSubscriptionExpired }: GlobalAdminLockModalProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-stone-955/80 backdrop-blur-xl p-4">
      {/* Ultra-compact, mobile-first container */}
      <div className="bg-white rounded-[2rem] p-5 sm:p-6 max-w-sm w-full shadow-2xl text-center flex flex-col items-center border border-stone-100 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Kolaylık Odaklı Kısa Başlık */}
        <h2 className="text-lg sm:text-xl font-black text-stone-900 mb-2 tracking-tight mt-2">
          {isSubscriptionExpired ? 'Ödemeniz Alınamadı' : 'Dijital Dönüşümünüz Devam Etsin ⚡'}
        </h2>
        
        {/* Tek Cümlelik Net Açıklama */}
        <p className="text-stone-500 text-xs sm:text-sm mb-4 max-w-[280px]">
          {isSubscriptionExpired 
            ? 'Abonelik ödemesi alınamadı. Yönetim kolaylığını kesintisiz sürdürmek için yenileyin.' 
            : 'Deneme süreniz doldu. Yönetim kolaylığını kesintisiz sürdürmek için aboneliğinizi başlatın.'
          }
        </p>

        {/* Çok Kısa, Esnaf Dostu Bilgi Alanı */}
        <div className="bg-amber-50/80 border border-amber-200/50 rounded-xl p-3 w-full mb-4 text-left flex gap-2.5 items-center text-[10px] sm:text-xs">
          <Lucide.Info size={16} className="text-amber-600 shrink-0" />
          <p className="text-amber-800 leading-snug">
            İşleriniz aksamasın diye vitrininiz <strong>{daysLeft} gün daha</strong> açık kalacaktır.
          </p>
        </div>

        {/* CTA Butonları */}
        <div className="w-full">
          <Button
            variant="action"
            size="lg"
            className="w-full h-11 text-xs font-black tracking-wider uppercase flex items-center justify-center"
            onClick={() => {
              const text = isSubscriptionExpired
                ? 'Merhaba, ekatalog aboneliğimi yenilemek istiyorum.'
                : 'Merhaba, ekatalog aboneliğimi başlatmak istiyorum.';
              window.open(`https://wa.me/905555555555?text=${encodeURIComponent(text)}`, '_blank');
            }}
            icon={<Lucide.Zap size={16} className="shrink-0" />}
          >
            <span>KOLAYCA ABONE OL</span>
          </Button>
          
          {/* Klasik Yazı Fontuyla Sade Fiyat Bilgisi */}
          <p className="text-stone-500 text-[10.5px] tracking-wide font-normal mt-2">
            Aylık ₺199 <span className="text-stone-400">(Yıllık ödemede ₺150/ay)</span>
          </p>
        </div>
      </div>
    </div>
  );
}

