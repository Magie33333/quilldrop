export type TrophyDifficulty = "easy" | "medium" | "hard" | "impossible";

export interface TrophyCategoryItem {
  id: string;
  label_cs: string;
  label_en: string;
  icon: string;
  description_cs?: string;
  description_en?: string;
}

export type TrophyConditionType =
  | "collection_count"      // Počet karet / kolofonů ve sbírce
  | "specific_card"         // Vlastnictví konkrétního rukopisu / karty (dle UUID nebo ID)
  | "rarity_owned"          // Vlastnictví alespoň 1 karty dané rarity
  | "rarity_count"          // Počet karet dané rarity
  | "packs_opened"          // Celkový počet otevřených balíčků
  | "pack_quality_opened"   // Otevření balíčku konkrétní kvality (standard, refined, masterwork)
  | "games_played"          // Celkový počet splněných miniher
  | "game_mode_played"      // Počet splněných miniher konkrétního typu (transcription, cipher, script, mood)
  | "transcription_accuracy"// Dosažení přesnosti přepisu (např. 100 %)
  | "streak_days"           // Délka denního bádání / streak (dny)
  | "mosaic_pieces"         // Počet složených dílků iluminace / mozaiky (16 dílků)
  | "player_level"          // Úroveň hráče
  | "player_xp"             // Celkový počet získaných XP
  | "player_coins"          // Množství zlaťáků v pokladnici
  | "gift_sent"             // Počet darovaných / vyměněných karet
  | "loupe_zoom"            // Použití paleografické lupy na 1000 %
  | "night_scribe"          // Noční bádání (mezi 00:00 a 04:00)
  | "scriptorium_place"     // Karta z konkrétního skriptoria / města
  | "curio_unlocked"        // Přečtení / odemčení kuriozit či glos
  | "custom";               // Vlastní podmínka nebo tajný kód

export interface TrophyCondition {
  id?: string;
  type: TrophyConditionType;
  operator?: ">=" | "<=" | "==" | "includes";
  value?: string | number;
  target?: string;
}

export interface TrophyItem {
  id: string;
  title: string;
  title_en: string;
  text: string;
  text_en: string;
  xp: number;
  initial: string;
  image_url?: string;
  difficulty: TrophyDifficulty;
  category: string; // ID kategorie (dynamická)
  conditions?: TrophyCondition[];
  // Zpětná kompatibilita
  requirement_type?: string;
  requirement_value?: number | string;
}

export const TROPHY_DIFFICULTY_META: Record<
  TrophyDifficulty,
  { label_cs: string; label_en: string; color: string; border: string; bg: string; defaultXp: number }
> = {
  easy: {
    label_cs: "Lehká",
    label_en: "Easy",
    color: "#2e7d32",
    border: "#81c784",
    bg: "#e8f5e9",
    defaultXp: 75,
  },
  medium: {
    label_cs: "Střední",
    label_en: "Medium",
    color: "#b26a00",
    border: "#ffb74d",
    bg: "#fff8e1",
    defaultXp: 200,
  },
  hard: {
    label_cs: "Těžká",
    label_en: "Hard",
    color: "#c62828",
    border: "#e57373",
    bg: "#ffebee",
    defaultXp: 400,
  },
  impossible: {
    label_cs: "Nemožná",
    label_en: "Impossible",
    color: "#6a1b9a",
    border: "#ba68c8",
    bg: "#f3e5f5",
    defaultXp: 1000,
  },
};

