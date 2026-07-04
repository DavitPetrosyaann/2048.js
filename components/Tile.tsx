import React from 'react';
import { Theme, NumberStyle, BoardSize } from '../types';

interface TileProps {
  value: number;
  theme: Theme;
  numberStyle: NumberStyle;
  boardSize: BoardSize;
  isEraserMode?: boolean;
  isHint?: boolean;
  onClick?: () => void;
}

const toRoman = (num: number): string => {
  if (num === 0) return '';
  const romanMap = [
    { value: 1000, numeral: 'M' },
    { value: 900, numeral: 'CM' },
    { value: 500, numeral: 'D' },
    { value: 400, numeral: 'CD' },
    { value: 100, numeral: 'C' },
    { value: 90, numeral: 'XC' },
    { value: 50, numeral: 'L' },
    { value: 40, numeral: 'XL' },
    { value: 10, numeral: 'X' },
    { value: 9, numeral: 'IX' },
    { value: 5, numeral: 'V' },
    { value: 4, numeral: 'IV' },
    { value: 1, numeral: 'I' }
  ];
  let result = '';
  for (const { value, numeral } of romanMap) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }
  return result;
};

const toArmenian = (num: number): string => {
  if (num === 0) return '';
  const ones = ['', 'Ա', 'Բ', 'Գ', 'Դ', 'Ե', 'Զ', 'Է', 'Ը', 'Թ'];
  const tens = ['', 'Ժ', 'Ի', 'Լ', 'Խ', 'Ծ', 'Կ', 'Հ', 'Ձ', 'Ղ'];
  const hundreds = ['', 'Ճ', 'Մ', 'Յ', 'Ն', 'Շ', 'Ո', 'Չ', 'Պ', 'Ջ'];
  const thousands = ['', 'Ռ', 'Ս', 'Վ', 'Տ', 'Ր', 'Ց', 'Ւ', 'Փ', 'Ք'];

  let result = '';
  const t = Math.floor(num / 1000) % 10;
  const h = Math.floor(num / 100) % 10;
  const te = Math.floor(num / 10) % 10;
  const o = num % 10;

  if (t > 0) result += thousands[t];
  if (h > 0) result += hundreds[h];
  if (te > 0) result += tens[te];
  if (o > 0) result += ones[o];

  return result || num.toString();
};

