// Data pro slepou mapu Evropy - moderní státy a uložení dochovaných rukopisů

export interface ModernCountryInfo {
  name: string;
  hasManuscripts: boolean;
  repositories: string[];
  cities: string[];
  note?: string;
}

export const MODERN_COUNTRIES: Record<string, ModernCountryInfo> = {
  "Czech Republic": {
    name: "Česká republika",
    hasManuscripts: true,
    cities: ["Praha", "Olomouc", "Vyšší Brod", "Brno", "Rajhrad"],
    repositories: [
      "Národní knihovna ČR (Klementinum), Praha",
      "Zemský archiv v Opavě – pobočka Olomouc (Metropolitní kapitula)",
      "Knihovna cisterciáckého opatství Vyšší Brod",
      "Moravská zemská knihovna v Brně",
      "Památník písemnictví na Moravě (Rajhrad)",
    ],
    note: "Hlavní centrum dochovaných rukopisů a kolofonů projektu.",
  },
  "Poland": {
    name: "Polsko",
    hasManuscripts: true,
    cities: ["Krakov & Kazimierz"],
    repositories: [
      "Biblioteka Jagiellońska, Uniwersytet Jagielloński w Krakowie",
    ],
    note: "Rukopisy spojené s Jagellonskou univerzitou a krakovskými písaři.",
  },
  "Germany": {
    name: "Německo",
    hasManuscripts: true,
    cities: ["Žitava (Zittau)", "Lipsko", "Norimberk", "Kostnice"],
    repositories: [
      "Christian-Weise-Bibliothek Zittau",
      "Universitätsbibliothek Leipzig",
      "Stadtbibliothek Nürnberg",
      "Stadtarchiv Konstanz / Karlsruhe",
    ],
    note: "Hornolužické, saské a koncilní rukopisy a městské knihy.",
  },
  "Italy": {
    name: "Itálie",
    hasManuscripts: true,
    cities: ["Bologna", "Florencie"],
    repositories: [
      "Biblioteca Universitaria di Bologna",
      "Biblioteca Medicea Laurenziana, Florencie",
    ],
    note: "Univerzitní a humanistické kodexy s kolofony českých písařů.",
  },
  "Austria": {
    name: "Rakousko",
    hasManuscripts: true,
    cities: ["Vídeň", "Melk", "Klosterneuburg"],
    repositories: [
      "Österreichische Nationalbibliothek (ÖNB), Vídeň",
      "Stiftsbibliothek Melk",
    ],
    note: "Podunajské klášterní fondy a vídeňská dvorská knihovna.",
  },
  "Hungary": {
    name: "Maďarsko",
    hasManuscripts: true,
    cities: ["Ostřihom (Esztergom)"],
    repositories: [
      "Főszékesegyházi Könyvtár (Katedrální knihovna Ostřihom)",
    ],
    note: "Katedrální knihovna a liturgické rukopisy na Dunaji.",
  },
  "Slovakia": {
    name: "Slovensko",
    hasManuscripts: false,
    cities: ["Bratislava", "Spiš"],
    repositories: ["Slovenská národná knižnica"],
    note: "Bez evidovaných kodexů v aktuálním výběru.",
  },
  "France": {
    name: "Francie",
    hasManuscripts: false,
    cities: ["Paříž", "Avignon"],
    repositories: ["Bibliothèque nationale de France (BnF)"],
    note: "Bez evidovaných kodexů v aktuálním výběru.",
  },
  "United Kingdom": {
    name: "Velká Británie",
    hasManuscripts: false,
    cities: ["Londýn", "Oxford"],
    repositories: ["British Library", "Bodleian Library"],
    note: "Bez evidovaných kodexů v aktuálním výběru.",
  },
  "Switzerland": {
    name: "Švýcarsko",
    hasManuscripts: false,
    cities: ["Basilej", "St. Gallen"],
    repositories: ["Stiftsbibliothek St. Gallen"],
    note: "Bez evidovaných kodexů v aktuálním výběru.",
  },
  "Spain": {
    name: "Španělsko",
    hasManuscripts: false,
    cities: ["Madrid", "Salamanca"],
    repositories: ["Biblioteca Nacional de España"],
    note: "Bez evidovaných kodexů v aktuálním výběru.",
  },
};

export interface MedievalRiver {
  id: string;
  name: string;
  latin: string;
  coords: [number, number][]; // [lat, lng]
}

