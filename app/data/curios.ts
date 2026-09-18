export type Curio = {
  id: string;
  category: string;
  category_en?: string;
  title: string;
  title_en?: string;
  text: string;
  text_en?: string;
  source?: string;
  source_en?: string;
};

export const DEFAULT_CURIOS: Curio[] = [
  {
    id: "curio-1",
    category: "Písařské stížnosti",
    category_en: "Scribal Complaints",
    title: "Tři prsty píší, ale celé tělo trpí",
    title_en: "Three fingers write, yet the whole body suffers",
    text: "Písaři často v kolofonech zanechávali povzdechy: „Tres digiti scribunt, sed totum corpus laborat.“ Psali v chladných celách bez topení, na tvrdých stoličkách a za přísného zákazu používání ohně.",
    text_en: "Scribes frequently left laments in colophons: 'Tres digiti scribunt, sed totum corpus laborat.' They toiled in cold, unheated cells, on stiff benches, under strict prohibitions against lighting open fire.",
    source: "Častá formule v kodexech 12.–15. století",
    source_en: "Frequent formula in 12th–15th century codices",
  },
  {
    id: "curio-2",
    category: "Tajemství kolofonů",
    category_en: "Colophon Secrets",
    title: "Explicit liber, da scriptori bibere!",
    title_en: "Explicit liber, da scriptori bibere!",
    text: "Jedno z nejčastějších neformálních zvolání písařů znělo: „Kniha skončila, dejte písaři napít dobrého vína!“ Dokončení víceletého přepisu bylo v klášteře důvodem k oslavě a uvolnění řehole.",
    text_en: "One of the most famous informal scribal outbursts proclaimed: 'The book is ended, give the scribe good wine to drink!' Finishing years of painstaking copying called for celebration and relaxed monastic rule.",
    source: "Metropolitní kapitula Praha, rkp. 1387",
    source_en: "Metropolitan Chapter Prague, MS 1387",
  },
  {
    id: "curio-3",
    category: "Pergamen a inkoust",
    category_en: "Parchment & Ink",
    title: "Celé stádo na jedinou bibli",
    title_en: "An entire flock for a single Bible",
    text: "Na zhotovení velké klášterní Bible bylo zapotřebí pergamenu z kůží až 250 ovcí či telat. Pergamen byl nesmírně drahý, proto se z chyb nešlo jen tak vypsat – písař musel omyl vyškrábat nožíkem (tzv. rasoriem).",
    text_en: "Producing a grand monastic Bible required the parchment skins of up to 250 sheep or calves. Parchment was exceedingly costly, so scribes could not discard sheets over a mistake – errors had to be meticulously scraped away with a penknife (rasorium).",
    source: "Historie knižní kultury",
    source_en: "History of Book Culture",
  },
  {
    id: "curio-4",
    category: "Démoni a legendy",
    category_en: "Demons & Legends",
    title: "Titivillus, noční můra písařů",
    title_en: "Titivillus, the nightmare of scribes",
    text: "Podle středověkých mnichů obcházel skriptoria démon Titivillus. Sbíral do pytle všechna písmena, slova a slabiky, která unavení písaři přeskočili nebo zkomolili, a předkládal je u Posledního soudu.",
    text_en: "According to medieval monks, the demon Titivillus prowled the scriptorium, gathering into a sack every skipped letter, botched word, and mumbled syllable of weary scribes to present them on the Day of Judgment.",
    source: "Traktát Caesaria z Heisterbachu, 13. století",
    source_en: "Treatise of Caesarius of Heisterbach, 13th century",
  },
  {
    id: "curio-5",
    category: "Iluminace a zlato",
    category_en: "Illumination & Gold",
    title: "Leštění zlata zubem divočáka",
    title_en: "Burnishing gold with a boar's tooth",
    text: "Plátkové zlato se na iniciály nanášelo na vrstvu gesso (speciální sádrový tmel). Po zaschnutí se leštilo hladkým zvířecím zubem (nejčastěji divočáka, psa nebo vlka) či achátem, dokud nezískalo zrcadlový lesk.",
    text_en: "Gold leaf was applied over a bed of gesso (special plaster adhesive). Once dried, it was burnished with a smooth animal tooth (usually from a wild boar, dog, or wolf) or an agate until it achieved a mirror sheen.",
    source: "Mnich Theophilus: O rozličných uměních (De diversis artibus)",
    source_en: "Theophilus Presbyter: On Diverse Arts (De diversis artibus)",
  },
  {
    id: "curio-6",
    category: "Středověká knihovna",
    category_en: "Medieval Libraries",
    title: "Libri catenati – Knihy na řetězech",
    title_en: "Libri catenati – Books in Chains",
    text: "Rukopisy měly často hodnotu celých vesnic nebo panských statků. V knihovnách proto bývaly přikovány masivními železnými řetězy přímo ke čtenářským stolům, aby je nikdo nemohl odnést.",
    text_en: "Handwritten codices were often worth entire villages or manors. In cathedral and university libraries, they were fastened with heavy iron chains directly to the lecterns to prevent theft.",
    source: "Klášterní a univerzitní knihovny v Evropě",
    source_en: "Monastic and university libraries across Europe",
  },
  {
    id: "curio-7",
    category: "Kletby na zloděje",
    category_en: "Curses upon Thieves",
    title: "Anathema za krádež kodexu",
    title_en: "Anathema for book theft",
    text: "Na ochranu před zloději vpisovali písaři na začátek či konec děsivé kletby: „Kdo tuto knihu odcizí nebo vyřeže její listy, nechť je vymazán z Knihy života a ať jeho duše shoří v plamenech pekelných.“",
    text_en: "To deter book thieves, scribes inscribed terrifying curses at the front or rear of codices: 'Whoever steals this book or cuts away its leaves, let him be blotted from the Book of Life and may his soul burn in everlasting hellfire.'",
    source: "Anathema v rukopisech 11.–14. století",
    source_en: "Anathema formulas in 11th–14th century manuscripts",
  },
  {
    id: "curio-8",
    category: "Pergamen a inkoust",
    category_en: "Parchment & Ink",
    title: "Tajemství duběnkového inkoustu",
    title_en: "The secret of iron gall ink",
    text: "Nejtrvanlivější středověký černý inkoust se vařil z duběnek – výrůstků způsobených hmyzem na listech dubu. Obsahovaly vysoké množství taninu, který po smíchání se zelenou skalicí vytvořil inkoust, jenž doslova vyleptal text do pergamenu.",
    text_en: "The most durable medieval black ink was brewed from oak galls – spherical growths induced by wasps on oak leaves. Rich in tannic acid, when mixed with green vitriol (ferrous sulfate) they yielded an indelible ink that chemically bonded with parchment.",
    source: "Písařské receptáře 14. století",
    source_en: "Scribal recipe books of the 14th century",
  },
  {
    id: "curio-9",
    category: "Knižní malba",
    category_en: "Manuscript Painting",
    title: "Pravý původ slova miniatura",
    title_en: "The true origin of the word miniature",
    text: "Slovo „miniatura“ nepůvodně neoznačovalo malý rozměr, nýbrž latinské slovo „minium“ – rumělku neboli červený oxid olovnatý, kterým iluminátoři obtahovali první písmena textu (rubrikovali).",
    text_en: "The word 'miniature' did not originally denote small size; it derived from the Latin word 'minium' – red lead (vermilion), which medieval illuminators used to draw the initial letters and headings (rubrication).",
    source: "Středověká kodikologie",
    source_en: "Medieval Codicology",
  },
  {
    id: "curio-10",
    category: "Život ve skriptoriu",
    category_en: "Scriptorium Life",
    title: "Zákaz svíček a psaní pouze na denním světle",
    title_en: "No candles: writing only by natural daylight",
    text: "Ve většině skriptorií byl přísný zákaz používání otevřeného ohně i svíček kvůli riziku požáru vzácných děl. Písaři proto směli pracovat pouze od svítání do soumraku u oken orientovaných na jih.",
    text_en: "In most scriptoria, open flame and wax candles were strictly prohibited to safeguard irreplaceable codices from fire. Scribes worked exclusively between dawn and dusk before south-facing windows.",
    source: "Řehole sv. Benedikta a klášterní statuta",
    source_en: "Rule of Saint Benedict and monastic statutes",
  },
  {
    id: "curio-11",
    category: "Tajemství kolofonů",
    category_en: "Colophon Secrets",
    title: "Šifrované podpisy a hádanky",
    title_en: "Ciphered signatures and riddles",
    text: "Někteří písaři schovávali své jméno do anagramů, kryptogramů nebo šifer – například nahrazovali samohlásky tečkami, následujícími souhláskami, nebo psali slova pozpátku, aby jejich identitu odhalil jen pozorný čtenář.",
    text_en: "Many scribes encoded their names into anagrams, cryptograms, or substitution ciphers – replacing vowels with dots, the subsequent consonant, or writing words backwards so only an astute reader could discern their identity.",
    source: "Kryptografie ve středověkých kolofonech",
    source_en: "Cryptography in medieval colophons",
  },
  {
    id: "curio-12",
    category: "Písařské stížnosti",
    category_en: "Scribal Complaints",
    title: "Hněv na špatný pergamen a tupé brko",
    title_en: "Laments over wretched parchment and dull quills",
    text: "Na okrajích rukopisů nacházíme zkoušky per (probatio pennae) i glosy: „Pergamentum est maculosum et pessimum“ (Tento pergamen je flekatý a hanebný) nebo „Nunc scripsi totum, pro Christo da mihi potum“.",
    text_en: "In the margins of manuscripts we find pen trials (probatio pennae) and spontaneous scribbles: 'Pergamentum est maculosum et pessimum' (This parchment is stained and wretched) or 'Nunc scripsi totum, pro Christo da mihi potum'.",
    source: "Glosy na okrajích středoevropských rukopisů",
    source_en: "Marginalia in Central European manuscripts",
  },
];

