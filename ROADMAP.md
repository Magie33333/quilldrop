# 📜 Quilldrop — Plán dokončení do plné verze (Týdenní Master Checklist)

Tento dokument slouží jako **hlavní akční plán a odškrtávací seznam** pro dokončení plné verze (v1.0) hry **Quilldrop**. 

Plán je časově dimenzován na **horizont 7 dnů**, aby bylo redakční i herní prostředí 100% připravené pro brigádníky a studenty oslovené prof. PhDr. Lucií Doležalovou, Ph.D.

---

## 🎯 Hlavní časový cíl (Týdenní milník)
* **Dny 1–3:** Kompletní příprava redakčního Studia pro brigádníky (hladký nástup, správa účtů, uživatelská přívětivost, stavy karet).
* **Dny 3–5:** Dokončení zbývajících herních mechanik (P2P darování duplikátů, dynamické minihry, rozšíření trofejí).
* **Dny 5–6:** Produkční zabezpečení a infrastruktura (registrace bez e-mailových limitů, Google OAuth, PWA instalace).
* **Den 7:** Zátěžové testování, zálohy a oficiální předání brigádníkům.

---

## 📋 Odškrtávací kontrolní seznam (Checklist)

### FÁZE 1: Příprava Quilldrop Studia pro brigádníky (Nejvyšší priorita)
*Cíl: Brigádník se přihlásí, dostane jasný návod a může okamžitě zpracovávat kolofony z Heuristu bez rizika poškození dat.*

- [x] **1.1. Heurist katalog přímo ve Studiu (3 640 digitalizátů):**
  - [x] Extrakce digitalizátů z 55MB exportu do lehkého indexu.
  - [x] Filtry podle serverů (FF UK Scribes, Manuscriptorium), kreseb a rubrik.
  - [x] Filtr *„Pouze dosud nezařazené“* (vylučuje duplicity).
  - [x] 1-Click předvyplnění všech metadat z Heuristu a přechod do ořezávače.
- [x] **1.2. Řízení workflow a stavů karet (Draft → Review → Published):**
  - [x] Přepínač stavu karty ve Studiu i katalogu (`Koncept / Draft`, `Ke kontrole / Review`, `Publikováno / Published`).
  - [x] Filtrování v levém sloupci podle stavu (Vše, Publikováno, Ke kontrole, Koncepty).
  - [x] Vizuální barevné odznaky stavu u každé karty (zelená, modrá, žlutá).
  - [x] **Real-time detekce kolizí (Supabase Presence):** Upozornění v reálném čase, pokud na stejné kartě zrovna pracuje jiný badatel, s varovným bannerem a ochranou proti přepsání.
- [x] **1.3. Správa týmu a generování účtů pro brigádníky:**
  - [x] Správa uživatelských účtů a rolí (`admin`, `editor`).
  - [x] 1-Click generátor přístupových údajů a hesel s tlačítkem pro zkopírování do schránky.
  - [x] Realtime přehled přítomnosti týmu (kdo je online a jakou kartu zrovna edituje).
- [x] **1.4. Integrovaný metodický průvodce pro brigádníky přímo ve Studiu:**
  - [x] Modální příručka (*Metodika & Nápověda*) s 5 kapitolami podle pokynů prof. Lucie Doležalové:
    - *Výběr z Heuristu* (servery, vizuální znaky, tipy pro vyhledávání).
    - *Ořez folia (4:3)* (zarovnání a měřítko bez deformace).
    - *Překlad a data* (české překlady, odůvodnění rarit).
    - *Tvorba miniher* (nálada, šifry, vizuální přepis řádků).
    - *Workflow a schvalování* (Draft → Review → Published + pravidla kolizí).
- [x] **1.5. Badatelský režim v Heurist katalogu:**
  - [x] Interaktivní lupa a lightbox s plynulým zoomem (50% až 400%) a posunem.
  - [x] Plovoucí přepisový panel pro porovnání latinského textu s rukopisem in-situ.
  - [x] Galerie folijí (Grid View) vs. kompaktní seznam (List View).
  - [x] Systém hvězdiček / oblíbených kolofonů s trvalým uložením.

---

### FÁZE 2: Herní mechaniky a sociální funkce
*Cíl: Hra působí živě, studenti mohou spolupracovat a mají dlouhodobou motivaci.*

- [x] **2.1. Základní herní smyčka (Game Loop):**
  - [x] Otevírání balíčků s luxusními animacemi a pergamenovým odhalováním.
  - [x] 16dílná iluminovaná mozaika (Cesta písaře, 6 cyklů od Urbana po Codex Gigas).
  - [x] Striktní kalendářní denní streaky (penalizace za vynechání dne s resetem na Den 1).
  - [x] Lokální hosting všech iluminací (100% offline spolehlivost).
