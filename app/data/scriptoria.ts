export type ScriptoriumPlace = {
  id: string;
  name: string;
  region: string;
  country: string;
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
    region: "Královské město & Pražský hrad",
    country: "České království",
    description: "Srdce lucemburského a husitského písemnictví. Karlova univerzita, Kolej Všech svatých, skriptorium metropolitní kapituly u sv. Víta, Emauzský klášter Na Slovanech i královská kancelář na Pražském hradě.",
    lat: 50.0880,
    lng: 14.4208,
    zoom: 11,
    x: 48,
    y: 36,
    icon: "👑",
    matchKeywords: ["prague", "praha", "castro", "sanctorum", "klementinum"],
  },
  {
    id: "olomouc",
    name: "Olomouc",
    region: "Metropolitní kapitula u sv. Václava",
    country: "Moravské markrabství",
    description: "Přední centrum moravské církevní správy, teologie a vzdělanosti. Zdejší biskupská a kapitulní knihovna u dómu sv. Václava uchovává stovky vzácných liturgických a právnických kodexů.",
    lat: 49.5938,
    lng: 17.2509,
    zoom: 11,
    x: 64,
    y: 40,
    icon: "⛪",
    matchKeywords: ["olomouc", "moravia"],
  },
  {
    id: "vyssi-brod",
    name: "Vyšší Brod",
    region: "Cisterciácké opatství",
    country: "Jižní Čechy",
    description: "Cisterciácký klášter založený Vokem z Rožmberka roku 1259 v šumavských lesích u Vltavy. Zdejší mniši vybudovali monumentální klášterní knihovnu s desítkami tisíc svazků a iluminovaných památek.",
    lat: 48.6206,
    lng: 14.3075,
    zoom: 12,
    x: 45,
    y: 53,
    icon: "📜",
    matchKeywords: ["vyšší brod", "vyssi brod", "hohenfurth"],
  },
  {
    id: "brno",
    name: "Brno",
    region: "Zemské město & augustiniáni",
    country: "Moravské markrabství",
    description: "Centrum moravských zemských sněmů a soudů. Bohatá písařská tradice u sv. Tomáše na Starém Brně i v konventech žebravých řádů.",
    lat: 49.1951,
    lng: 16.6068,
    zoom: 11,
    x: 58,
    y: 45,
    icon: "⚖️",
    matchKeywords: ["brno", "brünn", "moravská zemská"],
  },
  {
    id: "rajhrad",
    name: "Rajhrad",
    region: "Benediktinské arciopatství",
    country: "Moravské markrabství",
    description: "Nejstarší mužský klášter na Moravě, založený roku 1048 knížetem Břetislavem I. Místní benediktini vytvořili rozsáhlou knihovnu a skriptorium s unikátními biblickými rukopisy.",
    lat: 49.0883,
    lng: 16.5983,
    zoom: 12,
    x: 60,
    y: 48,
    icon: "🏛️",
    matchKeywords: ["rajhrad", "raygern"],
  },
  {
    id: "krakow",
    name: "Krakov & Kazimierz",
    region: "Královské město & Kaziměř",
    country: "Polské království",
    description: "Sídlo polských králů na Wawelu a slavné Jagellonské univerzity. Mezi Prahou a Krakovem existovala čilá výměna mistrů, studentů a opisovaných rukopisů.",
    lat: 50.0510,
    lng: 19.9450,
    zoom: 11,
    x: 78,
    y: 31,
    icon: "🏰",
    matchKeywords: ["kazimierz", "krakow", "cracov", "polon"],
  },
  {
    id: "zittau",
    name: "Žitava (Zittau)",
    region: "Horní Lužice",
    country: "Země Koruny české",
    description: "Významný člen lužického Šestiměstí svázaný s českou korunou. Křižovatka obchodních cest a působiště městských i církevních písařů na pomezí Čech a Saska.",
    lat: 50.8967,
    lng: 14.8061,
    zoom: 12,
    x: 50,
    y: 26,
    icon: "🛡️",
    matchKeywords: ["zittau", "žitava", "lusatia"],
  },
  {
    id: "bologna",
    name: "Bologna",
    region: "Emilia-Romagna & dominikáni",
    country: "Italská města",
    description: "Nejstarší univerzita v Evropě, proslulá studiem římského i kanonického práva. Zdejší konvent sv. Dominika byl centrem opisování právnických traktátů (např. písařem Benediktem z Valdštejna).",
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
    country: "Florentská republika",
    description: "Kolébka renesančního humanismu a knižní malby. Florentská humanistická minuskula a zdobené iluminace inspirovaly učence a mecenáše v celé střední Evropě.",
    lat: 43.7696,
    lng: 11.2558,
    zoom: 11,
    x: 43,
    y: 84,
    icon: "⚜️",
    matchKeywords: ["firenze", "florentie", "florence"],
  },
  {
    id: "esztergom",
    name: "Ostřihom & Varadín",
    region: "Ostřihomské arcibiskupství",
    country: "Uherské království",
    description: "Centrum uherské církve na Dunaji a rezidence humanistických biskupů. Místo vzniku významných teologických i renesančních rukopisů (např. okruh Jana Vitéze z Zredny).",
    lat: 47.7855,
    lng: 18.7402,
    zoom: 11,
    x: 72,
    y: 56,
    icon: "🕊️",
    matchKeywords: ["esztergom", "oradea", "varadin", "hungar"],
  },
  {
    id: "austria",
    name: "Vídeň & Rakousko",
    region: "Podunají & Dolní Rakousy",
    country: "Svatá říše římská",
    description: "Vídeňská univerzita a podunajské kláštery (Melk, Klosterneuburg). Důležitá spojnice mezi českým skriptoriem a jihoněmeckým kulturním okruhem.",
    lat: 48.2082,
    lng: 16.3738,
    zoom: 11,
    x: 56,
    y: 58,
    icon: "🦅",
    matchKeywords: ["austria", "wien", "vienna", "rakousk", "melk"],
  },
  {
    id: "germany",
    name: "Lipsko & Německé země",
    region: "Sasko & Franky",
    country: "Svatá říše římská",
    description: "Lipská univerzita (založená pražskými mistry roku 1409 po Kutnohorském dekretu) a Norimberk jako centrum obchodu a raného knihtisku.",
    lat: 51.3397,
    lng: 12.3731,
    zoom: 11,
    x: 41,
    y: 24,
    icon: "📖",
    matchKeywords: ["german speaking", "leipzig", "lipsk", "nürnberg", "erfurt", "aleman"],
  },
  {
    id: "konstanz",
    name: "Kostnice & Leutershausen",
    region: "Bodamské jezero",
    country: "Švábsko",
    description: "Dějiště Kostnického koncilu (1414–1418), kde se střetla evropská diplomacie a kde písaři ve velkém pořizovali opisy dekretů, traktátů i hudebních sborníků.",
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
