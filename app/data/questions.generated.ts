export type GameKind = "mood" | "cipher" | "paleo";
export type GameMode = "mood" | "cipher" | "script" | "century" | "transcription";

export type HighlightRegion = {
  x: number; // 0 - 100 %
  y: number; // 0 - 100 %
  w: number; // 0 - 100 %
  h: number; // 0 - 100 %
  width?: number;
  height?: number;
  line_number?: number;
};

export type QuestionData = {
  id?: string;
  card_id?: string;
  game_kind: GameKind;
  mode?: GameMode;
  title: string;
  intro: string;
  quote: string;
  translation_cs?: string;
  options: [string, string][]; // [emoji/označení, text]
  correct_index: number;
  explanation?: string;
  hint?: string;
  difficulty?: "easy" | "medium" | "expert";
  is_active?: boolean;
  highlight_regions?: HighlightRegion[];
  target_transcription?: string;
  accepted_variants?: string[];
};

export const DEFAULT_QUESTIONS: QuestionData[] = [
  // ==========================================
  // 1. NÁLADA PÍSAŘE (Scribe's Mood) - 4 možnosti
  // ==========================================
  {
    id: "mood-1",
    game_kind: "mood",
    mode: "mood",
    title: "Písařský povzdech",
    intro: "Jakou emoci vyjadřuje písař, který v kolofonu míchá latinu se staročeským veršem?",
    quote: "Scriptor iam cessa naposledy pójdeš do lesa.",
    translation_cs: "Písaři, už přestaň, naposledy půjdeš do lesa.",
    options: [
      ["🌲", "Vyčerpaný a toužící po svobodě v přírodě"],
      ["⚔️", "Připravený k ozbrojenému boji proti nepřátelům"],
      ["📚", "Dychtivý ihned začít opisovat další kodex"],
      ["💰", "Požadující okamžité navýšení písařské mzdy"],
    ],
    correct_index: 0,
    explanation: "Fráze 'pójdeš do lesa' je staročeský idiom pro konec vyčerpávající práce a únik od ztuhlých prstů a bolavých zad do volného prostoru mimo klášterní skriptorium.",
    hint: "Soustřeďte se na touhu odložit psací brk po měsících sezení v chladu.",
    difficulty: "easy",
  },
  {
    id: "mood-2",
    game_kind: "mood",
    mode: "mood",
    title: "Děkovná úleva",
    intro: "Co vyjadřuje písař těmito úsečnými slovy na samém konci rukopisu?",
    quote: "Laus trino et uno. Finito libro, sit laus et gloria Christo.",
    translation_cs: "Chvála Trojjedinému. Kniha je dokončena, buď chvála a sláva Kristu.",
    options: [
      ["🙏", "Hlubokou zbožnou úlevu a vděčnost za dokončení díla"],
      ["😩", "Stížnost na zkažený inkoust a křivě seříznutý brk"],
      ["⚖️", "Kritiku teologických chyb v předloze"],
      ["🍷", "Žádost o džbán moravského vína"],
    ],
    correct_index: 0,
    explanation: "'Laus trino et uno' je nejčastější děkovná formule středověkých písařů Bohu za to, že jim dal zdraví a sílu dokončit náročný opis bez oslepnutí.",
    hint: "Písař vzdává chválu Nejsvětější Trojici za zdárný konec úkolu.",
    difficulty: "easy",
  },
  {
    id: "mood-3",
    game_kind: "mood",
    mode: "mood",
    title: "Písařská žízeň",
    intro: "Jaký tón volí písař v tomto slavném latinském rýmovaném povzdechu?",
    quote: "Explicit hoc totum, pro christo da michi potum.",
    translation_cs: "Zde je to celé u konce, pro Krista, dej mi napít!",
    options: [
      ["🍷", "Odlehčený a žíznivý – žádá osvěžující nápoj za odvedenou dřinu"],
      ["📜", "Přísně úřední záznam pro biskupa"],
      ["😤", "Rozzuřený na čtenáře, který nevrátil předchozí svazek"],
      ["🕊️", "Zbožné rozjímání o věčném životě"],
    ],
    correct_index: 0,
    explanation: "Verš 'pro Christo da mihi potum' byl mezi univerzitními a klášterními písaři velmi oblíbený – po týdnech v prašném skriptoriu žádali mecenáše o pivo či víno.",
    hint: "Slovo 'potum' v latině znamená nápoj.",
    difficulty: "easy",
  },
  {
    id: "mood-4",
    game_kind: "mood",
    mode: "mood",
    title: "Kletba na zloděje",
    intro: "Jakou emoci vložil písař do této závěrečné klauzule kodexu?",
    quote: "Quisquis hunc librum rapuerit, anathema sit in die iudicii.",
    translation_cs: "Kdokoliv by tuto knihu uloupil, budiž proklet v den soudný.",
    options: [
      ["⚡", "Hrozivý hněv a nekompromisní ochranu knihy před zcizením"],
      ["😌", "Poklidné loučení se čtenářem"],
      ["🤝", "Nabídku k výhodnému odkoupení svazku"],
      ["😢", "Lítost nad ztraceným přítelem"],
    ],
    correct_index: 0,
    explanation: "Kletby na zloděje knih (anathema) byly ve středověku běžnou ochranou drahocenných kodexů před krádeží. Knihy měly hodnotu celých vesnic.",
    hint: "Slovo 'anathema' znamená církevní kletbu a vyloučení.",
    difficulty: "easy",
  },

  // ==========================================
  // 2. ROZLUŠTI ŠIFRU (Crack the Cipher) - 4 možnosti
  // ==========================================
  {
    id: "cipher-1",
    game_kind: "cipher",
    title: "Jméno neznámého písaře",
    intro: "Písař zakomponoval své jméno do rýmované latinské formule. Doplňte chybějící slovo:",
    quote: "Qui hoc scribebat, [...] sibi nomen erat, amen.",
    options: [
      ["Iohannes", "Oblíbené písařské jméno Jan"],
      ["Petrus", "Svatopetrská tradice"],
      ["Nicolaus", "Mikuláš z Prahy"],
    ],
    correct_index: 0,
    explanation: "Rýmovaná formule 'Qui hoc scribebat, Iohannes sibi nomen erat' patří k nejznámějším písařským veršům pozdního středověku.",
    hint: "Hledejte nejčastější křesťanské jméno odvozené od Jana Křtitele.",
    difficulty: "medium",
  },
  {
    id: "cipher-2",
    game_kind: "cipher",
    title: "Rýmovaný rýp",
    intro: "Doplňte chybějící slovo ve známé dvojjazyčné písařské formuli:",
    quote: "Scriptor iam cessa, naposledy pójdeš do [...]!",
    options: [
      ["lesa", "Rýmuje se se slovem cessa"],
      ["města", "Za nákupem nového pergamenu"],
      ["hospody", "Za pohárem piva či vína"],
    ],
    correct_index: 0,
    explanation: "Český písař geniálně zrýmoval latinské imperativum 'cessa' (přestaň) s českým slovem 'lesa'.",
    hint: "Sledujte koncovku slova 'cessa'.",
    difficulty: "easy",
  },
  {
    id: "cipher-3",
    game_kind: "cipher",
    title: "Florentské město",
    intro: "Ve kterém italském městě dopsal kněz František svůj kodex?",
    quote: "Presbyter Franciscus Collensis scripsit [...]",
    options: [
      ["Florentie", "Ve Florencii, kolébce renesance"],
      ["Rome", "V Římě u papežské kurie"],
      ["Venetiis", "V Benátkách u svatého Marka"],
    ],
    correct_index: 0,
    explanation: "Lokativ 'Florentie' označuje toskánskou Florencii, významné centrum humanistického písemnictví.",
    hint: "Název města začíná písmenem F.",
    difficulty: "easy",
  },
  {
    id: "cipher-4",
    game_kind: "cipher",
    title: "Závěrečná formule kodexu",
    intro: "Které latinské slovo tradičně označuje dokončení knihy v kolofonu?",
    quote: "Petrarce laureati de secreto conflictu curarum suarum liber tercius et ultimus feliciter [...]",
    options: [
      ["explicit", "Kniha se rozvinula / končí"],
      ["incipit", "Zde začíná text"],
      ["requiescit", "Odpočívá v pokoji"],
    ],
    correct_index: 0,
    explanation: "'Explicit' (zkratka z explicitus est liber – kniha je rozvinuta) je standardní středověké označení konce textu, protiklad slova 'incipit'.",
    hint: "Opak slova 'incipit'.",
    difficulty: "medium",
  },

  // ==========================================
  // 3. POZNEJ PÍSMO A STOLETÍ - 4 možnosti
  // ==========================================
  {
    id: "script-1",
    game_kind: "paleo",
    mode: "script",
    title: "Druh středověkého písma",
    intro: "Kterým typem písma je zapsán text této ukázky s lomenými dříky a bohatou rubrikací?",
    quote: "Qui scripsit scribat, semper cum domino vivat.",
    translation_cs: "Kdo psal, ať píše dál, ať navěky žije s Pánem.",
    options: [
      ["📜", "Gotická textura (Textualis formata) – slavnostní knižní lomené písmo"],
      ["✒️", "Gotická kurzíva (Cursiva) – zběžné úřední písmo se smyčkami"],
      ["🏛️", "Humanistická antikva (Antiqua) – okrouhlé renesanční písmo"],
      ["👑", "Karolínská minuskula – raně středověké písmo z 9.–11. století"],
    ],
    correct_index: 0,
    explanation: "Gotická textura (z latinského 'textus' – tkanina) je vrcholně středověké knižní písmo 13.–15. století, charakteristické přísným lámáním dříků a vysokým kontrastem tahů připomínajícím tkanou látku.",
    hint: "Všimněte si lomených patních tahů na spodku i vrchu liter.",
    difficulty: "medium",
  },
  {
    id: "script-2",
    game_kind: "paleo",
    mode: "century",
    title: "Datace rukopisu podle stylu",
    intro: "Do kterého období spadá vznik tohoto univerzitního kodexu s lucemburskou notací z Prahy?",
    quote: "Anno domini millesimo quadringentesimo duodecimo...",
    translation_cs: "Léta Páně tisícího čtyřstého dvanáctého...",
    options: [
      ["A", "1. polovina 15. století (1400–1450) – doba Václava IV. a husitství"],
      ["B", "13. století (1200–1299) – doba Přemysla Otakara II."],
      ["C", "Raný středověk (900–1050) – příchod křesťanství"],
      ["D", "17. století (1600–1650) – barokní tisk"],
    ],
    correct_index: 0,
    explanation: "Letopočet 'millesimo quadringentesimo duodecimo' (1412) spadá do doby vlády krále Václava IV., těsně před vypuknutím husitských válek.",
    hint: "Latinské slovo 'quadringentesimo' značí čtyřsté (1400).",
    difficulty: "medium",
  },
  {
    id: "script-3",
    game_kind: "paleo",
    mode: "script",
    title: "Písmo úředních a rychlých zápisů",
    intro: "Písař psal se spěchem, písmena se propojují smyčkami a dříky se sklánějí doprava. O jaké písmo jde?",
    quote: "Explicit liber magistri Iohannis de Praga scriptus raptim...",
    translation_cs: "Zde končí kniha mistra Jana z Prahy, psaná ve spěchu...",
    options: [
      ["✒️", "Gotická kurzíva (Cursiva libraria) – rychlé písmo se smyčkami"],
      ["📜", "Unciála – velká okrouhlá majuskula z 5. století"],
      ["🏛️", "Gotická rotunda – italská okrouhlá gotika"],
      ["🔤", "Kapitála – monumentální tesané nápisové písmo"],
    ],
    correct_index: 0,
    explanation: "Gotická kurzíva byla vyvinuta pro potřeby univerzitních studentů a městských kanceláří, kde bylo třeba psát rychle bez neustálého zvedání pera.",
    hint: "Slovo 'raptim' znamená ve spěchu.",
    difficulty: "medium",
  },

  // ==========================================
  // 4. PALEOGRAFICKÝ MISTR (Transcription with Multi-Strip Spotlight) - Nejtěžší
  // ==========================================
  {
    id: "paleo-trans-1",
    game_kind: "paleo",
    mode: "transcription",
    title: "Paleografický mistr: Děkovná formule",
    intro: "Prohlédněte si zvětšenou a osvětlenou pasáž folia. Přepište přesně latinská slova, která písař zapsal.",
    quote: "Laus trino et uno",
    translation_cs: "Chvála Trojjedinému.",
    options: [],
    correct_index: 0,
    target_transcription: "Laus trino et uno",
    accepted_variants: ["laus trino et uno", "laus trino et vno", "lavs trino et vno"],
    highlight_regions: [
      { x: 28, y: 38, w: 44, h: 14 }
    ],
    explanation: "Gratulujeme k paleografickému přepisu! V gotickém písmu se písmeno 'u' a 'v' píše často nerozlišitelně a litery jsou těsně staženy k sobě.",
    hint: "První slovo začíná velkým gotickým 'L' a končí 's'. Jde o chválu (Laus).",
    difficulty: "expert",
  },
  {
    id: "paleo-trans-2",
    game_kind: "paleo",
    mode: "transcription",
    title: "Paleografický mistr: Bolest ruky",
    intro: "Tato pasáž přechází přes dva řádky. Přečtěte osvětlené řádky lupy a zapište přepis latinských slov:",
    quote: "Manus mea dolet",
    translation_cs: "Ruka mě bolí.",
    options: [],
    correct_index: 0,
    target_transcription: "Manus mea dolet",
    accepted_variants: ["manus mea dolet", "manus mea"],
    highlight_regions: [
      { x: 18, y: 32, w: 58, h: 12 },
      { x: 18, y: 46, w: 36, h: 12 }
    ],
    explanation: "Skvělý paleografický výkon! Zvládli jste číst přechod mezi řádky i typickou gotickou ligaturu.",
    hint: "Písař si stěžuje na ruku: 'Manus...'",
    difficulty: "expert",
  },
  {
    id: "paleo-trans-3",
    game_kind: "paleo",
    mode: "transcription",
    title: "Paleografický mistr: Písař Jan",
    intro: "Přečtěte ze zlatě zvýrazněné pasáže rukopisu autorskou dedikaci písaře:",
    quote: "per manus Iohannis",
    translation_cs: "rukou Jana",
    options: [],
    correct_index: 0,
    target_transcription: "per manus Iohannis",
    accepted_variants: ["per manus iohannis", "per manus johannis", "per manus ioannis"],
    highlight_regions: [
      { x: 22, y: 40, w: 56, h: 14 }
    ],
    explanation: "Výborně! Středověká latina často píše jméno Jan jako 'Iohannes' s písmenem 'h' uprostřed.",
    hint: "Text začíná předložkou 'per' a následuje jméno 'Iohannis'.",
    difficulty: "expert",
  },
];
