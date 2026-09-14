export type ScriptoriumPlace = {
  id: string;
  name: string;
  region: string;
  country: string;
  description: string;
  x: number; // 0 - 100%
  y: number; // 0 - 100%
  icon: string;
  matchKeywords: string[];
};

export const SCRIPTORIA_PLACES: ScriptoriumPlace[] = [
  {
    id: "praha",
    name: "Praha",
    region: "Královské město & Karolinum",
    country: "České království",
    description: "Srdce lucemburského a husitského písemnictví. Karlova univerzita, skriptorium metropolitní kapituly u sv. Víta, Emauzský klášter Na Slovanech i královská kancelář na Pražském hradě.",
    x: 48,
    y: 36,
    icon: "👑",
    matchKeywords: ["prague", "praha"],
  },
  {
    id: "olomouc",
    name: "Olomouc",
    region: "Metropolitní kapitula",
    country: "Moravské markrabství",
    description: "Centrum moravské církevní správy a vzdělanosti. Místní biskupská a kapitulní knihovna u sv. Václava v Olomouci uchovává stovky unikátních latinských i německých kodexů.",
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
    description: "Cisterciácký klášter založený Vokem z Rožmberka roku 1259 v hlubokých šumavských lesích u Vltavy. Dochovala se zde vzácná klášterní knihovna s více než 70 000 svazky a iluminovanými rukopisy.",
    x: 45,
    y: 53,
    icon: "📜",
    matchKeywords: ["vyšší brod", "vyssi brod", "hohenfurth"],
  },
  {
    id: "rajhrad",
    name: "Rajhrad",
    region: "Benediktinské arciopatství",
    country: "Moravské markrabství",
    description: "Nejstarší mužský klášter na Moravě, založený roku 1048 knížetem Břetislavem I. Zdejší benediktinští mniši vytvořili monumentální knihovnu a skriptorium s liturgickými a teologickými památkami.",
    x: 60,
    y: 48,
    icon: "🏛️",
    matchKeywords: ["rajhrad", "raygern"],
  },
  {
    id: "brno",
    name: "Brno",
    region: "Zemské město & kláštery",
    country: "Moravské markrabství",
    description: "Centrum moravských zemských desek a soudů. Bohatá písařská tradice u svatého Tomáše, augustiniánské rukopisy a městské knihy moravských písařů.",
    x: 58,
    y: 45,
    icon: "⚖️",
    matchKeywords: ["brno", "brünn"],
  },
  {
    id: "krakow",
    name: "Krakov & Kazimierz",
    region: "Královské město Krakov",
    country: "Polské království",
    description: "Centrum Jagellonské univerzity a kaziměřských klášterů. Mezi Prahou a Krakovem panovala čilá výměna univerzitních mistrů, studentů i opisovaných kodexů.",
    x: 78,
    y: 31,
    icon: "🏰",
    matchKeywords: ["kazimierz", "krakow", "cracov"],
  },
  {
    id: "zittau",
    name: "Žitava (Zittau)",
    region: "Horní Lužice",
    country: "Země Koruny české",
    description: "Klíčový člen lužického Šestiměstí spojený s českou korunou. Místo působení městských a farních písařů na pomezí Čech a Saska.",
    x: 50,
    y: 26,
    icon: "🛡️",
    matchKeywords: ["zittau", "žitava"],
  },
  {
    id: "konstanz",
    name: "Kostnice & Leutershausen",
    region: "Jižní Německo",
    country: "Svatá říše římská",
    description: "Dějiště slavného Kostnického koncilu (1414–1418), kde se střetla evropská diplomacie a kde písaři ve velkém pořizovali opisy dekretů a traktátů.",
    x: 31,
    y: 54,
    icon: "🕊️",
    matchKeywords: ["konstanz", "kostnice", "leutershausen"],
  },
  {
    id: "italia",
    name: "Bologna & Florencie",
    region: "Severní Itálie & Toskánsko",
    country: "Italská města",
    description: "Proslulá právnická univerzita v Bologni a kolébka humanistického písemnictví ve Florencii. Odsud do českých zemí putovaly právnické kodexy i renesanční rukopisy Petrarcy.",
    x: 42,
    y: 80,
    icon: "🏛️",
    matchKeywords: ["bologna", "bononia", "florentie", "firenze", "italy"],
  },
];

export function getScriptoriumForCard(card: { place?: string; manuscript?: string }): ScriptoriumPlace {
  const p = (card.place || "").toLowerCase();
  const m = (card.manuscript || "").toLowerCase();

  for (const place of SCRIPTORIA_PLACES) {
    if (place.matchKeywords.some((kw) => p.includes(kw) || m.includes(kw))) {
      return place;
    }
  }

  // Fallback defaults to Olomouc (majority of dataset) or Prague if Czech
  if (p.includes("czech") || p.includes("česk")) {
    return SCRIPTORIA_PLACES[0]; // Praha
  }
  return SCRIPTORIA_PLACES[1]; // Olomouc
}
