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
  | "collection_count"       // Počet karet / kolofonů ve sbírce
  | "specific_card"          // Vlastnictví konkrétního rukopisu / karty (dle UUID nebo ID)
  | "rarity_owned"           // Vlastnictví alespoň 1 karty dané rarity
  | "rarity_count"           // Počet karet dané rarity
  | "packs_opened"           // Celkový počet otevřených balíčků
  | "pack_quality_opened"    // Otevření balíčku konkrétní kvality (standard, refined, masterwork)
  | "games_played"           // Celkový počet splněných miniher
  | "game_mode_played"       // Počet splněných miniher konkrétního typu (transcription, cipher, script, mood)
  | "transcription_accuracy" // Dosažení přesnosti přepisu (např. 100 %)
  | "streak_days"            // Délka denního bádání / streak (dny)
  | "mosaic_pieces"          // Počet složených dílků iluminace / mozaiky (16 dílků)
  | "player_level"           // Úroveň hráče
  | "player_xp"              // Celkový počet získaných XP
  | "player_coins"           // Množství zlaťáků v pokladnici
  | "gift_sent"              // Počet darovaných / vyměněných karet
  | "loupe_zoom"             // Použití paleografické lupy na 1000 %
  | "night_scribe"           // Noční bádání (mezi 22:00 a 04:00)
  | "scriptorium_place"      // Karta z konkrétního skriptoria / města
  | "multiple_places"        // Kodexy z několika různých měst / skriptorií
  | "curio_unlocked"         // Přečtení / odemčení kuriozit či glos
  | "cipher"                 // Vlastnictví kolofonu se šifrou či kryptogramem
  | "initial"                // Vlastnictví kolofonu s iluminovanou iniciálou
  | "verse"                  // Vlastnictví veršovaného kolofonu
  | "custom";                // Vlastní podmínka nebo tajný kód

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

export interface TrophyConditionMetaItem {
  label_cs: string;
  label_en: string;
  icon: string;
  description_cs: string;
  has_operator?: boolean;
  has_target?: boolean;
  target_label_cs?: string;
  target_options?: { value: string; label_cs: string }[];
  has_value?: boolean;
  value_label_cs?: string;
  value_type?: "number" | "select" | "text" | "none";
  unit_cs?: string;
  default_target?: string;
  default_value?: string | number;
}

export const TROPHY_OPERATOR_OPTIONS: { value: ">=" | "=="; label_cs: string; label_short: string }[] = [
  { value: ">=", label_cs: "Alespoň (≥)", label_short: "≥" },
  { value: "==", label_cs: "Přesně (=)", label_short: "=" },
];

