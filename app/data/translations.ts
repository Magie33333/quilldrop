export type Language = "cs" | "en";

// Česká lokalizace názvů původních 30 Heurist kolofonů
export const CARD_TITLES_CS: Record<string, string> = {
  "67741": "Sepsáno na Pražském hradě",
  "67452": "Chvála Trojjedinému",
  "67744": "Benedikt začíná v Bologni",
  "75396": "Jan bylo jeho jméno",
  "67595": "Červená rubrika pro Marii",
  "67501": "Uchovej toto velké tajemství",
  "67491": "Amen psané červenými tečkami",
  "64398": "Petrarcův tajný svár",
  "67500": "Věc větší než víra sama",
  "67494": "Abeceda na okrajích pergamenu",
  "67731": "František píše ve Florencii",
  "77579": "Písaři, již ustaň v práci",
  "77560": "Vím, leč neodvažuji se vyjevit",
  "26741": "Přeškrtané květiny",
  "77569": "Vyškrábaná tajemství žen",
  "63278": "Zjevení na Fulštejně",
  "75220": "Jubilejní milostivý kolofon",
  "27231": "Písař se zatemněným zrakem",
  "67398": "Marku, odevzdej psací tabulky",
  "27217": "Korigováno v Ostřihomi",
  "77535": "Erasmova vroucí modlitba",
  "75635": "Jméno skryté v iniciálách",
  "79938": "Díkůvzdání v ozdobném rámu",
  "76163": "Básník v královských službách",
  "67711": "Dobrý muž jest mrtev",
  "78524": "Pohár vína za těžkou lopotu",
  "63437": "Kresba po boku modlitby",
  "77855": "Modlete se za bratra Mikuláše",
  "67450": "Moje milované pero",
  "75381": "Podvečer v Žitavě",
  "80012": "A takto vše končí",
  "80013": "Dílko jest dokonáno",
  "67722": "Má milovaná Markéta",
  "26879": "Koho se mám bát?",
};

// Anglické překlady latinských textů kolofonů
export const CARD_TRANSLATIONS_EN: Record<string, string> = {
  "67741": "Amen. On the Saturday after Remigius in Prague castle. The treatise on pure conscience by Saint Thomas Aquinas, happily finished by B. provost of Litoměřice.",
  "67452": "Praise to the Three and One.",
  "67744": "I, Benedict of Waldstein, provost of Litoměřice etc., began the first lecture in the convent of Saint Dominic in Bologna on the Friday of Easter octave. Alleluia.",
  "75396": "John was his name.",
  "67595": "A red mark for the Virgin Mary.",
  "67501": "Keep this secret faithfully hidden, lest it be revealed to unworthy hands.",
  "67491": "Amen written with reverence in red dots upon this holy page.",
  "64398": "Petrarch’s secret dialogue on the contempt of the world.",
  "67500": "A mystery greater than belief itself, recorded at the end of the text.",
  "67494": "The trial alphabet traced in the quiet margins of the parchment.",
  "67731": "Franciscus wrote this volume in Florence during the cold days of advent.",
  "77579": "Scribe, put down your quill now, for the work is done.",
  "77560": "I know the truth, but dare not speak it aloud.",
  "26741": "The flourishing flowers struck through with ink.",
  "77569": "The erased mysteries of women, concealed beneath scraped parchment.",
  "63278": "The revelation recorded at the fortress of Fulštejn.",
  "75220": "Written in the jubilee year of grace.",
  "27231": "The scribe whose eyesight grew dim beneath the flickering candle.",
  "67398": "Mark, hand over the writing tablets and rest your wrist.",
  "27217": "Carefully corrected and compared at the cathedral school of Esztergom.",
  "77535": "A heartfelt prayer from Erasmus of Rotterdam.",
  "75635": "The scribe’s name woven into the decorated initial letters.",
  "79938": "Thanks be to God, inscribed within the rubricated frame.",
  "76163": "The poet composing verses in service of the King.",
  "67711": "The honourable man has departed this earthly life.",
  "78524": "Give a cup of cool wine to the thirsty writer.",
  "63437": "A small sketch drawn beside the closing prayer.",
  "77855": "Pray, dear reader, for the soul of Brother Nicholas.",
  "67450": "My beloved quill that guided me through all these folios.",
  "75381": "Finished as the dusk settles over the city of Zittau.",
  "80012": "And thus the great work reaches its end.",
  "80013": "The little book is finally completed. Thanks be to Christ.",
  "67722": "Written in memory of my beloved Margaret.",
  "26879": "The Lord is my light and my salvation; whom shall I fear?",
};

