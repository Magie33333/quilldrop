# 📜 Deník vývoje projektu Quilldrop
**Vzdělávací sběratelská karetní hra s latinskými a středověkými kolofony**

* **Zadavatel a odborná garance:** Prof. PhDr. Lucie Doležalová, Ph.D. (Filozofická fakulta Univerzity Karlovy / FHS UK)
* **Realizace:** Vojtěch Benýšek & AI párový programátor (Google Antigravity / Claude)
* **Oficiální repozitář:** https://github.com/Magie33333/quilldrop
* **Databázová a autentizační platforma:** Supabase (PostgreSQL, Auth, Row Level Security)
* **Hlavní technologie:** Next.js (App Router), React 19, TypeScript, Tailwind CSS, Vite / Vinext

---

## 📅 Záznam ze dne 22. 9. 2026 — Příprava na ostrý provoz: 3 herní disciplíny, 5 her denně se strategií rizika a 5 pokusů u přepisu

**Cíl etapy:** Připravit Quilldrop na ostrý provoz se studentskými brigádníky a hráči. Zjednodušit a sjednotit klientské rozhraní do 3 vyvážených dlaždic (odpovídajících 3 druhům balíčků), zavést denní limit 5 miniher s herním rizikem, nastavit 5 pokusů k odevzdání paleografického přepisu s okamžitou zpětnou vazbou shody a zajistit zobrazení didaktického řešení i při neúspěchu.

**Realizované úpravy:**
1. **Sjednocení herních miniher do 3 voleb ve hře (`app/page.tsx`, `app/globals.css`):**
   - V klientské části (`HomeScreen`, `PacksScreen`, prompt prázdného balíčku) nahrazeny 4 samostatné minihry 3 vyváženými volbami:
     - 🟢 **1. Nálada písaře** (Snadná, 1 pokus) → 📦 **Běžný balíček** (Standard Pack).
     - 🔵 **2. Šifry & Písmo** (Pokročilá, 1 pokus s nápovědou) → 📜 **Učencův balíček** (Scholar Pack). Z jedné dlaždice se náhodně losují kryptogramy, substituční šifry i určování duktu písma a století.
     - 🟣 **3. Paleografický mistr** (Expertní, až 5 pokusů na odevzdání) → 👑 **Královský balíček** (Masterwork Pack).
   - V administraci (`app/admin/page.tsx`) zůstávají všechny 4 režimy (`mood`, `cipher`, `script`, `transcription`) oddělené pro specializovanou autorskou tvorbu.
   - V CSS přidána třída `.game-grid-3` pro responzivní 3sloupcové rozložení na desktopu a 1 sloupec na mobilu/tabletu.
2. **Denní limit 5 her a herní riziko (`MAX_DAILY_GAMES = 5`):**
   - Hráč může za den odehrát maximálně 5 výzev. Každá odehraná hra (úspěch, neúspěch i opuštění rozehrané výzvy) odečte 1 denní hru.
   - Hráč musí zvažovat strategické riziko: zvolit jistý Běžný balíček za náladu, nebo riskovat pokus na nejtěžším paleografickém přepisu pro Královský balíček.
   - Pokud hráč zkusí opustit rozehranou minihru křížkem před odevzdáním, zobrazí se potvrzovací varování, že opuštění se započítává jako neúspěch.
3. **Systém 5 pokusů u paleografického přepisu (`app/page.tsx`):**
   - Student má až 5 pokusů k odevzdání transkripce.
   - Po každém odeslání se zobrazí grafický indikátor pokusů (`.transcription-attempts-tracker`), přesná procentuální shoda (např. *72 %*) a doporučení k úpravě zkratek a ligatur.
   - Hráč může text přímo ladit a odesílat znovu.
4. **Didaktické řešení a vysvětlení i při neúspěchu:**
   - Pokud hráč vyčerpá pokusy nebo zvolí chybnou možnost, okno se nezavře prázdné:
   - Zobrazí se červený rámeček neúspěchu a **kompletní didaktické řešení**: správný přepis z rukopisu / správná volba, český překlad i odborný komentář písaře.
   - Hráč se tak vždy poučí a minihru ukončí až ručním stiskem tlačítka *„Rozumím, zavřít výzvu“*.
5. **Přejmenování minihry na „Šifry & Písmo“:**
   - Klientská dlaždice zkrácena na úderné a jasné **„Šifry & Písmo“** (EN: *Ciphers & Scripts*). Upraveno v `HomeScreen`, `PacksScreen`, `trophies.ts`, `StudioHelpModal.tsx` i `NAVOD_PRO_BRIGADNIKY.md`.
6. **Rozšíření mapy skriptorií a diakritická normalizace (`app/data/scriptoria.ts`):**
   - Doplněna normalizace textů pro odolnost vůči diakritice a latinským tvarům (`prag`, `cuthn`, `olomuc`, `brun`, `cracov`, `wratislav`, `lipsi`, `vien`, `basil`, `paris`).
   - Přidáno 13 nových historických lokalit: Kutná Hora, Český Krumlov, Plzeň, Klášter Teplá, Kroměříž, Cheb, Hradec Králové, Broumov, Zlatá Koruna, Osek, Basilej, Paříž, Řím.
7. **Rozšíření denních mozaik o cykly 7 až 12 (bizarní a vtipné drollerie, `app/data/illuminations.ts`):**
   - Přidáno 6 nových 16dílných iluminací s autentickým historickým vysvětlením a pramenem:
     - 👹 **Cyklus 7: Titivillus – Démon písařských chyb** (sbírá písařské chyby do žoku).
     - 🐌 **Cyklus 8: Rytíř a bojový hlemýžď** (Li Livres dou Tresor, 1315).
     - 🐰 **Cyklus 9: Vražedný králík pomstitel** (Smithfield Decretals, 1340).
     - 👑 **Cyklus 10: Královské lazebnice Václava IV.** (Bible Václava IV., Praha, 1390).
     - 🦶 **Cyklus 11: Skiapod – Stínonoh s obří nohou** (Livre des merveilles, 1410).
     - 🎭 **Cyklus 12: Klášterní chiméra** (Luttrell Psalter, 1330).
   - Všechny obrazové soubory staženy do `public/illuminations/`.
   - Doplněna migrační logika pro automatické doplnění nových cyklů stávajícím uživatelům v `localStorage`.

---

## 📅 Záznam ze dne 20. 9. 2026 — Paleografická lupa 500 %, čitelnost řešení, přehled všech miniher a správa Výzev

**Realizované úpravy:**
1. **Paleografická lupa až na 500 % (`app/page.tsx`):**
   - Hranice maximálního zoomu navýšena z 400 % (4.0×) na **500 %** (5.0×) jak při scrollování kolečkem myši s vypnutým scrollem podkladu, tak při klikání na tlačítko `+` v nástrojové liště lupy.
2. **Dokonalá čitelnost písařského řešení a překladu (`app/page.tsx`, `app/globals.css`):**
   - Vyřešen problém se špatně čitelným žlutým textem na světlém pergamenu v `.game-explanation`.
   - Zaveden vysoký kontrast: tmavý písařský inkoustový text (`#1e1005` / `#2c1908`), zvýrazněný podkladový rámeček pro přepis (`.game-transcription-solution`, `#dec28c` s lemováním `#b89758`) a zřetelný styl pro překlad (`.game-translation-box`).
3. **Zkrácení položek horního menu v Quilldrop Studiu (`app/admin/page.tsx`):**
   - *„Glosy & moudra“* zkráceno na **„Glosy“**.
   - *„Iluminace & streaky“* zkráceno na **„Denní iluminace“**.
4. **Globální soupis a správa všech miniher (`app/admin/page.tsx`):**
   - Přidáno modální okno `AllMiniGamesModal` s přehledem všech `game_questions` napříč všemi kodexy.
   - Filtrování podle disciplíny (Nálada písaře, Šifra, Písmo, Paleografický přepis) i podle konkrétního rukopisu.
   - Vyhledávání podle názvu výzvy, textu, přepisu, signatury i názvu kodexu.
   - Tlačítko **Upravit v editoru**: okamžitě přepne Studio na daný rukopis, otevře vizuální vyznačení řádků (strips) a otevře editační formulář.
   - Tlačítko **+ Vytvořit minihru**: dialog s výběrem cílového rukopisu z fondu karet a volbou disciplíny, který okamžitě otevře tvůrce pro zvolený rukopis.
   - Tlačítko **Smazat**: bezpečné odstranění minihry z databáze i lokálního seznamu.
5. **Systém Výzev & Achievementů (`app/data/trophies.ts`, `app/page.tsx`, `app/admin/page.tsx`):**
   - Vytvořen samostatný datový modul `app/data/trophies.ts` se 4 stupni obtížnosti (*Lehké* 75 XP, *Střední* 200 XP, *Těžké* 400 XP, *Nemožné* 1000 XP) a 5 tematickými kategoriemi (*Sběratelství*, *Bádání & streaky*, *Paleografie & výzvy*, *Společenství*, *Tajemství & kuriozity*).
   - Herní záložka **Výzvy**:
     - Filtrování: Stav (Vše, Získané, K odemčení), Obtížnost (Lehké, Střední, Těžké, Nemožné) a Kategorie.
     - Záznam a zobrazení přesného data a času odemčení (timestamp: např. *„Získáno: 20. 9. 2026, 14:32“*).
     - Barevné medieval odznaky obtížnosti a ikonické štítky kategorií.
   - Administrační studio:
     - Přidáno tlačítko `Výzvy` do horní lišty.
     - Kompletní správce výzev `AchievementsModal` umožňující přidávat nové výzvy, editovat stávající, upravovat kritéria a hodnoty odemčení, měnit iniciály i resetovat na výchozí katalog.
6. **Bloková stavebnice podmínek Výzev a optimalizace operátorů (`app/data/trophies.ts`, `app/admin/page.tsx`):**
   - Odstraněn matoucí operátor „Maximálně (<=)“.
   - Pro 99 % výzev je nastaven automatický operátor „Alespoň (>=)“, který odpovídá logice narůstajícího postupu hráče.
   - Možnost „Přesně (=)“ ponechána selektivně pouze u domén, kde dává reálný smysl (zlaťáky pro easter eggy, procentuální přesnost transkripce, vlastní podmínka).
   - Vytvořena přehledná 4bloková stavebnice v administračním studiu s dynamickým živým lidským shrnutím podmínky v češtině v reálném čase.
7. **Kompletní aktualizace sekce miniher v Příručce editora (`app/admin/StudioHelpModal.tsx`, `docs/NAVOD_PRO_BRIGADNIKY.md`):**
   - Detailní rozepsání všech 4 herních disciplín (Nálada písaře, Rozlušti šifru, Poznej středověké písmo, Paleografický přepis) včetně výukového cíle, nastavení v editoru a balíčků odměn (Běžný, Učencův, Královský).
   - Dokumentace dvoucestné tvorby miniher: centrální správce z horní lišty vs. záložka „Písařské výzvy“ v pravém panelu u konkrétní karty.
   - Dokumentace paleografické lupy až na 1000 % pro detailní čtení duktů a ligatur.
   - Dokumentace povinného ručního potvrzení výsledku hráčem (tlačítko „Pokračovat“), aby nedocházelo k nechtěnému přeskočení didaktického řešení a komentáře novým dialogem.

---

## 📅 Záznam ze dne 14. 9. 2026 — Převod na plnohodnotnou webovou multiplatformní aplikaci (Desktop & Mobil)

**Cíl etapy:** Převést původní mobilní rozložení (430px) na plnohodnotnou multiplatformní webovou aplikaci pro studenty FF UK i veřejnost, aniž by došlo k narušení oblíbeného pergamenového vizuálu, barev rarit a luxusních animací odhalování karet.

**Realizované úpravy:**
1. **Desktopová navigace v záhlaví (`StatusBar`):**
   - Na displejích s šířkou ≥ 768px se aplikace roztáhne do kontejneru o šířce až `1200px`.
   - Mezi logo Quilldrop a statistiky (streak, puzzle, XP) byla integrována desktopová navigační lišta: *Skriptorium*, *Balíčky*, *Sbírka*, *Výzvy*, *Profil* a přímý odkaz na *Quilldrop Studio* (`/admin`).
   - Na mobilních zařízeních (< 768px) zůstává zachována spodní mobilní lišta (`bottom-nav`), která se na desktopu automaticky skryje.
2. **Responzivní mřížka sbírky (`CollectionScreen`):**
   - Karty se na desktopu automaticky škálují do 3 až 5 sloupců podle šířky okna namísto původních 2 sloupců.
   - Přidáno rychlé fulltextové vyhledávání kolofonů (podle písaře, města, textu či roku) a přepínač „Pouze vlastněné“.
3. **Přehledný 2sloupcový pult Skriptoria (`HomeScreen`):**
   - Na desktopu jsou uvítací panel a denní pečetěný balíček uspořádány vedle sebe do 2 sloupců, což působí jako skutečný stůl ve středověké dílně.
