import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'tr';

type Translations = {
  title: string;
  subtitle: string;
  howToPlay: string;
  guessCount: string;
  searchPlaceholder: string;
  victory: string;
  gameOver: string;
  cardWas: string;
  playAgain: string;
  stats: string;
  gamesPlayed: string;
  bestStreak: string;
  winRate: string;
  helpTitle: string;
  helpDesc: string;
  helpTip1: string;
  helpTip2: string;
  helpTip3: string;
  close: string;
  headers: {
    card: string;
    rarity: string;
    elixir: string;
    type: string;
    arena: string;
    target: string;
    speed: string;
  };
  rarity: {
    Common: string;
    Rare: string;
    Epic: string;
    Legendary: string;
    Champion: string;
  };
  type: {
    Troop: string;
    Building: string;
    Spell: string;
  };
  target: {
    Ground: string;
    Air: string;
    Buildings: string;
    "Ground & Air": string;
    None: string;
  };
  speed: {
    Slow: string;
    Medium: string;
    Fast: string;
    "Very Fast": string;
    None: string;
  };
};

const translations: Record<Language, Translations> = {
  en: {
    title: "ROYALE GUESS",
    subtitle: "Guess the Clash Royale card!",
    howToPlay: "How to play",
    guessCount: "Guess",
    searchPlaceholder: "Type a card name...",
    victory: "VICTORY!",
    gameOver: "GAME OVER",
    cardWas: "The card was",
    playAgain: "Play Again",
    stats: "Stats",
    gamesPlayed: "Games",
    bestStreak: "Best",
    winRate: "Win %",
    helpTitle: "How to Play",
    helpDesc: "Guess the mystery Clash Royale card in 8 tries!",
    helpTip1: "Green = Correct match",
    helpTip2: "Red = Wrong match",
    helpTip3: "Orange with arrow = Close (higher/lower)",
    close: "Got it!",
    headers: {
      card: "Card",
      rarity: "Rarity",
      elixir: "Elixir",
      type: "Type",
      arena: "Arena",
      target: "Target",
      speed: "Speed"
    },
    rarity: {
      Common: "Common",
      Rare: "Rare",
      Epic: "Epic",
      Legendary: "Legendary",
      Champion: "Champion"
    },
    type: {
      Troop: "Troop",
      Building: "Building",
      Spell: "Spell"
    },
    target: {
      Ground: "Ground",
      Air: "Air",
      Buildings: "Buildings",
      "Ground & Air": "Ground & Air",
      None: "None"
    },
    speed: {
      Slow: "Slow",
      Medium: "Medium",
      Fast: "Fast",
      "Very Fast": "Very Fast",
      None: "None"
    }
  },
  tr: {
    title: "ROYALE TAHMIN",
    subtitle: "Clash Royale kartini tahmin et!",
    howToPlay: "Nasil oynanir",
    guessCount: "Tahmin",
    searchPlaceholder: "Bir kart ismi yaz...",
    victory: "ZAFER!",
    gameOver: "OYUN BITTI",
    cardWas: "Kart buydu",
    playAgain: "Tekrar Oyna",
    stats: "Istatistik",
    gamesPlayed: "Oyun",
    bestStreak: "En iyi",
    winRate: "Kazanma %",
    helpTitle: "Nasil Oynanir",
    helpDesc: "Gizemli Clash Royale kartini 8 denemede bul!",
    helpTip1: "Yesil = Dogru eslesme",
    helpTip2: "Kirmizi = Yanlis eslesme",
    helpTip3: "Turuncu ok = Yakin (yuksek/dusuk)",
    close: "Anladim!",
    headers: {
      card: "Kart",
      rarity: "Nadirlik",
      elixir: "Iksir",
      type: "Tur",
      arena: "Arena",
      target: "Hedef",
      speed: "Hiz"
    },
    rarity: {
      Common: "Siradan",
      Rare: "Ender",
      Epic: "Destansi",
      Legendary: "Efsanevi",
      Champion: "Sampiyon"
    },
    type: {
      Troop: "Birlik",
      Building: "Bina",
      Spell: "Buyu"
    },
    target: {
      Ground: "Kara",
      Air: "Hava",
      Buildings: "Binalar",
      "Ground & Air": "Kara & Hava",
      None: "Yok"
    },
    speed: {
      Slow: "Yavas",
      Medium: "Orta",
      Fast: "Hizli",
      "Very Fast": "Cok Hizli",
      None: "Yok"
    }
  }
};

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
} | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('tr'); // Varsayılan Türkçe

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
