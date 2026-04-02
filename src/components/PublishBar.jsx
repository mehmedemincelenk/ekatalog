import React from 'react';
import { useTenant } from '../hooks/useTenant';

export default function PublishBar({ onPublish }) {
  const { isGhostMode } = useTenant();

  // Yalnızca Ghost Mode'da gösterilecek bar (yeni dükkan oluşturulurken)
  if (!isGhostMode) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-stone-900 text-stone-50 px-4 py-3 flex items-center justify-between shadow-md">
      <div className="flex flex-col">
        <span className="text-[13px] font-medium tracking-wide text-stone-200">Dükkanınızı Düzenliyorsunuz</span>
        <span className="text-[11px] text-stone-400 opacity-80 mt-0.5">Düzenlemeleriniz cihazınıza kaydediliyor.</span>
      </div>

      <button
        onClick={onPublish}
        className="bg-white text-stone-900 px-5 py-2 rounded-full text-sm font-semibold tracking-wide hover:bg-stone-100 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm"
      >
        DÜKKANIMI YAYINLA
      </button>
    </div>
  );
}