4. **Responzivní minihry (`PacksScreen`):**
   - Tři písařské výzvy (*Nálada písaře*, *Rozlušti kolofon*, *Paleografický mistr*) jsou na desktopu zarovnány vedle sebe do tří karet.
5. **Kodikologický detail karty (`CardDetail`):**
   - Na desktopu se detail otevře v přehledném 2sloupcovém modálu (vlevo velký ostrý výřez 4:3 bez deformace písma, vpravo latinská citace, český překlad a kodikologická metadata).
6. **100% zachování autentických animací a stylu z GPT work:**
   - Plný systém odhalování balíčků (`PackReveal`): napětí a třesení karet u Legendary a Unique, světelné šachty, třpytkové pole a zlaté dýchání karet zůstaly nedotčeny.

---

## 🏛️ 1. Cíl a akademický kontext projektu

Projekt **Quilldrop** vzniká jako digitální gamifikovaný nástroj pro studenty medievalistiky, latinské paleografie a kodikologie, i pro širší kulturní veřejnost. 
Cílem je proměnit autentické zápisy písařů na koncích středověkých rukopisů (**kolofony**) v herní sběratelské karty, které hráče učí:
1. Číst historická latinská písma a dešifrovat zvyklosti středověkých písařů.
2. Porozumět lidskému rozměru středověké knižní kultury (únava, stížnosti na pergamen, touha po víně, hrdost z dokončené práce).
3. Pracovat s mezinárodními vědeckými databázemi (Heurist, Manuscriptorium, univerzitní IIIF repozitáře).

---

## ⚙️ 2. Klíčová architektonická a technická rozhodnutí

### A. Architektura „Zero-Storage“ (IIIF streaming)
* **Problém:** Stahování stovek gigabajtů digitálních snímků rukopisů v tiskové kvalitě na server by bylo finančně i technicky neudržitelné a naráželo by na autorská práva.
* **Rozhodnutí:** Quilldrop ukládá v PostgreSQL databázi pouze **URL adresu snímku** na fakultním serveru (`img.scribes.ff.cuni.cz`) a **procentuální souřadnice výřezu** `(crop_x, crop_y, crop_w, crop_h)`.
* **Výsledek:** Nulové nároky na datové úložiště, okamžité načítání přímo z univerzitní sítě a plné zachování vazby na originální digitalizát.

### B. Eliminace deformace písma (Uniform Scaling)
* **Problém:** Snímky celých folií mají vertikální formát knihy (~1:1.5), zatímco hrací karta vyžaduje horizontální výřez v poměru 4:3. Původní nezávislé škálování šířky a výšky vedlo k deformaci písma, což je pro výuku paleografie nepřípustné.
* **Rozhodnutí:** V Quilldrop Studiu byl implementován algoritmus pro uniformní škálování (`Math.min(W/cropW, H/cropH)`) s jemným pergamenovým letterboxingem pro libovolné poměry ořezu.

### C. Bezpečnost a řízení přístupů (Role-Based Gate & RLS)
* **Rozhodnutí:** Využití PostgreSQL Row Level Security (RLS) v Supabase a dvoustupňové brány v administraci:
  - `admin` (Správce): Plný přístup, správa týmu, schvalování a zakládání účtů.
  - `editor` (Kurátor / Badatel): Přístup do Studia, ořez folií, úpravy překladů a tvorba miniher.
  - `player` (Hráč): Běžný uživatel, přístup pouze do herní části.
* **Opatření:** Stránka `/admin` je zabezpečena proti svévolné registraci. Nové editory z řad studentů či kolegů z fakulty může zakládat výhradně hlavní administrátor ze svého rozhraní.

---

## 📅 3. Chronologický záznam vývoje

### Záznam 1: Analýza požadavků a databázová architektura
* **Datum:** 6. září 2026
* **Provedené kroky:**
  - Důkladná analýza 1284řádkové master specifikace od prof. Lucie Doležalové.
  - Vytvoření cloudového projektu v Supabase a návrh relačního schématu (`manuscripts`, `colophons`, `cards`, `game_questions`, `profiles`, `user_cards`).
  - Napsání a úspěšné spuštění migračního skriptu (`seed-supabase.mjs`), který do nové cloudové databáze převedl prvních 30 kolofonů z univerzitního exportu Heurist.

### Záznam 2: Vývoj redakčního Studia a PowerPointového ořezávače
* **Datum:** 6.–7. září 2026
* **Provedené kroky:**
  - Vytvoření administračního prostředí **Quilldrop Studio** (`/admin`).
  - Integrace interaktivního editoru výřezů (`react-image-crop`) s 8 manipulačními úchyty ve stylu moderních grafických editorů (PowerPoint, Photoshop).
  - Vyřešení problému s CORS hlavičkami pro univerzitní servery FF UK.
  - Responzivní náhled karty 4:3 s okamžitým přepočtem souřadnic v reálném čase.
  - Přidání formuláře pro vkládání nových kolofonů (`+ Nový kolofon`) a tvorbu výukových miniher (*Nálada písaře*, *Šifra*, *Paleograf*).

### Záznam 3: Autentizace, správa týmu a bezpečnostní zámek
* **Datum:** 13. září 2026
* **Provedené kroky:**
  - Registrace prvního hlavního administrátorského účtu (`benysek.vojta`).
  - Implementace bezpečnostního uzamčení: po vytvoření správcovského účtu byl veřejný registrační formulář z `/admin` odstraněn.
  - Vývoj rozhraní **„Správa týmu“**: Administrátor může přímo v rozhraní vytvářet účty pro fakultní kolegy (zadat e-mail, vygenerovat bezpečné počáteční heslo a přiřadit roli Editora). Přihlašovací údaje lze zkopírovat jedním kliknutím.

### Záznam 4: Kontrola a schvalování změn (Vizuální diff)
* **Datum:** 13. září 2026
* **Provedené kroky:**
  - Zavedení schvalovacího dialogu při ukládání: Při kliknutí na *„Uložit změny“* systém vypočte rozdíly oproti původnímu stavu.
  - Editor vidí přehledné porovnání (původní stav červeně vs. nový stav zeleně) pro ořez folia, český překlad, název i raritu karty.
  - Odstranění rizika nechtěného přepsání dat.

### Záznam 5: Verzování a zálohování na GitHubu
* **Datum:** 13. září 2026
* **Provedené kroky:**
  - Inicializace Git repozitáře a konfigurace `.gitignore` s důrazem na ochranu přístupových klíčů.
  - Vytvoření hlavního repozitáře na GitHubu: `https://github.com/Magie33333/quilldrop`.
  - Odeslání první stabilní verze do větve `main`.

---

## 🎯 4. Aktuální stav a nejbližší plánované kroky

### Hotovo:
* [x] Relační databáze a migrace prvních 30 kolofonů
* [x] Quilldrop Studio pro ořezávání folií a editaci metadat
* [x] Správa týmu a rolí pro fakultní spolupracovníky
* [x] Kontrola a potvrzování změn před zápisem do databáze
* [x] Verzování na GitHubu a dokumentace vývoje
* [x] Propojení veřejné hry (`app/page.tsx`) se Supabase a aplikace ořezů

---

## 📅 Záznamy vývoje (Chronologický deník)

### [2026-09-13] Propojení hráčského rozhraní se Supabase & Adaptivní 4:3 ořezy
* **Propojení hráčského frontendu (`app/page.tsx`) s živou PostgreSQL databází:**
  * Hráčské balíčky, sbírka, trofeje i denní minihry nyní načítají publikované karty přímo ze Supabase (`cards` + `colophons`).
  * Pokud je uživatel offline nebo probíhá prvotní načítání, aplikace okamžitě použije lokální data (nulový výpadek, okamžitý render).
* **Adaptivní matematika výřezu rukopisů:**
  * Komponenta `ColophonImage` v herním rozhraní nyní přebírá procentuální souřadnice `(crop_x, crop_y, crop_w, crop_h)` nastavené administrátory v Quilldrop Studiu.
  * Zobrazení využívá přepočet na relativní CSS škálování (`scaleX = 100 / crop_w`, `scaleY = 100 / crop_h`), takže výřez sedí na pixel přesně ve všech velikostech (náhled karty ve sbírce, otevření balíčku i velký detail kodexu).
* **Přímý import z Heurist exportu bez stahování gigabajtů na disk:**
  * Vytvořen skript `scripts/import-to-supabase.mjs` (`npm run import:supabase`), který z analyzovaného 53 MB exportu (32 064 záznamů) přímo streamuje fakultní skeny (`img.scribes.ff.cuni.cz` a `manuscriptorium.com`) do Supabase bez zatěžování lokálního disku.
  * Do databáze bylo úspěšně synchronizováno 69 karet s reálnými skeny kodexů.
* **Indikátor univerzitní databáze:**
  * V hlavičce a profilu hráče byl přidán status badge `✦ FF UK Live`, který potvrzuje aktivní spojení s akademickou databází.

### [2026-09-13] Uniformní proporce rukopisů & Clamping okrajů výřezu
* **100% zachování proporcí rukopisů (Uniform Scaling):**
  * Nahrazeno nezávislé škálování os X a Y jednotným matematickým měřítkem `Math.min(container.w / crop.w, container.h / crop.h)` v komponentě `ColophonImage` i v Quilldrop Studiu. Středověké písmo ani knižní malby již netrpí žádnou vertikální či horizontální deformací.
* **Ukotvení okrajů (Boundary Clamping):**
  * Vyřešen problém s kolofony umístěnými na samém spodním okraji folia (např. *Written in Prague Castle* s `crop_y = 83.3%`). Původní vertikální centrování vytahovalo spodek listu nahoru a zanechávalo pod obrázkem prázdné místo.
  * Zaveden algoritmus clampingu: pokud jsou rozměry naskenovaného folia větší než rámeček karty, posun se automaticky zarovná k okraji tak, aby pod ani nad rukopisem nevznikaly prázdné pruhy.
* **Vyčištění dekorativních artefaktů v CSS:**
  * Skryt původní červený obloukový rámeček (`::before`) u reálných ilustrací rukopisů a nastaveno tmavé studiové pozadí `#16120e` pro rámeček karty v detailu. Náhled v Quilldrop Studiu a zobrazení ve hře jsou nyní stoprocentně identické.

### [2026-09-13] Přerod v multiplatformní webovou aplikaci & Tmavý styl skriptoria
* **Odstranění restrikce 430 px a přechod na plnohodnotný webový layout:**
  * Původní prototyp imitující mobilní telefon v úzkém pruhu 430 px byl kompletně přepracován na responzivní webové rozhraní (`max-w-[1360px]`).
  * Na desktopu a tabletech vznikla moderní horní navigační lišta s logem, univerzitním odznakem `✦ FF UK Live`, přepínači záložek, statistikami hráče a tlačítkem pro přímý skok do Quilldrop Studia.
  * Na mobilních zařízeních se rozhraní plynule adaptuje na čistou spodní navigační lištu optimalizovanou pro dotyk.
* **Vizuální identita „Císařské skriptorium“:**
  * Zavedena luxusní paleta temného skriptoria (tmavý ebenový pergamen `#0a0806`, zlacení `#d4af37` / `#ffd580`, rubrikovaný vermilion, lapis lazuli). Naskenované středověké kodexy v tomto prostředí působí monumentálně a autenticky.
* **Responzivní sbírka kodexů s vyhledáváním a řazením:**
  * Mřížka sbírky se nyní automaticky přizpůsobuje šířce monitoru (2 sloupce na mobilu, 3–4 na tabletu, 5–6 sloupců na desktopu).
  * Přidáno živé vyhledávání podle názvu, písaře, města, roku nebo textu kolofonu.
  * Přidáno vícekriteriální řazení (nejstarší, nejmladší, raritní váha, abecedně dle názvu či místa) a filtr vlastněných karet.
* **Dvousloupcový detail kodexu pro velké obrazovky:**
  * Modální okno detailu karty na desktopu zobrazuje v levém sloupci velký 4:3 výřez naskenovaného rukopisu (s uniformním clampingem bez deformace) a v pravém sloupci latinský text s českým překladem a kompletní kodikologickou tabulkou (signatura, folium, písař, místo vzniku, odkaz na zdroj).
* **Kompletní česká lokalizace rozhraní:**
  * Celé hráčské prostředí bylo převedeno do přirozené češtiny vhodné pro studenty i akademickou obec FF UK.

---

### [2026-09-13] Desktopový plnoobrazovkový dashboard, odstranění interních prvků a gramatická revize
* **Přechod na skutečně plnoobrazovkové webové rozhraní (Full Width):**
  * Odstraněno umělé 1200px ohraničení i šedé okraje kolem aplikace. Rozhraní se nyní plynule rozprostírá přes celou šířku a výšku monitoru (`100vw`, `100vh`), přičemž obsah je rozprostřen do vyváženého kontejneru až do `1400px`.