export const DEFAULT_TROPHY_CATEGORIES: TrophyCategoryItem[] = [
  {
    id: "collection",
    label_cs: "Sběratelství",
    label_en: "Collection",
    icon: "📚",
    description_cs: "Získávání karet, kompletace sbírek a vzácné kolofony",
    description_en: "Collecting cards, completing sets, and rare colophons",
  },
  {
    id: "study",
    label_cs: "Bádání & streaky",
    label_en: "Study & Streaks",
    icon: "🕯️",
    description_cs: "Pravidelné denní bádání, úrovně, skládání iluminací a rituály",
    description_en: "Daily study streaks, leveling up, and illumination mosaics",
  },
  {
    id: "palaeography",
    label_cs: "Paleografie & výzvy",
    label_en: "Palaeography & Challenges",
    icon: "🔍",
    description_cs: "Přepisy řádků, luštění písem a písařské zkoušky",
    description_en: "Transcriptions, script recognition, and scribal trials",
  },
  {
    id: "community",
    label_cs: "Společenství",
    label_en: "Community",
    icon: "🤝",
    description_cs: "Výměny na tržišti, dary kolegům a pospolitost skriptoria",
    description_en: "Market trades, gifts to fellow scholars, and scriptorium bonds",
  },
  {
    id: "secrets",
    label_cs: "Tajemství & kuriozity",
    label_en: "Secrets & Curios",
    icon: "🗝️",
    description_cs: "Skryté šifry, noční bádání, glosy a zapomenuté klenoty",
    description_en: "Hidden ciphers, night scribing, curios, and lost relics",
  },
];

export const TROPHY_CONDITION_META: Record<
  TrophyConditionType,
  {
    label_cs: string;
    label_en: string;
    icon: string;
    description_cs: string;
    value_type: "number" | "select" | "text" | "none";
    unit_cs?: string;
    options?: { value: string; label_cs: string }[];
  }
