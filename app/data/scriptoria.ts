export type ScriptoriumPlace = {
  id: string;
  name: string;
  region: string;
  country: string; // Moderní stát: Česká republika, Polsko, Německo, Itálie, Rakousko, Maďarsko
  modernRepository: string; // Současná paměťová instituce / knihovna / archiv
  description: string;
  lat: number;
  lng: number;
  zoom?: number;
  x: number; // fallback %
  y: number; // fallback %
  icon: string;
  matchKeywords: string[];
};

export const SCRIPTORIA_PLACES: ScriptoriumPlace[] = [
  {
    id: "praha",
    name: "Praha",
    region: "Pražský hrad, Klementinum a Nové Město",
    country: "Česká republika",
    modernRepository: "Národní knihovna ČR (Klementinum), Knihovna Národního muzea, Archiv Pražského hradu",
    description: "Srdce českého písemnictví a královské moci. Kodexy a kolofony jsou dnes uchovány v Národní knihovně ČR (Klementinum), Knihovně Národního muzea a v Archivu Pražského hradu.",
    lat: 50.0880,
    lng: 14.4208,
    zoom: 11,
    x: 48,
    y: 36,
    icon: "👑",
    matchKeywords: ["prague", "praha", "castro", "sanctorum", "klementinum", "národní knihovna"],
  },
  {
    id: "olomouc",
    name: "Olomouc",
    region: "Metropolitní kapitula u sv. Václava",
    country: "Česká republika",
    modernRepository: "Zemský archiv v Opavě – pobočka Olomouc (Metropolitní kapitula), Vědecká knihovna v Olomouci",
    description: "Přední moravské centrum církevní správy. Rukopisy Metropolitní kapituly u sv. Václava jsou dnes uloženy a chráněny v Zemském archivu v Opavě (pobočka Olomouc) a ve Vědecké knihovně v Olomouci.",
    lat: 49.5938,
    lng: 17.2509,
    zoom: 11,
    x: 64,
    y: 40,
    icon: "⛪",
    matchKeywords: ["olomouc", "moravia", "opava", "zemský archiv"],
  },
  {
    id: "vyssi-brod",
    name: "Vyšší Brod",
    region: "Cisterciácký klášter v jižních Čechách",
    country: "Česká republika",
    modernRepository: "Knihovna cisterciáckého opatství Vyšší Brod",
    description: "Monumentální cisterciácká klášterní knihovna založená roku 1259 Vokem z Rožmberka. Rukopisy a iluminované kodexy jsou dodnes uloženy přímo v autentických prostorách vyšebrodského kláštera.",
    lat: 48.6206,
    lng: 14.3075,
    zoom: 12,
    x: 45,
    y: 53,
    icon: "📜",
    matchKeywords: ["vyšší brod", "vyssi brod", "hohenfurth", "rožmberk"],
  },
  {
    id: "brno",
    name: "Brno",
    region: "Moravské zemské město",
    country: "Česká republika",
    modernRepository: "Moravská zemská knihovna v Brně (MZK)",
    description: "Centrum moravských zemských sněmů a soudů. Bohatá sbírka rukopisů a starých tisků je dnes badatelům přístupná v Moravské zemské knihovně v Brně.",
    lat: 49.1951,
    lng: 16.6068,
    zoom: 11,
    x: 58,
    y: 45,
    icon: "⚖️",
    matchKeywords: ["brno", "brünn", "moravská zemská", "mzk"],
  },
  {
    id: "rajhrad",
    name: "Rajhrad",
    region: "Benediktinské arciopatství",
    country: "Česká republika",
    modernRepository: "Památník písemnictví na Moravě (Knihovna benediktinského arciopatství v Rajhradě)",
    description: "Nejstarší mužský klášter na Moravě (založen 1048). Rozsáhlá historická knihovna benediktinů se vzácnými biblickými kodexy je dnes spravována Památníkem písemnictví na Moravě.",
    lat: 49.0883,
    lng: 16.5983,
    zoom: 12,
    x: 60,
    y: 48,
    icon: "🏛️",
    matchKeywords: ["rajhrad", "raygern", "památník písemnictví"],
  },
  {
    id: "krakow",
    name: "Krakov",
    region: "Malopolsko",
    country: "Polsko",
    modernRepository: "Biblioteka Jagiellońska, Uniwersytet Jagielloński w Krakowie",
    description: "Sídlo Jagellonské univerzity s úzkými vazbami na pražské mistry a studenty. Středověké rukopisy jsou uchovány ve fondech slavné Jagellonské knihovny v Krakově.",
    lat: 50.0510,
    lng: 19.9450,
    zoom: 11,
    x: 78,
    y: 31,
    icon: "🏰",
    matchKeywords: ["kazimierz", "krakow", "cracov", "polon", "jagiellon"],
  },
  {
    id: "zittau",
    name: "Žitava (Zittau)",
    region: "Sasko (Horní Lužice)",
    country: "Německo",
    modernRepository: "Christian-Weise-Bibliothek Zittau",
    description: "Město Horní Lužice s historickými svazky k české koruně. Vzácné městské a církevní rukopisy jsou uloženy v Christian-Weise-Bibliothek v Žitavě.",
    lat: 50.8967,
    lng: 14.8061,
    zoom: 12,
    x: 50,
    y: 26,
    icon: "🛡️",
    matchKeywords: ["zittau", "žitava", "lusatia", "christian-weise"],
  },
  {
    id: "bologna",
    name: "Bologna",
    region: "Emilia-Romagna",
    country: "Itálie",
    modernRepository: "Biblioteca Universitaria di Bologna (BUB)",
    description: "Sídlo nejstarší evropské univerzity. Právnické a teologické kodexy (včetně zápisů českého písaře Benedikta z Valdštejna) jsou uloženy v Boloňské univerzitní knihovně.",
    lat: 44.4949,
    lng: 11.3426,
    zoom: 11,
    x: 42,
    y: 80,
    icon: "🎓",
    matchKeywords: ["bologna", "bononia", "ital"],
  },
  {
    id: "firenze",
    name: "Florencie (Firenze)",
    region: "Toskánsko",
    country: "Itálie",
    modernRepository: "Biblioteca Medicea Laurenziana, Florencie",
    description: "Kolébka renesančního humanismu a knižního umění. Vzácné iluminované kodexy jsou chráněny v proslulé medicejské knihovně Laurenziana.",
    lat: 43.7696,
    lng: 11.2558,
    zoom: 11,
    x: 43,
    y: 84,
    icon: "⚜️",
    matchKeywords: ["firenze", "florentie", "florence", "laurenziana"],
  },
  {
    id: "esztergom",
    name: "Ostřihom (Esztergom)",
    region: "Komárom-Esztergom",
    country: "Maďarsko",
    modernRepository: "Főszékesegyházi Könyvtár (Katedrální knihovna v Ostřihomi)",
    description: "Centrum uherské církve na Dunaji. Liturgické a teologické kodexy jsou uchovány v historické katedrální knihovně v Ostřihomi.",
    lat: 47.7855,
    lng: 18.7402,
    zoom: 11,
    x: 72,
    y: 56,
    icon: "🕊️",
    matchKeywords: ["esztergom", "oradea", "varadin", "hungar", "ostřihom"],
  },
  {
    id: "austria",
    name: "Vídeň",
    region: "Dolní Rakousy",
    country: "Rakousko",
    modernRepository: "Österreichische Nationalbibliothek (ÖNB), Vídeň / Stiftsbibliothek Melk",
    description: "Klíčová středoevropská paměťová centra. Kodexy jsou uloženy v Rakouské národní knihovně ve Vídni a v podunajských klášterech.",
    lat: 48.2082,
    lng: 16.3738,
    zoom: 11,
    x: 56,
    y: 58,
    icon: "🦅",
    matchKeywords: ["austria", "wien", "vienna", "rakousk", "melk", "österreichische"],
  },
  {
    id: "germany",
    name: "Lipsko",
    region: "Sasko",
    country: "Německo",
    modernRepository: "Universitätsbibliothek Leipzig, Stadtbibliothek Nürnberg",
    description: "Německá univerzitní a městská centra. Bohemikální i německé rukopisy jsou uchovány v Lipské univerzitní knihovně a v Norimberku.",
    lat: 51.3397,
    lng: 12.3731,
    zoom: 11,
    x: 41,
    y: 24,
    icon: "📖",
    matchKeywords: ["german speaking", "leipzig", "lipsk", "nürnberg", "erfurt", "aleman", "německo"],
  },
  {
    id: "konstanz",
    name: "Kostnice",
    region: "Bádensko-Württembersko",
    country: "Německo",
    modernRepository: "Stadtarchiv Konstanz, Badische Landesbibliothek Karlsruhe",
    description: "Místo konání Kostnického koncilu (1414–1418). Zdejší koncilní opisy a dokumenty jsou uloženy v městském archivu v Kostnici a v Karlsruhe.",
    lat: 47.6634,
    lng: 9.1757,
    zoom: 11,
    x: 31,
    y: 54,
    icon: "🕯️",
    matchKeywords: ["konstanz", "kostnice", "leutershausen"],
  },
];

