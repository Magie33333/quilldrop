"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { Award, Flame, Gem, Grid3X3, Home as HomeIcon, KeyRound, Languages, LibraryBig, LockKeyhole, MapPinned, PenTool, Puzzle, RotateCcw, ScrollText, Send, Smile, Sparkles, Trophy, UserPlus, UserRound, type LucideIcon } from "lucide-react";
import { HEURIST_COLOPHONS } from "./data/colophons.generated";

type Tab = "home" | "packs" | "collection" | "trophies" | "profile";
type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Unique";
type GameKind = "mood" | "cipher" | "paleo";
type PackQuality = "standard" | "refined" | "masterwork";

type Colophon = {
  id: number;
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
};

type GameState = {
  packsOpened: number;
  collection: Record<number, number>;
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
  { id: "home", label: "Home", icon: HomeIcon },
  { id: "collection", label: "Collection", icon: LibraryBig },
  { id: "packs", label: "Packs", icon: ScrollText },
  { id: "trophies", label: "Trophies", icon: Trophy },
  { id: "profile", label: "Profile", icon: UserRound },
];

const today = () => new Date().toISOString().slice(0, 10);
const XP_PER_LEVEL = 100;
const levelForXp = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;
const qualityLabel = (quality: PackQuality) => quality[0].toUpperCase() + quality.slice(1);

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
    const hasCurrentCards = Object.keys(hydrated.collection).some(id => COLOPHONS.some(card => card.id === Number(id)));
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
  const [detail, setDetail] = useState<Colophon | null>(null);
  const [opened, setOpened] = useState<Colophon[] | null>(null);
  const [reveal, setReveal] = useState(0);
  const [cardShown, setCardShown] = useState(false);
  const [packQuality, setPackQuality] = useState<PackQuality>("standard");
  const [toast, setToast] = useState("");
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
    const pool = COLOPHONS.filter(c => allowed.includes(c.rarity));
    return pool[Math.floor(Math.random() * pool.length)] || COLOPHONS[0];
  };

  const openPack = () => {
    const usingBonus = state.packsOpened >= 10;
    if (usingBonus && !state.bonusPacks.length) {
      setToast(state.gamesPlayed >= 10 ? "All packs and minigames are spent for today." : "Your ten daily packs are spent—earn another in a minigame.");
      return;
    }
    const quality: PackQuality | "daily" = usingBonus ? state.bonusPacks[0] : "daily";
    const cards = Array.from({ length: 5 }, () => chooseCard(quality));
    setOpened(cards);
    setReveal(0);
    setCardShown(false);
    setPackQuality(quality === "daily" ? "standard" : quality);
    const nextCollection = { ...state.collection };
    cards.forEach(card => { nextCollection[card.id] = (nextCollection[card.id] || 0) + 1; });
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
      else setToast("Five cards added to your collection!");
    }
  };

  const startGame = (kind: GameKind) => {
    if (state.gamesPlayed >= 10) { setToast("You have completed today’s ten minigames. Return tomorrow."); return; }
    setGame(kind);
  };

  const finishGame = (correct: boolean) => {
    setAnswer(correct ? "correct" : "wrong");
    const quality: PackQuality = game === "paleo" ? "masterwork" : game === "cipher" ? "refined" : "standard";
    if (correct) {
      const earnedXp = quality === "masterwork" ? 90 : quality === "refined" ? 60 : 35;
      const nextLevel = levelForXp(state.xp + earnedXp);
      setState(s => withXpReward({ ...s, gamesPlayed: s.gamesPlayed + 1, bonusPacks: [...s.bonusPacks, quality], coins: s.coins + 20 }, earnedXp));
      if (nextLevel > levelForXp(state.xp)) window.setTimeout(() => setLevelUp(nextLevel), 1300);
      else setToast(`Correct! A ${qualityLabel(quality)} bonus pack is waiting.`);
    } else {
      setState(s => ({ ...s, gamesPlayed: s.gamesPlayed + 1 }));
      setToast(`Attempt used — ${Math.max(0, 9 - state.gamesPlayed)} challenges remain today.`);
    }
    setTimeout(() => { setGame(null); setAnswer(null); setGameStep(0); }, 1200);
  };

  const resetDemo = () => {
    setState(INITIAL_STATE);
    setToast("Your demo progress has been reset.");
  };

  if (!ready) return <main className="loading">Opening the manuscript…</main>;

  return (
    <main className="page-stage">
      <section className="app-shell" aria-label="Quilldrop application">
        <StatusBar state={state} />

        <div className="scroll-area">
          {tab === "home" && <HomeScreen state={state} uniqueOwned={uniqueOwned} onPacks={() => setTab("packs")} onCollection={() => setTab("collection")} onMap={() => setShowMap(true)} onGallery={() => setTab("profile")} />}
          {tab === "packs" && <PacksScreen state={state} onOpen={openPack} onGame={startGame} />}
          {tab === "collection" && <CollectionScreen state={state} filter={filter} setFilter={setFilter} onDetail={setDetail} />}
          {tab === "trophies" && <TrophiesScreen state={state} />}
          {tab === "profile" && <ProfileScreen state={state} uniqueOwned={uniqueOwned} duplicates={duplicates} onReset={resetDemo} onSend={() => setToast(duplicates ? "Duplicate sent to Beatrice!" : "You need a duplicate first.")} onSetAvatar={(id) => { setState(s => ({ ...s, avatarArt: id })); setToast("Profile portrait updated."); }} />}
        </div>

        <nav className="bottom-nav" aria-label="Main navigation">
          {NAV.map(item => { const Icon = item.icon; return <button key={item.id} className={`${tab === item.id ? "active" : ""} ${item.id === "packs" ? "primary" : ""}`} onClick={() => setTab(item.id)} aria-label={item.label}><span><Icon size={21} strokeWidth={1.8} /></span><small>{item.label}</small></button>; })}
        </nav>

        {detail && <CardDetail card={detail} count={state.collection[detail.id] || 0} onClose={() => setDetail(null)} />}
        {opened && <PackReveal key={`${reveal}-${cardShown}`} card={opened[reveal]} position={reveal + 1} total={opened.length} quality={packQuality} shown={cardShown} onReveal={() => setCardShown(true)} onNext={finishReveal} />}
        {game && <GameModal kind={game} answer={answer} step={gameStep} setStep={setGameStep} onClose={() => setGame(null)} onAnswer={finishGame} />}
        {showMap && <MapModal state={state} onClose={() => setShowMap(false)} />}
        {levelUp && <LevelUpModal level={levelUp} onClose={() => setLevelUp(null)} />}
        {toast && <div className="toast" role="status">{toast}</div>}
      </section>
    </main>
  );
}