* **Nový bohatý dashboard na domovské obrazovce (Home Dashboard):**
  * Zcela zaplněn dříve prázdný prostor pod uvítacím panelem na velkých monitorech.
  * **Hero sekce:** Vlevo denní pečetěný balíček s voskovou pečetí a počítadlem, vpravo panel tří denních písařských výzev (*Nálada písaře*, *Rozlušti kolofon*, *Paleografický mistr*) s okamžitým spuštěním minihry a indikátorem zbývajících pokusů.
  * **Výběr z archivu (Showcase):** Zobrazení 6 nejzajímavějších vlastněných či objevovaných kolofonů v adaptivním poměru 4:3 s uniformním škálováním a okamžitým proklikem na detail karty.
  * **Sekundární sekce:** Přehled postupu 16denní iluminované mozaiky s fragmenty Učeného zajíce a upoutávka na historickou mapu skriptorií s geografickými stopami písařů.
* **Oprava české gramatiky a skloňování (Pluralizace):**
  * Vyřešena chyba „2 balíčeky“: Zavedena pomocná funkce `formatPacksCount` pro správné české skloňování (`1 balíček`, `2–4 balíčky`, `5+ balíčků`).
  * Opraveny anglické hlášky v toast notifikacích na přirozenou češtinu.
* **Oddělení veřejné hry od interních fakultních nástrojů:**
  * Odstraněn badge `✦ FF UK Live` z hlavičky aplikace.
  * Odstraněn odkaz do Quilldrop Studia (`/admin`) z horní lišty i z hráčského profilu – administrace zůstává dostupná výhradně přímým zadáním URL oprávněným editorům.
  * Vyčištěny fakultní reference v uživatelském rozhraní (např. *Student FF UK* změněn na *Mistr písař*, *Denní skriptorium FF UK* na *Denní skriptorium*).
* **Zachování autentického vizuálu:**
  * Ponechán oblíbený styl iluminovaného pergamenu, zlaté a rubínové pečetě, barevné odlišení rarit i dramatická animace otevírání balíčků s třesem balíčku, světelnými kužely a konfetami.

---

### [2026-09-14] Vizuální polish, sjednocení UI komponent, povinná autentizace a příprava na Vercel deployment
* **Sjednocení luxusních tlačítek (`.illuminated-button`):**
  * Tlačítko na domovské obrazovce i tlačítko pro otevření balíčků na stránce *Balíčky* (`PacksScreen`) mají nyní jednotný luxusní vzhled s písmem Cinzel (váha 800), zlatým lemováním (`#d7a347`), plynulým světelným reflexem (`::after` shimmer sweep) a animovanou šipkou při hoveru.
  * Zavedeny tier varianty tlačítka přesně korespondující s vybranou edicí balíčku (Standard – jantar/zlato, Scholar – královský safír, Masterwork – císařský ametyst).
* **Sjednocení písařských odznaků (`.home-pack-badge` vs. `.pack-ribbon`):**
  * Z odznaku na domovské stránce byly odstraněny nekonzistentní inline styly.
  * Styl byl stoprocentně synchronizován s páskou balíčků na stránce Balíčky (shodné barevné přechody, stínování s medieval hloubkou, typografie s uppercase letter-spacingem a vnitřní světelné linky).
* **Čistá interaktivní mapa bez licenčního vodoznaku:**
  * Přepnut podkladový dlaždicový zdroj Leaflet mapy z CartoDB (který vkládal rušivý vodoznak „API required“) na standardní otevřené OpenStreetMap dlaždice doplněné o jemný pergamenový filtr (`sepia` a teplý kontrast).
  * Ošetřena chyba `TypeError: Cannot read properties of undefined (reading '_leaflet_pos')` čistým rušením časovačů a kontrolou existence kontejneru při odhlášení či změně záložek.
* **Povinné uživatelské účty a odstranění režimu hosta:**
  * Odstraněna možnost neregistrovaného hraní (režim hosta), aby měl každý uživatel zaručeno bezpečné ukládání sbírky, postupu v mozaice a odemykání achievementů do Supabase cloudu.
  * Modální okno sjednoceno pod název **„Vstup do Quilldrop“**.
* **Sjednocení herní terminologie:**
  * Archaické slovo „Rozpečetit“ bylo napříč všemi texty, tlačítky a achievementy nahrazeno přirozeným a srozumitelným slovem **„Otevřít“** (*Otevřít balíček*, *Otevření balíčků*, *Otevřete balíček a odhalte první rukopisy*).
* **Zpřesnění a vyčištění názvů měst na mapě skriptorií:**
  * Odstraněny matoucí duplicity typu „Lipsko & Německo · Německo“ či „Vídeň & Rakousko · Rakousko“. Každé skriptorium je nyní pojmenováno čistě názvem města (Lipsko, Vídeň, Krakov), přičemž stát je uveden za tím jako země původu.
* **Příprava projektu pro bezproblémové nasazení na Vercel:**
  * Přepnuta výchozí sestavovací pipeline na nativní **Next.js 16 (Turbopack)** (`next build`), která generuje standardní `.next` adresář vyžadovaný Vercel platformou.
  * Odstraněna závislost na privátním OpenAI pluginu (`sites-vite-plugin`), který se nacházel v ignorované složce `build/` a na Vercelu by způsoboval pád sestavení.
  * Zachována plná zpětná kompatibilita pro lokální vývoj jak přes Vite (`npm run dev`), tak přes Next.js (`npm run dev:next`).

### [2026-09-14] Funkční denní streaky, 16dílná iluminovaná mozaika (Cesta písaře) & Quilldrop Studio editor se slicerem
* **Plně funkční kalendářní denní streaky a penalizace za vynechání dne:**
  * Implementována striktní logika kalendářních dní (`getDaysDifference`).
  * Každé přihlášení v bezprostředně následující den (`daysDiff === 1`) navyšuje streak o +1 a odemyká další fragment z $4 \times 4$ mřížky aktivní iluminace.
  * Pokud uživatel vynechá den či více (`daysDiff > 1`), streak je porušen – dle pravidel hráč začíná od znovu (reset streaku na Den 1 a návrat na 1. dílek). Dříve dokončené a odemčené iluminace v galerii však zůstávají natrvalo uloženy jako získané trofeje.
  * Během téhož dne (`daysDiff === 0`) se stav nemění – fragment za daný den již byl vyzvednut.
* **Koncepce odstupňované vzácnosti: Cesta písaře (Ordered Tiered Progression):**
  * Zvoleno pevně dané pořadí cyklů s eskalující prestiží a raritou (namísto nahodilého losování), které dává dlouhodobému hraní jasný cíl a odměňuje písařskou vytrvalost:
    * **Cyklus 1 (Dny 1–16, Common):** *Učený zajíc (The Learned Hare)* – autentická humorná marginálie ze žaltáře.
    * **Cyklus 2 (Dny 17–32, Uncommon):** *Písař v dílně (Scriptorium Master)* – Eadwine Psalter (12. stol., Cambridge).
    * **Cyklus 3 (Dny 33–48, Rare):** *Český královský lev (Bohemian Lion)* – Gelnhausenův kodex (14. stol., Jihlava).
    * **Cyklus 4 (Dny 49–64, Epic):** *Královská iniciála 'W'* – Bible Václava IV. (kolem 1390, ÖNB Vídeň).
    * **Cyklus 5 (Dny 65–80, Legendary):** *Nebeské sféry a astroláb (Cosmographia)* – astronomický sborník Václava IV.
    * **Cyklus 6 (Dny 81–96+, Unique):** *Podlažický ďábel (Codex Gigas)* – proslulá celostránková iluminace z největšího středověkého kodexu světa.
* **Odměny za zkompletování 16dílné mozaiky:**
  * Při dosažení 16. fragmentu je dílo slavnostně dokončeno: zapíše se do stálé `Galerie iluminací` v profilu hráče, připíše se velká odměna XP (150 až 1500 XP) a do pokladnice se vloží prémiový balíček (Standard, Scholar, Masterwork).
  * Každé zkompletované dílo lze okamžitě aktivovat jako reprezentativní kruhový portrét (avatar) písaře v profilu i na záložkách aplikace.
* **Quilldrop Studio: Správa iluminací a interaktivní 16dílný řez (Slicer preview):**
  * Do horní lišty Studia (`/admin`) přidáno tlačítko `Iluminace & mozaiky`.
  * Odborníci mohou přidávat nové rukopisy, editovat stávající cykly, přiřazovat raritní stupně, odměny a ikonografické popisy.
  * Součástí Studia je interaktivní 16dílný slicer s plynulým posuvníkem 0–16 dílků, který přímo v reálném čase demonstruje, jak bude nový obraz rozdělen na 16 očíslovaných zlacených fragmentů v mřížce $4 \times 4$.
* **Integrovaná simulace pro prezentaci:**
  * Na stránce profilu přibyly rychlé demonstrační spínače `Simulovat další den (+1 fragment)` a `Simulovat přerušení streaku (reset na Den 1)`, umožňující okamžitě předvést fungování celého systému prof. Doležalové bez nutnosti čekat 24 hodin.
* **100% lokální hosting iluminací a eliminace závislosti na externích odkazech:**
  * Všechny historické iluminace pro 6 cyklů byly staženy ve vysokém rozlišení přímo do repozitáře (`public/illuminations/`):
    * `public/illuminations/eadwine-scribe.jpg` (Eadwine Psalter, Trinity College Cambridge)
    * `public/illuminations/bohemian-lion.jpg` (Gelnhausenův kodex, Jihlava)
    * `public/illuminations/wenceslas-initial.jpg` (Bible Václava IV., ÖNB Vídeň)
    * `public/illuminations/astrolabe-spheres.jpg` (Astronomický sborník Václava IV.)
    * `public/illuminations/codex-gigas-devil.jpg` (Codex Gigas, Podlažice / Stockholm)
    * `public/illumination-rabbit.png` (Učený zajíc z marginalií)
  * Odstraněna zranitelnost vůči blokování hotlinkování z Wikimedia Commons (chyby HTTP 400 / 404).
  * Do `getStoredIlluminations()` implementována automatická migrace, která v `localStorage` klientů detekuje a nahradí staré externí URL bezpečnými lokálními cestami.
  * Přidány robustní `onError` fallbacky do komponenty `IlluminationMosaic`, profilové galerie i Studia, garantující zobrazení i při nepředvídaném výpadku.

### [2026-09-14] Interaktivní Heurist katalog v Quilldrop Studiu & 1-Click zařazování karet
* **Extrakce 3 640 digitalizovaných kolofonů z 55MB vědeckého exportu:**
  * Vytvořen skript `scripts/generate-heurist-catalog.mjs`, který z 32 064 položek Heurist exportu vyfiltroval a propojil 3 640 textových kolofonů disponujících přímými odkazy na digitalizáty:
    * 567 digitalizátů přímo z fakultního serveru FF UK (`img.scribes.ff.cuni.cz`)
    * 2 940 digitalizátů z `imagines.manuscriptorium.com`
    * desítky dalších z Lipska, Švýcarska, Drážďan, Berlína a Stanfordu
  * Vygenerován kompaktní JSON index `app/data/heuristCatalog.json`, načítaný dynamicky na vyžádání pouze v administraci (bez dopadu na rychlost hráčské aplikace).
* **Nový prohlížeč Heurist soupisu (`HeuristCatalogModal.tsx`):**
  * Plnohodnotný modální dialog s volbou mezi vědeckým katalogem a ručním zadáním.
  * **Chytré filtry a značky:**
    * `⚡ Pouze dosud nezařazené` – v reálném čase porovnává Heurist ID se Supabase a zobrazuje pouze nové dosud nezpracované kolofony.
    * `🎨 S kresbou / ilustrací` (142 kolofonů se zvířaty, figurami či ornamenty).
    * `🔴 S rubrikou / změnou barvy písma` (659 kolofonů s rubrikami).
    * Filtry zdrojových serverů (FF UK Scribes, Manuscriptorium, ostatní archivy).
    * Výběr měst (Praha, Vyšší Brod, Olomouc, Plzeň, Jihlava, Lipsko, Vídeň...).
  * **1-Click magické předvyplnění:**
    * Kliknutím na libovolný záznam se okamžitě načte fotografie folia, signatura, folio (locus), latinský text, český překlad, písař, místo vzniku a rok.
    * Systém inteligentně navrhne název karty i odpovídající raritu (Common až Epic).
    * Po stisku `Zařadit kolofon a přejít k ořezu →` se karta vytvoří v Supabase a editor je automaticky přepnut přímo do PowerPointového ořezávače 4:3 pro zaměření rámečku.
* **Zpřehlednění celkového workflow Studia:**
  * Přidáno výrazné zlaté tlačítko `+ Kolofon (Heurist)` do horní lišty i levého panelu.
  * Zobrazení poměru karet: *„X ve hře · 3 640 v Heuristu“*.

