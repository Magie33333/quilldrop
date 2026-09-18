// Dataset 16dílných středověkých iluminací a správa denních streaků (Cesta písaře)

export type IlluminationRarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Unique";

export type IlluminationMosaicItem = {
  id: string;
  cycle: number; // 1, 2, 3...
  title: string;
  title_en?: string;
  source: string; // URL nebo relativní cesta
  origin: string; // Název rukopisu / instituce
  origin_en?: string;
  century: string; // např. "14. století"
  century_en?: string;
  tierName: string; // např. "Cyklus učedníka (Dny 1–16)"
  tierName_en?: string;
  rarity: IlluminationRarity;
  description: string;
  description_en?: string;
  rewardXp: number;
  rewardPack: "standard" | "refined" | "masterwork";
};

export const DEFAULT_ILLUMINATIONS: IlluminationMosaicItem[] = [
  {
    id: "rabbit-scribe",
    cycle: 1,
    title: "Učený zajíc (The Learned Hare)",
    title_en: "The Learned Hare",
    source: "/illumination-rabbit.png",
    origin: "Střední Evropa, iluminovaný žaltář",
    origin_en: "Central Europe, illuminated psalter",
    century: "14. století",
    century_en: "14th century",
    tierName: "Cyklus učedníka (Dny 1–16)",
    tierName_en: "Apprentice Cycle (Days 1–16)",
    rarity: "Common",
    description: "Autentická humorná marginálie písařského zajíce se svitkem. Vstupní krok každého začínajícího badatele do tajů skriptoria.",
    description_en: "Authentic humorous marginalia of a scribal hare holding a parchment scroll. The first step for every budding scholar into the secrets of the scriptorium.",
    rewardXp: 150,
    rewardPack: "standard",
  },
  {
    id: "scriptorium-monk",
    cycle: 2,
    title: "Písař v dílně (Scriptorium Master)",
    title_en: "Master Scribe in his Workshop",
    source: "/illuminations/eadwine-scribe.jpg",
    origin: "Eadwine Psalter, Trinity College Cambridge",
    origin_en: "Eadwine Psalter, Trinity College Cambridge",
    century: "12. století",
    century_en: "12th century",
    tierName: "Cyklus tovaryše (Dny 17–32)",
    tierName_en: "Journeyman Cycle (Days 17–32)",
    rarity: "Uncommon",
    description: "Slavný středověký autoportrét písaře sedícího na vyřezávané stolici se seříznutým perem v pravici a škrabkou v levici.",
    description_en: "Famous medieval self-portrait of a scribe seated upon a carved bench with a quill in his right hand and a penknife (scraper) in his left.",
    rewardXp: 250,
    rewardPack: "refined",
  },
  {
    id: "bohemian-lion",
    cycle: 3,
    title: "Český královský lev (Bohemian Lion)",
    title_en: "The Bohemian Royal Lion",
    source: "/illuminations/bohemian-lion.jpg",
    origin: "Gelnhausenův kodex, Státní okresní archiv Jihlava",
    origin_en: "Codex of Gelnhausen, State District Archive Jihlava",
    century: "Konec 14. století",
    century_en: "Late 14th century",
    tierName: "Cyklus mistra (Dny 33–48)",
    tierName_en: "Master Cycle (Days 33–48)",
    rarity: "Rare",
    description: "Impozantní zlacená iluminace dvouocasého českého lva s královskou korunou ze slavné jihlavské právní knihy Jana z Gelnhausenu.",
    description_en: "Imposing gilded illumination of the double-tailed Bohemian lion crowned with royal regalia from the famous legal codex of Jan of Gelnhausen.",
    rewardXp: 400,
    rewardPack: "refined",
  },
  {
    id: "wenceslas-initial",
    cycle: 4,
    title: "Královská iniciála 'W' (Wenceslas Bible)",
    title_en: "Royal Initial 'W' (Wenceslas Bible)",
    source: "/illuminations/wenceslas-initial.jpg",
    origin: "Bible Václava IV. (ÖNB Vídeň, Cod. 2759–2764), Praha",
    origin_en: "Wenceslas Bible (ÖNB Vienna, Cod. 2759–2764), Prague",
    century: "Kolem roku 1390",
    century_en: "Circa 1390",
    tierName: "Cyklus kanovníka (Dny 49–64)",
    tierName_en: "Canon Cycle (Days 49–64)",
    rarity: "Epic",
    description: "Monumentální dvorská zlacená iniciála s královským ledňáčkem ve věníku. Vrchol pražského gotického knižního malířství.",
    description_en: "Monumental courtly gilded initial with a royal kingfisher in a bath-towel knot. The pinnacle of Prague Gothic manuscript painting.",
    rewardXp: 600,
    rewardPack: "masterwork",
  },
  {
    id: "astrolabe-spheres",
    cycle: 5,
    title: "Nebeské sféry a astroláb (Cosmographia)",
    title_en: "Celestial Spheres & Astrolabe (Cosmographia)",
    source: "/illuminations/astrolabe-spheres.jpg",
    origin: "Astronomický sborník krále Václava IV., Praha",
    origin_en: "Astronomical Codex of King Wenceslas IV, Prague",
    century: "Konec 14. století",
    century_en: "Late 14th century",
    tierName: "Cyklus iluminátora (Dny 65–80)",
    tierName_en: "Illuminator Cycle (Days 65–80)",
    rarity: "Legendary",
    description: "Astronomické schéma nebeských sfér, planet a měření času z vědeckých rukopisů pražské univerzitní a dvorské komunity.",
    description_en: "Astronomical diagram of celestial spheres, planetary orbits, and time measurement from scientific codices of the Prague university and court circle.",
    rewardXp: 800,
    rewardPack: "masterwork",
  },
  {
    id: "codex-gigas-devil",
    cycle: 6,
    title: "Podlažický ďábel (Codex Gigas)",
    title_en: "The Podlažice Devil (Codex Gigas)",
    source: "/illuminations/codex-gigas-devil.jpg",
    origin: "Benediktinský klášter Podlažice u Chrudimi (dnes Kungliga biblioteket, Stockholm)",
    origin_en: "Benedictine Monastery of Podlažice near Chrudim (now National Library of Sweden, Stockholm)",
    century: "Počátek 13. století",
    century_en: "Early 13th century",
    tierName: "Cyklus legendárního bibliofila (Dny 81–96+)",
    tierName_en: "Legendary Bibliophile Cycle (Days 81–96+)",
    rarity: "Unique",
    description: "Mýtická celostránková iluminace ďábla z největšího středověkého rukopisu světa („Ďáblovy bible“), vytvořeného v Čechách.",
    description_en: "Mythical full-page illumination of the Devil from the world's largest surviving medieval manuscript ('The Devil's Bible'), crafted in Bohemia.",
    rewardXp: 1500,
    rewardPack: "masterwork",
  },
];