export const TROPHY_CONDITION_META: Record<TrophyConditionType, TrophyConditionMetaItem> = {
  collection_count: {
    label_cs: "Celkový počet karet ve sbírce",
    label_en: "Cards in Collection",
    icon: "📜",
    description_cs: "Celkový počet unikátních kolofonů/karet ve sbírce hráče",
    has_operator: true,
    has_target: false,
    has_value: true,
    value_label_cs: "Počet karet",
    value_type: "number",
    unit_cs: "karet",
    default_value: 10,
  },
  specific_card: {
    label_cs: "Vlastnictví konkrétního rukopisu",
    label_en: "Own Specific Manuscript",
    icon: "🎴",
    description_cs: "Vlastnictví konkrétní karty (dle ID, signatury či názvu)",
    has_operator: false,
    has_target: true,
    target_label_cs: "Signatura / Název / ID",
    has_value: false,
    value_type: "none",
  },
  rarity_owned: {
    label_cs: "Vlastnictví karty o dané raritě",
    label_en: "Own Card of Rarity",
    icon: "⭐",
    description_cs: "Hráč musí vlastnit alespoň 1 kartu dané nebo vyšší rarity",
    has_operator: false,
    has_target: true,
    target_label_cs: "Požadovaná rarita (nebo vyšší)",
    target_options: [
      { value: "Unique", label_cs: "🟣 Unikátní (Unique)" },
      { value: "Legendary", label_cs: "🟡 Legendární (Legendary) a vyšší" },
      { value: "Epic", label_cs: "🟣 Epická (Epic) a vyšší" },
      { value: "Rare", label_cs: "🔵 Vzácná (Rare) a vyšší" },
      { value: "Uncommon", label_cs: "🟢 Neobyčejná (Uncommon) a vyšší" },
    ],
    default_target: "Unique",
    has_value: false,
    value_type: "none",
  },
  rarity_count: {
    label_cs: "Počet karet určité rarity",
    label_en: "Count of Rarity Cards",
    icon: "✨",
    description_cs: "Hráč musí mít ve sbírce stanovený počet karet zvolené rarity (či jejich kombinace)",
    has_operator: true,
    has_target: true,
    target_label_cs: "Které rarity?",
    target_options: [
      { value: "LegendaryOrUnique", label_cs: "👑 Legendární nebo Unikátní (součet obou nejvyšších rarit)" },
      { value: "FiveLegendaryOrFiveUnique", label_cs: "🟡 Buď N Legendárních, NEBO N Unikátních" },
      { value: "EpicOrHigher", label_cs: "✨ Epická a vyšší (Epic, Legendary, Unique)" },
      { value: "RareOrHigher", label_cs: "💎 Vzácná a vyšší (Rare, Epic, Legendary, Unique)" },
      { value: "Unique", label_cs: "🟣 Pouze Unikátní (Unique)" },
      { value: "Legendary", label_cs: "🟡 Pouze Legendární (Legendary)" },
      { value: "Epic", label_cs: "🟣 Pouze Epická (Epic)" },
      { value: "Rare", label_cs: "🔵 Pouze Vzácná (Rare)" },
      { value: "Uncommon", label_cs: "🟢 Pouze Neobyčejná (Uncommon)" },
      { value: "Common", label_cs: "⚪ Pouze Běžná (Common)" },
    ],
    default_target: "LegendaryOrUnique",
    has_value: true,
    value_label_cs: "Počet karet",
    value_type: "number",
    unit_cs: "karet",
    default_value: 5,
  },
  packs_opened: {
    label_cs: "Celkový počet otevřených balíčků",
    label_en: "Total Packs Opened",
    icon: "📦",
    description_cs: "Celkový počet balíčků, které hráč otevřel ve skriptoriu",
    has_operator: true,
    has_target: false,
    has_value: true,
    value_label_cs: "Počet balíčků",
    value_type: "number",
    unit_cs: "balíčků",
    default_value: 10,
  },
  pack_quality_opened: {
    label_cs: "Otevření balíčku specifické kvality",
    label_en: "Opened Pack Quality",
    icon: "👑",
    description_cs: "Hráč otevřel balíček dané úrovně",
    has_target: true,
    target_label_cs: "Typ balíčku",
    target_options: [
      { value: "standard", label_cs: "📦 Běžný balíček" },
      { value: "refined", label_cs: "📜 Učencův balíček (Refined)" },
      { value: "masterwork", label_cs: "👑 Královský balíček (Masterwork)" },
    ],
    default_target: "masterwork",
    has_value: false,
    value_type: "none",
  },
  games_played: {
    label_cs: "Počet splněných miniher celkem",
    label_en: "Total Minigames Solved",
    icon: "🎮",
    description_cs: "Celkový počet úspěšně splněných písařských miniher napříč disciplínami",
    has_operator: true,
    has_target: false,
    has_value: true,
    value_label_cs: "Počet miniher",
    value_type: "number",
    unit_cs: "miniher",
    default_value: 10,
  },
  game_mode_played: {
    label_cs: "Splněné minihry konkrétního režimu",
    label_en: "Minigames by Mode",
    icon: "✍️",
    description_cs: "Počet splněných miniher vybrané disciplíny",
    has_operator: true,
    has_target: true,
    target_label_cs: "Která disciplína?",
    target_options: [
      { value: "transcription", label_cs: "🔍 Paleografická transkripce (přepis řádků)" },
      { value: "cipher", label_cs: "🗝️ Šifra a kryptogram" },
      { value: "script", label_cs: "🔤 Poznání písma" },
      { value: "mood", label_cs: "🎭 Nálada písaře" },
    ],
    default_target: "transcription",
    has_value: true,
    value_label_cs: "Počet splněných her",
    value_type: "number",
    unit_cs: "her",
    default_value: 5,
  },
  transcription_accuracy: {
    label_cs: "Přesnost přepisu (např. 100 %)",
    label_en: "Transcription Accuracy",
    icon: "🎯",
    description_cs: "Dosažení dokonalé nebo vysoké přesnosti při transkripci",
    has_operator: true,
    has_target: false,
    has_value: true,
    value_label_cs: "Minimální přesnost",
    value_type: "number",
    unit_cs: "%",
    default_value: 100,
  },
  streak_days: {
    label_cs: "Délka denního bádání (streak)",
    label_en: "Daily Study Streak",
    icon: "🕯️",
    description_cs: "Počet po sobě jdoucích dní každodenní návštěvy skriptoria",
    has_operator: true,
    has_target: false,
    has_value: true,
    value_label_cs: "Počet dní",
    value_type: "number",
    unit_cs: "dní",
    default_value: 7,
  },
  mosaic_pieces: {
    label_cs: "Dokončené dílky mozaiky",
    label_en: "Mosaic Pieces Completed",
    icon: "🧩",
    description_cs: "Počet složených dílků iluminované mozaiky (16 = hotový obraz)",
    has_operator: true,
    has_target: false,
    has_value: true,
    value_label_cs: "Počet dílků (max 16)",
    value_type: "number",
    unit_cs: "dílků",
    default_value: 16,
  },
  player_level: {
    label_cs: "Dosažená úroveň hráče (Level)",
    label_en: "Player Level Reached",
    icon: "🌟",
    description_cs: "Minimální dosažená úroveň písaře",
    has_operator: true,
    has_target: false,
    has_value: true,
    value_label_cs: "Úroveň (Level)",
    value_type: "number",
    unit_cs: "Level",
    default_value: 5,
  },
  player_xp: {
    label_cs: "Celkový počet získaných XP",
    label_en: "Total XP Earned",
    icon: "⚡",
    description_cs: "Hráč dosáhl stanovené hodnoty zkušeností",
    has_operator: true,
    has_target: false,
    has_value: true,
    value_label_cs: "Počet zkušeností (XP)",
    value_type: "number",
    unit_cs: "XP",
    default_value: 500,
  },
  player_coins: {
    label_cs: "Množství zlaťáků v pokladnici",
    label_en: "Gold Coins Balance",
    icon: "💰",
    description_cs: "Zůstatek grošů / zlaťáků v písařské truhlici",
    has_operator: true,
    has_target: false,
    has_value: true,
    value_label_cs: "Počet zlaťáků v pokladnici",
    value_type: "number",
    unit_cs: "zlaťáků",
    default_value: 250,
  },
  gift_sent: {
    label_cs: "Darování či výměna karet",
    label_en: "Gift or Trade Completed",
    icon: "🤝",
    description_cs: "Počet darovaných nebo směněných karet s kolegy ve skriptoriu",
    has_operator: true,
    has_target: false,
    has_value: true,
    value_label_cs: "Počet darů / směn",
    value_type: "number",
    unit_cs: "směn",
    default_value: 1,
  },
  loupe_zoom: {
    label_cs: "Použití paleografické lupy na 1000 %",
    label_en: "Use Loupe at 1000% Zoom",
    icon: "🔎",
    description_cs: "Automaticky se splní při přiblížení lupy na maximum (1000 %)",
    has_operator: false,
    has_target: false,
    has_value: false,
    value_type: "none",
  },
  night_scribe: {
    label_cs: "Noční bádání (mezi 22:00 a 04:00)",
    label_en: "Night Scribe (22:00-04:00)",
    icon: "🌙",
    description_cs: "Automaticky se splní při návštěvě v nočních hodinách",
    has_operator: false,
    has_target: false,
    has_value: false,
    value_type: "none",
  },
  scriptorium_place: {
    label_cs: "Kodexy z konkrétního města / kláštera",
    label_en: "Manuscript from Scriptorium",
    icon: "🏛️",
    description_cs: "Počet kodexů pocházejících ze zadaného města či skriptoria",
    has_operator: true,
    has_target: true,
    target_label_cs: "Které město / skriptorium?",
    target_options: [
      { value: "praha", label_cs: "Praha (Klementinum / NK ČR / Karlov)" },
      { value: "vyssi-brod", label_cs: "Vyšší Brod (Cisterciáci)" },
      { value: "olomouc", label_cs: "Olomouc (Vědecká knihovna)" },
      { value: "roudnice", label_cs: "Roudnice nad Labem (Augustiniáni)" },
      { value: "krakov", label_cs: "Krakov / Kazimierz (Polsko)" },
      { value: "bologna", label_cs: "Bologna (Itálie)" },
      { value: "austria", label_cs: "Rakousko (Klosterneuburg / Vídeň)" },
    ],
    default_target: "praha",
    has_value: true,
    value_label_cs: "Počet kodexů z lokality",
    value_type: "number",
    unit_cs: "kodexů",
    default_value: 3,
  },
  multiple_places: {
    label_cs: "Kodexy z různých měst / klášterů",
    label_en: "Codices from Different Places",
    icon: "🗺️",
    description_cs: "Hráč musí vlastnit kodexy pocházející z tolika různých měst či skriptorií",
    has_operator: true,
    has_target: false,
    has_value: true,
    value_label_cs: "Počet různých měst",
    value_type: "number",
    unit_cs: "různých měst",
    default_value: 3,
  },
  curio_unlocked: {
    label_cs: "Přečtení glos a kuriozit",
    label_en: "Curios & Marginalia Read",
    icon: "📖",
    description_cs: "Hráč prozkoumal a odemkl písařské glosy či marginálie",
    has_operator: true,
    has_target: false,
    has_value: true,
    value_label_cs: "Počet přečtených glos",
    value_type: "number",
    unit_cs: "glos",
    default_value: 3,
  },
  cipher: {
    label_cs: "Kolofony se středověkou šifrou",
    label_en: "Colophons with Cipher",
    icon: "🗝️",
    description_cs: "Vlastnictví kolofonů obsahujících středověkou šifru či kryptogram",
    has_operator: true,
    has_target: false,
    has_value: true,
    value_label_cs: "Počet šifrovaných kolofonů",
    value_type: "number",
    unit_cs: "kolofonů",
    default_value: 1,
  },
  initial: {
    label_cs: "Kolofon s iluminovanou iniciálou",
    label_en: "Colophon with Initial",
    icon: "🎨",
    description_cs: "Vlastnictví kolofonu zdobeného bohatě iluminovanou iniciálou",
    has_operator: false,
    has_target: false,
    has_value: false,
    value_type: "none",
  },
  verse: {
    label_cs: "Veršovaný či rýmovaný kolofon",
    label_en: "Rhymed Colophon",
    icon: "🎶",
    description_cs: "Vlastnictví karty s veršovaným či rýmovaným kolofonem",
    has_operator: false,
    has_target: false,
    has_value: false,
    value_type: "none",
  },
  custom: {
    label_cs: "Vlastní / Speciální podmínka",
    label_en: "Custom / Special Requirement",
    icon: "⚙️",
    description_cs: "Ručně zadaný klíč nebo podmínka vyhodnocovaná specificky",
    has_target: true,
    target_label_cs: "Identifikátor / Klíč",
    has_value: true,
    value_label_cs: "Hodnota",
    value_type: "text",
  },
};

