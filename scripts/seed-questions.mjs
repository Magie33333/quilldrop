import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const dotenv = fs.readFileSync(".env.local", "utf8");
const url = dotenv.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = dotenv.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

if (!url || !key) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  console.log("Fetching cards from Supabase...");
  const { data: cards, error: cardsError } = await supabase
    .from("cards")
    .select("id, title, rarity, colophons(quote, scribe, place, year, locus, manuscript_shelfmark)");

  if (cardsError || !cards || cards.length === 0) {
    console.error("Failed to fetch cards:", cardsError);
    process.exit(1);
  }

  console.log(`Found ${cards.length} cards. Preparing questions...`);

  const findCard = (phrase) =>
    cards.find((c) =>
      c.colophons?.quote?.toLowerCase().includes(phrase.toLowerCase()) ||
      c.title.toLowerCase().includes(phrase.toLowerCase())
    ) || cards[0];

  const cForest = findCard("do lesa");
  const cJohn = findCard("Iohannes");
  const cSecret = findCard("secrete");
  const cLaus = findCard("Laus trino");
  const cFlorence = findCard("Florentie");
  const cBologna = findCard("Bononia");
  const cPrague = findCard("Prague castle");
  const cPetrarch = findCard("Petrarce");
  const cMary = findCard("maria");
  const cAmen = findCard("Amen");

  const questions = [
    // --- MOOD (Nálada písaře) ---
    {
      card_id: cForest.id,
      game_kind: "mood",
      title: "Písařský povzdech",
      intro: "Jak se cítí písař, který v kolofonu míchá latinu se staročeským veršem?",
      quote: cForest.colophons?.quote || "Scriptor iam cessa naposledy pójdeš do lesa.",
      options: [
        ["🌲", "Vyčerpaný a toužící po svobodě venku v přírodě"],
        ["⚔️", "Připravený k boji proti loupežníkům"],
        ["📚", "Nadšený, že hned začne opisovat další folium"],
      ],
      correct_index: 0,
      explanation: "Fráze 'pójdeš do lesa' je staročeský idiom pro konec práce a únik od ztuhlých prstů a bolavých zad do volného prostoru.",
      hint: "Soustřeďte se na touhu odložit psací brk po měsících sezení v chladném skriptoriu.",
      difficulty: "easy",
      is_active: true,
    },
    {
      card_id: cLaus.id,
      game_kind: "mood",
      title: "Úleva po dokončení",
      intro: "Co vyjadřuje písař těmito úsečnými slovy na samém konci rukopisu?",
      quote: cLaus.colophons?.quote || "Laus trino et uno",
      options: [
        ["🙏", "Hlubokou vděčnost a zbožnou úlevu Bohu za darované síly"],
        ["💰", "Netrpělivou žádost o vyplacení dohodnuté mzdy"],
        ["⚖️", "Kritiku chyb v dodaném předlohovém kodexu"],
      ],
      correct_index: 0,
      explanation: "'Laus trino et uno' (Chvála Trojjedinému) je nejčastější děkovná formule středověkých písařů za to, že ve zdraví dokončili náročné dílo.",
      hint: "Slova 'trino et uno' odkazují na Nejsvětější Trojici.",
      difficulty: "easy",
      is_active: true,
    },
    {
      card_id: cSecret.id,
      game_kind: "mood",
      title: "Tajemství v úkrytu",
      intro: "S jakým záměrem písař připojil k tomuto textu přísné varování?",
      quote: cSecret.colophons?.quote || "Serva istud secrete, quia secretum magnum est.",
      options: [
        ["🤫", "Spiklenecká obezřetnost a ochrana esoterického vědění"],
        ["📜", "Úřední příkaz k okamžitému spálení dokumentu"],
        ["😠", "Rozhořčení nad neschopností mladších učedníků"],
      ],
      correct_index: 0,
      explanation: "Formule 'Serva istud secrete' chránila alchymistické, lékařské nebo mystické receptury před očima nezasvěcených.",
      hint: "Latinské slovo 'secretum' znamená tajemství.",
      difficulty: "medium",
      is_active: true,
    },
    {
      card_id: cBologna.id,
      game_kind: "mood",
      title: "Studentský elán v Bologni",
      intro: "V jakém rozpoložení píše probošt Benedikt z Valdštejna svůj přípis?",
      quote: cBologna.colophons?.quote || "Ego Benedictus de Waldsssteyn prepositus Lithomerz. etc. feci principium... Alleluia",
      options: [
        ["🎓", "Hrdost na zahájení univerzitních přednášek a velikonoční radost"],
        ["🥱", "Nuda z dlouhých klášterních disputací"],
        ["🌧️", "Stesk po rodných severních Čechách"],
      ],
      correct_index: 0,
      explanation: "Benedikt hrdě zaznamenává zahájení svých přednášek ('principium') v dominikánském konventu v Bologni během Velikonoc doprovázené jásavým 'Alleluia'.",
      hint: "Všimněte si závěrečného zvolání 'Alleluia' a univerzitního termínu 'feci principium'.",
      difficulty: "medium",
      is_active: true,
    },

    // --- CIPHER (Rozlušti kolofon) ---
    {
      card_id: cJohn.id,
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
      is_active: true,
    },
    {
      card_id: cForest.id,
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
      is_active: true,
    },
    {
      card_id: cFlorence.id,
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
      is_active: true,
    },
    {
      card_id: cPetrarch.id,
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
      is_active: true,
    },

    // --- PALEO (Paleografický mistr) ---
    {
      card_id: cPrague.id,
      game_kind: "paleo",
      title: "Gotické lomené písmo",
      intro: "Který typ středověkého písma dominuje v kodexech 14. a 15. století v Čechách?",
      quote: "Scribe in arce Pragensi...",
      options: [
        ["Gotická textura a bastarda", "Hranaté tahy se zlomenými dříky a bohatou rubrikací"],
        ["Hlaholice", "Staroslověnské písmo svatých Cyrila a Metoděje"],
        ["Renesanční antikva", "Kulaté písmo inspirované římskými nápisy"],
      ],
      correct_index: 0,
      explanation: "V českých zemích za lucemburské doby převládala gotická textura v liturgických kodexech a gotická bastarda v běžných rukopisech.",
      hint: "Charakteristické je 'lámání' oblouků a svislé stínování písmových tahů.",
      difficulty: "expert",
      is_active: true,
    },
    {
      card_id: cMary.id,
      game_kind: "paleo",
      title: "Rubrikace a zvýraznění",
      intro: "Proč jsou v tomto kolofonu některá slova či iniciály napsány červeným inkoustem?",
      quote: cMary.colophons?.quote || "O maria virgo",
      options: [
        ["🔴", "Rubrikace (z lat. ruber = červený) sloužila k orientaci a zvýraznění svatých jmen"],
        ["❌", "Písař tím označil textové chyby, které má čtenář přeskočit"],
        ["🎨", "Došel černý inkoust ze sazí a duběnek, tak písař použil zbytek rumělky"],
      ],
      correct_index: 0,
      explanation: "Rubrikace prováděná červenou hlinkou nebo rumělkou (cinobrem) byla specializovaná práce rubrikátora pro hierarchizaci textu.",
      hint: "Slovo pochází z latinského výrazu pro červenou barvu.",
      difficulty: "medium",
      is_active: true,
    },
    {
      card_id: cAmen.id,
      game_kind: "paleo",
      title: "Středověké písařské zkratky",
      intro: "Co ve středověkých latinských a německých rukopisech znamenala vodorovná čárka (titulus) nad písmenem?",
      quote: "In dem Namen des Vater... Amen",
      options: [
        ["〰️", "Zkratku pro vynechané 'm' nebo 'n' (nasální zkrácení)"],
        ["🎵", "Hudební notaci chorálního zpěvu"],
        ["👑", "Označení, že text četl panovník"],
      ],
      correct_index: 0,
      explanation: "Vodorovná čárka (titulus / suspenze) je nejčastější středověká zkratka, která šetřila drahocenný pergamen tím, že nahrazovala nosovky m a n.",
      hint: "Pergamen byl drahý, písaři vynechávali písmena před koncem slabik.",
      difficulty: "expert",
      is_active: true,
    },
  ];

  console.log(`Inserting ${questions.length} questions into game_questions...`);
  const { data: inserted, error: insertError } = await supabase
    .from("game_questions")
    .insert(questions)
    .select("id, title, game_kind");

  if (insertError) {
    console.error("Direct insert failed:", insertError);
    process.exit(1);
  }
  console.log(`Successfully inserted ${inserted.length} questions!`);

  const { count } = await supabase.from("game_questions").select("*", { count: "exact", head: true });
  console.log(`Total questions in database: ${count}`);
}

main().catch(console.error);