> = {
  collection_count: {
    label_cs: "Počet karet ve sbírce",
    label_en: "Cards in Collection",
    icon: "📜",
    description_cs: "Celkový počet unikátních kolofonů/karet ve sbírce hráče",
    value_type: "number",
    unit_cs: "karet",
  },
  specific_card: {
    label_cs: "Vlastnictví konkrétního rukopisu",
    label_en: "Own Specific Manuscript",
    icon: "🎴",
    description_cs: "Vlastnictví konkrétní karty (dle ID, názvu nebo signatury)",
    value_type: "text",
  },
  rarity_owned: {
    label_cs: "Vlastnictví karty o dané raritě",
    label_en: "Own Card of Rarity",
    icon: "⭐",
    description_cs: "Hráč vlastní alespoň 1 kartu zvolené rarity",
    value_type: "select",
    options: [
      { value: "Common", label_cs: "Common (Běžná)" },
      { value: "Uncommon", label_cs: "Uncommon (Neobyčejná)" },
      { value: "Rare", label_cs: "Rare (Vzácná)" },
      { value: "Epic", label_cs: "Epic (Epická)" },
      { value: "Legendary", label_cs: "Legendary (Legendární)" },
      { value: "Unique", label_cs: "Unique (Unikátní)" },
    ],
  },
  rarity_count: {
    label_cs: "Počet karet určité rarity",
    label_en: "Count of Rarity Cards",
    icon: "✨",
    description_cs: "Počet karet zvolené rarity ve sbírce",
    value_type: "number",
    unit_cs: "karet",
    options: [
      { value: "Rare", label_cs: "Rare (Vzácná)" },
      { value: "Epic", label_cs: "Epic (Epická)" },
      { value: "Legendary", label_cs: "Legendary (Legendární)" },
      { value: "Unique", label_cs: "Unique (Unikátní)" },
    ],
  },
  packs_opened: {
    label_cs: "Celkový počet otevřených balíčků",
    label_en: "Total Packs Opened",
    icon: "📦",
    description_cs: "Celkový počet balíčků, které hráč otevřel ve skriptoriu",
    value_type: "number",
    unit_cs: "balíčků",
  },
  pack_quality_opened: {
    label_cs: "Otevření balíčku specifické kvality",
    label_en: "Opened Pack Quality",
    icon: "👑",
    description_cs: "Hráč otevřel balíček dané úrovně",
    value_type: "select",
    options: [
      { value: "standard", label_cs: "Běžný balíček" },
      { value: "refined", label_cs: "Učencův balíček (Refined)" },
      { value: "masterwork", label_cs: "Královský balíček (Masterwork)" },
      { value: "curio", label_cs: "Kuriozní balíček" },
    ],
  },
  games_played: {
    label_cs: "Počet splněných miniher celkem",
    label_en: "Total Minigames Solved",
    icon: "🎮",
    description_cs: "Celkový počet úspěšně splněných písařských miniher",
    value_type: "number",
    unit_cs: "miniher",
  },
  game_mode_played: {
    label_cs: "Splněné minihry konkrétního režimu",
    label_en: "Minigames by Mode",
    icon: "✍️",
    description_cs: "Počet splněných miniher dané disciplíny",
    value_type: "number",
    unit_cs: "her",
    options: [
      { value: "transcription", label_cs: "Transkripce (přepis řádků)" },
      { value: "cipher", label_cs: "Šifra a kryptogram" },
      { value: "script", label_cs: "Poznání písma" },
      { value: "mood", label_cs: "Nálada písaře" },
    ],
  },
  transcription_accuracy: {
    label_cs: "Přesnost přepisu (100 % shoda)",
    label_en: "Transcription Accuracy",
    icon: "🎯",
    description_cs: "Dosažení dokonalé nebo vysoké přesnosti při transkripci",
    value_type: "number",
    unit_cs: "%",
  },
  streak_days: {
    label_cs: "Délka denního bádání (streak)",
    label_en: "Daily Study Streak",
    icon: "🕯️",
    description_cs: "Počet po sobě jdoucích dní každodenní návštěvy skriptoria",
    value_type: "number",
    unit_cs: "dní",
  },
  mosaic_pieces: {
    label_cs: "Dokončené dílky mozaiky (16 dílků)",
    label_en: "Mosaic Pieces Completed",
    icon: "🧩",
    description_cs: "Počet složených dílků iluminované mozaiky (16 = hotový obraz)",
    value_type: "number",
    unit_cs: "dílků",
  },
  player_level: {
    label_cs: "Dosažená úroveň hráče (Level)",
    label_en: "Player Level Reached",
    icon: "🌟",
    description_cs: "Minimální dosažená úroveň písaře",
    value_type: "number",
    unit_cs: "úroveň",
  },
  player_xp: {
    label_cs: "Celkový počet získaných XP",
    label_en: "Total XP Earned",
    icon: "⚡",
    description_cs: "Hráč dosáhl stanovené hodnoty zkušeností",
    value_type: "number",
    unit_cs: "XP",
  },
  player_coins: {
    label_cs: "Množství zlaťáků v pokladnici",
    label_en: "Gold Coins Balance",
    icon: "💰",
    description_cs: "Zůstatek grošů / zlaťáků v písařské truhlici",
    value_type: "number",
    unit_cs: "zlaťáků",
  },
  gift_sent: {
    label_cs: "Darování či výměna karty",
    label_en: "Gift or Trade Completed",
    icon: "🤝",
    description_cs: "Hráč daroval nebo směnil kartu s kolegou",
    value_type: "number",
    unit_cs: "výměn",
  },
  loupe_zoom: {
    label_cs: "Použití paleografické lupy na 1000 %",
    label_en: "Use Loupe at 1000% Zoom",
    icon: "🔎",
    description_cs: "Přiblížení detailu osvětlených řádků až na maximální zvětšení",
    value_type: "none",
  },
  night_scribe: {
    label_cs: "Noční bádání (mezi 00:00 a 04:00)",
    label_en: "Night Scribe (00:00-04:00)",
    icon: "🌙",
    description_cs: "Aktivita v temných nočních hodinách při svitu svíce",
    value_type: "none",
  },
  scriptorium_place: {
    label_cs: "Kodex z konkrétního města / kláštera",
    label_en: "Manuscript from Scriptorium",
    icon: "🏛️",
    description_cs: "Hráč vlastní kodex pocházející z vybrané lokality",
    value_type: "select",
    options: [
      { value: "praha", label_cs: "Praha (Klementinum / NK ČR)" },
      { value: "vyssi-brod", label_cs: "Vyšší Brod (Cisterciáci)" },
      { value: "olomouc", label_cs: "Olomouc (Vědecká knihovna)" },
      { value: "roudnice", label_cs: "Roudnice nad Labem (Augustiniáni)" },
      { value: "krakov", label_cs: "Krakov (Biblioteka Jagiellońska)" },
    ],
  },
  curio_unlocked: {
    label_cs: "Přečtení glos a kuriozit",
    label_en: "Curios & Marginalia Read",
    icon: "📖",
    description_cs: "Hráč prozkoumal a odemkl písařské glosy či marginálie",
    value_type: "number",
    unit_cs: "glos",
  },
  custom: {
    label_cs: "Vlastní / Speciální podmínka",
    label_en: "Custom / Special Requirement",
    icon: "🗝️",
    description_cs: "Ručně zadaný klíč nebo podmínka vyhodnocovaná specificky",
    value_type: "text",
  },
};