- [x] **2.2. Reálné darování a výměna karet (P2P Social Trading):**
  - [x] Vyhledávání studentů a spolužáků ze semináře podle jména či e-mailu z tabulky `profiles`.
  - [x] Zavedeny tabulky `card_gifts` a `card_trades` v Supabase.
  - [x] Bilaterální smlouvy o směně (nabídka vs. požadavek), možnost protinabídky (counter-offer) a přímé darování duplikátů.
  - [x] Příjemci se při přihlášení zobrazí dárkový pergamen: *„Kolega [Jméno] ti daroval kolofon!“*.
- [x] **2.3. Dynamické napojení miniher ze Supabase:**
  - [x] Minihry (*Nálada písaře*, *Rozlušti kolofon*, *Paleografický přepis*) jsou dynamicky napojeny na tabulku `game_questions`.
  - [x] Autorské otázky editorů vytvořené v Quilldrop Studiu mají ve hře přednost před statickými výchozími daty.
- [x] **2.4. Rozšíření sady trofejí a ocenění (Achievements):**
  - [x] Sledování herních úspěchů, XP odměn a zápis splněných trofejí do profilu i cloudu.
- [x] **2.5. Nastavení zvuku (Přepínač Mute):**
  - [x] Tlačítko pro okamžité vypnutí/zapnutí zvuku s trvalým uložením volby v `localStorage` (`audio.ts`).

---

### FÁZE 3: Lokalizace, autentizace a produkční nastavení cloudu
*Cíl: Hladká registrace studentů a plnohodnotný dvojjazyčný provoz pro tuzemské i zahraniční uživatele.*

- [x] **3.1. Propojení s Vercel hostingem:**
  - [x] Build pipeline připravená na Next.js 16 (Turbopack).
  - [x] Klíče Supabase zadány v Environment Variables na Vercelu.
- [x] **3.2. Rychlé přihlášení a správa hesel bez e-mailových limitů:**
  - [x] V administrátorském Studiu zabudován 1-Click generátor přihlašovacích údajů a hesel pro brigádníky.
  - [x] V Supabase Dashboardu lze provozovat přímé přihlašování bez čekání na potvrzovací linky.
- [x] **3.3. Dvojjazyčný systém (🇨🇿 Čeština / 🇬🇧 English):**
  - [x] Kompletní překlad hry (mapa skriptorií, 16dílné iluminace, glosy a moudra, herní rozhraní i toasty).
  - [x] Přepínač jazyka v přihlašovacím okně, záhlaví i profilu hráče.
- [x] **3.4. PWA – Podpora mobilních zařízení a instalace na plochu:**
  - [x] Responzivní multiplatformní design (1200px desktop vs. 430px mobilní lišta).

---

### FÁZE 4: Bezpečnost, redakční workflow a ostrý start s brigádníky
*Cíl: Data z Heuristu i práce brigádníků jsou v bezpečí, editoři mají jasný návod.*

- [x] **4.1. Správa databáze, migrace a lokální fallback:**
  - [x] Zkompletován soubor `db/migrations/ALL_PENDING_MIGRATIONS.sql` (včetně migrací 02–06).
  - [x] Zaveden persistentní lokální cache `quilldrop-cards-overrides` pro garanci, že anglické texty a důvody rarity se nikdy neztratí ani před spuštěním SQL v Supabase.
- [x] **4.2. Bezpečné redakční Studio:**
  - [x] Kaskádové mazání karet v nebezpečné zóně s potvrzovacím dialogem.
  - [x] Trvale zobrazený a editovatelný latinský text z Heuristu pro kontrolu originálu.
  - [x] Real-time detekce kolizí editorů (Supabase Presence).
  - [x] Přesná auditní stopa (`updated_at`, `updated_by_name`).
- [x] **4.3. Metodické materiály a manuály pro brigádníky:**
  - [x] Vestavěná 5kapitolová příručka editora přímo v modálu administrace (`StudioHelpModal.tsx`).
  - [x] Samostatný podrobný návod v repozitáři: [`docs/NAVOD_PRO_BRIGADNIKY.md`](docs/NAVOD_PRO_BRIGADNIKY.md).
- [x] **4.4. Kontrola a testy:**
  - [x] Úspěšná TypeScript typová kontrola (`npx tsc --noEmit`).
  - [x] Úspěšný ostrý produkční build (`npm run build`).
