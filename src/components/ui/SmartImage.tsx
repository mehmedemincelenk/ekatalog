import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveVisualAssetUrl } from '../../utils/image';
import Loading from './Loading';
import * as Lucide from 'lucide-react';
import { SmartImageProps } from '../../types';

export default function SmartImage({ src: s, alt: a, className: c = '', aspectRatio: ar = 'square', objectFit: oF = 'cover', fallbackIcon: fI, fallbackSrc: fS, priority: p = false }: SmartImageProps) {
  const [st, setSt] = useState<'loading' | 'loaded' | 'error'>(s ? 'loading' : 'error');
  const rS = resolveVisualAssetUrl(s);
  const [pS, sPS] = useState(s);
  if (s !== pS) { sPS(s); setSt(s ? 'loading' : 'error'); }

  return (
    <div className={`relative overflow-hidden bg-stone-100 ${ar === 'square' ? 'aspect-square' : ar === 'rectangle' ? 'aspect-[4/3]' : ''} ${c}`}>
      <AnimatePresence>
        {st === 'loading' && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-10 flex items-center justify-center bg-stone-50">
            <div className="absolute inset-0 shimmer-animation opacity-50" /><Loading size="md" variant="dark" className="opacity-20" /><div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '16px 16px' }} />
          </motion.div>
        )}
      </AnimatePresence>
      {s && <img src={rS || ''} alt={a} loading={p ? 'eager' : 'lazy'} className={`w-full h-full transition-all duration-700 ease-out ${oF === 'cover' ? 'object-cover' : 'object-contain'} ${st === 'loaded' ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-sm'}`} onLoad={() => setSt('loaded')} onError={() => setSt('error')} />}
      {st === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-50 text-stone-300">
          {fS ? <img src={resolveVisualAssetUrl(fS) || ''} alt="Logo Fallback" className="max-w-[50%] max-h-[50%] object-contain opacity-20 grayscale pointer-events-none" /> : fI || <div className="flex flex-col items-center"><div className="relative"><Lucide.Package size={64} strokeWidth={0.5} className="text-stone-200" /><Lucide.Search size={18} strokeWidth={1.5} className="absolute -bottom-1 -right-1 text-stone-300" /></div></div>}
        </div>
      )}
    </div>
  );
}
