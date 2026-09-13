# 📜 Deník vývoje projektu Quilldrop
**Vzdělávací sběratelská karetní hra s latinskými a středověkými kolofony**

* **Zadavatel a odborná garance:** Prof. PhDr. Lucie Doležalová, Ph.D. (Filozofická fakulta Univerzity Karlovy / FHS UK)
* **Realizace:** Vojtěch Benýšek & AI párový programátor (Google Antigravity / Claude)
* **Oficiální repozitář:** https://github.com/Magie33333/quilldrop
* **Databázová a autentizační platforma:** Supabase (PostgreSQL, Auth, Row Level Security)
* **Hlavní technologie:** Next.js (App Router), React 19, TypeScript, Tailwind CSS, Vite / Vinext

---

## 📅 Záznam ze dne 14. 9. 2026 — Návrat k původnímu pergamenovému vizuálu (GPT work) se zachováním funkčních oprav

**Rozhodnutí:** Pokusy o radikální grafické přepracování (tmavé skriptorium i hybridní žlutobílý režim) narušily jednotnou atmosféru a rozbily provázanost vizuálních prvků a animací. Na žádost uživatele byl proveden návrat k původnímu, ucelenému a funkčnímu designu vytvořenému v rámci GPT work (`72b0adf`).

**Stav a zachované funkční opravy:**
1. **Původní pergamenový vizuál a barevná paleta:**
   - Obnoven kompletní stylesheet `app/globals.css` s autentickými středověkými pergamenovými odstíny (`--parchment: #edd8b1`, `--light: #f4e5c6`, `--brown: #935803`, `--blue: #1039a0`, `--red: #b84732`, `--gold: #c89a2b`).
   - Obnoveny původní barvy rarit a stínování karet ve sbírce i v balíčcích.
2. **Obnovení všech animací:**
   - Plný systém odhalování balíčku (`PackReveal`): animace napětí (`.is-tension`) pro Legendary a Unique karty, třesení karty před odhalením, částicové pole (`.particle-field`), exploze třpytek (`.glitter-storm`), světelné šachty (`.light-shafts`), paprsky rarity (`.rarity-burst`), záblesk obrazovky (`.reveal-flash`) a zlaté dýchání (`unique-breathe`).
   - Původní vosková pečeť s rotací a pulzací.
3. **Plně zachované funkční opravy a integrace:**
   - **Supabase live data:** Živé stahování publikovaných karet a kolofonů přímo z univerzitního PostgreSQL cloudu s fallbackem na lokální archiv.
   - **ColophonImage bez deformace:** Uniformní škálování `Math.min(container.w / crop.w, container.h / crop.h)` a boundary clamping na všech okrajích (eliminace bílých/prázdných mezer pod spodními ořezy).
   - **Quilldrop Studio:** Plnohodnotné rozhraní pro editory na `/admin` pro ořezávání a schvalování rukopisů z FF UK.
   - **Opravená metadata:** Čeština v titulku a `lang="cs"`.

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

### Následující kroky (Fáze 2):
* [ ] **Napojení dynamických miniher ze Supabase (`game_questions`):**
  * Propojit minihry s reálnými otázkami vytvořenými k jednotlivým kodexům v administraci.
* [ ] **Interaktivní mapa evropských skriptorií:**
  * Nahradit provizorní mapu skutečnou interaktivní mapou historické Evropy s lokalitami ze záznamů (Praha, Olomouc, Bologna, Heidelberg, Krakov atd.).
* [ ] **Synchronizace hráčského profilu a inventáře do Supabase:**
  * Propojit herní postup s tabulkami `profiles` a `user_cards` v Supabase.