### [2026-09-15] Fáze 1: Zpřehlednění Studia, Metodická příručka pro brigádníky, Badatelský režim & Realtime detekce kolizí
* **Integrovaný metodický průvodce pro brigádníky (`StudioHelpModal.tsx`):**
  * Plnohodnotná 5kapitolová modální příručka přímo v rozhraní Studia pro nové brigádníky oslovené prof. Lucií Doležalovou:
    1. *Výběr z Heuristu* – pravidla priority serverů (FF UK vs Manuscriptorium), filtry kreseb a vyhledávací tipy.
    2. *Ořez folia (4:3)* – zásady proporcí, kompozice a zarovnání rámečku kolem kolofonu.
    3. *Překlad a data* – pravidla českého překladu, kritéria pro rarity (Common až Legendary) a správný zápis signatur/loci.
    4. *Tvorba miniher* – postupy pro kvíz nálady, šifry a vizuální transkripční pásky.
    5. *Workflow a schvalování* – vysvětlení fází Koncept (Draft) → Ke kontrole (Review) → Publikováno (Published) a pravidla kolaborace.
* **Badatelský režim v katalogu Heuristu (`HeuristCatalogModal.tsx`):**
  * **Hloubková inspekce a lupa (Deep Zoom Lightbox):** Brigádníci mohou rozkliknout jakékoliv folio na celou obrazovku s plynulým přiblížením (50 % až 400 %), posunem myší a přímým odkazem na zdrojový digitalizát.
  * **Plovoucí přepisový panel:** Umožňuje přímo při zkoumání rukopisné stránky číst a porovnávat latinský text s originálním středověkým duktem písaře.
  * **Galerie folijí (LayoutGrid) vs. Seznam (List):** Možnost přepnout na velkoformátové náhledy (200px karty) pro vizuální procházení jako v galerii umění.
  * **Hvězdičkování / Oblíbené kolofony:** Ukládání zajímavých rukopisů do oblíbených (`localStorage`) s rychlým filtrem `⭐ Oblíbené`.
  * **Výchozí stav pro nováčky:** Nově importovaný kolofon se automaticky zakládá jako `Koncept (Draft)`, aby se nedostal do ostré hry před schválením.
* **Realtime detekce kolizí a přítomnost týmu (Supabase Presence):**
  * Integrován WebSocket kanál `quilldrop-studio-presence` bez nutnosti změn v databázovém schématu.
  * **Prevence přepsání dat:** Pokud dva brigádníci či editoři otevřou stejnou kartu současně, v záhlaví pracovního plátna se okamžitě rozbliká varovný banner: *„Pozor na kolizi: Na tomto kolofonu právě pracuje [Jméno]...“* s tlačítkem pro okamžité obnovení dat ze serveru.
  * **Indikátory v levém sloupci:** U každé karty je v reálném čase vidět odznak *„👤 Upravuje: [Jméno]“*.
  * **Lobby přítomnosti týmu:** Tlačítko `🟢 Tým online (N)` v horní liště otevírá dialog se seznamem připojených badatelů, jejich rolemi a kartami, na kterých právě pracují.
* **Zpřehledněné rozvržení Studia (3 logické zóny v hlavičce):**
  * Lišta rozdělena na levou zónu (návrat do hry a název), střední zónu (akční tlačítka Heurist, Glosy, Mozaiky, Nápověda) a pravou zónu (online tým, správa rolí, profil, uložení a odhlášení).
  * Filtry v katalogu karet rozšířeny o stavy: `Vše`, `Publikováno`, `Ke kontrole` a `Koncepty` s barevnými puntíky a počty záznamů.

### [2026-09-15] Fáze 1 (Dokončení): Redesign Písařských výzev, filtry Heuristu, autorství karet & čistý layout Studia
* **Odstranění duplicity a pročištění katalogu:**
  * Z levého postranního panelu katalogu karet bylo odstraněno matoucí duplicitní tlačítko `+ Kolofon`. Hlavním a jediným tlačítkem pro import je nyní prominentní zlaté tlačítko `+ Přidat kolofon (Heurist)` v horní liště.
  * Z levého katalogu bylo odstraněno tlačítko `Šifry`, které tam bylo nadbytečné a přesunuto přímo do filtrů Heuristu.
* **Rozšířené paleografické a typologické filtry v Heurist katalogu (`HeuristCatalogModal.tsx`):**
  * Z původního exportu Heuristu byla zanalyzována a vyextrahována typologie kódů a klíčových slov:
    * `🔑 Šifry (274 digitalizátů)` – kryptogramy, substituce, tajné písmo písařů.
    * `📜 Verše (458 digitalizátů)` – metrické rýmované kolofony (hexametry, disticha).
    * `✨ Iniciály (1 188 digitalizátů)` – iluminované a kaligrafické iniciály.
    * `✒️ Změna ruky (724 digitalizátů)` – střídání písařských rukou a duktů.
    * `🎨 Kresba (284 digitalizátů)` a `🔴 Rubrika`.
  * Přidán rychlý výběr století: *14. století (do r. 1400)*, *15. století (1401–1500)* a *16. století a novější (1501+)*.
* **Kompletní redesign panelu „Písařské výzvy“ (Minigames Builder):**
  * Pravý postranní panel rozšířen na `440 px` na velkých monitorech pro vzdušné a pohodlné čtení textů.
  * **Formulář:** Původní jednořádkové inputy pro nápovědu a výklad nahrazeny vícedořádkovými textovými oblastmi (`<textarea>`) s flexibilní výškou – žádný text se již neořezává.
  * Přidán 3stupňový přepínač obtížnosti: `Snadná` (zelená), `Střední` (jantarová) a `Expert` (červená).
  * **Přehled výzev k rukopisu:** Každá minihra v seznamu nyní přehledně zobrazuje plný text nápovědy hráči (`💡 Nápověda pro hráče (Hint)`), plný odborný výklad (`📖 Paleografický vhled / odborný výklad`) a všechny možnosti odpovědi se zvýrazněnou správnou volbou.
* **Systém autorství a editorství karet (Audit Trail):**
  * Připravena databázová migrace `db/migrations/02_add_card_authors.sql` (`created_by`, `created_by_name`, `updated_by`, `updated_by_name`).
  * Automatické zaznamenání editora při uložení či importu s bezpečným fallbackem.
  * V levém katalogu přibyl odznak `✍️ [Jméno editora]`, v pravém panelu informační karta autorství s datem vytvoření a poslední úpravy.
* **Terminologie:**
  * Důsledně sjednoceno oslovení v celém projektu na **Editor**, **Redakční studio** a **Příručka editora**.

### [2026-09-15] Fáze 2: Reálné P2P darování karet (Social Trading) & 16 paleografických ocenění
* **Reálné darování a výměna karet mezi studenty (`card_gifts`):**
  * Připravena databázová migrace `db/migrations/03_add_card_gifts.sql` s vazbami na dárce, příjemce, kartu, zprávu a status (`pending`, `accepted`, `declined`).
  * **Načítání skutečných spolužáků:** V profilu se načítají reální studenti ze Supabase tabulky `profiles` (seřazeni podle streaku a XP) s elegantním fallbackem na demo tovaryše pro offline režim.
  * **Darovací pergamen (Gift Modal):**
    * Možnost zvolit příjemce a vybrat duplicitní kolofon ze sbírky (pouze karty, kde hráč vlastní 2 a více kusů).
    * Pole pro dobrovolné dobové věnování (*„Ať ti toto folio dobře poslouží při nočním bádání...“*).
    * Tlačítko *„Zpečetit a darovat (-1 ks)“* odečte 1 kus z inventáře hráče, zapíše dar do Supabase, udělí +30 XP za štědrost a automaticky odemkne trofej *Štědrý tovaryš*.
  * **Příjem daru ve skriptoriu:**
    * Pokud má hráč čekající dary, v horní části profilu se rozsvítí zlatý pergamenový banner *„Požehnání ze skriptoria“* s informací, kdo kartu poslal, a tlačítkem *„Přijmout do sbírky“* (+50 XP a triumfální fanfára).
* **Rozšíření sady trofejí a poct na 16 tematických odznaků:**
  * Původních 5 trofejí rozšířeno na plnohodnotnou sadu 16 akademických milníků:
    1. *První jiskra (Q)* – otevření 1. balíčku.
    2. *Lamač pečetí (S)* – 5 různých kolofonů.
    3. *Zkušený tovaryš (A)* – 10 různých kodexů.
    4. *Knihovník Klementina (K)* – 20 různých kodexů.
    5. *Týden ve skriptoriu (T)* – 7 dní nepřetržitého bádání v řadě.
    6. *Vytrvalý iluminátor (I)* – 16denní streak návštěvnosti.
    7. *Pražský magistr (P)* – vlastnictví 3 pražských kodexů.
    8. *Vyšebrodský mnich (V)* – kodex z kláštera Vyšší Brod.
    9. *Lamač šifer (X)* – kolofon se šifrou či kryptogramem.
    10. *Pěvec latinský (C)* – veršovaný či rýmovaný kolofon.
    11. *Zlatá iniciála (M)* – karta zdobená iluminovanou iniciálou.
    12. *Sběratel kuriozit (E)* – vzácná (Rare) nebo epická (Epic) karta.
    13. *Zlacené tajemství (G)* – unikátní monumentální kolofon (Unique).
    14. *Písařský mistr (D)* – alespoň 5 vyřešených písařských výzev.
    15. *Štědrý tovaryš (F)* – odeslání duplikátu kolegovi ve skriptoriu.
    16. *Mistr iluminátor (Z)* – složení celého 16dílného cyklu mozaiky.
  * Dynamické vyhodnocování stavu v reálném čase a ukazatel pokroku (např. *8/16 splněno*).

### [2026-09-15] Fáze 2.3, 3.4 & 4.1: Dynamické minihry, PWA mobilní instalace & zálohovací systém
* **Dynamické napojení miniher ze Supabase (`game_questions`):**
  * Otázky zadané editory ve Studiu se v reálném čase načítají ze Supabase a mají nejvyšší prioritu při losování výzev dne.
  * Otázky jsou deduplikovány a bezpečně kombinovány s `DEFAULT_QUESTIONS`, takže žádná herní kategorie nikdy nezůstane prázdná ani při offline provozu.
  * Validace vazby na karty: minihry vyžadující konkrétní rukopis jsou nabízeny pouze tehdy, pokud je karta ve stavu `published`.
  * **Systém prevence opakování (Anti-Repetition):** Do stavu hráče přibyla evidence `completedQuestionsToday`. Denní výzvy upřednostňují dosud neřešené otázky, čímž se eliminuje opakování stejné otázky v tentýž den.
  * **Ocenění Písařský mistr:** Po splnění 5 výzev se hráči automaticky odemkne a trvale uloží trofej `paleographer`.
* **PWA – Mobilní instalace na plochu telefonu (iOS & Android):**
  * Vytvořen standardizovaný soubor `public/manifest.json` i `public/manifest.webmanifest`.
  * Nastaveny ikony (vektorové SVG i 512x512 PNG), tématická středověká barva pergamenu a zlata (`#d4af37`), temné pozadí (`#161310`) a režim `standalone`.
  * Studenti na mobilních zařízeních (Safari na iOS i Chrome na Androidu) mohou hru přidat na domovskou obrazovku jedním kliknutím jako plnohodnotnou aplikaci.
* **Automatizovaný zálohovací skript databáze (`backup-db.mjs`):**
  * Vytvořen spolehlivý zálohovací skript `scripts/backup-db.mjs` napojený na npm skript `npm run backup`.
  * Skript provede kompletní export všech databázových tabulek (`cards`, `colophons`, `game_questions`, `profiles`, `user_cards`, `card_gifts`) do přehledného strukturovaného JSON snapshotu do složky `backups/quilldrop-backup-[timestamp].json` a udržuje aktuální ukazatel `backups/latest.json`.
  * Ochrana dat: historické zálohy jsou přidány do `.gitignore`, aby nezatěžovaly repozitář, zatímco lokální archiv je kdykoliv k dispozici pro obnovu v případě omylu editorů.

### [2026-09-15] Fáze 3.2: Funkční potvrzovací e-maily přes externí SMTP zdarma & HTML šablona
* **Podpora přesměrování po potvrzení e-mailu (`emailRedirectTo`):**
  * Ve volání `supabase.auth.signUp` v aplikaci (`app/page.tsx`) i v administraci (`app/admin/page.tsx`) byl přidán parametr `emailRedirectTo: window.location.origin`.
  * Potvrzovací odkaz z e-mailu tak studenta vždy spolehlivě přesměruje zpět na ostrou Vercel doménu (či do `/admin` pro redaktory), bez ohledu na to, zda byl e-mail otevřen na počítači nebo mobilním telefonu.
* **Česká středověká pergamenová e-mailová šablona:**
  * Vytvořen soubor `db/email-templates/confirm-signup.html` s luxusním pergamenovým designem, zlatým pečetním tlačítkem (`{{ .ConfirmationURL }}`) a akademickou hlavičkou pro potřeby projektu prof. Lucie Doležalové.
* **Detekce a ošetření duplicitních účtů:**
  * Implementována spolehlivá kontrola při pokusu o registraci na již existující e-mail (ošetřen standardní error i případ se zapnutým `Prevent email enumeration`, kdy Supabase vrací prázdné pole `identities: []`).
  * Uživatel dostane srozumitelnou zprávu: *„Účet s tímto e-mailem již existuje. Přihlaste se prosím svým heslem.“* a formulář se automaticky přepne do záložky Přihlášení.
