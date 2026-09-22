"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useRef, useMemo } from "react";
import { AlertCircle, ArrowLeftRight, Award, BookOpen, CheckCircle2, ExternalLink, Flame, Gem, Grid3X3, Home as HomeIcon, KeyRound, Languages, LibraryBig, LockKeyhole, LogIn, LogOut, MapPinned, PenTool, Puzzle, RotateCcw, ScrollText, Send, Smile, Sparkles, Trash2, Trophy, User, UserPlus, UserRound, Volume2, VolumeX, X, type LucideIcon } from "lucide-react";
import { HEURIST_COLOPHONS } from "./data/colophons.generated";
import { supabase } from "@/lib/supabase";
import {
  DEFAULT_QUESTIONS,
  type QuestionData,
  getQuestionTitle,
  getQuestionIntro,
  getQuestionTranslation,
  getQuestionOptions,
  getQuestionExplanation,
  getQuestionHint,
} from "./data/questions.generated";
import {
  DEFAULT_CURIOS,
  type Curio,
  getCurioCategory,
  getCurioText,
  getCurioTitle,
  getCurioSource,
} from "./data/curios";
import {
  SCRIPTORIA_PLACES,
  getScriptoriumForCard,
  getScriptoriaWithCards,
  type ScriptoriumPlace,
  getPlaceName,
  getPlaceRegion,
  getPlaceCountry,
  getPlaceRepository,
  getPlaceDescription,
} from "./data/scriptoria";
import {
  type Language,
  UI_TRANSLATIONS,
  getCardTitle,
  getCardTranslation,
  getCardRarityReason,
  getCardScribe,
  getCardPlace,
} from "./data/translations";
import {
  DEFAULT_ILLUMINATIONS,
  type IlluminationMosaicItem,
  getStoredIlluminations,
  getActiveIllumination,
  getDaysDifference,
  getIlluminationTitle,
  getIlluminationOrigin,
  getIlluminationCentury,
  getIlluminationTierName,
  getIlluminationDescription,
} from "./data/illuminations";
import RealLeafletMap from "./components/RealLeafletMap";
import {
  isSoundEnabled,
  setSoundEnabled,
  playSealCrack,
  playParchmentFlip,
  playQuillScratch,
  playTriumphFanfare,
  playSoftClick,
} from "./audio";
import {
  type TrophyItem,
  type TrophyDifficulty,
  type TrophyCategoryItem,
  TROPHY_DIFFICULTY_META,
  getStoredTrophies,
  getStoredTrophyCategories,
  evaluateTrophy,
} from "./data/trophies";

type Tab = "home" | "packs" | "collection" | "trophies" | "profile";
type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Unique";
type GameKind = "mood" | "cipher" | "paleo";
type PackQuality = "standard" | "refined" | "masterwork";

type Colophon = {
  id: number | string;
  uuid?: string;
  slug?: string;
  title: string;
  title_cs?: string;
  title_en?: string;
  quote: string;
  translation: string;
  translation_cs?: string;
  translation_en?: string;
  scribe: string;
  place: string;
  year: number;
  rarity: Rarity;
  mood: string;
  sigil: string;
  imageUrl: string;
  remoteImageUrl: string;
  manuscript: string;
  locus: string;
  sourceUrl: string;
  formulaFrequency?: number;
  features?: readonly string[];
  rarityReason?: string;
  rarityReason_cs?: string;
  rarityReason_en?: string;
  visualNote?: string;
  crop_x?: number;
  crop_y?: number;
  crop_w?: number;
  crop_h?: number;
};

type TradeItem = {
  card_id: string | number;
  title: string;
  rarity: Rarity;
  count: number;
  crop_x?: number;
  crop_y?: number;
  crop_w?: number;
  crop_h?: number;
  imageUrl?: string;
};

type CardTrade = {
  id: string;
  sender_id: string;
  sender_name: string;
  recipient_id: string;
  recipient_name: string;
  sender_offer: TradeItem[];
  recipient_request: TradeItem[];
  message?: string;
  status: "pending" | "accepted" | "declined" | "countered";
  parent_trade_id?: string;
  created_at?: string;
};

type GameState = {
  packsOpened: number;
  collection: Record<string | number, number>;
  xp: number;
  coins: number;
  streak: number;
  puzzle: number;
  trophies: string[];
  trophyTimestamps?: Record<string, string>;
  loupeMaxUsed?: boolean;
  lastPlayed: string;
  gamesPlayed: number;
  dailyGamesHistory?: ("success" | "fail")[];
  completedQuestionsToday?: string[];
  dailyTradedPartners?: string[];
  bonusPacks: PackQuality[];
  lastLoginDate: string;
  gallery: string[];
  avatarArt: string | null;
  hasSeenTutorial?: boolean;
  lastDailyPopupDate?: string;
};

const ILLUMINATIONS = DEFAULT_ILLUMINATIONS;

const CARDS_OVERRIDES_KEY = "quilldrop-cards-overrides";

function getStoredCardOverrides(): Record<string, { title_en?: string | null; rarity_reason_en?: string | null }> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CARDS_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const COLOPHONS: Colophon[] = HEURIST_COLOPHONS.map(card => ({ ...card })) as Colophon[];

// Výchozí demo stav pro neregistrovaného návštěvníka / hosta
const INITIAL_STATE: GameState = {
  packsOpened: 0,
  collection: Object.fromEntries(COLOPHONS.slice(0, 4).map((card, index) => [card.id, index === 1 ? 2 : 1])),
  xp: 120,
  coins: 140,
  streak: 1,
  puzzle: 1,
  trophies: ["first-spark"],
  trophyTimestamps: { "first-spark": new Date().toISOString() },
  loupeMaxUsed: false,
  lastPlayed: "",
  gamesPlayed: 0,
  dailyGamesHistory: [],
  completedQuestionsToday: [],
  dailyTradedPartners: [],
  bonusPacks: [],
  lastLoginDate: "",
  gallery: [],
  avatarArt: null,
  hasSeenTutorial: true,
  lastDailyPopupDate: "",
};

// Čistý štít pro nově registrovaného hráče (0 karet, 0 XP, prázdné trofeje, tutoriál připraven)
const EMPTY_PLAYER_STATE: GameState = {
  packsOpened: 0,
  collection: {},
  xp: 0,
  coins: 50,
  streak: 1,
  puzzle: 1,
  trophies: [],
  trophyTimestamps: {},
  loupeMaxUsed: false,
  lastPlayed: "",
  gamesPlayed: 0,
  dailyGamesHistory: [],
  completedQuestionsToday: [],
  dailyTradedPartners: [],
  bonusPacks: [],
  lastLoginDate: "",
  gallery: [],
  avatarArt: null,
  hasSeenTutorial: false,
  lastDailyPopupDate: "",
};

const NAV: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "home", label: "Skriptorium", icon: HomeIcon },
  { id: "packs", label: "Balíčky", icon: ScrollText },
  { id: "collection", label: "Sbírka", icon: LibraryBig },
  { id: "trophies", label: "Výzvy", icon: Trophy },
  { id: "profile", label: "Profil", icon: UserRound },
];

export const MAX_DAILY_PACKS = 3;
export const MAX_DAILY_GAMES = 5;

const today = () => new Date().toISOString().slice(0, 10);
const XP_PER_LEVEL = 100;
const levelForXp = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;
const qualityLabel = (quality: PackQuality, lang?: Language) => {
  if (lang === "en") {
    if (quality === "masterwork") return "Masterwork Pack";
    if (quality === "refined") return "Scholar Pack";
    return "Standard Pack";
  }
  if (quality === "masterwork") return "Královský balíček";
  if (quality === "refined") return "Učencův balíček";
  return "Běžný balíček";
};

const formatPacksCount = (n: number): string => {
  if (n === 1) return "1 balíček";
  if (n >= 2 && n <= 4) return `${n} balíčky`;
  return `${n} balíčků`;
};

type UserProfile = {
  id: string;
  username: string;
  display_name: string;
  role?: string;
  avatar_id?: string | null;
  xp?: number;
  coins?: number;
  streak?: number;
  puzzle_progress?: number;
  bonus_packs?: PackQuality[];
  trophies?: string[];
  last_played_date?: string | null;
  created_at?: string;
};

function withXpReward(state: GameState, amount: number): GameState {
  const nextXp = state.xp + amount;
  const levelsEarned = Math.max(0, levelForXp(nextXp) - levelForXp(state.xp));
  return {
    ...state,
    xp: nextXp,
    bonusPacks: [...state.bonusPacks, ...Array.from({ length: levelsEarned }, () => "masterwork" as PackQuality)],
  };
}

function loadState(userId?: string): GameState {
  if (typeof window === "undefined") return userId ? EMPTY_PLAYER_STATE : INITIAL_STATE;
  try {
    const key = userId ? `quilldrop-state-${userId}` : "quilldrop-state";
    const saved = JSON.parse(localStorage.getItem(key) || "null");

    // Pro přihlášeného uživatele je základem čistý stav, pro anonymního návštěvníka demo stav
    const baseTemplate = userId ? EMPTY_PLAYER_STATE : INITIAL_STATE;
    const base: GameState = {
      ...baseTemplate,
      ...(saved || {}),
      bonusPacks: saved?.bonusPacks || [],
      gallery: saved?.gallery || [],
      trophyTimestamps: saved?.trophyTimestamps || (userId ? {} : { "first-spark": new Date().toISOString() }),
      loupeMaxUsed: saved?.loupeMaxUsed || false,
      dailyGamesHistory: Array.isArray(saved?.dailyGamesHistory) ? saved.dailyGamesHistory : [],
      completedQuestionsToday: saved?.completedQuestionsToday || [],
      dailyTradedPartners: saved?.dailyTradedPartners || [],
      hasSeenTutorial: saved?.hasSeenTutorial !== undefined ? saved.hasSeenTutorial : (userId ? false : true),
      lastDailyPopupDate: saved?.lastDailyPopupDate || "",
    };

    // Pouze pro nepřihlášené návštěvníky doplňujeme ukázkové karty, pokud nemají žádné
    if (!userId) {
      const hasCurrentCards = Object.keys(base.collection).some(id => COLOPHONS.some(card => String(card.id) === String(id)));
      if (!hasCurrentCards) base.collection = { ...INITIAL_STATE.collection };
    }

    const todayStr = today();
    const isNewDay = base.lastPlayed !== todayStr;
    const dailyReset: GameState = isNewDay
      ? { ...base, packsOpened: 0, gamesPlayed: 0, dailyGamesHistory: [], completedQuestionsToday: [], dailyTradedPartners: [], bonusPacks: [], lastPlayed: todayStr }
      : base;

    // Pokud se uživatel již dnes přihlásil, streak byl pro dnešek započten
    if (dailyReset.lastLoginDate === todayStr) {
      return dailyReset;
    }

    const illuminationsList = getStoredIlluminations();
    const daysDiff = dailyReset.lastLoginDate ? getDaysDifference(dailyReset.lastLoginDate, todayStr) : 0;

    let nextStreak = dailyReset.streak || 1;
    let nextPuzzle = dailyReset.puzzle || 1;
    let nextGallery = [...dailyReset.gallery];
    let nextBonusPacks = [...dailyReset.bonusPacks];
    let nextXp = dailyReset.xp;

    if (!dailyReset.lastLoginDate) {
      // Úplně první přihlášení uživatele
      nextStreak = 1;
      nextPuzzle = 1;
    } else if (daysDiff === 1) {
      // Nepřerušený denní streak (návštěva v po sobě jdoucí kalendářní den)
      nextStreak = (dailyReset.streak || 0) + 1;
      nextPuzzle = ((nextStreak - 1) % 16) + 1;

      // Pokud právě dnes dosáhl 16. fragmentu, dokončil celou iluminaci
      if (nextPuzzle === 16) {
        const completedArt = getActiveIllumination(nextStreak, illuminationsList);
        if (!nextGallery.includes(completedArt.id)) {
          nextGallery.push(completedArt.id);
        }
        nextXp += completedArt.rewardXp || 200;
        if (completedArt.rewardPack) {
          nextBonusPacks.push(completedArt.rewardPack);
        }
      }
    } else if (daysDiff > 1) {
      // Vynechán jeden nebo více dní -> porušení streaku!
      // Dle pravidel: uživatel musí začít od znovu (den 1, fragment 1)
      nextStreak = 1;
      nextPuzzle = 1;
    }

    return {
      ...dailyReset,
      streak: nextStreak,
      puzzle: nextPuzzle,
      lastLoginDate: todayStr,
      lastPlayed: todayStr,
      gallery: nextGallery,
      bonusPacks: nextBonusPacks,
      xp: nextXp,
    };
  } catch {
    return INITIAL_STATE;
  }
}