const getTileStyles = (value: number, theme: Theme): string => {
  if (value === 0) {
    return theme === 'classic' 
      ? 'bg-[#cdc1b4]/30 dark:bg-[#cdc1b4]/20 text-transparent border border-transparent' 
      : 'bg-black/5 dark:bg-white/5 text-transparent border border-transparent';
  }

  if (theme === 'classic') {
    switch (value) {
      case 2: return 'bg-[#eee4da] text-[#776e65] text-4xl sm:text-5xl';
      case 4: return 'bg-[#ede0c8] text-[#776e65] text-4xl sm:text-5xl';
      case 8: return 'bg-[#f2b179] text-white text-4xl sm:text-5xl';
      case 16: return 'bg-[#f59563] text-white text-4xl sm:text-5xl';
      case 32: return 'bg-[#f67c5f] text-white text-4xl sm:text-5xl';
      case 64: return 'bg-[#f65e3b] text-white text-4xl sm:text-5xl';
      case 128: return 'bg-[#edcf72] text-white text-3xl sm:text-4xl shadow-[0_0_30px_10px_rgba(243,215,116,0.23)_inset]';
      case 256: return 'bg-[#edcc61] text-white text-3xl sm:text-4xl shadow-[0_0_30px_10px_rgba(243,215,116,0.31)_inset]';
      case 512: return 'bg-[#edc850] text-white text-3xl sm:text-4xl shadow-[0_0_30px_10px_rgba(243,215,116,0.4)_inset]';
      case 1024: return 'bg-[#edc53f] text-white text-2xl sm:text-3xl shadow-[0_0_30px_10px_rgba(243,215,116,0.48)_inset]';
      case 2048: return 'bg-[#edc22e] text-white text-2xl sm:text-3xl shadow-[0_0_30px_10px_rgba(243,215,116,0.55)_inset]';
      default: return 'bg-[#3c3a32] text-[#f9f6f2] text-2xl sm:text-3xl';
    }
  }

  if (theme === 'cyberpunk') {
    switch (value) {
      case 2: return 'bg-black text-green-400 border border-green-500/50 text-4xl sm:text-5xl';
      case 4: return 'bg-black text-cyan-400 border border-cyan-500/50 text-4xl sm:text-5xl';
      case 8: return 'bg-black text-pink-500 border border-pink-500/50 text-4xl sm:text-5xl';
      case 16: return 'bg-black text-yellow-400 border border-yellow-500/50 text-4xl sm:text-5xl';
      case 32: return 'bg-black text-purple-500 border border-purple-500/50 text-4xl sm:text-5xl';
      case 64: return 'bg-black text-red-500 border border-red-500/50 text-4xl sm:text-5xl';
      case 128: return 'bg-green-500 text-black shadow-[0_0_15px_#22c55e] text-3xl sm:text-4xl';
      case 256: return 'bg-cyan-500 text-black shadow-[0_0_15px_#06b6d4] text-3xl sm:text-4xl';
      case 512: return 'bg-pink-500 text-black shadow-[0_0_15px_#ec4899] text-3xl sm:text-4xl';
      case 1024: return 'bg-yellow-500 text-black shadow-[0_0_15px_#eab308] text-2xl sm:text-3xl';
      case 2048: return 'bg-red-500 text-black shadow-[0_0_15px_#ef4444] text-2xl sm:text-3xl';
      default: return 'bg-white text-black shadow-[0_0_20px_#ffffff] text-2xl sm:text-3xl';
    }
  }

  if (theme === 'monochrome') {
    switch (value) {
      case 2: return 'bg-neutral-200 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-700 text-4xl sm:text-5xl';
      case 4: return 'bg-neutral-300 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300 border border-neutral-400 dark:border-neutral-600 text-4xl sm:text-5xl';
      case 8: return 'bg-neutral-400 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-200 border border-neutral-500 text-4xl sm:text-5xl';
      case 16: return 'bg-neutral-500 dark:bg-neutral-600 text-white dark:text-neutral-100 border border-neutral-600 dark:border-neutral-400 text-4xl sm:text-5xl';
      case 32: return 'bg-neutral-600 dark:bg-neutral-500 text-white border border-neutral-700 dark:border-neutral-300 text-4xl sm:text-5xl';
      case 64: return 'bg-neutral-700 dark:bg-neutral-400 text-white dark:text-black border border-neutral-800 dark:border-neutral-200 text-4xl sm:text-5xl';
      case 128: return 'bg-neutral-800 dark:bg-neutral-300 text-white dark:text-black text-3xl sm:text-4xl';
      case 256: return 'bg-neutral-900 dark:bg-neutral-200 text-white dark:text-black text-3xl sm:text-4xl';
      case 512: return 'bg-black dark:bg-neutral-100 text-white dark:text-black text-3xl sm:text-4xl';
      case 1024: return 'bg-black dark:bg-white text-white dark:text-black border-4 border-neutral-500 dark:border-neutral-400 text-2xl sm:text-3xl';
      case 2048: return 'bg-black dark:bg-white text-white dark:text-black border-4 border-neutral-400 dark:border-black shadow-[0_0_20px_rgba(0,0,0,0.5)] dark:shadow-[0_0_20px_rgba(255,255,255,0.5)] text-2xl sm:text-3xl';
      default: return 'bg-white dark:bg-black text-black dark:text-white border-4 border-black dark:border-white text-2xl sm:text-3xl';
    }
  }

  // Default: Neon
  switch (value) {
    case 2: return 'bg-neutral-200/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 border border-black/5 dark:border-white/5 text-4xl sm:text-5xl';
    case 4: return 'bg-neutral-300/80 dark:bg-neutral-700/80 text-neutral-800 dark:text-neutral-200 border border-black/10 dark:border-white/10 text-4xl sm:text-5xl';
    case 8: return 'bg-indigo-200/80 dark:bg-indigo-900/80 text-indigo-900 dark:text-indigo-100 border border-indigo-500/30 text-4xl sm:text-5xl';
    case 16: return 'bg-violet-300/80 dark:bg-violet-800/80 text-violet-900 dark:text-violet-100 border border-violet-500/40 text-4xl sm:text-5xl';
    case 32: return 'bg-fuchsia-300/80 dark:bg-fuchsia-800/80 text-fuchsia-900 dark:text-fuchsia-100 border border-fuchsia-500/50 text-4xl sm:text-5xl';
    case 64: return 'bg-pink-400/90 dark:bg-pink-700/90 text-white border border-pink-500/60 shadow-[0_0_15px_rgba(219,39,119,0.3)] text-4xl sm:text-5xl';
    case 128: return 'bg-rose-500/90 dark:bg-rose-600/90 text-white border border-rose-400/70 shadow-[0_0_20px_rgba(225,29,72,0.4)] text-3xl sm:text-4xl';
    case 256: return 'bg-orange-500/90 dark:bg-orange-600/90 text-white border border-orange-400/80 shadow-[0_0_25px_rgba(234,88,12,0.5)] text-3xl sm:text-4xl';
    case 512: return 'bg-amber-400/90 dark:bg-amber-500/90 text-white border border-amber-300/90 shadow-[0_0_30px_rgba(245,158,11,0.6)] text-3xl sm:text-4xl';
    case 1024: return 'bg-yellow-300 dark:bg-yellow-400 text-neutral-900 border border-yellow-400 dark:border-yellow-200 shadow-[0_0_35px_rgba(250,204,21,0.7)] text-2xl sm:text-3xl';
    case 2048: return 'bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 dark:from-indigo-500 dark:via-purple-500 dark:to-pink-500 text-white border border-white/50 shadow-[0_0_40px_rgba(168,85,247,0.6)] dark:shadow-[0_0_40px_rgba(168,85,247,0.8)] text-2xl sm:text-3xl';
    default: return 'bg-gradient-to-br from-neutral-800 via-neutral-600 to-neutral-900 dark:from-white dark:via-neutral-200 dark:to-neutral-400 text-white dark:text-black shadow-[0_0_50px_rgba(0,0,0,0.5)] dark:shadow-[0_0_50px_rgba(255,255,255,0.9)] text-2xl sm:text-3xl';
  }
};

