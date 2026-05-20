import { useState } from 'react';
import { Delete, Check } from 'lucide-react';
import Button from './Button';

interface NumpadProps { onSubmit: (phoneNumber: string) => void; title?: string; maxDigits?: number; variant?: 'light' | 'dark'; }

export default function Numpad({ onSubmit: o, maxDigits: m = 10, variant: vr = 'light' }: NumpadProps) {
  const d = vr === 'dark'; const [v, sV] = useState(''); const hP = (n: string) => v.length < m && sV(p => p + n);
  const btnC = `!w-full !h-16 !text-xl font-black ${d ? '!bg-stone-800 !text-white border-stone-700 hover:!bg-stone-700' : '!bg-white !text-stone-900 hover:!border-stone-900'}`;
  return (
    <div className="flex flex-col items-center w-full mx-auto space-y-4">
      <div className={`flex items-center justify-between w-full h-14 px-4 border rounded-2xl overflow-hidden ${d ? 'bg-stone-800 border-stone-700' : 'bg-stone-50 border-stone-100'}`}>
        <span className={`text-xl font-black tracking-[0.2em] ${d ? 'text-white' : 'text-stone-900'}`}>{v || '05XXXXXXXX'}</span>
        {v.length > 0 && <Button onClick={() => sV(p => p.slice(0, -1))} variant="ghost" mode="circle" size="sm" className={d ? 'text-stone-500 hover:text-white' : '!text-stone-400 hover:!text-stone-900'} icon={<Delete size={20} />} />}
      </div>
      <div className="grid grid-cols-3 gap-3 w-full">
        {'123456789'.split('').map(k => <Button key={k} onClick={() => hP(k)} variant={d ? 'primary' : 'secondary'} mode="circle" className={btnC}>{k}</Button>)}
        <div className="w-full h-16" /><Button onClick={() => hP('0')} variant={d ? 'primary' : 'secondary'} mode="circle" className={btnC}>0</Button>
        <Button onClick={() => v.length >= 10 && o(v)} variant="action" mode="circle" showFingerprint disabled={v.length < 10} className={`!w-full !h-16 ${v.length < 10 ? 'opacity-50' : 'hover:scale-105 active:scale-95'}`} icon={<Check size={24} strokeWidth={3} />} />
      </div>
    </div>
  );
}
