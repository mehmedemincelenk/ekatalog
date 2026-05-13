import { useState } from 'react';
import { Delete, Check } from 'lucide-react';
import Button from './Button';

interface NumpadProps {
  onSubmit: (phoneNumber: string) => void;
  title?: string;
  maxDigits?: number;
  variant?: 'light' | 'dark';
}

export default function Numpad({ 
  onSubmit, 
  maxDigits = 10,
  variant = 'light'
}: NumpadProps) {
  const isDark = variant === 'dark';
  const [value, setValue] = useState('');

  const handlePress = (num: string) => {
    if (value.length < maxDigits) {
      setValue((prev) => prev + num);
    }
  };

  const handleBackspace = () => {
    setValue((prev) => prev.slice(0, -1));
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="flex flex-col items-center w-full mx-auto space-y-4">

      {/* DISPLAY FIELD */}
      <div className={`flex items-center justify-between w-full h-14 px-4 border rounded-2xl overflow-hidden ${
        isDark ? 'bg-stone-800 border-stone-700' : 'bg-stone-50 border-stone-100'
      }`}>
        <span className={`text-xl font-black tracking-[0.2em] ${
          isDark ? 'text-white' : 'text-stone-900'
        }`}>
          {value || '05XXXXXXXX'}
        </span>
        {value.length > 0 && (
          <Button 
            onClick={handleBackspace}
            variant="ghost"
            mode="circle"
            size="sm"
            className={`${isDark ? 'text-stone-500 hover:text-white' : '!text-stone-400 hover:!text-stone-900'}`}
            icon={<Delete size={20} />}
          />
        )}
      </div>

      {/* KEYPAD GRID */}
      <div className="grid grid-cols-3 gap-3 w-full">
        {keys.map((key) => (
          <Button
            key={key}
            onClick={() => handlePress(key)}
            variant={isDark ? 'primary' : 'secondary'}
            mode="circle"
            className={`!w-full !h-16 !text-xl font-black ${
              isDark ? '!bg-stone-800 !text-white border-stone-700 hover:!bg-stone-700' : '!bg-white !text-stone-900 hover:!border-stone-900'
            }`}
          >
            {key}
          </Button>
        ))}
        
        {/* BOTTOM ROW */}
        <div className="w-full h-16" /> {/* Left empty */}
        
        <Button
          onClick={() => handlePress('0')}
          variant={isDark ? 'primary' : 'secondary'}
          mode="circle"
          className={`!w-full !h-16 !text-xl font-black ${
            isDark ? '!bg-stone-800 !text-white border-stone-700 hover:!bg-stone-700' : '!bg-white !text-stone-900 hover:!border-stone-900'
          }`}
        >
          0
        </Button>

        <Button
          onClick={() => value.length >= 10 && onSubmit(value)}
          variant="action"
          mode="circle"
          showFingerprint={true}
          disabled={value.length < 10}
          className={`!w-full !h-16 ${value.length < 10 ? 'opacity-50' : 'hover:scale-105 active:scale-95'}`}
          icon={<Check size={24} strokeWidth={3} />}
        />
      </div>
    </div>
  );
}
