export type ScriptoriumPlace = {
  id: string;
  name: string;
  name_en?: string;
  region: string;
  region_en?: string;
  country: string;
  country_en?: string;
  modernRepository: string;
  modernRepository_en?: string;
  description: string;
  description_en?: string;
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
    matchKeywords: ["prague", "praha", "castro", "sanctorum", "klementinum", "národní knihovna", "czechia (praha?)"],
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
    id: "trebon",
    name: "Třeboň",
    region: "Augustiniánský klášter a rožmberský archiv",
    country: "Česká republika",
    modernRepository: "Státní oblastní archiv v Třeboni",
    description: "Významné centrum středověkého klášterního a rožmberského písemnictví. Rukopisy a archiválie jsou uloženy v třeboňském archivu.",
    lat: 49.0036,
    lng: 14.7707,
    zoom: 12,
    x: 48,
    y: 50,
    icon: "🏰",
    matchKeywords: ["třeboň", "trebon", "wittingau"],
  },
  {
    id: "fulstejn",
    name: "Fulštejn (Bohušov)",
    region: "Osoblažsko, Slezsko",
    country: "Česká republika",
    modernRepository: "Zemský archiv v Opavě / Biskupský lenní archiv",
    description: "Sídlo biskupského lenního rodu Supů z Fulštejna. Hradní kaple a písařské záznamy jsou spjaty s olomouckým biskupstvím a archivovány v Opavě.",
    lat: 50.2762,
    lng: 17.7169,
    zoom: 12,
    x: 67,
    y: 33,
    icon: "🛡️",
    matchKeywords: ["fulštejn", "fulstein", "osoblaha", "bohušov"],
  },
  {
    id: "litomerice",
    name: "Litoměřice",
    region: "Severní Čechy",
    country: "Česká republika",
    modernRepository: "Státní oblastní archiv v Litoměřicích / Katedrální kapitula",
    description: "Kolegiátní kapitula sv. Štěpána a významné královské město na Labi. Působiště probošta Benedikta z Valdštejna.",
    lat: 50.5335,
    lng: 14.1318,
    zoom: 12,
    x: 46,
    y: 30,
    icon: "📖",
    matchKeywords: ["litoměřice", "litomerice", "litho", "leitmeritz"],
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
    id: "wroclaw",
    name: "Vratislav (Wrocław)",
    region: "Dolní Slezsko",
    country: "Polsko",
    modernRepository: "Biblioteka Uniwersytecka we Wrocławiu",
    description: "Klíčové obchodní a církevní centrum Koruny české. Bohaté sbírky gotických kodexů z klášterů a kapitol jsou dnes chráněny ve Vratislavské univerzitní knihovně.",
    lat: 51.1079,
    lng: 17.0385,
    zoom: 11,
    x: 62,
    y: 28,
    icon: "🕊️",
    matchKeywords: ["wrocław", "wroclaw", "breslau", "vratislav"],
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
    id: "leipzig",
    name: "Lipsko (Leipzig)",
    name_en: "Leipzig",
    region: "Sasko",
    region_en: "Saxony",
    country: "Německo",
    country_en: "Germany",
    modernRepository: "Universitätsbibliothek Leipzig",
    modernRepository_en: "Leipzig University Library",
    description: "Významné německé univerzitní město se silnými bohemikálními vazbami po odchodu pražských mistrů (1409). Bohaté fondy středověkých kodexů chová Lipská univerzitní knihovna.",
    description_en: "Major Saxon university city with profound Bohemian connections following the departure of Prague scholars in 1409. Manuscripts are conserved at Leipzig University Library.",
    lat: 51.3397,
    lng: 12.3731,
    zoom: 11,
    x: 41,
    y: 24,
    icon: "📖",
    matchKeywords: ["leipzig", "lipsk", "lipsko"],
  },
  {
    id: "nurnberg",
    name: "Norimberk (Nürnberg)",
    name_en: "Nuremberg",
    region: "Franky / Bavorsko",
    region_en: "Franconia / Bavaria",
    country: "Německo",
    country_en: "Germany",
    modernRepository: "Stadtbibliothek Nürnberg",
    modernRepository_en: "Nuremberg City Library",
    description: "Svobodné říšské město, křižovatka obchodu, humanismu a knižní kultury mezi Prahou a západní Evropou. Rukopisy a kolofony uchovává Stadtbibliothek Nürnberg.",
    description_en: "Imperial free city and cultural crossroads linking Prague to Western Europe. Medieval codices and early prints are held in the Nuremberg City Library.",
    lat: 49.4521,
    lng: 11.0767,
    zoom: 11,
    x: 39,
    y: 38,
    icon: "🏰",
    matchKeywords: ["nürnberg", "nurnberg", "norimberk", "german speaking", "aleman"],
  },
  {
    id: "erfurt",
    name: "Erfurt",
    name_en: "Erfurt",
    region: "Durynsko",
    region_en: "Thuringia",
    country: "Německo",
    country_en: "Germany",
    modernRepository: "Universitäts- und Forschungsbibliothek Erfurt / Bibliotheca Amploniana",
    modernRepository_en: "Erfurt Research Library / Bibliotheca Amploniana",
    description: "Slavné durynské univerzitní město a domov mimořádné středověké knihovny Amploniana s desítkami vědeckých a filosofických kodexů.",
    description_en: "Celebrated Thuringian university city and home of the Bibliotheca Amploniana, a priceless surviving collection of medieval scientific and philosophical codices.",
    lat: 50.9787,
    lng: 11.0328,
    zoom: 11,
    x: 37,
    y: 30,
    icon: "📜",
    matchKeywords: ["erfurt", "erford"],
  },
  {
    id: "konstanz",
    name: "Kostnice",
    name_en: "Constance (Konstanz)",
    region: "Bádensko-Württembersko",
    region_en: "Baden-Württemberg",
    country: "Německo",
    country_en: "Germany",
    modernRepository: "Stadtarchiv Konstanz, Badische Landesbibliothek Karlsruhe",
    modernRepository_en: "City Archive of Constance, Baden State Library in Karlsruhe",
    description: "Místo konání Kostnického koncilu (1414–1418). Zdejší koncilní opisy a dokumenty jsou uloženy v městském archivu v Kostnici a v Karlsruhe.",
    description_en: "Site of the Council of Constance (1414–1418). Conciliar copies and scribal documents are housed in the Constance City Archive and the Baden State Library.",
    lat: 47.6634,
    lng: 9.1757,
    zoom: 11,
    x: 31,
    y: 54,
    icon: "🕯️",
    matchKeywords: ["konstanz", "kostnice", "leutershausen"],
  },
  {
    id: "viden",
    name: "Vídeň (Wien)",
    name_en: "Vienna (Wien)",
    region: "Dolní Rakousy",
    region_en: "Lower Austria",
    country: "Rakousko",
    country_en: "Austria",
    modernRepository: "Österreichische Nationalbibliothek (ÖNB), Vídeň",
    modernRepository_en: "Austrian National Library (ÖNB), Vienna",
    description: "Císařské sídlo a univerzitní centrum na Dunaji. Středověké rukopisy středoevropského okruhu jsou uchovány v Rakouské národní knihovně ve Vídni.",
    description_en: "Imperial capital and academic center on the Danube. Central European medieval manuscripts are conserved in the Austrian National Library.",
    lat: 48.2082,
    lng: 16.3738,
    zoom: 11,
    x: 56,
    y: 58,
    icon: "🦅",
    matchKeywords: ["wien", "vienna", "vídeň", "österreichische", "österreichische nationalbibliothek", "vídni"],
  },
  {
    id: "melk",
    name: "Melk",
    name_en: "Melk Abbey",
    region: "Dolní Rakousy",
    region_en: "Lower Austria",
    country: "Rakousko",
    country_en: "Austria",
    modernRepository: "Stiftsbibliothek Melk",
    modernRepository_en: "Melk Abbey Library",
    description: "Proslulé benediktinské opatství nad Dunajem, centrum melcké klášterní reformy 15. století s mimořádně zachovanou středověkou knihovnou.",
    description_en: "Famed Benedictine abbey perched above the Danube, the beacon of the 15th-century Melk monastic reform with a magnificent preserved medieval library.",
    lat: 48.2281,
    lng: 15.3328,
    zoom: 12,
    x: 53,
    y: 56,
    icon: "⛪",
    matchKeywords: ["melk", "stiftsbibliothek melk"],
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
    matchKeywords: ["esztergom", "oradea", "varadin", "hungar", "ostřihom", "uhry"],
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
];