* **Možnost zrušení a trvalého smazání účtu (GDPR):**
  * Připravena migrace `db/migrations/04_add_delete_account.sql` pro bezpečné vymazání uživatelských dat i z tabulky `auth.users`.
  * V profilu hráče (`ProfileScreen`) přibylo tlačítko *„Zrušit účet“* s bezpečnostním potvrzovacím dialogem, vyčištěním `localStorage` i databáze a korektním odhlášením.
  * Ve Studiu (`/admin`) v sekci *Správa týmu* přibyla možnost pro administrátora odebrat libovolného editora či člena týmu tlačítkem s košem.

### [2026-09-15] Fáze 2.2+: Bilaterální obchodování a smlouvy o směně kolofonů (Písařská směna)
* **P2P Směna kolofonů mezi studenty (Bilateral Trading):**
  * Vedle jednostranného darování duplikátů byl implementován plnohodnotný dvoustranný systém výměny karet (*„Smlouva o písařské směně“*).
  * **Tvorba návrhu směny (`TradeModal`):**
    * Dvoupanelový dialog (*„Co nabízíte“* vs. *„Co žádáte“*) s vyhledáváním, filtrem rarit a tlačítky `+` / `-` pro nastavení libovolného počtu kusů.
    * Hráč nemůže nabídnout více kusů, než kolik sám vlastní ve své sbírce.
    * Ukazatel vyváženosti smlouvy: real-time poměr (např. *2 ks dáváte ⇄ 1 ks žádáte*).
    * Možnost přiložit dobový pergamenový vzkaz / průvodní listinu.
    * Odeslání návrhu udělí hráči **+15 XP** za diplomatické vyjednávání.
  * **Posouzení příchozího návrhu (`TradeReviewModal`):**
    * Příjemci se v profilu zobrazí pergamenový banner s počtem čekajících směn a tlačítkem *„Posoudit smlouvu“*.
    * Zeleně zvýrazněné karty, které získá (+X ks) vs. červeně zvýrazněné karty, které odevzdá (-Y ks).
    * Automatická validace: systém ověří, zda hráč požadované karty skutečně vlastní.
    * Tři možnosti reakce:
      1. `✅ Přijmout směnu (+60 XP)` – provede atomickou výměnu karet v inventáři, odemkne trofej a přehraje vítěznou fanfáru.
      2. `🔄 Navrhnout protinabídku` – automaticky invertuje strany nabídky a žádosti, předvyplní stávající karty a umožní hráči provést libovolné korekce a odeslat protinávrh zpět původnímu odesílateli. Původní nabídka se označí stavem `countered`.
      3. `❌ Odmítnout` – zdvořilé zamítnutí nabídky s označením stavu `declined`.
  * **Databázové schéma (`card_trades`):**
    * Vytvořena migrace `db/migrations/05_add_card_trades.sql` a začleněna do `db/migrations/ALL_PENDING_MIGRATIONS.sql`.
    * Tabulka `card_trades` uchovává `sender_offer` a `recipient_request` jako JSONB pole, včetně řetězení protinabídek pomocí `parent_trade_id`.

### [2026-09-17] Regulace XP u obchodování (Anti-Spam 1x denně) & Úprava ekonomiky balíčků (3 balíčky, 5 výzev)
* **Ochrana proti XP spamu a farmení u obchodování a darování:**
  * Implementována striktní denní regulace: Zkušenostní body (XP) za obchodování a darování (`+15 XP` za nabídku, `+60 XP` za přijetí směny, `+30 XP` za darování, `+50 XP` za přijetí daru) lze s každým jednotlivým spolužákem/kolegou získat **pouze jednou za kalendářní den** (`dailyTradedPartners`).
  * Pokud dva hráči provedou v tentýž den více směn či darů, samotná směna karet se řádně a bezpečně uskuteční (karty se vymění), ale systém již nepřipisuje další XP.
  * Do rozhraní posouzení směny (`TradeReviewModal`) byl přidán transparentní indikátor a dynamické tlačítko: pokud byl denní limit XP s tímto kolegou vyčerpán, tlačítko zobrazuje *„Přijmout směnu (0 XP)“* spolu s vysvětlujícím pergamenovým oznámením.
  * Denní seznam zobchodovaných kolegů se automaticky resetuje každou půlnoc (`isNewDay`) nebo při simulaci dalšího dne.
* **Úprava ekonomiky karet a denních přídělů (Card Inflation Control):**
  * **Denní volné balíčky sníženy z 10 na 3 (`MAX_DAILY_PACKS = 3`):** Hráč denně odhalí 15 karet ze skriptoria namísto původních 50, což výrazně zvyšuje sběratelskou hodnotu každé karty a zabraňuje přesycení trhu duplikáty.
  * **Písařské výzvy / aktivity sníženy z 10 na 5 (`MAX_DAILY_GAMES = 5`):** Denní kvóta minihier je nastavena na 5 pokusů.
  * Denní počítadlo a tečkový LED indikátor (`daily-ledger`) byly přizpůsobeny novým hodnotám (`/3` a 3 tečky pro balíčky, `/5` a 5 teček pro výzvy).
  * Upraveny všechny související texty, toast hlášky a navigační odznaky v celé aplikaci.

### [2026-09-17] Čistý štít pro nového hráče, 5krokový úvodní tutoriál & Adresář spoluhráčů
* **Čistý štít pro nově registrované hráče (`EMPTY_PLAYER_STATE`):**
  * Vyřešeno nežádoucí dědění demo dat: Registrující se hráč již nedědí předvyplněné karty, XP ani trofeje z lokálního úložiště anonymního návštěvníka.
  * Nový hráč začíná s čistým štítem: `collection: {}` (0 karet), `xp: 0`, `trophies: []`, `coins: 50` a plným denním přídělem (3 zapečetěné balíčky k otevření a 5 písařských výzev k odehrání).
  * Všechny karty získává hráč organicky z reálných fakultních kodexů přes rozbalování balíčků nebo směnu.
* **Interaktivní úvodní tutoriál (*Zasvěcení do skriptoria*):**
  * Vytvořena komponenta `OnboardingTutorialModal` s luxusním pergamenovým rozhraním a zvukovými efekty otáčení listů.
  * 5 tematických kroků:
    1. *Vítejte ve Skriptoriu Karlovy univerzity* (historický kontext a fakultní výzkum prof. PhDr. Lucie Doležalové, Ph.D.).
    2. *Tajemství kolofonů* (význam kolofonů, 4:3 výřezy a digitalizáty).
    3. *3 denní balíčky & Cesta písaře* (denní příděl 15 karet, 6 rarit, 16dílná iluminovaná mozaika).
    4. *5 denních písařských výzev* (paleografické minihry: Nálada, Šifra a Přepis pro zisk XP a Mistrovských balíčků).
    5. *Písařská směna se spolužáky* (P2P smlouvy, protinabídky a darování).
  * Dokončení tutoriálu udělí uvítací bonus **+50 XP**, nastaví trvalý příznak `hasSeenTutorial: true` do profilu i databáze a automaticky přesměruje nováčka do záložky *Balíčky*, kde na něj čekají jeho 3 zapečetěné balíčky.
  * Do profilu přidáno tlačítko *„📜 Průvodce skriptoriem (Tutoriál)“*, které umožňuje kdykoliv průvodce znovu projít.
* **Živý adresář spoluhráčů a směna s mistrem skriptoria (`benysek.vojta`):**
  * Seznam kolegů v profilu dynamicky načítá reálné registrované uživatele ze Supabase (`profiles`).
  * Administrátoři a vyučující (např. účet `benysek.vojta`) jsou automaticky řazeni na **1. místo** se zlatým profilem a odznakem *„👑 Mistr skriptoria (Admin)“*.
  * Spolužáci ze semináře jsou označeni odznakem *„✦ Kolega ze semináře“*.
  * Do rozhraní profilu bylo integrováno okamžité **vyhledávání v kolezích** podle jména i přezdívky.
  * Hráči mohou přímo kliknout na *„⚖️ Směna“* nebo *„Darovat“* a zahájit reálnou bilaterální výměnu ukládanou do tabulek `card_trades` a `card_gifts`.
* **Vizuální redesign denního přehledu (`daily-ledger`) v otevírání balíčků:**
  * Původní drobné a osamocené 7px tečky byly nahrazeny haptickými **středověkými pečetěmi a odznaky**:
    * **Denní balíčky (3 ks):** Výrazné 32px rubínové pečetě z pečetního vosku se zlatým lemem, pečetním písmenem `Q`, jemným pulzujícím zářením a římským označením (*Balíček I, II, III*). Po otevření se pečeť zlomí na dobový pergamenový štítek s fajfkou `✓` a nápisem *Otevřen*.
    * **Písařské výzvy (5 ks):** Lazuritové rytířské medailonky (27px) v královské modři se stříbrným lemem, hvězdicí `✦` a popisem (*Výzva I až V*). Po splnění přechází do archivního stavu s fajfkou `✓` a nápisem *Hotovo*.
  * Celý pergamenový rám získal hřejivé vnitřní osvětlení, vyřezávaný sloupcový oddělovač a velká, důstojná čísla (*„3 ze 3 k dispozici“* a *„5 z 5 k dispozici“*).

### [2026-09-17] Rozlišení neúspěchu ve výzvách (✗) & Striktní pravidlo denního přihlášení (žádná kumulace)
* **Indikátor neúspěchu u písařských výzev (`dailyGamesHistory`):**
  * Do herního stavu (`GameState`) přidáno sledování průběhu jednotlivých denních her `dailyGamesHistory: ("success" | "fail")[]`.
  * Pokud hráč výzvu pokazí nebo zvolí chybnou odpověď:
    * Systém započte výsledek jako `"fail"` a odečte denní pokus.
    * V modálním okně se zobrazí jasné varování: *„✗ Výzva zmařena – pokus byl započten jako neúspěch.“*
    * V přehledu balíčků (`PacksScreen`) se medailonek dané výzvy promění v **rudý spálený žeton s křížkem** (`✗`), ohraničený přerušovanou karmínovou linkou a označený popiskem **„Neúspěch“**.
  * Při úspěšném vyřešení se zobrazí **zlatavý olivový medailonek s fajfkou** (`✓`) a popiskem **„Splněno“**.
  * Neodehrané výzvy zůstávají v zářivě královské modři (`✦`, *„Výzva I–V“*).
* **Striktní denní přihlášení bez kumulace zmeškaných dnů (No Inactive Stacking):**
  * Prověřena a zpřesněna logika denního resetu (`loadState`, `dailyReset`):
    * Denní balíčky (3 ks) a písařské výzvy (5 ks) se udělují **výhradně v den, kdy se uživatel aktivně přihlásí / vstoupí do aplikace**.
    * Pokud hráč aplikaci týden nenavštíví, balíčky za uplynulé dny se **nijak nesčítají** (nikdy nedostane $7 \times 3 = 21$ balíčků). Po přihlášení má k dispozici přesně svých 3 denní balíčky a 5 výzev pro daný den.
    * Při vynechání dne (`daysDiff > 1`) se dle pravidel okamžitě přeruší streak (návrat na Den 1 a 1. fragment mozaiky).
  * Do spodní části denního přehledu (`daily-ledger`) přidána trvalá vysvětlující pergamenová patička:
    * *„📜 Denní dávka balíčků i výzev platí výhradně pro dnešní přihlášení a do dalších dnů se nesčítá.“*

### [2026-09-17] Revize tutoriálu, dynamická mapa skriptorií a dvojjazyčný systém (🇨🇿 Čeština / 🇬🇧 English)
* **1. Úpravy a zpřesnění úvodního tutoriálu (`OnboardingTutorialModal`):**
  * **Odstranění zmínek o Heuristu:** Texty byly neutralizovány pro širokou veřejnost – odkazují na *„dlouholetou vědeckou databázi rukopisů“*.
  * **Doplnění 4. písařské disciplíny v kroku 4:** Do výčtu aktivit byla doplněna chybějící disciplína **Písmo a století** (*„Určete gotický či humanistický typ písma (bastarda, rotunda, textura) a století vzniku kodexu“*).
  * **Formulace pro širokou veřejnost:** Odstraněny interní reference na vyučující i účet `benysek.vojta`. Texty uvádějí: *„výzkum středověkých rukopisů, který vede tým prof. Lucie Doležalové“* a v profilu *„seznam dalších písařů a badatelů, se kterými můžete navázat kontakt“*.
  * **Striktně jednorázový uvítací bonus (+50 XP):** Bonus +50 XP se nováčkovi připíše výhradně jednou v životě (`!prev.hasSeenTutorial`).
  * **Omezení spouštění tutoriálu z profilu:** Tlačítko pro opětovné spuštění tutoriálu v profilu je nyní zobrazeno **pouze administrátorům** pro účely testování. Běžným hráčům se po dokončení již nenabízí.

