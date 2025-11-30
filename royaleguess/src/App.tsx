import { useState, useEffect, useMemo } from 'react';
import { Search, RotateCcw, X, ChevronUp, ChevronDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import confetti from 'canvas-confetti';
import cardsDataLocalized from './data/cards-localized.json';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Card = {
  id: number;
  name: { en: string; tr: string };
  rarity: string;
  elixir: number;
  type: string;
  arena: number;
  target: string;
  speed: string;
  image: string;
};

const MAX_GUESSES = 8;
const IMAGE_BASE_URL = 'https://royaleapi.github.io/cr-api-assets/cards/';
const allCards: Card[] = cardsDataLocalized as Card[];
const getRandomCard = () => allCards[Math.floor(Math.random() * allCards.length)];
const getCardName = (card: Card, lang: 'en' | 'tr') => lang === 'tr' ? card.name.tr : card.name.en;

// Kaliteli hucre
const Cell = ({ 
  value, 
  status, 
  delay = 0, 
  isImage = false,
}: { 
  value: string | number; 
  status: 'correct' | 'incorrect' | 'higher' | 'lower' | 'default';
  delay?: number;
  isImage?: boolean;
}) => {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const getStatusStyles = () => {
    if (!revealed) return 'bg-[#3d6a9f] border-[#4a7ab5]';
    switch (status) {
      case 'correct': return 'bg-gradient-to-b from-[#34d399] to-[#10b981] border-[#059669]';
      case 'incorrect': return 'bg-gradient-to-b from-[#f87171] to-[#ef4444] border-[#dc2626]';
      case 'higher':
      case 'lower': return 'bg-gradient-to-b from-[#fbbf24] to-[#f59e0b] border-[#d97706]';
      default: return 'bg-[#3d6a9f] border-[#4a7ab5]';
    }
  };

  return (
    <div 
      className={cn(
        "h-12 md:h-14 flex items-center justify-center rounded-xl text-white font-bold border-2 shadow-sm",
        getStatusStyles(),
        revealed ? "opacity-100 scale-100" : "opacity-0 scale-95"
      )}
      style={{ transition: 'all 0.25s ease-out' }}
    >
      {isImage ? (
        <img src={`${IMAGE_BASE_URL}${value}`} alt="card" className="h-10 w-10 md:h-11 md:w-11 object-contain drop-shadow" />
      ) : (
        <div className="flex items-center gap-0.5 px-1">
          <span className="text-[10px] md:text-xs font-bold text-center leading-tight drop-shadow-sm">{value}</span>
          {revealed && status === 'higher' && <ChevronUp className="w-3.5 h-3.5" />}
          {revealed && status === 'lower' && <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      )}
    </div>
  );
};

// Tahmin satırı
const GuessRow = ({ guess, target, index }: { guess: Card; target: Card; index: number }) => {
  const { t } = useLanguage();
  const checkRarity = guess.rarity === target.rarity ? 'correct' : 'incorrect';
  const checkElixir = guess.elixir === target.elixir ? 'correct' : guess.elixir < target.elixir ? 'higher' : 'lower';
  const checkType = guess.type === target.type ? 'correct' : 'incorrect';
  const checkArena = guess.arena === target.arena ? 'correct' : guess.arena < target.arena ? 'higher' : 'lower';
  const checkTarget = guess.target === target.target ? 'correct' : 'incorrect';
  const checkSpeed = guess.speed === target.speed ? 'correct' : 'incorrect';

  // @ts-ignore
  const displayRarity = t.rarity[guess.rarity] || guess.rarity;
  // @ts-ignore
  const displayType = t.type[guess.type] || guess.type;
  // @ts-ignore
  const displayTarget = t.target[guess.target] || guess.target;
  // @ts-ignore
  const displaySpeed = t.speed[guess.speed] || guess.speed;

  return (
    <div className="grid grid-cols-7 gap-1.5 md:gap-2 mb-2 w-full">
      <Cell value={guess.image} status="default" delay={index * 40} isImage />
      <Cell value={displayRarity} status={checkRarity} delay={index * 40 + 60} />
      <Cell value={guess.elixir} status={checkElixir} delay={index * 40 + 120} />
      <Cell value={displayType} status={checkType} delay={index * 40 + 180} />
      <Cell value={`A${guess.arena}`} status={checkArena} delay={index * 40 + 240} />
      <Cell value={displayTarget} status={checkTarget} delay={index * 40 + 300} />
      <Cell value={displaySpeed} status={checkSpeed} delay={index * 40 + 360} />
    </div>
  );
};

// Basliklar
const Headers = () => {
  const { t } = useLanguage();
  const labels = ['', t.headers.rarity, t.headers.elixir, t.headers.type, t.headers.arena, t.headers.target, t.headers.speed];

  return (
    <div className="grid grid-cols-7 gap-1.5 md:gap-2 mb-3 w-full">
      {labels.map((text, i) => (
        <div key={i} className="h-6 flex items-center justify-center text-[9px] md:text-[11px] font-semibold uppercase tracking-wide text-white/50">
          {text}
        </div>
      ))}
    </div>
  );
};

// Arama çubuğu
const SearchBar = ({ onSelect, disabled, guessedIds }: { onSelect: (card: Card) => void; disabled: boolean; guessedIds: number[] }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { t, language } = useLanguage();

  const filteredCards = useMemo(() => {
    if (!query) return [];
    // Turkce locale ile kucuk harfe cevir
    const toLowerTurkish = (str: string) => str.toLocaleLowerCase('tr-TR');
    
    const lowerQuery = toLowerTurkish(query);
    return allCards
      .filter(c => !guessedIds.includes(c.id) && (
        toLowerTurkish(c.name.en).includes(lowerQuery) || 
        toLowerTurkish(c.name.tr).includes(lowerQuery)
      ))
      .slice(0, 6);
  }, [query, guessedIds]);

  return (
    <div className="relative w-full max-w-md mx-auto mb-6 z-50">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          placeholder={t.searchPlaceholder}
          disabled={disabled}
          className="w-full pl-12 pr-4 py-4 bg-[#2d5a87] border-2 border-[#4a7ab5] rounded-xl text-white text-base font-semibold placeholder-white/40 focus:outline-none focus:border-[#fbbf24] transition-colors"
        />
      </div>

      {isOpen && query && filteredCards.length > 0 && (
        <div className="absolute w-full mt-2 bg-[#2d5a87] border-2 border-[#4a7ab5] rounded-xl overflow-hidden shadow-xl">
          {filteredCards.map(card => (
            <button
              key={card.id}
              onClick={() => { onSelect(card); setQuery(''); setIsOpen(false); }}
              className="w-full px-4 py-3 text-left hover:bg-[#3d6a9f] flex items-center gap-3 border-b border-white/10 last:border-none transition-colors"
            >
              <div className="w-12 h-12 bg-[#3d6a9f] rounded-lg flex items-center justify-center">
                <img src={`${IMAGE_BASE_URL}${card.image}`} alt="" className="w-10 h-10 object-contain" />
              </div>
              <div>
                <p className="text-base font-bold text-white">{getCardName(card, language)}</p>
                <p className="text-xs text-white/50">{language === 'tr' ? card.name.en : card.name.tr}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Yardim modali
const HelpModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#1e3a5f] border-2 border-[#4a7ab5] rounded-2xl p-5 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">{t.helpTitle}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        
        <p className="text-sm text-white/60 mb-4">{t.helpDesc}</p>
        
        <div className="space-y-2 mb-5">
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#34d399] to-[#10b981] rounded-xl">
            <span className="text-sm text-white font-semibold">{t.helpTip1}</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#f87171] to-[#ef4444] rounded-xl">
            <span className="text-sm text-white font-semibold">{t.helpTip2}</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] rounded-xl">
            <span className="text-sm text-white font-semibold">{t.helpTip3}</span>
          </div>
        </div>
        
        <button onClick={onClose} className="w-full py-3 bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-[#1e3a5f] text-sm font-bold rounded-xl hover:opacity-90 transition-opacity">
          {t.close}
        </button>
      </div>
    </div>
  );
};

// Main App
function RoyaleGuessApp() {
  const { t, language, setLanguage } = useLanguage();
  const [targetCard, setTargetCard] = useState<Card>(() => getRandomCard());
  const [guesses, setGuesses] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [streak, setStreak] = useState(() => parseInt(localStorage.getItem('royale_streak') || '0'));
  const [showHelp, setShowHelp] = useState(false);
  const [gamesPlayed, setGamesPlayed] = useState(() => parseInt(localStorage.getItem('royale_games') || '0'));
  const [bestStreak, setBestStreak] = useState(() => parseInt(localStorage.getItem('royale_best') || '0'));
  const [wins, setWins] = useState(() => parseInt(localStorage.getItem('royale_wins') || '0'));

  useEffect(() => {
    localStorage.setItem('royale_streak', streak.toString());
    if (streak > bestStreak) {
      setBestStreak(streak);
      localStorage.setItem('royale_best', streak.toString());
    }
  }, [streak, bestStreak]);

  useEffect(() => { localStorage.setItem('royale_games', gamesPlayed.toString()); }, [gamesPlayed]);
  useEffect(() => { localStorage.setItem('royale_wins', wins.toString()); }, [wins]);

  const handleGuess = (card: Card) => {
    if (gameState !== 'playing') return;
    const newGuesses = [card, ...guesses];
    setGuesses(newGuesses);

    if (card.id === targetCard.id) {
      setGameState('won');
      setStreak(s => s + 1);
      setWins(w => w + 1);
      setGamesPlayed(g => g + 1);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#f0c040', '#5cb85c', '#fff', '#3d6cb3'], gravity: 0.8 });
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameState('lost');
      setStreak(0);
      setGamesPlayed(g => g + 1);
    }
  };

  const resetGame = () => {
    setTargetCard(getRandomCard());
    setGuesses([]);
    setGameState('playing');
  };

  const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;

  return (
    <div className="min-h-screen py-5 px-3">
      <div className="max-w-xl mx-auto">
        
        {/* Logo */}
        <header className="text-center mb-6">
          <img 
            src="/logo.png" 
            alt="Royale Guess" 
            className="h-16 md:h-20 mx-auto"
          />
        </header>

        {/* Stats + Buttons Row */}
        <div className="flex items-center justify-between mb-5 px-2">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-black text-white">{streak}</p>
              <p className="text-[10px] font-semibold text-white/50 uppercase">Seri</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-[#fbbf24]">{bestStreak}</p>
              <p className="text-[10px] font-semibold text-white/50 uppercase">En iyi</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-[#34d399]">{winRate}%</p>
              <p className="text-[10px] font-semibold text-white/50 uppercase">Kazanma</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowHelp(true)} 
              className="w-9 h-9 bg-[#2d5a87] hover:bg-[#3d6a9f] border border-[#4a7ab5] text-white text-sm font-bold rounded-lg flex items-center justify-center transition-colors"
            >
              ?
            </button>
            <button 
              onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
              className="h-9 px-3 bg-[#2d5a87] hover:bg-[#3d6a9f] border border-[#4a7ab5] text-white text-lg rounded-lg flex items-center justify-center transition-colors"
            >
              {language === 'tr' ? '🇹🇷' : '🇬🇧'}
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-1.5 mb-5">
          {Array.from({ length: MAX_GUESSES }).map((_, i) => (
            <div key={i} className={cn(
              "w-3 h-3 rounded-full transition-all",
              i < guesses.length
                ? guesses[i].id === targetCard.id ? "bg-[#34d399]" : "bg-[#f87171]"
                : "bg-white/20"
            )} />
          ))}
          <span className="ml-2 text-sm font-bold text-white/60">{guesses.length}/{MAX_GUESSES}</span>
        </div>

        {/* Result */}
        {gameState !== 'playing' && (
          <div className="mb-5">
            <div className="bg-[#2d5a87] border-2 border-[#4a7ab5] rounded-2xl p-6 text-center">
              <p className={cn(
                "text-2xl font-black mb-3",
                gameState === 'won' ? "text-[#34d399]" : "text-[#f87171]"
              )}>
                {gameState === 'won' ? '🎉 ' + t.victory : t.gameOver}
              </p>

              <p className="text-white/50 text-sm mb-3">{t.cardWas}</p>

              <div className="w-24 h-24 mx-auto mb-3 bg-[#3d6a9f] rounded-xl p-2">
                <img src={`${IMAGE_BASE_URL}${targetCard.image}`} alt="" className="w-full h-full object-contain" />
              </div>

              <p className="text-xl font-black text-[#fbbf24] mb-5">{getCardName(targetCard, language)}</p>

              <button 
                onClick={resetGame} 
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#34d399] to-[#10b981] text-white text-base font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                <RotateCcw className="w-4 h-4" />
                {t.playAgain}
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        {gameState === 'playing' && (
          <SearchBar onSelect={handleGuess} disabled={false} guessedIds={guesses.map(g => g.id)} />
        )}

        {/* Grid */}
        <div className="w-full">
          <Headers />
          <div className="flex flex-col">
            {guesses.map((guess, idx) => (
              <GuessRow key={`${guess.id}-${idx}`} guess={guess} target={targetCard} index={idx} />
            ))}
            {gameState === 'playing' && Array.from({ length: Math.max(0, Math.min(3, MAX_GUESSES - guesses.length)) }).map((_, idx) => (
              <div key={`empty-${idx}`} className={cn(
                "grid grid-cols-7 gap-1.5 md:gap-2 mb-2",
                idx === 0 ? "opacity-40" : "opacity-20"
              )}>
                {Array.from({ length: 7 }).map((_, cIdx) => (
                  <div key={cIdx} className="h-12 md:h-14 bg-[#3d6a9f] rounded-xl border-2 border-[#4a7ab5]"></div>
                ))}
              </div>
            ))}
          </div>
        </div>

      </div>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <RoyaleGuessApp />
    </LanguageProvider>
  );
}

export default App;