export const Tile: React.FC<TileProps> = ({ value, theme, numberStyle, boardSize, isEraserMode, isHint, onClick }) => {
  const displayValue = 
    numberStyle === 'roman' && value > 0 ? toRoman(value) : 
    numberStyle === 'armenian' && value > 0 ? toArmenian(value) : 
    (value > 0 ? value.toString() : '');
  
  // Strip hardcoded text sizes from the theme styles to apply dynamic sizing
  const rawStyles = getTileStyles(value, theme);
  const styleClasses = rawStyles.replace(/\b(sm:)?text-(xs|sm|base|lg|[2-6]?xl)\b/g, '').trim();

  // Dynamic text sizing based on string length and board size to prevent overflow
  let textSizeClass = '';
  const maxDim = Math.max(boardSize.rows, boardSize.cols);
  const isLargeBoard = maxDim >= 5;
  const isHugeBoard = maxDim >= 7;

  if (value > 0) {
    if (displayValue.length > 8) textSizeClass = isLargeBoard ? 'text-xs' : 'text-sm sm:text-base';
    else if (displayValue.length > 6) textSizeClass = isLargeBoard ? 'text-sm' : 'text-lg sm:text-xl';
    else if (displayValue.length > 4) textSizeClass = isLargeBoard ? 'text-base' : 'text-xl sm:text-2xl';
    else if (displayValue.length >= 3) textSizeClass = isLargeBoard ? 'text-lg' : 'text-2xl sm:text-3xl';
    else textSizeClass = isHugeBoard ? 'text-lg' : isLargeBoard ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl';
  }

  const baseClasses = "w-full h-full flex items-center justify-center font-bold rounded-lg sm:rounded-xl transition-all duration-150 ease-in-out backdrop-blur-sm text-center px-1";
  const animationClass = value > 0 ? "animate-[pop_0.2s_ease-in-out]" : "";
  
  const eraserClasses = isEraserMode && value > 0 
    ? "cursor-pointer hover:opacity-50 hover:scale-95 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] z-20" 
    : "";
    
  const hintClasses = isHint && value > 0
    ? "animate-[hint-pulse_1.5s_ease-in-out_infinite] z-30 ring-2 ring-white/50 dark:ring-white/70"
    : "";

  return (
    <div 
      onClick={onClick}
      className={`${baseClasses} ${styleClasses} ${textSizeClass} ${animationClass} ${eraserClasses} ${hintClasses}`}
    >
      {displayValue}
    </div>
  );
};