export default function Home() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("home");
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [cards, setCards] = useState<Colophon[]>(COLOPHONS);
  const [isLive, setIsLive] = useState(false);
  const [detail, setDetail] = useState<Colophon | null>(null);
  const [opened, setOpened] = useState<Colophon[] | null>(null);
  const [reveal, setReveal] = useState(0);
  const [cardShown, setCardShown] = useState(false);
  const [packQuality, setPackQuality] = useState<PackQuality>("standard");
  const [toast, setToast] = useState("");
  const [questions, setQuestions] = useState<QuestionData[]>(DEFAULT_QUESTIONS);
  const [activeQuestion, setActiveQuestion] = useState<QuestionData | null>(null);
  const [game, setGame] = useState<GameKind | null>(null);
  const [gameStep, setGameStep] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [filter, setFilter] = useState<Rarity | "All">("All");
  const [showMap, setShowMap] = useState(false);
  const [mapInitialPlace, setMapInitialPlace] = useState<ScriptoriumPlace | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const [pendingPackLevel, setPendingPackLevel] = useState<number | null>(null);
  const [pendingGameLevel, setPendingGameLevel] = useState<number | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [curios, setCurios] = useState<Curio[]>(DEFAULT_CURIOS);
  const [curioIndex, setCurioIndex] = useState(0);

  // Kolegové ve skriptoriu a P2P darování karet (Social Trading)
  const [colleagues, setColleagues] = useState<any[]>([
    { id: "demo-1", display_name: "Lucie z Klementina", username: "lucie.d", streak: 14, xp: 850, avatar_id: "urban-v" },
    { id: "demo-2", display_name: "Bratr Jan (Vyšší Brod)", username: "frater.iohannes", streak: 9, xp: 620, avatar_id: "codex-gigas" },
    { id: "demo-3", display_name: "Matouš ze Skriptoria", username: "matheus.scribe", streak: 5, xp: 340, avatar_id: "rabbit-scribe" },
  ]);
  const [pendingGifts, setPendingGifts] = useState<any[]>([]);
  const [giftModalTarget, setGiftModalTarget] = useState<any | null>(null);
  const [selectedGiftCardId, setSelectedGiftCardId] = useState<string>("");
  const [giftMessage, setGiftMessage] = useState<string>("");
  const [isSendingGift, setIsSendingGift] = useState(false);

  // P2P Vzájemná směna karet (Bilateral Card Trading)
  const [pendingTrades, setPendingTrades] = useState<CardTrade[]>([
    {
      id: "demo-trade-1",
      sender_id: "demo-1",
      sender_name: "Lucie z Klementina",
      recipient_id: "me",
      recipient_name: "Vy",
      sender_offer: [
        {
          card_id: COLOPHONS[2]?.id || "3",
          title: COLOPHONS[2]?.title || "Iniciála sv. Jeronýma",
          rarity: (COLOPHONS[2]?.rarity as Rarity) || "Rare",
          count: 1,
          imageUrl: COLOPHONS[2]?.imageUrl,
        },
      ],
      recipient_request: [
        {
          card_id: COLOPHONS[0]?.id || "1",
          title: COLOPHONS[0]?.title || "Pražský kodex písaře Václava",
          rarity: (COLOPHONS[0]?.rarity as Rarity) || "Uncommon",
          count: 1,
          imageUrl: COLOPHONS[0]?.imageUrl,
        },
      ],
      message: "Zdravím ze skriptoria! Chybí mi tento pražský kolofon. Rád ti za něj nabídnu tuto vzácnou iluminaci.",
      status: "pending",
      created_at: new Date().toISOString(),
    },
  ]);
  const [activeTradeModal, setActiveTradeModal] = useState<{
    colleague: any;
    initialOffer?: TradeItem[];
    initialRequest?: TradeItem[];
    message?: string;
    parentTradeId?: string;
  } | null>(null);
  const [reviewTradeModal, setReviewTradeModal] = useState<CardTrade | null>(null);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [showDailyPieceModal, setShowDailyPieceModal] = useState(false);

  // Jazyk rozhraní a karet (Čeština / English)
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("quilldrop-lang") as Language;
      if (saved === "cs" || saved === "en") return saved;
    }
    return "cs";
  });

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("quilldrop-lang", newLang);
    }
  };

  // 16dílné iluminace a denní streak (Cesta písaře)
  const [illuminations, setIlluminations] = useState<IlluminationMosaicItem[]>(DEFAULT_ILLUMINATIONS);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIlluminations(getStoredIlluminations());
    }
  }, []);

  const activeIllumination = useMemo(() => {
    return getActiveIllumination(state.streak, illuminations);
  }, [state.streak, illuminations]);

  // Uživatel a autentizace
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authDisplayName, setAuthDisplayName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccessMsg, setAuthSuccessMsg] = useState("");
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  async function syncToSupabase(userId: string, st: GameState, currentCards: Colophon[]) {
    try {
      await supabase.from("profiles").upsert({
        id: userId,
        xp: st.xp,
        coins: st.coins,
        streak: st.streak,
        puzzle_progress: st.puzzle,
        bonus_packs: st.bonusPacks,
        trophies: st.trophies,
        avatar_id: st.avatarArt,
        last_played_date: st.lastPlayed || today(),
        updated_at: new Date().toISOString(),
      });

      const cardMap = new Map<string, number>();
      for (const [cardKey, count] of Object.entries(st.collection)) {
        if (!count || count <= 0) continue;
        const match = currentCards.find(c => String(c.id) === String(cardKey) || c.uuid === String(cardKey));
        const uuid = match?.uuid || (typeof cardKey === "string" && cardKey.length === 36 ? cardKey : null);
        if (uuid) {
          cardMap.set(uuid, Math.max(cardMap.get(uuid) || 0, count));
        }
      }

      const rows = Array.from(cardMap.entries()).map(([card_id, count]) => ({
        user_id: userId,
        card_id,
        count,
      }));

      if (rows.length > 0) {
        const { error: ucErr } = await supabase.from("user_cards").upsert(rows, { onConflict: "user_id,card_id" });
        if (ucErr) {
          console.warn("user_cards upsert warning:", ucErr.message);
        }
      }
    } catch (e) {
      console.warn("Supabase sync warning:", e);
    }
  }

  async function loadUserData(user: any, currentCards: Colophon[]) {
    try {
      let { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) {
        const defaultName = user.user_metadata?.display_name || user.email?.split("@")[0] || "Písař";
        const { data: newProfile } = await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            username: defaultName,
            display_name: defaultName,
            role: "player",
            xp: EMPTY_PLAYER_STATE.xp,
            coins: EMPTY_PLAYER_STATE.coins,
            streak: EMPTY_PLAYER_STATE.streak,
            puzzle_progress: EMPTY_PLAYER_STATE.puzzle,
            bonus_packs: EMPTY_PLAYER_STATE.bonusPacks,
            trophies: EMPTY_PLAYER_STATE.trophies,
            last_played_date: today(),
          })
          .select()
          .maybeSingle();
        profile = newProfile;
      }

      if (profile) {
        setCurrentProfile(profile as UserProfile);
      }

      const { data: userCards } = await supabase
        .from("user_cards")
        .select("card_id, count")
        .eq("user_id", user.id);

      const local = loadState(user.id);
      const mergedCollection: Record<string | number, number> = { ...local.collection };

      if (userCards && userCards.length > 0) {
        for (const uc of userCards) {
          const cardMatch = (currentCards.length > 0 ? currentCards : COLOPHONS).find(
            c => c.uuid === uc.card_id || String(c.id) === uc.card_id
          );
          const cardKey = cardMatch ? cardMatch.id : uc.card_id;
          mergedCollection[cardKey] = Math.max(mergedCollection[cardKey] || 0, uc.count || 1);
          if (cardMatch && String(cardMatch.id) !== String(uc.card_id) && mergedCollection[uc.card_id]) {
            delete mergedCollection[uc.card_id];
          }
        }
      }

      const mergedState: GameState = {
        ...local,
        xp: profile?.xp !== undefined ? Math.max(local.xp, profile.xp) : local.xp,
        coins: profile?.coins !== undefined ? Math.max(local.coins, profile.coins) : local.coins,
        streak: profile?.streak !== undefined ? Math.max(local.streak, profile.streak) : local.streak,
        puzzle: profile?.puzzle_progress !== undefined ? Math.max(local.puzzle, profile.puzzle_progress) : local.puzzle,
        bonusPacks: Array.isArray(profile?.bonus_packs) && profile.bonus_packs.length > 0 ? (profile.bonus_packs as PackQuality[]) : local.bonusPacks,
        trophies: Array.isArray(profile?.trophies) && profile.trophies.length > 0 ? Array.from(new Set([...local.trophies, ...profile.trophies])) : local.trophies,
        trophyTimestamps: local.trophyTimestamps || {},
        avatarArt: profile?.avatar_id || local.avatarArt,
        collection: mergedCollection,
        hasSeenTutorial: local.hasSeenTutorial ?? false,
        lastDailyPopupDate: local.lastDailyPopupDate || "",
      };

      setState(mergedState);
      if (typeof window !== "undefined") {
        localStorage.setItem(`quilldrop-state-${user.id}`, JSON.stringify(mergedState));
      }

      // Pokud nový hráč ještě neviděl úvodní tutoriál, automaticky jej otevřeme
      if (!mergedState.hasSeenTutorial) {
        setShowTutorialModal(true);
      }
    } catch (err) {
      console.warn("Failed to load user data from Supabase:", err);
    }
  }

  useEffect(() => {
    let isMounted = true;
    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (session?.user) {
          setCurrentUser(session.user);
          await loadUserData(session.user, cards);
          setShowAuthModal(false);
        } else {
          setShowAuthModal(true);
        }
      } catch (e) {
        console.warn("Auth initialization error:", e);
      } finally {
        if (isMounted) setAuthChecking(false);
      }
    }

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        setCurrentUser(session.user);
        await loadUserData(session.user, cards);
        setShowAuthModal(false);
      } else {
        setCurrentUser(null);
        setCurrentProfile(null);
        setShowAuthModal(true);
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setSoundOn(isSoundEnabled());

    // Denní rotace glosy podle dne v roce
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    setCurioIndex(dayOfYear % DEFAULT_CURIOS.length);

    // Načtení případných upravených glos ze Studia (localStorage)
    if (typeof window !== "undefined") {
      try {
        const savedCurios = localStorage.getItem("quilldrop-curios");
        if (savedCurios) {
          const parsed = JSON.parse(savedCurios);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCurios(parsed);
            setCurioIndex(dayOfYear % parsed.length);
          }
        }
      } catch {
        // fallback to DEFAULT_CURIOS
      }
    }
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playSoftClick();
  };

  const nextCurio = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurioIndex(prev => (prev + 1) % curios.length);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setState(loadState());
      setReady(true);
    }, 0);

    async function fetchLiveCards() {
      try {
        let { data, error } = await supabase
          .from("cards")
          .select(`
            id,
            slug,
            title,
            title_en,
            rarity,
            rarity_reason,
            rarity_reason_en,
            mood,
            sigil,
            status,
            image_url,
            crop_x,
            crop_y,
            crop_w,
            crop_h,
            colophons (
              id,
              heurist_id,
              quote,
              translation_cs,
              translation_en,
              scribe,
              place,
              year,
              locus,
              manuscript_shelfmark,
              visual_note,
              features,
              formula_frequency,
              source_url
            )
          `)
          .eq("status", "published")
          .order("created_at", { ascending: true });

        if (error && (error.code === "PGRST204" || error.message?.includes("translation_en") || error.message?.includes("title_en"))) {
          const fallback = await supabase
            .from("cards")
            .select(`
              id,
              slug,
              title,
              rarity,
              rarity_reason,
              mood,
              sigil,
              status,
              image_url,
              crop_x,
              crop_y,
              crop_w,
              crop_h,
              colophons (
                id,
                heurist_id,
                quote,
                translation_cs,
                scribe,
                place,
                year,
                locus,
                manuscript_shelfmark,
                visual_note,
                features,
                formula_frequency,
                source_url
              )
            `)
            .eq("status", "published")
            .order("created_at", { ascending: true });
          data = fallback.data as any;
          error = fallback.error;
        }

        if (!error && data && data.length > 0) {
          const overrides = getStoredCardOverrides();
          const mapped: Colophon[] = (data as any[]).map((c: any) => {
            const ov = overrides[c.id];
            return {
              id: c.colophons?.heurist_id || c.id,
              uuid: c.id,
              slug: c.slug,
              title: c.title,
              title_cs: c.title,
              title_en: c.title_en || ov?.title_en || undefined,
              quote: c.colophons?.quote || "Explicit...",
              translation: c.colophons?.translation_cs || "Překlad se připravuje",
              translation_cs: c.colophons?.translation_cs || undefined,
              translation_en: c.colophons?.translation_en || undefined,
              scribe: c.colophons?.scribe || "Neznámý písař",
              place: c.colophons?.place || "Neznámé místo",
              year: c.colophons?.year || 1400,
              rarity: c.rarity as Rarity,
              mood: c.mood || "scribal voice",
              sigil: c.sigil || "Q",
              imageUrl: c.image_url,
              remoteImageUrl: c.image_url,
              manuscript: c.colophons?.manuscript_shelfmark || "Neznámý rukopis",
              locus: c.colophons?.locus || "fol. ?",
              sourceUrl: c.colophons?.source_url || c.image_url,
              formulaFrequency: c.colophons?.formula_frequency || 1,
              features: c.colophons?.features || [],
              rarityReason: c.rarity_reason,
              rarityReason_cs: c.rarity_reason,
              rarityReason_en: c.rarity_reason_en || ov?.rarity_reason_en || undefined,
              visualNote: c.colophons?.visual_note,
              crop_x: Number(c.crop_x) || 0,
              crop_y: Number(c.crop_y) || 0,
              crop_w: Number(c.crop_w) || 100,
              crop_h: Number(c.crop_h) || 100,
            };
          });
          setCards(mapped);
          setIsLive(true);
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await loadUserData(user, mapped);
            // Načíst příchozí nevyřízené dary pro tohoto hráče
            try {
              const { data: gifts } = await supabase
                .from("card_gifts")
                .select("*")
                .eq("recipient_id", user.id)
                .eq("status", "pending");
              if (gifts && gifts.length > 0) {
                setPendingGifts(gifts);
              }
            } catch {}
            // Načíst příchozí návrhy směny pro tohoto hráče
            try {
              const { data: trades } = await supabase
                .from("card_trades")
                .select("*")
                .eq("recipient_id", user.id)
                .eq("status", "pending")
                .order("created_at", { ascending: false });
              if (trades && trades.length > 0) {
                setPendingTrades(trades);
              }
            } catch {}
          }
          // Načíst reálné kolegy z tabulky profiles
          try {
            const { data: profs } = await supabase
              .from("profiles")
              .select("id, username, display_name, streak, xp, avatar_id, role")
              .order("streak", { ascending: false })
              .limit(30);
            if (profs && profs.length > 0) {
              const filtered = user ? profs.filter((p: any) => p.id !== user.id) : profs;
              // Seřadit: mistři skriptoria (admini) nahoře, dále podle XP sestupně
              filtered.sort((a: any, b: any) => {
                if (a.role === "admin" && b.role !== "admin") return -1;
                if (b.role === "admin" && a.role !== "admin") return 1;
                return (b.xp || 0) - (a.xp || 0);
              });
              const realIds = new Set(filtered.map((p: any) => p.id));
              const demoFallbacks = [
                { id: "demo-1", display_name: "Lucie z Klementina", username: "lucie.d", streak: 14, xp: 850, avatar_id: "urban-v", role: "demo" },
                { id: "demo-2", display_name: "Bratr Jan (Vyšší Brod)", username: "frater.iohannes", streak: 9, xp: 620, avatar_id: "codex-gigas", role: "demo" },
                { id: "demo-3", display_name: "Matouš ze Skriptoria", username: "matheus.scribe", streak: 5, xp: 340, avatar_id: "rabbit-scribe", role: "demo" },
              ];
              const combined = [
                ...filtered,
                ...demoFallbacks.filter((d) => !realIds.has(d.id)),
              ];
              setColleagues(combined);
            }
          } catch {}
        }

        // Fetch live educational questions for mini-games
        const { data: qData, error: qError } = await supabase
          .from("game_questions")
          .select("*")
          .eq("is_active", true);

        if (!qError && qData && qData.length > 0) {
          const loadedQuestions: QuestionData[] = qData.map((q: any) => {
            let choices: [string, string][] = [];
            let choicesEn: [string, string][] | undefined = undefined;
            let mode = q.game_kind;
            let highlightRegions = q.highlight_regions;
            let targetTranscription = q.target_transcription;
            let acceptedVariants = q.accepted_variants;

            if (Array.isArray(q.options)) {
              choices = q.options;
            } else if (q.options && typeof q.options === "object") {
              if (Array.isArray(q.options.choices)) choices = q.options.choices;
              if (Array.isArray(q.options.choices_en)) choicesEn = q.options.choices_en;
              if (q.options.mode) mode = q.options.mode;
              if (q.options.highlight_regions) highlightRegions = q.options.highlight_regions;
              if (q.options.target_transcription) targetTranscription = q.options.target_transcription;
              if (q.options.accepted_variants) acceptedVariants = q.options.accepted_variants;
            }

            if (Array.isArray(q.options_en)) {
              choicesEn = q.options_en;
            }

            if (!mode) {
              if (highlightRegions || targetTranscription) mode = "transcription";
              else if (q.game_kind === "paleo") mode = "script";
              else mode = q.game_kind;
            }

            return {
              id: q.id,
              card_id: q.card_id,
              game_kind: q.game_kind,
              mode: mode as any,
              title: q.title,
              title_en: q.title_en || q.options?.title_en,
              intro: q.intro,
              intro_en: q.intro_en || q.options?.intro_en,
              quote: q.quote,
              translation_cs: q.translation_cs || q.options?.translation_cs,
              translation_en: q.translation_en || q.options?.translation_en,
              options: choices,
              options_en: choicesEn,
              correct_index: Number(q.correct_index) || 0,
              explanation: q.explanation || q.options?.explanation || undefined,
              explanation_en: q.explanation_en || q.options?.explanation_en || undefined,
              hint: q.hint || q.options?.hint || undefined,
              hint_en: q.hint_en || q.options?.hint_en || undefined,
              difficulty: q.difficulty || "medium",
              is_active: q.is_active,
              highlight_regions: highlightRegions,
              target_transcription: targetTranscription,
              accepted_variants: acceptedVariants,
            };
          });
          const existingKeys = new Set(loadedQuestions.map(q => q.id || q.title));
          const combined = [
            ...loadedQuestions,
            ...DEFAULT_QUESTIONS.filter(q => !existingKeys.has(q.id || q.title)),
          ];
          setQuestions(combined);
        }
      } catch (e) {
        console.warn("Supabase fetch failed, continuing with static data:", e);
      }
    }

    fetchLiveCards();

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const key = currentUser ? `quilldrop-state-${currentUser.id}` : "quilldrop-state";
    localStorage.setItem(key, JSON.stringify({ ...state, lastPlayed: today() }));

    if (currentUser) {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => {
        syncToSupabase(currentUser.id, state, cards);
      }, 1200);
    }
  }, [state, ready, currentUser, cards]);

  // Automatické zobrazení denního pop-up okna při prvním přihlášení / návštěvě daného dne
  useEffect(() => {
    if (ready && !showTutorialModal && state.lastDailyPopupDate !== today()) {
      setShowDailyPieceModal(true);
    }
  }, [ready, showTutorialModal, state.lastDailyPopupDate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setAuthSuccessMsg("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail.trim(),
        password: authPassword,
      });
      if (error) {
        if (error.message.includes("Email not confirmed")) {
          setAuthError(lang === "en" ? "Email has not been confirmed yet. Please check your inbox and click the confirmation link." : "E-mail ještě nebyl potvrzen. Zkontrolujte prosím svou doručenou poštu a klikněte na potvrzovací odkaz.");
        } else if (error.message.includes("Invalid login credentials")) {
          setAuthError(lang === "en" ? "Invalid login credentials. Please check your email and password." : "Neplatné přihlašovací údaje. Zkontrolujte e-mail a heslo.");
        } else {
          setAuthError(error.message);
        }
      } else if (data.user) {
        setCurrentUser(data.user);
        await loadUserData(data.user, cards);
        setShowAuthModal(false);
        setToast(lang === "en" ? "Welcome back to the scriptorium!" : "Vítejte zpět ve skriptoriu!");
      }
    } catch (err: any) {
      setAuthError(err.message || (lang === "en" ? "Sign in failed." : "Přihlášení se nezdařilo."));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setAuthSuccessMsg("");
    const name = authDisplayName.trim() || authEmail.split("@")[0] || (lang === "en" ? "Scribe" : "Písař");
    try {
      const { data, error } = await supabase.auth.signUp({
        email: authEmail.trim(),
        password: authPassword,
        options: {
          data: {
            display_name: name,
            username: name,
          },
          emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });
      if (error) {
        if (
          error.message.toLowerCase().includes("already registered") ||
          error.message.toLowerCase().includes("already exists") ||
          error.message.toLowerCase().includes("duplicate")
        ) {
          setAuthError(lang === "en" ? "An account with this email already exists. Please sign in with your password." : "Účet s tímto e-mailem již existuje. Přihlaste se prosím svým heslem.");
          setAuthMode("login");
        } else {
          setAuthError(error.message);
        }
      } else if (data.user) {
        // Kontrola duplicity při zapnutém "Prevent email enumeration" v Supabase
        if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          setAuthError(lang === "en" ? "An account with this email already exists. Please sign in with your password." : "Účet s tímto e-mailem již existuje. Přihlaste se prosím svým heslem.");
          setAuthMode("login");
          return;
        }
        if (data.session) {
          setCurrentUser(data.user);
          await loadUserData(data.user, cards);
          setShowAuthModal(false);
          setToast(lang === "en" ? "Welcome to the order of scribes Quilldrop!" : "Vítejte v řádu písařů Quilldrop!");
        } else {
          setAuthSuccessMsg(lang === "en" ? "Registration successful! A confirmation link has been sent to your email. Please verify before signing in." : "Registrace proběhla úspěšně! Na váš e-mail jsme zaslali potvrzovací odkaz. Po potvrzení se přihlaste.");
          setAuthMode("login");
        }
      }
    } catch (err: any) {
      setAuthError(err.message || (lang === "en" ? "Registration failed." : "Registrace se nezdařila."));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });
      if (error) setAuthError(error.message);
    } catch (err: any) {
      setAuthError(err.message || (lang === "en" ? "Google sign-in failed." : "Google přihlášení se nezdařilo."));
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setCurrentProfile(null);
    setShowAuthModal(true);
    setToast(lang === "en" ? "You have been signed out of Quilldrop." : "Byli jste odhlášeni z Quilldrop.");
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    const confirmed = window.confirm(
      lang === "en"
        ? "Are you sure you want to permanently delete your scribe account? This action is irreversible and will erase your entire card collection and all progress."
        : "Opravdu si přejete trvale zrušit svůj písařský účet? Tato akce je nevratná a smaže celou vaši sbírku karet i veškerý postup."
    );
    if (!confirmed) return;
    try {
      const { error } = await supabase.rpc("delete_user_account");
      if (error) {
        console.warn("RPC delete_user_account warning:", error.message);
        await supabase.from("profiles").delete().eq("id", currentUser.id);
        await supabase.from("user_cards").delete().eq("user_id", currentUser.id);
      }
      localStorage.removeItem(`quilldrop-state-${currentUser.id}`);
      localStorage.removeItem("quilldrop-state");
      await supabase.auth.signOut();
      setCurrentUser(null);
      setCurrentProfile(null);
      setState(INITIAL_STATE);
      setShowAuthModal(true);
      setToast(lang === "en" ? "Your account and all game data have been successfully deleted." : "Váš účet a veškerá herní data byla úspěšně smazána.");
    } catch (err: any) {
      setToast((lang === "en" ? "Error deleting account: " : "Chyba při mazání účtu: ") + (err.message || (lang === "en" ? "Please try again" : "Zkuste to znovu")));
    }
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const uniqueOwned = Object.keys(state.collection).length;
  const duplicates = Object.values(state.collection).reduce((sum, n) => sum + Math.max(0, n - 1), 0);

  const chooseCard = (quality: PackQuality | "daily") => {
    const roll = Math.random();
    const allowed = quality === "masterwork"
      ? (roll > .92 ? ["Unique"] : roll > .66 ? ["Legendary"] : ["Epic", "Rare"])
      : quality === "refined"
        ? (roll > .97 ? ["Unique"] : roll > .80 ? ["Legendary", "Epic"] : ["Rare", "Epic", "Uncommon"])
        : (roll > .985 ? ["Unique"] : roll > .93 ? ["Legendary"] : roll > .78 ? ["Epic", "Rare"] : roll > .5 ? ["Uncommon", "Rare"] : ["Common", "Uncommon"]);
    const pool = cards.filter(c => allowed.includes(c.rarity));
    return pool[Math.floor(Math.random() * pool.length)] || cards[0] || COLOPHONS[0];
  };

  const openPack = (tierToOpen?: PackQuality | "daily") => {
    let chosenTier: PackQuality = "standard";
    let isDaily = false;
    let bonusIndexToRemove = -1;

    const dailyRemaining = Math.max(0, MAX_DAILY_PACKS - state.packsOpened);

    if (tierToOpen === "masterwork") {
      bonusIndexToRemove = state.bonusPacks.findIndex(p => p === "masterwork");
      if (bonusIndexToRemove === -1) {
        setToast(lang === "en" ? "You have no Masterwork Packs. Complete a palaeographical challenge to earn one!" : "Nemáte žádný Královský balíček. Splňte paleografickou výzvu pro jeho získání!");
        return;
      }
      chosenTier = "masterwork";
    } else if (tierToOpen === "refined") {
      bonusIndexToRemove = state.bonusPacks.findIndex(p => p === "refined");
      if (bonusIndexToRemove === -1) {
        setToast(lang === "en" ? "You have no Scholar Packs. Crack a cipher or script challenge to earn one!" : "Nemáte žádný Učencův balíček. Splňte šifru nebo typologii písma pro jeho získání!");
        return;
      }
      chosenTier = "refined";
    } else {
      // standard or unspecified
      if (dailyRemaining > 0) {
        isDaily = true;
        chosenTier = "standard";
      } else {
        bonusIndexToRemove = state.bonusPacks.findIndex(p => p === "standard");
        if (bonusIndexToRemove === -1) {
          if (state.bonusPacks.length > 0) {
            setToast(lang === "en" ? "Daily packs exhausted. Choose an available Scholar Pack or Masterwork Pack!" : "Denní balíčky jsou vyčerpány. Zvolte Učencův balíček nebo Královský balíček!");
          } else {
            setToast(state.gamesPlayed >= MAX_DAILY_GAMES ? (lang === "en" ? "All today's packs and mini-games are exhausted. Return tomorrow!" : "Všechny dnešní balíčky i minihry jsou vyčerpány. Přijďte zítra.") : (lang === "en" ? "Daily packs exhausted – earn more by completing a scribal challenge." : "Denní balíčky jsou vyčerpány – získejte další splněním výzvy."));
          }
          return;
        }
        chosenTier = "standard";
      }
    }

    const drawn = Array.from({ length: 5 }, () => chooseCard(chosenTier));
    playSealCrack();
    setOpened(drawn);
    setReveal(0);
    setCardShown(false);
    setPackQuality(chosenTier);
    const nextCollection = { ...state.collection };
    drawn.forEach(card => { nextCollection[card.id] = (nextCollection[card.id] || 0) + 1; });
    const nextTrophies = [...state.trophies];
    if (!nextTrophies.includes("first-pack")) nextTrophies.push("first-pack");
    const nextLevel = levelForXp(state.xp + 25);
    if (nextLevel > levelForXp(state.xp)) setPendingPackLevel(nextLevel);

    const nextBonus = [...state.bonusPacks];
    if (bonusIndexToRemove >= 0) {
      nextBonus.splice(bonusIndexToRemove, 1);
    }

    setState(s => withXpReward({
      ...s,
      packsOpened: isDaily ? s.packsOpened + 1 : s.packsOpened,
      bonusPacks: nextBonus,
      collection: nextCollection,
      trophies: nextTrophies
    }, 25));
  };

  const finishReveal = () => {
    if (!opened) return;
    playParchmentFlip(0.25);
    if (reveal < opened.length - 1) { setReveal(r => r + 1); setCardShown(false); }
    else {
      setOpened(null);
      if (pendingPackLevel) { setLevelUp(pendingPackLevel); setPendingPackLevel(null); }
      else setToast(lang === "en" ? "Five new cards have been added to your collection!" : "Pět nových karet bylo uloženo do vaší sbírky!");
    }
  };

  const startGame = (questType: "mood" | "scholar" | "cipher" | "script" | "paleo") => {
    if (state.gamesPlayed >= MAX_DAILY_GAMES) {
      setToast(lang === "en" ? `You have completed today's ${MAX_DAILY_GAMES} challenges. Return tomorrow at dawn.` : `Dnešních ${MAX_DAILY_GAMES} výzev jste již dokončili. Vraťte se zítra za svítání.`);
      return;
    }
    let pool: QuestionData[] = [];
    if (questType === "mood") {
      pool = questions.filter(q => q.game_kind === "mood" || q.mode === "mood");
    } else if (questType === "scholar") {
      // Sloučený výběr pro Učencův balíček: náhodně losuje šifry i určení písma a století
      pool = questions.filter(q =>
        q.game_kind === "cipher" ||
        q.mode === "cipher" ||
        (q.game_kind === "paleo" && (q.mode === "script" || q.mode === "century" || (!q.target_transcription && !q.highlight_regions)))
      );
    } else if (questType === "cipher") {
      pool = questions.filter(q => q.game_kind === "cipher" || q.mode === "cipher");
    } else if (questType === "script") {
      pool = questions.filter(q => q.game_kind === "paleo" && (q.mode === "script" || q.mode === "century" || (!q.target_transcription && !q.highlight_regions)));
    } else {
      pool = questions.filter(q => q.game_kind === "paleo" && (q.mode === "transcription" || q.target_transcription || q.highlight_regions));
    }

    // Filtrovat otázky, které vyžadují konkrétní kartu, zda je tato karta v publikované sadě
    const validPool = pool.filter(q => {
      if (!q.card_id) return true;
      return cards.some(c => c.uuid === q.card_id || String(c.id) === String(q.card_id));
    });

    const poolToUse = validPool.length > 0 ? validPool : pool;
    const completed = state.completedQuestionsToday || [];

    // Zamezit opakování: vyfiltrovat otázky již dnes vyřešené
    const unplayed = poolToUse.filter(q => {
      const qKey = q.id || q.title || q.quote;
      return !completed.includes(qKey);
    });

    // Výběr kandidátů: přednost mají dosud neodehrané otázky
    const candidates = unplayed.length > 0 ? unplayed : poolToUse;

    // Upřednostnit autorské otázky editorů ze Supabase
    const customCandidates = candidates.filter(q => q.id && !q.id.startsWith("mood-") && !q.id.startsWith("cipher-") && !q.id.startsWith("paleo-") && !q.id.startsWith("script-"));
    const finalPool = customCandidates.length > 0 ? customCandidates : candidates;

    const chosen = finalPool.length > 0
      ? finalPool[Math.floor(Math.random() * finalPool.length)]
      : DEFAULT_QUESTIONS.find(q =>
          questType === "scholar"
            ? (q.game_kind === "cipher" || q.mode === "script")
            : q.mode === questType || q.game_kind === (questType === "script" ? "paleo" : questType)
        ) || DEFAULT_QUESTIONS[0];

    setActiveQuestion(chosen);
    setGame(chosen.game_kind);
    setGameStep(0);
    setAnswer(null);
  };

  const finishGame = (correct: boolean) => {
    setAnswer(correct ? "correct" : "wrong");
    const isTranscription = activeQuestion?.mode === "transcription" || Boolean(activeQuestion?.target_transcription);
    const quality: PackQuality = isTranscription ? "masterwork" : (game === "paleo" || game === "cipher") ? "refined" : "standard";

    const qKey = activeQuestion?.id || activeQuestion?.title || activeQuestion?.quote || "";
    const nextCompleted = qKey && !state.completedQuestionsToday?.includes(qKey)
      ? [...(state.completedQuestionsToday || []), qKey]
      : (state.completedQuestionsToday || []);

    const nextTrophies = [...state.trophies];
    if (state.gamesPlayed + 1 >= 5 && !nextTrophies.includes("paleographer")) {
      nextTrophies.push("paleographer");
    }

    if (correct) {
      playTriumphFanfare(isTranscription ? "legendary" : "rare");
      const earnedXp = isTranscription ? 120 : game === "paleo" ? 75 : game === "cipher" ? 60 : 35;
      const nextLevel = levelForXp(state.xp + earnedXp);
      setState(s => withXpReward({
        ...s,
        gamesPlayed: s.gamesPlayed + 1,
        dailyGamesHistory: [...(s.dailyGamesHistory || []), "success"],
        completedQuestionsToday: nextCompleted,
        bonusPacks: [...s.bonusPacks, quality],
        coins: s.coins + 25,
        trophies: nextTrophies,
      }, earnedXp));
      if (nextLevel > levelForXp(state.xp)) {
        setPendingGameLevel(nextLevel);
      } else {
        setToast(lang === "en" ? `Correct! ${qualityLabel(quality, lang)} is ready to open.` : `Správně! ${qualityLabel(quality, lang)} je připraven k otevření.`);
      }
    } else {
      playParchmentFlip(0.2);
      setState(s => ({
        ...s,
        gamesPlayed: s.gamesPlayed + 1,
        dailyGamesHistory: [...(s.dailyGamesHistory || []), "fail"],
        completedQuestionsToday: nextCompleted,
        trophies: nextTrophies,
      }));
      const remChallenges = Math.max(0, MAX_DAILY_GAMES - 1 - state.gamesPlayed);
      setToast(
        lang === "en"
          ? `Challenge failed — ${remChallenges} challenge${remChallenges === 1 ? "" : "s"} remaining today.`
          : remChallenges === 1
          ? "Výzva zmařena — dnes zbývá 1 výzva."
          : remChallenges >= 2 && remChallenges <= 4
          ? `Výzva zmařena — dnes zbývají ${remChallenges} výzvy.`
          : `Výzva zmařena — dnes zbývá ${remChallenges} výzev.`
      );
    }
  };

  const handleCloseGameModal = () => {
    setGame(null);
    setActiveQuestion(null);
    setAnswer(null);
    setGameStep(0);
    if (pendingGameLevel) {
      setLevelUp(pendingGameLevel);
      setPendingGameLevel(null);
    }
  };

  const resetDemo = () => {
    const resetConfirm = lang === "en" ? "Are you sure you want to reset your game progress?" : "Opravdu chcete resetovat svůj postup ve hře?";
    if (confirm(resetConfirm)) {
      setState(INITIAL_STATE);
      if (currentUser) {
        syncToSupabase(currentUser.id, INITIAL_STATE, cards);
      }
      setToast(lang === "en" ? "Your game progress has been successfully reset." : "Váš herní postup byl úspěšně resetován.");
    }
  };

  const handleAdvanceDay = () => {
    setState(prev => {
      const nextStreak = (prev.streak || 0) + 1;
      const nextPuzzle = ((nextStreak - 1) % 16) + 1;
      let nextGallery = [...prev.gallery];
      let nextBonusPacks = [...prev.bonusPacks];
      let nextXp = prev.xp + 25;
      let msg = lang === "en"
        ? `Day ${nextStreak}: Revealed piece ${nextPuzzle} of the illumination!`
        : `Den ${nextStreak}: Odhalen ${nextPuzzle}. dílek iluminace!`;

      if (nextPuzzle === 16) {
        const completedArt = getActiveIllumination(nextStreak, illuminations);
        if (!nextGallery.includes(completedArt.id)) {
          nextGallery.push(completedArt.id);
        }
        nextXp += completedArt.rewardXp || 200;
        if (completedArt.rewardPack) {
          nextBonusPacks.push(completedArt.rewardPack);
        }
        const artTitle = getIlluminationTitle(completedArt, lang);
        msg = lang === "en"
          ? `🎉 Cycle ${completedArt.cycle} completed: “${artTitle}”! You gain +${completedArt.rewardXp} XP and ${qualityLabel(completedArt.rewardPack, lang)}!`
          : `🎉 Cyklus ${completedArt.cycle} dokončen: „${artTitle}“! Získáváte +${completedArt.rewardXp} XP a ${qualityLabel(completedArt.rewardPack, lang)}!`;
      }

      setToast(msg);
      return {
        ...prev,
        streak: nextStreak,
        puzzle: nextPuzzle,
        xp: nextXp,
        gallery: nextGallery,
        bonusPacks: nextBonusPacks,
        packsOpened: 0,
        gamesPlayed: 0,
        dailyGamesHistory: [],
        completedQuestionsToday: [],
        dailyTradedPartners: [],
        lastLoginDate: today(),
        lastDailyPopupDate: today(),
      };
    });
    setShowDailyPieceModal(true);
    playSealCrack();
  };

  const handleCloseDailyPieceModal = () => {
    playParchmentFlip(0.25);
    setShowDailyPieceModal(false);
    setState(prev => {
      const updated: GameState = {
        ...prev,
        lastDailyPopupDate: today(),
      };
      if (currentUser) {
        if (typeof window !== "undefined") {
          localStorage.setItem(`quilldrop-state-${currentUser.id}`, JSON.stringify(updated));
        }
        syncToSupabase(currentUser.id, updated, cards);
      } else {
        if (typeof window !== "undefined") {
          localStorage.setItem("quilldrop-state", JSON.stringify(updated));
        }
      }
      return updated;
    });
  };

  const handleBreakStreak = () => {
    const breakConfirm = lang === "en"
      ? "Simulate missing a day? Your streak and active mosaic will reset to Day 1 according to rules."
      : "Chcete simulovat vynechání dne? Váš streak a aktivní mozaika se dle pravidel resetují na Den 1.";
    if (confirm(breakConfirm)) {
      setState(prev => ({
        ...prev,
        streak: 1,
        puzzle: 1,
        lastLoginDate: today(),
      }));
      setToast(lang === "en" ? "Streak broken! Restarting from Day 1 and 1st piece." : "Streak byl přerušen! Začínáte znovu od Dne 1 a 1. dílku.");
    }
  };

  const handleOpenGiftModal = (target?: any) => {
    const dups = cards.filter((c) => (state.collection[c.id] || 0) > 1);
    if (dups.length === 0) {
      setToast(lang === "en" ? "You must first own at least one duplicate colophon (2+ copies)." : "Nejprve musíte vlastnit alespoň jeden duplikát (2 ks stejného kolofonu).");
      return;
    }
    setGiftModalTarget(target || colleagues[0] || null);
    setSelectedGiftCardId(String(dups[0]?.id || ""));
    setGiftMessage(lang === "en" ? "May this folio serve you well in your nighttime studies!" : "Ať ti toto folio dobře poslouží při nočním bádání!");
  };

  const handleSendGift = async () => {
    if (!giftModalTarget || !selectedGiftCardId) return;
    const card = cards.find((c) => String(c.id) === String(selectedGiftCardId));
    if (!card) return;
    if ((state.collection[card.id] || 0) <= 1) {
      setToast(lang === "en" ? "You no longer have duplicate copies of this card." : "Tuto kartu již nemáte v duplikátu.");
      return;
    }

    setIsSendingGift(true);
    playParchmentFlip(0.28);

    // Odečíst 1 kus ze sbírky
    const nextCollection = { ...state.collection };
    nextCollection[card.id] = (nextCollection[card.id] || 1) - 1;
    if (nextCollection[card.id] <= 0) delete nextCollection[card.id];

    // Kontrola denního limitu XP pro tohoto kolegu (ochrana proti zneužití a farmení)
    const partnerKey = String(giftModalTarget.id || giftModalTarget.display_name || "kolega");
    const canEarnSocialXp = !state.dailyTradedPartners?.includes(partnerKey);
    const earnedXp = canEarnSocialXp ? 30 : 0;
    const nextTraded = canEarnSocialXp
      ? [...(state.dailyTradedPartners || []), partnerKey]
      : (state.dailyTradedPartners || []);

    // Odemknout trofej Štědrý tovaryš a připsat XP pokud je k dispozici
    const nextTrophies = state.trophies.includes("philanthropist")
      ? state.trophies
      : [...state.trophies, "philanthropist"];

    setState((s) => ({
      ...s,
      collection: nextCollection,
      trophies: nextTrophies,
      dailyTradedPartners: nextTraded,
      xp: s.xp + earnedXp,
    }));

    const senderName =
      currentProfile?.display_name ||
      currentUser?.user_metadata?.display_name ||
      currentUser?.email?.split("@")[0] ||
      "Písařský tovaryš";

    // Zapsat do Supabase pokud existuje tabulka card_gifts
    try {
      if (currentUser && !giftModalTarget.id?.startsWith("demo-")) {
        await supabase.from("card_gifts").insert({
          sender_id: currentUser.id,
          sender_name: senderName,
          recipient_id: giftModalTarget.id,
          recipient_name: giftModalTarget.display_name || giftModalTarget.username || "Kolega",
          card_id: card.id,
          card_title: card.title,
          card_rarity: card.rarity,
          message: giftMessage.trim() || "Ať ti toto folio přinese požehnání při studiu!",
          status: "pending",
        });
      }
    } catch {}

    setIsSendingGift(false);
    setGiftModalTarget(null);
    setToast(
      canEarnSocialXp
        ? (lang === "en"
            ? `Gift sent to fellow scribe ${giftModalTarget.display_name || "in the scriptorium"}! (+30 XP for generosity)`
            : `Dar byl odeslán kolegovi ${giftModalTarget.display_name || "ve skriptoriu"}! (+30 XP za štědrost)`)
        : (lang === "en"
            ? `Gift sent to fellow scribe ${giftModalTarget.display_name || "in the scriptorium"}! (No more XP today)`
            : `Dar byl odeslán kolegovi ${giftModalTarget.display_name || "ve skriptoriu"}! (Dnes již bez dalších XP)`)
    );
  };

  const handleAcceptGift = async (gift: any) => {
    playTriumphFanfare((gift.card_rarity as any) || "Rare");
    const cardId = gift.card_id;

    const partnerKey = String(gift.sender_id || gift.sender_name || "kolega");
    const canEarnSocialXp = !state.dailyTradedPartners?.includes(partnerKey);
    const earnedXp = canEarnSocialXp ? 50 : 0;
    const nextTraded = canEarnSocialXp
      ? [...(state.dailyTradedPartners || []), partnerKey]
      : (state.dailyTradedPartners || []);

    setState((s) => ({
      ...s,
      collection: {
        ...s.collection,
        [cardId]: (s.collection[cardId] || 0) + 1,
      },
      dailyTradedPartners: nextTraded,
      xp: s.xp + earnedXp,
    }));

    setPendingGifts((prev) => prev.filter((g) => g.id !== gift.id));
    setToast(
      canEarnSocialXp
        ? (lang === "en"
            ? `Colophon "${gift.card_title}" added to your collection! (+50 XP)`
            : `Kolofon „${gift.card_title}“ byl zařazen do vaší sbírky! (+50 XP)`)
        : (lang === "en"
            ? `Colophon "${gift.card_title}" added to your collection! (No more XP today)`
            : `Kolofon „${gift.card_title}“ byl zařazen do vaší sbírky! (Dnes již bez dalších XP)`)
    );

    try {
      if (currentUser) {
        await supabase.from("card_gifts").update({ status: "accepted" }).eq("id", gift.id);
      }
    } catch {}
  };

  // --- P2P Obchodování a smlouvy o směně (Bilateral Card Trading) ---
  const handleOpenTradeModal = (
    colleague?: any,
    initialOffer?: TradeItem[],
    initialRequest?: TradeItem[],
    message?: string,
    parentTradeId?: string
  ) => {
    setActiveTradeModal({
      colleague: colleague || colleagues[0] || null,
      initialOffer,
      initialRequest,
      message: message || "",
      parentTradeId,
    });
  };

  const handleSendTrade = async (
    offer: TradeItem[],
    request: TradeItem[],
    msg: string,
    parentTradeId?: string
  ) => {
    if (!activeTradeModal) return;
    if (offer.length === 0 && request.length === 0) {
      setToast(lang === "en" ? "Please select at least one colophon to offer or request." : "Vyberte prosím alespoň jeden kolofon k nabídce nebo žádosti.");
      return;
    }

    // Ověřit, zda hráč skutečně vlastní všechny nabízené karty
    for (const item of offer) {
      const owned = state.collection[item.card_id] || 0;
      if (owned < item.count) {
        setToast(lang === "en" ? `You do not have enough copies of "${item.title}" to offer.` : `Nemáte dostatek kusů karty „${item.title}“ k nabídnutí.`);
        return;
      }
    }

    playParchmentFlip(0.28);
    const target = activeTradeModal.colleague;
    const senderName =
      currentProfile?.display_name ||
      currentUser?.user_metadata?.display_name ||
      currentUser?.email?.split("@")[0] ||
      "Písařský tovaryš";
    const recipientName = target.display_name || target.username || "Kolega";

    // Pokud šlo o protinabídku, označíme původní nabídku jako 'countered'
    if (parentTradeId) {
      setPendingTrades((prev) => prev.filter((t) => t.id !== parentTradeId));
      try {
        if (currentUser && !parentTradeId.startsWith("demo-")) {
          await supabase.from("card_trades").update({ status: "countered" }).eq("id", parentTradeId);
        }
      } catch {}
    }

    // Zapsat do Supabase pokud existuje reálný uživatel
    try {
      if (currentUser && !target.id?.startsWith("demo-")) {
        await supabase.from("card_trades").insert({
          sender_id: currentUser.id,
          sender_name: senderName,
          recipient_id: target.id,
          recipient_name: recipientName,
          sender_offer: offer,
          recipient_request: request,
          message: msg.trim() || "Návrh na vzájemnou výměnu kolofonů mezi písaři.",
          status: "pending",
          parent_trade_id: (parentTradeId && !parentTradeId.startsWith("demo-") && parentTradeId.length === 36) ? parentTradeId : null,
        });
      }
    } catch {}

    // Kontrola denního limitu XP pro tohoto kolegu
    const partnerKey = String(target.id || target.display_name || target.username || "kolega");
    const canEarnSocialXp = !state.dailyTradedPartners?.includes(partnerKey);
    const earnedXp = canEarnSocialXp ? 15 : 0;
    const nextTraded = canEarnSocialXp
      ? [...(state.dailyTradedPartners || []), partnerKey]
      : (state.dailyTradedPartners || []);

    // Připsat XP za diplomatické vyjednávání (max 1x denně na partnera)
    setState((s) => ({
      ...s,
      dailyTradedPartners: nextTraded,
      xp: s.xp + earnedXp,
    }));

    setActiveTradeModal(null);
    setToast(
      canEarnSocialXp
        ? (lang === "en"
            ? `Trade proposal sent to fellow scribe ${recipientName}! (+15 XP for diplomacy)`
            : `Návrh smlouvy o směně byl odeslán kolegovi ${recipientName}! (+15 XP za diplomacii)`)
        : (lang === "en"
            ? `Trade proposal sent to fellow scribe ${recipientName}! (No more XP today)`
            : `Návrh smlouvy o směně byl odeslán kolegovi ${recipientName}! (Dnes již bez dalších XP)`)
    );
  };

  const handleAcceptTrade = async (trade: CardTrade) => {
    // Ověřit dostupnost požadovaných karet u příjemce
    for (const req of trade.recipient_request) {
      const owned = state.collection[req.card_id] || 0;
      if (owned < req.count) {
        setToast(lang === "en" ? `You are missing the requested colophon to accept this trade: "${req.title}".` : `Pro přijetí směny vám chybí požadovaný kolofon: „${req.title}“.`);
        return;
      }
    }

    playTriumphFanfare("Epic");

    // Atomická výměna ve sbírce hráče:
    // 1. Odečíst karty, které hráč odevzdává (recipient_request)
    // 2. Přičíst karty, které hráč získává (sender_offer)
    const nextCollection = { ...state.collection };
    for (const req of trade.recipient_request) {
      const current = nextCollection[req.card_id] || 0;
      const left = current - req.count;
      if (left <= 0) {
        delete nextCollection[req.card_id];
      } else {
        nextCollection[req.card_id] = left;
      }
    }
    for (const off of trade.sender_offer) {
      nextCollection[off.card_id] = (nextCollection[off.card_id] || 0) + off.count;
    }

    // Kontrola denního limitu XP pro tohoto kolegu
    const partnerKey = String(trade.sender_id || trade.sender_name || "kolega");
    const canEarnSocialXp = !state.dailyTradedPartners?.includes(partnerKey);
    const earnedXp = canEarnSocialXp ? 60 : 0;
    const nextTraded = canEarnSocialXp
      ? [...(state.dailyTradedPartners || []), partnerKey]
      : (state.dailyTradedPartners || []);

    // Odemknout trofej Štědrý tovaryš pokud ještě nemá
    const nextTrophies = state.trophies.includes("philanthropist")
      ? state.trophies
      : [...state.trophies, "philanthropist"];

    setState((s) => ({
      ...s,
      collection: nextCollection,
      trophies: nextTrophies,
      dailyTradedPartners: nextTraded,
      xp: s.xp + earnedXp,
    }));

    setPendingTrades((prev) => prev.filter((t) => t.id !== trade.id));
    setReviewTradeModal(null);
    setToast(
      canEarnSocialXp
        ? (lang === "en"
            ? `Trade contract sealed! New colophons are in your collection (+60 XP for today's trade).`
            : `Smlouva o směně byla zpečetěna! Nové kolofony jsou ve vaší sbírce (+60 XP za dnešní směnu).`)
        : (lang === "en"
            ? `Trade contract sealed! New colophons are in your collection (daily XP limit for this peer reached).`
            : `Smlouva o směně byla zpečetěna! Nové kolofony jsou ve vaší sbírce (denní limit XP s tímto kolegou byl již vyčerpán).`)
    );

    try {
      if (currentUser && !trade.id.startsWith("demo-")) {
        await supabase.from("card_trades").update({ status: "accepted" }).eq("id", trade.id);
      }
    } catch {}
  };

  const handleCounterTrade = (trade: CardTrade) => {
    setReviewTradeModal(null);
    // Invertovat strany: co odesílatel nabízel, to příjemce nyní žádá (a naopak)
    setActiveTradeModal({
      colleague: {
        id: trade.sender_id,
        display_name: trade.sender_name,
      },
      initialOffer: trade.recipient_request,
      initialRequest: trade.sender_offer,
      message: `Navrhuji mírnou úpravu naší směny kolofonů...`,
      parentTradeId: trade.id,
    });
  };

  const handleDeclineTrade = async (trade: CardTrade) => {
    playParchmentFlip(0.2);
    setPendingTrades((prev) => prev.filter((t) => t.id !== trade.id));
    setReviewTradeModal(null);
    setToast(lang === "en" ? `Trade proposal from scribe ${trade.sender_name} was politely declined.` : `Návrh směny od kolegy ${trade.sender_name} byl zdvořile odmítnut.`);

    try {
      if (currentUser && !trade.id.startsWith("demo-")) {
        await supabase.from("card_trades").update({ status: "declined" }).eq("id", trade.id);
      }
    } catch {}
  };

  const handleFinishTutorial = () => {
    playTriumphFanfare("Common");
    const isFirstTime = !state.hasSeenTutorial;
    setState((prev) => {
      // Bonus +50 XP se udělí POUZE JEDNOU za celou existenci účtu
      const shouldAward = !prev.hasSeenTutorial;
      const awarded = shouldAward ? withXpReward(prev, 50) : prev;
      const updated: GameState = {
        ...awarded,
        hasSeenTutorial: true,
      };
      if (currentUser) {
        if (typeof window !== "undefined") {
          localStorage.setItem(`quilldrop-state-${currentUser.id}`, JSON.stringify(updated));
        }
        syncToSupabase(currentUser.id, updated, cards);
      }
      return updated;
    });
    setShowTutorialModal(false);
    if (state.lastDailyPopupDate !== today()) {
      setShowDailyPieceModal(true);
    }
    setTab("packs");
    setToast(
      isFirstTime
        ? (lang === "en"
            ? "Scriptorium initiation complete (+50 XP)! Here are your 3 sealed packs."
            : "Zasvěcení do skriptoria dokončeno (+50 XP)! Zde jsou vaše 3 denní zapečetěné balíčky.")
        : (lang === "en"
            ? "Tutorial closed."
            : "Průvodce skriptoriem zavřen.")
    );
  };

  if (!ready) return <main className="loading">Otevíráme skriptorium…</main>;

  return (
    <main className="page-stage">
      <section className="app-shell" aria-label="Quilldrop application">
        <StatusBar
          state={state}
          isLive={isLive}
          tab={tab}
          setTab={setTab}
          uniqueOwned={uniqueOwned}
          totalCards={cards.length}
          soundOn={soundOn}
          onToggleSound={toggleSound}
          currentUser={currentUser}
          currentProfile={currentProfile}
          onOpenAuth={() => { setAuthMode("login"); setAuthError(""); setAuthSuccessMsg(""); setShowAuthModal(true); }}
          lang={lang}
        />

        <div className="scroll-area">
          {tab === "home" && (
            <HomeScreen
              state={state}
              cards={cards}
              uniqueOwned={uniqueOwned}
              totalCards={cards.length}
              curio={curios[curioIndex] || DEFAULT_CURIOS[0]}
              onNextCurio={nextCurio}
              activeIllumination={activeIllumination}
              onPacks={() => setTab("packs")}
              onCollection={() => setTab("collection")}
              onMap={(place) => {
                if (place) setMapInitialPlace(place);
                setShowMap(true);
              }}
              onGallery={() => setTab("profile")}
              onGame={startGame}
              onDetail={setDetail}
              lang={lang}
            />
          )}
          {tab === "packs" && <PacksScreen state={state} onOpen={openPack} onGame={startGame} lang={lang} />}
          {tab === "collection" && <CollectionScreen state={state} cards={cards} filter={filter} setFilter={setFilter} onDetail={setDetail} lang={lang} />}
          {tab === "trophies" && <TrophiesScreen state={state} cards={cards} activeIllumination={activeIllumination} lang={lang} />}
          {tab === "profile" && (
            <ProfileScreen
              state={state}
              uniqueOwned={uniqueOwned}
              duplicates={duplicates}
              isLive={isLive}
              currentUser={currentUser}
              currentProfile={currentProfile}
              activeIllumination={activeIllumination}
              illuminations={illuminations}
              colleagues={colleagues}
              pendingGifts={pendingGifts}
              pendingTrades={pendingTrades}
              onOpenAuth={() => { setAuthMode("login"); setAuthError(""); setAuthSuccessMsg(""); setShowAuthModal(true); }}
              onLogout={handleLogout}
              onReset={resetDemo}
              onAdvanceDay={handleAdvanceDay}
              onBreakStreak={handleBreakStreak}
              onSend={handleOpenGiftModal}
              onAcceptGift={handleAcceptGift}
              onOpenTrade={handleOpenTradeModal}
              onReviewTrade={(trade) => setReviewTradeModal(trade)}
              onSetAvatar={(id) => { setState(s => ({ ...s, avatarArt: id })); setToast(lang === "en" ? "Scribe portrait updated." : "Portrét písaře byl aktualizován."); }}
              onDeleteAccount={handleDeleteAccount}
              onOpenTutorial={currentProfile?.role === "admin" ? () => setShowTutorialModal(true) : undefined}
              lang={lang}
              onSetLang={handleSetLang}
            />
          )}
        </div>

        <nav className="bottom-nav" aria-label="Main navigation">
          {NAV.map(item => {
            const Icon = item.icon;
            const label = lang === "en"
              ? (item.id === "home" ? "Scriptorium" : item.id === "packs" ? "Packs" : item.id === "collection" ? "Collection" : item.id === "trophies" ? "Challenges" : "Profile")
              : item.label;
            return (
              <button
                key={item.id}
                className={`${tab === item.id ? "active" : ""} ${item.id === "packs" ? "primary" : ""}`}
                onClick={() => setTab(item.id)}
                aria-label={label}
              >
                <span><Icon size={21} strokeWidth={1.8} /></span>
                <small>{label}</small>
              </button>
            );
          })}
        </nav>

        {detail && <CardDetail card={detail} count={state.collection[detail.id] || 0} onClose={() => setDetail(null)} lang={lang} />}
        {opened && <PackReveal key={`${reveal}-${cardShown}`} card={opened[reveal]} position={reveal + 1} total={opened.length} quality={packQuality} shown={cardShown} onReveal={() => setCardShown(true)} onNext={finishReveal} lang={lang} />}
        {game && activeQuestion && (
          <GameModal
            kind={game}
            question={activeQuestion}
            cards={cards}
            answer={answer}
            step={gameStep}
            setStep={setGameStep}
            onClose={handleCloseGameModal}
            onAnswer={finishGame}
            onLoupeMax={() => {
              if (!state.loupeMaxUsed || !state.trophies.includes("loupe-max")) {
                setState((s) => ({
                  ...s,
                  loupeMaxUsed: true,
                  trophies: s.trophies.includes("loupe-max") ? s.trophies : [...s.trophies, "loupe-max"],
                  trophyTimestamps: {
                    ...(s.trophyTimestamps || {}),
                    "loupe-max": s.trophyTimestamps?.["loupe-max"] || new Date().toISOString(),
                  },
                }));
              }
            }}
            lang={lang}
          />
        )}
        {showMap && (
          <MapModal
            state={state}
            cards={cards}
            onClose={() => { setShowMap(false); setMapInitialPlace(null); }}
            onDetail={(card) => { setShowMap(false); setDetail(card); }}
            lang={lang}
            initialPlace={mapInitialPlace}
          />
        )}
        {levelUp && <LevelUpModal level={levelUp} onClose={() => setLevelUp(null)} lang={lang} />}
        {giftModalTarget && (
          <div className="modal-backdrop" role="dialog" aria-label={lang === "en" ? "Gift Manuscript to Colleague" : "Darování pergamenu kolegovi"}>
            <div className="modal" style={{ maxWidth: 440, borderRadius: 12, padding: "20px 22px" }}>
              <button className="close" onClick={() => setGiftModalTarget(null)} title={lang === "en" ? "Close" : "Zavřít"}>×</button>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Send size={18} className="text-[#8b5a19]" />
                <h3 style={{ margin: 0, color: "var(--brown)", fontFamily: "var(--font-display)", fontSize: "19px" }}>
                  {lang === "en" ? "Gift Manuscript to Colleague" : "Darování pergamenu kolegovi"}
                </h3>
              </div>

              <div style={{ padding: "8px 12px", background: "#f8ecd4", border: "1px solid #d8b884", borderRadius: 8, marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#4a2d0b", color: "#ffd580", display: "grid", placeItems: "center", fontWeight: "bold", fontSize: 13, flexShrink: 0 }}>
                  {giftModalTarget.display_name ? giftModalTarget.display_name.substring(0, 1).toUpperCase() : "K"}
                </div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#3d2206" }}>
                    {giftModalTarget.display_name || giftModalTarget.username || (lang === "en" ? "Fellow Scribe" : "Kolega")}
                  </div>
                  <div style={{ fontSize: "10px", color: "#7a5323" }}>
                    {giftModalTarget.streak || 1} {lang === "en" ? "days streak" : "dní v řadě"} · {giftModalTarget.xp ? `${giftModalTarget.xp} XP` : (lang === "en" ? "Scriptorium Fellow" : "Tovaryš skriptoria")}
                  </div>
                </div>
              </div>

              {/* Seznam duplicit k výběru */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--brown)", marginBottom: 6 }}>
                  {lang === "en" ? "Select duplicate colophon to gift:" : "Zvolte duplicitní kolofon k darování:"}
                </label>
                <div style={{ maxHeight: 180, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6, paddingRight: 4 }}>
                  {cards
                    .filter((c) => (state.collection[c.id] || 0) > 1)
                    .map((c) => {
                      const count = state.collection[c.id] || 0;
                      const isSelected = selectedGiftCardId === String(c.id);
                      const title = getCardTitle(c, lang);
                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedGiftCardId(String(c.id))}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 8,
                            padding: "7px 10px",
                            borderRadius: 6,
                            cursor: "pointer",
                            border: isSelected ? "2px solid #b8860b" : "1px solid #d4c09b",
                            background: isSelected ? "#fff4d4" : "#fdf8ee",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <strong style={{ fontSize: "12px", color: "#40260b", display: "block" }} className="truncate">
                              {title}
                            </strong>
                            <small style={{ fontSize: "10px", color: "#785324" }}>
                              {getCardPlace(c.place, lang)} · <span className={`rarity-tag rarity-${c.rarity.toLowerCase()}`} style={{ fontSize: "9px", padding: "0 4px" }}>{c.rarity}</span>
                            </small>
                          </div>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#8a5814", whiteSpace: "nowrap" }}>
                            {lang === "en" ? `You have: ${count} pcs` : `Máte: ${count} ks`}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Dobové věnování */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--brown)", marginBottom: 4 }}>
                  {lang === "en" ? "Historical dedication (optional):" : "Dobové věnování (volitelné):"}
                </label>
                <input
                  type="text"
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  placeholder={lang === "en" ? "May this folio serve thee well in thy nightly studies..." : "Ať ti toto folio dobře poslouží při nočním bádání..."}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    borderRadius: 6,
                    border: "1px solid #c9b084",
                    background: "#fffcf4",
                    fontSize: "12px",
                    color: "var(--ink)",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setGiftModalTarget(null)}
                  style={{ padding: "7px 14px", background: "none", border: "1px solid #ba9f73", borderRadius: 6, fontSize: "12px", color: "var(--brown)", cursor: "pointer" }}
                >
                  {lang === "en" ? "Cancel" : "Zrušit"}
                </button>
                <button
                  type="button"
                  onClick={handleSendGift}
                  disabled={!selectedGiftCardId || isSendingGift}
                  style={{
                    padding: "7px 18px",
                    background: "linear-gradient(180deg, #9a6712, #684107)",
                    color: "#fff3cf",
                    border: "1px solid #4a2d04",
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    opacity: !selectedGiftCardId || isSendingGift ? 0.6 : 1,
                  }}
                >
                  <Send size={13} /> {isSendingGift ? (lang === "en" ? "Sealing..." : "Zpečeťuji...") : (lang === "en" ? "Seal & Gift (-1 pc)" : "Zpečetit a darovat (-1 ks)")}
                </button>
              </div>
            </div>
          </div>
        )}
        {activeTradeModal && (
          <TradeModal
            colleague={activeTradeModal.colleague}
            cards={cards}
            userCollection={state.collection}
            initialOffer={activeTradeModal.initialOffer}
            initialRequest={activeTradeModal.initialRequest}
            initialMessage={activeTradeModal.message}
            parentTradeId={activeTradeModal.parentTradeId}
            onClose={() => setActiveTradeModal(null)}
            onSend={handleSendTrade}
            lang={lang}
          />
        )}
        {reviewTradeModal && (
          <TradeReviewModal
            trade={reviewTradeModal}
            cards={cards}
            userCollection={state.collection}
            isXpAvailable={!state.dailyTradedPartners?.includes(String(reviewTradeModal.sender_id || reviewTradeModal.sender_name || "kolega"))}
            onAccept={handleAcceptTrade}
            onCounter={handleCounterTrade}
            onDecline={handleDeclineTrade}
            onClose={() => setReviewTradeModal(null)}
            lang={lang}
          />
        )}
        {showTutorialModal && (
          <OnboardingTutorialModal
            isOpen={showTutorialModal}
            onClose={() => {
              setShowTutorialModal(false);
              if (state.lastDailyPopupDate !== today()) setShowDailyPieceModal(true);
            }}
            onFinish={handleFinishTutorial}
            lang={lang}
          />
        )}
        {showDailyPieceModal && (
          <DailyPieceModal
            isOpen={showDailyPieceModal}
            streak={state.streak}
            puzzle={state.puzzle}
            activeIllumination={activeIllumination}
            onClose={handleCloseDailyPieceModal}
            lang={lang}
          />
        )}
        {showAuthModal && (
          <AuthModal
            mode={authMode}
            setMode={(m) => { setAuthMode(m); setAuthError(""); setAuthSuccessMsg(""); }}
            email={authEmail}
            setEmail={setAuthEmail}
            password={authPassword}
            setPassword={setAuthPassword}
            displayName={authDisplayName}
            setDisplayName={setAuthDisplayName}
            loading={authLoading}
            error={authError}
            successMsg={authSuccessMsg}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onGoogle={handleGoogleSignIn}
            lang={lang}
            onSetLang={handleSetLang}
          />
        )}
        {toast && <div className="toast" role="status">{toast}</div>}
      </section>
    </main>
  );
}

function StatusBar({
  state,
  isLive,
  uniqueOwned,
  totalCards,
  tab,
  setTab,
  soundOn = true,
  onToggleSound,
  currentUser,
  currentProfile,
  onOpenAuth,
  lang = "cs",
}: {
  state: GameState;
  isLive: boolean;
  uniqueOwned: number;
  totalCards: number;
  tab: Tab;
  setTab: (t: Tab) => void;
  soundOn?: boolean;
  onToggleSound?: () => void;
  currentUser?: any;
  currentProfile?: UserProfile | null;
  onOpenAuth?: () => void;
  lang?: Language;
}) {
  return (
    <header className="status-bar">
      <div
        className="brand-lockup"
        onClick={() => setTab("home")}
        style={{ cursor: "pointer" }}
        title={lang === "en" ? "Quilldrop: Return to Scriptorium" : "Quilldrop: Návrat do skriptoria"}
      >
        <img src="/quilldrop-logo.png" alt="Quilldrop" />
      </div>

      <nav className="desktop-nav" aria-label={lang === "en" ? "Main navigation" : "Hlavní navigace"}>
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = tab === item.id;
          const label = lang === "en"
            ? (item.id === "home" ? "Scriptorium" : item.id === "packs" ? "Packs" : item.id === "collection" ? "Collection" : item.id === "trophies" ? "Challenges" : "Profile")
            : item.label;
          return (
            <button
              key={item.id}
              className={isActive ? "active" : ""}
              onClick={() => setTab(item.id)}
            >
              <Icon size={15} />
              <span>{label}</span>
              {item.id === "collection" && (
                <span className="nav-count">{uniqueOwned}/{totalCards}</span>
              )}
              {item.id === "packs" && state.packsOpened < MAX_DAILY_PACKS && (
                <span className="nav-badge">{MAX_DAILY_PACKS - state.packsOpened}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="stats">
        <span title={lang === "en" ? "Daily streak without interruption" : "Dní v řadě bez přerušení"} aria-label={`${state.streak} day streak`}><Flame size={14} /> <b>{state.streak}</b></span>
        <span title={lang === "en" ? "16-day illumination" : "16denní iluminace"} aria-label={`${state.puzzle} of 16 daily illumination fragments`}><Puzzle size={14} /> <b>{state.puzzle}/16</b></span>
        <span title={lang === "en" ? "Experience Points (XP)" : "Zkušenostní body (XP)"} aria-label={`${state.xp} experience points`}><Sparkles size={14} /> <b>{state.xp}</b></span>
        {onToggleSound && (
          <button
            type="button"
            className={`sound-toggle-btn ${soundOn ? "active" : "muted"}`}
            onClick={onToggleSound}
            title={soundOn ? (lang === "en" ? "Scriptorium audio is ON (click to mute)" : "Zvuk skriptoria je zapnutý (kliknutím ztlumit)") : (lang === "en" ? "Scriptorium audio is muted (click to unmute)" : "Zvuk je ztlumený (kliknutím zapnout)")}
            aria-label={soundOn ? (lang === "en" ? "Mute scriptorium audio" : "Ztlumit zvuky skriptoria") : (lang === "en" ? "Unmute scriptorium audio" : "Zapnout zvuky skriptoria")}
          >
            {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
        )}
        {currentUser ? (
          <button
            type="button"
            className="user-status-btn"
            onClick={() => setTab("profile")}
            title={lang === "en" ? `Signed in as ${currentProfile?.display_name || currentUser.user_metadata?.display_name || currentUser.email}` : `Přihlášen jako ${currentProfile?.display_name || currentUser.user_metadata?.display_name || currentUser.email}`}
          >
            <User size={13} />
            <span>{currentProfile?.display_name || currentUser.user_metadata?.display_name || currentUser.email?.split("@")[0]}</span>
          </button>
        ) : (
          <button
            type="button"
            className="login-trigger-btn"
            onClick={onOpenAuth}
            title={lang === "en" ? "Sign in to scriptorium" : "Přihlásit se do skriptoria"}
          >
            <LogIn size={13} />
            <span>{lang === "en" ? "Sign In" : "Přihlásit"}</span>
          </button>
        )}
      </div>
    </header>
  );
}

function PageTitle({ kicker, children }: { kicker?: string; children: React.ReactNode }) {
  return <div className="page-heading">{kicker && <p>{kicker}</p>}<h1>{children}</h1><span className="flourish" aria-hidden="true" /></div>;
}

function ColophonImage({ card, alt = "" }: { card: Colophon; alt?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number } | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const hasCrop =
    card.crop_w !== undefined &&
    card.crop_w !== null &&
    Number(card.crop_w) > 5 &&
    Number(card.crop_w) < 99.5;

  const src = failedSrc === card.imageUrl && card.remoteImageUrl ? card.remoteImageUrl : (card.imageUrl || card.remoteImageUrl);

  useEffect(() => {
    if (!containerRef.current || !hasCrop) return;
    const el = containerRef.current;
    const measure = () => {
      if (el.clientWidth > 0 && el.clientHeight > 0) {
        setContainerSize({ w: el.clientWidth, h: el.clientHeight });
      }
    };
    measure();

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => measure());
      ro.observe(el);
      return () => ro.disconnect();
    }
  }, [hasCrop]);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setNaturalSize({ w: imgRef.current.naturalWidth, h: imgRef.current.naturalHeight });
    }
  }, [src]);

  const onImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    }
  };

  if (!hasCrop) {
    return (
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={onImgLoad}
        onError={() => {
          if (card.remoteImageUrl && src !== card.remoteImageUrl) {
            setFailedSrc(card.imageUrl);
          }
        }}
      />
    );
  }

  let imgStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  if (containerSize && naturalSize && containerSize.w > 0 && containerSize.h > 0) {
    const cropX = Number(card.crop_x) || 0;
    const cropY = Number(card.crop_y) || 0;
    const cropW = Number(card.crop_w) || 100;
    const cropH = Number(card.crop_h) || 100;

    const cropXPx = (cropX / 100) * naturalSize.w;
    const cropYPx = (cropY / 100) * naturalSize.h;
    const cropWPx = (cropW / 100) * naturalSize.w;
    const cropHPx = (cropH / 100) * naturalSize.h;

    // Uniformní škálování: 100% zachování proporcí rukopisu bez jakékoliv deformace!
    const uniformScale = Math.min(containerSize.w / cropWPx, containerSize.h / cropHPx);
    const renderW = naturalSize.w * uniformScale;
    const renderH = naturalSize.h * uniformScale;

    const offsetX = (containerSize.w - cropWPx * uniformScale) / 2;
    const offsetY = (containerSize.h - cropHPx * uniformScale) / 2;

    let renderLeft = offsetX - cropXPx * uniformScale;
    let renderTop = offsetY - cropYPx * uniformScale;

    // Clamping hran: zabrání vzniku prázdných mezer na okrajích, pokud je rukopis větší než rámeček
    if (renderW >= containerSize.w) {
      renderLeft = Math.min(0, Math.max(containerSize.w - renderW, renderLeft));
    } else {
      renderLeft = (containerSize.w - renderW) / 2;
    }

    if (renderH >= containerSize.h) {
      renderTop = Math.min(0, Math.max(containerSize.h - renderH, renderTop));
    } else {
      renderTop = (containerSize.h - renderH) / 2;
    }

    imgStyle = {
      position: "absolute",
      maxWidth: "none",
      maxHeight: "none",
      width: `${renderW}px`,
      height: `${renderH}px`,
      left: `${renderLeft}px`,
      top: `${renderTop}px`,
    };
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={onImgLoad}
        style={imgStyle}
        onError={() => {
          if (card.remoteImageUrl && src !== card.remoteImageUrl) {
            setFailedSrc(card.imageUrl);
          }
        }}
      />
    </div>
  );
}