// Zpětná kompatibilita pro TROPHY_CATEGORY_META
export const TROPHY_CATEGORY_META: Record<string, { label_cs: string; label_en: string; icon: string }> = {
  collection: { label_cs: "Sběratelství", label_en: "Collection", icon: "📚" },
  study: { label_cs: "Bádání & streaky", label_en: "Study & Streaks", icon: "🕯️" },
  palaeography: { label_cs: "Paleografie & výzvy", label_en: "Palaeography & Challenges", icon: "🔍" },
  community: { label_cs: "Společenství", label_en: "Community", icon: "🤝" },
  secrets: { label_cs: "Tajemství & kuriozity", label_en: "Secrets & Curios", icon: "🗝️" },
};

export const DEFAULT_TROPHIES: TrophyItem[] = [
  {
    id: "first-spark",
    title: "První jiskra",
    title_en: "First Spark",
    text: "Vstupte do skriptoria a otevřete svůj první balíček",
    text_en: "Enter the scriptorium and open your first pack",
    xp: 75,
    initial: "Q",
    difficulty: "easy",
    category: "study",
    conditions: [{ type: "packs_opened", value: 1 }],
    requirement_type: "packs_opened",
    requirement_value: 1,
  },
  {
    id: "first-pack",
    title: "Lamač pečetí",
    title_en: "Seal Breaker",
    text: "Získejte alespoň 5 různých kolofonů do své sbírky",
    text_en: "Collect at least 5 different colophons in your library",
    xp: 100,
    initial: "S",
    difficulty: "easy",
    category: "collection",
    conditions: [{ type: "collection_count", value: 5 }],
    requirement_type: "collection_count",
    requirement_value: 5,
  },
  {
    id: "initial-master",
    title: "Zlatá iniciála",
    title_en: "Golden Initial",
    text: "Získejte kartu kolofonu zdobenou iluminovanou iniciálou",
    text_en: "Acquire a colophon card adorned with an illuminated initial",
    xp: 100,
    initial: "M",
    difficulty: "easy",
    category: "collection",
    conditions: [{ type: "custom", target: "initial", value: "initial" }],
    requirement_type: "custom",
    requirement_value: "initial",
  },
  {
    id: "collector",
    title: "Zkušený tovaryš",
    title_en: "Journeyman Scribe",
    text: "Shromážděte alespoň 10 různých středověkých kodexů",
    text_en: "Gather at least 10 unique medieval codices",
    xp: 250,
    initial: "A",
    difficulty: "medium",
    category: "collection",
    conditions: [{ type: "collection_count", value: 10 }],
    requirement_type: "collection_count",
    requirement_value: 10,
  },
  {
    id: "streak-7",
    title: "Týden ve skriptoriu",
    title_en: "Week in the Scriptorium",
    text: "Udržte 7 dní nepřetržitého každodenního bádání",
    text_en: "Maintain a continuous 7-day daily study streak",
    xp: 200,
    initial: "T",
    difficulty: "medium",
    category: "study",
    conditions: [{ type: "streak_days", value: 7 }],
    requirement_type: "streak",
    requirement_value: 7,
  },
  {
    id: "prague-scholar",
    title: "Pražský magistr",
    title_en: "Prague Magister",
    text: "Získejte alespoň 3 kodexy z pražských skriptorií",
    text_en: "Collect at least 3 codices from Prague scriptoria",
    xp: 250,
    initial: "P",
    difficulty: "medium",
    category: "secrets",
    conditions: [{ type: "scriptorium_place", target: "praha", value: 3 }],
    requirement_type: "custom",
    requirement_value: "praha",
  },
  {
    id: "verse-lover",
    title: "Pěvec latinský",
    title_en: "Latin Versifier",
    text: "Získejte veršovaný či rýmovaný kolofon do sbírky",
    text_en: "Acquire a rhymed or metrical colophon into your collection",
    xp: 200,
    initial: "C",
    difficulty: "medium",
    category: "collection",
    conditions: [{ type: "custom", target: "verse", value: "verse" }],
    requirement_type: "custom",
    requirement_value: "verse",
  },
  {
    id: "rare-seeker",
    title: "Sběratel kuriozit",
    title_en: "Curio Collector",
    text: "Získejte alespoň jednu vzácnou (Rare) či epickou (Epic) kartu",
    text_en: "Acquire at least one Rare or Epic colophon card",
    xp: 250,
    initial: "E",
    difficulty: "medium",
    category: "collection",
    conditions: [{ type: "rarity_owned", target: "Rare", value: "Rare" }],
    requirement_type: "rarity_owned",
    requirement_value: "Rare",
  },
  {
    id: "philanthropist",
    title: "Štědrý tovaryš",
    title_en: "Generous Fellow",
    text: "Darujte duplicitní kartu svému kolegovi ve skriptoriu",
    text_en: "Gift a duplicate colophon to a colleague in the scriptorium",
    xp: 200,
    initial: "F",
    difficulty: "medium",
    category: "community",
    conditions: [{ type: "gift_sent", value: 1 }],
    requirement_type: "gift_sent",
    requirement_value: 1,
  },
  {
    id: "bibliophile",
    title: "Knihovník Klementina",
    title_en: "Clementinum Librarian",
    text: "Vlastněte alespoň 20 různých kodexů a pergamenů",
    text_en: "Possess at least 20 unique codices and charters",
    xp: 500,
    initial: "K",
    difficulty: "hard",
    category: "collection",
    conditions: [{ type: "collection_count", value: 20 }],
    requirement_type: "collection_count",
    requirement_value: 20,
  },
  {
    id: "streak",
    title: "Vytrvalý iluminátor",
    title_en: "Steadfast Illuminator",
    text: "Udržte 16 dní nepřetržité návštěvy a složte mozaiku",
    text_en: "Maintain a 16-day streak and assemble the full mosaic",
    xp: 400,
    initial: "I",
    difficulty: "hard",
    category: "study",
    conditions: [{ type: "streak_days", value: 16 }],
    requirement_type: "streak",
    requirement_value: 16,
  },
  {
    id: "vyssi-brod",
    title: "Vyšebrodský mnich",
    title_en: "Monk of Vyšší Brod",
    text: "Vlastněte kodex z cisterciáckého kláštera Vyšší Brod",
    text_en: "Own a codex from the Cistercian monastery of Vyšší Brod",
    xp: 350,
    initial: "V",
    difficulty: "hard",
    category: "secrets",
    conditions: [{ type: "scriptorium_place", target: "vyssi-brod", value: 1 }],
    requirement_type: "custom",
    requirement_value: "vyssi-brod",
  },
  {
    id: "cipher-breaker",
    title: "Lamač šifer",
    title_en: "Cipher Breaker",
    text: "Najděte a vlastněte kolofon se šifrou či kryptogramem",
    text_en: "Discover and own a colophon containing a cipher or cryptogram",
    xp: 400,
    initial: "X",
    difficulty: "hard",
    category: "secrets",
    conditions: [{ type: "custom", target: "cipher", value: "cipher" }],
    requirement_type: "custom",
    requirement_value: "cipher",
  },
  {
    id: "paleographer",
    title: "Písařský mistr",
    title_en: "Master Palaeographer",
    text: "Úspěšně absolvujte alespoň 5 písařských výzev",
    text_en: "Successfully pass at least 5 scribal challenges",
    xp: 400,
    initial: "D",
    difficulty: "hard",
    category: "palaeography",
    conditions: [{ type: "games_played", value: 5 }],
    requirement_type: "games_played",
    requirement_value: 5,
  },
  {
    id: "loupe-max",
    title: "Oko ostříže",
    title_en: "Hawk's Eye",
    text: "Prozkoumejte písařské tahy s paleografickou lupou při 1000% zvětšení",
    text_en: "Examine scribal strokes with the palaeographical loupe at 1000% zoom",
    xp: 200,
    initial: "🔎",
    difficulty: "medium",
    category: "palaeography",
    conditions: [{ type: "loupe_zoom" }],
  },
  {
    id: "night-owl",
    title: "Noční písař",
    title_en: "Midnight Scribe",
    text: "Bádejte ve skriptoriu při svitu svíčky mezi půlnocí a 4. hodinou ranní",
    text_en: "Study in the scriptorium by candlelight between midnight and 4 AM",
    xp: 300,
    initial: "🌙",
    difficulty: "hard",
    category: "secrets",
    conditions: [{ type: "night_scribe" }],
  },
  {
    id: "unique",
    title: "Zlacené tajemství",
    title_en: "Gilded Mystery",
    text: "Najděte Unikátní (Unique) monumentální kolofon",
    text_en: "Discover a Unique monumental colophon",
    xp: 500,
    initial: "G",
    difficulty: "hard",
    category: "collection",
    conditions: [{ type: "rarity_owned", target: "Unique", value: "Unique" }],
    requirement_type: "rarity_owned",
    requirement_value: "Unique",
  },
  {
    id: "mosaic-master",
    title: "Mistr iluminátor",
    title_en: "Master Illuminator",
    text: "Složte celou 16dílnou mozaiku alespoň jednoho cyklu",
    text_en: "Complete the full 16-piece mosaic of at least one cycle",
    xp: 1000,
    initial: "Z",
    difficulty: "impossible",
    category: "study",
    conditions: [{ type: "mosaic_pieces", value: 16 }],
    requirement_type: "puzzle_completed",
    requirement_value: 16,
  },
];

