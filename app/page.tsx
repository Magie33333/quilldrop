"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useRef, useMemo } from "react";
import { Award, Flame, Gem, Grid3X3, Home as HomeIcon, KeyRound, Languages, LibraryBig, LockKeyhole, MapPinned, PenTool, Puzzle, RotateCcw, ScrollText, Send, Smile, Sparkles, Trophy, UserPlus, UserRound, type LucideIcon } from "lucide-react";
import { HEURIST_COLOPHONS } from "./data/colophons.generated";
import { supabase } from "@/lib/supabase";
import { DEFAULT_QUESTIONS, type QuestionData } from "./data/questions.generated";
import { SCRIPTORIA_PLACES, getScriptoriumForCard, type ScriptoriumPlace } from "./data/scriptoria";

type Tab = "home" | "packs" | "collection" | "trophies" | "profile";
type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Unique";
type GameKind = "mood" | "cipher" | "paleo";
type PackQuality = "standard" | "refined" | "masterwork";

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
  { id: "rabbit-scribe", title: "The Learned Hare", source: "/illumination-rabbit.png" },
];

const COLOPHONS: Colophon[] = HEURIST_COLOPHONS.map(card => ({ ...card })) as Colophon[];

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
  { id: "packs", label: "Balíčky", icon: ScrollText },
  { id: "collection", label: "Sbírka", icon: LibraryBig },
  { id: "trophies", label: "Výzvy", icon: Trophy },
  { id: "profile", label: "Profil", icon: UserRound },
];

const today = () => new Date().toISOString().slice(0, 10);
const XP_PER_LEVEL = 100;
const levelForXp = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;
const qualityLabel = (quality: PackQuality) => {
  if (quality === "masterwork") return "Mistrovský";
  if (quality === "refined") return "Vytříbený";
  return "Standardní";
};

