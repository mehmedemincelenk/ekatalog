import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveVisualAssetUrl } from '../../utils/image';

import Loading from './Loading';
import * as Lucide from 'lucide-react';

import { SmartImageProps } from '../../types';

/**
 * SMART IMAGE COMPONENT (Diamond Visual Polish)
 * -----------------------------------------------------------
 * Mağazanın görsel kalitesini koruyan akıllı muhafız.
 * - Fotoğraf yüklenirken "shimmer" (parlama) efekti gösterir.
 * - Yükleme bittiğinde yumuşak bir fade-in ile açılır.
 * - Hata durumunda şık bir placeholder gösterir.
 */

export default function SmartImage({
  src,
  alt,
  className = '',
  aspectRatio = 'square',
  objectFit = 'cover',
  fallbackIcon,
  fallbackSrc,
  priority = false,
}: SmartImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    src ? 'loading' : 'error',
  );
  const resolvedSrc = resolveVisualAssetUrl(src);

  const [prevSrc, setPrevSrc] = useState(src);
  if (src !== prevSrc) {
    setPrevSrc(src);
    setStatus(src ? 'loading' : 'error');
  }

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'rectangle'
        ? 'aspect-[4/3]'
        : '';

  return (
    <div
      className={`relative overflow-hidden bg-stone-100 ${aspectClass} ${className}`}
    >
      {/* SHIMMER LOADING EFFECT (PREMIUM PATTERN) */}
      <AnimatePresence>
        {status === 'loading' && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-stone-50"
          >
            <div className="absolute inset-0 shimmer-animation opacity-50" />
            <Loading size="md" variant="dark" className="opacity-20" />
            {/* Subtle Diamond Grid Pattern */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(#000 0.5px, transparent 0.5px)',
                backgroundSize: '16px 16px',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACTUAL IMAGE */}
      {src && (
        <img
          src={resolvedSrc || ''}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          className={`
            w-full h-full transition-all duration-700 ease-out
            ${objectFit === 'cover' ? 'object-cover' : 'object-contain'}
            ${status === 'loaded' ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-sm'}
          `}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}

      {/* ERROR / FALLBACK STATE */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-50 text-stone-300">
          {fallbackSrc ? (
            <img
              src={resolveVisualAssetUrl(fallbackSrc) || ''}
              alt="Logo Fallback"
              className="max-w-[50%] max-h-[50%] object-contain opacity-20 grayscale pointer-events-none"
            />
          ) : fallbackIcon || (
            <div className="flex flex-col items-center">
              <div className="relative">
                <Lucide.Package 
                  size={64} 
                  strokeWidth={0.5} 
                  className="text-stone-200" 
                />
                <Lucide.Search 
                  size={18} 
                  strokeWidth={1.5} 
                  className="absolute -bottom-1 -right-1 text-stone-300" 
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