export const TROPHIES_STORAGE_KEY = "quilldrop-trophies";
export const TROPHY_CATEGORIES_STORAGE_KEY = "quilldrop-trophy-categories";

// Správa kategorií
export function getStoredTrophyCategories(): TrophyCategoryItem[] {
  if (typeof window === "undefined") return DEFAULT_TROPHY_CATEGORIES;
  try {
    const raw = localStorage.getItem(TROPHY_CATEGORIES_STORAGE_KEY);
    if (!raw) return DEFAULT_TROPHY_CATEGORIES;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_TROPHY_CATEGORIES;
    return parsed;
  } catch (err) {
    console.warn("Failed to load trophy categories from localStorage", err);
    return DEFAULT_TROPHY_CATEGORIES;
  }
}

export function saveStoredTrophyCategories(categories: TrophyCategoryItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TROPHY_CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  } catch (err) {
    console.warn("Failed to save trophy categories to localStorage", err);
  }
}

// Správa výzev
export function getStoredTrophies(): TrophyItem[] {
  if (typeof window === "undefined") return DEFAULT_TROPHIES;
  try {
    const raw = localStorage.getItem(TROPHIES_STORAGE_KEY);
    if (!raw) return DEFAULT_TROPHIES;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_TROPHIES;

    return parsed.map((item: any) => {
      const def = DEFAULT_TROPHIES.find((d) => d.id === item.id);
      return {
        id: item.id || def?.id || `trophy-${Date.now()}`,
        title: item.title || def?.title || "Nová výzva",
        title_en: item.title_en || def?.title_en || "New Challenge",
        text: item.text || def?.text || "",
        text_en: item.text_en || def?.text_en || "",
        xp: typeof item.xp === "number" ? item.xp : (def?.xp || 100),
        initial: item.initial || def?.initial || "🏆",
        image_url: item.image_url || def?.image_url,
        difficulty: item.difficulty || def?.difficulty || "medium",
        category: item.category || def?.category || "collection",
        conditions: item.conditions || def?.conditions || (item.requirement_type ? [{ type: item.requirement_type, value: item.requirement_value }] : []),
        requirement_type: item.requirement_type || def?.requirement_type || "custom",
        requirement_value: item.requirement_value ?? def?.requirement_value,
      };
    });
  } catch (err) {
    console.warn("Failed to load trophies from localStorage", err);
    return DEFAULT_TROPHIES;
  }
}