// Pomocné funkce pro lokalizaci glos
export function getCurioCategory(curio: Curio, lang: "cs" | "en" = "cs"): string {
  if (lang === "en") {
    if (curio.category_en) return curio.category_en;
    const def = DEFAULT_CURIOS.find((d) => d.id === curio.id || d.title === curio.title);
    if (def?.category_en) return def.category_en;
  }
  return curio.category;
}

export function getCurioTitle(curio: Curio, lang: "cs" | "en" = "cs"): string {
  if (lang === "en") {
    if (curio.title_en) return curio.title_en;
    const def = DEFAULT_CURIOS.find((d) => d.id === curio.id || d.title === curio.title);
    if (def?.title_en) return def.title_en;
  }
  return curio.title;
}

export function getCurioText(curio: Curio, lang: "cs" | "en" = "cs"): string {
  if (lang === "en") {
    if (curio.text_en) return curio.text_en;
    const def = DEFAULT_CURIOS.find((d) => d.id === curio.id || d.title === curio.title);
    if (def?.text_en) return def.text_en;
  }
  return curio.text;
}

export function getCurioSource(curio: Curio, lang: "cs" | "en" = "cs"): string | undefined {
  if (lang === "en") {
    if (curio.source_en) return curio.source_en;
    const def = DEFAULT_CURIOS.find((d) => d.id === curio.id || d.title === curio.title);
    if (def?.source_en) return def.source_en;
  }
  return curio.source;
}