* **2. Dynamická mapa skriptorií reagující na nalezené kodexy (`getScriptoriaWithCards`):**
  * **Reaktivní aktualizace podle sbírky:** Mapa skriptorií na domovské obrazovce i ve velkém modálním okně (`MapModal`) se automaticky a dynamicky přeskupuje podle toho, jak hráč otevírá balíčky a získává nové kodexy.
  * **Zlaté pečetní záření objevených míst:** Skriptoria, kde hráč již vlastní alespoň jeden kodex, získala zlatou voskovou pečeť s pulzující aurou (`discovered-pulse`), indikátorem `✓` a počtem objevených kodexů (`owned/total`). Místa bez vlastněných kodexů zůstávají zapečetěna ikonou `🔒`.
  * **Příprava na stovky lokalit od brigádníků:** Databáze skriptorií (`scriptoria.ts`) byla rozšířena o další středoevropská centra (Fulštejn, Vratislav/Wrocław, Třeboň, Litoměřice, Erfurt atd.). Pomocná funkce `getScriptoriaWithCards` automaticky filtruje pouze lokality, které mají v sadě reálné karty, a řadí objevená místa na první pozice.

* **3. Plnohodnotná lokalizace (🇨🇿 Čeština & 🇬🇧 English):**
  * **Výběr jazyka při registraci i přihlášení (`AuthModal`):** Hráč si přímo v uvítacím přihlašovacím okně volí preferovaný jazyk pomocí tlačítek s vlajkami (**🇨🇿 Čeština** | **🇬🇧 English**). Okno obsahuje výslovné upozornění, že volbu lze kdykoliv později změnit v profilu.
  * **Správa jazyka v profilu i horní liště:**
    * V horní liště (`StatusBar`) je trvale dostupný rychlý přepínač `🇨🇿 CZ` / `🇬🇧 EN`.
    * V profilu (`ProfileScreen`) byl přidán dedikovaný panel *„🌐 Jazyk hry a kolofonů / Game & Colophon Language“*.
    * Volba se ukládá do `localStorage` (`quilldrop-lang`).
  * **Dvojjazyčné názvy karet a překlady kolofonů (`translations.ts`):**
    * Všech 30 původních fakultních karet má kompletní české poetické názvy (např. *„Sepsáno na Pražském hradě“*, *„Chvála Trojjedinému“*, *„Zjevení na Fulštejně“*) i autentické anglické názvy.
    * Všech 30 karet má zpracované plné anglické překlady latinských textů.
    * Funkce `getCardTitle(card, lang)`, `getCardTranslation(card, lang)` a `getCardRarityReason(card, lang)` dynamicky servírují správný jazyk v celé aplikaci (detail karty, odhalování balíčků, vyhledávání ve sbírce, mapa, tutoriál).
  * **Dvojjazyčné Studio pro brigádníky a editory (`/admin`):**
    * Editační formulář karty v administrátorském Studiu byl rozšířen o pole pro český i anglický název (`title_cs`, `title_en`), překlad (`translation_cs`, `translation_en`) a důvod rarity (`rarity_reason_cs`, `rarity_reason_en`).
    * Data se ukládají do Supabase s bezpečným fallbackem.

### [2026-09-18] Gramatická revize, nová reliéfní mapa Esri, rozšíření Studia a příprava na ostrý provoz

* **1. Gramatická a stylistická revize češtiny (skloňování a terminologie):**
  * **Korektní skloňování číslovek v balíčcích:** Opraveno počítadlo zbývajících karet v odhalovacím modálu – v případě 1 karty se striktně zobrazuje *„Ještě zbývá 1 karta“* (namísto chybného tvaru *„1 karet“*), pro 2–4 karty *„karty“* a od 5 výše *„karet“*.
  * **Sjednocení textů stavu balíčků:** V denním přehledu (`daily-ledger`) nahrazeno matoucí sousloví *„k otevření“* u otevřených stavů jednotným a srozumitelným *„k dispozici“* (*„3 ze 3 k dispozici“* a *„5 z 5 k dispozici“*). U balíčku v průběhu rozbalování se zobrazuje přesné *„zbývá k otevření“*.
  * **Hřejivý jantarový styl odznaku:** Odznak vědeckého garanta a mistra skriptoria získal pergamenově zlatavý odstín (`#d97706`) ladící se středověkou pečetí.

* **2. Výměna mapových podkladů za Esri World Shaded Relief:**
  * **Trvalé odstranění vodoznaku „API KEY REQUIRED“:** Původní externí dlaždicová vrstva Carto Positron byla nahrazena vysokorychlostním otevřeným reliéfním modelem **Esri World Shaded Relief** (`server.arcgisonline.com`).
  * **Středověká vizuální estetika:** Nový podklad vykresluje autentické pohoří, údolí a geomorfologii středověké Evropy bez moderních silnic a městských popisků, čímž dokonale doplňuje pergamenové voskové pečeti skriptorií.
  * Nulová závislost na placených API klíčích a 100% stabilita v offline i univerzitních sítích.

* **3. Rozšíření redakčního Quilldrop Studia (`/admin`):**
  * **Kaskádové mazání karet ze hry:** V dolní nebezpečné zóně postranního panelu přidáno červené tlačítko **„Smazat kartu ze hry“** s bezpečnostním potvrzovacím dialogem. Při smazání systém bezpečně a čistě odstraní kartu z tabulky `cards`, navázané minihry z `game_questions`, případné dary z `card_gifts` i původní záznam z `colophons`.
  * **Odstranění nadbytečného tlačítka koše:** Z horní navigační lišty byla odstraněna duplicitní ikona koše, aby nedocházelo k nechtěnému kliknutí při ukládání změn.
  * **Trvale viditelný a editovatelný latinský text:** V editačním panelu karty byl přímo nad překlady vytvořen dedikovaný rámeček *„📜 Původní text kolofonu (latinský přepis z Heuristu)“*. Editor vidí v plné délce celý původní zápis a může z něj snadno tvořit a kontrolovat český i anglický překlad, případně opravit překlep v Heuristu.
  * **Předvyplnění v Heurist katalogu:** Při výběru digitalizátu z Heuristu se latinský text přenáší a formulář nabízí paralelní pole pro český i anglický název i překlad.

* **4. Kompletní anglická lokalizace hry (🇨🇿 Čeština / 🇬🇧 English):**
  * **Interaktivní mapa skriptorií:** Plně přeloženy všechny státy (Czech Republic, Poland, Germany, Austria atd.), popisy měst a historické anotace skriptorií.
  * **16dílné iluminace (Cesta písaře):** Kompletní anglické názvy, popisky a kodikologický komentář pro všech 6 děl (od *Urban v lázni* po *Codex Gigas*).
  * **Glosy a moudra:** Všech 12 historických glos a citátů má paralelní anglické texty, kategorie i zdrojové citace.
  * **Uživatelské hlášky a notifikace:** Všechny toasty, systémová hlášení a dialogy plynule reagují na zvolený jazyk.

* **5. Perzistence anglických polí a auditní stopa posledních úprav:**
  * **Nová databázová migrace (`db/migrations/06_add_english_card_fields.sql`):**
    * Doplnění sloupců `title_en TEXT` a `rarity_reason_en TEXT` do tabulky `cards`.
    * Migrace přidána do souhrnného souboru `ALL_PENDING_MIGRATIONS.sql`.
  * **Lokální cache s okamžitou perzistencí (`quilldrop-cards-overrides`):**
    * Implementován mechanismus lokálního ukládání a slučování změn pro `title_en`, `rarity_reason_en`, `updated_at` a `updated_by_name`.
    * Ani v případě, kdy správce ještě nespustil SQL migraci v Supabase, se zadané anglické překlady nikdy neztratí a okamžitě se propisují do Studia i do ostré hry.
  * **Oprava zápisu a zobrazení posledních úprav:**
    * Do payloadu uložení se nyní striktně předává ISO čas `updated_at` a jméno editora `updated_by_name`.
    * Ošetření chyb v databázi bylo opraveno, aby při chybějícím sloupci nemaže identitu editora.
    * V panelu metadat byl k poli *„Poslední úprava“* doplněn čas (`HH:mm`), takže editor okamžitě vidí potvrzení své práce.
  * **Odstranění technických referencí na Supabase:**
    * V profilu hráče nahrazeno *„Cloudová synchronizace: Aktivní (Supabase)“* za čisté *„Stav účtu: Aktivní“* (EN: *„Account status: Active“*).
    * V administraci nahrazeny texty tlačítek na přirozené *„Uložit do databáze“* / *„Uložit změny do databáze“*.

* **6. Příprava na ostrý provoz s brigádníky a studenty:**
  * Vytvořen ucelený metodický manuál pro nováčky: [`docs/NAVOD_PRO_BRIGADNIKY.md`](docs/NAVOD_PRO_BRIGADNIKY.md).
  * Aktualizována vestavěná příručka editora přímo v administraci (`StudioHelpModal.tsx`).
  * Provedena kontrola typů TypeScript (`npx tsc --noEmit`) s nulovým počtem chyb a úspěšně otestován ostrý Next.js produkční build (`npm run build`).

---

### Aktuální stav projektu:
* [x] **FÁZE 1: Příprava Quilldrop Studia pro brigádníky — 100 % DOKONČENO**
* [x] **FÁZE 2: Herní mechaniky, mozaika, streaky a P2P sociální směna — 100 % DOKONČENO**
* [x] **FÁZE 3: Dvojjazyčný systém (CZ/EN), autentizace a multiplatformní UI — 100 % DOKONČENO**
* [x] **FÁZE 4: Testování, bezpečnost, metodické materiály a ostrý start — PŘIPRAVENO K PROVOZU**

---

## 📅 Záznam ze dne 18. 9. 2026 — Kontrast odměn v minihrách a plná editace miniher v Quilldrop Studiu

**Cíl etapy:** Vyřešit nečitelný tmavě modrý text u odměn v minihrách a doplnit chybějící funkci úpravy (editace) již dříve vytvořených miniher v redakčním prostředí Quilldrop Studia.

**Realizované úpravy:**
1. **Oprava kontrastu a čitelnosti odměn v minihrách (`app/globals.css`):**
   - V modálech miniher (zejména v režimu Paleografický mistr `.game-paleo`) byl název odměny a její popis vykreslován tmavě modrou barvou (`var(--blue)` / `#1039a0`), která na tmavě fialovém/vínovém pozadí zcela zanikala a měla nulový kontrast.
   - Text byl přestylován na čistě bílou `#ffffff !important` s jemným text-shadow (`0 1px 3px rgba(0,0,0,0.9)`), díky čemuž je perfektně ostrý a čitelný na jakémkoliv pozadí.
   - Štítek „ODMĚNA“ upraven do teplého pergamenově-zlatého odstínu `#ffd580` s tmavým poloprůhledným zaobleným pozadím.
   - Přidány specifické kontrastní styly pro `.game-paleo .reward-banner`, `.game-cipher .reward-banner` a `.game-mood .reward-banner`.
   - Odkaz na nápovědu (*„Potřebujete nápovědu?“*) upraven z původní tmavě modré na čitelnou středověkou inkoustovou hnědo-zlatou `#854d0e` (při najetí `#b45309`).

2. **Plnohodnotná editace existujících miniher v Quilldrop Studiu (`app/admin/page.tsx`):**
   - V pravém postranním panelu Studia u každé vypsané minihry přidána ikona tužky (`Pencil`) vedle tlačítka smazání.
   - Po kliknutí na tužku se minihra načte do formuláře:
     - Režim výzvy (*Nálada písaře*, *Rozlušti šifru*, *Paleografický přepis* atd.)
     - Dvojjazyčný název (CZ/EN) a úvodní zadání (CZ/EN)
     - Možnosti odpovědí včetně ikon v češtině i angličtině
     - Správná odpověď, nápověda i odborný výklad v obou jazycích
     - Nastavená obtížnost (Snadná / Střední / Expert)
     - Cílový přepis, tolerované varianty i souřadnice vyznačených řádků (`highlight_regions`)
   - Karta editované minihry se v seznamu zvýrazní zlatým orámováním a jemnou září.
   - Hlavička formuláře jasně indikuje *„Úprava existující minihry“* a umožňuje úpravy zrušit.
   - Tlačítko uložení přepíná na *„Uložit úpravy minihry“* a provádí `supabase.from("game_questions").update(...)` s okamžitou aktualizací lokálního stavu i vizuálním potvrzením.