export function saveStoredTrophies(trophies: TrophyItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TROPHIES_STORAGE_KEY, JSON.stringify(trophies));
  } catch (err) {
    console.warn("Failed to save trophies to localStorage", err);
  }
}

/**
 * Vyhodnocení jedné podmínky výzvy
 */
export function evaluateCondition(
  cond: TrophyCondition,
  state: any,
  cards: any[],
  extraContext?: {
    accuracy?: number;
    gameMode?: string;
    packQuality?: string;
    loupeMaxUsed?: boolean;
    nowHour?: number;
  }
): boolean {
  if (!cond || !cond.type) return false;
  const numVal = Number(cond.value || 0);

  switch (cond.type) {
    case "collection_count":
      return Object.keys(state?.collection || {}).length >= (numVal || 1);

    case "specific_card": {
      const cardKey = String(cond.target || cond.value || "").toLowerCase();
      if (!cardKey) return false;
      return cards.some(
        (c) =>
          state?.collection?.[c.id] &&
          (String(c.id).toLowerCase() === cardKey ||
            c.uuid?.toLowerCase() === cardKey ||
            c.manuscript?.toLowerCase().includes(cardKey))
      );
    }

    case "rarity_owned": {
      const targetRarity = cond.target || cond.value || "Rare";
      return cards.some(
        (c) =>
          state?.collection?.[c.id] &&
          (c.rarity === targetRarity || (targetRarity === "Rare" && ["Rare", "Epic", "Legendary", "Unique"].includes(c.rarity)))
      );
    }

    case "rarity_count": {
      const targetRarity = cond.target || "Rare";
      const count = cards.filter((c) => state?.collection?.[c.id] && c.rarity === targetRarity).length;
      return count >= (numVal || 1);
    }

    case "packs_opened":
      return (state?.packsOpened || 0) >= (numVal || 1);

    case "pack_quality_opened": {
      const targetQ = cond.target || cond.value;
      if (extraContext?.packQuality && extraContext.packQuality === targetQ) return true;
      return Boolean(state?.bonusPacks?.includes(targetQ));
    }

    case "games_played":
      return (state?.gamesPlayed || 0) >= (numVal || 1);

    case "game_mode_played": {
      // V historii her nebo extra kontextu
      if (extraContext?.gameMode && extraContext.gameMode === cond.target) return true;
      return (state?.gamesPlayed || 0) >= (numVal || 1);
    }

    case "transcription_accuracy": {
      const targetAcc = numVal || 100;
      return (extraContext?.accuracy || 0) >= targetAcc;
    }

    case "streak_days":
      return (state?.streak || 0) >= (numVal || 1);

    case "mosaic_pieces":
      return (state?.puzzle || 0) >= (numVal || 16) || Boolean(state?.gallery && state.gallery.length > 0);

    case "player_level":
      return (state?.level || 1) >= (numVal || 1);

    case "player_xp":
      return (state?.xp || 0) >= (numVal || 100);

    case "player_coins":
      return (state?.coins || 0) >= (numVal || 100);

    case "gift_sent":
      return (state?.dailyTradedPartners?.length || 0) >= (numVal || 1) || Boolean(state?.trophies?.includes("philanthropist"));

    case "loupe_zoom":
      return Boolean(extraContext?.loupeMaxUsed || state?.loupeMaxUsed || state?.trophies?.includes("loupe-max"));

    case "night_scribe": {
      const hour = extraContext?.nowHour !== undefined ? extraContext.nowHour : new Date().getHours();
      return (hour >= 0 && hour < 4) || Boolean(state?.trophies?.includes("night-owl"));
    }

    case "scriptorium_place": {
      const placeKey = String(cond.target || cond.value || "").toLowerCase();
      const count = cards.filter(
        (c) =>
          state?.collection?.[c.id] &&
          (c.place?.toLowerCase().includes(placeKey) ||
            c.manuscript?.toLowerCase().includes(placeKey) ||
            (placeKey === "praha" && c.manuscript?.toLowerCase().includes("nkp")) ||
            (placeKey === "vyssi-brod" && c.manuscript?.toLowerCase().includes("vb")))
      ).length;
      return count >= (numVal || 1);
    }

    case "curio_unlocked":
      return (state?.curiosUnlocked?.length || 0) >= (numVal || 1);

    case "custom": {
      const val = String(cond.target || cond.value || "");
      if (val === "initial") {
        return cards.some((c) => state?.collection?.[c.id] && ((c as any).features?.includes("Iniciála") || (c as any).colophons?.features?.includes("Iniciála")));
      }
      if (val === "verse") {
        return cards.some((c) => state?.collection?.[c.id] && ((c as any).features?.includes("Verše") || (c as any).colophons?.features?.includes("Verše")));
      }
      if (val === "cipher") {
        return cards.some((c) => state?.collection?.[c.id] && ((c as any).features?.includes("Šifra") || (c as any).colophons?.features?.includes("Šifra")));
      }
      if (val === "praha") {
        return cards.filter((c) => state?.collection?.[c.id] && (c.place?.toLowerCase().includes("praha") || c.manuscript?.toLowerCase().includes("praha") || c.manuscript?.toLowerCase().includes("nkp"))).length >= 3;
      }
      if (val === "vyssi-brod") {
        return cards.some((c) => state?.collection?.[c.id] && (c.place?.toLowerCase().includes("brod") || c.manuscript?.toLowerCase().includes("vb")));
      }
      return Boolean(state?.trophies?.includes(cond.target || cond.value));
    }

    default:
      return false;
  }
}

