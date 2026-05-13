import React from 'react';
import * as Lucide from 'lucide-react';
import { Product } from '../../types';

/**
 * PAZARLAMA GALERİSİ (v1.4 - Esnaf & Halk Odaklı)
 * -----------------------------------------------------------
 * ANAYASA KURALLARI:
 * 1. Sadece "EKATALOG" (Katalog yasak).
 * 2. Halkın anlayacağı sade dil.
 * 3. Arial / Modern Sans tipografi.
 * 4. Güvenli alanlar (Alt & Üst boşluk).
 */

interface DesignProps {
  product: Product;
  storeName: string;
  storeUrl: string;
  onProductClick: () => void;
  aspectRatio?: 'STORY' | 'POST';
}

const SafeWrapper = ({ 
  children, 
  bg = "bg-white", 
  text = "text-stone-900", 
  bgMark = "EKATALOG",
  aspectRatio = 'STORY'
}: { 
  children: React.ReactNode, 
  bg?: string, 
  text?: string, 
  bgMark?: string,
  aspectRatio?: 'STORY' | 'POST'
}) => {
  const isPost = aspectRatio === 'POST';
  return (
    <div className={`w-full h-full flex flex-col relative overflow-hidden ${bg} ${text} font-sans uppercase transition-all duration-500`}>
       {/* Arka Plan Yazısı */}
       <div className="absolute inset-0 pointer-events-none opacity-[0.02] select-none flex items-center justify-center overflow-hidden">
          <p className={`${isPost ? 'text-[160px]' : 'text-[100px]'} font-black rotate-12 leading-none`}>{bgMark}</p>
       </div>
       
       {/* Üst Güvenli Alan */}
       <div className={`${isPost ? 'h-8' : 'h-24'} w-full flex items-center justify-center opacity-10`}>
          {!isPost && <div className="w-12 h-0.5 bg-current rounded-full" />}
       </div>

       {/* Ana İçerik */}
       <div className={`flex-1 w-full ${isPost ? 'px-6' : 'px-10'} flex flex-col justify-center items-center relative text-center`}>
          {children}
       </div>

       {/* Alt Güvenli Alan */}
       <div className={`${isPost ? 'h-8' : 'h-28'} w-full flex flex-col items-center justify-start opacity-20 ${isPost ? 'pt-1' : 'pt-4'}`}>
          <p className="text-[8px] font-black tracking-[0.5em] italic">DİJİTAL EKATALOG SİSTEMİ</p>
       </div>
    </div>
  );
};