export function formatConditionHuman(cond: TrophyCondition): string {
  if (!cond || !cond.type) return "Nespecifikovaná podmínka";
  const meta = TROPHY_CONDITION_META[cond.type] || TROPHY_CONDITION_META.custom;
  const val = cond.value !== undefined && cond.value !== "" ? cond.value : (meta.default_value ?? 1);
  const target = cond.target || meta.default_target || "";
  const op = cond.operator || ">=";
  const opWord = op === "==" ? "přesně" : "alespoň";

  switch (cond.type) {
    case "collection_count":
      return `Vlastnit ${opWord} ${val} unikátních kodexů ve sbírce`;
    case "specific_card":
      return `Vlastnit konkrétní rukopis: „${target || val}“`;
    case "rarity_owned": {
      const rLabel = meta.target_options?.find((o) => o.value === target)?.label_cs || target || "Rare";
      return `Vlastnit alespoň 1 kartu s raritou: ${rLabel}`;
    }
    case "rarity_count": {
      if (target === "FiveLegendaryOrFiveUnique") {
        return `Vlastnit buď ${opWord} ${val} Legendárních, NEBO ${opWord} ${val} Unikátních karet`;
      }
      const rLabel = meta.target_options?.find((o) => o.value === target)?.label_cs || target || "vybrané rarity";
      return `Vlastnit ${opWord} ${val} karet rarity: ${rLabel}`;
    }
    case "packs_opened":
      return `Otevřít ${opWord} ${val} balíčků ve skriptoriu`;
    case "pack_quality_opened": {
      const qLabel = meta.target_options?.find((o) => o.value === target)?.label_cs || target || "zvolené kvality";
      return `Otevřít alespoň jeden ${qLabel}`;
    }
    case "games_played":
      return `Úspěšně splnit ${opWord} ${val} písařských miniher`;
    case "game_mode_played": {
      const mLabel = meta.target_options?.find((o) => o.value === target)?.label_cs || target || "vybrané disciplíny";
      return `Úspěšně absolvovat ${opWord} ${val} miniher v disciplíně: ${mLabel}`;
    }
    case "transcription_accuracy":
      return `Dosáhnout přesnosti ${opWord} ${val} % v paleografické transkripci`;
    case "streak_days":
      return `Udržet nepřetržité denní bádání (streak) ${opWord} ${val} dní`;
    case "mosaic_pieces":
      return Number(val) >= 16 && op === ">="
        ? `Složit celou 16dílnou mozaiku iluminace`
        : `Složit ${opWord} ${val} dílků mozaiky iluminace`;
    case "player_level":
      return `Dosáhnout ${opWord} ${val}. písařské úrovně (Level ${val})`;
    case "player_xp":
      return `Získat ${opWord} ${val} zkušenostních bodů (XP)`;
    case "player_coins":
      return `Nashromáždit ${opWord} ${val} zlaťáků v písařské pokladnici`;
    case "gift_sent":
      return `Darovat či směnit ${opWord} ${val} karet s kolegy`;
    case "loupe_zoom":
      return `Použít paleografickou lupu při maximálním zvětšení 1000 %`;
    case "night_scribe":
      return `Bádat ve skriptoriu v nočních hodinách (mezi 22:00 a 4:00)`;
    case "scriptorium_place": {
      const pLabel = meta.target_options?.find((o) => o.value === target)?.label_cs || target || "vybrané lokality";
      return `Vlastnit ${opWord} ${val} kodexů z lokality: ${pLabel}`;
    }
    case "multiple_places":
      return `Vlastnit kodexy pocházející ${opWord} ze ${val} různých měst či skriptorií`;
    case "curio_unlocked":
      return `Odemknout a prozkoumat ${opWord} ${val} písařských glos`;
    case "cipher":
      return `Vlastnit ${opWord} ${val} kolofonů se středověkou šifrou či kryptogramem`;
    case "initial":
      return `Vlastnit alespoň 1 kolofon zdobený iluminovanou iniciálou`;
    case "verse":
      return `Vlastnit alespoň 1 veršovaný či rýmovaný kolofon`;
    case "custom":
      return `Speciální podmínka (${cond.operator || ">="}): ${target || val}`;
    default:
      return `${meta.label_cs}: ${target ? target + " - " : ""}${opWord} ${val}`;
  }
}

