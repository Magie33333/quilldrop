// Dataset 16dílných středověkých iluminací a správa denních streaků (Cesta písaře)

export type IlluminationRarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Unique";

export type IlluminationMosaicItem = {
  id: string;
  cycle: number; // 1, 2, 3...
  title: string;
  source: string; // URL nebo relativní cesta
  origin: string; // Název rukopisu / instituce
  century: string; // např. "14. století"
  tierName: string; // např. "Cyklus učedníka (Dny 1–16)"
  rarity: IlluminationRarity;
  description: string;
  rewardXp: number;
  rewardPack: "standard" | "refined" | "masterwork";
};

export const DEFAULT_ILLUMINATIONS: IlluminationMosaicItem[] = [
  {
    id: "rabbit-scribe",
    cycle: 1,
    title: "Učený zajíc (The Learned Hare)",
    source: "/illumination-rabbit.png",
    origin: "Střední Evropa, iluminovaný žaltář",
    century: "14. století",
    tierName: "Cyklus učedníka (Dny 1–16)",
    rarity: "Common",
    description: "Autentická humorná marginálie písařského zajíce se svitkem. Vstupní krok každého začínajícího badatele do tajů skriptoria.",
    rewardXp: 150,
    rewardPack: "standard",
  },
  {
    id: "scriptorium-monk",
    cycle: 2,
    title: "Písař v dílně (Scriptorium Master)",
    source: "/illuminations/eadwine-scribe.jpg",
    origin: "Eadwine Psalter, Trinity College Cambridge",
    century: "12. století",
    tierName: "Cyklus tovaryše (Dny 17–32)",
    rarity: "Uncommon",
    description: "Slavný středověký autoportrét písaře sedícího na vyřezávané stolici se seříznutým perem v pravici a škrabkou v levici.",
    rewardXp: 250,
    rewardPack: "refined",
  },
  {
    id: "bohemian-lion",
    cycle: 3,
    title: "Český královský lev (Bohemian Lion)",
    source: "/illuminations/bohemian-lion.jpg",
    origin: "Gelnhausenův kodex, Státní okresní archiv Jihlava",
    century: "Konec 14. století",
    tierName: "Cyklus mistra (Dny 33–48)",
    rarity: "Rare",
    description: "Impozantní zlacená iluminace dvouocasého českého lva s královskou korunou ze slavné jihlavské právní knihy Jana z Gelnhausenu.",
    rewardXp: 400,
    rewardPack: "refined",
  },
  {
    id: "wenceslas-initial",
    cycle: 4,
    title: "Královská iniciála 'W' (Wenceslas Bible)",
    source: "/illuminations/wenceslas-initial.jpg",
    origin: "Bible Václava IV. (ÖNB Vídeň, Cod. 2759–2764), Praha",
    century: "Kolem roku 1390",
    tierName: "Cyklus kanovníka (Dny 49–64)",
    rarity: "Epic",
    description: "Monumentální dvorská zlacená iniciála s královským ledňáčkem ve věníku. Vrchol pražského gotického knižního malířství.",
    rewardXp: 600,
    rewardPack: "masterwork",
  },
  {
    id: "astrolabe-spheres",
    cycle: 5,
    title: "Nebeské sféry a astroláb (Cosmographia)",
    source: "/illuminations/astrolabe-spheres.jpg",
    origin: "Astronomický sborník krále Václava IV., Praha",
    century: "Konec 14. století",
    tierName: "Cyklus iluminátora (Dny 65–80)",
    rarity: "Legendary",
    description: "Astronomické schéma nebeských sfér, planet a měření času z vědeckých rukopisů pražské univerzitní a dvorské komunity.",
    rewardXp: 800,
    rewardPack: "masterwork",
  },
  {
    id: "codex-gigas-devil",
    cycle: 6,
    title: "Podlažický ďábel (Codex Gigas)",
    source: "/illuminations/codex-gigas-devil.jpg",
    origin: "Benediktinský klášter Podlažice u Chrudimi (dnes Kungliga biblioteket, Stockholm)",
    century: "Počátek 13. století",
    tierName: "Cyklus legendárního bibliofila (Dny 81–96+)",
    rarity: "Unique",
    description: "Mýtická celostránková iluminace ďábla z největšího středověkého rukopisu světa („Ďáblovy bible“), vytvořeného v Čechách.",
    rewardXp: 1500,
    rewardPack: "masterwork",
  },
];

// Načtení iluminací z localStorage nebo výchozích (s automatickou migrací starých Wikimedia URL)
export function getStoredIlluminations(): IlluminationMosaicItem[] {
  if (typeof window === "undefined") return DEFAULT_ILLUMINATIONS;
  try {
    const saved = localStorage.getItem("quilldrop-illuminations");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let changed = false;
        const migrated = parsed.map((item: IlluminationMosaicItem) => {
          if (item.source && item.source.includes("upload.wikimedia.org")) {
            const defMatch = DEFAULT_ILLUMINATIONS.find(d => d.id === item.id || d.cycle === item.cycle);
            if (defMatch) {
              changed = true;
              return { ...item, source: defMatch.source };
            }
          }
          return item;
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