function StatusBar({ state }: { state: GameState }) {
  return <header className="status-bar">
    <div className="brand-lockup"><img src="/quilldrop-logo.png" alt="Quilldrop" /></div>
    <div className="stats">
      <span title="Current streak" aria-label={`${state.streak} day streak`}><Flame size={14} /> <b>{state.streak}</b></span>
      <span title="Illumination fragments — one earned per login day" aria-label={`${state.puzzle} of 16 daily illumination fragments`}><Puzzle size={14} /> <b>{state.puzzle}/16</b></span>
      <span title="Experience points" aria-label={`${state.xp} experience points`}><Sparkles size={14} /> <b>{state.xp}</b></span>
    </div>
  </header>;
}

function PageTitle({ kicker, children }: { kicker?: string; children: React.ReactNode }) {
  return <div className="page-heading">{kicker && <p>{kicker}</p>}<h1>{children}</h1><span className="flourish" aria-hidden="true" /></div>;
}

function ColophonImage({ card, alt = "" }: { card: Colophon; alt?: string }) {
  return <img src={card.imageUrl} alt={alt} onError={(event) => {
    const image = event.currentTarget;
    if (image.src !== card.remoteImageUrl) image.src = card.remoteImageUrl;
  }} />;
}

function HomeScreen({ state, uniqueOwned, onPacks, onCollection, onMap, onGallery }: { state: GameState; uniqueOwned: number; onPacks: () => void; onCollection: () => void; onMap: () => void; onGallery: () => void }) {
  return <div className="screen home-screen">
    <section className="welcome-panel">
      <div><p className="eyebrow">Good morrow, Olivia</p><h1>What will the margins reveal today?</h1><p>Open a new bundle of scribal voices from across medieval Europe.</p></div>
      <div className="scribe-medallion"><PenTool size={34} strokeWidth={1.45} /></div>
    </section>

    <section className="daily-card">
      <div className="daily-top"><span>Today’s discovery</span><b>{10 - state.packsOpened} packs left</b></div>
      <div className="pack-art" aria-hidden="true"><span>Q</span><i>✦</i></div>
      <div className="daily-copy"><h2>A bundle from the scriptorium</h2><p>Five colophons are waiting under the seal.</p><button className="illuminated-button" onClick={onPacks}>Open today’s pack <span>→</span></button></div>
    </section>

    <div className="section-title"><h2>Your manuscript</h2><span>{uniqueOwned}/{COLOPHONS.length} discovered</span></div>
    <div className="progress-panel"><div className="progress-copy"><strong>Collection progress</strong><span>{Math.round(uniqueOwned / COLOPHONS.length * 100)}%</span></div><div className="progress"><i style={{ width: `${uniqueOwned / COLOPHONS.length * 100}%` }} /></div><button onClick={onCollection}>View collection</button></div>

    <div className="quick-grid">
      <button onClick={onMap}><span className="quick-icon"><MapPinned size={23} /></span><strong>Explore the map</strong><small>Find voices by place</small></button>
      <button onClick={onGallery}><span className="quick-icon"><Grid3X3 size={22} /></span><strong>Illumination gallery</strong><small>{state.puzzle}/16 days · view progress</small></button>
    </div>
    <blockquote>“The book is finished. Let the reader be kind.”<cite>— anonymous scribe, c. 1300</cite></blockquote>
  </div>;
}

