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
  title_en?: string;
  intro: string;
  intro_en?: string;
  quote: string;
  translation_cs?: string;
  translation_en?: string;
  options: [string, string][]; // [emoji/označení, text]
  options_en?: [string, string][];
  correct_index: number;
  explanation?: string;
  explanation_en?: string;
  hint?: string;
  hint_en?: string;
  difficulty?: "easy" | "medium" | "expert";
  is_active?: boolean;
  highlight_regions?: HighlightRegion[];
  target_transcription?: string;
  accepted_variants?: string[];
};

export function getQuestionTitle(q: QuestionData, lang?: "cs" | "en"): string {
  if (lang === "en" && q.title_en) return q.title_en;
  return q.title;
}

export function getQuestionIntro(q: QuestionData, lang?: "cs" | "en"): string {
  if (lang === "en" && q.intro_en) return q.intro_en;
  return q.intro;
}

export function getQuestionTranslation(q: QuestionData, lang?: "cs" | "en"): string | undefined {
  if (lang === "en") return q.translation_en || q.translation_cs;
  return q.translation_cs;
}

export function getQuestionOptions(q: QuestionData, lang?: "cs" | "en"): [string, string][] {
  if (lang === "en" && q.options_en && q.options_en.length === q.options.length) {
    return q.options_en;
  }
  return q.options;
}

export function getQuestionExplanation(q: QuestionData, lang?: "cs" | "en"): string | undefined {
  if (lang === "en" && q.explanation_en) return q.explanation_en;
  return q.explanation;
}

export function getQuestionHint(q: QuestionData, lang?: "cs" | "en"): string | undefined {
  if (lang === "en" && q.hint_en) return q.hint_en;
  return q.hint;
}

