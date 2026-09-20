export type TrophyDifficulty = "easy" | "medium" | "hard" | "impossible";

export type TrophyCategory = "collection" | "study" | "palaeography" | "community" | "secrets";

export interface TrophyItem {
  id: string;
  title: string;
  title_en: string;
  text: string;
  text_en: string;
  xp: number;
  initial: string;
  difficulty: TrophyDifficulty;
  category: TrophyCategory;
  requirement_type?: "packs_opened" | "collection_count" | "streak" | "games_played" | "puzzle_completed" | "rarity_owned" | "gift_sent" | "custom";
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

export const TROPHY_CATEGORY_META: Record<
  TrophyCategory,
  { label_cs: string; label_en: string; icon: string }
> = {
  collection: {
    label_cs: "Sběratelství",
    label_en: "Collection",
    icon: "📚",
  },
  study: {
    label_cs: "Bádání & streaky",
    label_en: "Study & Streaks",
    icon: "🕯️",
  },
  palaeography: {
    label_cs: "Paleografie & výzvy",
    label_en: "Palaeography & Challenges",
    icon: "🔍",
  },
  community: {
    label_cs: "Společenství",
    label_en: "Community",
    icon: "🤝",
  },
  secrets: {
    label_cs: "Tajemství & kuriozity",
    label_en: "Secrets & Curios",
    icon: "🗝️",
  },
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
    requirement_type: "games_played",
    requirement_value: 5,
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
    requirement_type: "puzzle_completed",
    requirement_value: 16,
  },
];

export const TROPHIES_STORAGE_KEY = "quilldrop-trophies";

export function getStoredTrophies(): TrophyItem[] {
  if (typeof window === "undefined") return DEFAULT_TROPHIES;
  try {
    const raw = localStorage.getItem(TROPHIES_STORAGE_KEY);
    if (!raw) return DEFAULT_TROPHIES;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_TROPHIES;

    // Sloučení s výchozími pro doplnění případných chybějících polí
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
        difficulty: item.difficulty || def?.difficulty || "medium",
        category: item.category || def?.category || "collection",
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