/**
 * Vyhodnotí, zda je výzva splněna (všechny podmínky musí platit - AND)
 */
export function evaluateTrophy(
  trophy: TrophyItem,
  state: any,
  cards: any[],
  extraContext?: any
): boolean {
  if (!trophy) return false;
  if (state?.trophies?.includes(trophy.id)) return true;

  // Pokud má definované podmínky
  if (trophy.conditions && trophy.conditions.length > 0) {
    return trophy.conditions.every((cond) => evaluateCondition(cond, state, cards, extraContext));
  }

  // Fallback na starší requirement_type
  if (trophy.requirement_type) {
    return evaluateCondition(
      {
        type: trophy.requirement_type as any,
        value: trophy.requirement_value,
        target: String(trophy.requirement_value || ""),
      },
      state,
      cards,
      extraContext
    );
  }

  // Fallback dle ID
  switch (trophy.id) {
    case "first-spark":
      return (state?.packsOpened || 0) >= 1;
    case "first-pack":
      return Object.keys(state?.collection || {}).length >= 5;
    case "collector":
      return Object.keys(state?.collection || {}).length >= 10;
    case "bibliophile":
      return Object.keys(state?.collection || {}).length >= 20;
    case "streak-7":
      return (state?.streak || 0) >= 7;
    case "streak":
      return (state?.streak || 0) >= 16 || (state?.puzzle || 0) >= 16;
    case "mosaic-master":
      return (state?.puzzle || 0) >= 16 || Boolean(state?.gallery && state.gallery.length > 0);
    case "paleographer":
      return (state?.gamesPlayed || 0) >= 5;
    default:
      return false;
  }
}