export const DEFAULT_QUESTIONS: QuestionData[] = [
  // ==========================================
  // 1. NÁLADA PÍSAŘE (Scribe's Mood) - 4 možnosti
  // ==========================================
  {
    id: "mood-1",
    game_kind: "mood",
    mode: "mood",
    title: "Písařský povzdech",
    title_en: "Scribe's Sigh",
    intro: "Jakou emoci vyjadřuje písař, který v kolofonu míchá latinu se staročeským veršem?",
    intro_en: "What emotion is expressed by the scribe who blends Latin with Old Czech verse in the colophon?",
    quote: "Scriptor iam cessa naposledy pójdeš do lesa.",
    translation_cs: "Písaři, už přestaň, naposledy půjdeš do lesa.",
    translation_en: "Scribe, desist now, for the last time you shall go to the woods.",
    options: [
      ["🌲", "Vyčerpaný a toužící po svobodě v přírodě"],
      ["⚔️", "Připravený k ozbrojenému boji proti nepřátelům"],
      ["📚", "Dychtivý ihned začít opisovat další kodex"],
      ["💰", "Požadující okamžité navýšení písařské mzdy"],
    ],
    options_en: [
      ["🌲", "Exhausted and yearning for freedom outdoors in nature"],
      ["⚔️", "Ready for armed combat against enemies"],
      ["📚", "Eager to immediately start copying another codex"],
      ["💰", "Demanding an immediate pay raise for copying"],
    ],
    correct_index: 0,
    explanation: "Fráze 'pójdeš do lesa' je staročeský idiom pro konec vyčerpávající práce a únik od ztuhlých prstů a bolavých zad do volného prostoru mimo klášterní skriptorium.",
    explanation_en: "The Old Czech idiom 'pójdeš do lesa' (you shall go to the woods) signifies the relief of finishing exhausting labor and escaping stiff fingers and aching backs into the open air beyond monastic walls.",
    hint: "Soustřeďte se na touhu odložit psací brk po měsících sezení v chladu.",
    hint_en: "Focus on the desire to put down the quill after months of sitting in the cold scriptorium.",
    difficulty: "easy",
  },
  {
    id: "mood-2",
    game_kind: "mood",
    mode: "mood",
    title: "Děkovná úleva",
    title_en: "Grateful Relief",
    intro: "Co vyjadřuje písař těmito úsečnými slovy na samém konci rukopisu?",
    intro_en: "What does the scribe express with these concise words at the very end of the manuscript?",
    quote: "Laus trino et uno. Finito libro, sit laus et gloria Christo.",
    translation_cs: "Chvála Trojjedinému. Kniha je dokončena, buď chvála a sláva Kristu.",
    translation_en: "Praise to the Three and One. With the book finished, let praise and glory be to Christ.",
    options: [
      ["🙏", "Hlubokou zbožnou úlevu a vděčnost za dokončení díla"],
      ["😩", "Stížnost na zkažený inkoust a křivě seříznutý brk"],
      ["⚖️", "Kritiku teologických chyb v předloze"],
      ["🍷", "Žádost o džbán moravského vína"],
    ],
    options_en: [
      ["🙏", "Deep pious relief and gratitude for completing the work"],
      ["😩", "A complaint about spoiled ink and a blunt quill"],
      ["⚖️", "Criticism of theological errors in the source copy"],
      ["🍷", "A request for a jug of Moravian wine"],
    ],
    correct_index: 0,
    explanation: "'Laus trino et uno' je nejčastější děkovná formule středověkých písařů Bohu za to, že jim dal zdraví a sílu dokončit náročný opis bez oslepnutí.",
    explanation_en: "'Laus trino et uno' is the most iconic medieval thanksgiving formula to God for granting health and sight to finish a demanding copy without going blind.",
    hint: "Písař vzdává chválu Nejsvětější Trojici za zdárný konec úkolu.",
    hint_en: "The scribe gives thanks to the Holy Trinity for the safe completion of the task.",
    difficulty: "easy",
  },
  {
    id: "mood-3",
    game_kind: "mood",
    mode: "mood",
    title: "Písařská žízeň",
    title_en: "Scribe's Thirst",
    intro: "Jaký tón volí písař v tomto slavném latinském rýmovaném povzdechu?",
    intro_en: "What tone does the scribe adopt in this famous Latin rhyming sigh?",
    quote: "Explicit hoc totum, pro christo da michi potum.",
    translation_cs: "Zde je to celé u konce, pro Krista, dej mi napít!",
    translation_en: "All is finished here; for Christ's sake give me a drink!",
    options: [
      ["🍷", "Odlehčený a žíznivý – žádá osvěžující nápoj za odvedenou dřinu"],
      ["📜", "Přísně úřední záznam pro biskupa"],
      ["😤", "Rozzuřený na čtenáře, který nevrátil předchozí svazek"],
      ["🕊️", "Zbožné rozjímání o věčném životě"],
    ],
    options_en: [
      ["🍷", "Lighthearted and parched – requesting a refreshing drink for hard labor"],
      ["📜", "A strict official record for the bishop"],
      ["😤", "Enraged at a reader who failed to return a previous volume"],
      ["🕊️", "A pious meditation on eternal life"],
    ],
    correct_index: 0,
    explanation: "Verš 'pro Christo da mihi potum' byl mezi univerzitními a klášterními písaři velmi oblíbený – po týdnech v prašném skriptoriu žádali mecenáše o pivo či víno.",
    explanation_en: "The verse 'pro Christo da mihi potum' was immensely popular among university and monastic scribes – requesting beer or wine from patrons after weeks in the dusty scriptorium.",
    hint: "Slovo 'potum' v latině znamená nápoj.",
    hint_en: "The word 'potum' in Latin means a drink or beverage.",
    difficulty: "easy",
  },
  {
    id: "mood-4",
    game_kind: "mood",
    mode: "mood",
    title: "Kletba na zloděje",
    title_en: "Curse upon Book Thieves",
    intro: "Jakou emoci vložil písař do této závěrečné klauzule kodexu?",
    intro_en: "What sentiment did the scribe embed into this concluding manuscript clause?",
    quote: "Quisquis hunc librum rapuerit, anathema sit in die iudicii.",
    translation_cs: "Kdokoliv by tuto knihu uloupil, budiž proklet v den soudný.",
    translation_en: "Whoever steals this book, let him be accursed on the Day of Judgement.",
    options: [
      ["⚡", "Hrozivý hněv a nekompromisní ochranu knihy před zcizením"],
      ["😌", "Poklidné loučení se čtenářem"],
      ["🤝", "Nabídku k výhodnému odkoupení svazku"],
      ["😢", "Lítost nad ztraceným přítelem"],
    ],
    options_en: [
      ["⚡", "Fierce wrath and uncompromising defense of the codex against theft"],
      ["😌", "A peaceful farewell to the reader"],
      ["🤝", "An offer to sell the volume at a discount"],
      ["😢", "Sorrow over a lost friend"],
    ],
    correct_index: 0,
    explanation: "Kletby na zloděje knih (anathema) byly ve středověku běžnou ochranou drahocenných kodexů před krádeží. Knihy měly hodnotu celých vesnic.",
    explanation_en: "Book curses (anathema) were standard medieval protection for precious codices against theft, as a single manuscript could be worth an entire village.",
    hint: "Slovo 'anathema' znamená církevní kletbu a vyloučení.",
    hint_en: "The word 'anathema' signifies ecclesiastical curse and excommunication.",
    difficulty: "easy",
  },

  // ==========================================
  // 2. ROZLUŠTI ŠIFRU (Crack the Cipher) - 4 možnosti
  // ==========================================
  {
    id: "cipher-1",
    game_kind: "cipher",
    title: "Jméno neznámého písaře",
    title_en: "Name of the Unknown Scribe",
    intro: "Písař zakomponoval své jméno do rýmované latinské formule. Doplňte chybějící slovo:",
    intro_en: "The scribe wove his name into a rhyming Latin formula. Fill in the missing word:",
    quote: "Qui hoc scribebat, [...] sibi nomen erat, amen.",
    options: [
      ["Iohannes", "Oblíbené písařské jméno Jan"],
      ["Petrus", "Svatopetrská tradice"],
      ["Nicolaus", "Mikuláš z Prahy"],
    ],
    options_en: [
      ["Iohannes", "The popular scribal name John"],
      ["Petrus", "The Petrine tradition"],
      ["Nicolaus", "Nicholas of Prague"],
    ],
    correct_index: 0,
    explanation: "Rýmovaná formule 'Qui hoc scribebat, Iohannes sibi nomen erat' patří k nejznámějším písařským veršům pozdního středověku.",
    explanation_en: "The rhyming verse 'Qui hoc scribebat, Iohannes sibi nomen erat' is among the most famous late medieval scribal colophons.",
    hint: "Hledejte nejčastější křesťanské jméno odvozené od Jana Křtitele.",
    hint_en: "Look for the most common Christian name derived from John the Baptist.",
    difficulty: "medium",
  },
  {
    id: "cipher-2",
    game_kind: "cipher",
    title: "Rýmovaný rýp",
    title_en: "Rhyming Quip",
    intro: "Doplňte chybějící slovo ve známé dvojjazyčné písařské formuli:",
    intro_en: "Fill in the missing word in this famous bilingual scribal formula:",
    quote: "Scriptor iam cessa, naposledy pójdeš do [...]!",
    options: [
      ["lesa", "Rýmuje se se slovem cessa"],
      ["města", "Za nákupem nového pergamenu"],
      ["hospody", "Za pohárem piva či vína"],
    ],
    options_en: [
      ["lesa", "Rhymes with the Latin word 'cessa' (woods)"],
      ["města", "To purchase new parchment (town)"],
      ["hospody", "To enjoy a tankard of beer or wine (tavern)"],
    ],
    correct_index: 0,
    explanation: "Český písař geniálně zrýmoval latinské imperativum 'cessa' (přestaň) s českým slovem 'lesa'.",
    explanation_en: "A Bohemian scribe ingeniously rhymed the Latin imperative 'cessa' (cease) with the Old Czech word 'lesa' (to the woods).",
    hint: "Sledujte koncovku slova 'cessa'.",
    hint_en: "Pay attention to the ending of the word 'cessa'.",
    difficulty: "easy",
  },
  {
    id: "cipher-3",
    game_kind: "cipher",
    title: "Florentské město",
    title_en: "Florentine City",
    intro: "Ve kterém italském městě dopsal kněz František svůj kodex?",
    intro_en: "In which Italian city did priest Franciscus complete his codex?",
    quote: "Presbyter Franciscus Collensis scripsit [...]",
    options: [
      ["Florentie", "Ve Florencii, kolébce renesance"],
      ["Rome", "V Římě u papežské kurie"],
      ["Venetiis", "V Benátkách u svatého Marka"],
    ],
    options_en: [
      ["Florentie", "In Florence, cradle of the Renaissance"],
      ["Rome", "In Rome at the Papal Curia"],
      ["Venetiis", "In Venice at Saint Mark's"],
    ],
    correct_index: 0,
    explanation: "Lokativ 'Florentie' označuje toskánskou Florencii, významné centrum humanistického písemnictví.",
    explanation_en: "The locative form 'Florentie' denotes Tuscan Florence, a major center of humanist scribal culture.",
    hint: "Název města začíná písmenem F.",
    hint_en: "The name of the city begins with the letter F.",
    difficulty: "easy",
  },
  {
    id: "cipher-4",
    game_kind: "cipher",
    title: "Závěrečná formule kodexu",
    title_en: "Concluding Formula of the Codex",
    intro: "Které latinské slovo tradičně označuje dokončení knihy v kolofonu?",
    intro_en: "Which Latin word traditionally denotes the completion of a book in a colophon?",
    quote: "Petrarce laureati de secreto conflictu curarum suarum liber tercius et ultimus feliciter [...]",
    options: [
      ["explicit", "Kniha se rozvinula / končí"],
      ["incipit", "Zde začíná text"],
      ["requiescit", "Odpočívá v pokoji"],
    ],
    options_en: [
      ["explicit", "The book has unfolded / finishes here"],
      ["incipit", "Here begins the text"],
      ["requiescit", "Rests in peace"],
    ],
    correct_index: 0,
    explanation: "'Explicit' (zkratka z explicitus est liber – kniha je rozvinuta) je standardní středověké označení konce textu, protiklad slova 'incipit'.",
    explanation_en: "'Explicit' (short for explicitus est liber – the book is unrolled/finished) is the standard medieval closing formula, the counterpart to 'incipit'.",
    hint: "Opak slova 'incipit'.",
    hint_en: "The opposite of the word 'incipit'.",
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
    title_en: "Type of Medieval Script",
    intro: "Kterým typem písma je zapsán text této ukázky s lomenými dříky a bohatou rubrikací?",
    intro_en: "Which script type is used in this sample with broken vertical strokes and rich rubrication?",
    quote: "Qui scripsit scribat, semper cum domino vivat.",
    translation_cs: "Kdo psal, ať píše dál, ať navěky žije s Pánem.",
    translation_en: "May he who wrote continue to write, and live forever with the Lord.",
    options: [
      ["📜", "Gotická textura (Textualis formata) – slavnostní knižní lomené písmo"],
      ["✒️", "Gotická kurzíva (Cursiva) – zběžné úřední písmo se smyčkami"],
      ["🏛️", "Humanistická antikva (Antiqua) – okrouhlé renesanční písmo"],
      ["👑", "Karolínská minuskula – raně středověké písmo z 9.–11. století"],
    ],
    options_en: [
      ["📜", "Gothic Textura (Textualis formata) – ceremonial book hand with broken strokes"],
      ["✒️", "Gothic Cursive (Cursiva) – rapid administrative cursive with loops"],
      ["🏛️", "Humanist Antiqua (Antiqua) – rounded Renaissance script"],
      ["👑", "Carolingian Minuscule – early medieval script of the 9th–11th centuries"],
    ],
    correct_index: 0,
    explanation: "Gotická textura (z latinského 'textus' – tkanina) je vrcholně středověké knižní písmo 13.–15. století, charakteristické přísným lámáním dříků a vysokým kontrastem tahů připomínajícím tkanou látku.",
    explanation_en: "Gothic Textura (from Latin 'textus' – woven fabric) is the classic high medieval book hand of the 13th–15th centuries, characterized by strict angular fractures and woven appearance.",
    hint: "Všimněte si lomených patních tahů na spodku i vrchu liter.",
    hint_en: "Notice the broken serifs at the top and bottom of letter stems.",
    difficulty: "medium",
  },
  {
    id: "script-2",
    game_kind: "paleo",
    mode: "century",
    title: "Datace rukopisu podle stylu",
    title_en: "Dating by Manuscript Style",
    intro: "Do kterého období spadá vznik tohoto univerzitního kodexu s lucemburskou notací z Prahy?",
    intro_en: "To which period does this Prague university codex with Luxembourg notation belong?",
    quote: "Anno domini millesimo quadringentesimo duodecimo...",
    translation_cs: "Léta Páně tisícího čtyřstého dvanáctého...",
    translation_en: "In the year of our Lord one thousand four hundred and twelve...",
    options: [
      ["A", "1. polovina 15. století (1400–1450) – doba Václava IV. a husitství"],
      ["B", "13. století (1200–1299) – doba Přemysla Otakara II."],
      ["C", "Raný středověk (900–1050) – příchod křesťanství"],
      ["D", "17. století (1600–1650) – barokní tisk"],
    ],
    options_en: [
      ["A", "1st half of the 15th century (1400–1450) – reign of Wenceslaus IV & Hussite era"],
      ["B", "13th century (1200–1299) – reign of Ottokar II"],
      ["C", "Early Middle Ages (900–1050) – advent of Christianity"],
      ["D", "17th century (1600–1650) – baroque printing"],
    ],
    correct_index: 0,
    explanation: "Letopočet 'millesimo quadringentesimo duodecimo' (1412) spadá do doby vlády krále Václava IV., těsně před vypuknutím husitských válek.",
    explanation_en: "The date 'millesimo quadringentesimo duodecimo' (1412) dates directly to the reign of King Wenceslaus IV, just before the outbreak of the Hussite Wars.",
    hint: "Latinské slovo 'quadringentesimo' značí čtyřsté (1400).",
    hint_en: "The Latin word 'quadringentesimo' means four hundredth (1400).",
    difficulty: "medium",
  },
  {
    id: "script-3",
    game_kind: "paleo",
    mode: "script",
    title: "Písmo úředních a rychlých zápisů",
    title_en: "Script of Rapid and Official Records",
    intro: "Písař psal se spěchem, písmena se propojují smyčkami a dříky se sklánějí doprava. O jaké písmo jde?",
    intro_en: "The scribe wrote hastily, with letters linked by loops and minims slanting right. What script is this?",
    quote: "Explicit liber magistri Iohannis de Praga scriptus raptim...",
    translation_cs: "Zde končí kniha mistra Jana z Prahy, psaná ve spěchu...",
    translation_en: "Here ends the book of Master John of Prague, written hastily...",
    options: [
      ["✒️", "Gotická kurzíva (Cursiva libraria) – rychlé písmo se smyčkami"],
      ["📜", "Unciála – velká okrouhlá majuskula z 5. století"],
      ["🏛️", "Gotická rotunda – italská okrouhlá gotika"],
      ["🔤", "Kapitála – monumentální tesané nápisové písmo"],
    ],
    options_en: [
      ["✒️", "Gothic Cursive (Cursiva libraria) – fast cursive with looping ascenders"],
      ["📜", "Uncial – large rounded majuscule from the 5th century"],
      ["🏛️", "Gothic Rotunda – rounded Italian gothic hand"],
      ["🔤", "Capitalis Monumentalis – monumental carved inscriptional capitals"],
    ],
    correct_index: 0,
    explanation: "Gotická kurzíva byla vyvinuta pro potřeby univerzitních studentů a městských kanceláří, kde bylo třeba psát rychle bez neustálého zvedání pera.",
    explanation_en: "Gothic Cursive was developed for university students and municipal chanceries where writing quickly without lifting the quill repeatedly was essential.",
    hint: "Slovo 'raptim' znamená ve spěchu.",
    hint_en: "The word 'raptim' means hastily or in a rush.",
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
    title_en: "Palaeographical Master: Thanksgiving Formula",
    intro: "Prohlédněte si zvětšenou a osvětlenou pasáž folia. Přepište přesně latinská slova, která písař zapsal.",
    intro_en: "Examine the illuminated folium passage. Accurately transcribe the Latin words recorded by the scribe.",
    quote: "Laus trino et uno",
    translation_cs: "Chvála Trojjedinému.",
    translation_en: "Praise to the Three and One.",
    options: [],
    options_en: [],
    correct_index: 0,
    target_transcription: "Laus trino et uno",
    accepted_variants: ["laus trino et uno", "laus trino et vno", "lavs trino et vno"],
    highlight_regions: [
      { x: 28, y: 38, w: 44, h: 14 }
    ],
    explanation: "Gratulujeme k paleografickému přepisu! V gotickém písmu se písmeno 'u' a 'v' píše často nerozlišitelně a litery jsou těsně staženy k sobě.",
    explanation_en: "Congratulations on your palaeographical transcription! In Gothic script, 'u' and 'v' are often interchangeable and letter stems are drawn tightly together.",
    hint: "První slovo začíná velkým gotickým 'L' a končí 's'. Jde o chválu (Laus).",
    hint_en: "The first word begins with a Gothic capital 'L' and ends with 's'. It is praise ('Laus').",
    difficulty: "expert",
  },
  {
    id: "paleo-trans-2",
    game_kind: "paleo",
    mode: "transcription",
    title: "Paleografický mistr: Bolest ruky",
    title_en: "Palaeographical Master: Aching Hand",
    intro: "Tato pasáž přechází přes dva řádky. Přečtěte osvětlené řádky lupy a zapište přepis latinských slov:",
    intro_en: "This passage spans two lines. Read the illuminated lines under the lens and transcribe the Latin words:",
    quote: "Manus mea dolet",
    translation_cs: "Ruka mě bolí.",
    translation_en: "My hand aches.",
    options: [],
    options_en: [],
    correct_index: 0,
    target_transcription: "Manus mea dolet",
    accepted_variants: ["manus mea dolet", "manus mea"],
    highlight_regions: [
      { x: 18, y: 32, w: 58, h: 12 },
      { x: 18, y: 46, w: 36, h: 12 }
    ],
    explanation: "Skvělý paleografický výkon! Zvládli jste číst přechod mezi řádky i typickou gotickou ligaturu.",
    explanation_en: "Outstanding palaeographical skill! You mastered the line-break transition and typical Gothic ligatures.",
    hint: "Písař si stěžuje na ruku: 'Manus...'",
    hint_en: "The scribe complains about his hand: 'Manus...'",
    difficulty: "expert",
  },
  {
    id: "paleo-trans-3",
    game_kind: "paleo",
    mode: "transcription",
    title: "Paleografický mistr: Písař Jan",
    title_en: "Palaeographical Master: Scribe John",
    intro: "Přečtěte ze zlatě zvýrazněné pasáže rukopisu autorskou dedikaci písaře:",
    intro_en: "Read the authorial dedication of the scribe from the golden illuminated passage:",
    quote: "per manus Iohannis",
    translation_cs: "rukou Jana",
    translation_en: "by the hand of John",
    options: [],
    options_en: [],
    correct_index: 0,
    target_transcription: "per manus Iohannis",
    accepted_variants: ["per manus iohannis", "per manus johannis", "per manus ioannis"],
    highlight_regions: [
      { x: 22, y: 40, w: 56, h: 14 }
    ],
    explanation: "Výborně! Středověká latina často píše jméno Jan jako 'Iohannes' s písmenem 'h' uprostřed.",
    explanation_en: "Well done! Medieval Latin frequently spells the name John as 'Iohannes' with an internal 'h'.",
    hint: "Text začíná předložkou 'per' a následuje jméno 'Iohannis'.",
    hint_en: "The text begins with preposition 'per' followed by 'Iohannis'.",
    difficulty: "expert",
  },
];