const formatPacksCount = (n: number): string => {
  if (n === 1) return "1 balíček";
  if (n >= 2 && n <= 4) return `${n} balíčky`;
  return `${n} balíčků`;
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

function loadState(): GameState {
  if (typeof window === "undefined") return INITIAL_STATE;
  try {
    const saved = JSON.parse(localStorage.getItem("quilldrop-state") || "null");
    const hydrated: GameState = { ...INITIAL_STATE, ...(saved || {}), bonusPacks: saved?.bonusPacks || [], gallery: saved?.gallery || [] };
    const hasCurrentCards = Object.keys(hydrated.collection).some(id => COLOPHONS.some(card => String(card.id) === String(id)));
    if (!hasCurrentCards) hydrated.collection = { ...INITIAL_STATE.collection };
    const dailyReset = hydrated.lastPlayed === today() ? hydrated : { ...hydrated, packsOpened: 0, gamesPlayed: 0, bonusPacks: [], lastPlayed: today() };
    if (dailyReset.lastLoginDate === today()) return dailyReset;
    const nextPuzzle = Math.min(16, dailyReset.puzzle + 1);
    const completedId = nextPuzzle === 16 ? ILLUMINATIONS[0].id : null;
    return {
      ...dailyReset,
      puzzle: nextPuzzle,
      lastLoginDate: today(),
      streak: dailyReset.streak + 1,
      gallery: completedId && !dailyReset.gallery.includes(completedId) ? [...dailyReset.gallery, completedId] : dailyReset.gallery,
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

        // Fetch live educational questions for mini-games
        const { data: qData, error: qError } = await supabase
          .from("game_questions")
          .select("*")
          .eq("is_active", true);

        if (!qError && qData && qData.length > 0) {
          const loadedQuestions: QuestionData[] = qData.map((q: any) => ({
            id: q.id,
            card_id: q.card_id,
            game_kind: q.game_kind,
            title: q.title,
            intro: q.intro,
            quote: q.quote,
            options: Array.isArray(q.options) ? q.options : [],
            correct_index: Number(q.correct_index) || 0,
            explanation: q.explanation || undefined,
            hint: q.hint || undefined,
            difficulty: q.difficulty || "medium",
            is_active: q.is_active,
          }));
          setQuestions(loadedQuestions);
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

  const openPack = () => {
    const usingBonus = state.packsOpened >= 10;
    if (usingBonus && !state.bonusPacks.length) {
      setToast(state.gamesPlayed >= 10 ? "Všechny dnešní balíčky i minihry jsou vyčerpány. Přijďte zítra." : "Denní balíčky jsou vyčerpány – získejte další splněním výzvy.");
      return;
    }
    const quality: PackQuality | "daily" = usingBonus ? state.bonusPacks[0] : "daily";
    const drawn = Array.from({ length: 5 }, () => chooseCard(quality));
    setOpened(drawn);
    setReveal(0);
    setCardShown(false);
    setPackQuality(quality === "daily" ? "standard" : quality);
    const nextCollection = { ...state.collection };
    drawn.forEach(card => { nextCollection[card.id] = (nextCollection[card.id] || 0) + 1; });
    const nextTrophies = [...state.trophies];
    if (!nextTrophies.includes("first-pack")) nextTrophies.push("first-pack");
    const nextLevel = levelForXp(state.xp + 25);
    if (nextLevel > levelForXp(state.xp)) setPendingPackLevel(nextLevel);
    setState(s => withXpReward({ ...s, packsOpened: usingBonus ? s.packsOpened : s.packsOpened + 1, bonusPacks: usingBonus ? s.bonusPacks.slice(1) : s.bonusPacks, collection: nextCollection, trophies: nextTrophies }, 25));
  };

  const finishReveal = () => {
    if (!opened) return;
    if (reveal < opened.length - 1) { setReveal(r => r + 1); setCardShown(false); }
    else {
      setOpened(null);
      if (pendingPackLevel) { setLevelUp(pendingPackLevel); setPendingPackLevel(null); }
      else setToast("Pět nových karet bylo uloženo do vaší sbírky!");
    }
  };

  const startGame = (kind: GameKind) => {
    if (state.gamesPlayed >= 10) {
      setToast("Dnešních 10 výzev jste již dokončili. Vraťte se zítra za svítání.");
      return;
    }
    const pool = questions.filter(q => q.game_kind === kind);
    const chosen = pool.length > 0
      ? pool[Math.floor(Math.random() * pool.length)]
      : DEFAULT_QUESTIONS.find(q => q.game_kind === kind) || DEFAULT_QUESTIONS[0];
    setActiveQuestion(chosen);
    setGame(kind);
    setGameStep(0);
    setAnswer(null);
  };

  const finishGame = (correct: boolean) => {
    setAnswer(correct ? "correct" : "wrong");
    const quality: PackQuality = game === "paleo" ? "masterwork" : game === "cipher" ? "refined" : "standard";
    if (correct) {
      const earnedXp = quality === "masterwork" ? 90 : quality === "refined" ? 60 : 35;
      const nextLevel = levelForXp(state.xp + earnedXp);
      setState(s => withXpReward({ ...s, gamesPlayed: s.gamesPlayed + 1, bonusPacks: [...s.bonusPacks, quality], coins: s.coins + 20 }, earnedXp));
      if (nextLevel > levelForXp(state.xp)) {
        window.setTimeout(() => setLevelUp(nextLevel), activeQuestion?.explanation ? 3200 : 1300);
      } else {
        setToast(`Správně! ${qualityLabel(quality)} balíček čeká ve vaší pokladnici.`);
      }
    } else {
      setState(s => ({ ...s, gamesPlayed: s.gamesPlayed + 1 }));
      setToast(`Pokus využit — dnes zbývá ${Math.max(0, 9 - state.gamesPlayed)} výzev.`);
    }
    const delay = correct && activeQuestion?.explanation ? 3200 : 1400;
    setTimeout(() => {
      setGame(null);
      setActiveQuestion(null);
      setAnswer(null);
      setGameStep(0);
    }, delay);
  };

  const resetDemo = () => {
    setState(INITIAL_STATE);
    setToast("Váš herní postup byl úspěšně resetován.");
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
        />

        <div className="scroll-area">
          {tab === "home" && (
            <HomeScreen
              state={state}
              cards={cards}
              uniqueOwned={uniqueOwned}
              totalCards={cards.length}
              onPacks={() => setTab("packs")}
              onCollection={() => setTab("collection")}
              onMap={() => setShowMap(true)}
              onGallery={() => setTab("profile")}
              onGame={startGame}
              onDetail={setDetail}
            />
          )}
          {tab === "packs" && <PacksScreen state={state} onOpen={openPack} onGame={startGame} />}
          {tab === "collection" && <CollectionScreen state={state} cards={cards} filter={filter} setFilter={setFilter} onDetail={setDetail} />}
          {tab === "trophies" && <TrophiesScreen state={state} cards={cards} />}
          {tab === "profile" && <ProfileScreen state={state} uniqueOwned={uniqueOwned} duplicates={duplicates} isLive={isLive} onReset={resetDemo} onSend={() => setToast(duplicates ? "Duplikát byl odeslán kolegovi do skriptoria!" : "Nejprve musíte vlastnit duplicitní kartu.")} onSetAvatar={(id) => { setState(s => ({ ...s, avatarArt: id })); setToast("Portrét písaře byl aktualizován."); }} />}
        </div>

        <nav className="bottom-nav" aria-label="Main navigation">
          {NAV.map(item => { const Icon = item.icon; return <button key={item.id} className={`${tab === item.id ? "active" : ""} ${item.id === "packs" ? "primary" : ""}`} onClick={() => setTab(item.id)} aria-label={item.label}><span><Icon size={21} strokeWidth={1.8} /></span><small>{item.label}</small></button>; })}
        </nav>

        {detail && <CardDetail card={detail} count={state.collection[detail.id] || 0} onClose={() => setDetail(null)} />}
        {opened && <PackReveal key={`${reveal}-${cardShown}`} card={opened[reveal]} position={reveal + 1} total={opened.length} quality={packQuality} shown={cardShown} onReveal={() => setCardShown(true)} onNext={finishReveal} />}
        {game && activeQuestion && (
          <GameModal
            kind={game}
            question={activeQuestion}
            cards={cards}
            answer={answer}
            step={gameStep}
            setStep={setGameStep}
            onClose={() => { setGame(null); setActiveQuestion(null); setAnswer(null); setGameStep(0); }}
            onAnswer={finishGame}
          />
        )}
        {showMap && (
          <MapModal
            state={state}
            cards={cards}
            onClose={() => setShowMap(false)}
            onDetail={(card) => { setShowMap(false); setDetail(card); }}
          />
        )}
        {levelUp && <LevelUpModal level={levelUp} onClose={() => setLevelUp(null)} />}
        {toast && <div className="toast" role="status">{toast}</div>}
      </section>
    </main>
  );
}

function StatusBar({
  state,
  tab,
  setTab,
  uniqueOwned,
  totalCards,
}: {
  state: GameState;
  isLive?: boolean;
  tab: Tab;
  setTab: (t: Tab) => void;
  uniqueOwned: number;
  totalCards: number;
}) {
  return (
    <header className="status-bar">
      <div
        className="brand-lockup"
        onClick={() => setTab("home")}
        style={{ cursor: "pointer" }}
        title="Quilldrop: Návrat do skriptoria"
      >
        <img src="/quilldrop-logo.png" alt="Quilldrop" />
      </div>

      <nav className="desktop-nav" aria-label="Hlavní navigace">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              className={isActive ? "active" : ""}
              onClick={() => setTab(item.id)}
            >
              <Icon size={15} />
              <span>{item.label}</span>
              {item.id === "collection" && (
                <span className="nav-count">{uniqueOwned}/{totalCards}</span>
              )}
              {item.id === "packs" && state.packsOpened < 10 && (
                <span className="nav-badge">{10 - state.packsOpened}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="stats">
        <span title="Dní v řadě bez přerušení" aria-label={`${state.streak} day streak`}><Flame size={14} /> <b>{state.streak}</b></span>
        <span title="16denní iluminace" aria-label={`${state.puzzle} of 16 daily illumination fragments`}><Puzzle size={14} /> <b>{state.puzzle}/16</b></span>
        <span title="Zkušenostní body (XP)" aria-label={`${state.xp} experience points`}><Sparkles size={14} /> <b>{state.xp}</b></span>
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
  onPacks,
  onCollection,
  onMap,
  onGallery,
  onGame,
  onDetail,
}: {
  state: GameState;
  cards: Colophon[];
  uniqueOwned: number;
  totalCards: number;
  onPacks: () => void;
  onCollection: () => void;
  onMap: () => void;
  onGallery: () => void;
  onGame: (g: GameKind) => void;
  onDetail: (c: Colophon) => void;
}) {
  const progressPercent = totalCards > 0 ? Math.round((uniqueOwned / totalCards) * 100) : 0;
  const remaining = Math.max(0, 10 - state.packsOpened);
  const hasBonus = state.bonusPacks.length > 0;
  const gamesLeft = Math.max(0, 10 - state.gamesPlayed);

  const showcaseCards = useMemo(() => {
    const owned = cards.filter(c => state.collection[c.id]);
    if (owned.length >= 6) return owned.slice(0, 6);
    const unowned = cards.filter(c => !state.collection[c.id]);
    return [...owned, ...unowned].slice(0, 6);
  }, [cards, state.collection]);

  return (
    <div className="screen home-screen">
      <section className="welcome-panel">
        <div>
          <p className="eyebrow">Středověké skriptorium</p>
          <h1>Co dnes vydají okraje kodexů?</h1>
          <p>Otevřete novou várku hlasů písařů, stížností na bolavé ruce i slavnostních přípisů ze starých rukopisů.</p>
        </div>
        <div className="scribe-medallion"><PenTool size={34} strokeWidth={1.45} /></div>
      </section>

      <div className="home-hero-grid">
        <section className="home-hero-card home-hero-pack">
          <div>
            <div className="home-pack-header">
              <span>{hasBonus && remaining === 0 ? "Připravená odměna" : "Denní příděl balíčků"}</span>
              <span className="home-pack-badge">
                {remaining > 0 ? formatPacksCount(remaining) : hasBonus ? `${formatPacksCount(state.bonusPacks.length)} v pokladnici` : "Vyčerpáno"}
              </span>
            </div>
            <div className="home-pack-body">
              <div className="home-pack-seal" aria-hidden="true">Q</div>
              <div className="home-pack-info">
                <h2>{remaining ? "Balíček ze skriptoria" : hasBonus ? `${qualityLabel(state.bonusPacks[0])} balíček` : "Skriptorium odpočívá"}</h2>
                <p>
                  {remaining
                    ? "Pět skrytých hlasů písařů čeká pod voskovou pečetí."
                    : hasBonus
                    ? "Získaná odměna z písařské výzvy čeká na rozpečetění."
                    : gamesLeft
                    ? "Splňte písařskou výzvu vedle a získejte další balíček!"
                    : "Vraťte se zítra za rozbřesku, až zapálíme nové svíce."}
                </p>
              </div>
            </div>
          </div>
          <button className="illuminated-button" onClick={onPacks} style={{ width: "100%", justifyContent: "center" }}>
            {remaining || hasBonus ? "Rozpečetit balíček (5 karet)" : "Přejít do pokladnice"} <span>→</span>
          </button>
        </section>

        <section className="home-quests-box">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <h3>Písařské výzvy dne</h3>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--blue)" }}>{gamesLeft}/10 k dispozici</span>
          </div>
          <p>Splňte rychlou výzvu a získejte bonusový balíček kolofonů do pokladnice.</p>
          <div className="home-quests-list">
            <button className="home-quest-btn" disabled={!gamesLeft} onClick={() => onGame("mood")}>
              <span className="home-quest-icon"><Smile size={18} /></span>
              <div className="home-quest-info">
                <strong>Nálada písaře</strong>
                <small>Rychlá intuice · Snadná výzva</small>
              </div>
              <span className="home-quest-reward">Standardní balíček →</span>
            </button>
            <button className="home-quest-btn" disabled={!gamesLeft} onClick={() => onGame("cipher")}>
              <span className="home-quest-icon"><KeyRound size={18} /></span>
              <div className="home-quest-info">
                <strong>Rozlušti kolofon</strong>
                <small>Doplňte chybějící litery · Střední</small>
              </div>
              <span className="home-quest-reward">Vytříbený (Rare+) →</span>
            </button>
            <button className="home-quest-btn" disabled={!gamesLeft} onClick={() => onGame("paleo")}>
              <span className="home-quest-icon"><Languages size={18} /></span>
              <div className="home-quest-info">
                <strong>Paleografický mistr</strong>
                <small>Určete středověké písmo · Expertní</small>
              </div>
              <span className="home-quest-reward">Mistrovský (Epic+) →</span>
            </button>
          </div>
        </section>
      </div>

      <section className="home-showcase-section">
        <div className="showcase-header">
          <div>
            <h2>{uniqueOwned > 0 ? "Výběr z vašeho archivu" : "Ukázka kolofonů k objevení"}</h2>
            <small style={{ color: "#765228" }}>{uniqueOwned > 0 ? "Naposledy prozkoumané a odemčené iluminované karty" : "Rozpečeťte balíček a odhalte první rukopisy"}</small>
          </div>
          <button onClick={onCollection}>Zobrazit celou sbírku ({uniqueOwned}/{totalCards}) →</button>
        </div>
        <div className="showcase-grid">
          {showcaseCards.map(card => {
            const count = state.collection[card.id] || 0;
            return (
              <button
                key={card.id}
                className={`mini-card rarity-${card.rarity.toLowerCase()} ${count ? "" : "locked"}`}
                onClick={() => count ? onDetail(card) : onPacks()}
                aria-label={count ? `Otevřít detail ${card.title}` : "Neobjevená karta, rozpečeťte balíček"}
              >
                <span className="rarity-label">{count ? card.rarity : "K objevení"}</span>
                <div className="mini-illustration">{count ? <ColophonImage card={card} /> : <span>?</span>}</div>
                <strong>{count ? card.title : "Tajemný kodex"}</strong>
                <small>{count ? `${card.place} · ${card.year}` : "Získejte v balíčcích"}</small>
                {count > 1 && <b className="duplicate">×{count}</b>}
              </button>
            );
          })}
        </div>
      </section>

      <div className="section-title">
        <h2>Postup kodexového archivu</h2>
        <span>{uniqueOwned} z {totalCards} objeveno</span>
      </div>
      <div className="progress-panel">
        <div className="progress-copy">
          <strong>Postup kompletace sbírky</strong>
          <span>{progressPercent}%</span>
        </div>
        <div className="progress">
          <i style={{ width: `${progressPercent}%` }} />
        </div>
        <button onClick={onCollection}>Otevřít celou sbírku ({uniqueOwned} karet)</button>
      </div>

      <div className="home-secondary-grid">
        <section className="home-panel-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
            <div>
              <h3>16denní iluminovaná mozaika</h3>
              <p>Vraťte se každý den pro odhalení fragmentu středověkého Učeného zajíce.</p>
            </div>
            <button className="icon-label" onClick={onGallery} style={{ padding: "4px 8px", fontSize: "11px" }}>
              Detail →
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "10px" }}>
            <IlluminationMosaic pieces={state.puzzle} compact />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, color: "var(--brown)", marginBottom: "4px" }}>
                <span>Postup iluminace</span>
                <span>{state.puzzle} z 16</span>
              </div>
              <div className="progress" style={{ height: "10px", background: "#dcc296" }}>
                <i style={{ width: `${(state.puzzle / 16) * 100}%` }} />
              </div>
              <small style={{ display: "block", marginTop: "6px", color: "#684824", fontSize: "11px" }}>
                {state.puzzle < 16 ? `Zbývá ${16 - state.puzzle} denních přihlášení do kompletního díla.` : "Iluminace je dokončena! Portrét byl odemčen v profilu."}
              </small>
            </div>
          </div>
        </section>

        <section className="home-panel-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <div>
                <h3>Historická mapa skriptorií</h3>
                <p>Sledujte geografické stopy písařů napříč středověkou Evropou a českými zeměmi.</p>
              </div>
              <span style={{ width: "36px", height: "36px", display: "grid", placeItems: "center", background: "#eed8ab", borderRadius: "50%", color: "var(--brown)", border: "1px solid #a87940" }}>
                <MapPinned size={18} />
              </span>
            </div>
            <div style={{ background: "#ecd8ad", padding: "10px 12px", borderRadius: "6px", border: "1px solid #ba8c53", fontSize: "11.5px", color: "var(--brown)" }}>
              📍 <strong>Místa původu:</strong> Praha, Břevnov, Sázava, Třeboň, Zlatá Koruna a další evropská centra písemnictví.
            </div>
          </div>
          <button className="illuminated-button" onClick={onMap} style={{ marginTop: "14px", width: "100%", justifyContent: "center" }}>
            Otevřít historickou mapu <span>→</span>
          </button>
        </section>
      </div>

      <blockquote>“Kniha je dopsána. Kéž je čtenář laskav a písaři dopřeje číši dobrého vína.”<cite>— anonymní písař, cca 1300</cite></blockquote>
    </div>
  );
}

function PacksScreen({ state, onOpen, onGame }: { state: GameState; onOpen: () => void; onGame: (g: GameKind) => void }) {
  const remaining = Math.max(0, 10 - state.packsOpened);
  const hasBonus = state.bonusPacks.length > 0;
  const gamesLeft = Math.max(0, 10 - state.gamesPlayed);
  return <div className="screen packs-screen">
    <PageTitle kicker="Denní skriptorium">Rozpečetění balíčků</PageTitle>
    <div className="daily-ledger">
      <div><span>Denní balíčky</span><strong>{state.packsOpened}<small>/10</small></strong><div className="ten-dots">{Array.from({ length: 10 }).map((_, i) => <i key={i} className={i < state.packsOpened ? "used" : ""} />)}</div></div>
      <div><span>Písařské výzvy</span><strong>{state.gamesPlayed}<small>/10</small></strong><div className="ten-dots games">{Array.from({ length: 10 }).map((_, i) => <i key={i} className={i < state.gamesPlayed ? "used" : ""} />)}</div></div>
    </div>
    {hasBonus && (
      <div className="bonus-vault">
        <span><Gem size={13} /> Bonusová pokladnice</span>
        <b>{formatPacksCount(state.bonusPacks.length)}</b>
        <small>Připraven: <em className={`quality-name quality-${state.bonusPacks[0]}`}>{qualityLabel(state.bonusPacks[0])}</em></small>
      </div>
    )}
    <section className={`sealed-pack ${remaining === 0 && !hasBonus ? "empty" : ""} ${hasBonus && remaining === 0 ? `bonus-${state.bonusPacks[0]}` : ""}`}>
      <div className={`pack-ribbon ${hasBonus && remaining === 0 ? `quality-${state.bonusPacks[0]}` : ""}`}>
        {remaining ? `${formatPacksCount(remaining)} zbývá k otevření` : hasBonus ? `${qualityLabel(state.bonusPacks[0])} odměna` : "Dnešní balíčky vyčerpány"}
      </div>
      <div className="seal-orbit"><i /><i /><i /><div className="wax-seal">Q</div></div>
      <div className="manuscript-lines"><i /><i /><i /></div>
      <h2>{remaining ? "Denní balíček kolofonů" : hasBonus ? <><span className={`pack-quality-title quality-${state.bonusPacks[0]}`}>{qualityLabel(state.bonusPacks[0])}</span> balíček</> : "Skriptorium pro dnešek odpočívá"}</h2>
      <p>{remaining ? "Pět skrytých hlasů písařů čeká pod voskovou pečetí." : hasBonus ? "Vynikající výkon ve výzvě vám odemkl tento vzácný balíček." : gamesLeft ? "Splňte písařskou výzvu níže a získejte další balíček!" : "Vraťte se zítra za rozbřesku, až zapálíme nové svíce."}</p>
      <button onClick={onOpen}>{remaining || hasBonus ? "Rozpečetit balíček (5 karet)" : gamesLeft ? "Zvolte výzvu níže" : "Přijďte zítra"}</button>
    </section>
    <div className="section-title"><h2>Získejte další balíček</h2><span>{gamesLeft}/10 výzev k dispozici</span></div>
    <div className="game-list">
      <button disabled={!gamesLeft} onClick={() => onGame("mood")}><span><Smile size={23} /></span><div><strong>Nálada písaře</strong><small>Rychlá intuice · Snadná výzva</small><em>Standardní balíček</em></div><b>→</b></button>
      <button disabled={!gamesLeft} onClick={() => onGame("cipher")}><span><KeyRound size={23} /></span><div><strong>Rozlušti kolofon</strong><small>Doplňte chybějící litery · Střední</small><em>Vytříbený balíček (Rare+)</em></div><b>→</b></button>
      <button disabled={!gamesLeft} onClick={() => onGame("paleo")}><span><Languages size={23} /></span><div><strong>Paleografický mistr</strong><small>Určete středověké písmo · Expertní</small><em>Mistrovský balíček (Epic+)</em></div><b>→</b></button>
    </div>
  </div>;
}

function CollectionScreen({ state, cards, filter, setFilter, onDetail }: { state: GameState; cards: Colophon[]; filter: Rarity | "All"; setFilter: (f: Rarity | "All") => void; onDetail: (c: Colophon) => void }) {
  const [search, setSearch] = useState("");
  const [onlyOwned, setOnlyOwned] = useState(false);
  const rarities: (Rarity | "All")[] = ["All", "Common", "Uncommon", "Rare", "Epic", "Legendary", "Unique"];

  const displayedCards = cards.filter(c => {
    const isOwned = Boolean(state.collection[c.id]);
    if (onlyOwned && !isOwned) return false;
    if (filter !== "All" && c.rarity !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match = c.title.toLowerCase().includes(q) ||
                    c.scribe.toLowerCase().includes(q) ||
                    c.place.toLowerCase().includes(q) ||
                    c.quote.toLowerCase().includes(q) ||
                    String(c.year).includes(q);
      if (!match) return false;
    }
    return true;
  });

  return <div className="screen collection-screen">
    <PageTitle kicker="Iluminovaný archiv">Sbírka kolofonů</PageTitle>
    <div className="collection-summary">
      <div><strong>{Object.keys(state.collection).length}</strong><span>objeveno</span></div>
      <div><strong>{Object.values(state.collection).reduce((a, b) => a + b, 0)}</strong><span>karet celkem</span></div>
      <div><strong>{Object.values(state.collection).filter(n => n > 1).length}</strong><span>duplikátů</span></div>
    </div>

    <div className="collection-controls">
      <div className="collection-search-wrap">
        <input
          type="text"
          className="collection-search-input"
          placeholder="Hledat písaře, město, text kolofonu nebo rok..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className="collection-search-clear" onClick={() => setSearch("")} title="Vymazat hledání">
            ×
          </button>
        )}
      </div>
      <button
        className={`owned-toggle-btn ${onlyOwned ? "active" : ""}`}
        onClick={() => setOnlyOwned(!onlyOwned)}
        title="Filtrovat pouze již objevené kodexy"
      >
        <span>{onlyOwned ? "✓" : "○"}</span> Pouze vlastněné
      </button>
    </div>

    <div className="filter-row" aria-label="Filtrovat karty dle rarity">
      {rarities.map(r => (
        <button key={r} className={filter === r ? "active" : ""} onClick={() => setFilter(r)}>
          {r === "All" ? "Všechny" : r}
        </button>
      ))}
    </div>

    {displayedCards.length === 0 ? (
      <div style={{ textAlign: "center", padding: "40px 10px", color: "var(--brown)" }}>
        <p style={{ fontStyle: "italic", fontSize: "14px" }}>Žádný kolofon neodpovídá zadanému hledání nebo filtru.</p>
      </div>
    ) : (
      <div className="card-grid">
        {displayedCards.map(card => {
          const count = state.collection[card.id] || 0;
          return <button key={card.id} className={`mini-card rarity-${card.rarity.toLowerCase()} ${count ? "" : "locked"}`} onClick={() => count && onDetail(card)} aria-label={count ? `Otevřít ${card.title}` : "Neobjevená karta"}>
            <span className="rarity-label">{count ? card.rarity : "Neobjeveno"}</span>
            <div className="mini-illustration">{count ? <ColophonImage card={card} /> : <span>?</span>}</div>
            <strong>{count ? card.title : "Tajemný kodex"}</strong>
            <small>{count ? `${card.place} · ${card.year}` : "Získejte v balíčcích"}</small>
            {count > 1 && <b className="duplicate">×{count}</b>}
          </button>;
        })}
      </div>
    )}
  </div>;
}