function PacksScreen({ state, onOpen, onGame }: { state: GameState; onOpen: () => void; onGame: (g: GameKind) => void }) {
  const remaining = Math.max(0, 10 - state.packsOpened);
  const hasBonus = state.bonusPacks.length > 0;
  const gamesLeft = Math.max(0, 10 - state.gamesPlayed);
  return <div className="screen packs-screen">
    <PageTitle kicker="The daily scriptorium">Open packs</PageTitle>
    <div className="daily-ledger">
      <div><span>Daily packs</span><strong>{state.packsOpened}<small>/10</small></strong><div className="ten-dots">{Array.from({ length: 10 }).map((_, i) => <i key={i} className={i < state.packsOpened ? "used" : ""} />)}</div></div>
      <div><span>Challenges</span><strong>{state.gamesPlayed}<small>/10</small></strong><div className="ten-dots games">{Array.from({ length: 10 }).map((_, i) => <i key={i} className={i < state.gamesPlayed ? "used" : ""} />)}</div></div>
    </div>
    {hasBonus && <div className="bonus-vault"><span><Gem size={13} /> Bonus vault</span><b>{state.bonusPacks.length} pack{state.bonusPacks.length === 1 ? "" : "s"}</b><small>Next: <em className={`quality-name quality-${state.bonusPacks[0]}`}>{qualityLabel(state.bonusPacks[0])}</em> quality</small></div>}
    <section className={`sealed-pack ${remaining === 0 && !hasBonus ? "empty" : ""} ${hasBonus && remaining === 0 ? `bonus-${state.bonusPacks[0]}` : ""}`}>
      <div className={`pack-ribbon ${hasBonus && remaining === 0 ? `quality-${state.bonusPacks[0]}` : ""}`}>{remaining ? `${remaining} daily remaining` : hasBonus ? `${qualityLabel(state.bonusPacks[0])} reward` : "Daily packs opened"}</div>
      <div className="seal-orbit"><i /><i /><i /><div className="wax-seal">Q</div></div>
      <div className="manuscript-lines"><i /><i /><i /></div>
      <h2>{remaining ? "Daily colophon pack" : hasBonus ? <><span className={`pack-quality-title quality-${state.bonusPacks[0]}`}>{qualityLabel(state.bonusPacks[0])}</span> reward pack</> : "The scriptorium is resting"}</h2>
      <p>{remaining ? "Five hidden voices await beneath the seal" : hasBonus ? "A better challenge has shaped a better pack" : gamesLeft ? "Win a challenge to summon another pack" : "Return tomorrow when the candles are relit"}</p>
      <button onClick={onOpen}>{remaining || hasBonus ? "Begin the unsealing" : gamesLeft ? "Choose a challenge below" : "Come back tomorrow"}</button>
    </section>
    <div className="section-title"><h2>Earn another pack</h2><span>{gamesLeft}/10 challenges left</span></div>
    <div className="game-list">
      <button disabled={!gamesLeft} onClick={() => onGame("mood")}><span><Smile size={23} /></span><div><strong>Scribe’s mood</strong><small>Quick intuition · Easy</small><em>Standard pack</em></div><b>→</b></button>
      <button disabled={!gamesLeft} onClick={() => onGame("cipher")}><span><KeyRound size={23} /></span><div><strong>Crack the colophon</strong><small>Restore the missing letters · Medium</small><em>Refined pack · Rare boosted</em></div><b>→</b></button>
      <button disabled={!gamesLeft} onClick={() => onGame("paleo")}><span><Languages size={23} /></span><div><strong>Master transcription</strong><small>Read the original hand · Expert</small><em>Masterwork · Epic or better</em></div><b>→</b></button>
    </div>
  </div>;
}

