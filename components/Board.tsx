import React from 'react';
import { BoardState, Theme, NumberStyle } from '../types';
import { Tile } from './Tile';

interface BoardProps {
  board: BoardState;
  theme: Theme;
  numberStyle: NumberStyle;
  isEraserMode?: boolean;
  hintCells?: { r: number; c: number }[];
  onTileClick?: (r: number, c: number) => void;
}

export const Board: React.FC<BoardProps> = ({ board, theme, numberStyle, isEraserMode, hintCells = [], onTileClick }) => {
  const rows = board.length;
  const cols = board[0]?.length || 0;

  return (
    <div 
      className={`bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-md p-2 sm:p-3 rounded-2xl relative shadow-2xl mx-auto transition-colors duration-300 ${isEraserMode ? 'ring-2 ring-red-500/50' : ''}`}
      style={{ 
        aspectRatio: `${cols} / ${rows}`,
        height: '100%',
        maxWidth: '100%',
        maxHeight: '100%'
      }}
    >
      {/* Render background grid cells */}
      <div 
        className="absolute inset-0 p-2 sm:p-3 grid gap-2 sm:gap-3"
        style={{ 
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
        }}
      >
        {Array.from({ length: rows * cols }).map((_, i) => (
          <div key={`bg-${i}`} className="bg-black/5 dark:bg-white/5 rounded-lg sm:rounded-xl w-full h-full shadow-inner transition-colors duration-300"></div>
        ))}
      </div>
      
      {/* Render actual tiles overlaid on the grid */}
      <div 
        className={`absolute inset-0 p-2 sm:p-3 grid gap-2 sm:gap-3 ${isEraserMode ? '' : 'pointer-events-none'}`}
        style={{ 
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
        }}
      >
        {board.map((row, rIndex) =>
          row.map((value, cIndex) => {
            const isHint = hintCells.some(h => h.r === rIndex && h.c === cIndex);
            return (
              <div key={`${rIndex}-${cIndex}`} className="w-full h-full">
                <Tile 
                  value={value} 
                  theme={theme} 
                  numberStyle={numberStyle} 
                  boardSize={{ rows, cols }} 
                  isEraserMode={isEraserMode}
                  isHint={isHint}
                  onClick={() => onTileClick && onTileClick(rIndex, cIndex)}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
