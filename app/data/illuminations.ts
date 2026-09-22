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
    tierName: "Cyklus legendárního bibliofila (Dny 81–96)",
    tierName_en: "Legendary Bibliophile Cycle (Days 81–96)",
    rarity: "Unique",
    description: "Mýtická celostránková iluminace ďábla z největšího středověkého rukopisu světa („Ďáblovy bible“), vytvořeného v Čechách.",
    description_en: "Mythical full-page illumination of the Devil from the world's largest surviving medieval manuscript ('The Devil's Bible'), crafted in Bohemia.",
    rewardXp: 1500,
    rewardPack: "masterwork",
  },
  {
    id: "titivillus",
    cycle: 7,
    title: "Titivillus – Démon písařských chyb",
    title_en: "Titivillus – The Scribes' Demon",
    source: "/illuminations/titivillus.png",
    origin: "Středověká skriptoria a traktáty o písařích (14.–15. století)",
    origin_en: "Medieval scriptoria & scribal treatises (14th–15th century)",
    century: "14.–15. století",
    century_en: "14th–15th century",
    tierName: "Cyklus písařského démona (Dny 97–112)",
    tierName_en: "Scribes' Demon Cycle (Days 97–112)",
    rarity: "Legendary",
    description: "Zákeřný démon pověřený sbíráním písařských chyb, přeskočených slabik a koktání mnichů do velkého pytle. Každý písař, který udělal chybu, tvrdil: ‚To nezavinila má ruka, to způsobil Titivillus!‘",
    description_en: "The infamous medieval demon tasked with gathering scribal blunders, skipped syllables, and mumblings of monks into a sack. Whenever a scribe erred, they blamed Titivillus!",
    rewardXp: 900,
    rewardPack: "masterwork",
  },
  {
    id: "knight-vs-snail",
    cycle: 8,
    title: "Rytíř a bojový hlemýžď (Knight vs. Snail)",
    title_en: "Knight Charging a Giant Snail",
    source: "/illuminations/knight-vs-snail.jpg",
    origin: "Brunetto Latini, Li Livres dou Tresor (Francie/Vlámsko, cca 1315)",
    origin_en: "Brunetto Latini, Li Livres dou Tresor (France/Flanders, ca. 1315)",
    century: "Počátek 14. století",
    century_en: "Early 14th century",
    tierName: "Cyklus rytíře a plže (Dny 113–128)",
    tierName_en: "Knight & Snail Cycle (Days 113–128)",
    rarity: "Rare",
    description: "Nejznámější a nejzáhadnější středověký mem. V okrajích rukopisů 13. a 14. století udatní rytíři v plné zbroji v panice útočí či prchají před obřími hlemýždi – satira na pýchu i zbabělost šlechty.",
    description_en: "The most celebrated and mysterious medieval meme. In 13th- and 14th-century margins, valiant armored knights panic and battle giant snails — a satire of cowardice and chivalric vanity.",
    rewardXp: 700,
    rewardPack: "refined",
  },
  {
    id: "killer-rabbit",
    cycle: 9,
    title: "Vražedný králík pomstitel (The Killer Rabbit)",
    title_en: "The Killer Rabbit of Smithfield",
    source: "/illuminations/killer-rabbit.jpg",
    origin: "Smithfield Decretals (British Library, Royal MS 10 E IV), Londýn",
    origin_en: "Smithfield Decretals (British Library, Royal MS 10 E IV), London",
    century: "Kolem roku 1340",
    century_en: "Circa 1340",
    tierName: "Cyklus světa naruby (Dny 129–144)",
    tierName_en: "Topsy-Turvy Cycle (Days 129–144)",
    rarity: "Epic",
    description: "Středověký svět obrácený naruby (mundus inversus). Místo aby byl zajíc loven, popadne sekeru, zajme lovce i se psem a stíná jim hlavy. Přímá předloha pro zabijáckého králíka z Monty Python.",
    description_en: "The medieval world turned upside down (mundus inversus). Instead of being hunted, rabbits arm themselves with axes and swords, executing hunters and hounds. Direct ancestor of the Monty Python killer rabbit.",
    rewardXp: 850,
    rewardPack: "masterwork",
  },
  {
    id: "wenceslas-bathmaids",
    cycle: 10,
    title: "Královské lazebnice Václava IV. (Dvorský věník)",
    title_en: "The Royal Bathmaids of King Wenceslas IV",
    source: "/illuminations/wenceslas-bathmaids.jpg",
    origin: "Bible Václava IV. (ÖNB Vídeň, Cod. 2759–2764), Praha",
    origin_en: "Wenceslas Bible (ÖNB Vienna, Cod. 2759–2764), Prague",
    century: "Konec 14. století (cca 1390–1400)",
    century_en: "Late 14th century (ca. 1390–1400)",
    tierName: "Cyklus královských lázní (Dny 145–160)",
    tierName_en: "Prague Court Bath Cycle (Days 145–160)",
    rarity: "Epic",
    description: "Světoznámý a lehce skandální emblém českého krále Václava IV. Půvabné dívky v průsvitných košilkách s věníky a škopky na vodu omývají krále v lázni a pečují o posvátného ledňáčka.",
    description_en: "The famed courtly emblem of Bohemian King Wenceslas IV. Graceful bath attendants in sheer robes with bath-towels and buckets tending to the monarch and the royal kingfisher.",
    rewardXp: 1000,
    rewardPack: "masterwork",
  },
  {
    id: "sciapod-monopod",
    cycle: 11,
    title: "Skiapod – Stínonoh (The Sciapod)",
    title_en: "The Sciapod (Monopod) with Foot Umbrella",
    source: "/illuminations/sciapod-monopod.jpg",
    origin: "Livre des merveilles du monde (BnF Fr. 2810, fol. 29v), Paříž",
    origin_en: "Livre des merveilles du monde (BnF Fr. 2810, fol. 29v), Paris",
    century: "Počátek 15. století (1410–1412)",
    century_en: "Early 15th century (1410–1412)",
    tierName: "Cyklus stínonožců (Dny 161–176)",
    tierName_en: "Monstrous Races Cycle (Days 161–176)",
    rarity: "Rare",
    description: "Mýtický tvor z dalekých neprobádaných krajin s jedinou obří nohou. Byli vyhlášení neobyčejnou rychlostí běhu, a když v poledne pražilo horké slunce, lehli si na záda a nohou si stínili jako deštníkem.",
    description_en: "Mythical inhabitant of far-off lands with a single gigantic foot. Famed as swift runners, in the midday heat they would lie on their backs and shade themselves beneath their foot like an umbrella.",
    rewardXp: 750,
    rewardPack: "refined",
  },
  {
    id: "luttrell-grotesque",
    cycle: 12,
    title: "Klášterní chiméra (Luttrell Grotesque)",
    title_en: "Luttrell Grotesque (Hybrid Monster)",
    source: "/illuminations/luttrell-grotesque.png",
    origin: "Luttrell Psalter (British Library, Add MS 42130, fol. 27r), Anglie",
    origin_en: "Luttrell Psalter (British Library, Add MS 42130, fol. 27r), England",
    century: "Kolem roku 1330",
    century_en: "Circa 1330",
    tierName: "Cyklus mistrovské chiméry (Dny 177–192+)",
    tierName_en: "Masterwork Chimera Cycle (Days 177–192+)",
    rarity: "Unique",
    description: "Fascinující hybridní stvoření kombinující lidskou hlavu v mnišské kápí, ptačí tělo a dračí ocas. Vrchol gotické imaginace, kde se zbožný text na pergamenu prolíná s nespoutanou noční můrou.",
    description_en: "A captivating hybrid creature combining a hooded human face, a bird's body, and a dragon's tail. The pinnacle of Gothic imagination where sacred psalms intertwine with wild, surreal drolleries.",
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

        // Automaticky doplnit nově přidané cykly z DEFAULT_ILLUMINATIONS (např. cykly 7–12)
        DEFAULT_ILLUMINATIONS.forEach((defItem) => {
          if (!migrated.some((m) => m.id === defItem.id || m.cycle === defItem.cycle)) {
            migrated.push(defItem);
            changed = true;
          }
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