// Helpery pro lokalizaci iluminací
export function getIlluminationTitle(item: IlluminationMosaicItem, lang: "cs" | "en" = "cs"): string {
  if (lang === "en") {
    if (item.title_en) return item.title_en;
    const def = DEFAULT_ILLUMINATIONS.find((d) => d.id === item.id || d.cycle === item.cycle);
    if (def?.title_en) return def.title_en;
  }
  return item.title;
}

export function getIlluminationOrigin(item: IlluminationMosaicItem, lang: "cs" | "en" = "cs"): string {
  if (lang === "en") {
    if (item.origin_en) return item.origin_en;
    const def = DEFAULT_ILLUMINATIONS.find((d) => d.id === item.id || d.cycle === item.cycle);
    if (def?.origin_en) return def.origin_en;
  }
  return item.origin;
}

export function getIlluminationCentury(item: IlluminationMosaicItem, lang: "cs" | "en" = "cs"): string {
  if (lang === "en") {
    if (item.century_en) return item.century_en;
    const def = DEFAULT_ILLUMINATIONS.find((d) => d.id === item.id || d.cycle === item.cycle);
    if (def?.century_en) return def.century_en;
  }
  return item.century;
}

export function getIlluminationTierName(item: IlluminationMosaicItem, lang: "cs" | "en" = "cs"): string {
  if (lang === "en") {
    if (item.tierName_en) return item.tierName_en;
    const def = DEFAULT_ILLUMINATIONS.find((d) => d.id === item.id || d.cycle === item.cycle);
    if (def?.tierName_en) return def.tierName_en;
    return `Cycle ${item.cycle}`;
  }
  return item.tierName || `Cyklus ${item.cycle}`;
}

