"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useRef, useMemo } from "react";
import {
  Award,
  BookOpen,
  Check,
  ChevronRight,
  ExternalLink,
  Flame,
  Gem,
  Grid3X3,
  Home as HomeIcon,
  Info,
  KeyRound,
  Languages,
  LibraryBig,
  Lock,
  LockKeyhole,
  MapPinned,
  Maximize2,
  PenTool,
  Puzzle,
  RotateCcw,
  Scroll,
  ScrollText,
  Search,
  Send,
  SlidersHorizontal,
  Smile,
  Sparkles,
  Trophy,
  UserPlus,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { HEURIST_COLOPHONS } from "./data/colophons.generated";
import { supabase } from "@/lib/supabase";

type Tab = "home" | "collection" | "packs" | "trophies" | "profile";
type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Unique";
type GameKind = "mood" | "cipher" | "paleo";
type PackQuality = "standard" | "refined" | "masterwork";
type SortOption = "year-asc" | "year-desc" | "rarity" | "title" | "place";

type Colophon = {
  id: number | string;
  uuid?: string;
  slug?: string;
  title: string;
  quote: string;
  translation: string;
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
  visualNote?: string;
  crop_x?: number;
  crop_y?: number;
  crop_w?: number;
  crop_h?: number;
};

type GameState = {
  packsOpened: number;
  collection: Record<string | number, number>;
  xp: number;
  coins: number;
  streak: number;
  puzzle: number;
  trophies: string[];
  lastPlayed: string;
  gamesPlayed: number;
  bonusPacks: PackQuality[];
  lastLoginDate: string;
  gallery: string[];
  avatarArt: string | null;
};

const ILLUMINATIONS = [
  { id: "rabbit-scribe", title: "Učený zajíc (The Learned Hare)", source: "/illumination-rabbit.png" },
];

const COLOPHONS: Colophon[] = HEURIST_COLOPHONS.map((card) => ({ ...card })) as Colophon[];

const INITIAL_STATE: GameState = {
  packsOpened: 0,
  collection: Object.fromEntries(COLOPHONS.slice(0, 4).map((card, index) => [card.id, index === 1 ? 2 : 1])),
  xp: 120,
  coins: 140,
  streak: 10,
  puzzle: 3,
  trophies: ["first-spark"],
  lastPlayed: "",
  gamesPlayed: 0,
  bonusPacks: [],
  lastLoginDate: "",
  gallery: [],
  avatarArt: null,
};

const NAV: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "home", label: "Skriptorium", icon: HomeIcon },
  { id: "collection", label: "Sbírka kodexů", icon: LibraryBig },
  { id: "packs", label: "Otevírání", icon: ScrollText },
  { id: "trophies", label: "Výzvy", icon: Trophy },
  { id: "profile", label: "Profil písaře", icon: UserRound },
];

const RARITY_WEIGHT: Record<Rarity, number> = {
  Unique: 6,
  Legendary: 5,
  Epic: 4,
  Rare: 3,
  Uncommon: 2,
  Common: 1,
};

const today = () => new Date().toISOString().slice(0, 10);
const XP_PER_LEVEL = 100;
const levelForXp = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;
const qualityLabel = (quality: PackQuality) =>
  quality === "masterwork" ? "Mistrovský" : quality === "refined" ? "Vytříbený" : "Standardní";

function withXpReward(state: GameState, amount: number): GameState {
  const nextXp = state.xp + amount;
  const levelsEarned = Math.max(0, levelForXp(nextXp) - levelForXp(state.xp));
  return {
    ...state,
    xp: nextXp,
    bonusPacks: [...state.bonusPacks, ...Array.from({ length: levelsEarned }, () => "masterwork" as PackQuality)],
  };
}