// Zpětná kompatibilita pro TROPHY_CATEGORY_META
export const TROPHY_CATEGORY_META: Record<string, { label_cs: string; label_en: string; icon: string }> = {
  collection: { label_cs: "Sběratelství", label_en: "Collection", icon: "📚" },
  study: { label_cs: "Bádání & streaky", label_en: "Study & Streaks", icon: "🕯️" },
  palaeography: { label_cs: "Paleografie & výzvy", label_en: "Palaeography & Challenges", icon: "🔍" },
  community: { label_cs: "Společenství", label_en: "Community", icon: "🤝" },
  secrets: { label_cs: "Tajemství & kuriozity", label_en: "Secrets & Curios", icon: "🗝️" },
};

export const DEFAULT_TROPHIES: TrophyItem[] = [
  // 🟢 LEHKÁ (EASY) – 12 výzev (75–100 XP)
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
    title: "Novic skriptoria",
    title_en: "Scriptorium Novice",
    text: "Získejte alespoň 5 různých kolofonů do své sbírky",
    text_en: "Collect at least 5 different colophons in your library",
    xp: 75,
    initial: "S",
    difficulty: "easy",
    category: "collection",
    conditions: [{ type: "collection_count", value: 5 }],
    requirement_type: "collection_count",
    requirement_value: 5,
  },
  {
    id: "apprentice-scribe",
    title: "Písařský tovaryš",
    title_en: "Apprentice Scribe",
    text: "Shromážděte alespoň 10 různých středověkých kodexů",
    text_en: "Gather at least 10 unique medieval codices",
    xp: 100,
    initial: "A",
    difficulty: "easy",
    category: "collection",
    conditions: [{ type: "collection_count", value: 10 }],
    requirement_type: "collection_count",
    requirement_value: 10,
  },
  {
    id: "first-trial",
    title: "První zkouška",
    title_en: "First Trial",
    text: "Úspěšně absolvujte svou první písařskou minihru",
    text_en: "Successfully pass your first scribal minigame",
    xp: 75,
    initial: "✍️",
    difficulty: "easy",
    category: "palaeography",
    conditions: [{ type: "games_played", value: 1 }],
    requirement_type: "games_played",
    requirement_value: 1,
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
    id: "verse-lover",
    title: "Pěvec latinský",
    title_en: "Latin Versifier",
    text: "Získejte veršovaný či rýmovaný kolofon do své sbírky",
    text_en: "Acquire a rhymed or metrical colophon into your collection",
    xp: 100,
    initial: "C",
    difficulty: "easy",
    category: "collection",
    conditions: [{ type: "custom", target: "verse", value: "verse" }],
    requirement_type: "custom",
    requirement_value: "verse",
  },
  {
    id: "loupe-glance",
    title: "Oko ostříže",
    title_en: "Hawk's Eye",
    text: "Prozkoumejte písařské tahy s paleografickou lupou při 1000% zvětšení",
    text_en: "Examine scribal strokes with the palaeographical loupe at 1000% zoom",
    xp: 75,
    initial: "🔎",
    difficulty: "easy",
    category: "palaeography",
    conditions: [{ type: "loupe_zoom" }],
  },
  {
    id: "night-owl",
    title: "Noční písař",
    title_en: "Midnight Scribe",
    text: "Bádejte ve skriptoriu při svitu svíčky v nočních hodinách (mezi 22:00 a 4:00)",
    text_en: "Study in the scriptorium by candlelight at night (between 10 PM and 4 AM)",
    xp: 100,
    initial: "🌙",
    difficulty: "easy",
    category: "secrets",
    conditions: [{ type: "night_scribe" }],
  },
  {
    id: "first-gift",
    title: "Štědrý tovaryš",
    title_en: "Generous Fellow",
    text: "Darujte či směňte kartu se svým kolegou ve skriptoriu",
    text_en: "Gift or trade a colophon card with a colleague",
    xp: 75,
    initial: "🤝",
    difficulty: "easy",
    category: "community",
    conditions: [{ type: "gift_sent", value: 1 }],
    requirement_type: "gift_sent",
    requirement_value: 1,
  },
  {
    id: "first-savings",
    title: "První groše",
    title_en: "First Groschen",
    text: "Ušetřete alespoň 100 zlaťáků v písařské pokladnici",
    text_en: "Save at least 100 gold coins in your treasury",
    xp: 75,
    initial: "🪙",
    difficulty: "easy",
    category: "study",
    conditions: [{ type: "player_coins", value: 100 }],
  },
  {
    id: "apprentice-level",
    title: "Krok k mistrovství",
    title_en: "Step to Mastery",
    text: "Dosáhněte 3. písařské úrovně (Level 3)",
    text_en: "Reach scribal Level 3",
    xp: 100,
    initial: "🌟",
    difficulty: "easy",
    category: "study",
    conditions: [{ type: "player_level", value: 3 }],
  },
  {
    id: "glossa-reader",
    title: "Čtenář na okraji",
    title_en: "Marginalia Reader",
    text: "Prozkoumejte písařské marginálie a odemkněte alespoň 3 glosy",
    text_en: "Explore scribal marginalia and unlock at least 3 glosses",
    xp: 100,
    initial: "📖",
    difficulty: "easy",
    category: "secrets",
    conditions: [{ type: "curio_unlocked", value: 3 }],
  },

  // 🔵 STŘEDNÍ (MEDIUM) – 13 výzev (200–250 XP) – vyžaduje reálné úsilí
  {
    id: "collector-25",
    title: "Zkušený sběratel",
    title_en: "Experienced Collector",
    text: "Shromážděte alespoň 25 různých středověkých kodexů",
    text_en: "Gather at least 25 unique medieval codices",
    xp: 250,
    initial: "📚",
    difficulty: "medium",
    category: "collection",
    conditions: [{ type: "collection_count", value: 25 }],
  },
  {
    id: "streak-7",
    title: "Týden ve skriptoriu",
    title_en: "Week in the Scriptorium",
    text: "Udržte 7 dní nepřetržitého každodenního bádání",
    text_en: "Maintain a continuous 7-day daily study streak",
    xp: 200,
    initial: "🕯️",
    difficulty: "medium",
    category: "study",
    conditions: [{ type: "streak_days", value: 7 }],
    requirement_type: "streak",
    requirement_value: 7,
  },
  {
    id: "rare-connoisseur",
    title: "Klenotník pergamenu",
    title_en: "Parchment Jeweler",
    text: "Získejte do sbírky alespoň 3 vzácné (Rare či vyšší) kodexy",
    text_en: "Acquire at least 3 Rare or higher codices into your collection",
    xp: 250,
    initial: "💎",
    difficulty: "medium",
    category: "collection",
    conditions: [{ type: "rarity_count", target: "RareOrHigher", value: 3 }],
  },
  {
    id: "epic-discovery",
    title: "Dotek mistra",
    title_en: "Master's Touch",
    text: "Získejte alespoň jednu Epickou (Epic) iluminovanou památku",
    text_en: "Acquire at least one Epic illuminated relic",
    xp: 250,
    initial: "✨",
    difficulty: "medium",
    category: "collection",
    conditions: [{ type: "rarity_owned", target: "Epic", value: "Epic" }],
  },
  {
    id: "prague-scholar",
    title: "Pražský magistr",
    title_en: "Prague Magister",
    text: "Získejte alespoň 5 kodexů z pražských skriptorií (NK ČR, Karlov)",
    text_en: "Collect at least 5 codices from Prague scriptoria",
    xp: 250,
    initial: "🏛️",
    difficulty: "medium",
    category: "secrets",
    conditions: [{ type: "scriptorium_place", target: "praha", value: 5 }],
    requirement_type: "custom",
    requirement_value: "praha",
  },
  {
    id: "monastery-traveler",
    title: "Poutník klášterů",
    title_en: "Monastery Pilgrim",
    text: "Vlastněte kodexy pocházející alespoň ze 3 různých měst či klášterů",
    text_en: "Possess codices originating from at least 3 different towns or abbeys",
    xp: 250,
    initial: "🗺️",
    difficulty: "medium",
    category: "collection",
    conditions: [{ type: "custom", target: "multiple_places", value: 3 }],
  },
  {
    id: "games-15",
    title: "Zkušený luštitel",
    title_en: "Seasoned Decipherer",
    text: "Úspěšně absolvujte alespoň 15 písařských zkoušek a miniher",
    text_en: "Successfully complete at least 15 scribal trials and minigames",
    xp: 250,
    initial: "📜",
    difficulty: "medium",
    category: "palaeography",
    conditions: [{ type: "games_played", value: 15 }],
  },
  {
    id: "diligent-transcriber",
    title: "Pečlivý kaligraf",
    title_en: "Diligent Calligrapher",
    text: "Úspěšně absolvujte alespoň 5 transkripčních přepisů v paleografickém režimu",
    text_en: "Successfully complete at least 5 transcription challenges in palaeographical mode",
    xp: 250,
    initial: "✒️",
    difficulty: "medium",
    category: "palaeography",
    conditions: [{ type: "game_mode_played", target: "transcription", value: 5 }],
  },
  {
    id: "script-connoisseur",
    title: "Znalec duktu",
    title_en: "Connoisseur of Duct",
    text: "Správně rozpoznejte písma v 5 paleografických výzvách",
    text_en: "Correctly recognize scripts in 5 paleographical challenges",
    xp: 200,
    initial: "🔤",
    difficulty: "medium",
    category: "palaeography",
    conditions: [{ type: "game_mode_played", target: "script", value: 5 }],
  },
  {
    id: "level-8",
    title: "Učený bakalář",
    title_en: "Scholarly Bachelor",
    text: "Dosáhněte 8. písařské úrovně a prokažte své znalosti",
    text_en: "Reach scribal Level 8 and prove your knowledge",
    xp: 250,
    initial: "🎓",
    difficulty: "medium",
    category: "study",
    conditions: [{ type: "player_level", value: 8 }],
  },
  {
    id: "wealthy-scribe",
    title: "Zámožný tovaryš",
    title_en: "Prosperous Fellow",
    text: "Nashromážděte alespoň 500 zlaťáků v písařské pokladnici",
    text_en: "Accumulate at least 500 gold coins in your scribal treasury",
    xp: 200,
    initial: "💰",
    difficulty: "medium",
    category: "study",
    conditions: [{ type: "player_coins", value: 500 }],
  },
  {
    id: "fifteen-packs",
    title: "Patnáct pečetí",
    title_en: "Fifteen Seals",
    text: "Prolomte pečeť a otevřete alespoň 15 balíčků ve skriptoriu",
    text_en: "Break the seals and open at least 15 packs in the scriptorium",
    xp: 200,
    initial: "📦",
    difficulty: "medium",
    category: "study",
    conditions: [{ type: "packs_opened", value: 15 }],
  },
  {
    id: "benefactor",
    title: "Mecenáš skriptoria",
    title_en: "Scriptorium Benefactor",
    text: "Darujte či vyměňte alespoň 5 duplicitních karet s kolegy",
    text_en: "Gift or trade at least 5 duplicate cards with colleagues",
    xp: 250,
    initial: "🎁",
    difficulty: "medium",
    category: "community",
    conditions: [{ type: "gift_sent", value: 5 }],
  },

  // 🟣 TĚŽKÁ (HARD) – 11 výzev (400–500 XP) – vyžaduje vysokou vytrvalost a zručnost
  {
    id: "bibliophile-50",
    title: "Knihovník Klementina",
    title_en: "Clementinum Librarian",
    text: "Vlastněte alespoň 45 různých kodexů a historických pergamenů",
    text_en: "Possess at least 45 unique codices and historical parchments",
    xp: 500,
    initial: "K",
    difficulty: "hard",
    category: "collection",
    conditions: [{ type: "collection_count", value: 45 }],
  },
  {
    id: "golden-fund",
    title: "Zlatý fond",
    title_en: "Golden Fund",
    text: "Vlastněte alespoň 3 Epické či Legendární kodexy současně",
    text_en: "Possess at least 3 Epic or Legendary codices simultaneously",
    xp: 450,
    initial: "👑",
    difficulty: "hard",
    category: "collection",
    conditions: [{ type: "rarity_count", target: "EpicOrHigher", value: 3 }],
  },
  {
    id: "gilded-mystery",
    title: "Zlacené tajemství",
    title_en: "Gilded Mystery",
    text: "Najděte a vlastněte monumentální Unikátní (Unique) kolofon",
    text_en: "Discover and possess a monumental Unique colophon",
    xp: 500,
    initial: "G",
    difficulty: "hard",
    category: "collection",
    conditions: [{ type: "rarity_owned", target: "Unique", value: "Unique" }],
  },
  {
    id: "streak-30",
    title: "Měsíční vigilance",
    title_en: "Monthly Vigil",
    text: "Udržte 30 dní nepřetržitého každodenního bádání ve skriptoriu",
    text_en: "Maintain a continuous 30-day daily study streak in the scriptorium",
    xp: 450,
    initial: "🕯️",
    difficulty: "hard",
    category: "study",
    conditions: [{ type: "streak_days", value: 30 }],
  },
  {
    id: "master-palaeographer",
    title: "Písařský mistr",
    title_en: "Master Palaeographer",
    text: "Úspěšně absolvujte alespoň 35 písařských zkoušek a miniher",
    text_en: "Successfully complete at least 35 scribal trials and minigames",
    xp: 400,
    initial: "D",
    difficulty: "hard",
    category: "palaeography",
    conditions: [{ type: "games_played", value: 35 }],
  },
  {
    id: "cipher-breaker",
    title: "Vrchní šifrant",
    title_en: "Master Cryptographer",
    text: "Najděte a vlastněte alespoň 2 kolofony se středověkou šifrou či kryptogramem",
    text_en: "Discover and own at least 2 colophons with a medieval cipher or cryptogram",
    xp: 400,
    initial: "X",
    difficulty: "hard",
    category: "secrets",
    conditions: [{ type: "custom", target: "cipher", value: 2 }],
  },
  {
    id: "guild-master",
    title: "Mistr cechu písařů",
    title_en: "Guild Master Scribe",
    text: "Dosáhněte 15. písařské úrovně (Level 15) a prokažte své mistrovství",
    text_en: "Reach scribal Level 15 and prove your master craftsmanship",
    xp: 450,
    initial: "🏅",
    difficulty: "hard",
    category: "study",
    conditions: [{ type: "player_level", value: 15 }],
  },
  {
    id: "monastery-treasury",
    title: "Klášterní pokladnice",
    title_en: "Monastery Treasury",
    text: "Shromážděte alespoň 1 500 zlaťáků v pokladnici skriptoria",
    text_en: "Accumulate at least 1,500 gold coins in the scriptorium treasury",
    xp: 400,
    initial: "🏦",
    difficulty: "hard",
    category: "study",
    conditions: [{ type: "player_coins", value: 1500 }],
  },
  {
    id: "forty-packs",
    title: "Archivář kodexů",
    title_en: "Archivist of Codices",
    text: "Prolomte pečeť a otevřete alespoň 40 balíčků ve skriptoriu",
    text_en: "Break the seals and open at least 40 packs in the scriptorium",
    xp: 400,
    initial: "🗃️",
    difficulty: "hard",
    category: "study",
    conditions: [{ type: "packs_opened", value: 40 }],
  },
  {
    id: "vyssi-brod-monk",
    title: "Vyšebrodský archivář",
    title_en: "Vyšší Brod Archivist",
    text: "Vlastněte alespoň 2 kodexy z cisterciáckého kláštera Vyšší Brod",
    text_en: "Own at least 2 codices from the Cistercian monastery of Vyšší Brod",
    xp: 400,
    initial: "V",
    difficulty: "hard",
    category: "secrets",
    conditions: [{ type: "scriptorium_place", target: "vyssi-brod", value: 2 }],
  },
  {
    id: "perfect-hand",
    title: "Nezachvějná ruka",
    title_en: "Unwavering Hand",
    text: "Dosáhněte dokonalé přesnosti (100 % shoda) v paleografické transkripci",
    text_en: "Achieve flawless accuracy (100% match) in paleographical transcription",
    xp: 400,
    initial: "🎯",
    difficulty: "hard",
    category: "palaeography",
    conditions: [{ type: "transcription_accuracy", value: 100 }],
  },

  // 🔴 NEMOŽNÁ (IMPOSSIBLE) – 6 výzev (1000–1500 XP) – skutečně monumentální písařské mety
  {
    id: "legend-of-scriptoria",
    title: "Legenda skriptorií",
    title_en: "Legend of Scriptoria",
    text: "Dosáhněte naprostého věhlasu: shromážděte alespoň 60 kodexů ve sbírce a vlastněte alespoň 5 Legendárních či Unikátních památek",
    text_en: "Attain supreme renown: gather at least 60 codices and possess at least 5 Legendary or Unique relics",
    xp: 1500,
    initial: "👑",
    difficulty: "impossible",
    category: "collection",
    conditions: [
      { type: "collection_count", value: 60 },
      { type: "rarity_count", target: "LegendaryOrUnique", value: 5 },
    ],
  },
  {
    id: "hundred-days-streak",
    title: "Sto dní u pultu",
    title_en: "Hundred Days at the Desk",
    text: "Předveďte nadlidskou vytrvalost: udržte 100 dní nepřetržitého každodenního bádání bez jediného přerušení",
    text_en: "Demonstrate superhuman endurance: maintain a continuous 100-day daily streak without a single break",
    xp: 1500,
    initial: "🔥",
    difficulty: "impossible",
    category: "study",
    conditions: [{ type: "streak_days", value: 100 }],
  },
  {
    id: "grandmaster-scribe",
    title: "Kronikář věků",
    title_en: "Chronicler of Ages",
    text: "Dosáhněte 30. písařské úrovně (Level 30) a získejte více než 5 000 zkušeností (XP)",
    text_en: "Reach scribal Level 30 and accumulate over 5,000 experience points (XP)",
    xp: 1200,
    initial: "📜",
    difficulty: "impossible",
    category: "study",
    conditions: [
      { type: "player_level", value: 30 },
      { type: "player_xp", value: 5000 },
    ],
  },
  {
    id: "royal-palaeographer",
    title: "Královský paleograf",
    title_en: "Royal Palaeographer",
    text: "Završte celoživotní učené dílo: úspěšně vyřešte alespoň 75 písařských miniher napříč všemi disciplínami",
    text_en: "Complete a scholarly lifetime: successfully solve at least 75 scribal minigames across all disciplines",
    xp: 1200,
    initial: "🏛️",
    difficulty: "impossible",
    category: "palaeography",
    conditions: [{ type: "games_played", value: 75 }],
  },
  {
    id: "abbots-treasury",
    title: "Opatský pokladník",
    title_en: "Abbot's Treasurer",
    text: "Naplňte pokladnici kláštera jako skutečný opat: shromážděte 5 000 zlaťáků a otevřete alespoň 50 balíčků ve skriptoriu",
    text_en: "Fill the abbey treasury: accumulate 5,000 gold coins and open at least 50 packs in the scriptorium",
    xp: 1000,
    initial: "💰",
    difficulty: "impossible",
    category: "study",
    conditions: [
      { type: "player_coins", value: 5000 },
      { type: "packs_opened", value: 50 },
    ],
  },
  {
    id: "mosaic-grandmaster",
    title: "Velmistr iluminací",
    title_en: "Grandmaster Illuminator",
    text: "Složte celou 16dílnou mozaiku a zároveň dosáhněte alespoň 20. písařské úrovně (Level 20)",
    text_en: "Complete the full 16-piece mosaic while reaching at least scribal Level 20",
    xp: 1000,
    initial: "🎨",
    difficulty: "impossible",
    category: "study",
    conditions: [
      { type: "mosaic_pieces", value: 16 },
      { type: "player_level", value: 20 },
    ],
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

    // Zachovat existující upravené trofeje, ale doplnit nové výchozí trofeje, které uživatel ještě nemá
    const existingIds = new Set(parsed.map((item: any) => item.id));
    const missingDefaults = DEFAULT_TROPHIES.filter((d) => !existingIds.has(d.id));
    const combined = [...parsed, ...missingDefaults];

    return combined.map((item: any) => {
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

  function compareValues(actual: number, target: number, operator?: string): boolean {
    if (operator === "==") return actual === target;
    return actual >= target; // default ">="
  }

  switch (cond.type) {
    case "collection_count": {
      const count = Object.entries(state?.collection || {}).filter(([_, cnt]) => Number(cnt) > 0).length;
      return compareValues(count, numVal || 1, cond.operator);
    }

    case "specific_card": {
      const cardKey = String(cond.target || cond.value || "").toLowerCase();
      if (!cardKey) return false;
      return cards.some(
        (c) =>
          (Number(state?.collection?.[c.id]) || 0) > 0 &&
          (String(c.id).toLowerCase() === cardKey ||
            c.uuid?.toLowerCase() === cardKey ||
            c.title?.toLowerCase().includes(cardKey) ||
            c.manuscript?.toLowerCase().includes(cardKey))
      );
    }

    case "rarity_owned": {
      const targetRarity = cond.target || cond.value || "Rare";
      return cards.some((c) => {
        if ((Number(state?.collection?.[c.id]) || 0) <= 0) return false;
        if (targetRarity === "Rare") return ["Rare", "Epic", "Legendary", "Unique"].includes(c.rarity);
        if (targetRarity === "Epic") return ["Epic", "Legendary", "Unique"].includes(c.rarity);
        if (targetRarity === "Legendary") return ["Legendary", "Unique"].includes(c.rarity);
        return c.rarity === targetRarity;
      });
    }

    case "rarity_count": {
      const targetRarity = cond.target || "Rare";
      if (targetRarity === "FiveLegendaryOrFiveUnique") {
        const legCount = cards.filter((c) => (Number(state?.collection?.[c.id]) || 0) > 0 && c.rarity === "Legendary").length;
        const unqCount = cards.filter((c) => (Number(state?.collection?.[c.id]) || 0) > 0 && c.rarity === "Unique").length;
        return compareValues(legCount, numVal || 5, cond.operator) || compareValues(unqCount, numVal || 5, cond.operator);
      }
      let matches = 0;
      if (targetRarity === "LegendaryOrUnique" || targetRarity === "Legendary+") {
        matches = cards.filter((c) => (Number(state?.collection?.[c.id]) || 0) > 0 && (c.rarity === "Legendary" || c.rarity === "Unique")).length;
      } else if (targetRarity === "EpicOrHigher" || targetRarity === "Epic+") {
        matches = cards.filter((c) => (Number(state?.collection?.[c.id]) || 0) > 0 && ["Epic", "Legendary", "Unique"].includes(c.rarity)).length;
      } else if (targetRarity === "RareOrHigher" || targetRarity === "Rare+" || targetRarity === "Rare") {
        matches = cards.filter((c) => (Number(state?.collection?.[c.id]) || 0) > 0 && ["Rare", "Epic", "Legendary", "Unique"].includes(c.rarity)).length;
      } else {
        matches = cards.filter((c) => (Number(state?.collection?.[c.id]) || 0) > 0 && c.rarity === targetRarity).length;
      }
      return compareValues(matches, numVal || 1, cond.operator);
    }

    case "packs_opened":
      return compareValues(state?.packsOpened || 0, numVal || 1, cond.operator);

    case "pack_quality_opened": {
      const targetQ = cond.target || cond.value;
      if (extraContext?.packQuality && extraContext.packQuality === targetQ) return true;
      return Boolean(state?.bonusPacks?.includes(targetQ));
    }

    case "games_played":
      return compareValues(state?.gamesPlayed || 0, numVal || 1, cond.operator);

    case "game_mode_played": {
      if (extraContext?.gameMode && extraContext.gameMode === cond.target) return true;
      return compareValues(state?.gamesPlayed || 0, numVal || 1, cond.operator);
    }

    case "transcription_accuracy": {
      const targetAcc = numVal || 100;
      return compareValues(extraContext?.accuracy || 0, targetAcc, cond.operator);
    }

    case "streak_days":
      return compareValues(state?.streak || 0, numVal || 1, cond.operator);

    case "mosaic_pieces":
      return compareValues(state?.puzzle || 0, numVal || 16, cond.operator) || (cond.operator !== "<=" && Boolean(state?.gallery && state.gallery.length > 0));

    case "player_level": {
      const currentLevel = state?.level || Math.floor((state?.xp || 0) / 100) + 1;
      return compareValues(currentLevel, numVal || 1, cond.operator);
    }

    case "player_xp":
      return compareValues(state?.xp || 0, numVal || 100, cond.operator);

    case "player_coins":
      return compareValues(state?.coins || 0, numVal || 100, cond.operator);

    case "gift_sent":
      return compareValues(state?.dailyTradedPartners?.length || 0, numVal || 1, cond.operator) || Boolean(state?.trophies?.includes("philanthropist") || state?.trophies?.includes("first-gift"));

    case "loupe_zoom":
      return Boolean(extraContext?.loupeMaxUsed || state?.loupeMaxUsed || state?.trophies?.includes("loupe-max") || state?.trophies?.includes("loupe-glance"));

    case "night_scribe": {
      const hour = extraContext?.nowHour !== undefined ? extraContext.nowHour : new Date().getHours();
      return (hour >= 0 && hour < 4) || (hour >= 22) || Boolean(state?.trophies?.includes("night-owl"));
    }

    case "scriptorium_place": {
      const placeKey = String(cond.target || cond.value || "").toLowerCase();
      const count = cards.filter(
        (c) =>
          (Number(state?.collection?.[c.id]) || 0) > 0 &&
          (c.place?.toLowerCase().includes(placeKey) ||
            c.manuscript?.toLowerCase().includes(placeKey) ||
            (placeKey === "praha" && (c.manuscript?.toLowerCase().includes("nkp") || c.place?.toLowerCase().includes("prague"))) ||
            (placeKey === "vyssi-brod" && (c.manuscript?.toLowerCase().includes("vb") || c.place?.toLowerCase().includes("brod"))))
      ).length;
      return compareValues(count, numVal || 1, cond.operator);
    }

    case "multiple_places": {
      const ownedPlaces = new Set(
        cards
          .filter((c) => (Number(state?.collection?.[c.id]) || 0) > 0 && c.place && !c.place.toLowerCase().includes("unknown"))
          .map((c) => c.place.toLowerCase().trim())
      );
      return compareValues(ownedPlaces.size, numVal || 3, cond.operator);
    }

    case "cipher": {
      const count = cards.filter((c) => (Number(state?.collection?.[c.id]) || 0) > 0 && ((c as any).features?.includes("Šifra") || (c as any).colophons?.features?.includes("Šifra") || c.features?.some?.((f: string) => f.toLowerCase().includes("šifr")))).length;
      return compareValues(count, numVal || 1, cond.operator);
    }

    case "initial": {
      return cards.some((c) => (Number(state?.collection?.[c.id]) || 0) > 0 && ((c as any).features?.includes("Iniciála") || (c as any).colophons?.features?.includes("Iniciála") || c.features?.some?.((f: string) => f.toLowerCase().includes("iniciál"))));
    }

    case "verse": {
      return cards.some((c) => (Number(state?.collection?.[c.id]) || 0) > 0 && ((c as any).features?.includes("Verše") || (c as any).colophons?.features?.includes("Verše") || c.features?.some?.((f: string) => f.toLowerCase().includes("verš"))));
    }

    case "curio_unlocked":
      return compareValues(state?.curiosUnlocked?.length || 0, numVal || 1, cond.operator);

    case "custom": {
      const val = String(cond.target || cond.value || "").toLowerCase();
      if (val === "initial") {
        return cards.some((c) => (Number(state?.collection?.[c.id]) || 0) > 0 && ((c as any).features?.includes("Iniciála") || (c as any).colophons?.features?.includes("Iniciála") || c.features?.some?.((f: string) => f.toLowerCase().includes("iniciál"))));
      }
      if (val === "verse") {
        return cards.some((c) => (Number(state?.collection?.[c.id]) || 0) > 0 && ((c as any).features?.includes("Verše") || (c as any).colophons?.features?.includes("Verše") || c.features?.some?.((f: string) => f.toLowerCase().includes("verš"))));
      }
      if (val === "cipher") {
        const count = cards.filter((c) => (Number(state?.collection?.[c.id]) || 0) > 0 && ((c as any).features?.includes("Šifra") || (c as any).colophons?.features?.includes("Šifra") || c.features?.some?.((f: string) => f.toLowerCase().includes("šifr")))).length;
        return compareValues(count, numVal || 1, cond.operator);
      }
      if (val === "multiple_places" || val === "places_count") {
        const ownedPlaces = new Set(
          cards
            .filter((c) => (Number(state?.collection?.[c.id]) || 0) > 0 && c.place && !c.place.toLowerCase().includes("unknown"))
            .map((c) => c.place.toLowerCase().trim())
        );
        return compareValues(ownedPlaces.size, numVal || 3, cond.operator);
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