export const UI_TRANSLATIONS = {
  cs: {
    // Navigace
    nav_home: "Skriptorium",
    nav_packs: "Balíčky",
    nav_collection: "Sbírka",
    nav_trophies: "Výzvy",
    nav_profile: "Profil",

    // Horní lišta
    level: "Úroveň",
    xp: "XP",
    coins: "mincí",
    streak: "denní streak",
    day: "Den",
    settings: "Nastavení",
    sound_on: "Zvuk zapnut",
    sound_off: "Zvuk vypnut",
    language_select: "Jazyk",

    // Úvodní obrazovka
    home_kicker: "Středověké skriptorium",
    home_title: "Co dnes vydají okraje kodexů?",
    home_lead: "Otevřete novou várku hlasů písařů, stížností na bolavé ruce i slavnostních přípisů ze starých rukopisů.",
    home_daily_headline: "Denní příděl ze skriptoria",
    home_daily_sub: "Vyzvedněte si svůj denní balíček kolofonů.",
    home_challenges_headline: "Písařské výzvy dne",
    home_challenges_sub: "Splňte rychlou výzvu a získejte bonusový balíček kolofonů do pokladnice.",
    home_map_headline: "Historická mapa skriptorií a archivů",
    home_map_sub: "Kde jsou dochované středověké kodexy a kolofony dnes uloženy.",
    home_open_map: "Otevřít velkou mapu s detaily kodexů",

    // Balíčky
    packs_kicker: "Denní skriptorium",
    packs_title: "Otevření balíčků",
    daily_packs_label: "Denní balíčky",
    scribe_challenges_label: "Písařské výzvy",
    available_of: "ze",
    available_of_challenges: "z",
    available_label: "k dispozici",
    exhausted_label: "Vyčerpáno",
    pack_roman_i: "Balíček I",
    pack_roman_ii: "Balíček II",
    pack_roman_iii: "Balíček III",
    pack_opened: "Otevřen",
    challenge_success: "Splněno",
    challenge_fail: "Neúspěch",
    challenge_roman: "Výzva",
    ledger_footer: "📜 Denní dávka balíčků i výzev platí výhradně pro dnešní přihlášení a do dalších dnů se nesčítá.",
    open_pack_btn: "Rozpečetit balíček",
    bonus_vault_label: "Pokladnice bonusových balíčků",
    get_more_packs: "Získejte další balíček do pokladnice",
    challenges_subtitle: "Splňte některou ze čtyř písařských disciplín a získejte odpovídající balíček.",

    // Minihry
    game_mood_title: "Nálada písaře",
    game_mood_desc: "Odhadněte z autentického citátu a překladu rozpoložení středověkého písaře.",
    game_cipher_title: "Rozlušti šifru",
    game_cipher_desc: "Odhalte písařský kryptogram, hříčku nebo substituční šifru v kolofonu.",
    game_script_title: "Písmo a století",
    game_script_desc: "Určete paleografický typ středověkého písma a století vzniku kodexu.",
    game_paleo_title: "Paleografický přepis",
    game_paleo_desc: "Přečtěte a věrně přepište originální řádky přímo z osvětleného rukopisu.",
    play_action: "Hrát →",
    difficulty_easy: "Snadná",
    difficulty_medium: "Střední",
    difficulty_hard: "Pokročilá",
    difficulty_expert: "Mistrovská",

    // Sbírka
    collection_title: "Knihovna kodexů",
    collection_lead: "Všechny vámi dosud objevené a zachráněné kolofony z evropských archivů.",
    filter_all: "Všechny",
    filter_owned: "Pouze vlastněné",
    filter_duplicates: "Duplikáty k výměně",
    search_placeholder: "Hledat podle písaře, místa, textu...",
    copies_owned: "vlastněno ks",

    // Detail karty
    card_scribe: "Písař",
    card_place: "Místo & rok",
    card_manuscript: "Rukopis",
    card_folio: "Folio",
    card_rarity_reason: "Proč je karta",
    card_copies: "Vlastněno kopií",
    card_open_source: "Otevřít digitální rukopis v archivu",
    card_close: "Zavřít",

    // Mapa
    map_title: "Historická mapa skriptorií",
    map_eyebrow: "Písařská a univerzitní centra středověké Evropy",
    map_discovered_total: "Objeveno celkem",
    map_discovered_badge: "Objeveno",
    map_unopened_badge: "Neobjeveno",
    map_storage_header: "Uložení dochovaných fondů:",
    map_empty_state: "V této lokalitě zatím nemáte katalogizovány žádné kodexy.",

    // Profil & Spolužáci
    profile_title: "Písařský profil",
    profile_role_master: "Mistr skriptoria (Admin)",
    profile_role_scribe: "Kolega ze skriptoria",
    profile_trade: "Směna",
    profile_gift: "Darovat",
    profile_search_colleagues: "Vyhledat kolegu...",
    profile_language_setting: "Jazyk hry / Game language:",
    profile_language_note: "Změna jazyka se okamžitě projeví v celém rozhraní i na kartách.",
    profile_logout: "Odhlásit se",

    // Autentizace
    auth_login_tab: "Přihlášení",
    auth_register_tab: "Nová registrace",
    auth_title: "Vstup do Quilldrop",
    auth_lead: "Přihlaste se nebo si vytvořte bezplatný písařský účet pro přístup k denním kodexům, plnění výzev a ukládání sbírky do cloudu.",
    auth_lang_label: "Zvolte jazyk hry / Choose game language:",
    auth_lang_note: "💡 Jazyk můžete kdykoliv změnit v nastavení profilu.",
    auth_username_label: "Přezdívka / Jméno písaře",
    auth_email_label: "E-mailová adresa",
    auth_password_label: "Heslo (alespoň 6 znaků)",
    auth_login_btn: "Vstoupit do Quilldrop",
    auth_register_btn: "Vytvořit písařský účet",
    auth_google_btn: "Pokračovat přes Google",
    auth_or: "nebo",
  },
  en: {
    // Navigation
    nav_home: "Scriptorium",
    nav_packs: "Packs",
    nav_collection: "Collection",
    nav_trophies: "Challenges",
    nav_profile: "Profile",

    // Top bar
    level: "Level",
    xp: "XP",
    coins: "coins",
    streak: "day streak",
    day: "Day",
    settings: "Settings",
    sound_on: "Sound on",
    sound_off: "Sound off",
    language_select: "Language",

    // Home screen
    home_kicker: "Medieval Scriptorium",
    home_title: "What will the manuscript margins reveal today?",
    home_lead: "Uncover a fresh harvest of scribal voices, laments of weary hands, and celebratory verses from medieval codices.",
    home_daily_headline: "Daily scriptorium allowance",
    home_daily_sub: "Claim your daily pack of medieval colophons.",
    home_challenges_headline: "Daily scribal challenges",
    home_challenges_sub: "Complete a quick challenge and receive a bonus pack into your vault.",
    home_map_headline: "Historical map of scriptoria & archives",
    home_map_sub: "Discover where the surviving medieval codices and colophons are preserved today.",
    home_open_map: "Open interactive map with codex details",

    // Packs
    packs_kicker: "Daily Scriptorium",
    packs_title: "Pack Opening",
    daily_packs_label: "Daily Packs",
    scribe_challenges_label: "Scribe Challenges",
    available_of: "of",
    available_of_challenges: "of",
    available_label: "available",
    exhausted_label: "Exhausted",
    pack_roman_i: "Pack I",
    pack_roman_ii: "Pack II",
    pack_roman_iii: "Pack III",
    pack_opened: "Opened",
    challenge_success: "Completed",
    challenge_fail: "Failed",
    challenge_roman: "Challenge",
    ledger_footer: "📜 The daily allowance of packs and challenges is granted solely upon today's login and never accumulates.",
    open_pack_btn: "Unseal Pack",
    bonus_vault_label: "Bonus Pack Vault",
    get_more_packs: "Earn another pack for your vault",
    challenges_subtitle: "Master any of the four scribal disciplines to unlock an authentic bonus pack.",

    // Minigames
    game_mood_title: "Scribe's Mood",
    game_mood_desc: "Deduce the medieval scribe's emotional state from the original quote and translation.",
    game_cipher_title: "Crack the Cipher",
    game_cipher_desc: "Solve a medieval cryptogram, wordplay, or substitution cipher left in the colophon.",
    game_script_title: "Script & Century",
    game_script_desc: "Identify the palaeographical script type and the century of the manuscript.",
    game_paleo_title: "Palaeographical Transcription",
    game_paleo_desc: "Transcribe and decipher authentic Latin lines directly from the illuminated manuscript.",
    play_action: "Play →",
    difficulty_easy: "Easy",
    difficulty_medium: "Medium",
    difficulty_hard: "Advanced",
    difficulty_expert: "Master",

    // Collection
    collection_title: "Codex Library",
    collection_lead: "All authentic medieval colophons and manuscripts you have gathered from European archives.",
    filter_all: "All",
    filter_owned: "Owned only",
    filter_duplicates: "Duplicates for trade",
    search_placeholder: "Search by scribe, place, quote...",
    copies_owned: "copies owned",

    // Card detail
    card_scribe: "Scribe",
    card_place: "Place & Date",
    card_manuscript: "Manuscript",
    card_folio: "Folio",
    card_rarity_reason: "Why is this card",
    card_copies: "Copies owned",
    card_open_source: "Open digital manuscript in archive",
    card_close: "Close",

    // Map
    map_title: "Historical Map of Scriptoria",
    map_eyebrow: "Scribal and university centres of medieval Europe",
    map_discovered_total: "Discovered total",
    map_discovered_badge: "Discovered",
    map_unopened_badge: "Undiscovered",
    map_storage_header: "Storage of surviving collections:",
    map_empty_state: "No codices from this location have been catalogued in your collection yet.",

    // Profile & Classmates
    profile_title: "Scribe Profile",
    profile_role_master: "Master of Scriptorium (Admin)",
    profile_role_scribe: "Fellow Scribe",
    profile_trade: "Trade",
    profile_gift: "Gift",
    profile_search_colleagues: "Search colleague...",
    profile_language_setting: "Game Language / Jazyk hry:",
    profile_language_note: "Language changes take effect immediately throughout the application and card views.",
    profile_logout: "Log Out",

    // Authentication
    auth_login_tab: "Sign In",
    auth_register_tab: "Register New",
    auth_title: "Enter Quilldrop",
    auth_lead: "Sign in or create a free scribe account to access daily codices, complete palaeographical challenges, and save your collection to the cloud.",
    auth_lang_label: "Choose game language / Zvolte jazyk hry:",
    auth_lang_note: "💡 You can change the game language anytime in your profile settings.",
    auth_username_label: "Scribe Nickname / Display Name",
    auth_email_label: "Email Address",
    auth_password_label: "Password (at least 6 characters)",
    auth_login_btn: "Enter Quilldrop",
    auth_register_btn: "Create Scribe Account",
    auth_google_btn: "Continue with Google",
    auth_or: "or",
  },
};