function TrophiesScreen({ state, cards }: { state: GameState; cards: Colophon[] }) {
  const trophies = [
    ["first-spark", "První jiskra", "Rozpečeťte svůj první denní balíček", "100 XP", "Q"],
    ["first-pack", "Lamač pečetí", "Objevte pět různých kolofonů", "150 XP", "S"],
    ["collector", "Napříč staletími", "Získejte 8 různých kodexů do sbírky", "250 XP", "A"],
    ["streak", "Vytrvalý iluminátor", "Udržte 16 dní nepřetržité návštěvy", "300 XP", "I"],
    ["unique", "Zlacené tajemství", "Najděte Unikátní kolofon", "500 XP", "G"],
  ];
  return <div className="screen trophies-screen">
    <PageTitle kicker="Poutníkovy milníky">Písařská ocenění</PageTitle>
    <section className="puzzle-board">
      <div className="puzzle-copy">
        <p>16denní iluminovaná mozaika</p>
        <h2>{state.puzzle}/16 dní</h2>
        <small>Vraťte se každý den pro odhalení nového fragmentu středověkého zajíce.</small>
        <div className="progress"><i style={{ width: `${(state.puzzle / 16) * 100}%` }} /></div>
      </div>
      <IlluminationMosaic pieces={state.puzzle} compact />
    </section>
    <div className="section-title"><h2>Získané pocty</h2><span>{state.trophies.length}/5 splněno</span></div>
    <div className="trophy-list">
      {trophies.map(([id, title, text, xp, initial]) => {
        const ownsUnique = cards.some(card => card.rarity === "Unique" && state.collection[card.id]);
        const earned = state.trophies.includes(id) || (id === "collector" && Object.keys(state.collection).length >= 8) || (id === "streak" && state.streak >= 16) || (id === "unique" && ownsUnique);
        return (
          <article key={id} className={earned ? "earned" : "locked"}>
            <div className="illuminated-initial">{initial}</div>
            <div>
              <strong>{title}</strong>
              <p>{text}</p>
              <small>{earned ? "Splněno" : xp}</small>
            </div>
            <span>{earned ? <Award size={18} /> : <LockKeyhole size={16} />}</span>
          </article>
        );
      })}
    </div>
  </div>;
}