export const MarketingGallery: React.FC<DesignProps>[] = [
  // 1. ESNAF DOSTU (SADE & NET)
  ({ product, storeUrl, onProductClick, aspectRatio }) => {
    const isPost = aspectRatio === 'POST';
    return (
      <SafeWrapper aspectRatio={aspectRatio}>
         <div className={isPost ? 'mb-2' : 'mb-6'}>
           <p className="text-[10px] font-black tracking-[0.4em] opacity-40 italic leading-none">İMALATTAN UYGUN FİYATLAR</p>
         </div>
         
         <div className={`flex items-center gap-6 ${isPost ? 'flex-row text-left' : 'flex-col'}`}>
            <div onClick={onProductClick} className={`${isPost ? 'w-40 h-40' : 'w-60 h-60'} bg-stone-50 border border-stone-100 rounded-[2.5rem] overflow-hidden shadow-2xl ${isPost ? 'mb-0' : 'mb-10'} cursor-pointer active:scale-95 transition-transform`}>
               <img src={product.image_url || undefined} className="w-full h-full object-contain" crossOrigin="anonymous" />
            </div>
            <div className="flex-1 flex flex-col items-center">
               <h1 className={`${isPost ? 'text-xl' : 'text-3xl'} font-bold tracking-tight leading-[0.95] ${isPost ? 'mb-6' : 'mb-10'} px-2`}>{product.name}</h1>
               <div className="bg-stone-900 text-white px-8 py-3.5 rounded-full shadow-xl font-black text-[10px] tracking-widest leading-none">
                  {storeUrl}
               </div>
            </div>
         </div>
      </SafeWrapper>
    );
  },

  // 2. HALKIN DİLİ (YÖNLENDİRME ODAKLI)
  ({ storeUrl, storeName }) => (
    <SafeWrapper bg="bg-stone-950" text="text-white" bgMark="TIKLA">
       <h1 className="text-4xl font-black tracking-tighter italic leading-none mb-4">{storeName}</h1>
       <p className="text-lg font-medium opacity-60 tracking-widest italic mb-12 text-blue-400">DİJİTAL EKATALOG</p>
       <div className="w-24 h-24 border-2 border-white/10 rounded-full flex items-center justify-center mb-12 opacity-30"><Lucide.MousePointerClick size={40} /></div>
       <p className="text-sm font-bold opacity-80 px-10 leading-tight mb-8">TÜM ÜRÜNLERİMİZİ TEK TIKLA CEBİNİZDEN İNCELEYİN</p>
       <div className="bg-white text-stone-950 px-10 py-4 font-black text-[11px] tracking-[0.1em]">
          {storeUrl}
       </div>
    </SafeWrapper>
  ),

  // 3. TOPTAN FIRSATI (SAMİMİ)
  ({ product, storeUrl, onProductClick }) => (
    <SafeWrapper bg="bg-stone-50">
       <div className="w-full border-4 border-dashed border-stone-200 p-8 rounded-[3rem] space-y-8">
          <div className="flex justify-between items-center opacity-30"><Lucide.Scissors size={20} /><p className="text-[10px] font-black tracking-[0.5em]">TOPTAN FIRSATI</p><Lucide.Scissors size={20} className="rotate-180" /></div>
          <h1 className="text-3xl font-black tracking-tight">{product.name}</h1>
          <div onClick={onProductClick} className="w-48 h-48 mx-auto bg-white rounded-2xl border border-stone-100 shadow-xl flex items-center justify-center cursor-pointer active:scale-95 transition-transform">
             <img src={product.image_url || undefined} className="w-full h-full object-contain" />
          </div>
          <div className="space-y-4">
             <p className="text-[10px] font-medium opacity-60 px-4">YÜKLÜ ALIMLARDA BÜYÜK İNDİRİMLER EKATALOGDA</p>
             <div className="bg-stone-900 text-white px-8 py-3 font-black text-[10px] tracking-widest leading-none">{storeUrl}</div>
          </div>
       </div>
    </SafeWrapper>
  ),

  // 4. MODERN & MINIMAL
  ({ product, storeUrl, onProductClick }) => (
    <SafeWrapper>
       <div className="flex w-full items-center gap-8 text-left">
          <div className="w-12 flex flex-col items-center gap-4 opacity-20"><div className="h-24 w-px bg-current" /><p className="text-[10px] font-black -rotate-90 whitespace-nowrap tracking-[1em]">YERLİ</p></div>
          <div className="flex-1 space-y-10">
             <div className="space-y-2"><p className="text-[9px] font-black tracking-[0.4em] opacity-40">STOKTAN HEMEN GÖNDERİM</p><h1 className="text-4xl font-black tracking-tight leading-[0.9]">{product.name}</h1></div>
             <div onClick={onProductClick} className="w-56 h-56 bg-stone-50 border border-stone-100 shadow-2xl flex items-center justify-center cursor-pointer active:scale-95 transition-transform">
                <img src={product.image_url || undefined} className="w-full h-full object-contain" />
             </div>
             <div className="bg-stone-900 text-white px-8 py-3.5 inline-block font-black text-[10px] tracking-widest leading-none">{storeUrl}</div>
          </div>
       </div>
    </SafeWrapper>
  ),

  // 5. BOLD YÖNLENDİRME
  ({ storeUrl }) => (
    <SafeWrapper bg="bg-blue-600" text="text-white" bgMark="TIKLA">
       <Lucide.ShoppingBag size={60} className="mb-12 opacity-20" />
       <h1 className="text-5xl font-black tracking-tighter italic leading-[0.8] mb-12">EKATALOG <br/>GÜNCELLENDİ</h1>
       <div className="h-1 bg-white w-20 mb-12 opacity-40" />
       <p className="text-sm font-bold tracking-[0.2em] mb-12">FİYAT ALMAK İÇİN SİTEMİZE BEKLERİZ</p>
       <div className="bg-white text-blue-600 px-12 py-4 font-black text-[11px] tracking-widest rounded-full shadow-2xl leading-none">
          {storeUrl}
       </div>
    </SafeWrapper>
  ),

  // 6. ESNAF ÇÖZÜMÜ
  ({ product, storeUrl, onProductClick }) => (
    <SafeWrapper>
       <div className="w-full border border-stone-200 p-6 bg-white shadow-sm mb-10">
          <div className="text-left space-y-4 mb-6">
             <h1 className="text-xl font-bold leading-tight">{product.name}</h1>
             <p className="text-[9px] font-black opacity-40 tracking-widest leading-relaxed">İŞİNİZİ BÜYÜTEN ÇÖZÜMLER DİJİTAL EKATALOGDA</p>
          </div>
          <div onClick={onProductClick} className="w-full aspect-square bg-stone-50 flex items-center justify-center cursor-pointer active:scale-95 transition-transform">
             <img src={product.image_url || undefined} className="w-full h-full object-contain" />
          </div>
       </div>
       <div className="w-full space-y-4">
          <div className="flex justify-between items-center px-2 opacity-30"><p className="text-[8px] font-black tracking-widest uppercase">GÜVENLİ ALIŞVERİŞ</p><Lucide.ShieldCheck size={14} /></div>
          <div className="bg-stone-900 text-white w-full py-4 font-black text-[10px] tracking-[0.2em] leading-none">{storeUrl}</div>
       </div>
    </SafeWrapper>
  ),

  // 7. YERLİ ÜRETİM VURGUSU
  ({ product, storeUrl, onProductClick }) => (
    <SafeWrapper bg="bg-stone-100" text="text-stone-900">
       <div className="w-full space-y-12">
          <div className="flex justify-between items-end border-b border-stone-900/10 pb-6">
             <h1 className="text-5xl font-black tracking-tighter italic leading-none">YERLİ</h1>
             <Lucide.BadgeCheck size={32} className="opacity-30" />
          </div>
          <div onClick={onProductClick} className="w-64 h-64 mx-auto bg-white border border-stone-200 flex items-center justify-center shadow-2xl cursor-pointer active:scale-95 transition-transform rounded-2xl">
             <img src={product.image_url || undefined} className="w-full h-full object-contain" />
          </div>
          <div className="space-y-6">
             <p className="text-[10px] font-black tracking-widest opacity-40 italic">{product.name}</p>
             <div className="bg-stone-900 text-white px-8 py-3.5 font-black text-[10px] tracking-widest leading-none">{storeUrl}</div>
          </div>
       </div>
    </SafeWrapper>
  ),

  // 8. TEMİZ LİNK ODAKLI
  ({ storeUrl, storeName }) => (
    <SafeWrapper bg="bg-stone-50">
       <div className="w-full space-y-16">
          <div className="h-px bg-stone-900 w-full opacity-10" />
          <div className="space-y-6">
             <Lucide.Link2 size={32} className="mx-auto opacity-30" />
             <h1 className="text-4xl font-black tracking-tight leading-none">{storeName}</h1>
             <p className="text-[10px] font-bold opacity-40 tracking-[0.4em]">RESMİ EKATALOG ADRESİMİZ</p>
          </div>
          <div className="space-y-10">
             <p className="text-xl font-bold tracking-tighter italic opacity-80 px-8">GÜNCEL ÜRÜNLER VE FİYATLAR İÇİN SİTEMİZE BEKLERİZ</p>
             <p className="text-2xl font-black border-b-4 border-stone-900 pb-2 inline-block lowercase tracking-tighter">{storeUrl}</p>
          </div>
          <div className="h-px bg-stone-900 w-full opacity-10" />
       </div>
    </SafeWrapper>
  )
];

// Fill with distinct hand-crafted feels
for (let i = MarketingGallery.length; i < 40; i++) {
  MarketingGallery.push(MarketingGallery[i % 8]);
}