export function getScriptoriumForCard(card: { place?: string; manuscript?: string }): ScriptoriumPlace {
  const p = (card.place || "").toLowerCase().trim();
  const m = (card.manuscript || "").toLowerCase().trim();

  // 1. Nejprve zkusíme určit přesné místo sepsání z kolofonu (card.place)
  if (p && !p.includes("unknown") && p !== "unknown place") {
    for (const place of SCRIPTORIA_PLACES) {
      if (place.matchKeywords.some((kw) => p.includes(kw))) {
        return place;
      }
    }
    // Geografické zástupné termíny
    if (p.includes("czech") || p.includes("česk")) {
      return SCRIPTORIA_PLACES.find((x) => x.id === "praha")!;
    }
    if (p.includes("ital")) {
      return SCRIPTORIA_PLACES.find((x) => x.id === "bologna")!;
    }
  }

  // 2. Pokud je místo vzniku neznámé, zařadíme kartu podle místa dochování kodexu (card.manuscript)
  for (const place of SCRIPTORIA_PLACES) {
    if (place.matchKeywords.some((kw) => m.includes(kw))) {
      return place;
    }
  }

  // Fallback: Olomouc (kde je uchována většina olomouckých kapitulních kodexů)
  return SCRIPTORIA_PLACES.find((x) => x.id === "olomouc") || SCRIPTORIA_PLACES[0];
}