function ProfileScreen({ state, uniqueOwned, duplicates, isLive, onReset, onSend, onSetAvatar }: { state: GameState; uniqueOwned: number; duplicates: number; isLive?: boolean; onReset: () => void; onSend: () => void; onSetAvatar: (id: string) => void }) {
  const level = levelForXp(state.xp);
  const levelXp = state.xp % XP_PER_LEVEL;
  const title = level >= 10 ? "Mistr iluminátor" : level >= 6 ? "Písařský tovaryš" : "Učedník ve skriptoriu";
  return <div className="screen profile-screen">
    <PageTitle kicker="Vaše místo na okrajích kodexu">Profil písaře</PageTitle>
    <section className="profile-card">
      <div className={`avatar ${state.avatarArt ? "art-avatar" : ""}`}>
        {state.avatarArt ? <img src={ILLUMINATIONS.find(a => a.id === state.avatarArt)?.source} alt="Vybraný portrét" /> : "Q"}
      </div>
      <div>
        <h2>Mistr písař</h2>
        <p>{title} · Úroveň {level}</p>
        <div className="level-progress" aria-label={`${levelXp} z ${XP_PER_LEVEL} XP do úrovně ${level + 1}`}><i style={{ width: `${levelXp}%` }} /></div>
        <small>{levelXp} / {XP_PER_LEVEL} XP · Zbývá {XP_PER_LEVEL - levelXp} XP do úrovně {level + 1}</small>
      </div>
    </section>
    <blockquote>“Per pedes et non per manus.” (Nohama a ne rukama.)<cite>Osobní zápis písaře</cite></blockquote>
    <div className="profile-stats">
      <div><strong>{uniqueOwned}</strong><span>unikátních</span></div>
      <div><strong>{state.streak}</strong><span>dní v řadě</span></div>
      <div><strong>{duplicates}</strong><span>duplikátů</span></div>
    </div>

    <div className="section-title gallery-title"><h2>Galerie iluminací</h2><span>{state.gallery.length} dokončeno</span></div>
    <section className="current-illumination">
      <IlluminationMosaic pieces={state.puzzle} />
      <div>
        <p>Rozpracované dílo</p>
        <h3>Učený zajíc (The Learned Hare)</h3>
        <small>{state.puzzle < 16 ? `Zbývá ${16 - state.puzzle} denních přihlášení` : "Dílo kompletní!"}</small>
      </div>
    </section>
    {state.gallery.length ? (
      <div className="illumination-gallery">
        {state.gallery.map(id => {
          const art = ILLUMINATIONS.find(item => item.id === id);
          if (!art) return null;
          return <article key={id}><img src={art.source} alt={art.title} /><div><strong>{art.title}</strong><small>Dokončeno po 16 dnech</small><button className={state.avatarArt === id ? "selected" : ""} onClick={() => onSetAvatar(id)}>{state.avatarArt === id ? "Aktivní portrét" : "Zvolit jako portrét"}</button></div></article>;
        })}
      </div>
    ) : (
      <p className="empty-gallery">Složte 16denní mozaiku pro odemčení první celistvé iluminace.</p>
    )}

    <div className="section-title"><h2>Kolegové ve skriptoriu</h2><button className="icon-label" onClick={() => onSend()}><UserPlus size={13} /> Odeslat duplikát</button></div>
    <div className="friends">
      <article><div className="friend-avatar">B</div><div><strong>BeatriceWrites</strong><small>14 dní v řadě · 9 karet</small></div><button onClick={onSend}><Send size={12} /> Darovat</button></article>
      <article><div className="friend-avatar blue">T</div><div><strong>theo.history</strong><small>6 dní v řadě · 7 karet</small></div><button onClick={onSend}><Send size={12} /> Darovat</button></article>
    </div>

    <button className="settings-button" onClick={onReset}><RotateCcw size={12} /> Resetovat postup pro demonstraci</button>
  </div>;
}