function CollectionScreen({ state, filter, setFilter, onDetail }: { state: GameState; filter: Rarity | "All"; setFilter: (f: Rarity | "All") => void; onDetail: (c: Colophon) => void }) {
  const rarities: (Rarity | "All")[] = ["All", "Common", "Uncommon", "Rare", "Epic", "Legendary", "Unique"];
  const cards = COLOPHONS.filter(c => filter === "All" || c.rarity === filter);
  return <div className="screen collection-screen">
    <PageTitle kicker="Your illuminated archive">Collection</PageTitle>
    <div className="collection-summary"><div><strong>{Object.keys(state.collection).length}</strong><span>discovered</span></div><div><strong>{Object.values(state.collection).reduce((a, b) => a + b, 0)}</strong><span>total cards</span></div><div><strong>{Object.values(state.collection).filter(n => n > 1).length}</strong><span>duplicates</span></div></div>
    <div className="filter-row" aria-label="Filter cards by rarity">{rarities.map(r => <button key={r} className={filter === r ? "active" : ""} onClick={() => setFilter(r)}>{r}</button>)}</div>
    <div className="card-grid">
      {cards.map(card => {
        const count = state.collection[card.id] || 0;
        return <button key={card.id} className={`mini-card rarity-${card.rarity.toLowerCase()} ${count ? "" : "locked"}`} onClick={() => count && onDetail(card)} aria-label={count ? `Open ${card.title}` : "Undiscovered card"}>
          <span className="rarity-label">{count ? card.rarity : "Undiscovered"}</span>
          <div className="mini-illustration">{count ? <ColophonImage card={card} /> : <span>?</span>}</div>
          <strong>{count ? card.title : "???"}</strong>
          <small>{count ? `${card.place} · ${card.year}` : "Keep opening packs"}</small>
          {count > 1 && <b className="duplicate">×{count}</b>}
        </button>;
      })}
    </div>
  </div>;
}