function HomeScreen({
  state,
  cards,
  uniqueOwned,
  totalCards,
  curio,
  onNextCurio,
  activeIllumination,
  onPacks,
  onCollection,
  onMap,
  onGallery,
  onGame,
  onDetail,
  lang = "cs",
}: {
  state: GameState;
  cards: Colophon[];
  uniqueOwned: number;
  totalCards: number;
  curio: Curio;
  onNextCurio: (e?: React.MouseEvent) => void;
  activeIllumination: IlluminationMosaicItem;
  onPacks: () => void;
  onCollection: () => void;
  onMap: (place?: ScriptoriumPlace) => void;
  onGallery: () => void;
  onGame: (g: "mood" | "scholar" | "cipher" | "script" | "paleo") => void;
  onDetail: (c: Colophon) => void;
  lang?: Language;
}) {
  const progressPercent = totalCards > 0 ? Math.round((uniqueOwned / totalCards) * 100) : 0;
  const remaining = Math.max(0, MAX_DAILY_PACKS - state.packsOpened);
  const hasBonus = state.bonusPacks.length > 0;
  const gamesLeft = Math.max(0, MAX_DAILY_GAMES - state.gamesPlayed);

  const showcaseCards = useMemo(() => {
    const owned = cards.filter(c => state.collection[c.id]);
    if (owned.length >= 6) return owned.slice(0, 6);
    const unowned = cards.filter(c => !state.collection[c.id]);
    return [...owned, ...unowned].slice(0, 6);
  }, [cards, state.collection]);

  const scriptoriaWithCards = useMemo(() => {
    return getScriptoriaWithCards(cards, state.collection);
  }, [cards, state.collection]);

  const [selectedHomePlace, setSelectedHomePlace] = useState<ScriptoriumPlace | null>(null);

  return (
    <div className="screen home-screen">
      <section className="welcome-panel">
        <div>
          <p className="eyebrow">{lang === "en" ? "Medieval Scriptorium" : "Středověké skriptorium"}</p>
          <h1>{lang === "en" ? "What will the manuscript margins reveal today?" : "Co dnes vydají okraje kodexů?"}</h1>
          <p>{lang === "en" ? "Uncover a fresh harvest of scribal voices, laments of weary hands, and celebratory verses from medieval codices." : "Otevřete novou várku hlasů písařů, stížností na bolavé ruce i slavnostních přípisů ze starých rukopisů."}</p>
        </div>
        <div className="scribe-medallion"><PenTool size={34} strokeWidth={1.45} /></div>
      </section>

      <div className="home-hero-grid">
        <section className="home-hero-card home-hero-pack">
          <div>
            <div className="home-pack-header">
              <span>{hasBonus && remaining === 0 ? (lang === "en" ? "Vault Reward Ready" : "Připravená odměna") : (lang === "en" ? "Daily Pack Allowance" : "Denní příděl balíčků")}</span>
              <span
                className={`home-pack-badge ${
                  remaining > 0
                    ? "standard"
                    : hasBonus
                    ? state.bonusPacks[0] === "masterwork"
                      ? "vault-masterwork"
                      : "vault-scholar"
                    : "empty"
                }`}
              >
                {remaining > 0
                  ? (lang === "en" ? `📜 ${remaining} pack${remaining > 1 ? "s" : ""} available` : `📜 ${formatPacksCount(remaining)} k dispozici`)
                  : hasBonus
                  ? (lang === "en" ? `✨ ${state.bonusPacks.length} pack${state.bonusPacks.length > 1 ? "s" : ""} available` : `✨ ${formatPacksCount(state.bonusPacks.length)} k dispozici`)
                  : (lang === "en" ? "Exhausted" : "Vyčerpáno")}
              </span>
            </div>
            <div className="home-pack-body">
              <div className="home-pack-seal" aria-hidden="true">Q</div>
              <div className="home-pack-info">
                <h2>{remaining ? (lang === "en" ? "Scriptorium Pack" : "Balíček ze skriptoria") : hasBonus ? qualityLabel(state.bonusPacks[0], lang) : (lang === "en" ? "Scriptorium at Rest" : "Skriptorium odpočívá")}</h2>
                <p>
                  {remaining
                    ? (lang === "en" ? "Five concealed scribal voices await under the wax seal." : "Pět skrytých hlasů písařů čeká pod voskovou pečetí.")
                    : hasBonus
                    ? (lang === "en" ? "Earned reward from your scribal challenge awaits in vault." : "Získaná odměna z písařské výzvy čeká na otevření.")
                    : gamesLeft
                    ? (lang === "en" ? "Complete a scribal challenge to unlock another pack!" : "Splňte písařskou výzvu vedle a získejte další balíček!")
                    : (lang === "en" ? "Return tomorrow at dawn when fresh candles are lit." : "Vraťte se zítra za rozbřesku, až zapálíme nové svíce.")}
                </p>
              </div>
            </div>

            {/* Denní glosa ze skriptoria / Moudro a zajímavost */}
            <div className="home-curio-box">
              <div className="home-curio-top">
                <div className="home-curio-label">
                  <BookOpen size={13} style={{ color: "#a16207" }} />
                  <span>{lang === "en" ? "Marginalia from Scriptorium" : "Glosa ze skriptoria"}</span>
                  <span className="home-curio-category">{getCurioCategory(curio, lang)}</span>
                </div>
                <button
                  type="button"
                  className="home-curio-next-btn"
                  onClick={onNextCurio}
                  title={lang === "en" ? "Show next marginalia" : "Zobrazit další zajímavost ze skriptoria"}
                >
                  {lang === "en" ? "Next ↻" : "Další ↻"}
                </button>
              </div>
              <blockquote className="home-curio-text">
                „{getCurioText(curio, lang)}“
              </blockquote>
            </div>
          </div>
          <button className="illuminated-button" onClick={onPacks} style={{ width: "100%", justifyContent: "center" }}>
            {remaining || hasBonus ? (lang === "en" ? "Open Pack (5 cards)" : "Otevřít balíček (5 karet)") : (lang === "en" ? "Pack Overview" : "Přehled balíčků")} <span>→</span>
          </button>
        </section>

        <section className="home-quests-box">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <h3 style={{ margin: 0 }}>{lang === "en" ? "Daily Scribal Challenges" : "Písařské výzvy dne"}</h3>
            <span className="quests-counter-badge">{gamesLeft}/{MAX_DAILY_GAMES} {lang === "en" ? "available" : "k dispozici"}</span>
          </div>
          <p>{lang === "en" ? "Complete a quick challenge and receive a bonus pack of colophons." : "Splňte rychlou výzvu a získejte další bonusový balíček kolofonů."}</p>
          <div className="home-quests-list">
            <button className="home-quest-btn" disabled={!gamesLeft} onClick={() => onGame("mood")}>
              <span className="home-quest-icon icon-mood"><Smile size={19} /></span>
              <div className="home-quest-info">
                <strong>{lang === "en" ? "Scribe's Mood" : "Nálada písaře"}</strong>
                <small>{lang === "en" ? "Emotion choice · 4 options (1 attempt) · Easy" : "Výběr emoce · 4 možnosti (1 pokus) · Snadná"}</small>
              </div>
              <span className="home-quest-reward reward-standard">{lang === "en" ? "📜 Standard Pack →" : "📜 Běžný balíček →"}</span>
            </button>
            <button className="home-quest-btn" disabled={!gamesLeft} onClick={() => onGame("scholar")}>
              <span className="home-quest-icon icon-cipher"><KeyRound size={19} /></span>
              <div className="home-quest-info">
                <strong>{lang === "en" ? "Ciphers & Scripts" : "Šifry & Písmo"}</strong>
                <small>{lang === "en" ? "Cryptograms, secret scripts & ductus (1 attempt) · Advanced" : "Kryptogramy, tajná písma & duktus (1 pokus) · Pokročilá"}</small>
              </div>
              <span className="home-quest-reward reward-scholar">{lang === "en" ? "✨ Scholar Pack →" : "✨ Učencův balíček →"}</span>
            </button>
            <button className="home-quest-btn" disabled={!gamesLeft} onClick={() => onGame("paleo")}>
              <span className="home-quest-icon icon-paleo"><PenTool size={19} /></span>
              <div className="home-quest-info">
                <strong>{lang === "en" ? "Palaeographical Master" : "Paleografický mistr"}</strong>
                <small>{lang === "en" ? "Authentic transcription with loupe (up to 5 attempts) · Expert" : "Přepis autentického textu s lupou (až 5 pokusů) · Expertní"}</small>
              </div>
              <span className="home-quest-reward reward-masterwork">{lang === "en" ? "💎 Masterwork Pack →" : "💎 Královský balíček →"}</span>
            </button>
          </div>
        </section>
      </div>

      <section className="home-showcase-section">
        <div className="showcase-header">
          <div>
            <h2>{uniqueOwned > 0 ? (lang === "en" ? "Highlights from Your Archive" : "Výběr z vašeho archivu") : (lang === "en" ? "Colophons to Discover" : "Ukázka kolofonů k objevení")}</h2>
            <small style={{ color: "#765228" }}>{uniqueOwned > 0 ? (lang === "en" ? "Recently examined and unlocked illuminated cards" : "Naposledy prozkoumané a odemčené iluminované karty") : (lang === "en" ? "Open a pack to reveal your first manuscripts" : "Otevřete balíček a odhalte první rukopisy")}</small>
          </div>
          <button onClick={onCollection}>{lang === "en" ? `View entire collection (${uniqueOwned}/${totalCards}) →` : `Zobrazit celou sbírku (${uniqueOwned}/${totalCards}) →`}</button>
        </div>
        <div className="showcase-grid">
          {showcaseCards.map(card => {
            const count = state.collection[card.id] || 0;
            const title = count ? getCardTitle(card, lang) : (lang === "en" ? "Mysterious Codex" : "Tajemný kodex");
            return (
              <button
                key={card.id}
                className={`mini-card rarity-${card.rarity.toLowerCase()} ${count ? "" : "locked"}`}
                onClick={() => count ? onDetail(card) : onPacks()}
                aria-label={count ? `Otevřít detail ${title}` : (lang === "en" ? "Undiscovered card, open pack" : "Neobjevená karta, otevřete balíček")}
              >
                <span className="rarity-label">{count ? card.rarity : (lang === "en" ? "To Discover" : "K objevení")}</span>
                <div className="mini-illustration">{count ? <ColophonImage card={card} /> : <span>?</span>}</div>
                <strong>{title}</strong>
                <small>{count ? `${getCardPlace(card.place, lang)} · ${card.year}` : (lang === "en" ? "Obtain in packs" : "Získejte v balíčcích")}</small>
                {count > 1 && <b className="duplicate">×{count}</b>}
              </button>
            );
          })}
        </div>
      </section>

      <div className="section-title">
        <h2>{lang === "en" ? "Codex Archive Progress" : "Postup kodexového archivu"}</h2>
        <span>{uniqueOwned} {lang === "en" ? "of" : "z"} {totalCards} {lang === "en" ? "discovered" : "objeveno"}</span>
      </div>
      <div className="progress-panel">
        <div className="progress-copy">
          <strong>{lang === "en" ? "Collection Completion Progress" : "Postup kompletace sbírky"}</strong>
          <span>{progressPercent}%</span>
        </div>
        <div className="progress">
          <i style={{ width: `${progressPercent}%` }} />
        </div>
        <button onClick={onCollection}>{lang === "en" ? `Open full collection (${uniqueOwned} card${uniqueOwned === 1 ? "" : "s"})` : `Otevřít celou sbírku (${uniqueOwned} ${uniqueOwned === 1 ? "karta" : uniqueOwned >= 2 && uniqueOwned <= 4 ? "karty" : "karet"})`}</button>
      </div>

      <div className="home-secondary-grid">
        <section className="home-panel-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <h3 style={{ margin: 0 }}>{lang === "en" ? "16-day Illuminated Mosaic" : "16denní iluminovaná mozaika"}</h3>
                <span className={`rarity-pill rarity-${activeIllumination.rarity.toLowerCase()}`} style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "10px", fontWeight: 800, textTransform: "uppercase" }}>
                  {activeIllumination.rarity}
                </span>
              </div>
              <p style={{ margin: "3px 0 0", fontSize: "11px", color: "#684824" }}>
                <strong>{getIlluminationTitle(activeIllumination, lang)}</strong> · {getIlluminationOrigin(activeIllumination, lang)} ({getIlluminationCentury(activeIllumination, lang)})
              </p>
            </div>
            <button className="icon-label" onClick={onGallery} style={{ padding: "4px 8px", fontSize: "11px" }}>
              {lang === "en" ? "Details →" : "Detail →"}
            </button>
          </div>
          <div className="home-mosaic-row">
            <div className="home-mosaic-wrapper">
              <IlluminationMosaic pieces={state.puzzle} compact illumination={activeIllumination} />
            </div>
            <div className="home-mosaic-info">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px", fontSize: "12px", fontWeight: 700, color: "var(--brown)", marginBottom: "4px", flexWrap: "wrap" }}>
                <span style={{ fontWeight: 800 }}>{getIlluminationTierName(activeIllumination, lang) || (lang === "en" ? `Cycle ${activeIllumination.cycle}` : `Cyklus ${activeIllumination.cycle}`)}</span>
                <span style={{ whiteSpace: "nowrap", color: "#8b5a19", fontSize: "11px", fontWeight: 700 }}>{state.puzzle} {lang === "en" ? "of 16" : "z 16"}</span>
              </div>
              <div className="progress" style={{ height: "10px", background: "#dcc296" }}>
                <i style={{ width: `${(state.puzzle / 16) * 100}%` }} />
              </div>

              <p className="home-mosaic-desc">
                {getIlluminationDescription(activeIllumination, lang)}
              </p>

              <div>
                {state.puzzle < 16 ? (
                  <>
                    <small style={{ display: "block", marginTop: "6px", color: "#684824", fontSize: "11px", lineHeight: "1.4" }}>
                      {(() => {
                        const remLogins = 16 - state.puzzle;
                        if (lang === "en") return `Remaining: ${remLogins} daily login${remLogins === 1 ? "" : "s"} in a row to complete the illumination.`;
                        if (remLogins === 1) return "Zbývá 1 denní přihlášení do dokončení celého díla.";
                        if (remLogins >= 2 && remLogins <= 4) return `Zbývají ${remLogins} denní přihlášení v řadě do dokončení celého díla.`;
                        return `Zbývá ${remLogins} denních přihlášení v řadě do dokončení celého díla.`;
                      })()}
                    </small>
                    <div className="home-mosaic-reward-callout">
                      🎁 {lang === "en" ? `Reward: +${activeIllumination.rewardXp} XP & Pack` : `Odměna: +${activeIllumination.rewardXp} XP & balíček`}{" "}
                      <span style={{ color: "#7a4e17", fontWeight: 500, fontSize: "10.5px" }}>({lang === "en" ? `Cycle ${activeIllumination.cycle + 1} follows` : `poté Cyklus ${activeIllumination.cycle + 1}`})</span>
                    </div>
                  </>
                ) : (
                  <small style={{ display: "block", marginTop: "6px", color: "#2d6316", fontWeight: 700, fontSize: "11px", lineHeight: "1.4" }}>
                    {lang === "en"
                      ? `🎉 Cycle ${activeIllumination.cycle} complete! Reward +${activeIllumination.rewardXp} XP & pack added to profile. Tomorrow at dawn, Cycle ${activeIllumination.cycle + 1} begins!`
                      : `🎉 Cyklus ${activeIllumination.cycle} dokončen! Odměna +${activeIllumination.rewardXp} XP a balíček připsány do profilu. Zítra za úsvitu začíná Cyklus ${activeIllumination.cycle + 1}!`}
                  </small>
                )}
              </div>

              <div className="home-mosaic-actions">
                <button
                  className="illuminated-button"
                  onClick={onGallery}
                  style={{ width: "100%", justifyContent: "center", fontSize: "11px", padding: "6px 10px" }}
                >
                  {lang === "en" ? "View in Illumination Gallery" : "Prohlédnout v Galerii iluminací"} <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="home-panel-card home-map-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
            <div>
              <h3 style={{ margin: "0 0 2px" }}>
                {lang === "en" ? "Historical Map of Scriptoria & Archives" : "Historická mapa skriptorií a archivů"}
              </h3>
              <p style={{ margin: 0, fontSize: "11px", color: "#735028" }}>
                {lang === "en"
                  ? "Where surviving medieval codices and colophons are housed today."
                  : "Kde jsou dochované středověké kodexy a kolofony dnes uloženy."}
              </p>
            </div>
            <button className="icon-label" onClick={() => onMap()} style={{ padding: "4px 8px", fontSize: "11px" }}>
              {lang === "en" ? `Full Map (${uniqueOwned}/${totalCards}) →` : `Celá mapa (${uniqueOwned}/${totalCards}) →`}
            </button>
          </div>

          <div className="home-map-container">
            <RealLeafletMap
              scriptoria={scriptoriaWithCards}
              selectedPlace={selectedHomePlace}
              onSelectPlace={(place) => setSelectedHomePlace(place)}
              compact
              onOpenFull={(place) => onMap(place)}
              lang={lang}
            />
          </div>

          <div className="home-map-bottom">
            <div className="home-map-storage-pill">
              🏛️ <strong>{lang === "en" ? "Custody of Codices:" : "Uložení kodexů:"}</strong> {lang === "en" ? "National Library of the CR (Prague), Opava Land Archive (Olomouc), Vyšší Brod Monastery, Moravian Library Brno, Rajhrad, Krakow, Zittau, Bologna, Florence." : "Národní knihovna ČR (Praha), Zemský archiv v Opavě (Olomouc), Klášter Vyšší Brod, MZK Brno, Rajhrad, Krakov, Zittau, Bologna, Florencie."}
            </div>
            <button className="illuminated-button" onClick={() => onMap()} style={{ width: "100%", justifyContent: "center" }}>
              {lang === "en" ? `Open full map with manuscript details (${uniqueOwned}/${totalCards})` : `Otevřít velkou mapu s detaily kodexů (${uniqueOwned}/${totalCards})`} <span>→</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function PacksScreen({
  state,
  onOpen,
  onGame,
  lang = "cs",
}: {
  state: GameState;
  onOpen: (tier?: PackQuality | "daily") => void;
  onGame: (g: "mood" | "scholar" | "cipher" | "script" | "paleo") => void;
  lang?: Language;
}) {
  const [selectedTier, setSelectedTier] = useState<PackQuality>("standard");

  const dailyRemaining = Math.max(0, MAX_DAILY_PACKS - state.packsOpened);
  const bonusStandard = state.bonusPacks.filter((p) => p === "standard").length;
  const standardCount = dailyRemaining + bonusStandard;
  const scholarCount = state.bonusPacks.filter((p) => p === "refined").length;
  const masterworkCount = state.bonusPacks.filter((p) => p === "masterwork").length;

  const countForSelected =
    selectedTier === "masterwork"
      ? masterworkCount
      : selectedTier === "refined"
      ? scholarCount
      : standardCount;

  const packsLeft = Math.max(0, MAX_DAILY_PACKS - state.packsOpened);
  const gamesLeft = Math.max(0, MAX_DAILY_GAMES - state.gamesPlayed);

  return (
    <div className="screen packs-screen">
      <PageTitle kicker={lang === "en" ? "Daily Scriptorium" : "Denní skriptorium"}>
        {lang === "en" ? "Pack Opening" : "Otevření balíčků"}
      </PageTitle>

      {/* Denní přehled */}
      <div className="daily-ledger">
        <div className="daily-ledger-col">
          <div className="daily-ledger-header">
            <ScrollText size={13} />
            <span>{lang === "en" ? "Daily Packs" : "Denní balíčky"}</span>
          </div>
          <div className="daily-ledger-counter">
            <strong>{packsLeft}</strong>
            <span>{lang === "en" ? `of ${MAX_DAILY_PACKS} available` : `ze ${MAX_DAILY_PACKS} k dispozici`}</span>
          </div>
          <div className="ledger-pack-seals">
            {Array.from({ length: MAX_DAILY_PACKS }).map((_, i) => {
              const isOpened = i < state.packsOpened;
              const roman = ["I", "II", "III"][i];
              return (
                <div
                  key={i}
                  className="ledger-pack-seal"
                  title={
                    isOpened
                      ? (lang === "en" ? `Daily Pack ${roman}: Already opened today` : `Denní balíček ${roman}: Dnes již otevřen`)
                      : (lang === "en" ? `Daily Pack ${roman}: Ready to unseal` : `Denní balíček ${roman}: Připraven k otevření`)
                  }
                >
                  <div className={`ledger-pack-seal-pip ${isOpened ? "opened" : "ready"}`}>
                    {isOpened ? <CheckCircle2 size={15} /> : "Q"}
                  </div>
                  <span className={`ledger-pack-seal-label ${isOpened ? "opened" : ""}`}>
                    {isOpened ? (lang === "en" ? "Opened" : "Otevřen") : (lang === "en" ? `Pack ${roman}` : `Balíček ${roman}`)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="daily-ledger-col">
          <div className="daily-ledger-header games">
            <Trophy size={13} />
            <span>{lang === "en" ? "Scribe Challenges" : "Písařské výzvy"}</span>
          </div>
          <div className="daily-ledger-counter games">
            <strong>{gamesLeft}</strong>
            <span>{lang === "en" ? `of ${MAX_DAILY_GAMES} available` : `z ${MAX_DAILY_GAMES} k dispozici`}</span>
          </div>
          <div className="ledger-game-tokens">
            {Array.from({ length: MAX_DAILY_GAMES }).map((_, i) => {
              const isPlayed = i < state.gamesPlayed;
              const roman = ["I", "II", "III", "IV", "V"][i];
              const outcome = state.dailyGamesHistory?.[i] || "success";
              const isFailed = isPlayed && outcome === "fail";
              return (
                <div
                  key={i}
                  className="ledger-game-token"
                  title={
                    !isPlayed
                      ? (lang === "en" ? `Scribe Challenge ${roman}: Available` : `Písařská výzva ${roman}: K dispozici`)
                      : isFailed
                      ? (lang === "en" ? `Scribe Challenge ${roman}: Failed` : `Písařská výzva ${roman}: Výzva zmařena (neúspěch)`)
                      : (lang === "en" ? `Scribe Challenge ${roman}: Completed (+reward)` : `Písařská výzva ${roman}: Úspěšně splněno (+odměna)`)
                  }
                >
                  <div
                    className={`ledger-game-token-pip ${
                      !isPlayed ? "ready" : isFailed ? "failed" : "success"
                    }`}
                  >
                    {!isPlayed ? "✦" : isFailed ? <X size={13} strokeWidth={2.5} /> : <CheckCircle2 size={13} />}
                  </div>
                  <span
                    className={`ledger-game-token-label ${
                      !isPlayed ? "" : isFailed ? "failed" : "success"
                    }`}
                  >
                    {!isPlayed ? (lang === "en" ? `Challenge ${roman}` : `Výzva ${roman}`) : isFailed ? (lang === "en" ? "Failed" : "Neúspěch") : (lang === "en" ? "Completed" : "Splněno")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="daily-ledger-footer">
          <span>{lang === "en" ? "📜 The daily allowance of packs and challenges is granted solely upon today's login and never accumulates." : "📜 Denní dávka balíčků i výzev platí výhradně pro dnešní přihlášení a do dalších dnů se nesčítá."}</span>
        </div>
      </div>

      {/* Přepínač balíčků (Pack Tier Selector) */}
      <div className="pack-tier-tabs" role="tablist" aria-label={lang === "en" ? "Pack tier selection" : "Výběr druhu balíčku"}>
        <button
          type="button"
          role="tab"
          aria-selected={selectedTier === "standard"}
          className={`pack-tier-tab tier-standard ${selectedTier === "standard" ? "active" : ""}`}
          onClick={() => setSelectedTier("standard")}
        >
          {standardCount > 0 && <span className="tier-count-pill">{standardCount}</span>}
          <strong>{lang === "en" ? "Standard Pack" : "Běžný balíček"}</strong>
          <span>{standardCount > 0 ? (lang === "en" ? `${standardCount} available` : `${standardCount} k dispozici`) : (lang === "en" ? "0 available" : "0 k dispozici")}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={selectedTier === "refined"}
          className={`pack-tier-tab tier-scholar ${selectedTier === "refined" ? "active" : ""}`}
          onClick={() => setSelectedTier("refined")}
        >
          {scholarCount > 0 && <span className="tier-count-pill">{scholarCount}</span>}
          <strong>{lang === "en" ? "Scholar Pack" : "Učencův balíček"}</strong>
          <span>{scholarCount > 0 ? (lang === "en" ? `${scholarCount} available` : `${scholarCount} k dispozici`) : (lang === "en" ? "0 available" : "0 k dispozici")}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={selectedTier === "masterwork"}
          className={`pack-tier-tab tier-masterwork ${selectedTier === "masterwork" ? "active" : ""}`}
          onClick={() => setSelectedTier("masterwork")}
        >
          {masterworkCount > 0 && <span className="tier-count-pill">{masterworkCount}</span>}
          <strong>{lang === "en" ? "Masterwork Pack" : "Královský balíček"}</strong>
          <span>{masterworkCount > 0 ? (lang === "en" ? `${masterworkCount} available` : `${masterworkCount} k dispozici`) : (lang === "en" ? "0 available" : "0 k dispozici")}</span>
        </button>
      </div>

      {/* Samotný zapečetěný balíček s dynamickým stylem a animací */}
      <section
        className={`sealed-pack tier-${selectedTier} ${countForSelected === 0 ? "empty" : ""}`}
      >
        <div className={`pack-ribbon quality-${selectedTier}`}>
          {countForSelected > 0
            ? (lang === "en"
                ? `${countForSelected} remaining to open`
                : countForSelected === 1
                ? "1 zbývá k otevření"
                : countForSelected >= 2 && countForSelected <= 4
                ? `${countForSelected} zbývají k otevření`
                : `${countForSelected} zbývá k otevření`)
            : (lang === "en" ? "Pack unavailable" : "Balíček není k dispozici")}
        </div>

        <div className="seal-orbit">
          <i />
          <i />
          <i />
          <div className="wax-seal">
            {selectedTier === "masterwork" ? "✦" : selectedTier === "refined" ? "⚜" : "Q"}
          </div>
        </div>

        <div className="manuscript-lines">
          <i />
          <i />
          <i />
        </div>

        <h2>
          <span className={`pack-quality-title quality-${selectedTier}`}>
            {qualityLabel(selectedTier, lang)}
          </span>
        </h2>

        {/* Šance na rarity */}
        <div className="pack-odds-badge">
          {selectedTier === "masterwork" && "💎 Rare 34% · Epic 32% · Legendary 26% · Unique 8%"}
          {selectedTier === "refined" && "✨ Uncommon 20% · Rare 50% · Epic 27% · Legendary 3%"}
          {selectedTier === "standard" && "📜 Common 50% · Uncommon 28% · Rare 15% · Epic 5% · Legendary 1.5% · Unique 0.5%"}
        </div>

        <p>
          {selectedTier === "masterwork"
            ? (lang === "en"
                ? "Supreme royal edition. Guarantees Rare+ cards with high odds of mythical Unique codices."
                : "Nejvyšší královská edice. Garantuje pouze Rare a vyšší karty s vysokou šancí na mýtické unikáty.")
            : selectedTier === "refined"
            ? (lang === "en"
                ? "Scholar pack with boosted chances for Rare and Epic colophons for dedicated researchers."
                : "Učencův balíček se zvýšenou šancí na vzácné a epické kolofony pro badatele.")
            : dailyRemaining > 0
            ? (lang === "en"
                ? "Daily scriptorium pack containing 5 cards of all rarities including a chance for Legendary and Unique treasures."
                : "Denní skriptoriální balíček obsahující 5 karet všech vzácností včetně šance na Legendary a Unique poklady.")
            : (lang === "en"
                ? "Standard daily allowance exhausted. Earn additional packs by completing challenges below."
                : "Základní denní příděl je vyčerpán. Můžete získat další splněním některé z výzev níže.")}
        </p>

        {countForSelected > 0 ? (
          <button
            className={`illuminated-button tier-${selectedTier}`}
            onClick={() => onOpen(selectedTier)}
            style={{ width: "100%", maxWidth: "340px", justifyContent: "center" }}
          >
            {lang === "en" ? `Unseal ${qualityLabel(selectedTier, lang)} (5 cards)` : `Otevřít ${qualityLabel(selectedTier, lang)} (5 karet)`} <span>→</span>
          </button>
        ) : (
          <div className="empty-pack-prompt">
            <span>
              {selectedTier === "masterwork"
                ? (lang === "en" ? "Earn a Masterwork Pack by transcribing lines in Palaeographical Master." : "Královský balíček získáte úspěšným přepisem v Paleografickém mistrovi.")
                : selectedTier === "refined"
                ? (lang === "en" ? "Earn a Scholar Pack by cracking ciphers or identifying script & dating." : "Učencův balíček získáte vyřešením šifry nebo určením písma a století.")
                : (lang === "en" ? "Standard packs replenish tomorrow at dawn, or complete a challenge below." : "Běžné balíčky se obnoví zítra za svítání, nebo splňte výzvu níže.")}
            </span>
            {selectedTier === "masterwork" && (
              <button
                className="illuminated-button tier-masterwork"
                disabled={!gamesLeft}
                onClick={() => onGame("paleo")}
                style={{ width: "auto", minWidth: "220px", padding: "10px 18px", fontSize: "12px" }}
              >
                {lang === "en" ? "Launch Palaeographical Master" : "Spustit Paleografického mistra"} <span>→</span>
              </button>
            )}
            {selectedTier === "refined" && (
              <button
                className="illuminated-button tier-scholar"
                disabled={!gamesLeft}
                onClick={() => onGame("scholar")}
                style={{ width: "auto", minWidth: "220px", padding: "10px 18px", fontSize: "12px" }}
              >
                {lang === "en" ? "Launch Ciphers & Scripts" : "Spustit Šifry & Písmo"} <span>→</span>
              </button>
            )}
            {selectedTier === "standard" && (
              <button
                className="illuminated-button tier-standard"
                disabled={!gamesLeft}
                onClick={() => onGame("mood")}
                style={{ width: "auto", minWidth: "220px", padding: "10px 18px", fontSize: "12px" }}
              >
                {lang === "en" ? "Launch Scribe's Mood" : "Spustit Náladu písaře"} <span>→</span>
              </button>
            )}
          </div>
        )}
      </section>

      {/* Výzvy o další balíčky */}
      <div className="section-title">
        <div>
          <h2>{lang === "en" ? "Earn Another Bonus Pack" : "Získejte další bonusový balíček"}</h2>
          <small style={{ color: "#765228", display: "block", marginTop: "2px", fontSize: "11px" }}>
            {lang === "en"
              ? "Master any of the three scribal disciplines to unlock an authentic bonus pack."
              : "Splňte některou ze tří písařských disciplín a získejte odpovídající balíček."}
          </small>
        </div>
        <span className="quests-counter-badge">{gamesLeft}/{MAX_DAILY_GAMES} {lang === "en" ? "challenges available" : "výzev k dispozici"}</span>
      </div>

      <div className="game-grid-3">
        {/* HRA 1: NÁLADA PÍSAŘE */}
        <button
          className="game-grid-card tier-standard"
          disabled={!gamesLeft}
          onClick={() => onGame("mood")}
        >
          <div className="game-card-top">
            <span className="game-seal-medallion seal-mood">
              <Smile size={23} />
            </span>
            <span className="game-difficulty-pill diff-easy">{lang === "en" ? "Easy" : "Snadná"}</span>
          </div>
          <div className="game-card-content">
            <strong>{lang === "en" ? "Scribe's Mood" : "Nálada písaře"}</strong>
            <p>{lang === "en" ? "Deduce the scribe's emotional state from the original quote and translation (1 attempt)." : "Odhadněte z autentického citátu a překladu rozpoložení středověkého písaře (1 pokus)."}</p>
          </div>
          <div className="game-card-footer">
            <span className="game-reward-tag reward-standard">
              📜 {lang === "en" ? "Standard Pack" : "Běžný balíček"}
            </span>
            <span className="game-action-arrow">{lang === "en" ? "Play →" : "Hrát →"}</span>
          </div>
        </button>

        {/* HRA 2: ŠIFRY & PÍSMO */}
        <button
          className="game-grid-card tier-scholar"
          disabled={!gamesLeft}
          onClick={() => onGame("scholar")}
        >
          <div className="game-card-top">
            <span className="game-seal-medallion seal-cipher">
              <KeyRound size={23} />
            </span>
            <span className="game-difficulty-pill diff-advanced">{lang === "en" ? "Advanced" : "Pokročilá"}</span>
          </div>
          <div className="game-card-content">
            <strong>{lang === "en" ? "Ciphers & Scripts" : "Šifry & Písmo"}</strong>
            <p>{lang === "en" ? "Solve a medieval cryptogram, substitution cipher, or identify the palaeographical script ductus and century." : "Rozluštěte středověký kryptogram, substituční šifru nebo zařaďte paleografický duktus a století kodexu."}</p>
          </div>
          <div className="game-card-footer">
            <span className="game-reward-tag reward-scholar">
              ✨ {lang === "en" ? "Scholar Pack" : "Učencův balíček"}
            </span>
            <span className="game-action-arrow">{lang === "en" ? "Play →" : "Hrát →"}</span>
          </div>
        </button>

        {/* HRA 3: PALEOGRAFICKÝ MISTR */}
        <button
          className="game-grid-card tier-masterwork"
          disabled={!gamesLeft}
          onClick={() => onGame("paleo")}
        >
          <div className="game-card-top">
            <span className="game-seal-medallion seal-paleo">
              <PenTool size={23} />
            </span>
            <span className="game-difficulty-pill diff-expert">{lang === "en" ? "Expert" : "Expertní"}</span>
          </div>
          <div className="game-card-content">
            <strong>{lang === "en" ? "Palaeographical Master" : "Paleografický mistr"}</strong>
            <p>{lang === "en" ? "Transcribe authentic Latin lines directly from the manuscript using the paleographical lens (up to 5 attempts)." : "Přepis autentických latinských řádků přímo z rukopisu s paleografickou lupou (až 5 pokusů k odevzdání)."}</p>
          </div>
          <div className="game-card-footer">
            <span className="game-reward-tag reward-masterwork">
              💎 {lang === "en" ? "Masterwork Pack" : "Královský balíček"}
            </span>
            <span className="game-action-arrow">{lang === "en" ? "Play →" : "Hrát →"}</span>
          </div>
        </button>
      </div>
    </div>
  );
}

function CollectionScreen({ state, cards, filter, setFilter, onDetail, lang = "cs" }: { state: GameState; cards: Colophon[]; filter: Rarity | "All"; setFilter: (f: Rarity | "All") => void; onDetail: (c: Colophon) => void; lang?: Language }) {
  const [search, setSearch] = useState("");
  const [onlyOwned, setOnlyOwned] = useState(false);
  const rarities: (Rarity | "All")[] = ["All", "Common", "Uncommon", "Rare", "Epic", "Legendary", "Unique"];

  const displayedCards = cards.filter(c => {
    const isOwned = Boolean(state.collection[c.id]);
    if (onlyOwned && !isOwned) return false;
    if (filter !== "All" && c.rarity !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match = getCardTitle(c, lang).toLowerCase().includes(q) ||
                    c.title.toLowerCase().includes(q) ||
                    c.scribe.toLowerCase().includes(q) ||
                    c.place.toLowerCase().includes(q) ||
                    c.quote.toLowerCase().includes(q) ||
                    String(c.year).includes(q);
      if (!match) return false;
    }
    return true;
  });

  return <div className="screen collection-screen">
    <PageTitle kicker={lang === "en" ? "Illuminated Archive" : "Iluminovaný archiv"}>
      {lang === "en" ? "Colophon Collection" : "Sbírka kolofonů"}
    </PageTitle>
    <div className="collection-summary">
      <div><strong>{Object.keys(state.collection).length}</strong><span>{lang === "en" ? "discovered" : "objeveno"}</span></div>
      <div><strong>{Object.values(state.collection).reduce((a, b) => a + b, 0)}</strong><span>{lang === "en" ? "total cards" : "karet celkem"}</span></div>
      <div><strong>{Object.values(state.collection).filter(n => n > 1).length}</strong><span>{lang === "en" ? "duplicates" : "duplikátů"}</span></div>
    </div>

    <div className="collection-controls">
      <div className="collection-search-wrap">
        <input
          type="text"
          className="collection-search-input"
          placeholder={lang === "en" ? "Search scribe, place, colophon text or year..." : "Hledat písaře, město, text kolofonu nebo rok..."}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className="collection-search-clear" onClick={() => setSearch("")} title={lang === "en" ? "Clear search" : "Vymazat hledání"}>
            ×
          </button>
        )}
      </div>
      <button
        className={`owned-toggle-btn ${onlyOwned ? "active" : ""}`}
        onClick={() => setOnlyOwned(!onlyOwned)}
        title={lang === "en" ? "Filter only owned codices" : "Filtrovat pouze již objevené kodexy"}
      >
        <span>{onlyOwned ? "✓" : "○"}</span> {lang === "en" ? "Owned only" : "Pouze vlastněné"}
      </button>
    </div>

    <div className="filter-row" aria-label="Filtrovat karty dle rarity">
      {rarities.map(r => (
        <button key={r} className={filter === r ? "active" : ""} onClick={() => setFilter(r)}>
          {r === "All" ? (lang === "en" ? "All" : "Všechny") : r}
        </button>
      ))}
    </div>

    {displayedCards.length === 0 ? (
      <div style={{ textAlign: "center", padding: "40px 10px", color: "var(--brown)" }}>
        <p style={{ fontStyle: "italic", fontSize: "14px" }}>
          {lang === "en" ? "No colophon matches your search or filter." : "Žádný kolofon neodpovídá zadanému hledání nebo filtru."}
        </p>
      </div>
    ) : (
      <div className="card-grid">
        {displayedCards.map(card => {
          const count = state.collection[card.id] || 0;
          const title = count ? getCardTitle(card, lang) : (lang === "en" ? "Mysterious Codex" : "Tajemný kodex");
          return <button key={card.id} className={`mini-card rarity-${card.rarity.toLowerCase()} ${count ? "" : "locked"}`} onClick={() => count && onDetail(card)} aria-label={count ? `Otevřít ${title}` : (lang === "en" ? "Undiscovered card" : "Neobjevená karta")}>
            <span className="rarity-label">{count ? card.rarity : (lang === "en" ? "Undiscovered" : "Neobjeveno")}</span>
            <div className="mini-illustration">{count ? <ColophonImage card={card} /> : <span>?</span>}</div>
            <strong>{title}</strong>
            <small>{count ? `${getCardPlace(card.place, lang)} · ${card.year}` : (lang === "en" ? "Obtain in packs" : "Získejte v balíčcích")}</small>
            {count > 1 && <b className="duplicate">×{count}</b>}
          </button>;
        })}
      </div>
    )}
  </div>;
}

function TrophiesScreen({
  state,
  cards,
  activeIllumination,
  lang = "cs",
}: {
  state: GameState;
  cards: Colophon[];
  activeIllumination: IlluminationMosaicItem;
  lang?: Language;
}) {
  const [statusFilter, setStatusFilter] = useState<"all" | "earned" | "locked">("all");
  const [diffFilter, setDiffFilter] = useState<"all" | TrophyDifficulty>("all");
  const [catFilter, setCatFilter] = useState<string>("all");

  const storedTrophies: TrophyItem[] = useMemo(() => getStoredTrophies(), []);
  const storedCategories: TrophyCategoryItem[] = useMemo(() => getStoredTrophyCategories(), []);

  function checkTrophy(t: TrophyItem): boolean {
    return evaluateTrophy(t, state, cards, {
      nowHour: new Date().getHours(),
      loupeMaxUsed: state.loupeMaxUsed,
    });
  }

  function formatTrophyTimestamp(iso: string | undefined): string {
    if (!iso) return lang === "en" ? "Unlocked" : "Splněno";
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return lang === "en" ? "Unlocked" : "Splněno";
      return lang === "en"
        ? `Unlocked: ${d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}, ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
        : `Získáno: ${d.toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" })} ${d.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })}`;
    } catch {
      return lang === "en" ? "Unlocked" : "Splněno";
    }
  }

  const trophiesWithStatus = useMemo(() => {
    return storedTrophies.map((t) => ({
      ...t,
      earned: checkTrophy(t),
    }));
  }, [storedTrophies, state, cards]);

  const earnedCount = trophiesWithStatus.filter((t) => t.earned).length;

  const filteredTrophies = useMemo(() => {
    return trophiesWithStatus.filter((t) => {
      if (statusFilter === "earned" && !t.earned) return false;
      if (statusFilter === "locked" && t.earned) return false;
      if (diffFilter !== "all" && t.difficulty !== diffFilter) return false;
      if (catFilter !== "all" && t.category !== catFilter) return false;
      return true;
    });
  }, [trophiesWithStatus, statusFilter, diffFilter, catFilter]);

  return (
    <div className="screen trophies-screen">
      <PageTitle kicker={lang === "en" ? "Pilgrim's Milestones" : "Poutníkovy milníky"}>
        {lang === "en" ? "Scribal Honors & Challenges" : "Písařská ocenění & výzvy"}
      </PageTitle>

      <section className="puzzle-board">
        <div className="puzzle-copy">
          <p>{lang === "en" ? `16-day illuminated mosaic · Cycle ${activeIllumination.cycle}` : `16denní iluminovaná mozaika · Cyklus ${activeIllumination.cycle}`}</p>
          <h2>{state.puzzle}/16 {lang === "en" ? "days" : "dní"}</h2>
          <small>{lang === "en" ? "Daily streak reveals:" : "Denní přihlašování v řadě odhaluje:"} <strong>{getIlluminationTitle(activeIllumination, lang)}</strong> ({activeIllumination.rarity}).</small>
          <div className="progress"><i style={{ width: `${(state.puzzle / 16) * 100}%` }} /></div>
        </div>
        <IlluminationMosaic pieces={state.puzzle} compact illumination={activeIllumination} />
      </section>

      <div className="section-title">
        <h2>{lang === "en" ? "Scribal Honors" : "Získané pocty"}</h2>
        <span>{earnedCount}/{storedTrophies.length} {lang === "en" ? "completed" : "splněno"}</span>
      </div>

      {/* Filtry výzev */}
      <div className="space-y-2 mb-3">
        {/* Filtr podle stavu */}
        <div className="trophy-filters">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`trophy-filter-btn ${statusFilter === "all" ? "active" : ""}`}
          >
            {lang === "en" ? "All" : "Vše"} ({storedTrophies.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("earned")}
            className={`trophy-filter-btn ${statusFilter === "earned" ? "active" : ""}`}
          >
            🏆 {lang === "en" ? "Completed" : "Získané"} ({earnedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("locked")}
            className={`trophy-filter-btn ${statusFilter === "locked" ? "active" : ""}`}
          >
            🔒 {lang === "en" ? "Locked" : "K odemčení"} ({storedTrophies.length - earnedCount})
          </button>
        </div>

        {/* Filtr podle obtížnosti a kategorie */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-bold text-[#725433] uppercase mr-1">
            {lang === "en" ? "Tier:" : "Obtížnost:"}
          </span>
          <button
            type="button"
            onClick={() => setDiffFilter("all")}
            className={`trophy-filter-btn ${diffFilter === "all" ? "active" : ""}`}
          >
            {lang === "en" ? "All" : "Všechny"}
          </button>
          {(["easy", "medium", "hard", "impossible"] as const).map((df) => {
            const meta = TROPHY_DIFFICULTY_META[df];
            return (
              <button
                key={df}
                type="button"
                onClick={() => setDiffFilter(df)}
                className={`trophy-filter-btn ${diffFilter === df ? "active" : ""}`}
              >
                {lang === "en" ? meta.label_en : meta.label_cs}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-bold text-[#725433] uppercase mr-1">
            {lang === "en" ? "Category:" : "Kategorie:"}
          </span>
          <button
            type="button"
            onClick={() => setCatFilter("all")}
            className={`trophy-filter-btn ${catFilter === "all" ? "active" : ""}`}
          >
            {lang === "en" ? "All" : "Všechny"}
          </button>
          {storedCategories.map((cat) => {
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCatFilter(cat.id)}
                className={`trophy-filter-btn ${catFilter === cat.id ? "active" : ""}`}
              >
                <span>{cat.icon}</span> <span>{lang === "en" ? cat.label_en : cat.label_cs}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Seznam výzev */}
      <div className="trophy-list">
        {filteredTrophies.length === 0 ? (
          <div className="p-6 text-center text-sm italic text-[#725433] border border-dashed border-[#a88258] rounded bg-[#f5e8cd]">
            {lang === "en" ? "No challenges match the selected filters." : "Žádné výzvy neodpovídají vybraným filtrům."}
          </div>
        ) : (
          filteredTrophies.map((t) => {
            const diffMeta = TROPHY_DIFFICULTY_META[t.difficulty] || TROPHY_DIFFICULTY_META.medium;
            const catMeta = storedCategories.find((c) => c.id === t.category) || {
              label_cs: t.category,
              label_en: t.category,
              icon: "📜",
            };
            const title = lang === "en" ? (t.title_en || t.title) : t.title;
            const text = lang === "en" ? (t.text_en || t.text) : t.text;
            const ts = state.trophyTimestamps?.[t.id];

            return (
              <article key={t.id} className={t.earned ? "earned" : "locked"}>
                {t.image_url ? (
                  <div className="trophy-image-box">
                    <img src={t.image_url} alt={title} />
                  </div>
                ) : (
                  <div className="illuminated-initial">{t.initial}</div>
                )}
                <div className="min-w-0 pr-2">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <strong>{title}</strong>
                    <span className={`trophy-badge trophy-badge-${t.difficulty}`}>
                      {lang === "en" ? diffMeta.label_en : diffMeta.label_cs}
                    </span>
                    <span className="text-[10px] text-[#725433] bg-[#ebdab7] px-1.5 py-0.5 rounded border border-[#d6be90] font-medium flex items-center gap-1">
                      <span>{catMeta.icon}</span>
                      <span>{lang === "en" ? catMeta.label_en : catMeta.label_cs}</span>
                    </span>
                  </div>
                  <p>{text}</p>
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
                    <small className="text-[#1039a0] font-bold text-[11px]">
                      +{t.xp} XP
                    </small>
                    {t.earned && (
                      <span className="trophy-timestamp">
                        🕒 {formatTrophyTimestamp(ts)}
                      </span>
                    )}
                  </div>
                </div>
                <span className="flex items-center justify-center pl-1">
                  {t.earned ? <Award size={20} className="text-[#a07412]" /> : <LockKeyhole size={18} className="text-[#8c745b]" />}
                </span>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

function ProfileScreen({
  state,
  uniqueOwned,
  duplicates,
  isLive,
  currentUser,
  currentProfile,
  activeIllumination,
  illuminations,
  colleagues = [],
  pendingGifts = [],
  pendingTrades = [],
  onOpenAuth,
  onLogout,
  onReset,
  onAdvanceDay,
  onBreakStreak,
  onSend,
  onAcceptGift,
  onOpenTrade,
  onReviewTrade,
  onSetAvatar,
  onDeleteAccount,
  onOpenTutorial,
  lang = "cs",
  onSetLang,
}: {
  state: GameState;
  uniqueOwned: number;
  duplicates: number;
  isLive?: boolean;
  currentUser?: any;
  currentProfile?: UserProfile | null;
  activeIllumination: IlluminationMosaicItem;
  illuminations: IlluminationMosaicItem[];
  colleagues?: any[];
  pendingGifts?: any[];
  pendingTrades?: CardTrade[];
  onOpenAuth: () => void;
  onLogout: () => void;
  onReset: () => void;
  onAdvanceDay: () => void;
  onBreakStreak: () => void;
  onSend: (target?: any) => void;
  onAcceptGift: (gift: any) => void;
  onOpenTrade?: (colleague?: any) => void;
  onReviewTrade?: (trade: CardTrade) => void;
  onSetAvatar: (id: string) => void;
  onDeleteAccount?: () => void;
  onOpenTutorial?: () => void;
  lang?: Language;
  onSetLang?: (l: Language) => void;
}) {
  const [colleagueQuery, setColleagueQuery] = useState("");
  const filteredColleagues = useMemo(() => {
    if (!colleagueQuery.trim()) return colleagues;
    const q = colleagueQuery.toLowerCase();
    return colleagues.filter(
      (f) =>
        (f.display_name || "").toLowerCase().includes(q) ||
        (f.username || "").toLowerCase().includes(q)
    );
  }, [colleagues, colleagueQuery]);

  const level = levelForXp(state.xp);
  const levelXp = state.xp % XP_PER_LEVEL;
  const title = level >= 10 ? (lang === "en" ? "Master Illuminator" : "Mistr iluminátor") : level >= 6 ? (lang === "en" ? "Journeyman Scribe" : "Písařský tovaryš") : (lang === "en" ? "Scriptorium Apprentice" : "Učedník ve skriptoriu");
  const scribeName = currentProfile?.display_name || currentUser?.user_metadata?.display_name || (currentUser ? currentUser.email?.split("@")[0] : (lang === "en" ? "Master Scribe" : "Mistr písař"));

  return <div className="screen profile-screen">
    <PageTitle kicker={lang === "en" ? "Your place in the margins of the codex" : "Vaše místo na okrajích kodexu"}>
      {lang === "en" ? "Scribe Profile" : "Profil písaře"}
    </PageTitle>

    {/* Volba jazyka hry / Language Switcher - Medieval Scriptorium Charter Design */}
    <div
      style={{
        marginTop: 14,
        marginBottom: 18,
        padding: "16px 18px",
        background: "linear-gradient(145deg, #fbf4e4 0%, #edd8b4 100%)",
        border: "2px solid #8d5b1c",
        outline: "1px solid #bc8a43",
        outlineOffset: "-5px",
        borderRadius: 12,
        boxShadow: "0 6px 16px rgba(74, 45, 11, 0.12), inset 0 0 20px rgba(188, 138, 67, 0.15)",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "18px" }}>📜</span>
          <div>
            <strong style={{ color: "#3d2206", fontSize: "13.5px", fontFamily: "Cinzel, var(--font-display)", letterSpacing: "0.5px", display: "block" }}>
              {lang === "en" ? "Lingua Scriptorii · Game Language" : "Lingua Scriptorii · Jazyk hry"}
            </strong>
            <small style={{ color: "#7a5323", fontSize: "10.5px", fontStyle: "italic" }}>
              {lang === "en" ? "Select your codex & manuscript language" : "Zvolte jazyk rozhraní a překladů kolofonů"}
            </small>
          </div>
        </div>
        <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "10px", background: "rgba(139, 90, 25, 0.12)", border: "1px solid #c49a55", color: "#54380e", fontWeight: 700 }}>
          {lang === "en" ? "Bilingual Codex" : "Dvojjazyčný kodex"}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Česká volba */}
        <button
          type="button"
          onClick={() => { playSoftClick(); onSetLang?.("cs"); }}
          style={{
            padding: "12px 14px",
            borderRadius: 9,
            border: lang === "cs" ? "2px solid #8b2500" : "1px solid #c9b48c",
            background: lang === "cs"
              ? "linear-gradient(180deg, #fff7ea 0%, #faeed5 100%)"
              : "rgba(255, 255, 255, 0.5)",
            boxShadow: lang === "cs"
              ? "0 4px 12px rgba(139, 37, 0, 0.18), inset 0 0 0 1px #d4af37"
              : "inset 0 1px 2px rgba(0,0,0,0.04)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
            textAlign: "left",
            position: "relative",
            transition: "all 0.2s ease",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: lang === "cs"
                ? "radial-gradient(circle, #c86247 0 56%, #9b3022 58% 63%, #b84732 65%)"
                : "radial-gradient(circle, #dfd0b5 0 60%, #c4b08c 62%)",
              border: lang === "cs" ? "2px solid #7a231a" : "1px solid #bba37f",
              boxShadow: lang === "cs" ? "0 2px 6px rgba(122, 35, 26, 0.4)" : "none",
              display: "grid",
              placeItems: "center",
              fontSize: "18px",
              flexShrink: 0,
            }}
          >
            🇨🇿
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <strong style={{ fontSize: "13px", color: lang === "cs" ? "#8b2500" : "#554", fontWeight: 800 }}>
                Čeština
              </strong>
              {lang === "cs" && (
                <span style={{ fontSize: "10px", color: "#8b2500", fontWeight: 800 }}>✓</span>
              )}
            </div>
            <small style={{ display: "block", fontSize: "10px", color: lang === "cs" ? "#784b1a" : "#887", fontStyle: "italic" }}>
              Lingua Bohemica
            </small>
          </div>
        </button>

        {/* Anglická volba */}
        <button
          type="button"
          onClick={() => { playSoftClick(); onSetLang?.("en"); }}
          style={{
            padding: "12px 14px",
            borderRadius: 9,
            border: lang === "en" ? "2px solid #8b2500" : "1px solid #c9b48c",
            background: lang === "en"
              ? "linear-gradient(180deg, #fff7ea 0%, #faeed5 100%)"
              : "rgba(255, 255, 255, 0.5)",
            boxShadow: lang === "en"
              ? "0 4px 12px rgba(139, 37, 0, 0.18), inset 0 0 0 1px #d4af37"
              : "inset 0 1px 2px rgba(0,0,0,0.04)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
            textAlign: "left",
            position: "relative",
            transition: "all 0.2s ease",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: lang === "en"
                ? "radial-gradient(circle, #c86247 0 56%, #9b3022 58% 63%, #b84732 65%)"
                : "radial-gradient(circle, #dfd0b5 0 60%, #c4b08c 62%)",
              border: lang === "en" ? "2px solid #7a231a" : "1px solid #bba37f",
              boxShadow: lang === "en" ? "0 2px 6px rgba(122, 35, 26, 0.4)" : "none",
              display: "grid",
              placeItems: "center",
              fontSize: "18px",
              flexShrink: 0,
            }}
          >
            🇬🇧
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <strong style={{ fontSize: "13px", color: lang === "en" ? "#8b2500" : "#554", fontWeight: 800 }}>
                English
              </strong>
              {lang === "en" && (
                <span style={{ fontSize: "10px", color: "#8b2500", fontWeight: 800 }}>✓</span>
              )}
            </div>
            <small style={{ display: "block", fontSize: "10px", color: lang === "en" ? "#784b1a" : "#887", fontStyle: "italic" }}>
              Lingua Anglica
            </small>
          </div>
        </button>
      </div>

      <div style={{ marginTop: 10, fontSize: "10.5px", color: "#6e4b1b", fontStyle: "italic", textAlign: "center" }}>
        {lang === "en"
          ? "✦ The selected language immediately translates all codices, challenges, and library views."
          : "✦ Zvolený jazyk se okamžitě projeví v celém rozhraní, u všech kodexů i písařských výzev."}
      </div>
    </div>

    {/* Karta účtu a synchronizace */}
    {currentUser ? (
      <div className="profile-account-card">
        <div className="profile-account-header">
          <h3>
            <User size={16} />
            <span>{scribeName}</span>
          </h3>
          <span className="profile-account-role-badge">
            {currentProfile?.role === "admin" ? (lang === "en" ? "🛡️ Administrator" : "🛡️ Administrátor") : (lang === "en" ? "📜 Scriptorium Fellow" : "📜 Člen skriptoria")}
          </span>
        </div>
        <div className="profile-account-details">
          <div>
            <small>{lang === "en" ? "Email account" : "E-mailový účet"}</small>
            <strong>{currentUser.email}</strong>
          </div>
          <div>
            <small>{lang === "en" ? "Account status" : "Stav účtu"}</small>
            <strong style={{ color: "#15803d", display: "flex", alignItems: "center", gap: 4 }}>
              <CheckCircle2 size={13} /> {lang === "en" ? "Active" : "Aktivní"}
            </strong>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          {currentProfile?.role === "admin" ? (
            <a href="/admin" className="profile-admin-link">
              <ExternalLink size={13} /> {lang === "en" ? "Enter Studio" : "Vstoupit do Studia"}
            </a>
          ) : <span />}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button type="button" className="profile-logout-btn" onClick={onLogout}>
              <LogOut size={13} /> {lang === "en" ? "Log Out" : "Odhlásit se"}
            </button>
            {onDeleteAccount && (
              <button
                type="button"
                onClick={onDeleteAccount}
                title={lang === "en" ? "Permanently delete account and all data" : "Trvale zrušit účet a smazat data"}
                style={{
                  background: "transparent",
                  border: "1px solid #b91c1c",
                  color: "#b91c1c",
                  borderRadius: "6px",
                  padding: "6px 10px",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Trash2 size={12} /> {lang === "en" ? "Delete account" : "Zrušit účet"}
              </button>
            )}
          </div>
        </div>
      </div>
    ) : (
      <div className="profile-account-card">
        <div className="profile-account-header">
          <h3>
            <User size={16} />
            <span>{lang === "en" ? "Guest Mode" : "Režim hosta"}</span>
          </h3>
          <span className="profile-account-role-badge" style={{ background: "#e2e8f0", color: "#475569", borderColor: "#cbd5e1" }}>
            👤 {lang === "en" ? "Local Profile" : "Lokální profil"}
          </span>
        </div>
        <p style={{ fontSize: 12, color: "var(--ink-faded)", margin: "0 0 12px", lineHeight: 1.45 }}>
          {lang === "en"
            ? "Your progress and cards are currently stored only in this browser's local cache. Create a free scribe account or sign in to permanently sync your collection to the cloud, earn honors, and trade with colleagues."
            : "Váš herní postup a karty jsou nyní uloženy pouze v paměti tohoto prohlížeče. Založte si bezplatný účet nebo se přihlaste pro trvalé ukládání sbírky do cloudu, získávání trofejí a budoucí obchodování s kolegy."}
        </p>
        <button
          type="button"
          className="auth-submit-btn"
          onClick={onOpenAuth}
          style={{ width: "auto", display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px" }}
        >
          <LogIn size={14} /> {lang === "en" ? "Sign In / Register" : "Přihlásit se / Vytvořit účet"}
        </button>
      </div>
    )}

    <section className="profile-card" style={{ marginTop: 14 }}>
      <div className={`avatar ${state.avatarArt ? "art-avatar" : ""}`}>
        {state.avatarArt ? (
          <img
            src={
              illuminations.find(a => a.id === state.avatarArt)?.source ||
              DEFAULT_ILLUMINATIONS.find(a => a.id === state.avatarArt)?.source ||
              "/illumination-rabbit.png"
            }
            alt="Vybraný portrét"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/illumination-rabbit.png";
            }}
          />
        ) : (
          "Q"
        )}
      </div>
      <div>
        <h2>{scribeName}</h2>
        <p>{title} · {lang === "en" ? "Level" : "Úroveň"} {level}</p>
        <div className="level-progress" aria-label={`${levelXp} z ${XP_PER_LEVEL} XP do úrovně ${level + 1}`}><i style={{ width: `${levelXp}%` }} /></div>
        <small>{levelXp} / {XP_PER_LEVEL} XP · {lang === "en" ? `Remaining: ${XP_PER_LEVEL - levelXp} XP to Level ${level + 1}` : `Zbývá ${XP_PER_LEVEL - levelXp} XP do úrovně ${level + 1}`}</small>
      </div>
    </section>
    <blockquote>“Per pedes et non per manus.” ({lang === "en" ? "By foot and not by hands." : "Nohama a ne rukama."})<cite>{lang === "en" ? "Personal scribe note" : "Osobní zápis písaře"}</cite></blockquote>
    <div className="profile-stats">
      <div><strong>{uniqueOwned}</strong><span>{lang === "en" ? "unique" : "unikátních"}</span></div>
      <div><strong>{state.streak}</strong><span>{lang === "en" ? "day streak" : "dní v řadě"}</span></div>
      <div><strong>{duplicates}</strong><span>{lang === "en" ? "duplicates" : "duplikátů"}</span></div>
    </div>

    <div className="section-title gallery-title">
      <h2>{lang === "en" ? "Illumination Gallery" : "Galerie iluminací"}</h2>
      <span>{state.gallery.length} {lang === "en" ? "completed" : "dokončeno"}</span>
    </div>
    <section className="current-illumination">
      <IlluminationMosaic pieces={state.puzzle} illumination={activeIllumination} />
      <div>
        <p style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span>{lang === "en" ? `Current Work · Cycle ${activeIllumination.cycle}` : `Rozpracované dílo · Cyklus ${activeIllumination.cycle}`}</span>
          <span className={`rarity-pill rarity-${activeIllumination.rarity.toLowerCase()}`} style={{ fontSize: "9px", padding: "1px 5px", borderRadius: "8px", fontWeight: 800 }}>
            {activeIllumination.rarity}
          </span>
        </p>
        <h3 style={{ margin: "2px 0 4px" }}>{getIlluminationTitle(activeIllumination, lang)}</h3>
        <small style={{ display: "block", color: "#784f1d", fontSize: "10.5px" }}>
          {getIlluminationOrigin(activeIllumination, lang)} ({getIlluminationCentury(activeIllumination, lang)})
        </small>
        <div style={{ marginTop: 6, fontSize: "11px", color: "#684824" }}>
          {state.puzzle < 16
            ? (() => {
                const remLogins = 16 - state.puzzle;
                if (lang === "en") return `Remaining: ${remLogins} daily login${remLogins === 1 ? "" : "s"} in a row to complete the illumination.`;
                if (remLogins === 1) return "Zbývá 1 denní přihlášení do složení celého díla.";
                if (remLogins >= 2 && remLogins <= 4) return `Zbývají ${remLogins} denní přihlášení v řadě do složení celého díla.`;
                return `Zbývá ${remLogins} denních přihlášení v řadě do složení celého díla.`;
              })()
            : (lang === "en" ? "🎉 Illumination complete! Portrait unlocked in gallery below." : "🎉 Dílo je kompletní! Portrét byl odemčen v galerii níže.")}
        </div>
      </div>
    </section>
    {state.gallery.length ? (
      <div className="illumination-gallery">
        {state.gallery.map(id => {
          const art = illuminations.find(item => item.id === id) || DEFAULT_ILLUMINATIONS.find(item => item.id === id);
          if (!art) return null;
          const artTitle = getIlluminationTitle(art, lang);
          const artOrigin = getIlluminationOrigin(art, lang);
          const artCentury = getIlluminationCentury(art, lang);
          return (
            <article key={id}>
              <img
                src={art.source}
                alt={artTitle}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/illumination-rabbit.png";
                }}
              />
              <div>
                <span className={`rarity-tag rarity-${art.rarity.toLowerCase()}`} style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase" }}>
                  {art.rarity}
                </span>
                <strong>{artTitle}</strong>
                <small>{artOrigin} · {artCentury}</small>
                <button
                  className={state.avatarArt === id ? "selected" : ""}
                  onClick={() => onSetAvatar(id)}
                >
                  {state.avatarArt === id ? (lang === "en" ? "Active Portrait" : "Aktivní portrét") : (lang === "en" ? "Set as Portrait" : "Zvolit jako portrét")}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    ) : (
      <p className="empty-gallery">{lang === "en" ? "Complete the 16-day mosaic to unlock your first permanent illumination and portraits." : "Složte 16denní mozaiku pro odemčení první celistvé iluminace do své stálé galerie a portrétů."}</p>
    )}

    {/* Čekající nabídky směn od kolegů */}
    {pendingTrades && pendingTrades.length > 0 && (
      <div
        className="pending-trades-banner"
        style={{
          margin: "18px 0 22px",
          padding: "14px 16px",
          background: "linear-gradient(135deg, #f7efe1, #edd5aa)",
          border: "2px double #8b5a19",
          borderRadius: "10px",
          boxShadow: "0 4px 15px rgba(139,90,25,0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div>
            <strong style={{ color: "#593309", display: "flex", alignItems: "center", gap: 6, fontSize: "13px" }}>
              <ArrowLeftRight size={15} color="#8b5a19" /> {lang === "en" ? `Scribe Codex Exchange (${pendingTrades.length})` : `Písařská směna kolofonů (${pendingTrades.length})`}
            </strong>
            <small style={{ color: "#452706", display: "block", marginTop: 3 }}>
              {lang === "en" ? (
                <>Fellow scribe <strong>{pendingTrades[0].sender_name}</strong> proposes a trade: <em>{pendingTrades[0].sender_offer.length} {pendingTrades[0].sender_offer.length === 1 ? "codex" : "codices"} for {pendingTrades[0].recipient_request.length}</em></>
              ) : (
                <>Kolega <strong>{pendingTrades[0].sender_name}</strong> vám navrhuje směnu: <em>{pendingTrades[0].sender_offer.length} {pendingTrades[0].sender_offer.length === 1 ? "kolofon" : "kolofony"} za {pendingTrades[0].recipient_request.length}</em></>
              )}
              {pendingTrades[0].message && ` – „${pendingTrades[0].message}“`}
            </small>
          </div>
          <button
            type="button"
            onClick={() => onReviewTrade && onReviewTrade(pendingTrades[0])}
            style={{
              padding: "7px 16px",
              background: "linear-gradient(180deg, #8b5a19, #5e3a09)",
              color: "#fff3cf",
              border: "1px solid #3d2206",
              borderRadius: "6px",
              fontWeight: 700,
              fontSize: "11px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
          >
            <ScrollText size={13} /> {lang === "en" ? "Review Contract" : "Posoudit smlouvu"}
          </button>
        </div>
      </div>
    )}

    {/* Čekající dary od kolegů */}
    {pendingGifts && pendingGifts.length > 0 && (
      <div
        className="pending-gifts-banner"
        style={{
          margin: "18px 0 22px",
          padding: "14px 16px",
          background: "linear-gradient(135deg, #fdf6e2, #f5dfa8)",
          border: "2px double #b8860b",
          borderRadius: "10px",
          boxShadow: "0 4px 15px rgba(184,134,11,0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div>
            <strong style={{ color: "#784714", display: "flex", alignItems: "center", gap: 6, fontSize: "13px" }}>
              <Sparkles size={15} color="#b8860b" /> {lang === "en" ? `Scriptorium Blessing (${pendingGifts.length})` : `Požehnání ze skriptoria (${pendingGifts.length})`}
            </strong>
            <small style={{ color: "#543818", display: "block", marginTop: 3 }}>
              {lang === "en" ? (
                <>Fellow scribe <strong>{pendingGifts[0].sender_name}</strong> gifted you a colophon: <em>{pendingGifts[0].card_title}</em></>
              ) : (
                <>Kolega <strong>{pendingGifts[0].sender_name}</strong> vám daroval kolofon: <em>{pendingGifts[0].card_title}</em></>
              )}
              {pendingGifts[0].message && ` – „${pendingGifts[0].message}“`}
            </small>
          </div>
          <button
            type="button"
            onClick={() => onAcceptGift(pendingGifts[0])}
            style={{
              padding: "7px 16px",
              background: "linear-gradient(180deg, #9a6712, #684107)",
              color: "#fff3cf",
              border: "1px solid #4a2d04",
              borderRadius: "6px",
              fontWeight: 700,
              fontSize: "11px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
          >
            <ScrollText size={13} /> {lang === "en" ? "Accept to Collection" : "Přijmout do sbírky"}
          </button>
        </div>
      </div>
    )}

    <div className="section-title">
      <h2>{lang === "en" ? `Fellow Scribes (${colleagues.length})` : `Kolegové ve skriptoriu (${colleagues.length})`}</h2>
      <div style={{ display: "flex", gap: 8 }}>
        {onOpenTrade && (
          <button className="icon-label" onClick={() => onOpenTrade()}>
            <ArrowLeftRight size={13} /> {lang === "en" ? "Start Trade" : "Zahájit směnu"}
          </button>
        )}
        <button className="icon-label" onClick={() => onSend()}>
          <UserPlus size={13} /> {lang === "en" ? "Send Duplicate" : "Odeslat duplikát"}
        </button>
      </div>
    </div>

    {colleagues.length > 2 && (
      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          placeholder={lang === "en" ? "Search fellow scribe by name..." : "Hledat kolegu podle jména či přezdívky..."}
          value={colleagueQuery}
          onChange={(e) => setColleagueQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #d0bc93",
            background: "#fffdf9",
            fontSize: "12px",
            color: "var(--ink)",
          }}
        />
      </div>
    )}

    <div className="friends">
      {filteredColleagues.length === 0 ? (
        <div style={{ textAlign: "center", padding: "16px 10px", color: "#8c683b", fontSize: "12px", fontStyle: "italic" }}>
          {lang === "en" ? `No fellow scribe found matching "${colleagueQuery}".` : `Nenalezen žádný kolega odpovídající hledání „${colleagueQuery}“`}
        </div>
      ) : (
        filteredColleagues.map((friend) => (
          <article
            key={friend.id}
            style={{
              border: friend.role === "admin" ? "1px solid #d4af37" : undefined,
              background: friend.role === "admin" ? "linear-gradient(90deg, #fffcf0 0%, #faf3db 100%)" : undefined,
            }}
          >
            <div
              className="friend-avatar"
              style={{
                background: friend.role === "admin" ? "linear-gradient(135deg, #b8860b, #6b4e05)" : undefined,
                color: friend.role === "admin" ? "#fff9e6" : undefined,
                fontWeight: 700,
                boxShadow: friend.role === "admin" ? "0 2px 8px rgba(184,134,11,0.35)" : undefined,
              }}
            >
              {friend.display_name ? friend.display_name.substring(0, 1).toUpperCase() : "K"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <strong>{friend.display_name || friend.username || (lang === "en" ? "Fellow Scribe" : "Kolega")}</strong>
                {friend.role === "admin" ? (
                  <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: 4, background: "rgba(212,175,55,0.25)", border: "1px solid #d4af37", color: "#8a6008", fontWeight: 700 }}>
                    {lang === "en" ? "👑 Master of Scriptorium (Admin)" : "👑 Mistr skriptoria (Admin)"}
                  </span>
                ) : !friend.id?.startsWith("demo-") ? (
                  <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: 4, background: "rgba(46,125,50,0.15)", border: "1px solid #4caf50", color: "#2e7d32", fontWeight: 600 }}>
                    {lang === "en" ? "✦ Seminar Colleague" : "✦ Kolega ze semináře"}
                  </span>
                ) : (
                  <span style={{ fontSize: "10px", padding: "1px 5px", borderRadius: 4, background: "rgba(0,0,0,0.05)", border: "1px solid #ccc", color: "#777" }}>
                    {lang === "en" ? "Practice Scribe" : "Cvičný písař"}
                  </span>
                )}
              </div>
              <small>{friend.streak || 1} {lang === "en" ? "days streak" : "dní v řadě"} · {friend.xp !== undefined ? `${friend.xp} XP` : (lang === "en" ? "Scriptorium Fellow" : "Tovaryš skriptoria")}</small>
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              {onOpenTrade && (
                <button
                  type="button"
                  onClick={() => onOpenTrade(friend)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 6,
                    background: "linear-gradient(180deg, #8b5a19, #5e3a09)",
                    color: "#fff4d4",
                    border: "1px solid #3d2206",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <ArrowLeftRight size={11} /> {lang === "en" ? "Trade" : "Směna"}
                </button>
              )}
              <button onClick={() => onSend(friend)}>
                <Send size={12} /> {lang === "en" ? "Gift" : "Darovat"}
              </button>
            </div>
          </article>
        ))
      )}
    </div>

    <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 8 }}>
      {onOpenTutorial && (
        <button
          type="button"
          className="settings-button"
          style={{ width: "100%", background: "#fffdf5", borderColor: "#c9a66b", color: "#54380e", fontWeight: 600 }}
          onClick={onOpenTutorial}
          title={lang === "en" ? "Review the 5-chapter guide to the scriptorium and colophons" : "Znovu si projít 5kapitolového průvodce skriptoriem a kolofony"}
        >
          <Sparkles size={12} /> {lang === "en" ? "📜 Scriptorium Guide (Tutorial)" : "📜 Průvodce skriptoriem (Tutoriál)"}
        </button>
      )}

      {/* Vývojářské a testovací nástroje pouze pro administrátory */}
      {currentProfile?.role === "admin" && (
        <div style={{ marginTop: 12, padding: "12px 14px", background: "#1f1811", border: "1px dashed #ba8e55", borderRadius: "8px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#ffd580", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
            ⚙️ {lang === "en" ? "Master of Scriptorium Tools (Admin Only)" : "Nástroje mistra skriptoria (Pouze administrátor)"}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            <button
              type="button"
              className="settings-button"
              style={{ flex: 1, minWidth: 160 }}
              onClick={onAdvanceDay}
              title={lang === "en" ? "Simulate next day (+1 mosaic fragment)" : "Simulovat další den návštěvy (+1 fragment do mozaiky)"}
            >
              <Sparkles size={12} /> {lang === "en" ? "Simulate Next Day (+1 fragment)" : "Simulovat další den (+1 fragment)"}
            </button>
            <button
              type="button"
              className="settings-button"
              style={{ flex: 1, minWidth: 160, color: "#b91c1c" }}
              onClick={onBreakStreak}
              title={lang === "en" ? "Simulate broken streak (reset to Day 1)" : "Simulovat vynechání dne (reset streaku na Den 1 dle pravidel)"}
            >
              <RotateCcw size={12} /> {lang === "en" ? "Simulate Streak Break (reset)" : "Simulovat přerušení streaku (reset)"}
            </button>
          </div>
          <button className="settings-button" style={{ width: "100%", color: "#dc2626" }} onClick={onReset}>
            <RotateCcw size={12} /> {lang === "en" ? "Reset All Progress (Demo)" : "Resetovat celý postup pro demonstraci"}
          </button>
        </div>
      )}
    </div>
  </div>;
}

function IlluminationMosaic({
  pieces,
  compact = false,
  illumination,
}: {
  pieces: number;
  compact?: boolean;
  illumination?: IlluminationMosaicItem;
}) {
  const art = illumination || DEFAULT_ILLUMINATIONS[0];
  return (
    <div
      className={`illumination-mosaic ${compact ? "compact" : ""}`}
      aria-label={`${pieces} z 16 fragmentů iluminace odhaleno: ${art.title}`}
    >
      <img
        src={art.source}
        alt={art.title}
        loading="lazy"
        decoding="async"
        onError={(e) => {
          const target = e.currentTarget as HTMLImageElement;
          if (!target.src.includes("illumination-rabbit.png")) {
            target.src = "/illumination-rabbit.png";
          }
        }}
      />
      <div className="mosaic-cover" aria-hidden="true">
        {Array.from({ length: 16 }).map((_, i) => (
          <span key={i} className={i < pieces ? "revealed" : "hidden"}>
            {i >= pieces ? i + 1 : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

function TradeModal({
  colleague,
  cards,
  userCollection,
  initialOffer = [],
  initialRequest = [],
  initialMessage = "",
  parentTradeId,
  onClose,
  onSend,
  lang = "cs",
}: {
  colleague: any;
  cards: Colophon[];
  userCollection: Record<string | number, number>;
  initialOffer?: TradeItem[];
  initialRequest?: TradeItem[];
  initialMessage?: string;
  parentTradeId?: string;
  onClose: () => void;
  onSend: (offer: TradeItem[], request: TradeItem[], message: string, parentTradeId?: string) => Promise<void>;
  lang?: Language;
}) {
  const [activeTab, setActiveTab] = useState<"offer" | "request">("offer");
  const [search, setSearch] = useState("");
  const [rarityFilter, setRarityFilter] = useState<Rarity | "All">("All");
  const [message, setMessage] = useState(initialMessage);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map of cardId -> count
  const [offeredCounts, setOfferedCounts] = useState<Record<string | number, number>>(() => {
    const map: Record<string | number, number> = {};
    initialOffer.forEach((item) => {
      map[item.card_id] = item.count;
    });
    return map;
  });

  const [requestedCounts, setRequestedCounts] = useState<Record<string | number, number>>(() => {
    const map: Record<string | number, number> = {};
    initialRequest.forEach((item) => {
      map[item.card_id] = item.count;
    });
    return map;
  });

  // Cards owned by current user
  const ownedCards = useMemo(() => {
    return cards.filter((c) => (userCollection[c.id] || 0) > 0);
  }, [cards, userCollection]);

  // Filtered lists
  const currentList = useMemo(() => {
    const base = activeTab === "offer" ? ownedCards : cards;
    return base.filter((c) => {
      const cardT = getCardTitle(c, lang).toLowerCase();
      const matchSearch =
        !search ||
        cardT.includes(search.toLowerCase()) ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        (c.place && c.place.toLowerCase().includes(search.toLowerCase())) ||
        (c.quote && c.quote.toLowerCase().includes(search.toLowerCase())) ||
        (c.scribe && c.scribe.toLowerCase().includes(search.toLowerCase()));
      const matchRarity = rarityFilter === "All" || c.rarity === rarityFilter;
      return matchSearch && matchRarity;
    });
  }, [activeTab, ownedCards, cards, search, rarityFilter, lang]);

  const totalOfferedCount = useMemo(() => {
    return Object.values(offeredCounts).reduce((a, b) => a + b, 0);
  }, [offeredCounts]);

  const totalRequestedCount = useMemo(() => {
    return Object.values(requestedCounts).reduce((a, b) => a + b, 0);
  }, [requestedCounts]);

  const handleIncrement = (c: Colophon) => {
    if (activeTab === "offer") {
      const owned = userCollection[c.id] || 0;
      const cur = offeredCounts[c.id] || 0;
      if (cur < owned) {
        setOfferedCounts((prev) => ({ ...prev, [c.id]: cur + 1 }));
      }
    } else {
      const cur = requestedCounts[c.id] || 0;
      setRequestedCounts((prev) => ({ ...prev, [c.id]: cur + 1 }));
    }
  };

  const handleDecrement = (c: Colophon) => {
    if (activeTab === "offer") {
      const cur = offeredCounts[c.id] || 0;
      if (cur <= 1) {
        setOfferedCounts((prev) => {
          const next = { ...prev };
          delete next[c.id];
          return next;
        });
      } else {
        setOfferedCounts((prev) => ({ ...prev, [c.id]: cur - 1 }));
      }
    } else {
      const cur = requestedCounts[c.id] || 0;
      if (cur <= 1) {
        setRequestedCounts((prev) => {
          const next = { ...prev };
          delete next[c.id];
          return next;
        });
      } else {
        setRequestedCounts((prev) => ({ ...prev, [c.id]: cur - 1 }));
      }
    }
  };

  const handleSubmit = async () => {
    if (totalOfferedCount === 0 && totalRequestedCount === 0) return;
    setIsSubmitting(true);

    const offerItems: TradeItem[] = Object.entries(offeredCounts)
      .filter(([_, cnt]) => cnt > 0)
      .map(([cardId, cnt]) => {
        const c = cards.find((item) => String(item.id) === String(cardId));
        return {
          card_id: cardId,
          title: c ? getCardTitle(c, lang) : (lang === "en" ? "Unknown Codex" : "Neznámý kolofon"),
          rarity: (c?.rarity as Rarity) || "Common",
          count: cnt,
          crop_x: c?.crop_x,
          crop_y: c?.crop_y,
          crop_w: c?.crop_w,
          crop_h: c?.crop_h,
          imageUrl: c?.imageUrl,
        };
      });

    const requestItems: TradeItem[] = Object.entries(requestedCounts)
      .filter(([_, cnt]) => cnt > 0)
      .map(([cardId, cnt]) => {
        const c = cards.find((item) => String(item.id) === String(cardId));
        return {
          card_id: cardId,
          title: c ? getCardTitle(c, lang) : (lang === "en" ? "Unknown Codex" : "Neznámý kolofon"),
          rarity: (c?.rarity as Rarity) || "Common",
          count: cnt,
          crop_x: c?.crop_x,
          crop_y: c?.crop_y,
          crop_w: c?.crop_w,
          crop_h: c?.crop_h,
          imageUrl: c?.imageUrl,
        };
      });

    try {
      await onSend(offerItems, requestItems, message, parentTradeId);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={lang === "en" ? "Scribe Trade Agreement" : "Smlouva o písařské směně"}>
      <div className="modal" style={{ maxWidth: 540, borderRadius: 12, padding: "20px 24px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <button className="close" onClick={onClose} title={lang === "en" ? "Close" : "Zavřít"}>×</button>

        {/* Hlavička modálu */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <ArrowLeftRight size={20} className="text-[#8b5a19]" />
          <div>
            <h3 style={{ margin: 0, color: "var(--brown)", fontFamily: "var(--font-display)", fontSize: "19px" }}>
              {parentTradeId ? (lang === "en" ? "Counter-Offer to Trade" : "Protinabídka ke směně") : (lang === "en" ? "Scribe Trade Agreement" : "Smlouva o písařské směně")}
            </h3>
            <small style={{ color: "#784f1d", fontSize: "11px" }}>
              {parentTradeId ? (lang === "en" ? "Adjust the terms and send a counter-proposal back" : "Upravte podmínky a zašlete protinávrh zpět") : (lang === "en" ? "Propose a colophon exchange with a fellow scribe" : "Navrhněte výměnu kolofonů s kolegou ze skriptoria")}
            </small>
          </div>
        </div>

        {/* Partner ve směně */}
        <div style={{ padding: "8px 12px", background: "#f8ecd4", border: "1px solid #d8b884", borderRadius: 8, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#4a2d0b", color: "#ffd580", display: "grid", placeItems: "center", fontWeight: "bold", fontSize: 13, flexShrink: 0 }}>
              {colleague.display_name ? colleague.display_name.substring(0, 1).toUpperCase() : "K"}
            </div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#3d2206" }}>
                {lang === "en" ? "Trade Partner:" : "Partner ve směně:"} {colleague.display_name || colleague.username || (lang === "en" ? "Fellow Scribe" : "Kolega")}
              </div>
              <div style={{ fontSize: "10px", color: "#7a5323" }}>
                {colleague.streak ? `${colleague.streak} ${lang === "en" ? "days streak" : "dní v řadě"}` : (lang === "en" ? "Scriptorium Fellow" : "Tovaryš skriptoria")}
              </div>
            </div>
          </div>
          {parentTradeId && (
            <span style={{ fontSize: "10px", background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: 10, border: "1px solid #f59e0b", fontWeight: 600 }}>
              🔄 {lang === "en" ? "Counter-Offer" : "Protinabídka"}
            </span>
          )}
        </div>

        {/* Záložky nabídka vs žádost */}
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          <button
            type="button"
            onClick={() => setActiveTab("offer")}
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: 6,
              border: activeTab === "offer" ? "2px solid #8b5a19" : "1px solid #d4c09b",
              background: activeTab === "offer" ? "#fff5dc" : "#fbf7ee",
              fontWeight: 700,
              fontSize: "12px",
              color: activeTab === "offer" ? "#4a2d0b" : "#8c6020",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "all 0.15s ease",
            }}
          >
            <span>📤 {lang === "en" ? `What you offer (${totalOfferedCount} pcs)` : `Co nabízíte (${totalOfferedCount} ks)`}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("request")}
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: 6,
              border: activeTab === "request" ? "2px solid #8b5a19" : "1px solid #d4c09b",
              background: activeTab === "request" ? "#fff5dc" : "#fbf7ee",
              fontWeight: 700,
              fontSize: "12px",
              color: activeTab === "request" ? "#4a2d0b" : "#8c6020",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "all 0.15s ease",
            }}
          >
            <span>📥 {lang === "en" ? `What you request (${totalRequestedCount} pcs)` : `Co žádáte (${totalRequestedCount} ks)`}</span>
          </button>
        </div>

        {/* Vyhledávání a filtr rarit */}
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          <input
            type="text"
            placeholder={activeTab === "offer" ? (lang === "en" ? "Search your collection..." : "Hledat ve vaší sbírce...") : (lang === "en" ? "Search full codex catalog..." : "Hledat v celém katalogu...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid #c9b084",
              background: "#fffdf9",
              fontSize: "11px",
              color: "var(--ink)",
            }}
          />
          <select
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value as any)}
            style={{
              padding: "6px 8px",
              borderRadius: 6,
              border: "1px solid #c9b084",
              background: "#fffdf9",
              fontSize: "11px",
              color: "var(--brown)",
              cursor: "pointer",
            }}
          >
            <option value="All">{lang === "en" ? "All rarities" : "Všechny rarity"}</option>
            <option value="Common">Common</option>
            <option value="Uncommon">Uncommon</option>
            <option value="Rare">Rare</option>
            <option value="Epic">Epic</option>
            <option value="Legendary">Legendary</option>
            <option value="Unique">Unique</option>
          </select>
        </div>

        {/* Seznam karet */}
        <div style={{ flex: 1, minHeight: 180, maxHeight: 240, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6, paddingRight: 4, marginBottom: 12 }}>
          {currentList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 10px", color: "#8c683b", fontSize: "12px", fontStyle: "italic" }}>
              {activeTab === "offer" ? (lang === "en" ? "No matching colophons in your library to offer." : "Ve sbírce nemáte žádné odpovídající kolofony k nabídnutí.") : (lang === "en" ? "No colophons found." : "Nenalezen žádný kolofon.")}
            </div>
          ) : (
            currentList.map((c) => {
              const ownedCount = userCollection[c.id] || 0;
              const selectedCount = activeTab === "offer" ? (offeredCounts[c.id] || 0) : (requestedCounts[c.id] || 0);
              const isSelected = selectedCount > 0;
              const title = getCardTitle(c, lang);

              return (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: isSelected ? "2px solid #b8860b" : "1px solid #dfcfb2",
                    background: isSelected ? "#fff4d4" : "#fdfbf6",
                    transition: "all 0.12s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 4, overflow: "hidden", background: "#332211", flexShrink: 0 }}>
                      {c.imageUrl ? (
                        <img src={c.imageUrl} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <ScrollText size={16} color="#d4af37" style={{ margin: 8 }} />
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ fontSize: "12px", color: "#3d2206", display: "block" }} className="truncate">
                        {title}
                      </strong>
                      <div style={{ fontSize: "10px", color: "#7a5323", display: "flex", alignItems: "center", gap: 4 }}>
                        <span className="truncate">{getCardPlace(c.place, lang)}</span>
                        <span>·</span>
                        <span className={`rarity-tag rarity-${c.rarity.toLowerCase()}`} style={{ fontSize: "9px", padding: "0 4px" }}>
                          {c.rarity}
                        </span>
                        {activeTab === "offer" && (
                          <span style={{ color: "#8c6020", fontWeight: 600 }}>
                            ({lang === "en" ? `You have: ${ownedCount} pcs` : `Máte: ${ownedCount} ks`})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Počítadlo kusů */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => handleDecrement(c)}
                      disabled={selectedCount <= 0}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        border: "1px solid #c9b084",
                        background: selectedCount > 0 ? "#fff" : "#eee",
                        cursor: selectedCount > 0 ? "pointer" : "default",
                        display: "grid",
                        placeItems: "center",
                        fontWeight: "bold",
                        fontSize: 13,
                        color: "#4a2d0b",
                        opacity: selectedCount > 0 ? 1 : 0.4,
                      }}
                    >
                      -
                    </button>
                    <span style={{ minWidth: 18, textAlign: "center", fontSize: "12px", fontWeight: "bold", color: selectedCount > 0 ? "#b8860b" : "#888" }}>
                      {selectedCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleIncrement(c)}
                      disabled={activeTab === "offer" && selectedCount >= ownedCount}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        border: "1px solid #c9b084",
                        background: (activeTab !== "offer" || selectedCount < ownedCount) ? "#fff" : "#eee",
                        cursor: (activeTab !== "offer" || selectedCount < ownedCount) ? "pointer" : "default",
                        display: "grid",
                        placeItems: "center",
                        fontWeight: "bold",
                        fontSize: 13,
                        color: "#4a2d0b",
                        opacity: (activeTab !== "offer" || selectedCount < ownedCount) ? 1 : 0.4,
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Souhrnný poměr směny */}
        <div style={{
          padding: "6px 12px",
          background: "#f4ede0",
          borderRadius: 6,
          border: "1px dashed #c4ab80",
          fontSize: "11px",
          color: "#5c3d14",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}>
          <span>⚖️ {lang === "en" ? "Agreement Balance:" : "Bilance smlouvy:"}</span>
          <strong>{lang === "en" ? `${totalOfferedCount} pcs offered ⇄ ${totalRequestedCount} pcs requested` : `${totalOfferedCount} ks dáváte ⇄ ${totalRequestedCount} ks žádáte`}</strong>
        </div>

        {/* Pergamenový vzkaz */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--brown)", marginBottom: 4 }}>
            📜 {lang === "en" ? "Parchment Note / Accompanying Letter (optional):" : "Pergamenový vzkaz / průvodní listina (volitelné):"}
          </label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={lang === "en" ? "May this colophon serve thee well. In return, I would gladly receive..." : "Ať ti tento kolofon poslouží. Rád bych za něj získal..."}
            style={{
              width: "100%",
              padding: "7px 10px",
              borderRadius: 6,
              border: "1px solid #c9b084",
              background: "#fffdf7",
              fontSize: "12px",
              color: "var(--ink)",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Tlačítka */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: "7px 14px", background: "none", border: "1px solid #ba9f73", borderRadius: 6, fontSize: "12px", color: "var(--brown)", cursor: "pointer" }}
          >
            {lang === "en" ? "Cancel" : "Zrušit"}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={(totalOfferedCount === 0 && totalRequestedCount === 0) || isSubmitting}
            style={{
              padding: "7px 18px",
              background: "linear-gradient(180deg, #9a6712, #684107)",
              color: "#fff3cf",
              border: "1px solid #4a2d04",
              borderRadius: 6,
              fontWeight: 700,
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              opacity: (totalOfferedCount === 0 && totalRequestedCount === 0) || isSubmitting ? 0.5 : 1,
            }}
          >
            <ScrollText size={13} /> {isSubmitting ? (lang === "en" ? "Sealing..." : "Zpečeťuji...") : parentTradeId ? (lang === "en" ? "Send Counter-Offer" : "Odeslat protinabídku") : (lang === "en" ? "Seal & Send Proposal" : "Zpečetit a odeslat návrh")}
          </button>
        </div>
      </div>
    </div>
  );
}

function TradeReviewModal({
  trade,
  cards,
  userCollection,
  isXpAvailable = true,
  onAccept,
  onCounter,
  onDecline,
  onClose,
  lang = "cs",
}: {
  trade: CardTrade;
  cards: Colophon[];
  userCollection: Record<string | number, number>;
  isXpAvailable?: boolean;
  onAccept: (trade: CardTrade) => void;
  onCounter: (trade: CardTrade) => void;
  onDecline: (trade: CardTrade) => void;
  onClose: () => void;
  lang?: Language;
}) {
  // Check if current user actually has all the cards requested by sender
  const canAccept = useMemo(() => {
    return trade.recipient_request.every((item) => {
      const owned = userCollection[item.card_id] || 0;
      return owned >= item.count;
    });
  }, [trade.recipient_request, userCollection]);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={lang === "en" ? "Review Scribe Trade" : "Posouzení návrhu směny"}>
      <div className="modal" style={{ maxWidth: 520, borderRadius: 12, padding: "20px 24px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <button className="close" onClick={onClose} title={lang === "en" ? "Close" : "Zavřít"}>×</button>

        {/* Hlavička */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <ArrowLeftRight size={20} className="text-[#8b5a19]" />
          <div>
            <h3 style={{ margin: 0, color: "var(--brown)", fontFamily: "var(--font-display)", fontSize: "19px" }}>
              {lang === "en" ? "Review Scribe Trade" : "Posouzení písařské směny"}
            </h3>
            <small style={{ color: "#784f1d", fontSize: "11px" }}>
              {lang === "en" ? "Examine the terms of the proposed colophon exchange contract" : "Přezkoumejte podmínky nabízené smlouvy o výměně kolofonů"}
            </small>
          </div>
        </div>

        {/* Odesílatel a zpráva */}
        <div style={{ padding: "10px 14px", background: "#f8ecd4", border: "1px solid #d8b884", borderRadius: 8, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#4a2d0b", color: "#ffd580", display: "grid", placeItems: "center", fontWeight: "bold", fontSize: 13, flexShrink: 0 }}>
              {trade.sender_name.substring(0, 1).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#3d2206" }}>
                {lang === "en" ? "Proposal from:" : "Návrh od:"} {trade.sender_name}
              </div>
              <div style={{ fontSize: "10.5px", color: "#7a5323" }}>
                {trade.created_at ? new Date(trade.created_at).toLocaleDateString(lang === "en" ? "en-GB" : "cs-CZ") : (lang === "en" ? "Recently" : "Nedávno")} · {lang === "en" ? "Parchment trade contract" : "Smlouva o směně pergamenu"}
              </div>
            </div>
          </div>
          {trade.message && (
            <div style={{ marginTop: 8, padding: "8px 12px", background: "#fffaf0", borderLeft: "3px solid #b8860b", borderRadius: "0 4px 4px 0", fontSize: "11.5px", color: "#4a2e0a", fontStyle: "italic", lineHeight: 1.4 }}>
              „{trade.message}“
            </div>
          )}
        </div>

        {/* Obsah směny: Co získáte vs Co odevzdáte */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, marginBottom: 14, paddingRight: 4 }}>
          {/* 1. Nabízeno (co získáte) */}
          <div style={{ background: "#fdfbf5", border: "1px solid #c9b084", borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#166534", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <span>📥 {lang === "en" ? "Fellow scribe offers (added to your library):" : "Kolega vám nabízí (získáte do sbírky):"}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {trade.sender_offer.length === 0 ? (
                <div style={{ fontSize: "11px", color: "#8c6020", fontStyle: "italic" }}>{lang === "en" ? "No colophons (gift from your side)" : "Žádné kolofony (dar z vaší strany)"}</div>
              ) : (
                trade.sender_offer.map((item, idx) => {
                  const cardMatch = cards.find((c) => String(c.id) === String(item.card_id));
                  const title = getCardTitle(cardMatch || { id: item.card_id, title: item.title }, lang);
                  return (
                    <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "6px 8px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 4, overflow: "hidden", background: "#332211", flexShrink: 0 }}>
                          {(item.imageUrl || cardMatch?.imageUrl) ? (
                            <img src={item.imageUrl || cardMatch?.imageUrl} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <ScrollText size={14} color="#d4af37" style={{ margin: 7 }} />
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ fontSize: "11.5px", color: "#14532d", display: "block" }} className="truncate">
                            {title}
                          </strong>
                          <span className={`rarity-tag rarity-${item.rarity.toLowerCase()}`} style={{ fontSize: "9px", padding: "0 4px" }}>
                            {item.rarity}
                          </span>
                        </div>
                      </div>
                      <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#166534", whiteSpace: "nowrap" }}>
                        +{item.count} {lang === "en" ? "pcs" : "ks"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 2. Požadováno (co odevzdáte) */}
          <div style={{ background: "#fdfbf5", border: "1px solid #c9b084", borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#991b1b", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <span>📤 {lang === "en" ? "Fellow scribe requests (deducted from your library):" : "Kolega od vás žádá (odevzdáte ze sbírky):"}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {trade.recipient_request.length === 0 ? (
                <div style={{ fontSize: "11px", color: "#8c6020", fontStyle: "italic" }}>{lang === "en" ? "No colophons (pure gift for you)" : "Žádné kolofony (čistý dar pro vás)"}</div>
              ) : (
                trade.recipient_request.map((item, idx) => {
                  const cardMatch = cards.find((c) => String(c.id) === String(item.card_id));
                  const owned = userCollection[item.card_id] || 0;
                  const hasEnough = owned >= item.count;
                  const title = getCardTitle(cardMatch || { id: item.card_id, title: item.title }, lang);

                  return (
                    <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "6px 8px", background: hasEnough ? "#fff" : "#fef2f2", border: hasEnough ? "1px solid #e5e7eb" : "1px solid #fca5a5", borderRadius: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 4, overflow: "hidden", background: "#332211", flexShrink: 0 }}>
                          {(item.imageUrl || cardMatch?.imageUrl) ? (
                            <img src={item.imageUrl || cardMatch?.imageUrl} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <ScrollText size={14} color="#d4af37" style={{ margin: 7 }} />
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ fontSize: "11.5px", color: "#374151", display: "block" }} className="truncate">
                            {title}
                          </strong>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span className={`rarity-tag rarity-${item.rarity.toLowerCase()}`} style={{ fontSize: "9px", padding: "0 4px" }}>
                              {item.rarity}
                            </span>
                            <span style={{ fontSize: "10px", color: hasEnough ? "#15803d" : "#b91c1c", fontWeight: 600 }}>
                              {hasEnough ? (lang === "en" ? `(You own: ${owned} pcs ✓)` : `(Vlastníte: ${owned} ks ✓)`) : (lang === "en" ? `(You only own ${owned} pcs ✗)` : `(Vlastníte jen ${owned} ks ✗)`)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#991b1b", whiteSpace: "nowrap" }}>
                        -{item.count} {lang === "en" ? "pcs" : "ks"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Upozornění, pokud hráč nevlastní požadované karty */}
        {!canAccept && (
          <div style={{ padding: "8px 12px", background: "#fee2e2", border: "1px solid #f87171", borderRadius: 6, color: "#991b1b", fontSize: "11px", marginBottom: 12 }}>
            {lang === "en" ? (
              <>⚠️ You do not possess enough requested colophons to accept immediately. However, you can propose a <strong>counter-offer</strong> and adjust the requested items!</>
            ) : (
              <>⚠️ Pro okamžité přijetí nemáte dostatek požadovaných kolofonů. Můžete však navrhnout <strong>protinabídku</strong> a upravit požadované kusy na karty, které máte!</>
            )}
          </div>
        )}

        {!isXpAvailable && (
          <div style={{ padding: "6px 10px", background: "#fdf8ee", border: "1px solid #d4c09b", borderRadius: 6, color: "#784f1d", fontSize: "11px", marginBottom: 10 }}>
            {lang === "en" ? "ℹ️ You have already earned XP with this colleague today. Colophons will be exchanged properly upon acceptance, but no additional XP will be awarded today." : "ℹ️ S tímto kolegou jste dnes již získali zkušenostní body. Kolofony se při přijetí řádně vymění, ale další XP se dnes nepřipíšou."}
          </div>
        )}

        {/* Tlačítka akcí: Přijmout / Protinabídka / Odmítnout */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8 }}>
          <button
            type="button"
            onClick={() => onDecline(trade)}
            style={{ padding: "7px 12px", background: "none", border: "1px solid #dc2626", borderRadius: 6, fontSize: "11.5px", color: "#b91c1c", cursor: "pointer", fontWeight: 600 }}
          >
            ❌ {lang === "en" ? "Decline" : "Odmítnout"}
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => onCounter(trade)}
              style={{
                padding: "7px 14px",
                background: "#fef3c7",
                border: "1px solid #d97706",
                borderRadius: 6,
                fontSize: "11.5px",
                color: "#92400e",
                cursor: "pointer",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              🔄 {lang === "en" ? "Counter-Offer" : "Protinabídka"}
            </button>
            <button
              type="button"
              onClick={() => onAccept(trade)}
              disabled={!canAccept}
              style={{
                padding: "7px 16px",
                background: canAccept ? "linear-gradient(180deg, #15803d, #14532d)" : "#ccc",
                color: "#fff",
                border: "1px solid #14532d",
                borderRadius: 6,
                fontWeight: 700,
                fontSize: "11.5px",
                cursor: canAccept ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: 5,
                boxShadow: canAccept ? "0 2px 6px rgba(21,128,61,0.3)" : "none",
                opacity: canAccept ? 1 : 0.6,
              }}
            >
              <CheckCircle2 size={13} /> {isXpAvailable ? (lang === "en" ? "Accept Trade (+60 XP)" : "Přijmout směnu (+60 XP)") : (lang === "en" ? "Accept Trade (0 XP)" : "Přijmout směnu (0 XP)")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LevelUpModal({ level, onClose, lang = "cs" }: { level: number; onClose: () => void; lang?: Language }) {
  return <div className="modal-backdrop level-up-backdrop"><section className="level-up-modal" role="dialog" aria-modal="true" aria-label={lang === "en" ? `Level ${level} Reached` : `Dosažena úroveň ${level}`}>
    <div className="level-rays" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
    <Sparkles size={28} aria-hidden="true" />
    <p>{lang === "en" ? "Scribal Enlightenment" : "Písařské osvícení"}</p><h2>{lang === "en" ? "Level" : "Úroveň"} {level}</h2>
    <div className="level-seal"><span>{level}</span></div>
    <strong>{lang === "en" ? "Masterwork Reward Unlocked" : "Odemčena královská odměna"}</strong>
    <small>{lang === "en" ? "A Masterwork Pack with high chances for rare colophons is ready to open." : "Jeden Královský balíček s vysokou šancí na vzácné kolofony je připraven k otevření."}</small>
    <button onClick={onClose}>{lang === "en" ? "Claim Reward" : "Převzít odměnu"}</button>
  </section></div>;
}

function AuthModal({
  mode,
  setMode,
  email,
  setEmail,
  password,
  setPassword,
  displayName,
  setDisplayName,
  loading,
  error,
  successMsg,
  onLogin,
  onRegister,
  onGoogle,
  lang = "cs",
  onSetLang,
}: {
  mode: "login" | "register";
  setMode: (m: "login" | "register") => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  displayName: string;
  setDisplayName: (v: string) => void;
  loading: boolean;
  error: string;
  successMsg: string;
  onLogin: (e: React.FormEvent) => void;
  onRegister: (e: React.FormEvent) => void;
  onGoogle: () => void;
  lang?: Language;
  onSetLang?: (l: Language) => void;
}) {
  return (
    <div className="auth-overlay">
      <section className="auth-box" role="dialog" aria-modal="true">
        <div style={{ fontSize: 32, marginBottom: 6 }}>🪶</div>
        <h2>{lang === "en" ? "Enter Quilldrop" : "Vstup do Quilldrop"}</h2>
        <p>
          {lang === "en"
            ? "Sign in or create a free scribe account to access daily codices, complete challenges, and save your collection to the cloud."
            : "Přihlaste se nebo si vytvořte bezplatný písařský účet pro přístup k denním kodexům, plnění výzev a ukládání sbírky do cloudu."}
        </p>

        {/* Výběr jazyka / Language picker */}
        <div style={{ margin: "12px 0 16px", padding: "10px 12px", background: "rgba(216, 194, 157, 0.25)", borderRadius: 8, border: "1px solid #d8c29d", textAlign: "center" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#54380e", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
            {lang === "en" ? "Select Language · Zvolte jazyk" : "Zvolte jazyk · Select Language"}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button
              type="button"
              onClick={() => onSetLang?.("cs")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 6,
                border: lang === "cs" ? "2px solid #8b2500" : "1px solid #c8b99d",
                background: lang === "cs" ? "#fffdf5" : "transparent",
                fontWeight: lang === "cs" ? 700 : 500,
                color: lang === "cs" ? "#8b2500" : "#665",
                cursor: "pointer",
                boxShadow: lang === "cs" ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
                fontSize: "12px",
              }}
            >
              <span style={{ fontSize: 16 }}>🇨🇿</span> Čeština
            </button>
            <button
              type="button"
              onClick={() => onSetLang?.("en")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 6,
                border: lang === "en" ? "2px solid #8b2500" : "1px solid #c8b99d",
                background: lang === "en" ? "#fffdf5" : "transparent",
                fontWeight: lang === "en" ? 700 : 500,
                color: lang === "en" ? "#8b2500" : "#665",
                cursor: "pointer",
                boxShadow: lang === "en" ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
                fontSize: "12px",
              }}
            >
              <span style={{ fontSize: 16 }}>🇬🇧</span> English
            </button>
          </div>
          <div style={{ fontSize: "10.5px", color: "#7a6244", marginTop: 6, fontStyle: "italic" }}>
            {lang === "en"
              ? "You can change your language anytime later in profile settings."
              : "Jazyk lze kdykoliv později změnit v nastavení profilu."}
          </div>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${mode === "login" ? "active" : ""}`}
            onClick={() => setMode("login")}
          >
            {lang === "en" ? "Sign In" : "Přihlášení"}
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${mode === "register" ? "active" : ""}`}
            onClick={() => setMode("register")}
          >
            {lang === "en" ? "New Registration" : "Nová registrace"}
          </button>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: 5 }} />
            {error}
          </div>
        )}

        {successMsg && (
          <div className="auth-success">
            <CheckCircle2 size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: 5 }} />
            {successMsg}
          </div>
        )}

        <form className="auth-form" onSubmit={mode === "login" ? onLogin : onRegister}>
          {mode === "register" && (
            <div>
              <label>{lang === "en" ? "Scribe Display Name" : "Přezdívka / Jméno písaře"}</label>
              <input
                type="text"
                className="auth-input"
                placeholder={lang === "en" ? "e.g. Brother Venceslaus" : "např. Bratr Václav"}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label>{lang === "en" ? "Email Address" : "E-mailová adresa"}</label>
            <input
              type="email"
              className="auth-input"
              placeholder="pisar@skriptorium.cz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label>{lang === "en" ? "Password" : "Heslo"}</label>
            <input
              type="password"
              className="auth-input"
              placeholder={lang === "en" ? "At least 6 characters" : "Alespoň 6 znaků"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading
              ? (lang === "en" ? "Verifying seal..." : "Ověřuji pečeť...")
              : mode === "login"
              ? (lang === "en" ? "Enter Quilldrop" : "Vstoupit do Quilldrop")
              : (lang === "en" ? "Create Scribe Account" : "Vytvořit písařský účet")}
          </button>
        </form>

        <div className="auth-divider">
          <span>{lang === "en" ? "or" : "nebo"}</span>
        </div>

        <button type="button" className="google-oauth-btn" onClick={onGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          {lang === "en" ? "Continue with Google" : "Pokračovat přes Google"}
        </button>
      </section>
    </div>
  );
}

function OnboardingTutorialModal({
  isOpen,
  onClose,
  onFinish,
  lang = "cs",
}: {
  isOpen: boolean;
  onClose: () => void;
  onFinish: () => void;
  lang?: Language;
}) {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      badge: lang === "en" ? "STEP 1 OF 5 · HISTORICAL CONTEXT" : "KROK 1 ZE 5 · HISTORICKÝ KONTEXT",
      icon: "🪶",
      title: lang === "en" ? "Welcome to the Charles University Scriptorium" : "Vítejte ve Skriptoriu Karlovy univerzity",
      lead: lang === "en" ? "Step into the world of medieval manuscripts, scribal workshops, and forgotten colophons of the 14th and 15th centuries." : "Vstupujete do světa středověkých rukopisů, písařských dílen a zapomenutých podpisů 14. a 15. století.",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "13px", lineHeight: "1.6", color: "#3d2711" }}>
          <p>
            {lang === "en"
              ? "In the scriptoria of Prague University and Central European monasteries, codices were created that continue to astonish with their beauty. Every line was inscribed with a quill pen by candlelight on frosty winter mornings."
              : "V písařských dílnách pražské univerzity a středoevropských klášterů vznikaly kodexy, které dodnes udivují svou krásou. Každý řádek byl psán husím brkem při svitu svíček za mrazivých zimních rán."}
          </p>
          <div style={{ padding: "10px 14px", background: "rgba(184, 134, 11, 0.1)", borderRadius: 8, borderLeft: "4px solid #b8860b" }}>
            {lang === "en" ? (
              <>Quilldrop connects a collectible card game experience with scientific research into medieval manuscripts led by the <strong>team of Prof. Lucie Doležalová</strong>.</>
            ) : (
              <>Quilldrop propojuje herní sběratelský zážitek s vědeckým výzkumem středověkých rukopisů, který vede <strong>tým prof. Lucie Doležalové</strong>.</>
            )}
          </div>
        </div>
      ),
    },
    {
      badge: lang === "en" ? "STEP 2 OF 5 · COLLECTIBLE CARDS" : "KROK 2 ZE 5 · SBĚRATELSKÉ KARTY",
      icon: "📜",
      title: lang === "en" ? "What is a colophon and how do cards work?" : "Co je to kolofon a jak karty fungují?",
      lead: lang === "en" ? "A colophon is a personal note that a medieval scribe inscribed at the very end of a completed codex." : "Kolofon je osobní vzkaz, který písař vepsal na samý konec dokončeného rukopisu.",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "13px", lineHeight: "1.6", color: "#3d2711" }}>
          <p>
            {lang === "en"
              ? "Medieval scribes in colophons thanked God, complained of sore backs and stiff fingers, asked for a cup of wine, or warned book thieves against hellfire."
              : "Středověcí písaři v kolofonech děkovali Bohu, stěžovali si na bolavá záda a ztuhlé prsty, prosili o pohár vína, nebo varovali zloděje knih před pekelným ohněm."}
          </p>
          <div style={{ padding: "10px 14px", background: "#fcf8ee", borderRadius: 8, border: "1px solid #d8c29d", fontStyle: "italic" }}>
            „Explicit expliceat, ludere scriptor eat.“ ({lang === "en" ? "The book is finished, let the scribe go play!" : "Dopsáno jest, nechť si jde písař hrát!"})
          </div>
          <p>
            {lang === "en" ? (
              <>Each card in Quilldrop represents a <strong>real historical codex</strong> from a long-standing scientific manuscript database, with an authentic 4:3 crop of the original script and translation.</>
            ) : (
              <>Každá karta v Quilldropu představuje <strong>skutečný historický kodex</strong> z dlouholeté vědecké databáze rukopisů s přesným 4:3 výřezem originálního písma a českým i anglickým překladem.</>
            )}
          </p>
        </div>
      ),
    },
    {
      badge: lang === "en" ? "STEP 3 OF 5 · DAILY PACKS" : "KROK 3 ZE 5 · DENNÍ PŘÍDĚL KARET",
      icon: "📦",
      title: lang === "en" ? "3 Daily Packs & Scribe's Journey" : "3 denní balíčky a cesta písaře",
      lead: lang === "en" ? "Claim 15 new authentic colophons every single day for free." : "Vyzvedněte si každý kalendářní den 15 nových kolofonů zdarma.",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "13px", lineHeight: "1.6", color: "#3d2711" }}>
          <p>
            {lang === "en" ? (
              <>Every day, <strong>3 free sealed packs</strong> await you in the scriptorium. Each pack contains 5 cards in six rarity tiers:</>
            ) : (
              <>Každý den na vás ve skriptoriu čekají <strong>3 bezplatné zapečetěné balíčky</strong>. V každém balíčku naleznete 5 karet v šesti stupních vzácnosti:</>
            )}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, textAlign: "center", fontSize: "11px", fontWeight: 700 }}>
            <span style={{ padding: "4px", background: "#e8e5df", borderRadius: 4, color: "#555" }}>Common</span>
            <span style={{ padding: "4px", background: "#e2f0d9", borderRadius: 4, color: "#2e7d32" }}>Uncommon</span>
            <span style={{ padding: "4px", background: "#deebf7", borderRadius: 4, color: "#1565c0" }}>Rare</span>
            <span style={{ padding: "4px", background: "#f2e1f5", borderRadius: 4, color: "#7b1fa2" }}>Epic</span>
            <span style={{ padding: "4px", background: "#fef3d6", borderRadius: 4, color: "#e65100" }}>Legendary</span>
            <span style={{ padding: "4px", background: "linear-gradient(135deg, #ffe082, #ffb300)", borderRadius: 4, color: "#4e342e" }}>Unique ★</span>
          </div>
          <p>
            {lang === "en" ? (
              <>With each daily visit, you also reveal a tile in the 16-day illuminated mosaic <strong>Scribe's Journey</strong>!</>
            ) : (
              <>Za každou denní návštěvu navíc odhalíte dílek v 16denní iluminované mozaice <strong>Cesta písaře</strong>!</>
            )}
          </p>
        </div>
      ),
    },
    {
      badge: lang === "en" ? "STEP 4 OF 5 · PALAEOGRAPHY & CHALLENGES" : "KROK 4 ZE 5 · PALEOGRAFIE A MINIHRY",
      icon: "⚔️",
      title: lang === "en" ? "5 Daily Scribal Challenges" : "5 denních výzev pro bystrý zrak",
      lead: lang === "en" ? "Train your eye to decipher Gothic letters, script styles, and medieval abbreviations." : "Trénujte čtení gotických liter, duktů písma a dešifrování středověkých zkratek.",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "13px", lineHeight: "1.6", color: "#3d2711" }}>
          <p>
            {lang === "en" ? (
              <>In the <strong>Challenges</strong> tab, you have <strong>5 daily activities</strong> across 4 disciplines:</>
            ) : (
              <>V záložce <strong>Výzvy</strong> máte denně k dispozici <strong>5 písařských aktivit</strong> ve 4 disciplínách:</>
            )}
          </p>
          <ul style={{ margin: "0 0 0 18px", padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
            <li>
              <strong>{lang === "en" ? "Scribe's Mood:" : "Nálada písaře:"}</strong> {lang === "en" ? "Determine the emotional state and tone of the colophon's author." : "Odhadněte duševní rozpoložení a emoci autora kolofonu."}
            </li>
            <li>
              <strong>{lang === "en" ? "Decipher Cipher:" : "Rozlušti šifru:"}</strong> {lang === "en" ? "Decode Latin cryptograms, anagrams, and scribal riddles." : "Dešifrujte latinské kryptogramy a anagramy."}
            </li>
            <li>
              <strong>{lang === "en" ? "Script & Century:" : "Písmo a století:"}</strong> {lang === "en" ? "Identify the script style (bastarda, rotunda, textura) and dating of the codex." : "Určete gotický či humanistický typ písma a století vzniku kodexu."}
            </li>
            <li>
              <strong>{lang === "en" ? "Palaeographical Master:" : "Paleografický přepis:"}</strong> {lang === "en" ? "Transcribe authentic medieval lines directly from the manuscript under the magnifying lens." : "Přečtěte originální gotické písmo přímo z rukopisu s paleografickou lupou."}
            </li>
          </ul>
          <p>
            {lang === "en" ? (
              <>Successful answers award <strong>XP</strong> to advance your scribe rank and earn bonus <strong>Masterwork Packs</strong>.</>
            ) : (
              <>Za úspěšné odpovědi získáváte <strong>XP</strong> pro postup na vyšší písařské hodnosti a bonusové <strong>Královské balíčky</strong>.</>
            )}
          </p>
        </div>
      ),
    },
    {
      badge: lang === "en" ? "STEP 5 OF 5 · COLLEAGUES & TRADING" : "KROK 5 ZE 5 · SPOLUŽÁCI A OBCHODOVÁNÍ",
      icon: "⚖️",
      title: lang === "en" ? "Scribe's Trade & Exchange Agreements" : "Písařská směna a smlouvy se spolužáky",
      lead: lang === "en" ? "Exchange duplicates, propose counter-offers, and gift cards to friends." : "Vyměňujte duplikáty, posílejte protinabídky a darujte karty přátelům.",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "13px", lineHeight: "1.6", color: "#3d2711" }}>
          <p>
            {lang === "en" ? (
              <>In the <strong>Profile</strong> tab, you will find a list of fellow scribes and researchers with whom you can establish contact.</>
            ) : (
              <>V záložce <strong>Profil</strong> naleznete seznam dalších písařů a badatelů, se kterými můžete navázat kontakt.</>
            )}
          </p>
          <p>
            {lang === "en" ? (
              <>You can initiate a <strong>Scribe's Trade</strong> – offer surplus duplicates and pick codices you are missing. The recipient can seal the contract or propose a counter-offer.</>
            ) : (
              <>Můžete zahájit <strong>Písařskou směnu</strong> – navrhnout své přebytečné duplikáty a vybrat kolofony, které vám chybí. Příjemce může smlouvu zpečetit, nebo poslat protinabídku.</>
            )}
          </p>
          <div style={{ padding: "12px 14px", background: "linear-gradient(135deg, #fff3cd 0%, #fae69e 100%)", borderRadius: 8, border: "1px solid #d4af37", marginTop: 4, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>🎁</span>
            <div>
              <strong style={{ color: "#54380e", display: "block" }}>
                {lang === "en" ? "Initiate Welcome Gift:" : "Uvítací dar nového tovaryše:"}
              </strong>
              <span style={{ color: "#6b4916", fontSize: "12px" }}>
                {lang === "en" ? (
                  <>You receive <strong>+50 XP</strong> to start! Your 3 sealed packs are already waiting in the scriptorium.</>
                ) : (
                  <>Získáváte <strong>+50 XP</strong> do začátku! Vaše 3 zapečetěné balíčky již čekají.</>
                )}
              </span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const current = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      playParchmentFlip(0.2);
      setStep((s) => s + 1);
    } else {
      onFinish();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      playParchmentFlip(0.2);
      setStep((s) => s - 1);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 10000 }}>
      <section
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={lang === "en" ? "Introduction to scriptorium" : "Úvodní zasvěcení do skriptoria"}
        style={{
          maxWidth: 540,
          width: "94vw",
          maxHeight: "92vh",
          overflowY: "auto",
          padding: "22px 18px 18px",
          background: "linear-gradient(175deg, #fcf8ee 0%, #f4ebd8 100%)",
          border: "2px solid #b89758",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6), inset 0 0 40px rgba(184,151,88,0.15)",
          borderRadius: 14,
        }}
      >
        <button className="close" onClick={onClose} title={lang === "en" ? "Close guide" : "Zavřít průvodce"}>×</button>

        {/* Hlavička s ikonou a odznakem kroku */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #d4af37, #8b6508)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            boxShadow: "0 4px 12px rgba(139, 101, 8, 0.35)",
            flexShrink: 0,
          }}>
            {current.icon}
          </div>
          <div>
            <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "1.2px", color: "#8a6008", fontWeight: 800 }}>
              {current.badge}
            </span>
            <h2 style={{ margin: "2px 0 0", fontSize: "19px", color: "#2d1a08", fontFamily: "Cinzel, Georgia, serif" }}>
              {current.title}
            </h2>
          </div>
        </div>

        {/* Podtitul / Lead */}
        <p style={{ margin: "0 0 14px", fontSize: "13px", color: "#7a5423", fontStyle: "italic", borderBottom: "1px dashed #d0be98", paddingBottom: 10 }}>
          {current.lead}
        </p>

        {/* Tělo kroku */}
        <div style={{ minHeight: 180 }}>
          {current.body}
        </div>

        {/* Spodní lišta s tečkami a tlačítky */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, paddingTop: 14, borderTop: "1px solid #dfcfb2" }}>
          {/* Tečky indikující krok */}
          <div style={{ display: "flex", gap: 6 }}>
            {steps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => { playParchmentFlip(0.15); setStep(idx); }}
                style={{
                  width: idx === step ? 22 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: idx === step ? "#8b5a19" : "#d8c7a6",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  padding: 0,
                }}
                aria-label={lang === "en" ? `Go to step ${idx + 1}` : `Přejít na krok ${idx + 1}`}
              />
            ))}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {step > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                style={{
                  padding: "8px 14px",
                  borderRadius: 7,
                  border: "1px solid #c9b084",
                  background: "#fdfbf5",
                  color: "#5c3d14",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {lang === "en" ? "Previous" : "Předchozí"}
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              style={{
                padding: "8px 18px",
                borderRadius: 7,
                border: "1px solid #4a2807",
                background: step === steps.length - 1
                  ? "linear-gradient(180deg, #b8860b 0%, #7a5205 100%)"
                  : "linear-gradient(180deg, #8b5a19 0%, #5e3a09 100%)",
                color: "#fff7e6",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 3px 8px rgba(0,0,0,0.25)",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {step === steps.length - 1 ? (
                <>{lang === "en" ? "Begin Scribe's Journey (+50 XP) ➔" : "Zahájit písařskou pouť (+50 XP) ➔"}</>
              ) : (
                <>{lang === "en" ? "Next step ➔" : "Další krok ➔"}</>
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function DailyPieceModal({
  isOpen,
  streak,
  puzzle,
  activeIllumination,
  onClose,
  lang = "cs",
}: {
  isOpen: boolean;
  streak: number;
  puzzle: number;
  activeIllumination: IlluminationMosaicItem;
  onClose: () => void;
  lang?: Language;
}) {
  if (!isOpen) return null;

  const isCompleted = puzzle === 16;
  const daysLeft = 16 - puzzle;
  const title = getIlluminationTitle(activeIllumination, lang);
  const origin = getIlluminationOrigin(activeIllumination, lang);
  const century = getIlluminationCentury(activeIllumination, lang);
  const desc = getIlluminationDescription(activeIllumination, lang);
  const tierName = getIlluminationTierName(activeIllumination, lang);

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <section
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={lang === "en" ? "Daily Scriptorium Visit" : "Denní návštěva skriptoria"}
        style={{
          maxWidth: 520,
          width: "94vw",
          maxHeight: "92vh",
          overflowY: "auto",
          padding: "20px 16px 18px",
          background: "linear-gradient(175deg, #fcf8ee 0%, #f4ebd8 100%)",
          border: "2px solid #b89758",
          boxShadow: "0 20px 60px rgba(0,0,0,0.65), inset 0 0 40px rgba(184,151,88,0.18)",
          borderRadius: 14,
          textAlign: "center",
        }}
      >
        <button className="close" onClick={onClose} title={lang === "en" ? "Close" : "Zavřít"}>×</button>

        {/* Horní záhlaví */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", background: "rgba(184, 151, 88, 0.15)", borderRadius: 20, border: "1px solid rgba(184, 151, 88, 0.35)", marginBottom: 12 }}>
          <Sparkles size={13} style={{ color: "#8a6008" }} />
          <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#704808" }}>
            {lang === "en" ? "Daily Visit · Scribe's Journey" : "Denní návštěva · Cesta písaře"}
          </span>
        </div>

        <h2 style={{ margin: "0 0 6px", fontSize: "20px", color: "#2d1a08", fontFamily: "Cinzel, Georgia, serif" }}>
          {isCompleted
            ? (lang === "en" ? "🎉 Masterwork Illumination Completed!" : "🎉 Mistrovská iluminace dokončena!")
            : (lang === "en" ? "✨ New Illumination Fragment Revealed!" : "✨ Nový fragment iluminace odhalen!")}
        </h2>

        <p style={{ margin: "0 auto 16px", maxWidth: 440, fontSize: "13px", color: "#6e4b1f", fontStyle: "italic", lineHeight: 1.45 }}>
          {isCompleted
            ? (lang === "en"
                ? "You have assembled all 16 fragments! This precious artwork has been preserved into your Gallery."
                : "Složili jste všech 16 fragmentů! Toto vzácné dílo bylo trvale uloženo do vaší síně slávy (galerie).")
            : (lang === "en"
                ? `Day ${streak} in a row: Piece ${puzzle} of 16 has been unveiled in your daily mosaic.`
                : `Den ${streak} v řadě: ${puzzle}. dílek z 16 byl právě odhalen ve vaší denní mozaice.`)}
        </p>

        {/* Mozaika */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <div style={{ width: "min(150px, 46vw)", height: "min(150px, 46vw)", boxShadow: "0 8px 24px rgba(0,0,0,0.35)", borderRadius: 10, overflow: "hidden", border: "2px solid #b89758" }}>
            <IlluminationMosaic pieces={puzzle} illumination={activeIllumination} />
          </div>
        </div>

        {/* Informační odznaky */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", background: "#fff7e6", border: "1px solid #d4b26f", borderRadius: 6, fontSize: "11px", fontWeight: 700, color: "#8a5208" }}>
            <Flame size={12} style={{ color: "#d9531e" }} /> {lang === "en" ? `Day ${streak} in a row` : `Den ${streak} v řadě`}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", background: "#f0f8ff", border: "1px solid #a8cce8", borderRadius: 6, fontSize: "11px", fontWeight: 700, color: "#1a5276" }}>
            <Puzzle size={12} style={{ color: "#2980b9" }} /> {lang === "en" ? `Piece ${puzzle} of 16` : `Dílek ${puzzle} / 16`}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", background: "#fbf6e9", border: "1px solid #d0be98", borderRadius: 6, fontSize: "11px", fontWeight: 700, color: "#5c3d14" }}>
            <Award size={12} style={{ color: "#b8860b" }} /> {lang === "en" ? `Cycle ${activeIllumination.cycle} · ${tierName}` : `Cyklus ${activeIllumination.cycle} · ${tierName}`}
          </span>
        </div>

        {/* Karta s historickým kontextem */}
        <div style={{ padding: "12px 14px", background: "rgba(255, 255, 255, 0.65)", borderRadius: 8, border: "1px solid #d8c7a6", textAlign: "left", marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: "13px", color: "#2d1a08", marginBottom: 2 }}>
            {title}
          </div>
          <div style={{ fontSize: "11px", color: "#8a6008", fontWeight: 600, marginBottom: 6 }}>
            🏛️ {origin} · {century}
          </div>
          <div style={{ fontSize: "12px", color: "#4d3419", lineHeight: 1.45 }}>
            {desc}
          </div>
        </div>

        {/* Odměna / zbývající dny */}
        <div style={{ padding: "10px 12px", background: isCompleted ? "linear-gradient(135deg, #fef3d6 0%, #fae69e 100%)" : "#fbf8f0", borderRadius: 8, border: isCompleted ? "1px solid #d4af37" : "1px dashed #d8c7a6", marginBottom: 16, fontSize: "12px", color: "#4d3419" }}>
          {isCompleted ? (
            <div style={{ fontWeight: 700, color: "#7a4e05" }}>
              🏆 {lang === "en"
                ? `Earned reward: +${activeIllumination.rewardXp} XP and ${qualityLabel(activeIllumination.rewardPack, lang)}!`
                : `Získaná odměna: +${activeIllumination.rewardXp} XP a ${qualityLabel(activeIllumination.rewardPack, lang)}!`}
            </div>
          ) : (
            <div>
              ⏳ {lang === "en"
                ? `Only ${daysLeft} day${daysLeft === 1 ? "" : "s"} left to complete the cycle and earn +${activeIllumination.rewardXp} XP & ${qualityLabel(activeIllumination.rewardPack, lang)}.`
                : `Zbývá ještě ${daysLeft} ${daysLeft === 1 ? "den" : daysLeft < 5 ? "dny" : "dní"} do dokončení cyklu a zisku +${activeIllumination.rewardXp} XP a ${qualityLabel(activeIllumination.rewardPack, lang)}.`}
            </div>
          )}
          <div style={{ marginTop: 4, fontSize: "11px", color: "#8b6508", fontStyle: "italic" }}>
            🕯️ {lang === "en"
              ? "Your 3 daily packs and 5 scribal challenges are ready in the scriptorium!"
              : "Vaše 3 denní balíčky a 5 písařských výzev jsou připraveny ve skriptoriu!"}
          </div>
        </div>

        {/* Tlačítko pro vstup */}
        <button
          type="button"
          onClick={onClose}
          style={{
            width: "100%",
            padding: "10px 20px",
            background: "linear-gradient(180deg, #9a6712, #684107)",
            color: "#fff3cf",
            border: "1px solid #4a2d04",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: "14px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(104, 65, 7, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <span>{lang === "en" ? "Enter Scriptorium →" : "Vstoupit do skriptoria →"}</span>
        </button>
      </section>
    </div>
  );
}

function CardDetail({ card, count, onClose, lang = "cs" }: { card: Colophon; count: number; onClose: () => void; lang?: Language }) {
  const title = getCardTitle(card, lang);
  const translation = getCardTranslation(card, lang);
  const rarityReason = getCardRarityReason(card, lang);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className={`modal card-detail rarity-${card.rarity.toLowerCase()}`} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
        <button className="close" onClick={onClose}>×</button>
        <div className="card-detail-left">
          <span className="rarity-label">{card.rarity}</span>
          <div className="large-illustration">
            <ColophonImage card={card} alt={`Snímek rukopisu ${title}`} />
          </div>
          <a className="source-link" href={card.sourceUrl} target="_blank" rel="noreferrer">
            {lang === "en" ? "Open digital manuscript scan ↗" : "Otevřít digitální sken rukopisu ↗"}
          </a>
        </div>
        <div className="card-detail-right">
          <h2>{title}</h2>
          <p className="latin">“{card.quote}”</p>
          {translation && translation !== "Translation pending" && (
            <p style={{ fontStyle: "normal", background: "#ecd4a7", padding: "8px 10px", borderLeft: "3px solid var(--brown)", borderRadius: "0 4px 4px 0", fontSize: "12px", margin: "8px 0" }}>
              {translation}
            </p>
          )}
          <dl>
            <div><dt>{lang === "en" ? "Scribe" : "Písař"}</dt><dd>{getCardScribe(card.scribe, lang)}</dd></div>
            <div><dt>{lang === "en" ? "Place & Year" : "Místo & rok"}</dt><dd>{getCardPlace(card.place, lang)}, {card.year}</dd></div>
            <div><dt>{lang === "en" ? "Manuscript / Shelfmark" : "Rukopis / signatura"}</dt><dd>{card.manuscript}</dd></div>
            <div><dt>{lang === "en" ? "Folio" : "Folium"}</dt><dd>{card.locus}</dd></div>
            {rarityReason && <div><dt>{lang === "en" ? "Rarity Note" : "Důvod rarity"}</dt><dd>{rarityReason}</dd></div>}
            <div><dt>{lang === "en" ? "Copies Owned" : "Vlastněných kopií"}</dt><dd><b>×{count}</b></dd></div>
          </dl>
        </div>
      </section>
    </div>
  );
}

function PackReveal({ card, position, total, quality, shown, onReveal, onNext, lang = "cs" }: { card: Colophon; position: number; total: number; quality: PackQuality; shown: boolean; onReveal: () => void; onNext: () => void; lang?: Language }) {
  const glitterCount = card.rarity === "Unique" ? 64 : card.rarity === "Legendary" ? 48 : card.rarity === "Epic" ? 36 : card.rarity === "Rare" ? 22 : 14;
  const [tension, setTension] = useState(false);
  const isMonumental = card.rarity === "Legendary" || card.rarity === "Unique";
  const title = getCardTitle(card, lang);

  const beginReveal = () => {
    if (tension) return;
    playParchmentFlip(0.28);
    if (!isMonumental) {
      onReveal();
      playTriumphFanfare(card.rarity);
      return;
    }
    setTension(true);
    window.setTimeout(() => {
      onReveal();
      playTriumphFanfare(card.rarity);
    }, card.rarity === "Unique" ? 1500 : 1050);
  };
  return <div className={`modal-backdrop reveal-bg aura-${card.rarity.toLowerCase()} ${shown ? "is-revealed" : "is-sealed"} ${tension ? "is-tension" : ""}`}>
    <div className="particle-field" aria-hidden="true">{Array.from({ length: 18 }).map((_, i) => <i key={i} style={{ "--i": i } as React.CSSProperties}>✦</i>)}</div>
    {!shown ? <>
      <div className="reveal-kicker"><span>{lang === "en" ? "Pack:" : "Balíček:"} {quality}</span><b>{lang === "en" ? `Card ${position} of ${total}` : `Karta ${position} z ${total}`}</b></div>
      <button className="card-back" onClick={beginReveal} disabled={tension} aria-label={lang === "en" ? `Reveal card ${position} of ${total}` : `Odhalit kartu ${position} z ${total}`}>
        <div className="card-back-frame"><span>Q</span><small>{tension ? (lang === "en" ? "The wax resists…" : "Pečeť klade odpor…") : (lang === "en" ? "Tap to reveal" : "Klepnutím odhalit")}</small></div>
      </button>
      <p className="reveal-whisper">{tension ? (lang === "en" ? "Something ancient stirs beneath the parchment…" : "Něco prastarého se probouzí pod pergamenem…") : (lang === "en" ? "Ink moves beneath the wax…" : "Inkoust se hýbe pod voskem…")}</p>
    </> : <>
      <div className="reveal-flash" aria-hidden="true" />
      <div className="light-shafts" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <div className="glitter-storm" aria-hidden="true">{Array.from({ length: glitterCount }).map((_, i) => <i key={i} style={{ "--x": `${(i * 37) % 100}%`, "--y": `${(i * 53) % 100}%`, "--dx": `${((i * 29) % 180) - 90}px`, "--dy": `${-50 - ((i * 17) % 190)}px`, "--delay": `${(i % 11) * .045}s`, "--size": `${5 + (i % 5) * 2}px` } as React.CSSProperties}>{i % 4 === 0 ? "◆" : i % 3 === 0 ? "✧" : "✦"}</i>)}</div>
      <div className="rarity-burst" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></div>
      <div className="reveal-kicker"><span>{card.rarity}</span><b>{position} / {total}</b></div>
      <section className={`reveal-card rarity-${card.rarity.toLowerCase()}`}>
        <div className="card-crown">✦ {card.rarity} ✦</div>
        <div className="large-illustration"><ColophonImage card={card} /><b>{card.year}</b></div>
        <h2>{title}</h2><p>“{card.quote}”</p><small>{getCardScribe(card.scribe, lang)} · {getCardPlace(card.place, lang)}</small>
      </section>
      <div className="reveal-actions"><span>{position === total ? (lang === "en" ? "Final card of the pack" : "Poslední karta balíčku") : (() => {
        const rem = total - position;
        if (lang === "en") return rem === 1 ? "1 card remaining" : `${rem} cards remaining`;
        if (rem === 1) return "Ještě zbývá 1 karta";
        if (rem >= 2 && rem <= 4) return `Ještě zbývají ${rem} karty`;
        return `Ještě zbývá ${rem} karet`;
      })()}</span><button onClick={() => { playParchmentFlip(0.28); onNext(); }}>{position === total ? (lang === "en" ? "Save to collection" : "Uložit do sbírky") : (lang === "en" ? "Draw next card" : "Táhnout další kartu")} →</button></div>
    </>}
  </div>;
}

function normalizeLatin(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/v/g, "u")
    .replace(/j/g, "i")
    .replace(/\s+/g, " ")
    .trim();
}

function calculateSimilarity(a: string, b: string): number {
  const s1 = normalizeLatin(a);
  const s2 = normalizeLatin(b);
  if (s1 === s2) return 1;
  if (!s1 || !s2) return 0;

  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  const dist = dp[m][n];
  const maxLen = Math.max(m, n);
  return Math.max(0, 1 - dist / maxLen);
}

function GameModal({
  kind,
  question,
  cards,
  answer,
  step,
  setStep,
  onClose,
  onAnswer,
  lang = "cs",
  onLoupeMax,
}: {
  kind: GameKind;
  question: QuestionData;
  cards: Colophon[];
  answer: string | null;
  step: number;
  setStep: (n: number) => void;
  onClose: () => void;
  onAnswer: (correct: boolean) => void;
  lang?: Language;
  onLoupeMax?: () => void;
}) {
  const challengeCard =
    (question.card_id
      ? cards.find((c) => c.uuid === question.card_id || String(c.id) === String(question.card_id))
      : null) ||
    cards.find((c) => c.quote && question.quote && c.quote.toLowerCase().includes(question.quote.slice(0, 15).toLowerCase())) ||
    cards[0] ||
    COLOPHONS[0];

  const isTranscription = question.mode === "transcription" || Boolean(question.target_transcription);

  const [userText, setUserText] = useState("");
  const [transcriptionAttempts, setTranscriptionAttempts] = useState<number>(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [transcriptionFeedback, setTranscriptionFeedback] = useState<{
    similarity: number;
    message: string;
    pass: boolean;
  } | null>(null);

  const qTitle = getQuestionTitle(question, lang);
  const qIntro = getQuestionIntro(question, lang);
  const qTranslation = getQuestionTranslation(question, lang);
  const qOptions = getQuestionOptions(question, lang);
  const qExplanation = getQuestionExplanation(question, lang);
  const qHint = getQuestionHint(question, lang);

  const reward = isTranscription
    ? (lang === "en"
        ? "Masterwork Pack · Guarantees Rare+ with chance of Legendary (+120 XP)"
        : "Královský balíček · Garantuje Rare+ s šancí na Legendary (+120 XP)")
    : question.mode === "script" || kind === "paleo"
    ? (lang === "en"
        ? "Scholar Pack · Rarer codices and illuminations (+75 XP)"
        : "Učencův balíček · Vzácnější kodexy a iluminace (+75 XP)")
    : kind === "cipher"
    ? (lang === "en"
        ? "Scholar Pack · Rarer codices and illuminations (+60 XP)"
        : "Učencův balíček · Vzácnější kodexy a iluminace (+60 XP)")
    : (lang === "en"
        ? "Standard Pack (+35 XP)"
        : "Běžný balíček (+35 XP)");

  const handleCheckTranscription = () => {
    if (!userText.trim() || Boolean(answer)) return;
    const target = question.target_transcription || question.quote;
    const targets = [target, ...(question.accepted_variants || [])];

    let bestSim = 0;
    for (const t of targets) {
      const sim = calculateSimilarity(userText, t);
      if (sim > bestSim) bestSim = sim;
    }

    const nextAttempts = transcriptionAttempts + 1;
    setTranscriptionAttempts(nextAttempts);

    const pass = bestSim >= 0.90;
    const simPercent = Math.round(bestSim * 100);

    if (pass) {
      setTranscriptionFeedback({
        similarity: simPercent,
        message:
          bestSim >= 0.98
            ? (lang === "en"
                ? "Flawless palaeographical transcription without a single error!"
                : "Dokonalý paleografický přepis bez jediné chyby!")
            : (lang === "en"
                ? `Well done! Text achieved ${simPercent}% accuracy and was accepted.`
                : `Výborně! Text dosáhl ${simPercent}% přesnosti a byl úspěšně uznán.`),
        pass: true,
      });
      onAnswer(true);
    } else {
      const attemptsRemaining = Math.max(0, 5 - nextAttempts);
      if (attemptsRemaining > 0) {
        setTranscriptionFeedback({
          similarity: simPercent,
          message:
            bestSim >= 0.75
              ? (lang === "en"
                  ? `Very close (${simPercent}%)! ${attemptsRemaining} attempt${attemptsRemaining === 1 ? "" : "s"} remaining. Check word endings, abbreviations, and ligatures.`
                  : `Velmi blízko (${simPercent} %)! Zbývá ještě ${attemptsRemaining} ${attemptsRemaining === 1 ? "pokus" : attemptsRemaining >= 2 && attemptsRemaining <= 4 ? "pokusy" : "pokusů"}. Zkontrolujte koncovky slov, zkratky a ligatury.`)
              : (lang === "en"
                  ? `${simPercent}% match (target 90%). ${attemptsRemaining} attempt${attemptsRemaining === 1 ? "" : "s"} remaining. Inspect illuminated lines above and adjust your transcription.`
                  : `Zatím ${simPercent} % shoda (cíl 90 %). Zbývá ještě ${attemptsRemaining} ${attemptsRemaining === 1 ? "pokus" : attemptsRemaining >= 2 && attemptsRemaining <= 4 ? "pokusy" : "pokusů"}. Prozkoumejte detaily osvětlených řádků výše a zkuste to znovu.`),
          pass: false,
        });
      } else {
        setTranscriptionFeedback({
          similarity: simPercent,
          message:
            lang === "en"
              ? `All 5 attempts exhausted (${simPercent}% best match). Challenge failed.`
              : `Všech 5 pokusů bylo vyčerpáno (nejlepší shoda ${simPercent} %). Výzva nebyla splněna.`,
          pass: false,
        });
        onAnswer(false);
      }
    }
  };

  // Paleografická lupa a interaktivní zvětšení / posun
  const highlightRegions = question.highlight_regions || [];
  const primaryRegion = highlightRegions[0];
  const targetCenterX = primaryRegion ? primaryRegion.x + (primaryRegion.w ?? (primaryRegion as any).width ?? 20) / 2 : 50;
  const targetCenterY = primaryRegion ? primaryRegion.y + (primaryRegion.h ?? (primaryRegion as any).height ?? 5) / 2 : 75;

  const [isLoupeActive, setIsLoupeActive] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(2.2);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number; initPanX: number; initPanY: number }>({ x: 0, y: 0, initPanX: 0, initPanY: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const isLoupeActiveRef = useRef(isLoupeActive);

  // Zablokování scrollování podkladové stránky (mainpage) během otevřené minihry
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    isLoupeActiveRef.current = isLoupeActive;
  }, [isLoupeActive]);

  // Nativní non-passive wheel listener zaručuje, že e.preventDefault() zablokuje posun stránky
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY < 0 ? 0.25 : -0.25;
      setIsLoupeActive(true);
      setZoomLevel((z) => {
        const next = Math.max(1.0, Math.min(10.0, Math.round((z + delta) * 10) / 10));
        if (next <= 1.0) {
          setIsLoupeActive(false);
          setPanOffset({ x: 0, y: 0 });
        }
        if (next >= 9.9) {
          onLoupeMax?.();
        }
        return next;
      });
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, []);

  useEffect(() => {
    setIsLoupeActive(true);
    setZoomLevel(2.2);
    setPanOffset({ x: 0, y: 0 });
    setUserText("");
    setTranscriptionFeedback(null);
    setTranscriptionAttempts(0);
    setSelectedOptionIndex(null);
  }, [question.id, question.title]);

  const handleCloseClick = () => {
    if (!answer) {
      const leaveConfirm =
        lang === "en"
          ? "Are you sure you want to abandon this challenge? Abandoning counts as a failed attempt and will consume 1 of your 5 daily challenges."
          : "Opravdu chcete tuto výzvu opustit? Opuštění rozehrané výzvy se započítává jako neúspěch a odečte 1 z vašich 5 denních her.";
      if (confirm(leaveConfirm)) {
        onAnswer(false);
        onClose();
      }
      return;
    }
    onClose();
  };

  const imgSrc = challengeCard.remoteImageUrl || challengeCard.imageUrl;

  return (
    <div className="modal-backdrop" onClick={handleCloseClick}>
      <section
        className={`modal game-modal game-${kind}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={qTitle}
      >
        <button className="close" onClick={handleCloseClick} aria-label={lang === "en" ? "Close challenge" : "Zavřít výzvu"}>
          ×
        </button>
        <p className="eyebrow">{lang === "en" ? "Bonus Pack Challenge" : "Výzva o bonusový balíček"}</p>
        <h2>{qTitle}</h2>
        <div className="reward-banner">
          <span>{lang === "en" ? "Reward" : "Odměna"}</span>
          <strong>{reward}</strong>
        </div>
        <div className="game-rule">{qIntro}</div>

        {isTranscription ? (
          <div className="transcription-mode">
            <div className="spotlight-container">
              {/* Horní lišta lupy s ovládáním měřítka */}
              <div className="spotlight-toolbar flex items-center justify-between px-3 py-1.5 bg-[#1a1410] border-b border-[#3d2e1f] text-[11px]">
                <div className="flex items-center gap-1.5 font-bold text-[#ffd580]">
                  <span className="text-sm leading-none">🔍</span>
                  <span>{lang === "en" ? "Palaeographical Loupe" : "Paleografická lupa"}</span>
                  <span className="text-[10px] text-[#9c8266] font-normal hidden sm:inline">
                    {isLoupeActive
                      ? (lang === "en" ? "· Focused on illuminated lines" : "· Zaostřeno na vyznačené řádky")
                      : (lang === "en" ? "· Full folio overview" : "· Přehled celého folia")}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (isLoupeActive) {
                        setIsLoupeActive(false);
                        setPanOffset({ x: 0, y: 0 });
                      } else {
                        setIsLoupeActive(true);
                        setZoomLevel(2.2);
                        setPanOffset({ x: 0, y: 0 });
                      }
                    }}
                    className={`px-2.5 py-1 rounded border text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 shadow-xs ${
                      isLoupeActive
                        ? "bg-[#3d2e18] text-[#ffd580] border-[#d4af37]"
                        : "bg-[#241c15] text-[#b8a28d] border-[#423323] hover:text-[#ffd580]"
                    }`}
                    title={isLoupeActive ? (lang === "en" ? "Switch to full folio view" : "Zobrazit celé folio") : (lang === "en" ? "Zoom into illuminated lines" : "Přiblížit vyznačené řádky lupou")}
                  >
                    {isLoupeActive ? "📜 " + (lang === "en" ? "Full Folio" : "Celé folio") : "🔍 " + (lang === "en" ? "Loupe (Zoom)" : "Lupa (Zvětšit)")}
                  </button>

                  {isLoupeActive && (
                    <div className="flex items-center gap-1 bg-[#14100c] px-1 py-0.5 rounded border border-[#382b1d]">
                      <button
                        type="button"
                        onClick={() => setZoomLevel((z) => Math.max(1.2, Math.round((z - 0.3) * 10) / 10))}
                        className="w-5 h-5 rounded hover:bg-[#2e2318] text-[#ffd580] flex items-center justify-center font-bold text-xs cursor-pointer"
                        title={lang === "en" ? "Zoom out" : "Oddálit (−)"}
                      >
                        −
                      </button>
                      <span className="text-[10px] text-[#c9a96e] font-mono w-9 text-center">
                        {Math.round(zoomLevel * 100)}%
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setZoomLevel((z) => {
                            const next = Math.min(10.0, Math.round((z + 0.3) * 10) / 10);
                            if (next >= 9.9) {
                              onLoupeMax?.();
                            }
                            return next;
                          })
                        }
                        className="w-5 h-5 rounded hover:bg-[#2e2318] text-[#ffd580] flex items-center justify-center font-bold text-xs cursor-pointer"
                        title={lang === "en" ? "Zoom in" : "Přiblížit (+)"}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setZoomLevel(2.2);
                          setPanOffset({ x: 0, y: 0 });
                        }}
                        className="p-1 hover:bg-[#2e2318] rounded text-[#a89078] hover:text-[#ffd580] text-[10px] cursor-pointer"
                        title={lang === "en" ? "Reset focus to target lines" : "Vycentrovat na řádky"}
                      >
                        <RotateCcw size={11} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Interaktivní plátno rukopisu */}
              <div
                ref={viewportRef}
                className="spotlight-viewport"
                onPointerDown={(e) => {
                  if (!isLoupeActive || zoomLevel <= 1) return;
                  setIsPanning(true);
                  panStartRef.current = {
                    x: e.clientX,
                    y: e.clientY,
                    initPanX: panOffset.x,
                    initPanY: panOffset.y,
                  };
                  (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
                }}
                onPointerMove={(e) => {
                  if (!isPanning) return;
                  const dx = e.clientX - panStartRef.current.x;
                  const dy = e.clientY - panStartRef.current.y;
                  setPanOffset({
                    x: panStartRef.current.initPanX + dx,
                    y: panStartRef.current.initPanY + dy,
                  });
                }}
                onPointerUp={(e) => {
                  if (isPanning) {
                    setIsPanning(false);
                    try { (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId); } catch {}
                  }
                }}
                onPointerCancel={() => setIsPanning(false)}
              >
                <div
                  className="spotlight-stage"
                  style={{
                    transform: `scale(${isLoupeActive ? zoomLevel : 1}) translate(${panOffset.x / (isLoupeActive ? zoomLevel : 1)}px, ${panOffset.y / (isLoupeActive ? zoomLevel : 1)}px)`,
                    transformOrigin: isLoupeActive ? `${targetCenterX}% ${targetCenterY}%` : "center center",
                    transition: isPanning ? "none" : "transform 0.15s ease-out",
                  }}
                >
                  <img
                    src={imgSrc}
                    alt={lang === "en" ? "Manuscript for palaeographical transcription" : "Rukopis k paleografickému přepisu"}
                    loading="eager"
                    decoding="async"
                  />
                  {question.highlight_regions && question.highlight_regions.length > 0 && (
                    <svg className="spotlight-svg-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <defs>
                        <mask id={`spotlight-mask-${question.id || "curr"}`}>
                          <rect x="0" y="0" width="100" height="100" fill="white" />
                          {question.highlight_regions.map((reg, idx) => {
                            const rw = reg.w ?? (reg as any).width ?? 20;
                            const rh = reg.h ?? (reg as any).height ?? 5;
                            return (
                              <rect
                                key={idx}
                                x={reg.x}
                                y={reg.y}
                                width={rw}
                                height={rh}
                                rx="0.5"
                                fill="black"
                              />
                            );
                          })}
                        </mask>
                      </defs>
                      <rect
                        x="0"
                        y="0"
                        width="100"
                        height="100"
                        fill="rgba(14, 10, 7, 0.72)"
                        mask={`url(#spotlight-mask-${question.id || "curr"})`}
                      />
                      {question.highlight_regions.map((reg, idx) => {
                        const rw = reg.w ?? (reg as any).width ?? 20;
                        const rh = reg.h ?? (reg as any).height ?? 5;
                        const lineNum = reg.line_number ?? (idx + 1);
                        return (
                          <g key={idx}>
                            <rect
                              x={reg.x}
                              y={reg.y}
                              width={rw}
                              height={rh}
                              rx="0.6"
                              fill="rgba(255, 213, 128, 0.08)"
                              stroke="#ffd580"
                              strokeWidth="0.75"
                              strokeDasharray="2.5 1.2"
                            />
                            <text
                              x={reg.x + 0.6}
                              y={reg.y + Math.min(rh * 0.7, 3.8)}
                              fill="#ffd580"
                              fontSize="2.8"
                              fontWeight="bold"
                              fontFamily="sans-serif"
                            >
                              #{lineNum}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  )}
                </div>
              </div>
            </div>
            <div className="text-center text-[10px] text-[#8c6b3e] mb-2">
              {challengeCard.manuscript} · {challengeCard.locus}
            </div>

            <div className="transcription-box">
              <input
                type="text"
                className="transcription-input"
                placeholder={lang === "en" ? "Transcribe Latin text from the illuminated lines here..." : "Zde přepište latinský text z osvětlených řádků..."}
                value={userText}
                disabled={Boolean(answer)}
                onChange={(e) => {
                  setUserText(e.target.value);
                  playQuillScratch();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !answer && userText.trim()) {
                    handleCheckTranscription();
                  }
                }}
                autoFocus
              />
              <div className="transcription-bar">
                <button
                  type="button"
                  className="transcription-btn"
                  disabled={!userText.trim() || Boolean(answer)}
                  onClick={handleCheckTranscription}
                >
                  {lang === "en" ? "Verify Transcription (Enter)" : "Ověřit přepis (Enter)"}
                </button>
                {transcriptionFeedback && (
                  <span
                    className={`transcription-feedback ${
                      transcriptionFeedback.pass
                        ? "success"
                        : transcriptionFeedback.similarity >= 75
                        ? "partial"
                        : "error"
                    }`}
                  >
                    {transcriptionFeedback.pass
                      ? (lang === "en" ? "✓ Successfully deciphered!" : "✓ Úspěšně rozluštěno!")
                      : (lang === "en" ? `${transcriptionFeedback.similarity}% match (target: 90%)` : `${transcriptionFeedback.similarity} % shoda (cíl: 90 %)`)}
                  </span>
                )}
              </div>

              {/* Indikátor 5 pokusů k odevzdání */}
              <div className="transcription-attempts-tracker">
                <span className="font-bold text-[#5c3e1e]">
                  {lang === "en" ? "Attempts:" : "Pokusy k odevzdání:"}
                </span>
                {Array.from({ length: 5 }).map((_, idx) => {
                  const isUsed = idx < transcriptionAttempts;
                  const isCurrent = idx === transcriptionAttempts && !answer;
                  const isSuccess = isUsed && transcriptionFeedback?.pass;
                  const isFail = isUsed && !transcriptionFeedback?.pass;
                  return (
                    <span
                      key={idx}
                      className={`attempt-pip ${
                        isSuccess ? "used-success" : isFail ? "used-fail" : isCurrent ? "current" : ""
                      }`}
                      title={
                        isSuccess
                          ? (lang === "en" ? `Attempt ${idx + 1}: Passed!` : `Pokus ${idx + 1}: Úspěšně splněno!`)
                          : isFail
                          ? (lang === "en" ? `Attempt ${idx + 1}: Not accepted` : `Pokus ${idx + 1}: Neuznáno`)
                          : isCurrent
                          ? (lang === "en" ? `Attempt ${idx + 1}: Current attempt` : `Pokus ${idx + 1}: Aktuální pokus`)
                          : (lang === "en" ? `Attempt ${idx + 1}: Remaining` : `Pokus ${idx + 1}: Zbývá`)
                      }
                    >
                      {idx + 1}
                    </span>
                  );
                })}
                <span className="text-[10.5px] text-[#8c6b3e] ml-1">
                  {answer
                    ? answer === "correct"
                      ? (lang === "en" ? "✓ Accepted" : "✓ Uznáno")
                      : (lang === "en" ? "✗ All 5 attempts exhausted" : "✗ Všech 5 pokusů vyčerpáno")
                    : (lang === "en"
                        ? `(${Math.max(0, 5 - transcriptionAttempts)} remaining)`
                        : `(zbývá ${Math.max(0, 5 - transcriptionAttempts)})`)}
                </span>
              </div>

              <p style={{ margin: "6px 0 0", fontSize: "11px", color: "#7a592c" }}>
                {lang === "en" ? (
                  <>🎯 <b>Target:</b> at least 90% accuracy within up to 5 attempts (u/v, i/j and minor punctuation variants are tolerated).</>
                ) : (
                  <>🎯 <b>Cíl:</b> alespoň 90% přesnost v max. 5 pokusech (systém toleruje záměny u/v, i/j a drobnou interpunkci).</>
                )}
              </p>
              {transcriptionFeedback && !transcriptionFeedback.pass && (
                <p className="hint-copy">{transcriptionFeedback.message}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="multiple-choice-mode">
            <div className="challenge-manuscript">
              <ColophonImage card={challengeCard} alt={lang === "en" ? "Manuscript detail for challenge" : "Detail rukopisu k výzvě"} />
              <small>
                {challengeCard.manuscript} · {challengeCard.locus}
              </small>
            </div>

            <blockquote className={kind === "paleo" ? "paleo-text" : ""}>
              {question.quote}
            </blockquote>

            {qTranslation && (
              <div className="translation-box">
                <b>{lang === "en" ? "Translation" : "Překlad"}</b>
                <span>„{qTranslation}“</span>
              </div>
            )}

            <div className="game-options grid-2x2">
              {qOptions.map((o, i) => {
                const icon = Array.isArray(o) ? o[0] : ["A", "B", "C", "D"][i] || "•";
                const text = Array.isArray(o) ? o[1] : String(o);
                const isSelected = i === selectedOptionIndex;
                const isCorrect = i === question.correct_index;
                const btnClass = answer
                  ? isCorrect
                    ? "correct"
                    : isSelected
                    ? "wrong-chosen"
                    : "dim"
                  : "";
                return (
                  <button
                    key={i}
                    disabled={Boolean(answer)}
                    className={btnClass}
                    onClick={() => {
                      playSoftClick();
                      setSelectedOptionIndex(i);
                      onAnswer(i === question.correct_index);
                    }}
                  >
                    <span className="opt-icon">{icon}</span>
                    <span className="opt-text">
                      <span>{text}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {answer === "correct" && (
          <div className="game-explanation">
            <strong>{lang === "en" ? "Scribal Insight & Solution:" : "Písařský vhled & řešení:"}</strong>
            {isTranscription && (
              <p className="game-transcription-solution">
                „{question.target_transcription || question.quote}“
              </p>
            )}
            {qTranslation && (
              <p className="game-translation-box">
                <b>{lang === "en" ? "Translation:" : "Překlad:"}</b> „{qTranslation}“
              </p>
            )}
            {qExplanation && <p className="mt-1">{qExplanation}</p>}
            <div className="mt-3 flex justify-end">
              <button type="button" className="game-continue-btn" onClick={onClose}>
                {lang === "en" ? "Continue & Claim Reward →" : "Rozumím, pokračovat k odměně →"}
              </button>
            </div>
          </div>
        )}

        {answer === "wrong" && (
          <div className="game-explanation" style={{ borderLeft: "4px solid #b91c1c", background: "#fdf2f2" }}>
            <strong style={{ color: "#991b1b", display: "block", marginBottom: "4px" }}>
              {lang === "en" ? "✗ Challenge failed – recorded as an unsuccessful attempt." : "✗ Výzva zmařena – pokus byl započten jako neúspěch."}
            </strong>
            <p style={{ margin: "0 0 6px", fontSize: "11px", color: "#7f1d1d" }}>
              {lang === "en"
                ? "Here is the authentic solution and commentary to learn from:"
                : "Zde je správné řešení a odborný komentář pro poučení:"}
            </p>
            {isTranscription ? (
              <p className="game-transcription-solution">
                <b>{lang === "en" ? "Target Transcription:" : "Vzorový přepis:"}</b> „{question.target_transcription || question.quote}“
              </p>
            ) : (
              <p className="game-transcription-solution">
                <b>{lang === "en" ? "Correct Answer:" : "Správná odpověď:"}</b>{" "}
                {Array.isArray(qOptions[question.correct_index])
                  ? (qOptions[question.correct_index] as [string, string])[1]
                  : String(qOptions[question.correct_index] || "")}
              </p>
            )}
            {qTranslation && (
              <p className="game-translation-box">
                <b>{lang === "en" ? "Translation:" : "Překlad:"}</b> „{qTranslation}“
              </p>
            )}
            {qExplanation && <p className="mt-1" style={{ color: "#374151" }}>{qExplanation}</p>}
            <div className="mt-3 flex justify-end">
              <button type="button" className="game-continue-btn" onClick={onClose}>
                {lang === "en" ? "Understood, Close Challenge" : "Rozumím, zavřít výzvu"}
              </button>
            </div>
          </div>
        )}

        {step === 0 && !answer && qHint && (
          <button className="hint" onClick={() => setStep(1)}>
            {lang === "en" ? "Need a hint?" : "Potřebujete nápovědu?"}
          </button>
        )}
        {step === 1 && qHint && <p className="hint-copy">{qHint}</p>}
      </section>
    </div>
  );
}

function MapModal({
  state,
  cards,
  onClose,
  onDetail,
  lang = "cs",
  initialPlace,
}: {
  state: GameState;
  cards: Colophon[];
  onClose: () => void;
  onDetail: (card: Colophon) => void;
  lang?: Language;
  initialPlace?: ScriptoriumPlace | null;
}) {
  const scriptoriaWithCards = useMemo(() => {
    return getScriptoriaWithCards(cards, state.collection);
  }, [cards, state.collection]);

  const [selectedPlace, setSelectedPlace] = useState<ScriptoriumPlace>(() => {
    if (initialPlace) return initialPlace;
    const withOwned = scriptoriaWithCards.find((s) => s.owned.length > 0);
    return withOwned ? withOwned.place : SCRIPTORIA_PLACES[0];
  });

  const currentSelection =
    scriptoriaWithCards.find((s) => s.place.id === selectedPlace?.id) ||
    scriptoriaWithCards[0] || { place: SCRIPTORIA_PLACES[0], cards: [], owned: [] };

  const totalMapOwned = scriptoriaWithCards.reduce((acc, s) => acc + s.owned.length, 0);
  const totalMapCards = scriptoriaWithCards.reduce((acc, s) => acc + s.cards.length, 0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="modal map-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={lang === "en" ? "Historical map of scriptoria" : "Historická mapa skriptorií"}
      >
        <button className="close" onClick={onClose}>
          ×
        </button>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div>
            <p className="eyebrow">{lang === "en" ? "Scribal and university centers of medieval Europe" : "Písařská a univerzitní centra středověké Evropy"}</p>
            <h2>{lang === "en" ? "Historical Map of Scriptoria" : "Historická mapa skriptorií"}</h2>
          </div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "var(--brown)",
              background: "#eedcac",
              padding: "4px 10px",
              borderRadius: "4px",
              border: "1px solid #ba8e55",
            }}
          >
            {lang === "en" ? "Discovered total:" : "Objeveno celkem:"} <b>{totalMapOwned} / {totalMapCards}</b>
          </div>
        </div>

        <div className="map-places-pills">
          {scriptoriaWithCards.map(({ place, cards: pCards, owned }) => {
            const isSelected = selectedPlace.id === place.id;
            return (
              <button
                key={place.id}
                type="button"
                className={`map-place-pill ${isSelected ? "active" : ""}`}
                onClick={() => setSelectedPlace(place)}
              >
                <span>{place.icon}</span>
                <span>{getPlaceName(place, lang)}</span>
                <small style={{ opacity: 0.85, fontSize: "9.5px" }}>
                  ({owned.length}/{pCards.length})
                </small>
              </button>
            );
          })}
        </div>

        <div className="map-layout">
          {/* Levá část: reálná interaktivní mapa Leaflet */}
          <RealLeafletMap
            scriptoria={scriptoriaWithCards}
            selectedPlace={selectedPlace}
            onSelectPlace={setSelectedPlace}
            lang={lang}
          />

          {/* Pravá část: detail vybraného skriptoria */}
          <div className="map-panel">
            <div className="map-panel-header">
              <h3>
                <span>{currentSelection.place.icon}</span> {getPlaceName(currentSelection.place, lang)}
              </h3>
              <p>
                {getPlaceRegion(currentSelection.place, lang)} · {getPlaceCountry(currentSelection.place, lang)}
              </p>
              <div className="map-panel-coords">
                📍 {currentSelection.place.lat.toFixed(4)}° {lang === "en" ? "N" : "s. š."}, {currentSelection.place.lng.toFixed(4)}° {lang === "en" ? "E" : "v. d."}
              </div>
            </div>
            <p className="map-panel-desc">{getPlaceDescription(currentSelection.place, lang)}</p>

            <div className="map-panel-repo-box">
              🏛️ <strong>{lang === "en" ? "Custody of surviving holdings:" : "Uložení dochovaných fondů:"}</strong>
              <div>{getPlaceRepository(currentSelection.place, lang)}</div>
            </div>

            <div className="map-panel-stats">
              <span>{lang === "en" ? "Surviving codices in archive" : "Dochované kodexy v archivu"}</span>
              <span>
                {currentSelection.owned.length} {lang === "en" ? "of" : "z"} {currentSelection.cards.length} {lang === "en" ? "discovered" : "objeveno"}
              </span>
            </div>
            <div className="map-panel-bar">
              <i
                style={{
                  width: `${
                    currentSelection.cards.length > 0
                      ? (currentSelection.owned.length / currentSelection.cards.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>

            <div className="map-cards-scroll">
              {currentSelection.cards.length === 0 ? (
                <p className="map-empty-state">{lang === "en" ? "No codices are catalogued for this locality yet." : "V této lokalitě zatím nemáte katalogizovány žádné kodexy."}</p>
              ) : (
                currentSelection.cards.map((card) => {
                  const count = state.collection[card.id] || 0;
                  const isOwned = count > 0;
                  const title = isOwned ? getCardTitle(card, lang) : (lang === "en" ? "Mysterious Codex" : "Tajemný kodex");
                  return (
                    <div key={card.id} className={`map-card-item ${isOwned ? "" : "locked"}`}>
                      <div className="map-card-thumb">
                        {isOwned ? (
                          <ColophonImage card={card} />
                        ) : (
                          <span
                            style={{
                              display: "grid",
                              placeItems: "center",
                              width: "100%",
                              height: "100%",
                              color: "#835928",
                              fontWeight: "bold",
                            }}
                          >
                            🔒
                          </span>
                        )}
                      </div>
                      <div className="map-card-info">
                        <strong>{title}</strong>
                        <small>
                          {isOwned ? `${getCardScribe(card.scribe, lang)} (${card.year})` : (lang === "en" ? "Obtain in packs" : "Získejte v balíčcích")}
                        </small>
                        {isOwned && card.manuscript && (
                          <div className="map-card-repo" title={card.manuscript}>
                            🏛️ {card.manuscript}
                          </div>
                        )}
                      </div>
                      {isOwned ? (
                        <button
                          className="map-card-action"
                          onClick={() => onDetail(card)}
                          title={lang === "en" ? "View colophon details" : "Prohlédnout detail kolofonu"}
                        >
                          {lang === "en" ? "Details →" : "Detail →"}
                        </button>
                      ) : (
                        <span style={{ fontSize: "10px", color: "#8a6534", padding: "4px" }}>
                          {lang === "en" ? "Locked" : "Zamčeno"}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