export function getCardTitle(card: { id?: string | number; title?: string; title_cs?: string; title_en?: string }, lang: Language): string {
  if (lang === "cs") {
    if (card.title_cs) return card.title_cs;
    const cid = String(card.id || "");
    if (CARD_TITLES_CS[cid]) return CARD_TITLES_CS[cid];
    return card.title || "Tajemný kodex";
  } else {
    if (card.title_en) return card.title_en;
    if (card.title) return card.title;
    return "Unknown Codex";
  }
}

export function getCardTranslation(card: { id?: string | number; translation?: string; translation_cs?: string; translation_en?: string }, lang: Language): string {
  if (lang === "cs") {
    if (card.translation_cs && card.translation_cs !== "Translation pending") return card.translation_cs;
    if (card.translation && card.translation !== "Translation pending" && /[áéíóúůýčďěňřšťž]/i.test(card.translation)) {
      return card.translation;
    }
    return "Český překlad kolofonu se připravuje...";
  } else {
    if (card.translation_en && card.translation_en !== "Translation pending") return card.translation_en;
    const cid = String(card.id || "");
    if (CARD_TRANSLATIONS_EN[cid]) return CARD_TRANSLATIONS_EN[cid];
    if (card.translation && card.translation !== "Translation pending" && !/[áéíóúůýčďěňřšťž]/i.test(card.translation)) {
      return card.translation;
    }
    return "English translation of the colophon is pending...";
  }
}

export function getCardRarityReason(card: { rarityReason?: string; rarityReason_cs?: string; rarityReason_en?: string }, lang: Language): string | undefined {
  if (lang === "cs") {
    return card.rarityReason_cs || card.rarityReason;
  } else {
    return card.rarityReason_en || card.rarityReason;
  }
}