function TrophiesScreen({ state }: { state: GameState }) {
  const trophies = [
    ["first-spark", "First Spark", "Open your first daily pack", "100 XP", "Q"],
    ["first-pack", "Seal Breaker", "Discover five colophons", "150 XP", "S"],
    ["collector", "Across the Centuries", "Collect 8 different cards", "250 XP", "A"],
    ["streak", "The Illuminator", "Maintain a 16-day streak", "300 XP", "I"],
    ["unique", "Gilded Secret", "Find a Unique colophon", "500 XP", "G"],
  ];
  return <div className="screen trophies-screen">
    <PageTitle kicker="Marks of your journey">Trophies</PageTitle>
    <section className="puzzle-board"><div className="puzzle-copy"><p>16-day illumination</p><h2>{state.puzzle}/16 days</h2><small>Return each day to reveal one new fragment.</small><div className="progress"><i style={{ width: `${state.puzzle / 16 * 100}%` }} /></div></div><IlluminationMosaic pieces={state.puzzle} compact /></section>
    <div className="section-title"><h2>Achievements</h2><span>{state.trophies.length}/5 earned</span></div>
    <div className="trophy-list">{trophies.map(([id, title, text, xp, initial]) => { const ownsUnique = COLOPHONS.some(card => card.rarity === "Unique" && state.collection[card.id]); const earned = state.trophies.includes(id) || (id === "collector" && Object.keys(state.collection).length >= 8) || (id === "streak" && state.streak >= 16) || (id === "unique" && ownsUnique); return <article key={id} className={earned ? "earned" : "locked"}><div className="illuminated-initial">{initial}</div><div><strong>{title}</strong><p>{text}</p><small>{earned ? "Earned" : xp}</small></div><span>{earned ? <Award size={18} /> : <LockKeyhole size={16} />}</span></article>; })}</div>
  </div>;
}