3. **Oprava mapování souřadnic vyznačených řádků a Paleografická lupa (`app/page.tsx`, `app/globals.css`):**
   - **Příčina neshody souřadnic:** Původní kontejner `.spotlight-wrap` měl šířku 100 % (např. 624 px) a pevnou výšku 210 px s `object-fit: contain`. Protože jsou folia vertikální (portrét ~1:1.5), snímek se vykreslil uprostřed s šířkou cca 140 px a po stranách vznikly široké černé pruhy. Překryvné SVG se však roztáhlo přes celý 624px kontejner – procenta `x` a `w` se proto počítala z černého prázdného prostoru a rámeček „přetekl“ vpravo mimo rukopis do tmy.
   - **Těsné orámování plátna (`.spotlight-stage`):** Snímek i SVG jsou nově zabaleny do samostatného elementu s `display: inline-block`, jehož rozměry jsou 100% identické s vykresleným snímkem. Tím je zaručeno, že `0..100 %` v SVG přesně odpovídá `0..100 %` rukopisu na pixel přesně jako v Quilldrop Studiu.
   - **Plnohodnotná Paleografická lupa (Zoom & Pan):**
     - Výzva se automaticky otevírá v režimu lupy se zvětšením **2,2×**, vycentrovaným přímo na vyznačené řádky textu.
     - Gotické písmo a zkratky jsou velké, ostré a perfektně čitelné pro snadný přepis.
     - Tlačítko pro rychlé přepnutí mezi **„Lupa (Zvětšit)“** a **„Celé folio (1×)“**.
     - Ovládání měřítka (`+`, `−`, zobrazení procent, reset vycentrování) i plynulý posun tažením myší / dotykem a kolečkem myši.

4. **Izolace zoomování kolečkem myši od hlavní stránky (`app/page.tsx`, `app/globals.css`):**
   - **Problém:** Při přibližování a oddalování paleografické lupy pomocí kolečka myši nad rukopisem v otevřeném okně minihry docházelo k souběžnému posouvání podkladové hlavní stránky (`mainpage`), což působilo rušivě.
   - **Technické řešení:**
     - Pro `GameModal` byl zaveden zámek scrollování těla stránky (`document.body.style.overflow = "hidden"` s automatickým obnovením při zavření).
     - Pro kontejner `.spotlight-viewport` byl nasazen nativní DOM posluchač události `wheel` s parametrem `{ passive: false }`. Tím je zaručeno, že `e.preventDefault()` a `e.stopPropagation()` spolehlivě zabrání prohlížeči v propagaci kolečka myši na pozadí.
     - V `app/globals.css` přidáno pravidlo `overscroll-behavior: contain;` pro `.modal-backdrop`, `.game-modal` i `.spotlight-viewport`.
     - Nyní se při točení kolečkem myši plynule zoomuje pouze lupa nad rukopisem a pozadí zůstává zcela nehybné.

5. **Přímé tlačítko pro uložení minihry na liště plátna (`app/admin/page.tsx`):**
   - **UX zjednodušení:** V režimu označování řádků na plátně rukopisu (`centerMode === "strips"`) bylo přímo do horní lišty vedle tlačítka *„Hotovo (Zpět na výřez)“* přidáno zlaté akční tlačítko **[ 💾 Uložit úpravy minihry ]**.
   - Editor tak po přesunutí či změně velikosti žlutého rámečku nemusí přepínat záložky v postranním panelu, ale může novou pozici řádků odeslat do Supabase jediným kliknutím přímo z pracovní plochy.
   - Souřadnice červeného kolofonu Olomouc M III 6, 363r byly v databázi přesně zkalibrovány na pixely inkoustu (`X: 44.5 %, Y: 71.5 %, Š: 33 %, V: 8.5 %`).

---

## 📅 Záznam ze dne 18. 9. 2026 (Pokračování) — Systémová oprava vertikálního posunu souřadnic v Quilldrop Studiu a dokonalé lícování

**Cíl etapy:** Trvale a systémově odstranit vertikální posun (cca 8–11 % směrem dolů), ke kterému docházelo u vyznačených řádků v minihrách oproti pozici naklikané editorem v Quilldrop Studiu (`/admin`), a provést přesnou databázovou kalibraci všech existujících karet.

**Klíčové zjištění a odhalení příčiny (Root Cause):**
- **Oříznutí kontejneru a dělení zmenšenou výškou:** V `app/admin/page.tsx` byl obalující prvek plátna definován s třídami `max-h-[calc(100vh-130px)]` a `overflow-hidden`. Při výšce obrazovky editora (kde horní navigace, lišta plátna a spodní nápověda zabírají cca 210 px) byl tento DIV vysoký pouze ~630–658 px, ačkoliv vertikální folia rukopisů (např. Olomouc M IV 2 s poměrem 1091 × 1734 px a M III 6 s poměrem 1185 × 1635 px) přirozeně vyžadovala výšku 740+ px.
- V důsledku `overflow-hidden` byla spodní část folia v administraci skrytá/oříznutá.
- V obsluze událostí `onPointerDown` a `stripDrag` (tažení myší) se výpočet prováděl proti oříznutému kontejneru:
  `clickY = ((e.clientY - rect.top) / rect.height) * 100`
  kde `rect.height` byla zmenšená výška DIVu (např. 658 px místo 742 px). Tím došlo k matematickému zkreslení a **uložení souřadnice `y` o 8–11 % vyšší**, než byla skutečná pozice textu na foliu!
- Když herní okno (`app/page.tsx`) vykreslilo nezkrácené celé folio, žlutý rámeček se podle této zkreslené hodnoty vykreslil o 8–11 % níže – přímo do prázdného spodního okraje pergamenu pod kolofonem.

**Realizované systémové opravy:**
1. **Měření přímo proti fyzickým pixelům vykresleného snímku (`app/admin/page.tsx`):**
   - Zavedena přímá reference na element obrázku: `const stripImgRef = useRef<HTMLImageElement>(null)`.
   - Všechny výpočty kliknutí i tažení myší (`onPointerDown`, `handlePointerMove`) nově striktně počítají `rect = stripImgRef.current.getBoundingClientRect()`.
   - Bounding rect obrázku přesně na setinu pixelu odpovídá viditelnému foliu bez ohledu na okolní prvky.
2. **Eliminace ořezu a deformace kontejneru (`app/admin/page.tsx`):**
   - Obalující kontejner upraven na `relative inline-block` s `line-height: 0` bez `overflow-hidden` a bez omezujícího `max-h`.
   - Výškové omezení `max-h-[calc(100vh-230px)]` bylo přesunuto přímo na element `<img>` a byl z něj odstraněn `object-contain`. Prohlížeč tak snímek přirozeně škáluje při zachování nativního poměru stran bez černých okrajů a letterboxingu.
   - Kontejner i překryvná SVG maska se těsně přimknou k hranám obrázku (`100 %` šířky a výšky plátna = `100 %` šířky a výšky rukopisu).
3. **Harmonizace stylů v herním zobrazení (`app/globals.css`, `app/page.tsx`):**
   - Z `.spotlight-stage img` odstraněn `object-fit: contain;`, takže stage i v herním okně dokonale kopíruje rozměry obrázku.
   - Zdokonaleno chování zoomování kolečkem myši: plynulý rozsah 1,0× až 4,0×, absolutní izolace od posunu hlavní stránky a automatické vrácení na celé folio při zmenšení na 1,0×.
4. **Vizuální a databázová kalibrace existujících miniher:**
    - **Olomouc M III 6, 363r** (*„Et sic est finis huius operis, sit laus et gloria Deo in altissimis“*):
      Přesné souřadnice červeného kolofonu nastaveny na `x: 44.5 %, y: 72.2 %, w: 32.0 %, h: 6.8 %`.
    - **Olomouc M IV 2, 306** (*„Na velikú noc daj mazanec a beranec / mazanecz a beranecz“*):
      Červený kolofon v notové osnově na pravé straně zkalibrován na `x: 65.0 %, y: 36.5 %, w: 27.0 %, h: 7.5 %`.
    - Vizuálně ověřeno složením SVG overlaye a výřezů ve vysokém rozlišení. Žlutý iluminovaný rámeček nyní sedí naprosto přesně na obou kartách.

---

## 📅 Záznam ze dne 18. 9. 2026 (Závěr) — 1:1 Vizuální shoda Quilldrop Studia s herní lupou a odstranění překryvu odznáčku

**Cíl etapy:** Zajistit, aby souřadnice vyznačené v administraci (`/admin`) vizuálně i matematicky na 100 % odpovídaly hernímu zobrazení (`/`), a odstranit vizuální konflikt v administraci, kde odznáček řádku přečníval do předchozího textu.

**Vyřešené detaily:**
1. **Přesun odznáčku řádku dovnitř výběru (`app/admin/page.tsx`):**
   - Původní třída `-top-5 left-0` způsobovala, že odznáček řádku `#1` přesahoval 20 px směrem nahoru nad horní hranu obdélníku.
   - Vzhledem k hustému řádkování středověkých rukopisů tak odznáček překrýval řádek černého textu těsně nad kolofonem, což vizuálně mátlo editora.
   - Odznáček byl přesunut do levého horního rohu **dovnitř** obdélníku (`top-1 left-1` s `z-10` a `pointer-events-none`), identicky jako v herní lupě. Horní hrana vyznačeného řádku je nyní zcela čistá a ostře oddělená.
2. **Přesná pixelová kalibrace Olomouc M III 6, 363r:**
   - Černý text končí přesně na `71.25 %` výšky folia.
   - Červený kolofon (*„Et sic est finis huius operis...“*) začíná na `72.11 %` a končí na `77.80 %`.
   - V databázi uloženy přesné souřadnice `x: 44.5 %, y: 72.2 %, w: 32.0 %, h: 6.8 %`.
   - V Quilldrop Studiu i v herní paleografické lupě rámeček dokonale lemuje pouze 3 červené řádky kolofonu bez jakéhokoliv dotyku černého textu nad ním.
3. **Komfortní zobrazení vysokých folií:**
   - Výškový limit obrázku v editoru nastaven na `max-h-[calc(100vh-260px)]`, čímž je zaručeno, že i na menších displejích je vidět 100 % výšky pergamenu včetně spodního okraje i panelu nápovědy bez jakéhokoliv oříznutí.

---

## 📅 Záznam ze dne 20. 9. 2026 — Zjednodušení editoru miniher: Odstranění manuální volby obtížnosti

**Cíl etapy:** Zjednodušit formulář pro tvorbu a editaci miniher v Quilldrop Studiu (`/admin`) a odstranit matoucí volbu obtížnosti (*Snadná* / *Střední* / *Expert*), protože odměny i náročnost jsou jednoznačně dány samotnou disciplínou (Nálada písaře → Běžný balíček, Šifra a Poznej písmo → Učencův balíček, Paleografický mistr → Královský balíček).

**Provedené úpravy:**
1. **Odstranění voliče z formuláře (`app/admin/page.tsx`):**
   - Z editoru miniher byla kompletně odstraněna sekce *„Obtížnost výzvy“* (tlačítka Snadná / Střední / Expert).
   - Editor ani brigádník se již nemusí zdržovat rozhodováním o obtížnosti.
2. **Automatické nastavení pro databázi:**
   - Při uložení otázky se hodnota pro sloupec `difficulty` odvodí automaticky z vybraného herního režimu (`mood` → `easy`, `cipher`/`script` → `medium`, `transcription` → `expert`), takže databázové schéma a integrita zůstávají 100% zachovány.
3. **Zpřehlednění seznamu miniher v postranním panelu:**
   - V seznamu miniher u vybrané karty byl odstraněn štítek obtížnosti, čímž se rozhraní odlehčilo a zůstaly pouze klíčové informace (typ disciplíny, jazyková lokalizace CZ/EN a akční tlačítka).

---

## 📅 Záznam ze dne 20. 9. 2026 (Pokračování) — Systém Výzev: Dynamické kategorie, vizuální builder podmínek, obrázky, lupa na 1000 % a ruční dokončení minihry

**Cíl etapy:** Zpřístupnit kompletní správu kategorií výzev, vytvořit vizuální nástroj pro definování herních podmínek výzev (s podporou více podmínek na výzvu), přidat obrázky výzev, navýšit přiblížení paleografické lupy až na 1000 % a umožnit hráči v klidu si přečíst řešení minihry s ručním odkliknutím.

**Provedené úpravy:**
1. **Správa a plné zobrazení kategorií výzev (`app/admin/page.tsx`, `app/data/trophies.ts`):**
   - Odstraněno usekávání názvů kategorií (`truncate`) – tlačítka i filtry se nyní přizpůsobují celému textu.
   - Implementován samostatný panel pro správu kategorií výzev: možnost vytvářet nové kategorie, editovat existující, mazat nepoužívané a obnovovat výchozí sadu (`DEFAULT_TROPHY_CATEGORIES`).
   - Kategorie se ukládají a načítají dynamicky v adminu i ve hře.
2. **Vizuální builder herních podmínek (Multi-podmínky & AND pravidlo):**
   - Rozšířen model podmínek o více než 20 typů pokrývajících celou herní mechaniku: sbírka karet, rarity (Legendary, Rare, Uncommon), skriptoria/města, otevřené balíčky, florény, darování karet, vyřešené minihry (transkripce, šifry, písma, nálada), použití lupy na maximum (1000 %), písařský level, celkové XP, denní streak, dílky mozaiky, přečtené glosy i noční písař (22:00–04:00).
   - V administraci vytvořeno názorné prostředí pro skládání podmínek s výběrem typu, kontextovým zadáním hodnot (čísla s jednotkami nebo výběrové seznamy) a možností přidat libovolný počet podmínek (pravidlo AND).
