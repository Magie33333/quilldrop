export type Curio = {
  id: string;
  category: string;
  title: string;
  text: string;
  source?: string;
};

export const DEFAULT_CURIOS: Curio[] = [
  {
    id: "curio-1",
    category: "Písařské stížnosti",
    title: "Tři prsty píší, ale celé tělo trpí",
    text: "Písaři často v kolofonech zanechávali povzdechy: „Tres digiti scribunt, sed totum corpus laborat.“ Psali v chladných celách bez topení, na tvrdých stoličkách a za přísného zákazu používání ohně.",
    source: "Častá formule v kodexech 12.–15. století",
  },
  {
    id: "curio-2",
    category: "Tajemství kolofonů",
    title: "Explicit liber, da scriptori bibere!",
    text: "Jedno z nejčastějších neformálních zvolání písařů znělo: „Kniha skončila, dejte písaři napít dobrého vína!“ Dokončení víceletého přepisu bylo v klášteře důvodem k oslavě a uvolnění řehole.",
    source: "Metropolitní kapitula Praha, rkp. 1387",
  },
  {
    id: "curio-3",
    category: "Pergamen a inkoust",
    title: "Celé stádo na jedinou bibli",
    text: "Na zhotovení velké klášterní Bible bylo zapotřebí pergamenu z kůží až 250 ovcí či telat. Pergamen byl nesmírně drahý, proto se z chyb nešlo jen tak vypsat – písař musel omyl vyškrábat nožíkem (tzv. rasoriem).",
    source: "Historie knižní kultury",
  },
  {
    id: "curio-4",
    category: "Démoni a legendy",
    title: "Titivillus, noční můra písařů",
    text: "Podle středověkých mnichů obcházel skriptoria démon Titivillus. Sbíral do pytle všechna písmena, slova a slabiky, která unavení písaři přeskočili nebo zkomolili, a předkládal je u Posledního soudu.",
    source: "Traktát Caesaria z Heisterbachu, 13. století",
  },
  {
    id: "curio-5",
    category: "Iluminace a zlato",
    title: "Leštění zlata zubem divočáka",
    text: "Plátkové zlato se na iniciály nanášelo na vrstvu gesso (speciální sádrový tmel). Po zaschnutí se leštilo hladkým zvířecím zubem (nejčastěji divočáka, psa nebo vlka) či achátem, dokud nezískalo zrcadlový lesk.",
    source: "Mnich Theophilus: O rozličných uměních (De diversis artibus)",
  },
  {
    id: "curio-6",
    category: "Středověká knihovna",
    title: "Libri catenati – Knihy na řetězech",
    text: "Rukopisy měly často hodnotu celých vesnic nebo panských statků. V knihovnách proto bývaly přikovány masivními železnými řetězy přímo ke čtenářským stolům, aby je nikdo nemohl odnést.",
    source: "Klášterní a univerzitní knihovny v Evropě",
  },
  {
    id: "curio-7",
    category: "Kletby na zloděje",
    title: "Anathema za krádež kodexu",
    text: "Na ochranu před zloději vpisovali písaři na začátek či konec děsivé kletby: „Kdo tuto knihu odcizí nebo vyřeže její listy, nechť je vymazán z Knihy života a ať jeho duše shoří v plamenech pekelných.“",
    source: "Anathema v rukopisech 11.–14. století",
  },
  {
    id: "curio-8",
    category: "Pergamen a inkoust",
    title: "Tajemství duběnkového inkoustu",
    text: "Nejtrvanlivější středověký černý inkoust se vařil z duběnek – výrůstků způsobených hmyzem na listech dubu. Obsahovaly vysoké množství taninu, který po smíchání se zelenou skalicí vytvořil inkoust, jenž doslova vyleptal text do pergamenu.",
    source: "Písařské receptáře 14. století",
  },
  {
    id: "curio-9",
    category: "Knižní malba",
    title: "Pravý původ slova miniatura",
    text: "Slovo „miniatura“ nepůvodně neoznačovalo malý rozměr, nýbrž latinské slovo „minium“ – rumělku neboli červený oxid olovnatý, kterým iluminátoři obtahovali první písmena textu (rubrikovali).",
    source: "Středověká kodikologie",
  },
  {
    id: "curio-10",
    category: "Život ve skriptoriu",
    title: "Zákaz svíček a psaní pouze na denním světle",
    text: "Ve většině skriptorií byl přísný zákaz používání otevřeného ohně i svíček kvůli riziku požáru vzácných děl. Písaři proto směli pracovat pouze od svítání do soumraku u oken orientovaných na jih.",
    source: "Řehole sv. Benedikta a klášterní statuta",
  },
  {
    id: "curio-11",
    category: "Tajemství kolofonů",
    title: "Šifrované podpisy a hádanky",
    text: "Někteří písaři schovávali své jméno do anagramů, kryptogramů nebo šifer – například nahrazovali samohlásky tečkami, následujícími souhláskami, nebo psali slova pozpátku, aby jejich identitu odhalil jen pozorný čtenář.",
    source: "Kryptografie ve středověkých kolofonech",
  },
  {
    id: "curio-12",
    category: "Písařské stížnosti",
    title: "Hněv na špatný pergamen a tupé brko",
    text: "Na okrajích rukopisů nacházíme zkoušky per (probatio pennae) i glosy: „Pergamentum est maculosum et pessimum“ (Tento pergamen je flekatý a hanebný) nebo „Nunc scripsi totum, pro Christo da mihi potum“.",
    source: "Glosy na okrajích středoevropských rukopisů",
  },
];