function loadState(): GameState {
  if (typeof window === "undefined") return INITIAL_STATE;
  try {
    const saved = JSON.parse(localStorage.getItem("quilldrop-state") || "null");
    const hydrated: GameState = {
      ...INITIAL_STATE,
      ...(saved || {}),
      bonusPacks: saved?.bonusPacks || [],
      gallery: saved?.gallery || [],
    };
    const hasCurrentCards = Object.keys(hydrated.collection).some((id) =>
      COLOPHONS.some((card) => String(card.id) === String(id))
    );
    if (!hasCurrentCards) hydrated.collection = { ...INITIAL_STATE.collection };
    const dailyReset =
      hydrated.lastPlayed === today()
        ? hydrated
        : { ...hydrated, packsOpened: 0, gamesPlayed: 0, bonusPacks: [], lastPlayed: today() };
    if (dailyReset.lastLoginDate === today()) return dailyReset;
    const nextPuzzle = Math.min(16, dailyReset.puzzle + 1);
    const completedId = nextPuzzle === 16 ? ILLUMINATIONS[0].id : null;
    return {
      ...dailyReset,
      puzzle: nextPuzzle,
      lastLoginDate: today(),
      streak: dailyReset.streak + 1,
      gallery:
        completedId && !dailyReset.gallery.includes(completedId)
          ? [...dailyReset.gallery, completedId]
          : dailyReset.gallery,
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
  const [game, setGame] = useState<GameKind | null>(null);
  const [gameStep, setGameStep] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const [pendingPackLevel, setPendingPackLevel] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setState(loadState());
      setReady(true);
    }, 0);

    async function fetchLiveCards() {
      try {
        const { data, error } = await supabase
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

        if (!error && data && data.length > 0) {
          const mapped: Colophon[] = data.map((c: any) => ({
            id: c.colophons?.heurist_id || c.id,
            uuid: c.id,
            slug: c.slug,
            title: c.title,
            quote: c.colophons?.quote || "Explicit...",
            translation: c.colophons?.translation_cs || "Překlad se připravuje",
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
            visualNote: c.colophons?.visual_note,
            crop_x: Number(c.crop_x) || 0,
            crop_y: Number(c.crop_y) || 0,
            crop_w: Number(c.crop_w) || 100,
            crop_h: Number(c.crop_h) || 100,
          }));
          setCards(mapped);
          setIsLive(true);
        }
      } catch (e) {
        console.warn("Supabase fetch failed, continuing with static data:", e);
      }
    }

    fetchLiveCards();
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem("quilldrop-state", JSON.stringify({ ...state, lastPlayed: today() }));
  }, [state, ready]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const uniqueOwned = Object.keys(state.collection).length;
  const duplicates = Object.values(state.collection).reduce((sum, n) => sum + Math.max(0, n - 1), 0);
  const playerLevel = levelForXp(state.xp);

  const chooseCard = (quality: PackQuality | "daily") => {
    const roll = Math.random();
    const allowed =
      quality === "masterwork"
        ? roll > 0.92
          ? ["Unique"]
          : roll > 0.66
          ? ["Legendary"]
          : ["Epic", "Rare"]
        : quality === "refined"
        ? roll > 0.97
          ? ["Unique"]
          : roll > 0.8
          ? ["Legendary", "Epic"]
          : ["Rare", "Epic", "Uncommon"]
        : roll > 0.985
        ? ["Unique"]
        : roll > 0.93
        ? ["Legendary"]
        : roll > 0.78
        ? ["Epic", "Rare"]
        : roll > 0.5
        ? ["Uncommon", "Rare"]
        : ["Common", "Uncommon"];
    const pool = cards.filter((c) => allowed.includes(c.rarity));
    return pool[Math.floor(Math.random() * pool.length)] || cards[0] || COLOPHONS[0];
  };

  const openPack = () => {
    const usingBonus = state.packsOpened >= 10;
    if (usingBonus && !state.bonusPacks.length) {
      setToast(
        state.gamesPlayed >= 10
          ? "Všechny dnešní balíčky i výzvy jsou vyčerpány. Vraťte se zítra!"
          : "Denní limit 10 balíčků byl vyčerpán. Vyhrajte další v písařských výzvách!"
      );
      return;
    }
    const quality: PackQuality | "daily" = usingBonus ? state.bonusPacks[0] : "daily";
    const drawn = Array.from({ length: 5 }, () => chooseCard(quality));
    setOpened(drawn);
    setReveal(0);
    setCardShown(false);
    setPackQuality(quality === "daily" ? "standard" : quality);

    const nextCollection = { ...state.collection };
    drawn.forEach((card) => {
      nextCollection[card.id] = (nextCollection[card.id] || 0) + 1;
    });

    const nextTrophies = [...state.trophies];
    if (!nextTrophies.includes("first-pack")) nextTrophies.push("first-pack");

    const nextLevel = levelForXp(state.xp + 25);
    if (nextLevel > levelForXp(state.xp)) setPendingPackLevel(nextLevel);

    setState((s) =>
      withXpReward(
        {
          ...s,
          packsOpened: usingBonus ? s.packsOpened : s.packsOpened + 1,
          bonusPacks: usingBonus ? s.bonusPacks.slice(1) : s.bonusPacks,
          collection: nextCollection,
          trophies: nextTrophies,
        },
        25
      )
    );
  };

  const finishReveal = () => {
    if (!opened) return;
    if (reveal < opened.length - 1) {
      setReveal((r) => r + 1);
      setCardShown(false);
    } else {
      setOpened(null);
      if (pendingPackLevel) {
        setLevelUp(pendingPackLevel);
        setPendingPackLevel(null);
      } else {
        setToast("5 nových kolofonů bylo uloženo do vaší sbírky!");
      }
    }
  };

  const startGame = (kind: GameKind) => {
    if (state.gamesPlayed >= 10) {
      setToast("Dnešních 10 výzev je dokončeno. Nové výzvy se odemknou zítra.");
      return;
    }
    setGame(kind);
  };

  const finishGame = (correct: boolean) => {
    setAnswer(correct ? "correct" : "wrong");
    const quality: PackQuality = game === "paleo" ? "masterwork" : game === "cipher" ? "refined" : "standard";
    if (correct) {
      const earnedXp = quality === "masterwork" ? 90 : quality === "refined" ? 60 : 35;
      const nextLevel = levelForXp(state.xp + earnedXp);
      setState((s) =>
        withXpReward(
          {
            ...s,
            gamesPlayed: s.gamesPlayed + 1,
            bonusPacks: [...s.bonusPacks, quality],
            coins: s.coins + 20,
          },
          earnedXp
        )
      );
      if (nextLevel > levelForXp(state.xp)) window.setTimeout(() => setLevelUp(nextLevel), 1300);
      else setToast(`Správně! ${qualityLabel(quality)} balíček byl přidán do vaší truhly.`);
    } else {
      setState((s) => ({ ...s, gamesPlayed: s.gamesPlayed + 1 }));
      setToast(`Pokus vyčerpán. Zbývá ${Math.max(0, 9 - state.gamesPlayed)} výzev.`);
    }
    setTimeout(() => {
      setGame(null);
      setAnswer(null);
      setGameStep(0);
    }, 1200);
  };

  const resetDemo = () => {
    setState(INITIAL_STATE);
    setToast("Postup byl obnoven do výchozího stavu.");
  };

  if (!ready) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#fdf6e3] text-[#4a3318] font-serif text-lg">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <BookOpen size={36} className="text-[#c8920a]" />
          <span style={{ fontFamily: "var(--font-display, Georgia, serif)" }}>Otevírám středověký kodex...</span>
        </div>
      </main>
    );
  }

  return (
    <div className="page-stage">
      <div className="app-shell">
        {/* HORNÍ MODERNÍ NAVBAR (Desktop & Tablet) */}
        <header className="desktop-navbar">
          <div className="desktop-navbar-inner">
            {/* Logo a status FF UK */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTab("home")}
                className="flex items-center gap-2 text-left cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c8920a] to-[#7a5018] flex items-center justify-center font-bold text-white text-lg shadow-md group-hover:scale-105 transition"
                  style={{ fontFamily: "var(--font-display, Georgia, serif)" }}>
                  Q
                </div>
                <div>
                  <span className="font-bold text-base text-[#2c1a0e] tracking-wide block leading-tight"
                    style={{ fontFamily: "var(--font-display, Georgia, serif)" }}>
                    Quilldrop
                  </span>
                  <span className="text-[10px] text-[#8a6540] block leading-none"
                    style={{ fontFamily: "var(--font-ui)" }}>
                    Univerzita Karlova
                  </span>
                </div>
              </button>

              {isLive ? (
                <span
                  className="brand-badge"
                  title="Živě propojeno se Supabase a univerzitními skeny FF UK"
                >
                  <Sparkles size={11} className="text-[#c8920a]" /> FF UK Live
                </span>
              ) : (
                <span className="brand-badge opacity-60">
                  Offline archiv
                </span>
              )}
            </div>

            {/* Navigační záložky (Střed) */}
            <nav className="hidden md:flex nav-tabs" aria-label="Hlavní navigace">
              {NAV.map((item) => {
                const Icon = item.icon;
                const isActive = tab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={`nav-tab-btn ${isActive ? "active" : ""}`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                    {item.id === "collection" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#fef3c7] text-[#c8920a] border border-[#fcd34d]" style={{ fontFamily: "var(--font-ui)" }}>
                        {uniqueOwned}/{cards.length}
                      </span>
                    )}
                    {item.id === "packs" && state.packsOpened < 10 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#ffedd5] text-[#ea580c] border border-[#fdba74]" style={{ fontFamily: "var(--font-ui)" }}>
                        {10 - state.packsOpened}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Statistiky hráče a Quilldrop Studio (Pravá strana) */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2">
                <div
                  className="stat-chip"
                  title={`${state.streak} dní v řadě bez přerušení`}
                >
                  <Flame size={13} className="text-[#ea580c]" />
                  <span>{state.streak} d</span>
                </div>
                <div
                  className="stat-chip"
                  title={`Úroveň ${playerLevel} (${state.xp} XP)`}
                >
                  <Sparkles size={13} className="text-[#c8920a]" />
                  <span>Lvl {playerLevel}</span>
                </div>
              </div>

              {/* Tlačítko pro editory a administraci */}
              <a
                href="/admin"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#78350f] bg-[#fef3c7] hover:bg-[#fde68a] border border-[#f59e0b] px-3 py-1.5 rounded-lg transition shadow-sm"
                style={{ fontFamily: "var(--font-ui)" }}
                title="Přejít do Quilldrop Studia pro ořez a správu rukopisů"
              >
                <PenTool size={13} />
                <span className="hidden lg:inline">Studio</span>
              </a>
            </div>
          </div>
        </header>

        {/* HLAVNÍ OBSAHOVÁ OBLAST */}
        <main className="main-content">
          {tab === "home" && (
            <HomeScreen
              state={state}
              uniqueOwned={uniqueOwned}
              totalCards={cards.length}
              cards={cards}
              onPacks={() => setTab("packs")}
              onCollection={() => setTab("collection")}
              onMap={() => setShowMap(true)}
              onTrophies={() => setTab("trophies")}
              onDetail={setDetail}
            />
          )}

          {tab === "collection" && (
            <CollectionScreen
              state={state}
              cards={cards}
              onDetail={setDetail}
            />
          )}

          {tab === "packs" && (
            <PacksScreen state={state} onOpen={openPack} onGame={startGame} />
          )}

          {tab === "trophies" && <TrophiesScreen state={state} cards={cards} />}

          {tab === "profile" && (
            <ProfileScreen
              state={state}
              uniqueOwned={uniqueOwned}
              duplicates={duplicates}
              isLive={isLive}
              totalCards={cards.length}
              onReset={resetDemo}
              onSend={() =>
                setToast(
                  duplicates
                    ? "Duplikát byl odeslán kolegovi do skriptoria!"
                    : "Pro sdílení nejprve získejte duplicitní kartu."
                )
              }
              onSetAvatar={(id) => {
                setState((s) => ({ ...s, avatarArt: id }));
                setToast("Portrét písaře byl aktualizován.");
              }}
            />
          )}
        </main>

        {/* MOBILNÍ SPODNÍ LIŠTA (Zobrazí se pouze na displejích < 768px) */}
        <nav className="md:hidden bottom-nav" aria-label="Mobilní navigace">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                className={isActive ? "active" : ""}
                onClick={() => setTab(item.id)}
                aria-label={item.label}
              >
                <span>
                  <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* MODÁLNÍ DIALOGY */}
        {detail && (
          <CardDetail
            card={detail}
            count={state.collection[detail.id] || 0}
            onClose={() => setDetail(null)}
          />
        )}

        {opened && (
          <PackReveal
            key={`${reveal}-${cardShown}`}
            card={opened[reveal]}
            position={reveal + 1}
            total={opened.length}
            quality={packQuality}
            shown={cardShown}
            onReveal={() => setCardShown(true)}
            onNext={finishReveal}
          />
        )}

        {game && (
          <GameModal
            kind={game}
            cards={cards}
            answer={answer}
            step={gameStep}
            setStep={setGameStep}
            onClose={() => setGame(null)}
            onAnswer={finishGame}
          />
        )}

        {showMap && <MapModal state={state} cards={cards} onClose={() => setShowMap(false)} />}
        {levelUp && <LevelUpModal level={levelUp} onClose={() => setLevelUp(null)} />}
        {toast && <div className="toast-notice" role="status">{toast}</div>}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   KOMPONENTA OŘEZU RUKOPISU (Uniformní škálování & boundary clamping)
   ------------------------------------------------------------- */
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
    Number(card.crop_w) < 99;

  const src =
    failedSrc === card.imageUrl && card.remoteImageUrl
      ? card.remoteImageUrl
      : card.imageUrl || card.remoteImageUrl;

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
        onLoad={onImgLoad}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
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

    // Uniformní měřítko: 100% zachování proporcí rukopisu bez jakékoliv deformace!
    const uniformScale = Math.min(containerSize.w / cropWPx, containerSize.h / cropHPx);
    const renderW = naturalSize.w * uniformScale;
    const renderH = naturalSize.h * uniformScale;

    const offsetX = (containerSize.w - cropWPx * uniformScale) / 2;
    const offsetY = (containerSize.h - cropHPx * uniformScale) / 2;

    let renderLeft = offsetX - cropXPx * uniformScale;
    let renderTop = offsetY - cropYPx * uniformScale;

    // Clamping hran: zabrání vzniku prázdných mezer na okrajích
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

/* -------------------------------------------------------------
   DOMOVSKÁ OBRAZOVKA (Dashboard středověkého skriptoria)
   ------------------------------------------------------------- */
function HomeScreen({
  state,
  uniqueOwned,
  totalCards,
  cards,
  onPacks,
  onCollection,
  onMap,
  onTrophies,
  onDetail,
}: {
  state: GameState;
  uniqueOwned: number;
  totalCards: number;
  cards: Colophon[];
  onPacks: () => void;
  onCollection: () => void;
  onMap: () => void;
  onTrophies: () => void;
  onDetail: (c: Colophon) => void;
}) {
  const progressPercent = totalCards > 0 ? Math.round((uniqueOwned / totalCards) * 100) : 0;
  const packsLeft = Math.max(0, 10 - state.packsOpened);

  // Vybraná karta dne (např. unikátní nebo první vlastněná)
  const featuredCard =
    cards.find((c) => c.rarity === "Unique" && state.collection[c.id]) ||
    cards.find((c) => state.collection[c.id]) ||
    cards[0];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* HERO BANNER: Uvítání ve skriptoriu a pečeť balíčku */}
      <section className="relative rounded-2xl bg-gradient-to-br from-[#fffbeb] via-[#fef3c7] to-[#fde68a] border-2 border-[#d4a017] p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#f59e0b]/10 to-transparent pointer-events-none" />

        <div className="grid md:grid-cols-3 gap-6 items-center relative z-10">
          <div className="md:col-span-2 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c8920a]/12 border border-[#c8920a]/40 text-[#78350f] text-xs font-bold"
              style={{ fontFamily: "var(--font-ui)" }}>
              <Sparkles size={13} className="text-[#c8920a]" /> Dnešní objev ve skriptoriu
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-[#2c1a0e] leading-tight"
              style={{ fontFamily: "var(--font-display, Georgia, serif)" }}>
              Co dnes vydají okraje středověkých kodexů?
            </h1>
            <p className="text-sm text-[#6b4c2a] leading-relaxed max-w-xl">
              Prozkoumejte autentické hlasy písařů, stížnosti na bolavé ruce,
              rubrikované modlitby i slavnostní přípisy z archivů celé Evropy (výzkum FF UK).
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onPacks}
                className="bg-gradient-to-b from-[#f59e0b] to-[#c8920a] hover:from-[#fbbf24] hover:to-[#d97706] text-white font-bold px-6 py-2.5 rounded-xl shadow-lg transition transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
                style={{ fontFamily: "var(--font-ui)" }}
              >
                <ScrollText size={18} />
                <span>Otevřít dnešní balíček</span>
                <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-xs">
                  {packsLeft} zbývá
                </span>
              </button>

              <button
                onClick={onCollection}
                className="bg-white/70 hover:bg-white text-[#4a3318] border-2 border-[#d4b98a] px-4 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer flex items-center gap-2"
                style={{ fontFamily: "var(--font-ui)" }}
              >
                <LibraryBig size={16} className="text-[#c8920a]" />
                <span>Prohlédnout sbírku ({uniqueOwned})</span>
              </button>
            </div>
          </div>

          {/* Pečetidlo / Vosková pečeť balíčku */}
          <div className="flex flex-col items-center justify-center p-4 bg-white/50 rounded-xl border-2 border-[#d4b98a] text-center">
            <div
              onClick={onPacks}
              className="wax-seal-ceremony cursor-pointer group"
              title="Klikněte pro rozpečetění balíčku"
            >
              Q
            </div>
            <span className="font-bold text-sm text-[#4a3318] mt-2 block"
              style={{ fontFamily: "var(--font-display, Georgia, serif)" }}>
              {packsLeft > 0 ? `${packsLeft} balíčků dnes k dispozici` : "Dnešní balíčky vyčerpány"}
            </span>
            <span className="text-[11px] text-[#8a6540] mt-0.5" style={{ fontFamily: "var(--font-ui)" }}>
              Každý balíček ukrývá 5 historických kolofonů
            </span>
          </div>
        </div>
      </section>

      {/* STŘEDOVÁ SEKVENCE: Pokrok ve sbírce & Rychlé výzvy */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Ukazatel zaplnění kodexu */}
        <div className="bg-[#16120e] border border-[#382d22] rounded-xl p-5 space-y-4 shadow-lg">
          <div className="flex justify-between items-center">
            <h3 className="font-serif font-bold text-[#ffd580] flex items-center gap-2">
              <BookOpen size={17} /> Váš archiv kodexů
            </h3>
            <span className="text-xs font-mono font-bold text-[#d4af37] bg-[#292017] px-2 py-0.5 rounded">
              {progressPercent}%
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="h-3 w-full bg-[#0d0a08] rounded-full overflow-hidden border border-[#30251a]">
              <div
                className="h-full bg-gradient-to-r from-[#d4af37] to-[#ffd580] rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-[#8c7b6d] font-sans">
              <span>{uniqueOwned} odemčených kolofonů</span>
              <span>{totalCards} celkem v databázi</span>
            </div>
          </div>

          <p className="text-xs text-[#a89887] leading-relaxed">
            Sbírejte kolofony z Olomouce, Prahy, Bologně i Vídně. Každý nese autentický zápis písaře.
          </p>

          <button
            onClick={onCollection}
            className="w-full text-center text-xs font-serif font-bold text-[#ffd580] hover:underline pt-2 block"
          >
            Otevřít celou sbírku →
          </button>
        </div>

        {/* Rychlé dlaždice: Mapa a Mozaika */}
        <div className="bg-[#16120e] border border-[#382d22] rounded-xl p-5 space-y-3 shadow-lg">
          <h3 className="font-serif font-bold text-[#ffd580] flex items-center gap-2">
            <MapPinned size={17} /> Cesty písařů
          </h3>
          <p className="text-xs text-[#a89887]">
            Kde všude naši písaři působili? Prohlédněte si lokality od italských univerzit po kláštery v Čechách.
          </p>
          <button
            onClick={onMap}
            className="w-full p-3 rounded-lg bg-[#201913] hover:bg-[#2b221a] border border-[#443527] text-left transition flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <MapPinned size={20} className="text-[#ffd580]" />
              <div>
                <strong className="block text-xs text-[#e8ded1] font-serif">Historická mapa</strong>
                <small className="text-[10px] text-[#8c7b6d] font-sans">Lokalizace skriptorií</small>
              </div>
            </div>
            <ChevronRight size={16} className="text-[#8c7b6d]" />
          </button>

          <button
            onClick={onTrophies}
            className="w-full p-3 rounded-lg bg-[#201913] hover:bg-[#2b221a] border border-[#443527] text-left transition flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Grid3X3 size={20} className="text-[#ffd580]" />
              <div>
                <strong className="block text-xs text-[#e8ded1] font-serif">16denní mozaika</strong>
                <small className="text-[10px] text-[#8c7b6d] font-sans">
                  {state.puzzle}/16 fragmentů odhaleno
                </small>
              </div>
            </div>
            <ChevronRight size={16} className="text-[#8c7b6d]" />
          </button>
        </div>

        {/* Karta dne s autentickým přepisem */}
        {featuredCard && (
          <div
            onClick={() => onDetail(featuredCard)}
            className="bg-[#16120e] border border-[#ffd580]/40 rounded-xl p-5 space-y-3 shadow-xl hover:border-[#ffd580] transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-[#ffd580] uppercase tracking-wider font-sans">
                  ✦ Doporučený kolofon ✦
                </span>
                <span className="text-xs text-[#8c7b6d] font-mono">{featuredCard.year}</span>
              </div>
              <h4 className="font-serif font-bold text-sm text-[#ffd580] group-hover:text-white transition">
                {featuredCard.title}
              </h4>
              <p className="text-xs text-[#c4b4a1] italic mt-1 line-clamp-2">
                “{featuredCard.quote}”
              </p>
              <p className="text-[11px] text-[#8c7b6d] mt-1 line-clamp-2">
                {featuredCard.translation}
              </p>
            </div>

            <div className="pt-2 border-t border-[#2e241c] flex justify-between items-center text-[11px] text-[#8c7b6d]">
              <span>{featuredCard.scribe}</span>
              <span className="text-[#ffd580] font-serif font-bold flex items-center gap-1">
                Zobrazit detail →
              </span>
            </div>
          </div>
        )}
      </div>

      {/* CITÁT DNE ZE STŘEDOVĚKÉHO KODEXU */}
      <blockquote className="border-l-4 border-[#d4af37] bg-[#14100c] p-4 rounded-r-xl text-sm italic text-[#c4b4a1] font-serif flex items-center justify-between">
        <div>
          “Kniha je dokončena. Nechť je čtenář k písaři laskavý a ruka, jež psala, nechť odpočine.”
          <cite className="block not-italic text-xs text-[#8c7b6d] mt-1 font-sans">
            — Anonymní písař, 14. století
          </cite>
        </div>
        <Scroll size={28} className="text-[#d4af37]/40 shrink-0 ml-4" />
      </blockquote>
    </div>
  );
}

/* -------------------------------------------------------------
   OBRAZOVKA SBÍRKY (Responzivní katalog s vyhledáváním a řazením)
   ------------------------------------------------------------- */
function CollectionScreen({
  state,
  cards,
  onDetail,
}: {
  state: GameState;
  cards: Colophon[];
  onDetail: (c: Colophon) => void;
}) {
  const [filter, setFilter] = useState<Rarity | "All">("All");
  const [onlyOwned, setOnlyOwned] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("year-asc");

  const rarities: (Rarity | "All")[] = [
    "All",
    "Common",
    "Uncommon",
    "Rare",
    "Epic",
    "Legendary",
    "Unique",
  ];

  // Filtrování a řazení
  const filtered = useMemo(() => {
    return cards
      .filter((c) => {
        const isOwned = Boolean(state.collection[c.id]);
        if (onlyOwned && !isOwned) return false;
        if (filter !== "All" && c.rarity !== filter) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = c.title.toLowerCase().includes(q);
          const matchScribe = c.scribe.toLowerCase().includes(q);
          const matchPlace = c.place.toLowerCase().includes(q);
          const matchQuote = c.quote.toLowerCase().includes(q);
          const matchYear = String(c.year).includes(q);
          if (!matchTitle && !matchScribe && !matchPlace && !matchQuote && !matchYear) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "year-asc") return a.year - b.year;
        if (sortBy === "year-desc") return b.year - a.year;
        if (sortBy === "rarity") return RARITY_WEIGHT[b.rarity] - RARITY_WEIGHT[a.rarity];
        if (sortBy === "title") return a.title.localeCompare(b.title);
        if (sortBy === "place") return a.place.localeCompare(b.place);
        return 0;
      });
  }, [cards, filter, onlyOwned, search, sortBy, state.collection]);

  const uniqueDiscovered = Object.keys(state.collection).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* HLAVIČKA SBÍRKY */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#d4b98a] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2c1a0e]"
            style={{ fontFamily: "var(--font-display, Georgia, serif)" }}>
            Archiv středověkých kolofonů
          </h1>
          <p className="text-xs text-[#8a6540] mt-1" style={{ fontFamily: "var(--font-ui)" }}>
            Odemčeno {uniqueDiscovered} z {cards.length} kodexů v databázi • Získáno celkem{" "}
            {Object.values(state.collection).reduce((a, b) => a + b, 0)} karet
          </p>
        </div>

        {/* Vyhledávací lišta */}
        <div className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a6540]"
            />
            <input
              type="text"
              placeholder="Hledat písaře, město, text kolofonu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white border-2 border-[#d4b98a] rounded-xl text-xs text-[#2c1a0e] placeholder-[#b09060] focus:outline-none focus:border-[#c8920a]"
              style={{ fontFamily: "var(--font-ui)" }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a6540] hover:text-[#2c1a0e]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Řazení */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-white border-2 border-[#d4b98a] rounded-xl px-3 py-2 text-xs text-[#2c1a0e] focus:outline-none focus:border-[#c8920a] cursor-pointer"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            <option value="year-asc">Nejstarší (rok ↑)</option>
            <option value="year-desc">Nejmladší (rok ↓)</option>
            <option value="rarity">Podle rarity</option>
            <option value="title">Název (A–Z)</option>
            <option value="place">Podle místa</option>
          </select>
        </div>
      </div>

      {/* FILTRAČNÍ TLAČÍTKA A PŘEPÍNAČ VLASTNĚNÝCH */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {rarities.map((r) => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                filter === r
                  ? "bg-[#c8920a] text-white shadow-md"
                  : "bg-white text-[#6b4c2a] border-2 border-[#d4b98a] hover:border-[#c8920a]"
              }`}
              style={{ fontFamily: "var(--font-ui)" }}
            >
              {r === "All" ? "Všechny rarity" : r}
            </button>
          ))}
        </div>

        <button
          onClick={() => setOnlyOwned(!onlyOwned)}
          className={`text-xs px-3 py-1 rounded-lg border-2 font-bold transition cursor-pointer flex items-center gap-1.5 ${
            onlyOwned
              ? "bg-[#fef3c7] border-[#c8920a] text-[#78350f]"
              : "bg-white border-[#d4b98a] text-[#8a6540]"
          }`}
          style={{ fontFamily: "var(--font-ui)" }}
        >
          <Check size={13} className={onlyOwned ? "opacity-100" : "opacity-0"} />
          <span>Pouze vlastněné</span>
        </button>
      </div>

      {/* RESPONZIVNÍ MŘÍŽKA KARET (2 až 6 sloupců dle šířky) */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[#8a6540] space-y-2">
          <ScrollText size={36} className="mx-auto text-[#d4b98a]" />
          <p className="text-base" style={{ fontFamily: "var(--font-ui)" }}>Žádný kolofon neodpovídá zadanému filtru nebo hledání.</p>
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map((card) => {
            const count = state.collection[card.id] || 0;
            const isOwned = count > 0;

            return (
              <article
                key={card.id}
                onClick={() => isOwned && onDetail(card)}
                className={`mini-card rarity-${card.rarity.toLowerCase()} ${
                  isOwned ? "" : "locked"
                }`}
                title={isOwned ? `Otevřít detail: ${card.title}` : "Dosud neobjevená karta"}
              >
                {/* Horní lišta: Rarita a Sigil */}
                <div className="flex justify-between items-center mb-1.5 text-[9px]"
                  style={{ fontFamily: "var(--font-ui)" }}>
                  <span className={`rarity-pill ${card.rarity}`}>
                    {isOwned ? card.rarity : "???"}
                  </span>
                  <span className="font-bold text-[#c8920a]"
                    style={{ fontFamily: "var(--font-display, Georgia, serif)" }}>{card.sigil}</span>
                </div>

                {/* Výřez rukopisu v poměru 4:3 */}
                <div className="mini-illustration">
                  {isOwned ? (
                    <ColophonImage card={card} alt={card.title} />
                  ) : (
                    <div className="text-center p-2 text-[#b09060]">
                      <Lock size={22} className="mx-auto mb-1 opacity-40" />
                      <span className="text-[10px]" style={{ fontFamily: "var(--font-ui)" }}>Neodemčeno</span>
                    </div>
                  )}
                  {isOwned && (
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-mono px-1 rounded">
                      {card.year}
                    </span>
                  )}
                </div>

                {/* Texty karty */}
                <div className="flex-1 min-w-0">
                  <strong className="block font-bold text-xs text-[#2c1a0e] truncate leading-tight"
                    style={{ fontFamily: "var(--font-display, Georgia, serif)" }}>
                    {isOwned ? card.title : "Tajemný kodex"}
                  </strong>
                  <small className="block text-[10px] text-[#8a6540] truncate mt-0.5"
                    style={{ fontFamily: "var(--font-ui)" }}>
                    {isOwned ? `${card.place} • ${card.scribe}` : "Získejte v balíčku"}
                  </small>
                </div>

                {/* Duplikáty */}
                {count > 1 && (
                  <span className="absolute top-2 right-2 bg-[#2563eb] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md"
                    style={{ fontFamily: "var(--font-ui)" }}>
                    ×{count}
                  </span>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------
   OBRAZOVKA SKRIPTORIA / BALÍČKŮ (Packs Screen)
   ------------------------------------------------------------- */
function PacksScreen({
  state,
  onOpen,
  onGame,
}: {
  state: GameState;
  onOpen: () => void;
  onGame: (g: GameKind) => void;
}) {
  const remaining = Math.max(0, 10 - state.packsOpened);
  const hasBonus = state.bonusPacks.length > 0;
  const gamesLeft = Math.max(0, 10 - state.gamesPlayed);

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-[#2c1a0e]"
          style={{ fontFamily: "var(--font-display, Georgia, serif)" }}>
          Denní skriptorium: Pečeť kolofonů
        </h1>
        <p className="text-sm text-[#6b4c2a]" style={{ fontFamily: "var(--font-ui)" }}>
          Každý den pro vás mniši a univerzitní písaři připraví 10 balíčků autentických kolofonů.
        </p>
      </div>

      {/* POČÍTADLO DENNÍCH BALÍČKŮ */}
      <div className="grid grid-cols-2 gap-4 bg-white/70 border-2 border-[#d4b98a] rounded-xl p-4 text-center shadow-sm">
        <div>
          <span className="text-[11px] text-[#8a6540] uppercase tracking-wider block" style={{ fontFamily: "var(--font-ui)" }}>
            Denní balíčky
          </span>
          <strong className="text-2xl font-bold text-[#2c1a0e]"
            style={{ fontFamily: "var(--font-display, Georgia, serif)" }}>
            {state.packsOpened} <small className="text-xs text-[#8a6540]">/ 10</small>
          </strong>
          <div className="flex justify-center gap-1 mt-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full border ${
                  i < state.packsOpened
                    ? "bg-[#c8920a] border-[#f59e0b]"
                    : "bg-[#f0e8d0] border-[#d4b98a]"
                }`}
              />
            ))}
          </div>
        </div>

        <div>
          <span className="text-[11px] text-[#8a6540] uppercase tracking-wider block" style={{ fontFamily: "var(--font-ui)" }}>
            Písařské výzvy
          </span>
          <strong className="text-2xl font-bold text-[#2c1a0e]"
            style={{ fontFamily: "var(--font-display, Georgia, serif)" }}>
            {state.gamesPlayed} <small className="text-xs text-[#8a6540]">/ 10</small>
          </strong>
          <div className="flex justify-center gap-1 mt-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full border ${
                  i < state.gamesPlayed
                    ? "bg-[#2563eb] border-[#60a5fa]"
                    : "bg-[#f0e8d0] border-[#d4b98a]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* HLAVNÍ STŮL S PEČETÍ BALÍČKU */}
      <section className="sealed-pack-desk">
        <div className="max-w-md mx-auto space-y-4">
          <div
            onClick={remaining || hasBonus ? onOpen : undefined}
            className={`wax-seal-ceremony ${
              remaining || hasBonus ? "cursor-pointer" : "opacity-60 cursor-not-allowed"
            }`}
          >
            Q
          </div>

          <h2 className="text-2xl font-bold text-[#2c1a0e]"
            style={{ fontFamily: "var(--font-display, Georgia, serif)" }}>
            {remaining
              ? "Balíček neotevřených kolofonů"
              : hasBonus
              ? `Bonusový ${qualityLabel(state.bonusPacks[0])} balíček`
              : "Skriptorium pro dnešek odpočívá"}
          </h2>

          <p className="text-sm text-[#6b4c2a]" style={{ fontFamily: "var(--font-ui)" }}>
            {remaining
              ? "5 skrytých hlasů písařů čeká pod voskovou pečetí."
              : hasBonus
              ? "Vynikající výkon v minihře vám odemkl tento vzácný balíček."
              : gamesLeft
              ? "Splňte písařskou výzvu níže a získejte další balíček!"
              : "Vraťte se zítra za rozbřesku, až zapálíme nové svíce."}
          </p>

          <button
            onClick={onOpen}
            disabled={remaining === 0 && !hasBonus}
            className={`px-8 py-3 rounded-xl font-bold text-base shadow-xl transition transform cursor-pointer ${
              remaining || hasBonus
                ? "bg-gradient-to-b from-[#f59e0b] to-[#c8920a] hover:from-[#fbbf24] hover:to-[#d97706] text-white hover:-translate-y-0.5"
                : "bg-[#f0e8d0] text-[#b09060] border-2 border-[#d4b98a] cursor-not-allowed"
            }`}
            style={{ fontFamily: "var(--font-ui)" }}
          >
            {remaining || hasBonus ? "Rozpečetit balíček (5 karet)" : "Balíčky vyčerpány"}
          </button>
        </div>
      </section>

      {/* VÝZVY K ZÍSKÁNÍ DALŠÍCH BALÍČKŮ */}
      <div className="space-y-3 pt-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-[#2c1a0e] flex items-center gap-2"
            style={{ fontFamily: "var(--font-display, Georgia, serif)" }}>
            <Trophy size={18} className="text-[#c8920a]" /> Získejte další balíček splněním výzvy
          </h2>
          <span className="text-xs text-[#8a6540]" style={{ fontFamily: "var(--font-ui)" }}>
            {gamesLeft} z 10 pokusů k dispozici
          </span>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <button
            disabled={!gamesLeft}
            onClick={() => onGame("mood")}
            className="p-4 bg-white/80 hover:bg-white border-2 border-[#d4b98a] hover:border-[#16a34a] rounded-xl text-left transition space-y-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <div className="flex items-center gap-2 text-[#16a34a]">
              <Smile size={20} />
              <strong className="text-sm" style={{ fontFamily: "var(--font-display, Georgia, serif)" }}>Nálada písaře</strong>
            </div>
            <p className="text-xs text-[#6b4c2a]" style={{ fontFamily: "var(--font-ui)" }}>
              Poznáte, jak se písař při psaní cítil? (Snadná výzva)
            </p>
            <span className="text-[10px] text-[#14532d] bg-[#dcfce7] px-2 py-0.5 rounded font-bold block w-fit border border-[#86efac]"
              style={{ fontFamily: "var(--font-ui)" }}>
              Odměna: Standardní balíček
            </span>
          </button>

          <button
            disabled={!gamesLeft}
            onClick={() => onGame("cipher")}
            className="p-4 bg-white/80 hover:bg-white border-2 border-[#d4b98a] hover:border-[#2563eb] rounded-xl text-left transition space-y-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <div className="flex items-center gap-2 text-[#2563eb]">
              <KeyRound size={20} />
              <strong className="text-sm" style={{ fontFamily: "var(--font-display, Georgia, serif)" }}>Rozlušti kolofon</strong>
            </div>
            <p className="text-xs text-[#6b4c2a]" style={{ fontFamily: "var(--font-ui)" }}>
              Doplňte chybějící písmena v latinské formuli. (Střední výzva)
            </p>
            <span className="text-[10px] text-[#1e3a8a] bg-[#dbeafe] px-2 py-0.5 rounded font-bold block w-fit border border-[#93c5fd]"
              style={{ fontFamily: "var(--font-ui)" }}>
              Odměna: Vytříbený balíček (Rare+)
            </span>
          </button>

          <button
            disabled={!gamesLeft}
            onClick={() => onGame("paleo")}
            className="p-4 bg-white/80 hover:bg-white border-2 border-[#d4b98a] hover:border-[#9333ea] rounded-xl text-left transition space-y-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <div className="flex items-center gap-2 text-[#9333ea]">
              <Languages size={20} />
              <strong className="text-sm" style={{ fontFamily: "var(--font-display, Georgia, serif)" }}>Paleografický mistr</strong>
            </div>
            <p className="text-xs text-[#6b4c2a]" style={{ fontFamily: "var(--font-ui)" }}>
              Určete typ středověkého písma podle ukázky. (Expertní výzva)
            </p>
            <span className="text-[10px] text-[#581c87] bg-[#f3e8ff] px-2 py-0.5 rounded font-bold block w-fit border border-[#d8b4fe]"
              style={{ fontFamily: "var(--font-ui)" }}>
              Odměna: Mistrovský balíček (Epic+)
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   OBRAZOVKA ÚSPĚCHŮ A VÝZEV (Trophies Screen)
   ------------------------------------------------------------- */
function TrophiesScreen({ state, cards }: { state: GameState; cards: Colophon[] }) {
  const trophies = [
    ["first-spark", "První jiskra", "Otevřete svůj první denní balíček", "100 XP", "Q"],
    ["first-pack", "Lamač pečetí", "Objevte alespoň 5 různých kolofonů", "150 XP", "S"],
    ["collector", "Napříč staletími", "Získejte do sbírky 8 různých kodexů", "250 XP", "A"],
    ["streak", "Vytrvalý iluminátor", "Udržte 16denní herní sérii", "300 XP", "I"],
    ["unique", "Zlaté tajemství", "Získejte unikátní (Unique) kartu kolofonu", "500 XP", "G"],
  ];

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif font-bold text-[#ffd580]">Úspěchy a 16denní iluminace</h1>
        <p className="text-sm text-[#b3a18d]">
          Každý den přihlášení odhalí jeden dílek ze slavné středověké iluminace.
        </p>
      </div>

      {/* 16DENNÍ MOZAIKA */}
      <section className="bg-[#16120e] border border-[#3b2e21] rounded-2xl p-6 shadow-xl grid md:grid-cols-2 gap-6 items-center">
        <div className="space-y-3">
          <span className="text-xs uppercase font-sans font-bold text-[#ffd580] tracking-wider">
            Denní mozaika
          </span>
          <h2 className="text-2xl font-serif font-bold text-[#e8ded1]">Učený zajíc (The Learned Hare)</h2>
          <p className="text-xs text-[#a89887] leading-relaxed">
            Středověká iluminace z marginálií zobrazující zvířata v lidských rolích. Vraťte se každý
            den a odhalte další kousek.
          </p>
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs text-[#ffd580] font-sans font-bold">
              <span>Postup skládání</span>
              <span>{state.puzzle} z 16 fragmentů</span>
            </div>
            <div className="h-2.5 bg-[#0d0a08] rounded-full overflow-hidden border border-[#33271d]">
              <div
                className="h-full bg-gradient-to-r from-[#d4af37] to-[#ffd580]"
                style={{ width: `${(state.puzzle / 16) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Grafická mozaika */}
        <div className="relative aspect-square max-w-xs mx-auto w-full rounded-xl overflow-hidden border-2 border-[#4a3b2b] shadow-2xl bg-[#0a0806]">
          <img
            src="/illumination-rabbit.png"
            alt="Učený zajíc"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className={`border border-[#382b1f]/60 flex items-center justify-center font-mono text-xs font-bold transition-all duration-500 ${
                  i < state.puzzle
                    ? "bg-transparent text-transparent"
                    : "bg-[#18130f] text-[#736353]"
                }`}
              >
                {i >= state.puzzle ? i + 1 : ""}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEZNAM ODZNAKŮ / TROPHIES */}
      <div className="space-y-3">
        <h3 className="text-lg font-serif font-bold text-[#ffd580] flex items-center gap-2">
          <Award size={18} /> Písařské milníky
        </h3>

        <div className="space-y-2.5">
          {trophies.map(([id, title, desc, xp, initial]) => {
            const ownsUnique = cards.some(
              (card) => card.rarity === "Unique" && state.collection[card.id]
            );
            const earned =
              state.trophies.includes(id) ||
              (id === "collector" && Object.keys(state.collection).length >= 8) ||
              (id === "streak" && state.streak >= 16) ||
              (id === "unique" && ownsUnique);

            return (
              <article
                key={id}
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition ${
                  earned
                    ? "bg-[#18140f] border-[#d4af37]/60 shadow-md"
                    : "bg-[#130f0c] border-[#292017] opacity-60"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-serif font-bold text-xl border ${
                      earned
                        ? "bg-gradient-to-br from-[#d4af37] to-[#8c6d31] text-black border-[#ffd580]"
                        : "bg-[#201913] text-[#6d5e4f] border-[#382d22]"
                    }`}
                  >
                    {initial}
                  </div>
                  <div>
                    <strong
                      className={`block font-serif text-sm font-bold ${
                        earned ? "text-[#ffd580]" : "text-[#a89887]"
                      }`}
                    >
                      {title}
                    </strong>
                    <p className="text-xs text-[#8c7b6d]">{desc}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full font-sans ${
                      earned
                        ? "bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/40"
                        : "bg-[#241c14] text-[#8c7b6d]"
                    }`}
                  >
                    {earned ? "Splněno" : xp}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   OBRAZOVKA PROFILU PÍSAŘE (Profile Screen)
   ------------------------------------------------------------- */
function ProfileScreen({
  state,
  uniqueOwned,
  duplicates,
  isLive,
  totalCards,
  onReset,
  onSend,
  onSetAvatar,
}: {
  state: GameState;
  uniqueOwned: number;
  duplicates: number;
  isLive?: boolean;
  totalCards: number;
  onReset: () => void;
  onSend: () => void;
  onSetAvatar: (id: string) => void;
}) {
  const level = levelForXp(state.xp);
  const levelXp = state.xp % XP_PER_LEVEL;
  const rank =
    level >= 10
      ? "Mistr iluminátor skriptoria"
      : level >= 6
      ? "Tovaryš paleograf"
      : "Učedník skriptoria";

  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto">
      {/* HLAVIČKA PROFILU */}
      <section className="bg-[#16120e] border border-[#3b2e21] rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#73541f] border-2 border-[#ffd580] flex items-center justify-center font-serif font-bold text-3xl text-black shadow-lg shrink-0">
          {state.avatarArt ? (
            <img
              src="/illumination-rabbit.png"
              alt=""
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            "O"
          )}
        </div>

        <div className="flex-1 space-y-2">
          <h2 className="text-2xl font-serif font-bold text-[#ffd580]">Písař Olivia</h2>
          <p className="text-xs text-[#a89887] font-serif">
            {rank} • Úroveň {level}
          </p>

          <div className="space-y-1">
            <div className="h-2.5 bg-[#0a0806] rounded-full overflow-hidden border border-[#33271d]">
              <div
                className="h-full bg-gradient-to-r from-[#d4af37] to-[#ffd580]"
                style={{ width: `${(levelXp / XP_PER_LEVEL) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-[#8c7b6d] font-sans">
              <span>{levelXp} / {XP_PER_LEVEL} XP</span>
              <span>Zbývá {XP_PER_LEVEL - levelXp} XP do úrovně {level + 1}</span>
            </div>
          </div>
        </div>
      </section>

      {/* STATISTIKY SBÍRKY */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-4 bg-[#16120e] border border-[#33281d] rounded-xl">
          <strong className="text-2xl font-serif font-bold text-[#ffd580] block">
            {uniqueOwned}
          </strong>
          <span className="text-[11px] text-[#8c7b6d] uppercase font-sans">Karet ve sbírce</span>
        </div>
        <div className="p-4 bg-[#16120e] border border-[#33281d] rounded-xl">
          <strong className="text-2xl font-serif font-bold text-[#ea580c] block">
            {state.streak}
          </strong>
          <span className="text-[11px] text-[#8c7b6d] uppercase font-sans">Dní v řadě</span>
        </div>
        <div className="p-4 bg-[#16120e] border border-[#33281d] rounded-xl">
          <strong className="text-2xl font-serif font-bold text-[#2563eb] block">
            {duplicates}
          </strong>
          <span className="text-[11px] text-[#8c7b6d] uppercase font-sans">Duplikátů</span>
        </div>
      </div>

      {/* STAV SPOJENÍ S FF UK */}
      <section className="bg-[#16120e] border border-[#33281d] rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              isLive ? "bg-[#4ade80] shadow-[0_0_8px_#4ade80]" : "bg-[#f59e0b]"
            }`}
          />
          <div>
            <h4 className="font-serif font-bold text-sm text-[#e8ded1]">
              {isLive ? "Připojeno k univerzitní Supabase (FF UK)" : "Lokální archiv"}
            </h4>
            <p className="text-[11px] text-[#8c7b6d]">
              {isLive
                ? `${totalCards} publikovaných karet streamovaných přímo z univerzitního cloudu.`
                : "Používá se lokální kopie kodexů."}
            </p>
          </div>
        </div>
        <span className="text-xs text-[#ffd580] font-sans font-bold bg-[#292017] px-2.5 py-1 rounded-lg border border-[#ffd580]/30">
          {isLive ? "Online" : "Záloha"}
        </span>
      </section>

      {/* SPRÁVA A ODKAZ DO STUDIA */}
      <div className="space-y-2 pt-4 border-t border-[#2e241c]">
        <a
          href="/admin"
          className="w-full py-3 bg-[#241c14] hover:bg-[#33271d] border border-[#d4af37]/60 hover:border-[#ffd580] text-[#ffd580] rounded-xl font-serif font-bold text-center block transition shadow-md"
        >
          Přejít do Quilldrop Studia (Správa a ořezávání rukopisů)
        </a>

        <button
          onClick={onReset}
          className="w-full py-2.5 text-xs text-[#8c7b6d] hover:text-[#e8ded1] flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <RotateCcw size={12} /> Obnovit herní postup do výchozího stavu
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   DETAIL KARTY (Responzivní dialogové okno s rukopisem)
   ------------------------------------------------------------- */
function CardDetail({
  card,
  count,
  onClose,
}: {
  card: Colophon;
  count: number;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="card-detail-dialog p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          className="card-detail-close"
          onClick={onClose}
          aria-label="Zavřít detail karty"
        >
          ×
        </button>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* LEVÝ SLOUPEC: Velký výřez rukopisu v poměru 4:3 */}
          <div className="space-y-3">
            <div className="relative aspect-4/3 w-full bg-[#ede0ab] rounded-xl overflow-hidden border-2 border-[#b08a50] shadow-2xl flex items-center justify-center">
              <ColophonImage card={card} alt={card.title} />
              <span className="absolute bottom-2 right-2 bg-black/75 text-white text-xs font-mono px-2 py-0.5 rounded">
                {card.year}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs text-[#8a6540]" style={{ fontFamily: "var(--font-ui)" }}>
              <span>Folium: {card.locus}</span>
              <a
                href={card.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#c8920a] hover:underline inline-flex items-center gap-1 font-bold"
              >
                <span>Celý sken na FF UK</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* PRAVÝ SLOUPEC: Texty, překlad a kodikologická metadata */}
          <div className="space-y-4">
            <div>
              <span className={`rarity-pill ${card.rarity}`}>{card.rarity}</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2c1a0e] mt-1.5 leading-tight"
                style={{ fontFamily: "var(--font-display, Georgia, serif)" }}>
                {card.title}
              </h2>
            </div>

            {/* Latinský originál v citaci */}
            <div className="bg-[#fef3c7] border-l-4 border-[#c8920a] p-3.5 rounded-r-lg">
              <p className="italic text-sm text-[#4a3318] leading-relaxed"
                style={{ fontFamily: "Georgia, serif" }}>
                "{card.quote}"
              </p>
            </div>

            {/* Český překlad */}
            {card.translation && (
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8a6540] block mb-1"
                  style={{ fontFamily: "var(--font-ui)", letterSpacing: "0.8px" }}>
                  Český překlad
                </span>
                <p className="text-xs text-[#4a3318] leading-relaxed" style={{ fontFamily: "var(--font-ui)" }}>
                  {card.translation}
                </p>
              </div>
            )}

            {/* Tabulka metadat */}
            <dl className="divide-y divide-[#e5d5b8] border-y border-[#e5d5b8] text-xs py-1" style={{ fontFamily: "var(--font-ui)" }}>
              <div className="py-1.5 flex justify-between gap-4">
                <dt className="text-[#8a6540]">Písař</dt>
                <dd className="text-right font-bold text-[#2c1a0e]"
                  style={{ fontFamily: "var(--font-display, Georgia, serif)" }}>{card.scribe}</dd>
              </div>
              <div className="py-1.5 flex justify-between gap-4">
                <dt className="text-[#8a6540]">Místo vzniku</dt>
                <dd className="text-right text-[#2c1a0e]">{card.place}</dd>
              </div>
              <div className="py-1.5 flex justify-between gap-4">
                <dt className="text-[#8a6540]">Rukopis / signatura</dt>
                <dd className="text-right text-[#6b4c2a] max-w-[240px] truncate" title={card.manuscript}>
                  {card.manuscript}
                </dd>
              </div>
              {card.rarityReason && (
                <div className="py-1.5 flex justify-between gap-4">
                  <dt className="text-[#8a6540]">Důvod rarity</dt>
                  <dd className="text-right text-[#c8920a] font-bold max-w-[240px]">{card.rarityReason}</dd>
                </div>
              )}
              <div className="py-1.5 flex justify-between gap-4">
                <dt className="text-[#8a6540]">Vlastněných kopií</dt>
                <dd className="text-right font-bold text-[#2563eb]">×{count}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   ODHALENÍ ROZPEČETĚNÉHO BALÍČKU (Pack Reveal)
   ------------------------------------------------------------- */
function PackReveal({
  card,
  position,
  total,
  quality,
  shown,
  onReveal,
  onNext,
}: {
  card: Colophon;
  position: number;
  total: number;
  quality: PackQuality;
  shown: boolean;
  onReveal: () => void;
  onNext: () => void;
}) {
  const auraClass = `aura-${card.rarity.toLowerCase()}`;
  const isTension = !shown && (card.rarity === "Legendary" || card.rarity === "Unique");

  // Glitter particles for the reveal
  const glitters = Array.from({ length: 18 }, (_, i) => ({
    x: `${8 + Math.random() * 84}%`,
    y: `${5 + Math.random() * 80}%`,
    size: `${10 + Math.random() * 14}px`,
    delay: `${i * 0.06}s`,
    dx: `${(Math.random() - 0.5) * 140}px`,
    dy: `${-60 - Math.random() * 120}px`,
  }));

  // Rarity burst rays
  const rays = Array.from({ length: 24 }, (_, i) => ({
    rotate: `${(i / 24) * 360}deg`,
  }));

  return (
    <div
      className={`fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-4 ${shown ? `${auraClass} is-revealed` : auraClass} ${isTension ? "is-tension" : ""}`}
      style={{ perspective: "900px" }}
    >
      {/* Animovaný obsah na pozadí */}
      {shown && (
        <>
          {/* Flash přes obrazovku */}
          <div className="reveal-flash" />

          {/* Světelné šachty */}
          <div className="light-shafts">
            {Array.from({ length: 5 }).map((_, i) => <i key={i} />)}
          </div>

          {/* Glitter bouře */}
          <div className="glitter-storm">
            {glitters.map((g, i) => (
              <i
                key={i}
                style={{
                  "--x": g.x,
                  "--y": g.y,
                  "--size": g.size,
                  "--delay": g.delay,
                  "--dx": g.dx,
                  "--dy": g.dy,
                  "--i": i,
                } as React.CSSProperties}
              >
                ✦
              </i>
            ))}
          </div>

          {/* Rarity burst paprsky */}
          <div className="rarity-burst absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            {rays.map((r, i) => (
              <i
                key={i}
                style={{
                  position: "absolute",
                  transformOrigin: "bottom center",
                  transform: `rotate(${r.rotate})`,
                }}
              />
            ))}
          </div>
        </>
      )}

      <div className="flex flex-col items-center space-y-6 max-w-sm w-full text-center relative z-10">
        <div className="flex justify-between items-center w-full text-xs font-bold"
          style={{ fontFamily: "var(--font-ui)", color: shown ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.7)" }}>
          <span>{qualityLabel(quality)} balíček</span>
          <span>Karta {position} z {total}</span>
        </div>

        {!shown ? (
          /* Zadní strana karty */
          <div
            onClick={onReveal}
            className={`card-back w-64 rounded-2xl border-2 border-white/30 flex flex-col items-center justify-center p-6 shadow-2xl cursor-pointer hover:scale-105 transition transform group ${isTension ? "is-tension" : ""}`}
            style={{ height: "336px" }}
          >
            <div className="w-20 h-20 rounded-full border-2 border-white/50 flex items-center justify-center text-4xl font-bold text-white/90 mb-4 group-hover:rotate-6 transition"
              style={{ fontFamily: "var(--font-display, Georgia, serif)" }}>
              Q
            </div>
            <span className="font-bold text-sm text-white/90"
              style={{ fontFamily: "var(--font-display, Georgia, serif)" }}>
              Klepněte pro odhalení
            </span>
            <small className="text-[10px] text-white/55 mt-1" style={{ fontFamily: "var(--font-ui)" }}>
              {isTension ? "Něco vzácného se probouzí..." : "Inkoust se probouzí..."}
            </small>
          </div>
        ) : (
          /* Odhalená karta */
          <div className={`reveal-card-stage reveal-card`}>
            <div className="flex justify-between items-center text-[10px] mb-2">
              <span className={`rarity-pill ${card.rarity}`}>{card.rarity}</span>
              <span className="font-bold text-[#c8920a]"
                style={{ fontFamily: "var(--font-display, Georgia, serif)" }}>{card.sigil}</span>
            </div>

            <div className="w-full aspect-4/3 rounded-xl overflow-hidden border border-[#d4b98a] mb-3 relative">
              <ColophonImage card={card} alt={card.title} />
              <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-mono px-1 rounded">
                {card.year}
              </span>
            </div>

            <h3 className="font-bold text-lg text-[#2c1a0e] leading-tight"
              style={{ fontFamily: "var(--font-display, Georgia, serif)" }}>
              {card.title}
            </h3>
            <p className="italic text-xs text-[#6b4c2a] mt-2 line-clamp-2"
              style={{ fontFamily: "Georgia, serif" }}>
              "{card.quote}"
            </p>
            <p className="text-[10px] text-[#8a6540] mt-1" style={{ fontFamily: "var(--font-ui)" }}>
              {card.scribe} • {card.place}
            </p>

            <button
              onClick={onNext}
              className="w-full mt-4 bg-gradient-to-b from-[#f59e0b] to-[#c8920a] hover:brightness-110 text-white font-bold py-2 rounded-xl text-xs transition cursor-pointer"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              {position === total ? "Uložit do sbírky kodexů" : "Odhalit další kartu →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   MODÁL PÍSAŘSKÉ MINIHRY (Game Modal)
   ------------------------------------------------------------- */
function GameModal({
  kind,
  cards,
  answer,
  step,
  setStep,
  onClose,
  onAnswer,
}: {
  kind: GameKind;
  cards: Colophon[];
  answer: string | null;
  step: number;
  setStep: (n: number) => void;
  onClose: () => void;
  onAnswer: (correct: boolean) => void;
}) {
  const challengeCard =
    cards[kind === "paleo" ? 0 : kind === "cipher" ? 1 : 2] || cards[0] || COLOPHONS[0];

  const data = {
    mood: {
      title: "Nálada písaře",
      intro: "Jak se cítil tento písař při psaní tohoto kolofonu?",
      quote:
        "Kniha je konečně dopsána. Záda mě bolí, zrak slábne a teď už chci jen víno a odpočinek.",
      options: [
        ["😌", "Klidný a spokojený"],
        ["😩", "Naprosto vyčerpaný"],
        ["😡", "Rozzuřený na zadavatele"],
      ],
      right: 1,
    },
    cipher: {
      title: "Rozlušti kolofon",
      intro: "Doplňte chybějící samohlásky do latinské formule:",
      quote: "M_N_S  M_ _  D_L_T",
      options: [
        ["Manus mea dolet", "Ruka mě bolí"],
        ["Monas mea delet", "Můj mnich maže"],
        ["Minus mio dalet", "Falešná stopa"],
      ],
      right: 0,
    },
    paleo: {
      title: "Paleografický mistr",
      intro: "Kterým písmem je napsána tato formule?",
      quote: "𝔔𝔲𝔦 𝔰𝔠𝔯𝔦𝔭𝔰𝔦𝔱 𝔰𝔠𝔯𝔦𝔟𝔞𝔱",
      options: [
        ["Karolinská minuskula", "cca 800–1100"],
        ["Gotická textura (Textualis)", "cca 1200–1500"],
        ["Humanistické písmo", "cca 1400–1600"],
      ],
      right: 1,
    },
  }[kind];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="card-detail-dialog p-6 max-w-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <button className="card-detail-close" onClick={onClose}>
          ×
        </button>

        <div className="space-y-4 text-center">
          <span className="text-[10px] uppercase tracking-wider font-sans font-bold text-[#ffd580]">
            Výzva o bonusový balíček
          </span>
          <h2 className="text-2xl font-serif font-bold text-[#ffd580]">{data.title}</h2>
          <p className="text-xs text-[#a89887]">{data.intro}</p>

          <div className="w-full aspect-4/3 rounded-xl overflow-hidden border border-[#3b2e21] relative max-w-xs mx-auto">
            <ColophonImage card={challengeCard} alt="" />
          </div>

          <blockquote className="bg-[#120f0c] p-3 rounded-lg border-l-4 border-[#d4af37] font-serif italic text-sm text-[#e8ded1]">
            “{data.quote}”
          </blockquote>

          <div className="space-y-2 pt-2">
            {data.options.map((opt, i) => (
              <button
                key={i}
                disabled={Boolean(answer)}
                onClick={() => onAnswer(i === data.right)}
                className={`w-full p-3 rounded-xl border text-left transition font-serif cursor-pointer flex items-center justify-between ${
                  answer
                    ? i === data.right
                      ? "bg-[#14381b] border-[#4ade80] text-[#86efac]"
                      : "bg-[#16120e] border-[#2e241b] opacity-40"
                    : "bg-[#1f1913] hover:bg-[#2b221a] border-[#3d3126] text-[#e8ded1]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{opt[0]}</span>
                  <span className="text-xs font-bold">{opt[1]}</span>
                </div>
                {answer && i === data.right && <Check size={16} className="text-[#4ade80]" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   MODÁL HISTORICKÉ MAPY (Map Modal)
   ------------------------------------------------------------- */
function MapModal({
  state,
  cards,
  onClose,
}: {
  state: GameState;
  cards: Colophon[];
  onClose: () => void;
}) {
  const owned = cards.filter((c) => state.collection[c.id]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="card-detail-dialog p-6 max-w-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <button className="card-detail-close" onClick={onClose}>
          ×
        </button>

        <div className="space-y-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-sans font-bold text-[#ffd580]">
              Evropská skriptoria
            </span>
            <h2 className="text-2xl font-serif font-bold text-[#ffd580]">Mapa nálezů kolofonů</h2>
            <p className="text-xs text-[#a89887]">
              Místa vzniku rukopisů evidovaná v databázi Heurist FF UK.
            </p>
          </div>

          <div className="bg-[#120f0c] border border-[#3b2e21] rounded-xl p-6 text-center space-y-3">
            <MapPinned size={48} className="mx-auto text-[#d4af37]" />
            <p className="text-sm font-serif text-[#ffd580]">
              Zastoupená středověká skriptoria a knihovny:
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              {[
                "Praha",
                "Olomouc",
                "Bologna",
                "Vídeň",
                "Krakov",
                "Heidelberg",
                "Wrocław",
                "Paříž",
              ].map((city) => (
                <span
                  key={city}
                  className="px-3 py-1 bg-[#1e1711] border border-[#3b2e21] rounded-lg text-xs text-[#e8ded1] font-serif"
                >
                  ✦ {city}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-[#8c7b6d] pt-2">
              Plně interaktivní geografická mapa s přesnými souřadnicemi je připravena pro Krok 2.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   MODÁL ZVÝŠENÍ ÚROVNĚ (Level Up Modal)
   ------------------------------------------------------------- */
function LevelUpModal({ level, onClose }: { level: number; onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="level-up-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="level-rays">
          {Array.from({ length: 6 }).map((_, i) => <i key={i} />)}
        </div>
        <Sparkles size={40} className="mx-auto text-[#c8920a] animate-bounce relative z-10" />
        <span className="text-xs uppercase font-bold text-[#8a6540] tracking-wider relative z-10"
          style={{ fontFamily: "var(--font-ui)" }}>
          Osvícení písaře
        </span>
        <div className="level-seal relative z-10">
          <span>{level}</span>
        </div>
        <h2 className="text-4xl font-bold text-[#2c1a0e] relative z-10"
          style={{ fontFamily: "var(--font-display, Georgia, serif)" }}>
          Úroveň {level}
        </h2>
        <p className="text-xs text-[#6b4c2a] relative z-10" style={{ fontFamily: "var(--font-ui)" }}>
          Vaše znalosti kodexů vzrostly. Do vaší truhly byl vložen{" "}
          <strong className="text-[#c8920a]">Mistrovský balíček</strong>!
        </p>
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gradient-to-b from-[#f59e0b] to-[#c8920a] hover:brightness-110 text-white font-bold rounded-xl text-sm transition cursor-pointer relative z-10"
          style={{ fontFamily: "var(--font-ui)" }}
        >
          Převzít odměnu
        </button>
      </div>
    </div>
  );
}