function IlluminationMosaic({ pieces, compact = false }: { pieces: number; compact?: boolean }) {
  return (
    <div className={`illumination-mosaic ${compact ? "compact" : ""}`} aria-label={`${pieces} z 16 fragmentů iluminace odhaleno`}>
      <img src={ILLUMINATIONS[0].source} alt="Iluminace Učeného zajíce" />
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

function LevelUpModal({ level, onClose }: { level: number; onClose: () => void }) {
  return <div className="modal-backdrop level-up-backdrop"><section className="level-up-modal" role="dialog" aria-modal="true" aria-label={`Dosažena úroveň ${level}`}>
    <div className="level-rays" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
    <Sparkles size={28} aria-hidden="true" />
    <p>Písařské osvícení</p><h2>Úroveň {level}</h2>
    <div className="level-seal"><span>{level}</span></div>
    <strong>Odemčena mistrovská odměna</strong>
    <small>Do vaší pokladnice byl vložen jeden Mistrovský balíček s vysokou šancí na vzácné kolofony.</small>
    <button onClick={onClose}>Převzít odměnu</button>
  </section></div>;
}

function CardDetail({ card, count, onClose }: { card: Colophon; count: number; onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className={`modal card-detail rarity-${card.rarity.toLowerCase()}`} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={card.title}>
        <button className="close" onClick={onClose}>×</button>
        <div className="card-detail-left">
          <span className="rarity-label">{card.rarity}</span>
          <div className="large-illustration">
            <ColophonImage card={card} alt={`Snímek rukopisu ${card.title}`} />
          </div>
          <a className="source-link" href={card.sourceUrl} target="_blank" rel="noreferrer">
            Otevřít digitální sken rukopisu ↗
          </a>
        </div>
        <div className="card-detail-right">
          <h2>{card.title}</h2>
          <p className="latin">“{card.quote}”</p>
          {card.translation && card.translation !== "Translation pending" && (
            <p style={{ fontStyle: "normal", background: "#ecd4a7", padding: "8px 10px", borderLeft: "3px solid var(--brown)", borderRadius: "0 4px 4px 0", fontSize: "12px", margin: "8px 0" }}>
              {card.translation}
            </p>
          )}
          <dl>
            <div><dt>Písař</dt><dd>{card.scribe}</dd></div>
            <div><dt>Místo & rok</dt><dd>{card.place}, {card.year}</dd></div>
            <div><dt>Rukopis / signatura</dt><dd>{card.manuscript}</dd></div>
            <div><dt>Folium</dt><dd>{card.locus}</dd></div>
            {card.rarityReason && <div><dt>Důvod rarity</dt><dd>{card.rarityReason}</dd></div>}
            <div><dt>Vlastněných kopií</dt><dd><b>×{count}</b></dd></div>
          </dl>
        </div>
      </section>
    </div>
  );
}

function PackReveal({ card, position, total, quality, shown, onReveal, onNext }: { card: Colophon; position: number; total: number; quality: PackQuality; shown: boolean; onReveal: () => void; onNext: () => void }) {
  const glitterCount = card.rarity === "Unique" ? 64 : card.rarity === "Legendary" ? 48 : card.rarity === "Epic" ? 36 : card.rarity === "Rare" ? 22 : 14;
  const [tension, setTension] = useState(false);
  const isMonumental = card.rarity === "Legendary" || card.rarity === "Unique";
  const beginReveal = () => {
    if (tension) return;
    if (!isMonumental) return onReveal();
    setTension(true);
    window.setTimeout(onReveal, card.rarity === "Unique" ? 1500 : 1050);
  };
  return <div className={`modal-backdrop reveal-bg aura-${card.rarity.toLowerCase()} ${shown ? "is-revealed" : "is-sealed"} ${tension ? "is-tension" : ""}`}>
    <div className="particle-field" aria-hidden="true">{Array.from({ length: 18 }).map((_, i) => <i key={i} style={{ "--i": i } as React.CSSProperties}>✦</i>)}</div>
    {!shown ? <>
      <div className="reveal-kicker"><span>Balíček: {quality}</span><b>Karta {position} z {total}</b></div>
      <button className="card-back" onClick={beginReveal} disabled={tension} aria-label={`Odhalit kartu ${position} z ${total}`}>
        <div className="card-back-frame"><span>Q</span><small>{tension ? "Pečeť klade odpor…" : "Klepnutím odhalit"}</small></div>
      </button>
      <p className="reveal-whisper">{tension ? "Něco prastarého se probouzí pod pergamenem…" : "Inkoust se hýbe pod voskem…"}</p>
    </> : <>
      <div className="reveal-flash" aria-hidden="true" />
      <div className="light-shafts" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <div className="glitter-storm" aria-hidden="true">{Array.from({ length: glitterCount }).map((_, i) => <i key={i} style={{ "--x": `${(i * 37) % 100}%`, "--y": `${(i * 53) % 100}%`, "--dx": `${((i * 29) % 180) - 90}px`, "--dy": `${-50 - ((i * 17) % 190)}px`, "--delay": `${(i % 11) * .045}s`, "--size": `${5 + (i % 5) * 2}px` } as React.CSSProperties}>{i % 4 === 0 ? "◆" : i % 3 === 0 ? "✧" : "✦"}</i>)}</div>
      <div className="rarity-burst" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></div>
      <div className="reveal-kicker"><span>{card.rarity}</span><b>{position} / {total}</b></div>
      <section className={`reveal-card rarity-${card.rarity.toLowerCase()}`}>
        <div className="card-crown">✦ {card.rarity} ✦</div>
        <div className="large-illustration"><ColophonImage card={card} /><b>{card.year}</b></div>
        <h2>{card.title}</h2><p>“{card.quote}”</p><small>{card.scribe} · {card.place}</small>
      </section>
      <div className="reveal-actions"><span>{position === total ? "Poslední karta balíčku" : `Ještě zbývá ${total - position} karet`}</span><button onClick={onNext}>{position === total ? "Uložit do sbírky" : "Táhnout další kartu"} →</button></div>
    </>}
  </div>;
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
}: {
  kind: GameKind;
  question: QuestionData;
  cards: Colophon[];
  answer: string | null;
  step: number;
  setStep: (n: number) => void;
  onClose: () => void;
  onAnswer: (correct: boolean) => void;
}) {
  const challengeCard =
    (question.card_id
      ? cards.find((c) => c.uuid === question.card_id || String(c.id) === String(question.card_id))
      : null) ||
    cards.find((c) => c.quote && question.quote && c.quote.toLowerCase().includes(question.quote.slice(0, 15).toLowerCase())) ||
    cards[0] ||
    COLOPHONS[0];

  const reward =
    kind === "paleo"
      ? "Mistrovský balíček · Epic a lepší"
      : kind === "cipher"
      ? "Vytříbený balíček · Zvýšená šance na Rare"
      : "Standardní bonusový balíček";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className={`modal game-modal game-${kind}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={question.title}
      >
        <button className="close" onClick={onClose}>
          ×
        </button>
        <p className="eyebrow">Výzva o bonusový balíček</p>
        <h2>{question.title}</h2>
        <div className="reward-banner">
          <span>Odměna</span>
          <strong>{reward}</strong>
        </div>
        <div className="game-rule">{question.intro}</div>
        <div className="challenge-manuscript">
          <ColophonImage card={challengeCard} alt="Detail rukopisu k výzvě" />
          <small>
            {challengeCard.manuscript} · {challengeCard.locus}
          </small>
        </div>
        <blockquote className={kind === "paleo" ? "paleo-text" : ""}>
          {question.quote}
        </blockquote>
        <div className="game-options">
          {question.options.map((o, i) => (
            <button
              key={i}
              disabled={!!answer}
              className={answer ? (i === question.correct_index ? "correct" : "dim") : ""}
              onClick={() => onAnswer(i === question.correct_index)}
            >
              <span>{o[0]}</span>
              <small>{o[1]}</small>
            </button>
          ))}
        </div>
        {answer === "correct" && question.explanation && (
          <div className="game-explanation">
            <strong>Písařský vhled:</strong>
            {question.explanation}
          </div>
        )}
        {answer === "wrong" && (
          <p className="wrong-answer">Bohužel vedle – hledejte nápovědu ve slovech písaře.</p>
        )}
        {step === 0 && !answer && question.hint && (
          <button className="hint" onClick={() => setStep(1)}>
            Potřebujete nápovědu?
          </button>
        )}
        {step === 1 && question.hint && <p className="hint-copy">{question.hint}</p>}
      </section>
    </div>
  );
}

function MapModal({
  state,
  cards,
  onClose,
  onDetail,
}: {
  state: GameState;
  cards: Colophon[];
  onClose: () => void;
  onDetail: (card: Colophon) => void;
}) {
  const scriptoriaWithCards = useMemo(() => {
    return SCRIPTORIA_PLACES.map((place) => {
      const placeCards = cards.filter((c) => getScriptoriumForCard(c).id === place.id);
      const owned = placeCards.filter((c) => Boolean(state.collection[c.id]));
      return {
        place,
        cards: placeCards,
        owned,
      };
    });
  }, [cards, state.collection]);

  const [selectedPlace, setSelectedPlace] = useState<ScriptoriumPlace>(() => {
    const withOwned = scriptoriaWithCards.find((s) => s.owned.length > 0);
    return withOwned ? withOwned.place : SCRIPTORIA_PLACES[0];
  });

  const currentSelection =
    scriptoriaWithCards.find((s) => s.place.id === selectedPlace.id) || scriptoriaWithCards[0];

  const totalMapOwned = scriptoriaWithCards.reduce((acc, s) => acc + s.owned.length, 0);
  const totalMapCards = scriptoriaWithCards.reduce((acc, s) => acc + s.cards.length, 0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="modal map-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Historická mapa skriptorií"
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
            <p className="eyebrow">Písařská a univerzitní centra středověké Evropy</p>
            <h2>Historická mapa skriptorií</h2>
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
            Objeveno celkem: <b>{totalMapOwned} / {totalMapCards}</b>
          </div>
        </div>

        <div className="map-layout">
          {/* Levá část: interaktivní mapa */}
          <div className="medieval-map-container" aria-label="Mapa Evropy s piny skriptorií">
            <div className="map-decor-border" />
            <div className="map-cartouche">ORBIS SCRIPTORIORUM</div>
            <span className="map-sea-label sea-baltic">MARE BALTICUM</span>
            <span className="map-sea-label sea-adriatic">MARE ADRIATICUM</span>

            {scriptoriaWithCards.map(({ place, owned, cards: pCards }) => {
              const hasOwned = owned.length > 0;
              const isSelected = selectedPlace.id === place.id;
              return (
                <button
                  key={place.id}
                  className={`map-pin ${hasOwned ? "has-owned" : ""} ${isSelected ? "active" : ""}`}
                  style={{ left: `${place.x}%`, top: `${place.y}%` }}
                  onClick={() => setSelectedPlace(place)}
                  title={`${place.name} (${owned.length}/${pCards.length} objeveno)`}
                >
                  <span className="pin-seal">{place.icon}</span>
                  <span className="pin-tag">
                    {place.name} <b>{owned.length}/{pCards.length}</b>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Pravá část: detail vybraného skriptoria */}
          <div className="map-panel">
            <div className="map-panel-header">
              <h3>
                <span>{currentSelection.place.icon}</span> {currentSelection.place.name}
              </h3>
              <p>
                {currentSelection.place.region} · {currentSelection.place.country}
              </p>
            </div>
            <p className="map-panel-desc">{currentSelection.place.description}</p>

            <div className="map-panel-stats">
              <span>Dochované kodexy v archivu</span>
              <span>
                {currentSelection.owned.length} z {currentSelection.cards.length} objeveno
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
                <p className="map-empty-state">V této lokalitě zatím nemáte katalogizovány žádné kodexy.</p>
              ) : (
                currentSelection.cards.map((card) => {
                  const count = state.collection[card.id] || 0;
                  const isOwned = count > 0;
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
                            ?
                          </span>
                        )}
                      </div>
                      <div className="map-card-info">
                        <strong>{isOwned ? card.title : "Tajemný kodex"}</strong>
                        <small>
                          {isOwned ? `${card.scribe} (${card.year})` : "Získejte v balíčcích"}
                        </small>
                      </div>
                      {isOwned ? (
                        <button
                          className="map-card-action"
                          onClick={() => onDetail(card)}
                          title="Prohlédnout detail kolofonu"
                        >
                          Detail →
                        </button>
                      ) : (
                        <span style={{ fontSize: "10px", color: "#8a6534", padding: "4px" }}>
                          Zamčeno
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