3. **Obrázky výzev:**
   - Výzvy nyní podporují obrázek (`image_url`) zadaný přes URL nebo nahraný přímo ze souboru (Base64).
   - V administraci je k dispozici živý náhled v písařském rámečku a miniatura v seznamu výzev.
   - Ve hře (`app/page.tsx` & `app/globals.css`) se obrázek výzvy zobrazuje ve stylovém rámečku `.trophy-image-box` (47×55 px s dvojitým zlatým lemem).
4. **Paleografická lupa na 1000 % (`app/page.tsx`):**
   - Maximální zoom navýšen z 500 % na 1000 % (`10.0`) na kolečku myši i tlačítku `+`.
   - Implementován detektor maximálního přiblížení `onLoupeMax` pro odemčení trofeje *„Ostříží zrak / Paleografický mikroskop“*.
5. **Ruční odkliknutí po dokončení minihry:**
   - Zrušeno automatické zavírání minihry přes časovač.
   - Přidáno zlaté iluminované tlačítko *„Rozumím, pokračovat k odměně →“* (nebo *„Zavřít výzvu“* při neúspěchu).
   - Případné oznámení o novém levelu (`pendingGameLevel`) je odloženo a zobrazí se až po ručním zavření minihry hráčem.

---

## 📅 Záznam ze dne 20. 9. 2026 (Závěr) — Revize a rozšíření systému výzev: 42 achievementů a kalibrace obtížností

**Cíl etapy:** Provést generální revizi všech achievementů ve hře, rozšířit nabídku na minimálně 30 výzev (vytvořeno celkem 42) a precizně nakalibrovat obtížnosti tak, aby Nemožné byly monumentální a extrémně náročné, Střední vyžadovaly reálné soustředěné úsilí a Lehké sloužily pro seznámení se hrou.

**Provedené úpravy:**
1. **Rozšíření na 42 plnohodnotných výzev (`app/data/trophies.ts`):**
   - 🟢 **Lehká (12 výzev, 75–100 XP):** První balíček, 5 a 10 karet, první minihra, iniciála, verše, lupa na 1000 %, noční bádání, první dar, 100 zlaťáků, Level 3, odemknutí 3 glos.
   - 🔵 **Střední (13 výzev, 200–250 XP):** 25 unikátních kodexů, 7denní streak, 3 vzácné (Rare+) karty, 1 Epická karta, 5 kodexů z Prahy, kodexy ze 3 různých lokalit, 15 splněných miniher, 5 transkripcí, 5 určení písem, Level 8, 500 zlaťáků, 15 balíčků, 5 darovaných karet.
   - 🟣 **Těžká (11 výzev, 400–500 XP):** 45 unikátních kodexů, 3 Epické/Legendární karty, nalezení Unikátní (Unique) památky, 30denní streak, 35 splněných miniher, 2 nalezené šifry, Level 15, 1 500 zlaťáků, 40 balíčků, 2 kodexy z Vyššího Brodu, 100% dokonalý přepis.
   - 🔴 **Nemožná (6 výzev, 1000–1500 XP):**
     - *Legenda skriptorií:* 60+ kodexů + 5 Legendárních/Unikátních karet (1 500 XP).
     - *Sto dní u pultu:* 100 dní nepřetržitého každodenního bádání / streak 100 (1 500 XP).
     - *Kronikář věků:* Level 30 + 5 000 celkových XP (1 200 XP).
     - *Královský paleograf:* 75 vyřešených miniher (1 200 XP).
     - *Opatský pokladník:* 5 000 zlaťáků v pokladnici + 50 otevřených balíčků (1 000 XP).
     - *Velmistr iluminací:* složená celá 16dílná mozaika + Level 20 (1 000 XP).
2. **Technická optimalizace vyhodnocování (`evaluateCondition`):**
   - Zpřesněno počítání sbírky na pouze reálně vlastněné karty (`count > 0`).
   - Podpora kombinovaných dotazů na rarity (`LegendaryOrUnique`, `EpicOrHigher`, `RareOrHigher`).
   - Přesný výpočet úrovně hráče i z celkových zkušeností (`Math.floor(xp / 100) + 1`).
   - Dynamické sloučení nových výchozích výzev do stávajícího `localStorage` v `getStoredTrophies()`.

---

## 📅 Záznam ze dne 20. 9. 2026 (Dodatek) — Revize a zpřehlednění systému podmínek v administraci

**Cíl etapy:** Zpřístupnit transparentní a intuitivní definování podmínek u výzev v administraci (`/admin`). Vyřešit nemožnost volby konkrétní rarity u počtu karet, přidat podporu pro kombinace (např. *„buď 5 legendárních nebo 5 unikátních“*) a zavést živý lidský souhrn pravidla v reálném čase.

**Provedené úpravy:**
1. **Explicitní volba rarit a kombinací (`app/data/trophies.ts`, `app/admin/page.tsx`):**
   - U podmínky `rarity_count` („Počet karet určité rarity“) přibyl dedikovaný výběr požadované rarity / kombinace:
     - 👑 *Legendární nebo Unikátní (součet obou nejvyšších rarit)*
     - 🟡 *Buď alespoň N Legendárních, NEBO alespoň N Unikátních* (přesné pokrytí požadavku na buď/nebo)
     - ✨ *Epická a vyšší (Epic, Legendary, Unique)*
     - 💎 *Vzácná a vyšší (Rare, Epic, Legendary, Unique)*
     - Jednotlivé samostatné rarity (*Unique*, *Legendary*, *Epic*, *Rare*, *Uncommon*, *Common*).
   - Vedle volby rarity je k dispozici samostatné pole pro počet karet s jednotkou.
2. **Přehledné rozdělení vstupů dle typu podmínky:**
   - Každá podmínka má jasně oddělený výběr cíle/upřesnění (`target`) a číselnou hodnotu (`value`) s jednotkou.
   - U automatických událostí (lupa na 1000 %, noční bádání, vlastnictví iniciály/veršů) se zobrazuje vysvětlující štítek namísto prázdných polí.
3. **Živý lidský souhrn podmínky (`formatConditionHuman`):**
   - Přímo v každé kartě podmínky se v reálném čase generuje zvýrazněná věta v češtině (např. *„💡 Hráč musí: Vlastnit buď alespoň 5 Legendárních, NEBO alespoň 5 Unikátních karet“*).
   - Editor tak okamžitě vidí, jak systém zadané pravidlo chápe a vyhodnocuje.

---

## 📅 Záznam ze dne 20. 9. 2026 (Dodatek 2) — Modulární bloková stavebnice podmínek výzev

**Cíl etapy:** Přetvořit nastavování podmínek na modulární stavebnici ze 4 bloků (Doména -> Operátor [≥, =, ≤] -> Hodnota -> Filtr/Cíl) s univerzálním vyhodnocováním a živým lidským shrnutím.

**Provedené úpravy:**
1. **Modulární architektura podmínek (`app/data/trophies.ts`):**
   - Rozšířen typ `TrophyCondition` a `TROPHY_CONDITION_META` o podporu operátoru `has_operator` a `TROPHY_OPERATOR_OPTIONS` (`>=`, `==`, `<=`).
   - Zavedena univerzální porovnávací logika `compareValues(actual, target, operator)` v `evaluateCondition`.
   - `formatConditionHuman` dynamicky skládá přirozené české věty s ohledem na zvolený operátor (*„Alespoň X...“*, *„Přesně X...“*, *„Maximálně X...“*).
2. **Nové rozhraní v administraci (`app/admin/page.tsx`):**
   - Karty podmínek v editoru výzev byly přeuspořádány do logické stavebnice:
     - **Blok 1 (Doména pravidla):** Výběr toho, co se sleduje (Karty, Minihry, Balíčky, Úroveň, Zlaťáky...).
     - **Blok 2 (Operátor množství):** Rychlé přepínací tlačítka `≥ Alespoň`, `= Přesně`, `≤ Maximálně`.
     - **Blok 3 (Počet / Hodnota):** Číselný vstup s automatickou jednotkou.
     - **Blok 4 (Filtr / Cíl):** Výběr rarity, módu minihry, lokality nebo signatury.
     - **Živé shrnutí:** Panel `💡 Hráč musí: ...` aktualizující se při každé změně.
3. **Ověření:**
   - Produkční build Next.js proběhl s kódem 0 bez chyb.

---

## 📅 Záznam ze dne 20. 9. 2026 (Dodatek 3) — Zjednodušení operátorů a aktualizace příručky editora

**Cíl etapy:** Odstranit operátor „Maximálně (≤)“, ponechat volbu „Přesně (=)“ pouze u domén, kde má logický smysl (zlaťáky, přesnost přepisu v %), a reflektovat veškeré novinky v příručkách pro editory.

**Provedené úpravy:**
1. **Vyčištění a zpřesnění operátorů (`app/data/trophies.ts`):**
   - Odstraněn operátor `Maximálně (<=)` z `TROPHY_OPERATOR_OPTIONS`, `formatConditionHuman` a `compareValues`.
   - `has_operator` ponechán na `true` pouze pro:
     - `player_coins` (množství zlaťáků v pokladnici – např. pro easter eggy typu přesně 777 zlaťáků)
     - `transcription_accuracy` (přesnost paleografického přepisu v %)
     - `custom` (vlastní specifické podmínky)
   - U všech ostatních domén (karty, balíčky, minihry, streaky, levely, XP...) je operátor skryt a automaticky nastaven na výchozí `Alespoň (>=)`.
2. **Aktualizace vestavěné příručky v administraci (`app/admin/StudioHelpModal.tsx`):**
   - Přidána nová samostatná záložka **„5. Výzvy & Achievementy“** s detailním vysvětlením modulární blokové stavebnice, významu živého shrnutí a doporučeným vyvážením 4 stupňů obtížností (Lehká 75–100 XP, Střední 200–250 XP, Těžká 400–500 XP, Nemožná 1000–1500 XP).
   - Aktualizována záložka **„4. Tvorba miniher“** s informacemi o centrální správě miniher z horního menu administrace, nových pravidlech odměn (balíčky za disciplíny) a paleografické lupě na 1000 % s ručním potvrzením.
3. **Aktualizace dokumentace pro brigádníky (`docs/NAVOD_PRO_BRIGADNIKY.md`):**
   - Do manuálu přidána samostatná kapitola **„6. Tvorba a správa Výzev (Achievementů)“** a aktualizována sekce miniher.
4. **Ověření:**
   - Produkční build Next.js proběhl s kódem 0 bez chyb.

---

## 📅 Záznam ze dne 24. 9. 2026 — Osobní písařské motto (vlastní kolofon na profilu hráče)

**Cíl etapy:** Umožnit každému hráči kromě složených iluminací nastavit si také své osobní písařské motto (vlastní kolofon) z karet, které reálně získal do sbírky, a toto motto prezentovat na profilu i v seznamu kolegů ve skriptoriu.

**Provedené úpravy:**
1. **Databázové rozšíření a migrace (`db/migrations/09_add_profile_motto.sql`, `ALL_PENDING_MIGRATIONS.sql`, `db/supabase-schema.sql`):**
   - Přidán sloupec `motto_card_id TEXT` do tabulky `public.profiles`.
   - Zahrnuto do souhrnné migrace a hlavního schématu databáze.
2. **Herní stav a synchronizace (`app/page.tsx`):**
   - Do `GameState` i `UserProfile` přidáno `mottoCardId?: string | number | null`.
   - Hodnota se automaticky ukládá do lokálního podepsaného stavu (`localStorage`) i do cloudu Supabase (`profiles.motto_card_id`).
   - Seznam kolegů (`colleagues`) načítá `motto_card_id` v reálném čase.
3. **Výběr motta v detailu karty (`CardDetail`):**
   - Do modálu karty přibylo interaktivní pergamenové tlačítko:
     - Pokud hráč kartu vlastní (`count > 0`), může stiskem **[ 📜 Zvolit jako osobní kolofon na profilu ]** nastavit kolofon jako své motto.
     - Pokud je již karta vybrána, tlačítko má aktivní zelený stav **[ ✓ Váš aktivní osobní kolofon (Klepnutím odebrat) ]**.
     - Pokud hráč kartu dosud nezískal (`count === 0`), zobrazí se jemné vysvětlení, že kartu je třeba nejprve získat.
   - Výběr i odebrání doprovází autentický zvuk škrábání husího brku (`playQuillScratch`) a vizuální toast notifikace.
4. **Zobrazení motta na profilu (`ProfileScreen`):**
   - Na profilu hráče nahrazen statický citát dynamickým pergamenovým panelem:
     - Zobrazuje latinský citát, překlad, jméno písaře, rok, lokalitu a signaturu rukopisu vybrané karty spolu s odznakem rarity a možností odebrání.
     - Pokud hráč ještě žádný kolofon nezvolil, zobrazuje se výchozí tradiční písařský povzdech s tipem na výběr motta ve Sbírce.
5. **Prezentace motta v seznamu spolužáků:**
   - U kolegů ve skriptoriu se pod jménem a streaked zobrazuje jejich nastavené písařské motto s ikonou pergamenu, takže studenti vidí, jaké kolofony si jejich spolužáci vybrali.
