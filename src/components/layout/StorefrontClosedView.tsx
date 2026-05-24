import * as Lucide from 'lucide-react';

export default function StorefrontClosedView() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-stone-200 text-stone-400 rounded-full flex items-center justify-center mb-6">
        <Lucide.Store size={48} strokeWidth={2} />
      </div>
      <h1 className="text-3xl font-black text-stone-900 mb-4 tracking-tight">
        Katalog Aktif Değil
      </h1>
      <p className="text-stone-500 max-w-md mx-auto leading-relaxed">
        Bu E-Katalog mağazası şu anda hizmet vermemektedir.
      </p>
    </div>
  );
}
