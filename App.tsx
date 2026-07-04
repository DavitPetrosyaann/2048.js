import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, Direction, Theme, NumberStyle, BoardSize, Language, LeaderboardEntry } from './types';
import { getInitialBoard, moveBoard, addRandomTile, checkGameOver, getMaxTile, getHintCells } from './utils/game';
import { Board } from './components/Board';
import { RotateCcw, ChevronRight, X, Palette, Hash, Edit2, Grid, Sun, Moon, Globe, Undo2, Redo2, Trophy, Eraser, Zap, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const translations = {
  en: {
    congrats: [
      "{name}, you did it!", "Awesome job, {name}!", "Incredible, {name}!", 
      "{name} is on fire!", "Brilliant move, {name}!", "You're a genius, {name}!", 
      "Spectacular, {name}!", "{name}, that was epic!"
    ],
    score: "Score",
    newGame: "New Game",
    undo: "Undo",
    redo: "Redo",
    gameOver: "Game Over",
    tryAgain: "Try Again",
    enterName: "Enter your name...",
    save: "Save",
    playingAs: "Playing as",
    instructions: "Swipe or use arrow keys to merge matching tiles.",
    boardSize: "Board Size",
    themes: "Themes",
    numberStyle: "Number Style",
    apply: "Apply",
    arabic: "Arabic (2, 4, 8)",
    roman: "Roman (II, IV, VIII)",
    armenian: "Armenian (Բ, Դ, Ը)",
    leaderboard: "Leaderboard",
    eraser: "Eraser",
    multiplier: "Multiplier",
    noScores: "No scores yet",
    close: "Close"
  },
  hy: {
    congrats: [
      "{name}, դու արեցիր դա!", "Հիանալի աշխատանք, {name}!", "Անհավանական է, {name}!", 
      "{name}-ը կրակ է!", "Փայլուն քայլ, {name}!", "Դու հանճար ես, {name}!", 
      "Տպավորիչ է, {name}!", "{name}, դա էպիկ էր!"
    ],
    score: "Միավոր",
    newGame: "Նոր Խաղ",
    undo: "Հետ",
    redo: "Առաջ",
    gameOver: "Խաղն Ավարտվեց",
    tryAgain: "Կրկին Փորձել",
    enterName: "Մուտքագրեք ձեր անունը...",
    save: "Պահպանել",
    playingAs: "Խաղում է",
    instructions: "Սահեցրեք կամ օգտագործեք սլաքները՝ սալիկները միացնելու համար:",
    boardSize: "Տախտակի Չափը",
    themes: "Թեմաներ",
    numberStyle: "Թվերի Ոճը",
    apply: "Կիրառել",
    arabic: "Արաբական (2, 4, 8)",
    roman: "Հռոմեական (II, IV, VIII)",
    armenian: "Հայկական (Բ, Դ, Ը)",
    leaderboard: "Առաջատարներ",
    eraser: "Ջնջիչ",
    multiplier: "Բազմապատկիչ",
    noScores: "Դեռ միավորներ չկան",
    close: "Փակել"
  },
  ru: {
    congrats: [
      "{name}, ты сделал это!", "Отличная работа, {name}!", "Невероятно, {name}!", 
      "{name} в ударе!", "Блестящий ход, {name}!", "Ты гений, {name}!", 
      "Впечатляюще, {name}!", "{name}, это было эпично!"
    ],
    score: "Счет",
    newGame: "Новая Игра",
    undo: "Отменить",
    redo: "Повторить",
    gameOver: "Игра Окончена",
    tryAgain: "Попробовать Снова",
    enterName: "Введите ваше имя...",
    save: "Сохранить",
    playingAs: "Играет",
    instructions: "Смахните или используйте стрелки для объединения плиток.",
    boardSize: "Размер Доски",
    themes: "Темы",
    numberStyle: "Стиль Чисел",
    apply: "Применить",
    arabic: "Арабский (2, 4, 8)",
    roman: "Римский (II, IV, VIII)",
    armenian: "Армянский (Բ, Դ, Ը)",
    leaderboard: "Таблица лидеров",
    eraser: "Ластик",
    multiplier: "Множитель",
    noScores: "Пока нет результатов",
    close: "Закрыть"
  }
};

const boardPresets = [
  { r: 3, c: 3 }, { r: 4, c: 4 },
  { r: 5, c: 5 }, { r: 6, c: 6 }
];

const getTitleColor = (theme: Theme) => {
  switch (theme) {
    case 'classic': return 'from-[#f2b179] via-[#f59563] to-[#f65e3b]';
    case 'cyberpunk': return 'from-green-400 via-cyan-400 to-pink-500';
    case 'monochrome': return 'from-neutral-600 via-neutral-400 to-neutral-800 dark:from-neutral-300 dark:via-neutral-500 dark:to-neutral-100';
    case 'neon':
    default: return 'from-indigo-400 via-purple-400 to-pink-500';
  }
};

interface GameData {
  history: GameState[];
  currentIndex: number;
}

const App: React.FC = () => {
  const [boardSize, setBoardSize] = useState<BoardSize>({ rows: 4, cols: 4 });
  const [customRows, setCustomRows] = useState('4');
  const [customCols, setCustomCols] = useState('4');

  const [gameData, setGameData] = useState<GameData>(() => {
    const initialBoard = getInitialBoard(4, 4);
    return {
      history: [{
        board: initialBoard,
        score: 0,
        gameOver: false,
        maxTile: getMaxTile(initialBoard),
        erasers: 3,
        multipliers: 3,
        multiplierActive: false
      }],
      currentIndex: 0
    };
  });

  const gameState = gameData.history[gameData.currentIndex];
  
  // Calculate how many non-zero tiles are currently on the board
  const nonZeroCount = gameState.board.reduce((count, row) => count + row.filter(val => val !== 0).length, 0);

  const [theme, setTheme] = useState<Theme>('neon');
  const [numberStyle, setNumberStyle] = useState<NumberStyle>('arabic');
  const [language, setLanguage] = useState<Language>('en');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isEraserMode, setIsEraserMode] = useState(false);
  const [hintCells, setHintCells] = useState<{r: number, c: number}[]>([]);
  
  const [userName, setUserName] = useState<string>('');
  const [hasEnteredName, setHasEnteredName] = useState<boolean>(false);
  const [congratsMessage, setCongratsMessage] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const prevMaxTileRef = useRef<number>(gameState.maxTile);
  const userNameRef = useRef<string>(userName);
  const languageRef = useRef<Language>(language);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const boardRef = useRef(gameState.board);
  const gameOverRef = useRef(gameState.gameOver);
  const isMounted = useRef(false);

  const t = translations[language];

  // Keep refs updated for the idle timer and fireworks
  useEffect(() => {
    boardRef.current = gameState.board;
    gameOverRef.current = gameState.gameOver;
  }, [gameState.board, gameState.gameOver]);

  useEffect(() => {
    userNameRef.current = userName;
  }, [userName]);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  // Idle Timer Logic
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    setHintCells([]); // Clear hints on activity
    
    if (!gameOverRef.current) {
      idleTimerRef.current = setTimeout(() => {
        setHintCells(getHintCells(boardRef.current));
      }, 10000); // 10 seconds
    }
  }, []);

  useEffect(() => {
    resetIdleTimer();
  }, [gameState.board, resetIdleTimer]);

  useEffect(() => {
    const handleActivity = () => resetIdleTimer();
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    
    return () => {
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  // Load Leaderboard
  useEffect(() => {
    const savedLb = localStorage.getItem('2048-leaderboard');
    if (savedLb) {
      try {
        setLeaderboard(JSON.parse(savedLb));
      } catch (e) {
        console.error("Failed to parse leaderboard", e);
      }
    }
  }, []);

  const handleDeleteScore = (indexToDelete: number) => {
    const updatedLb = leaderboard.filter((_, index) => index !== indexToDelete);
    setLeaderboard(updatedLb);
    localStorage.setItem('2048-leaderboard', JSON.stringify(updatedLb));
  };

  // Save Score on Game Over
  useEffect(() => {
    if (gameState.gameOver && gameState.score > 0) {
      const newEntry: LeaderboardEntry = {
        name: userName.trim() || 'Player',
        score: gameState.score,
        date: new Date().toISOString(),
        boardSize: `${boardSize.rows}x${boardSize.cols}`
      };
      const updatedLb = [...leaderboard, newEntry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      setLeaderboard(updatedLb);
      localStorage.setItem('2048-leaderboard', JSON.stringify(updatedLb));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.gameOver]);

  // Handle Dark Mode Toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Restart game when board size changes
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    const initialBoard = getInitialBoard(boardSize.rows, boardSize.cols);
    setGameData({
      history: [{
        board: initialBoard,
        score: 0,
        gameOver: false,
        maxTile: getMaxTile(initialBoard),
        erasers: 3,
        multipliers: 3,
        multiplierActive: false
      }],
      currentIndex: 0
    });
    setIsEraserMode(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardSize]);

  // Trigger fireworks and congrats message when a new max tile is reached (128 or higher)
  useEffect(() => {
    if (gameState.maxTile > prevMaxTileRef.current && gameState.maxTile >= 128) {
      const duration = 2000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { 
          particleCount, 
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
        }));
        confetti(Object.assign({}, defaults, { 
          particleCount, 
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
        }));
      }, 250);

      // Show congrats message
      const nameToUse = userNameRef.current.trim() || "Player";
      const currentLang = languageRef.current;
      const templates = translations[currentLang].congrats;
      const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
      setCongratsMessage(randomTemplate.replace("{name}", nameToUse));

      const msgTimer = setTimeout(() => {
        setCongratsMessage(null);
      }, 3000);

      prevMaxTileRef.current = gameState.maxTile;

      return () => {
        clearInterval(interval);
        clearTimeout(msgTimer);
      };
    }
    
    prevMaxTileRef.current = gameState.maxTile;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.maxTile]);

  const handleRestart = () => {
    // Reset to default 4x4 matrix
    setBoardSize({ rows: 4, cols: 4 });
    setCustomRows('4');
    setCustomCols('4');
    
    const initialBoard = getInitialBoard(4, 4);
    setGameData({
      history: [{
        board: initialBoard,
        score: 0,
        gameOver: false,
        maxTile: getMaxTile(initialBoard),
        erasers: 3,
        multipliers: 3,
        multiplierActive: false
      }],
      currentIndex: 0
    });
    // Clear the name for the new game
    setUserName('');
    setHasEnteredName(false);
    setIsEraserMode(false);
  };

  const handleUndo = () => {
    setGameData(prev => ({
      ...prev,
      currentIndex: Math.max(0, prev.currentIndex - 1)
    }));
    setIsEraserMode(false);
  };

  const handleRedo = () => {
    setGameData(prev => ({
      ...prev,
      currentIndex: Math.min(prev.history.length - 1, prev.currentIndex + 1)
    }));
    setIsEraserMode(false);
  };

  const toggleMultiplier = () => {
    const currentState = gameData.history[gameData.currentIndex];
    if (currentState.multipliers <= 0 && !currentState.multiplierActive) return;

    const newState = {
      ...currentState,
      multiplierActive: !currentState.multiplierActive,
      multipliers: currentState.multiplierActive ? currentState.multipliers + 1 : currentState.multipliers - 1
    };
    
    const newHistory = gameData.history.slice(0, gameData.currentIndex + 1);
    newHistory.push(newState);
    setGameData({ history: newHistory, currentIndex: newHistory.length - 1 });
  };

  const handleTileClick = (r: number, c: number) => {
    if (!isEraserMode) return;
    const currentState = gameData.history[gameData.currentIndex];
    if (currentState.board[r][c] === 0) return;

    // Prevent erasing if it's the last tile on the board
    const currentNonZeroCount = currentState.board.reduce((count, row) => count + row.filter(val => val !== 0).length, 0);
    if (currentNonZeroCount <= 1) {
      setIsEraserMode(false);
      return;
    }

    const newBoard = currentState.board.map(row => [...row]);
    newBoard[r][c] = 0;

    const newState = {
      ...currentState,
      board: newBoard,
      erasers: currentState.erasers - 1
    };

    const newHistory = gameData.history.slice(0, gameData.currentIndex + 1);
    newHistory.push(newState);
    setGameData({ history: newHistory, currentIndex: newHistory.length - 1 });
    setIsEraserMode(false);
  };

  const applyCustomSize = () => {
    const r = parseInt(customRows);
    const c = parseInt(customCols);
    if (r > 0 && c > 0) {
      setBoardSize({ rows: r, cols: c });
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hy' : prev === 'hy' ? 'ru' : 'en');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      // Don't trigger game moves if user is typing in the input field
      if (document.activeElement?.tagName === 'INPUT') {
        return;
      }

      setGameData(prev => {
        const currentState = prev.history[prev.currentIndex];
        if (currentState.gameOver) return prev;

        let direction: Direction | null = null;
        switch (e.key) {
          case 'ArrowUp': case 'w': case 'W': direction = 'UP'; break;
          case 'ArrowDown': case 's': case 'S': direction = 'DOWN'; break;
          case 'ArrowLeft': case 'a': case 'A': direction = 'LEFT'; break;
          case 'ArrowRight': case 'd': case 'D': direction = 'RIGHT'; break;
        }

        if (!direction) return prev;

        // Cancel eraser mode on move
        setIsEraserMode(false);

        const { newBoard, scoreGained, moved } = moveBoard(currentState.board, direction, currentState.multiplierActive);

        if (moved) {
          const boardWithNewTile = addRandomTile(newBoard);
          const isOver = checkGameOver(boardWithNewTile);
          const newMaxTile = getMaxTile(boardWithNewTile);
          
          const newState = {
            board: boardWithNewTile,
            score: currentState.score + scoreGained,
            gameOver: isOver,
            maxTile: Math.max(currentState.maxTile, newMaxTile),
            erasers: currentState.erasers,
            multipliers: currentState.multipliers,
            multiplierActive: false // Consume multiplier after move
          };

          const newHistory = prev.history.slice(0, prev.currentIndex + 1);
          newHistory.push(newState);

          return {
            history: newHistory,
            currentIndex: newHistory.length - 1
          };
        }
        return prev;
      });
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const dx = touchEndX - touchStartRef.current.x;
    const dy = touchEndY - touchStartRef.current.y;

    // Minimum swipe distance
    if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;

    let direction: Direction | null = null;
    if (Math.abs(dx) > Math.abs(dy)) {
      direction = dx > 0 ? 'RIGHT' : 'LEFT';
    } else {
      direction = dy > 0 ? 'DOWN' : 'UP';
    }

    setGameData(prev => {
      const currentState = prev.history[prev.currentIndex];
      if (currentState.gameOver || !direction) return prev;

      // Cancel eraser mode on move
      setIsEraserMode(false);

      const { newBoard, scoreGained, moved } = moveBoard(currentState.board, direction, currentState.multiplierActive);

      if (moved) {
        const boardWithNewTile = addRandomTile(newBoard);
        const isOver = checkGameOver(boardWithNewTile);
        const newMaxTile = getMaxTile(boardWithNewTile);
        
        const newState = {
          board: boardWithNewTile,
          score: currentState.score + scoreGained,
          gameOver: isOver,
          maxTile: Math.max(currentState.maxTile, newMaxTile),
          erasers: currentState.erasers,
          multipliers: currentState.multipliers,
          multiplierActive: false // Consume multiplier after move
        };

        const newHistory = prev.history.slice(0, prev.currentIndex + 1);
        newHistory.push(newState);

        return {
          history: newHistory,
          currentIndex: newHistory.length - 1
        };
      }
      return prev;
    });

    touchStartRef.current = null;
  };

  const themes: Theme[] = ['neon', 'classic', 'cyberpunk', 'monochrome'];
  const numberStyles: NumberStyle[] = ['armenian', 'arabic', 'roman'];

  return (
    <div 
      className="h-[100dvh] w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-100 via-neutral-200 to-neutral-300 dark:from-neutral-900 dark:via-neutral-950 dark:to-black flex flex-col items-center justify-center p-2 sm:p-4 text-neutral-800 dark:text-neutral-200 overflow-hidden transition-colors duration-300"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pop {
          0% { transform: scale(0.8); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        @keyframes fade-in {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(8px); }
        }
        @keyframes slide-up {
          0% { transform: translate(-50%, 20px); opacity: 0; }
          10% { transform: translate(-50%, 0); opacity: 1; }
          80% { transform: translate(-50%, -20px); opacity: 1; }
          100% { transform: translate(-50%, -40px); opacity: 0; }
        }
        @keyframes hint-pulse {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.05); filter: brightness(1.2); box-shadow: 0 0 20px rgba(255,255,255,0.5); }
        }
      `}} />

      {/* Congrats Message Overlay */}
      {congratsMessage && (
        <div className="fixed top-[15%] left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-[slide-up_3s_ease-in-out_forwards]">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 dark:from-yellow-300 dark:via-orange-400 dark:to-red-500 drop-shadow-[0_0_15px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] text-center whitespace-nowrap">
            {congratsMessage}
          </h2>
        </div>
      )}

      {/* Leaderboard Modal */}
      {isLeaderboardOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-neutral-200 dark:border-neutral-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-black dark:text-white">
                <Trophy className="text-yellow-500" /> {t.leaderboard}
              </h2>
              <button 
                onClick={() => setIsLeaderboardOpen(false)}
                className="text-neutral-500 hover:text-black dark:hover:text-white transition-colors p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>
            {leaderboard.length === 0 ? (
              <p className="text-neutral-500 text-center py-8">{t.noScores}</p>
            ) : (
              <div className="flex flex-col gap-3">
                {leaderboard.map((entry, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                    <div className="flex items-center gap-2 overflow-hidden pr-2">
                      <span className="font-bold text-lg text-neutral-800 dark:text-neutral-200 truncate">{i + 1}. {entry.name}</span>
                      <span className="text-xs font-medium px-2 py-0.5 bg-black/10 dark:bg-white/10 rounded text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                        {entry.boardSize || '4x4'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="font-mono text-purple-600 dark:text-purple-400 font-bold text-xl">{entry.score}</span>
                      <button 
                        onClick={() => handleDeleteScore(i)}
                        className="text-neutral-400 hover:text-red-500 transition-colors p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5"
                        aria-label="Delete score"
                        title="Delete score"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Settings Button (Visible when sidebar is closed) */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className={`fixed left-0 top-1/2 -translate-y-1/2 bg-black/5 dark:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/20 border-l-0 py-6 px-2 rounded-r-2xl text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/20 transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] z-40 flex items-center group ${isSidebarOpen ? 'opacity-0 pointer-events-none -translate-x-full' : 'opacity-100 translate-x-0'}`}
        aria-label="Open Settings"
      >
        <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform text-purple-600 dark:text-purple-400" />
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-sm z-40 transition-colors duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Settings Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full w-80 bg-white/90 dark:bg-black/90 backdrop-blur-2xl border-r border-black/10 dark:border-white/10 z-50 transition-transform duration-300 ease-in-out overflow-y-auto shadow-[20px_0_50px_rgba(0,0,0,0.1)] dark:shadow-[20px_0_50px_rgba(0,0,0,0.5)] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 flex flex-col gap-8 h-full relative pt-16">
          {/* Close Button */}
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="absolute top-4 right-4 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 p-2 rounded-full"
            aria-label="Close Settings Menu"
          >
            <X size={20} />
          </button>
          
          {/* Board Size Section */}
          <div>
            <div className="flex items-center gap-3 text-black dark:text-white font-bold text-xl border-b border-black/10 dark:border-white/10 pb-4 mb-4 transition-colors duration-300">
              <Grid className="text-cyan-600 dark:text-cyan-400" /> {t.boardSize}
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {boardPresets.map(p => (
                <button 
                  key={`${p.r}x${p.c}`} 
                  onClick={() => setBoardSize({ rows: p.r, cols: p.c })} 
                  className={`px-3 py-2 rounded-xl transition-all duration-200 text-sm ${
                    boardSize.rows === p.r && boardSize.cols === p.c
                      ? 'bg-black/10 dark:bg-white/20 text-black dark:text-white font-bold border border-black/20 dark:border-white/20 shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)]' 
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-neutral-200 border border-transparent'
                  }`}
                >
                  {p.r}x{p.c}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-black/5 dark:border-white/5 transition-colors duration-300">
              <input 
                type="number" 
                min="1" 
                max="20" 
                value={customRows} 
                onChange={e => setCustomRows(e.target.value)} 
                className="w-12 bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-lg px-2 py-1 text-center text-black dark:text-white focus:outline-none focus:border-cyan-500/50 transition-colors duration-300"
              />
              <span className="text-neutral-500">x</span>
              <input 
                type="number" 
                min="1" 
                max="20" 
                value={customCols} 
                onChange={e => setCustomCols(e.target.value)} 
                className="w-12 bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-lg px-2 py-1 text-center text-black dark:text-white focus:outline-none focus:border-cyan-500/50 transition-colors duration-300"
              />
              <button 
                onClick={applyCustomSize}
                className="ml-auto bg-cyan-600/20 dark:bg-cyan-600/50 hover:bg-cyan-600/30 dark:hover:bg-cyan-500/60 text-cyan-800 dark:text-white text-sm px-3 py-1.5 rounded-lg transition-colors"
              >
                {t.apply}
              </button>
            </div>
          </div>

          {/* Themes Section */}
          <div>
            <div className="flex items-center gap-3 text-black dark:text-white font-bold text-xl border-b border-black/10 dark:border-white/10 pb-4 mb-4 transition-colors duration-300">
              <Palette className="text-purple-600 dark:text-purple-400" /> {t.themes}
            </div>
            <div className="flex flex-col gap-2">
              {themes.map(th => (
                <button 
                  key={th} 
                  onClick={() => setTheme(th)} 
                  className={`capitalize text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                    theme === th 
                      ? 'bg-black/10 dark:bg-white/20 text-black dark:text-white font-bold border border-black/20 dark:border-white/20 shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-neutral-200 border border-transparent'
                  }`}
                >
                  {th}
                </button>
              ))}
            </div>
          </div>

          {/* Number Styles Section */}
          <div>
            <div className="flex items-center gap-3 text-black dark:text-white font-bold text-xl border-b border-black/10 dark:border-white/10 pb-4 mb-4 transition-colors duration-300">
              <Hash className="text-pink-600 dark:text-pink-400" /> {t.numberStyle}
            </div>
            <div className="flex flex-col gap-2">
              {numberStyles.map(s => (
                <button 
                  key={s} 
                  onClick={() => setNumberStyle(s)} 
                  className={`capitalize text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                    numberStyle === s 
                      ? 'bg-black/10 dark:bg-white/20 text-black dark:text-white font-bold border border-black/20 dark:border-white/20 shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-neutral-200 border border-transparent'
                  }`}
                >
                  {t[s as keyof typeof t]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-full max-w-[500px] h-full flex flex-col gap-3 sm:gap-4 z-10 py-2 sm:py-4">
        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-center">
          <h1 className={`text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r ${getTitleColor(theme)} tracking-tight drop-shadow-sm transition-all duration-500`}>
            2048
          </h1>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-md p-2.5 rounded-xl text-yellow-600 dark:text-yellow-500 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-300 shadow-sm"
              aria-label="Leaderboard"
            >
              <Trophy size={20} />
            </button>
            <button
              onClick={toggleLanguage}
              className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-md p-2.5 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-300 shadow-sm"
              aria-label="Toggle Language"
            >
              <Globe size={20} />
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-md p-2.5 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-300 shadow-sm"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-md rounded-xl px-4 py-1.5 flex flex-col items-center justify-center min-w-[80px] shadow-xl transition-colors duration-300">
              <span className="text-neutral-500 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">{t.score}</span>
              <span className="text-black dark:text-white font-bold text-xl leading-none">{gameState.score}</span>
            </div>
          </div>
        </div>

        {/* Controls & Name Input */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3 w-full">
          {!hasEnteredName ? (
            <div className="flex w-full sm:w-auto flex-1 gap-2">
              <input 
                type="text" 
                placeholder={t.enterName} 
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && userName.trim()) {
                    setHasEnteredName(true);
                  }
                }}
                className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 transition-colors w-full"
              />
              <button 
                onClick={() => {
                  if (userName.trim()) setHasEnteredName(true);
                }}
                className="bg-purple-600/20 dark:bg-purple-600/50 hover:bg-purple-600/30 dark:hover:bg-purple-500/60 border border-purple-500/30 dark:border-purple-500/50 text-purple-800 dark:text-white text-sm font-semibold px-3 rounded-xl transition-all duration-300 backdrop-blur-sm"
              >
                {t.save}
              </button>
            </div>
          ) : (
            <div className="flex-1 flex items-center gap-2 text-neutral-600 dark:text-neutral-400 font-medium text-sm">
              <span>{t.playingAs} <strong className="text-black dark:text-white font-bold">{userName}</strong></span>
              <button 
                onClick={() => setHasEnteredName(false)}
                className="text-neutral-500 hover:text-black dark:hover:text-white transition-colors p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10"
                aria-label="Edit name"
                title="Edit name"
              >
                <Edit2 size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Power-ups & Game Controls */}
        <div className="flex-shrink-0 flex justify-between items-center gap-2 w-full">
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEraserMode(!isEraserMode)}
              disabled={gameState.erasers === 0 || nonZeroCount <= 1}
              className={`bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/10 dark:border-white/10 text-black dark:text-white text-sm font-semibold py-2 px-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${isEraserMode ? 'ring-2 ring-red-500 bg-red-500/10 dark:bg-red-500/20' : ''}`}
              aria-label={t.eraser}
              title={t.eraser}
            >
              <Eraser size={16} className={isEraserMode ? 'text-red-500' : 'text-red-400'} />
              <span className="text-xs font-bold">{gameState.erasers}</span>
            </button>
            <button 
              onClick={toggleMultiplier}
              disabled={gameState.multipliers === 0 && !gameState.multiplierActive}
              className={`bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/10 dark:border-white/10 text-black dark:text-white text-sm font-semibold py-2 px-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${gameState.multiplierActive ? 'ring-2 ring-yellow-500 bg-yellow-500/10 dark:bg-yellow-500/20' : ''}`}
              aria-label={t.multiplier}
              title={t.multiplier}
            >
              <Zap size={16} className={gameState.multiplierActive ? 'text-yellow-500' : 'text-yellow-400'} />
              <span className="text-xs font-bold">{gameState.multiplierActive ? gameState.multipliers : gameState.multipliers}</span>
            </button>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleUndo}
              disabled={gameData.currentIndex === 0}
              className="bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/10 dark:border-white/10 text-black dark:text-white text-sm font-semibold py-2 px-3 rounded-xl transition-all duration-300 flex items-center justify-center backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              aria-label={t.undo}
              title={t.undo}
            >
              <Undo2 size={16} className="text-purple-600 dark:text-purple-400" />
            </button>
            <button 
              onClick={handleRedo}
              disabled={gameData.currentIndex === gameData.history.length - 1}
              className="bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/10 dark:border-white/10 text-black dark:text-white text-sm font-semibold py-2 px-3 rounded-xl transition-all duration-300 flex items-center justify-center backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              aria-label={t.redo}
              title={t.redo}
            >
              <Redo2 size={16} className="text-purple-600 dark:text-purple-400" />
            </button>
            <button 
              onClick={handleRestart}
              className="bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/10 dark:border-white/10 text-black dark:text-white text-sm font-semibold py-2 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm hover:shadow-[0_0_20px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
            >
              <RotateCcw size={16} className="text-purple-600 dark:text-purple-400" />
              <span className="hidden sm:inline">{t.newGame}</span>
            </button>
          </div>
        </div>

        {/* Game Board Area */}
        <div className="flex-1 min-h-0 w-full flex justify-center items-center relative p-4 sm:p-0">
          <Board 
            board={gameState.board} 
            theme={theme} 
            numberStyle={numberStyle} 
            isEraserMode={isEraserMode}
            hintCells={hintCells}
            onTileClick={handleTileClick}
          />
          
          {/* Game Over Overlay */}
          {gameState.gameOver && (
            <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-2xl animate-[fade-in_0.5s_ease-out] border border-black/10 dark:border-white/10 m-4 sm:m-0">
              <h2 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-600 dark:from-rose-400 dark:to-orange-500 mb-4 drop-shadow-lg">
                {t.gameOver}
              </h2>
              <button 
                onClick={handleRestart}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-2 px-6 rounded-xl text-base transition-all duration-300 shadow-[0_0_20px_rgba(219,39,119,0.4)] hover:shadow-[0_0_30px_rgba(219,39,119,0.6)] active:scale-95"
              >
                {t.tryAgain}
              </button>
            </div>
          )}
        </div>
        
        {/* Instructions */}
        <div className="flex-shrink-0 text-neutral-500 dark:text-neutral-500 text-xs sm:text-sm text-center bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl p-2 sm:p-3 backdrop-blur-sm transition-colors duration-300">
          <p>{t.instructions}</p>
        </div>
      </div>
      
      {/* Decorative background glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 dark:bg-purple-600/20 rounded-full blur-[120px] pointer-events-none -z-10 transition-colors duration-300"></div>
    </div>
  );
};

export default App;