export function getIlluminationDescription(item: IlluminationMosaicItem, lang: "cs" | "en" = "cs"): string {
  if (lang === "en") {
    if (item.description_en) return item.description_en;
    const def = DEFAULT_ILLUMINATIONS.find((d) => d.id === item.id || d.cycle === item.cycle);
    if (def?.description_en) return def.description_en;
  }
  return item.description;
}

// Načtení iluminací z localStorage nebo výchozích (s automatickou migrací starých Wikimedia URL a doplněním EN metadat)
export function getStoredIlluminations(): IlluminationMosaicItem[] {
  if (typeof window === "undefined") return DEFAULT_ILLUMINATIONS;
  try {
    const saved = localStorage.getItem("quilldrop-illuminations");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let changed = false;
        const migrated = parsed.map((item: IlluminationMosaicItem) => {
          const defMatch = DEFAULT_ILLUMINATIONS.find(d => d.id === item.id || d.cycle === item.cycle);
          let updatedItem = { ...item };

          if (item.source && item.source.includes("upload.wikimedia.org") && defMatch) {
            changed = true;
            updatedItem.source = defMatch.source;
          }

          if (defMatch) {
            if (!updatedItem.title_en && defMatch.title_en) { updatedItem.title_en = defMatch.title_en; changed = true; }
            if (!updatedItem.origin_en && defMatch.origin_en) { updatedItem.origin_en = defMatch.origin_en; changed = true; }
            if (!updatedItem.century_en && defMatch.century_en) { updatedItem.century_en = defMatch.century_en; changed = true; }
            if (!updatedItem.tierName_en && defMatch.tierName_en) { updatedItem.tierName_en = defMatch.tierName_en; changed = true; }
            if (!updatedItem.description_en && defMatch.description_en) { updatedItem.description_en = defMatch.description_en; changed = true; }
          }

          return updatedItem;
        });
        if (changed) {
          localStorage.setItem("quilldrop-illuminations", JSON.stringify(migrated));
        }
        return migrated.sort((a, b) => a.cycle - b.cycle);
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_ILLUMINATIONS;
}

// Uložení iluminací
export function saveStoredIlluminations(list: IlluminationMosaicItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("quilldrop-illuminations", JSON.stringify(list));
  } catch (err) {
    console.error("Chyba při ukládání iluminací:", err);
  }
}

// Vrátí aktivní iluminaci podle aktuálního počtu dní ve streaku
export function getActiveIllumination(streak: number, list = getStoredIlluminations()): IlluminationMosaicItem {
  if (!list || list.length === 0) return DEFAULT_ILLUMINATIONS[0];
  const sorted = [...list].sort((a, b) => a.cycle - b.cycle);
  const cycleIndex = Math.floor(Math.max(0, streak - 1) / 16);
  return sorted[cycleIndex % sorted.length];
}

// Výpočet rozdílu dnů mezi dvěma daty YYYY-MM-DD
export function getDaysDifference(dateStr1: string, dateStr2: string): number {
  if (!dateStr1 || !dateStr2) return 999;
  const d1 = new Date(dateStr1 + "T00:00:00Z");
  const d2 = new Date(dateStr2 + "T00:00:00Z");
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 999;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}
