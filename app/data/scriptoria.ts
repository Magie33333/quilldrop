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

function normalizeKeyword(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export const SCRIPTORIA_PLACES: ScriptoriumPlace[] = [
  {
    id: "praha",
    name: "Praha",
    name_en: "Prague",
    region: "Pražský hrad, Klementinum a Nové Město",
    region_en: "Prague Castle, Clementinum & New Town",
    country: "Česká republika",
    country_en: "Czech Republic",
    modernRepository: "Národní knihovna ČR (Klementinum), Knihovna Národního muzea, Archiv Pražského hradu",
    modernRepository_en: "National Library of the Czech Republic (Clementinum), National Museum Library, Prague Castle Archive",
    description: "Srdce českého písemnictví a královské moci. Kodexy a kolofony jsou dnes uchovány v Národní knihovně ČR (Klementinum), Knihovně Národního muzea a v Archivu Pražského hradu.",
    description_en: "The heart of Bohemian scriptoria and royal sovereignty. Codices and colophons are conserved today at the National Library of the Czech Republic (Clementinum), the National Museum Library, and the Prague Castle Archive.",
    lat: 50.0880,
    lng: 14.4208,
    zoom: 11,
    x: 48,
    y: 36,
    icon: "👑",
    matchKeywords: ["prague", "praha", "prag", "pragae", "pragens", "castro", "sanctorum", "klementinum", "klementin", "karolin", "strahov", "břevnov", "brevnov", "staré město", "stare mesto", "nové město", "nove mesto", "hradčany", "hradcany", "vyšehrad", "vysehrad", "národní knihovna", "narodni knihovna", "czechia (praha?)"],
  },
  {
    id: "olomouc",
    name: "Olomouc",
    name_en: "Olomouc",
    region: "Metropolitní kapitula u sv. Václava",
    region_en: "Metropolitan Chapter of St. Wenceslas",
    country: "Česká republika",
    country_en: "Czech Republic",
    modernRepository: "Zemský archiv v Opavě – pobočka Olomouc (Metropolitní kapitula), Vědecká knihovna v Olomouci",
    modernRepository_en: "Opava Land Archive – Olomouc Branch (Metropolitan Chapter), Research Library in Olomouc",
    description: "Přední moravské centrum církevní správy. Rukopisy Metropolitní kapituly u sv. Václava jsou dnes uloženy a chráněny v Zemském archivu v Opavě (pobočka Olomouc) a ve Vědecké knihovně v Olomouci.",
    description_en: "Foremost Moravian center of ecclesiastical administration. Manuscripts of the Metropolitan Chapter of St. Wenceslas are conserved today in the Land Archive in Opava (Olomouc branch) and the Research Library in Olomouc.",
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
    name_en: "Vyšší Brod (Hohenfurth)",
    region: "Cisterciácký klášter v jižních Čechách",
    region_en: "Cistercian Abbey in Southern Bohemia",
    country: "Česká republika",
    country_en: "Czech Republic",
    modernRepository: "Knihovna cisterciáckého opatství Vyšší Brod",
    modernRepository_en: "Library of the Cistercian Abbey Vyšší Brod",
    description: "Monumentální cisterciácká klášterní knihovna založená roku 1259 Vokem z Rožmberka. Rukopisy a iluminované kodexy jsou dodnes uloženy přímo v autentických prostorách vyšebrodského kláštera.",
    description_en: "Monumental Cistercian monastic library founded in 1259 by Vok of Rosenberg. Manuscripts and illuminated codices are preserved to this day within the authentic walls of the abbey.",
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
    name_en: "Brno (Brünn)",
    region: "Moravské zemské město",
    region_en: "Moravian Provincial Capital",
    country: "Česká republika",
    country_en: "Czech Republic",
    modernRepository: "Moravská zemská knihovna v Brně (MZK)",
    modernRepository_en: "Moravian Library in Brno (MZK)",
    description: "Centrum moravských zemských sněmů a soudů. Bohatá sbírka rukopisů a starých tisků je dnes badatelům přístupná v Moravské zemské knihovně v Brně.",
    description_en: "Center of the Moravian provincial assemblies and courts. A rich collection of manuscripts and early printed books is accessible to researchers at the Moravian Library in Brno.",
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
    name_en: "Rajhrad",
    region: "Benediktinské arciopatství",
    region_en: "Benedictine Archabbey",
    country: "Česká republika",
    country_en: "Czech Republic",
    modernRepository: "Památník písemnictví na Moravě (Knihovna benediktinského arciopatství v Rajhradě)",
    modernRepository_en: "Monument of Literature in Moravia (Rajhrad Benedictine Archabbey Library)",
    description: "Nejstarší mužský klášter na Moravě (založen 1048). Rozsáhlá historická knihovna benediktinů se vzácnými biblickými kodexy je dnes spravována Památníkem písemnictví na Moravě.",
    description_en: "The oldest male monastery in Moravia (founded 1048). The extensive historical Benedictine library with rare biblical codices is administered by the Monument of Literature in Moravia.",
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
    name_en: "Třeboň (Wittingau)",
    region: "Augustiniánský klášter a rožmberský archiv",
    region_en: "Augustinian Monastery & Rosenberg Archives",
    country: "Česká republika",
    country_en: "Czech Republic",
    modernRepository: "Státní oblastní archiv v Třeboni",
    modernRepository_en: "State Regional Archive in Třeboň",
    description: "Významné centrum středověkého klášterního a rožmberského písemnictví. Rukopisy a archiválie jsou uloženy v třeboňském archivu.",
    description_en: "Renowned medieval center of monastic and Rosenberg scribal culture. Manuscripts and diplomatic archives are preserved at the State Regional Archive in Třeboň.",
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
    name_en: "Fulštejn (Bohušov)",
    region: "Osoblažsko, Slezsko",
    region_en: "Osoblaha Region, Silesia",
    country: "Česká republika",
    country_en: "Czech Republic",
    modernRepository: "Zemský archiv v Opavě / Biskupský lenní archiv",
    modernRepository_en: "Land Archive in Opava / Episcopal Fief Archive",
    description: "Sídlo biskupského lenního rodu Supů z Fulštejna. Hradní kaple a písařské záznamy jsou spjaty s olomouckým biskupstvím a archivovány v Opavě.",
    description_en: "Seat of the episcopal vassal family Sup of Fulštejn. Castle chapel records and scribal documents are linked to the Bishopric of Olomouc and archived in Opava.",
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
    name_en: "Litoměřice (Leitmeritz)",
    region: "Severní Čechy",
    region_en: "Northern Bohemia",
    country: "Česká republika",
    country_en: "Czech Republic",
    modernRepository: "Státní oblastní archiv v Litoměřicích / Katedrální kapitula",
    modernRepository_en: "State Regional Archive in Litoměřice / Cathedral Chapter",
    description: "Kolegiátní kapitula sv. Štěpána a významné královské město na Labi. Působiště probošta Benedikta z Valdštejna.",
    description_en: "Collegiate Chapter of St. Stephen and an important royal town on the Elbe. Sphere of activity of Provost Benedict of Wallenstein.",
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
    name_en: "Kraków (Cracow)",
    region: "Malopolsko",
    region_en: "Lesser Poland",
    country: "Polsko",
    country_en: "Poland",
    modernRepository: "Biblioteka Jagiellońska, Uniwersytet Jagielloński w Krakowie",
    modernRepository_en: "Jagiellonian Library, Jagiellonian University in Kraków",
    description: "Sídlo Jagellonské univerzity s úzkými vazbami na pražské mistry a studenty. Středověké rukopisy jsou uchovány ve fondech slavné Jagellonské knihovny v Krakově.",
    description_en: "Seat of the Jagiellonian University with intimate ties to Prague masters and students. Medieval manuscripts are held in the celebrated Jagiellonian Library in Kraków.",
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
    name_en: "Wrocław (Breslau)",
    region: "Dolní Slezsko",
    region_en: "Lower Silesia",
    country: "Polsko",
    country_en: "Poland",
    modernRepository: "Biblioteka Uniwersytecka we Wrocławiu",
    modernRepository_en: "Wrocław University Library",
    description: "Klíčové obchodní a církevní centrum Koruny české. Bohaté sbírky gotických kodexů z klášterů a kapitol jsou dnes chráněny ve Vratislavské univerzitní knihovně.",
    description_en: "Key commercial and ecclesiastical center of the Crown of Bohemia. Rich collections of Gothic codices from monasteries and chapters are protected today in the Wrocław University Library.",
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
    name_en: "Zittau",
    region: "Sasko (Horní Lužice)",
    region_en: "Saxony (Upper Lusatia)",
    country: "Německo",
    country_en: "Germany",
    modernRepository: "Christian-Weise-Bibliothek Zittau",
    modernRepository_en: "Christian-Weise-Bibliothek Zittau",
    description: "Město Horní Lužice s historickými svazky k české koruně. Vzácné městské a církevní rukopisy jsou uloženy v Christian-Weise-Bibliothek v Žitavě.",
    description_en: "Upper Lusatian city with deep historical ties to the Bohemian Crown. Rare municipal and ecclesiastical manuscripts are preserved at the Christian-Weise-Bibliothek in Zittau.",
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
    name_en: "Esztergom",
    region: "Komárom-Esztergom",
    region_en: "Komárom-Esztergom",
    country: "Maďarsko",
    country_en: "Hungary",
    modernRepository: "Főszékesegyházi Könyvtár (Katedrální knihovna v Ostřihomi)",
    modernRepository_en: "Cathedral Library of Esztergom (Főszékesegyházi Könyvtár)",
    description: "Centrum uherské církve na Dunaji. Liturgické a teologické kodexy jsou uchovány v historické katedrální knihovně v Ostřihomi.",
    description_en: "Primatial seat of the Hungarian Church on the Danube. Liturgical and theological codices are conserved in the historic Cathedral Library of Esztergom.",
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
    name_en: "Bologna",
    region: "Emilia-Romagna",
    region_en: "Emilia-Romagna",
    country: "Itálie",
    country_en: "Italy",
    modernRepository: "Biblioteca Universitaria di Bologna (BUB)",
    modernRepository_en: "Bologna University Library (BUB)",
    description: "Sídlo nejstarší evropské univerzity. Právnické a teologické kodexy (včetně zápisů českého písaře Benedikta z Valdštejna) jsou uloženy v Boloňské univerzitní knihovně.",
    description_en: "Seat of Europe's oldest university. Legal and theological codices (including manuscripts copied by the Bohemian scribe Benedict of Wallenstein) are preserved in the Bologna University Library.",
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
    name_en: "Florence (Firenze)",
    region: "Toskánsko",
    region_en: "Tuscany",
    country: "Itálie",
    country_en: "Italy",
    modernRepository: "Biblioteca Medicea Laurenziana, Florencie",
    modernRepository_en: "Laurentian Library (Biblioteca Medicea Laurenziana), Florence",
    description: "Kolébka renesančního humanismu a knižního umění. Vzácné iluminované kodexy jsou chráněny v proslulé medicejské knihovně Laurenziana.",
    description_en: "Cradle of Renaissance humanism and book arts. Priceless illuminated codices are preserved in the famed Laurentian Library.",
    lat: 43.7696,
    lng: 11.2558,
    zoom: 11,
    x: 43,
    y: 84,
    icon: "⚜️",
    matchKeywords: ["firenze", "florentie", "florence", "florenti", "florentia", "laurenziana"],
  },
  {
    id: "kutna-hora",
    name: "Kutná Hora",
    name_en: "Kutná Hora (Kuttenberg)",
    region: "Královské horní město a cisterciácký klášter Sedlec",
    region_en: "Royal Mining Town & Cistercian Abbey Sedlec",
    country: "Česká republika",
    country_en: "Czech Republic",
    modernRepository: "Státní okresní archiv Kutná Hora, České muzeum stříbra",
    modernRepository_en: "State District Archive Kutná Hora, Czech Silver Museum",
    description: "Stříbrná pokladnice Koruny české a centrum gotické knižní kultury. V blízkém sedleckém cisterciáckém klášteře a v městských chrámech vznikaly velkolepé iluminované kodexy a graduály.",
    description_en: "The silver treasury of the Bohemian Crown and a thriving center of Gothic book culture. Grand illuminated codices and graduals were created in the nearby Sedlec Abbey and city churches.",
    lat: 49.9484,
    lng: 15.2681,
    zoom: 12,
    x: 52,
    y: 39,
    icon: "⛏️",
    matchKeywords: ["kutná hora", "kutna hora", "cuthna", "kuttenberg", "sedlec", "sedleci", "kuttenb", "kutn"],
  },
  {
    id: "krumlov",
    name: "Český Krumlov",
    name_en: "Český Krumlov (Krummau)",
    region: "Rožmberská rezidence a zámecká knihovna",
    region_en: "Rosenberg Residence & Castle Library",
    country: "Česká republika",
    country_en: "Czech Republic",
    modernRepository: "Státní oblastní archiv v Třeboni – oddělení Český Krumlov (Zámecká knihovna)",
    modernRepository_en: "State Regional Archive in Třeboň – Český Krumlov Branch (Castle Library)",
    description: "Hlavní sídlo rožmberského vladařství. V hradním skriptoriu a zámecké knihovně vznikala a byla shromažďována špičková díla dvorské literatury, práva a biblických textů.",
    description_en: "Primary residence of the Lords of Rosenberg. Courtly literature, legal codices, and biblical texts were copied and preserved in the castle scriptorium and renowned library.",
    lat: 48.8127,
    lng: 14.3175,
    zoom: 12,
    x: 46,
    y: 52,
    icon: "🌹",
    matchKeywords: ["český krumlov", "cesky krumlov", "krumlov", "krummau", "crumlov", "crumlaw"],
  },
  {
    id: "plzen",
    name: "Plzeň",
    name_en: "Pilsen (Plzeň)",
    region: "Západní Čechy",
    region_en: "Western Bohemia",
    country: "Česká republika",
    country_en: "Czech Republic",
    modernRepository: "Archiv města Plzně, Studijní a vědecká knihovna Plzeňského kraje",
    modernRepository_en: "Plzeň City Archives, Research Library of Plzeň Region",
    description: "Klíčové západočeské město a kolébka českého knihtisku (Kronika trojánská, cca 1468/1476). Dochovala se zde řada městských a františkánských rukopisů.",
    description_en: "Key West Bohemian stronghold and cradle of Bohemian printing (Trojan Chronicle, ca 1468/1476). Notable municipal and Franciscan manuscript collections survive here.",
    lat: 49.7475,
    lng: 13.3776,
    zoom: 12,
    x: 42,
    y: 40,
    icon: "🛡️",
    matchKeywords: ["plzeň", "plzen", "pilsen", "pilsn", "plsna", "pilsensis"],
  },
  {
    id: "tepla",
    name: "Klášter Teplá",
    name_en: "Teplá Abbey (Tepl)",
    region: "Premonstrátská kanonie v západních Čechách",
    region_en: "Premonstratensian Abbey in Western Bohemia",
    country: "Česká republika",
    country_en: "Czech Republic",
    modernRepository: "Knihovna kanonie premonstrátů v Teplé (Národní knihovna ČR)",
    modernRepository_en: "Teplá Abbey Library (National Library of the Czech Republic)",
    description: "Jedna z nejrozsáhlejších a nejcennějších historických klášterních knihoven v českých zemích s více než 600 středověkými rukopisy včetně Codexu Teplensis.",
    description_en: "One of the largest and most valuable monastic libraries in the Czech lands, preserving over 600 medieval manuscripts, including the German Codex Teplensis.",
    lat: 49.9664,
    lng: 12.8722,
    zoom: 12,
    x: 39,
    y: 38,
    icon: "⛪",
    matchKeywords: ["teplá", "tepla", "tepl", "teplensis"],
  },
  {
    id: "kromeriz",
    name: "Kroměříž",
    name_en: "Kroměříž (Kremsier)",
    region: "Arcibiskupský zámek a kapitula",
    region_en: "Archbishop's Chateau & Chapter",
    country: "Česká republika",
    country_en: "Czech Republic",
    modernRepository: "Arcibiskupský zámek v Kroměříži – Zámecká knihovna",
    modernRepository_en: "Kroměříž Archbishop's Palace – Chateau Library",
    description: "Letní sídlo olomouckých biskupů a arcibiskupů s monumentální historickou knihovnou a cennými hudebními a liturgickými kodexy.",
    description_en: "Summer residence of the Olomouc bishops and archbishops boasting a monumental historical library with precious liturgical and musical manuscripts.",
    lat: 49.2985,
    lng: 17.3931,
    zoom: 12,
    x: 65,
    y: 44,
    icon: "🏛️",
    matchKeywords: ["kroměříž", "kromeriz", "kremsier", "cremsir", "cremsier"],
  },
  {
    id: "cheb",
    name: "Cheb",
    name_en: "Cheb (Eger)",
    region: "Chebsko (Egerland)",
    region_en: "Egerland",
    country: "Česká republika",
    country_en: "Czech Republic",
    modernRepository: "Státní okresní archiv Cheb",
    modernRepository_en: "State District Archive Cheb",
    description: "Historické říšské a české pohraniční město s bohatým městským archivem, františkánskou a křížovnickou písemnou kulturou.",
    description_en: "Historic imperial and Bohemian border city with a rich municipal archive, Franciscan, and Crutched Friars scribal culture.",
    lat: 50.0796,
    lng: 12.3739,
    zoom: 12,
    x: 37,
    y: 36,
    icon: "🏰",
    matchKeywords: ["cheb", "eger", "egrensis", "egram"],
  },
  {
    id: "hradec-kralove",
    name: "Hradec Králové",
    name_en: "Hradec Králové (Königgrätz)",
    region: "Východní Čechy, věnné město královen",
    region_en: "Eastern Bohemia, Dowry Town of Queens",
    country: "Česká republika",
    country_en: "Czech Republic",
    modernRepository: "Muzeum východních Čech, Státní okresní archiv Hradec Králové",
    modernRepository_en: "Museum of Eastern Bohemia, State District Archive Hradec Králové",
    description: "Centrum východočeské městské i husitské vzdělanosti. Místo vzniku proslulého Franusova kancionálu (1505) i starších latinských kodexů.",
    description_en: "Hub of East Bohemian municipal and Utraquist scribal culture. Famous as the provenance of the monumental Franus Cantional (1505) and medieval codices.",
    lat: 50.2092,
    lng: 15.8328,
    zoom: 12,
    x: 56,
    y: 34,
    icon: "👑",
    matchKeywords: ["hradec králové", "hradec kralove", "königgrätz", "koniggratz", "grecz", "gretz", "franus"],
  },
  {
    id: "broumov",
    name: "Broumov",
    name_en: "Broumov (Braunau)",
    region: "Benediktinské opatství sv. Vojtěcha",
    region_en: "Benedictine Abbey of St. Adalbert",
    country: "Česká republika",
    country_en: "Czech Republic",
    modernRepository: "Klášterní knihovna v Broumově (spravována Národní knihovnou ČR)",
    modernRepository_en: "Broumov Monastic Library (managed by National Library of the CR)",
    description: "Klášter, kam břevnovští benediktini v době husitských válek přenesli své nejcennější rukopisy. Unikátně dochovaný klášterní knižní fond.",
    description_en: "The refuge where Břevnov Benedictines evacuated their most precious codices during the Hussite wars. Uniquely preserved monastic book collection.",
    lat: 50.5856,
    lng: 16.3328,
    zoom: 12,
    x: 59,
    y: 28,
    icon: "📖",
    matchKeywords: ["broumov", "braunau", "broumovsk"],
  },
  {
    id: "zlata-koruna",
    name: "Zlatá Koruna",
    name_en: "Zlatá Koruna (Goldenkrone)",
    region: "Cisterciácký klášter Svatá Koruna",
    region_en: "Cistercian Abbey Sancta Corona",
    country: "Česká republika",
    country_en: "Czech Republic",
    modernRepository: "Národní knihovna ČR, Státní oblastní archiv v Třeboni",
    modernRepository_en: "National Library of the Czech Republic, State Regional Archive in Třeboň",
    description: "Klášter založený králem Přemyslem Otakarem II. roku 1263. Zdejší kodexy s trnovou relikvií patří k pokladům jihočeské cisterciácké knižní tvorby.",
    description_en: "Abbey founded by King Ottokar II of Bohemia in 1263. Codices connected to the holy thorn relic represent pinnacles of South Bohemian Cistercian book craft.",
    lat: 48.8553,
    lng: 14.3711,
    zoom: 12,
    x: 47,
    y: 51,
    icon: "👑",
    matchKeywords: ["zlatá koruna", "zlata koruna", "sancta corona", "goldenkrone"],
  },
  {
    id: "osek",
    name: "Osek",
    name_en: "Osek Abbey (Ossegg)",
    region: "Cisterciácký klášter v Podkrušnohoří",
    region_en: "Cistercian Abbey at the Ore Mountains",
    country: "Česká republika",
    country_en: "Czech Republic",
    modernRepository: "Národní knihovna ČR, Klášterní knihovna Osek",
    modernRepository_en: "National Library of the Czech Republic, Osek Monastic Library",
    description: "Severočeský cisterciácký klášter založený na sklonku 12. století rodem Hrabišiců. Uchoval bohatý fond teologických a liturgických rukopisů.",
    description_en: "North Bohemian Cistercian abbey founded at the end of the 12th century. Preserved a rich collection of medieval theological and liturgical codices.",
    lat: 50.6219,
    lng: 13.6931,
    zoom: 12,
    x: 44,
    y: 29,
    icon: "⛪",
    matchKeywords: ["osek", "ossegg", "ossecensis"],
  },
  {
    id: "basel",
    name: "Basilej (Basel)",
    name_en: "Basel",
    region: "Místo Basilejského koncilu",
    region_en: "Site of the Council of Basel",
    country: "Švýcarsko",
    country_en: "Switzerland",
    modernRepository: "Universitätsbibliothek Basel",
    modernRepository_en: "Basel University Library",
    description: "Dějiště slavného Basilejského koncilu (1431–1449), kam putovala česká husitská poselstva. Vznikly zde diplomatické zápisy, traktáty i opisy kodexů.",
    description_en: "Site of the celebrated Council of Basel (1431–1449), attended by Bohemian Hussite delegations. Conciliar decrees, tracts, and copied codices are held here.",
    lat: 47.5596,
    lng: 7.5886,
    zoom: 11,
    x: 27,
    y: 55,
    icon: "🕊️",
    matchKeywords: ["basel", "basilej", "basilea", "basiliensis", "concilium basiliense"],
  },
  {
    id: "paris",
    name: "Paříž (Paris)",
    name_en: "Paris",
    region: "Sorbonna a pařížská univerzita",
    region_en: "Sorbonne & University of Paris",
    country: "Francie",
    country_en: "France",
    modernRepository: "Bibliothèque nationale de France (BnF), Paříž",
    modernRepository_en: "National Library of France (BnF), Paris",
    description: "Intelektuální metropole středověké Evropy, model pro založení Univerzity Karlovy. Čeští studenti a mistři zde opisovali filosofické a teologické spisy.",
    description_en: "The intellectual capital of medieval Europe and blueprint for Charles University in Prague. Bohemian masters and students copied philosophical and theological treatises here.",
    lat: 48.8566,
    lng: 2.3522,
    zoom: 11,
    x: 12,
    y: 47,
    icon: "⚜️",
    matchKeywords: ["paris", "paříž", "pariz", "sorbonne", "parisiensis", "parisius", "bnf", "gallia"],
  },
  {
    id: "roma",
    name: "Řím (Roma)",
    name_en: "Rome (Roma)",
    region: "Vatikán a kurie",
    region_en: "Vatican & Papal Curia",
    country: "Itálie",
    country_en: "Italy",
    modernRepository: "Biblioteca Apostolica Vaticana (BAV), Řím",
    modernRepository_en: "Vatican Apostolic Library (BAV), Rome",
    description: "Sídlo papežské kurie a Vatikánské apoštolské knihovny. Dochovaly se zde listiny, bohemikální kodexy a papežské buly zásadního významu pro české dějiny.",
    description_en: "Seat of the Papal Curia and Vatican Apostolic Library. Preserves charters, Bohemica codices, and papal bulls of paramount importance for Bohemian history.",
    lat: 41.9028,
    lng: 12.4964,
    zoom: 11,
    x: 44,
    y: 89,
    icon: "🏛️",
    matchKeywords: ["roma", "řím", "rim", "rome", "vatican", "vaticana", "bav", "apostolica", "curia"],
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

export function getScriptoriumForCard(card?: { place?: string; manuscript?: string } | null): ScriptoriumPlace {
  if (!card) return SCRIPTORIA_PLACES[0];
  const rawP = (card.place || "").trim();
  const rawM = (card.manuscript || "").trim();
  const pNorm = normalizeKeyword(rawP);
  const mNorm = normalizeKeyword(rawM);

  // 1. Nejprve zkusíme určit přesné místo sepsání z kolofonu (card.place)
  if (pNorm && !pNorm.includes("unknown") && pNorm !== "unknown place" && !pNorm.includes("neznám") && !pNorm.includes("neznam")) {
    for (const place of SCRIPTORIA_PLACES) {
      if (place.matchKeywords.some((kw) => {
        const kwNorm = normalizeKeyword(kw);
        return pNorm.includes(kwNorm) || rawP.toLowerCase().includes(kw.toLowerCase());
      })) {
        return place;
      }
    }
    // Geografické zástupné termíny
    if (pNorm.includes("czech") || pNorm.includes("cesk") || pNorm.includes("bohem")) {
      return SCRIPTORIA_PLACES.find((x) => x.id === "praha")!;
    }
    if (pNorm.includes("morav")) {
      return SCRIPTORIA_PLACES.find((x) => x.id === "olomouc")!;
    }
    if (pNorm.includes("siles") || pNorm.includes("slezsk")) {
      return SCRIPTORIA_PLACES.find((x) => x.id === "wroclaw") || SCRIPTORIA_PLACES.find((x) => x.id === "fulstejn")!;
    }
    if (pNorm.includes("austria") || pNorm.includes("rakousk")) {
      return SCRIPTORIA_PLACES.find((x) => x.id === "viden")!;
    }
    if (pNorm.includes("ital")) {
      return SCRIPTORIA_PLACES.find((x) => x.id === "bologna")!;
    }
    if (pNorm.includes("poland") || pNorm.includes("polsk")) {
      return SCRIPTORIA_PLACES.find((x) => x.id === "krakow")!;
    }
    if (pNorm.includes("germany") || pNorm.includes("nemeck") || pNorm.includes("aleman")) {
      return SCRIPTORIA_PLACES.find((x) => x.id === "nurnberg")!;
    }
    if (pNorm.includes("franc") || pNorm.includes("gallia")) {
      return SCRIPTORIA_PLACES.find((x) => x.id === "paris") || SCRIPTORIA_PLACES[0];
    }
    if (pNorm.includes("helvet") || pNorm.includes("svycar") || pNorm.includes("swiss")) {
      return SCRIPTORIA_PLACES.find((x) => x.id === "basel") || SCRIPTORIA_PLACES[0];
    }
  }

  // 2. Pokud je místo vzniku neznámé, zařadíme kartu podle místa dochování kodexu (card.manuscript)
  for (const place of SCRIPTORIA_PLACES) {
    if (place.matchKeywords.some((kw) => {
      const kwNorm = normalizeKeyword(kw);
      return mNorm.includes(kwNorm) || rawM.toLowerCase().includes(kw.toLowerCase());
    })) {
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
