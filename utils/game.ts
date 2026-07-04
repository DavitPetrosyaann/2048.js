import { BoardState, Direction } from '../types';

export const getEmptyBoard = (rows: number, cols: number): BoardState => {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
};

export const getEmptyCells = (board: BoardState): { r: number; c: number }[] => {
  const rows = board.length;
  const cols = board[0].length;
  const emptyCells: { r: number; c: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] === 0) {
        emptyCells.push({ r, c });
      }
    }
  }
  return emptyCells;
};

export const addRandomTile = (board: BoardState): BoardState => {
  const emptyCells = getEmptyCells(board);
  if (emptyCells.length === 0) return board;

  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const newValue = Math.random() < 0.9 ? 2 : 4;

  const newBoard = board.map(row => [...row]);
  newBoard[randomCell.r][randomCell.c] = newValue;
  return newBoard;
};

export const getInitialBoard = (rows: number, cols: number): BoardState => {
  let board = getEmptyBoard(rows, cols);
  board = addRandomTile(board);
  if (rows * cols > 1) {
    board = addRandomTile(board);
  }
  return board;
};

export const getMaxTile = (board: BoardState): number => {
  let max = 0;
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c] > max) {
        max = board[r][c];
      }
    }
  }
  return max;
};

export const getHintCells = (board: BoardState): { r: number; c: number }[] => {
  const hints: { r: number; c: number }[] = [];
  const rows = board.length;
  const cols = board[0].length;

  // Find adjacent tiles with the same value (possible merges)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] === 0) continue;
      // Check right
      if (c < cols - 1 && board[r][c] === board[r][c + 1]) {
        hints.push({ r, c }, { r, c: c + 1 });
      }
      // Check down
      if (r < rows - 1 && board[r][c] === board[r + 1][c]) {
        hints.push({ r, c }, { r: r + 1, c });
      }
    }
  }

  // Deduplicate hints
  const uniqueHints = hints.filter((v, i, a) => a.findIndex(t => (t.r === v.r && t.c === v.c)) === i);

  // If no merges are possible, just hint the highest tile as a fallback
  if (uniqueHints.length === 0) {
    let maxVal = 0;
    let maxCell = null;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (board[r][c] > maxVal) {
          maxVal = board[r][c];
          maxCell = { r, c };
        }
      }
    }
    if (maxCell) return [maxCell];
  }

  return uniqueHints;
};

const transpose = (matrix: BoardState): BoardState => {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
};

const reverseRows = (matrix: BoardState): BoardState => {
  return matrix.map(row => [...row].reverse());
};

const slideAndMerge = (row: number[], targetLength: number, multiplierActive: boolean): { newRow: number[]; score: number } => {
  let score = 0;
  // 1. Remove zeros
  let filtered = row.filter(val => val !== 0);
  
  // 2. Merge adjacent equals
  for (let i = 0; i < filtered.length - 1; i++) {
    if (filtered[i] !== 0 && filtered[i] === filtered[i + 1]) {
      // Apply multiplier if active (4x instead of 2x)
      filtered[i] *= (multiplierActive ? 4 : 2);
      score += filtered[i];
      filtered[i + 1] = 0;
    }
  }
  
  // 3. Remove zeros again after merge
  filtered = filtered.filter(val => val !== 0);
  
  // 4. Pad with zeros
  while (filtered.length < targetLength) {
    filtered.push(0);
  }
  
  return { newRow: filtered, score };
};

export const moveBoard = (board: BoardState, direction: Direction, multiplierActive: boolean = false): { newBoard: BoardState; scoreGained: number; moved: boolean } => {
  let newBoard = board.map(row => [...row]);
  let scoreGained = 0;
  let moved = false;

  const rows = board.length;
  const cols = board[0].length;

  if (direction === 'UP' || direction === 'DOWN') {
    newBoard = transpose(newBoard);
  }
  if (direction === 'RIGHT' || direction === 'DOWN') {
    newBoard = reverseRows(newBoard);
  }

  const targetLength = (direction === 'UP' || direction === 'DOWN') ? rows : cols;
  const iterateCount = (direction === 'UP' || direction === 'DOWN') ? cols : rows;

  for (let i = 0; i < iterateCount; i++) {
    const { newRow, score } = slideAndMerge(newBoard[i], targetLength, multiplierActive);
    if (newBoard[i].join(',') !== newRow.join(',')) {
      moved = true;
    }
    newBoard[i] = newRow;
    scoreGained += score;
  }

  if (direction === 'RIGHT' || direction === 'DOWN') {
    newBoard = reverseRows(newBoard);
  }
  if (direction === 'UP' || direction === 'DOWN') {
    newBoard = transpose(newBoard);
  }

  return { newBoard, scoreGained, moved };
};

export const checkGameOver = (board: BoardState): boolean => {
  // If there are empty cells, game is not over
  if (getEmptyCells(board).length > 0) return false;

  const rows = board.length;
  const cols = board[0].length;

  // Check for possible merges horizontally and vertically
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const current = board[r][c];
      if (r < rows - 1 && current === board[r + 1][c]) return false;
      if (c < cols - 1 && current === board[r][c + 1]) return false;
    }
  }

  return true;
};