export const MEDIEVAL_RIVERS: MedievalRiver[] = [
  {
    id: "vltava",
    name: "Vltava",
    latin: "Moldau",
    coords: [
      [48.58, 14.28], // Šumava pramen
      [48.61, 14.31], // Vyšší Brod
      [48.74, 14.31], // Rožmberk
      [48.81, 14.31], // Český Krumlov
      [48.85, 14.36], // Zlatá Koruna
      [48.97, 14.47], // České Budějovice
      [49.05, 14.44], // Hluboká
      [49.30, 14.19], // Písek / soutok s Otavou
      [49.60, 14.30], // Kamýk
      [49.98, 14.40], // Zbraslav
      [50.08, 14.41], // Praha
      [50.25, 14.41], // Kralupy
      [50.35, 14.48], // Mělník (soutok s Labem)
    ],
  },
  {
    id: "labe",
    name: "Labe",
    latin: "Elbe",
    coords: [
      [50.77, 15.54], // Krkonoše
      [50.43, 15.81], // Dvůr Králové
      [50.21, 15.83], // Hradec Králové
      [50.04, 15.77], // Pardubice
      [50.06, 15.20], // Kolín
      [50.18, 15.04], // Poděbrady
      [50.19, 14.80], // Nymburk
      [50.35, 14.48], // Mělník
      [50.53, 14.13], // Litoměřice
      [50.66, 14.04], // Ústí nad Labem
      [50.78, 14.21], // Děčín
      [50.92, 14.07], // Bad Schandau
      [51.05, 13.74], // Drážďany (Dresden)
      [51.16, 13.48], // Míšeň (Meissen)
      [51.56, 13.00], // Torgau
      [51.87, 12.65], // Wittenberg
      [52.13, 11.62], // Magdeburg
      [53.00, 11.50], // Wittenberge
      [53.55, 9.99],  // Hamburk
      [53.89, 8.70],  // Cuxhaven / Severní moře
    ],
  },
  {
    id: "morava",
    name: "Morava & Svratka",
    latin: "March",
    coords: [
      [50.20, 16.85], // Kralický Sněžník
      [49.96, 16.97], // Šumperk
      [49.59, 17.25], // Olomouc
      [49.30, 17.40], // Kroměříž
      [49.07, 17.46], // Uherské Hradiště
      [48.85, 17.13], // Hodonín
      [48.17, 16.97], // Devín (ústí do Dunaje)
    ],
  },
  {
    id: "danube",
    name: "Dunaj",
    latin: "Danube",
    coords: [
      [48.00, 8.20],  // Donaueschingen
      [48.40, 9.99],  // Ulm
      [48.76, 11.43], // Ingolstadt
      [49.02, 12.10], // Řezno (Regensburg)
      [48.84, 12.96], // Deggendorf
      [48.57, 13.46], // Pasov (Passau)
      [48.31, 14.29], // Linec (Linz)
      [48.23, 15.33], // Melk
      [48.41, 15.61], // Krems
      [48.30, 16.30], // Klosterneuburg
      [48.21, 16.37], // Vídeň (Wien)
      [48.15, 17.11], // Bratislava
      [47.80, 18.74], // Ostřihom (Esztergom)
      [47.50, 19.04], // Budapešť
      [45.26, 19.84], // Novi Sad
      [44.82, 20.46], // Bělehrad
    ],
  },
  {
    id: "rhine",
    name: "Rýn",
    latin: "Rhein",
    coords: [
      [46.63, 8.67],  // Alpy
      [47.56, 7.59],  // Basilej
      [48.57, 7.75],  // Štrasburk
      [49.01, 8.40],  // Karlsruhe
      [49.49, 8.47],  // Mannheim
      [49.63, 8.36],  // Worms
      [50.00, 8.27],  // Mohuč (Mainz)
      [50.35, 7.60],  // Koblenz
      [50.73, 7.10],  // Bonn
      [50.94, 6.96],  // Kolín nad Rýnem (Köln)
      [51.23, 6.78],  // Düsseldorf
      [51.84, 5.86],  // Nijmegen
      [51.92, 4.48],  // Rotterdam / Severní moře
    ],
  },
  {
    id: "vistula",
    name: "Visla",
    latin: "Wisła",
    coords: [
      [49.65, 18.96], // Beskydy
      [50.06, 19.94], // Krakov
      [50.68, 21.75], // Sandoměř
      [51.41, 21.97], // Puławy
      [52.23, 21.01], // Varšava
      [52.54, 19.70], // Płock
      [53.01, 18.60], // Toruň
      [53.12, 18.00], // Bydhošť
      [54.35, 18.65], // Gdaňsk / Baltské moře
    ],
  },
  {
    id: "po",
    name: "Pád",
    latin: "Po",
    coords: [
      [44.70, 7.18],  // Monviso
      [45.07, 7.69],  // Turín
      [45.18, 9.16],  // Pavia
      [45.05, 9.69],  // Piacenza
      [45.13, 10.02], // Cremona
      [44.83, 11.62], // Ferrara
      [44.97, 12.33], // Delta Pádu / Jadran
    ],
  },
  {
    id: "arno",
    name: "Arno",
    latin: "Arno",
    coords: [
      [43.88, 11.66], // Apeniny
      [43.77, 11.25], // Florencie (Firenze)
      [43.71, 10.40], // Pisa
      [43.68, 10.28], // Středozemní moře
    ],
  },
];