function ProfileScreen({ state, uniqueOwned, duplicates, onReset, onSend, onSetAvatar }: { state: GameState; uniqueOwned: number; duplicates: number; onReset: () => void; onSend: () => void; onSetAvatar: (id: string) => void }) {
  const level = levelForXp(state.xp);
  const levelXp = state.xp % XP_PER_LEVEL;
  const title = level >= 10 ? "Master Illuminator" : level >= 6 ? "Journeyman Illuminator" : "Apprentice Illuminator";
  return <div className="screen profile-screen">
    <PageTitle kicker="Your place in the margins">Profile</PageTitle>
    <section className="profile-card"><div className={`avatar ${state.avatarArt ? "art-avatar" : ""}`}>{state.avatarArt ? <img src={ILLUMINATIONS.find(a => a.id === state.avatarArt)?.source} alt="Selected illumination portrait" /> : "O"}</div><div><h2>olivia_r333</h2><p>{title} · Level {level}</p><div className="level-progress" aria-label={`${levelXp} of ${XP_PER_LEVEL} experience points toward level ${level + 1}`}><i style={{ width: `${levelXp}%` }} /></div><small>{levelXp} / {XP_PER_LEVEL} XP · {XP_PER_LEVEL - levelXp} XP to Level {level + 1}</small></div></section>
    <blockquote>“Per pedes et non per manus.”<cite>Selected personal colophon</cite></blockquote>
    <div className="profile-stats"><div><strong>{uniqueOwned}</strong><span>cards</span></div><div><strong>{state.streak}</strong><span>day streak</span></div><div><strong>{duplicates}</strong><span>duplicates</span></div></div>
    <div className="section-title gallery-title"><h2>Illumination gallery</h2><span>{state.gallery.length} collected</span></div>
    <section className="current-illumination"><IlluminationMosaic pieces={state.puzzle} /><div><p>Current work</p><h3>The Learned Hare</h3><small>{state.puzzle < 16 ? `${16 - state.puzzle} login day${16 - state.puzzle === 1 ? "" : "s"} remaining` : "Illumination complete"}</small></div></section>
    {state.gallery.length ? <div className="illumination-gallery">{state.gallery.map(id => { const art = ILLUMINATIONS.find(item => item.id === id); if (!art) return null; return <article key={id}><img src={art.source} alt={art.title} /><div><strong>{art.title}</strong><small>Completed after 16 login days</small><button className={state.avatarArt === id ? "selected" : ""} onClick={() => onSetAvatar(id)}>{state.avatarArt === id ? "Current portrait" : "Set as portrait"}</button></div></article>; })}</div> : <p className="empty-gallery">Complete the 16-day mosaic to add your first illumination here.</p>}
    <div className="section-title"><h2>Friends</h2><button className="icon-label"><UserPlus size={13} /> Add friend</button></div>
    <div className="friends"><article><div className="friend-avatar">B</div><div><strong>BeatriceWrites</strong><small>14-day streak · 9 cards</small></div><button onClick={onSend}><Send size={12} /> Send</button></article><article><div className="friend-avatar blue">T</div><div><strong>theo.history</strong><small>6-day streak · 7 cards</small></div><button onClick={onSend}><Send size={12} /> Send</button></article></div>
    <button className="settings-button" onClick={onReset}><RotateCcw size={12} /> Reset demo progress</button>
    <a href="/admin" className="settings-button" style={{ marginTop: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", textDecoration: "none" }}>
      <PenTool size={13} /> Quilldrop Studio (Folio Cropper & Admin)
    </a>
  </div>;
}

function IlluminationMosaic({ pieces, compact = false }: { pieces: number; compact?: boolean }) {
  return <div className={`illumination-mosaic ${compact ? "compact" : ""}`} aria-label={`${pieces} of 16 illumination fragments revealed`}>
    <img src={ILLUMINATIONS[0].source} alt="The Learned Hare illumination in progress" />
    <div className="mosaic-cover" aria-hidden="true">{Array.from({ length: 16 }).map((_, i) => <span key={i} className={i < pieces ? "revealed" : "hidden"}>{i >= pieces ? i + 1 : ""}</span>)}</div>
  </div>;
}

function LevelUpModal({ level, onClose }: { level: number; onClose: () => void }) {
  return <div className="modal-backdrop level-up-backdrop"><section className="level-up-modal" role="dialog" aria-modal="true" aria-label={`Level ${level} reached`}>
    <div className="level-rays" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
    <Sparkles size={28} aria-hidden="true" />
    <p>Illumination complete</p><h2>Level {level}</h2>
    <div className="level-seal"><span>{level}</span></div>
    <strong>Masterwork reward unlocked</strong>
    <small>One Masterwork pack has been placed in your Bonus vault.</small>
    <button onClick={onClose}>Claim the reward</button>
  </section></div>;
}

function CardDetail({ card, count, onClose }: { card: Colophon; count: number; onClose: () => void }) {
  return <div className="modal-backdrop" onClick={onClose}><section className={`modal card-detail rarity-${card.rarity.toLowerCase()}`} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={card.title}><button className="close" onClick={onClose}>×</button><span className="rarity-label">{card.rarity}</span><div className="large-illustration"><ColophonImage card={card} alt={`Manuscript image for ${card.title}`} /></div><h2>{card.title}</h2><p className="latin">“{card.quote}”</p>{card.translation !== "Translation pending" && <p>{card.translation}</p>}<dl><div><dt>Scribe</dt><dd>{card.scribe}</dd></div><div><dt>Place & date</dt><dd>{card.place}, {card.year}</dd></div><div><dt>Manuscript</dt><dd>{card.manuscript}</dd></div><div><dt>Folio</dt><dd>{card.locus}</dd></div>{card.rarityReason && <div><dt>Why {card.rarity}?</dt><dd>{card.rarityReason}</dd></div>}<div><dt>Copies owned</dt><dd>{count}</dd></div></dl><a className="source-link" href={card.sourceUrl} target="_blank" rel="noreferrer">Open image source</a></section></div>;
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
      <div className="reveal-kicker"><span>{quality} pack</span><b>Card {position} of {total}</b></div>
      <button className="card-back" onClick={beginReveal} disabled={tension} aria-label={`Reveal card ${position} of ${total}`}>
        <div className="card-back-frame"><span>Q</span><small>{tension ? "The seal resists…" : "Tap to reveal"}</small></div>
      </button>
      <p className="reveal-whisper">{tension ? "Something ancient is waking…" : "The ink is stirring beneath the parchment…"}</p>
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
      <div className="reveal-actions"><span>{position === total ? "The final voice" : `${total - position} still hidden`}</span><button onClick={onNext}>{position === total ? "Bind into collection" : "Draw the next card"} →</button></div>
    </>}
  </div>;
}

function GameModal({ kind, answer, step, setStep, onClose, onAnswer }: { kind: GameKind; answer: string | null; step: number; setStep: (n: number) => void; onClose: () => void; onAnswer: (correct: boolean) => void }) {
  const challengeCard = COLOPHONS[kind === "paleo" ? 0 : kind === "cipher" ? 1 : 2];
  const data = {
    mood: { title: "Scribe’s mood", intro: "How did this scribe feel?", quote: "The book is finally finished. My back aches, my eyes are dim, and now I want wine.", options: [["😌", "Peaceful"], ["😩", "Exhausted"], ["😡", "Furious"]], right: 1 },
    cipher: { title: "Crack the colophon", intro: "The vowels have vanished. Restore the phrase.", quote: "M_N_S  M_ _  D_L_T", options: [["Manus mea dolet", "My hand hurts"], ["Monas mea delet", "My monk erases"], ["Minus mio dalet", "A false trail"]], right: 0 },
    paleo: { title: "Palaeographer", intro: "Which script is shown below?", quote: "𝔔𝔲𝔦 𝔰𝔠𝔯𝔦𝔭𝔰𝔦𝔱 𝔰𝔠𝔯𝔦𝔟𝔞𝔱", options: [["Carolingian minuscule", "c. 800–1100"], ["Textualis", "c. 1200–1500"], ["Humanist script", "c. 1400–1600"]], right: 1 },
  }[kind];
  const reward = kind === "paleo" ? "Masterwork pack · Epic or better" : kind === "cipher" ? "Refined pack · Rare boosted" : "Standard bonus pack";
  return <div className="modal-backdrop" onClick={onClose}><section className={`modal game-modal game-${kind}`} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true"><button className="close" onClick={onClose}>×</button><p className="eyebrow">Bonus pack challenge</p><h2>{data.title}</h2><div className="reward-banner"><span>Reward</span><strong>{reward}</strong></div><div className="game-rule">{data.intro}</div><div className="challenge-manuscript"><ColophonImage card={challengeCard} alt="Manuscript detail used in this challenge" /><small>{challengeCard.manuscript} · {challengeCard.locus}</small></div><blockquote className={kind === "paleo" ? "paleo-text" : ""}>{data.quote}</blockquote><div className="game-options">{data.options.map((o, i) => <button key={i} disabled={!!answer} className={answer ? (i === data.right ? "correct" : "dim") : ""} onClick={() => onAnswer(i === data.right)}><span>{o[0]}</span><small>{o[1]}</small></button>)}</div>{answer === "wrong" && <p className="wrong-answer">Not quite—look for the clue in the wording.</p>}{step === 0 && <button className="hint" onClick={() => setStep(1)}>Need a hint?</button>}{step === 1 && <p className="hint-copy">Think about the physical feeling or the shape of the letters.</p>}</section></div>;
}

function MapModal({ state, onClose }: { state: GameState; onClose: () => void }) {
  const owned = COLOPHONS.filter(c => state.collection[c.id]);
  return <div className="modal-backdrop" onClick={onClose}><section className="modal map-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true"><button className="close" onClick={onClose}>×</button><p className="eyebrow">Voices across Europe</p><h2>Colophon map</h2><div className="old-map"><span className="land land-1" /><span className="land land-2" /><span className="land land-3" />{owned.slice(0, 6).map((c, i) => <button key={c.id} style={{ left: `${22 + (i * 13) % 58}%`, top: `${25 + (i * 19) % 47}%` }} title={`${c.title}, ${c.place}`}>✦</button>)}</div><div className="map-list">{owned.slice(0, 4).map(c => <span key={c.id}><b>{c.place.split(",")[0]}</b><small>{c.year}</small></span>)}</div></section></div>;
}