export function getPlaceName(place: ScriptoriumPlace, lang: "cs" | "en" = "cs"): string {
  return (lang === "en" && place.name_en) ? place.name_en : place.name;
}

export function getPlaceRegion(place: ScriptoriumPlace, lang: "cs" | "en" = "cs"): string {
  return (lang === "en" && place.region_en) ? place.region_en : place.region;
}

export function getPlaceCountry(place: ScriptoriumPlace, lang: "cs" | "en" = "cs"): string {
  return (lang === "en" && place.country_en) ? place.country_en : place.country;
}

export function getPlaceRepository(place: ScriptoriumPlace, lang: "cs" | "en" = "cs"): string {
  return (lang === "en" && place.modernRepository_en) ? place.modernRepository_en : place.modernRepository;
}

export function getPlaceDescription(place: ScriptoriumPlace, lang: "cs" | "en" = "cs"): string {
  return (lang === "en" && place.description_en) ? place.description_en : place.description;
}

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
    if (p.includes("austria") || p.includes("rakousk")) {
      return SCRIPTORIA_PLACES.find((x) => x.id === "viden")!;
    }
    if (p.includes("ital")) {
      return SCRIPTORIA_PLACES.find((x) => x.id === "bologna")!;
    }
    if (p.includes("poland") || p.includes("polsk")) {
      return SCRIPTORIA_PLACES.find((x) => x.id === "krakow")!;
    }
    if (p.includes("germany") || p.includes("německ")) {
      return SCRIPTORIA_PLACES.find((x) => x.id === "nurnberg")!;
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

// Dynamické sestavení přehledu skriptorií podle reálně nahraných karet a stavu hráčovy sbírky
export function getScriptoriaWithCards<T extends { id: string | number; place?: string; manuscript?: string }>(
  cards: T[],
  collection: Record<string | number, number>
) {
  // Seskupíme karty podle přiřazeného skriptoria
  const map = new Map<string, { place: ScriptoriumPlace; cards: T[]; owned: T[] }>();

  for (const place of SCRIPTORIA_PLACES) {
    map.set(place.id, {
      place,
      cards: [],
      owned: [],
    });
  }

  for (const card of cards) {
    const place = getScriptoriumForCard(card);
    let entry = map.get(place.id);
    if (!entry) {
      entry = { place, cards: [], owned: [] };
      map.set(place.id, entry);
    }
    entry.cards.push(card);
    if (collection[card.id] && collection[card.id] > 0) {
      entry.owned.push(card);
    }
  }

  // Zobrazujeme pouze skriptoria, která mají alespoň 1 kartu v aktuální sadě
  const results = Array.from(map.values()).filter((e) => e.cards.length > 0);

  // Řadíme: Nejdříve skriptoria, kde hráč již NĚCO OBJEVIL (owned > 0), a teprve potom dosud neobjevená
  results.sort((a, b) => {
    if (a.owned.length > 0 && b.owned.length === 0) return -1;
    if (a.owned.length === 0 && b.owned.length > 0) return 1;
    return b.owned.length - a.owned.length;
  });

  return results;
}
