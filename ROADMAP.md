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
- [ ] **2.2. Reálné darování a výměna karet (P2P Social Trading):**
  - [ ] Nahradit statické ukázky v profilu (`BeatriceWrites`, `theo.history`) skutečnými spolužáky:
    - Vyhledávání studentů podle přezdívky / e-mailu z tabulky `profiles`.
    - Tabulka `card_gifts` / `trades` v Supabase.
    - Odeslání duplicitní karty převede 1 kus z inventáře dárce příjemci.
    - Příjemci se při přihlášení zobrazí dárkový pergamen: *„Kolega [Jméno] ti daroval kolofon!“*.
- [ ] **2.3. Dynamické napojení miniher ze Supabase:**
  - [ ] Propojit minihry (*Nálada písaře*, *Rozlušti kolofon*, *Paleografický přepis*) s tabulkou `game_questions`.
  - [ ] Zabezpečit náhodné střídání otázek a zabránit opakování stejné otázky v tentýž den.
- [ ] **2.4. Rozšíření sady trofejí a ocenění (Achievements):**
  - [ ] Rozšířit stávajících 5 trofejí na sadu 15–20 tematických odznaků:
    - *Knihovník Klementina* (vlastnit 10 pražských kodexů)
    - *Vyšebrodský badatel* (vlastnit 5 kodexů z Vyššího Brodu)
    - *Mistr iluminátor* (dokončit všech 6 cyklů mozaiky)
    - *Štědrý tovaryš* (darovat 5 karet kolegům)
    - *Paleografický mistr* (úspěšně přepsat 10 zlomků textu)
- [ ] **2.5. Nastavení zvuku (Přepínač Mute):**
  - [ ] Přidat do profilu / záhlaví jednoduché tlačítko pro vypnutí/zapnutí zvuku (pro studenty hrající v tiché studovně).

---

### FÁZE 3: Autentizace, e-maily a produkční nastavení cloudu
*Cíl: Hladká registrace desítek až stovek studentů bez zasekávání na limitech.*

- [x] **3.1. Propojení s Vercel hostingem:**
  - [x] Build pipeline připravená na Next.js 16 (Turbopack).
  - [x] Klíče Supabase zadány v Environment Variables na Vercelu.
- [ ] **3.2. Vyřešení e-mailového limitu Supabase:**
  - [ ] *Doporučeno pro okamžitý start:* V Supabase Dashboardu (**Authentication → Providers → Email**) vypnout volbu *„Confirm email“*. Studenti se zaregistrují a okamžitě hrají bez čekání na potvrzovací link.
- [ ] **3.3. Přihlašování přes Google (Google OAuth):**
  - [ ] Zprovoznit přihlášení jedním kliknutím přes školní/osobní Google účet (nastavit Google Cloud Console Client ID & Secret).
- [ ] **3.4. PWA – Instalace na plochu telefonu:**
  - [ ] Vytvořit soubor `manifest.json` s ikonou Quilldrop, aby šla hra na iPhonu i Androidu přidat na plochu jako plnohodnotná mobilní aplikace.

---

### FÁZE 4: Bezpečnost, zálohy a spuštění s brigádníky
*Cíl: Data z Heuristu i práce brigádníků jsou v naprostém bezpečí.*

- [ ] **4.1. Automatizovaný zálohovací skript:**
  - [ ] Vytvořit skript pro denní zálohu databáze Supabase do JSON souboru (aby brigádníci nemohli omylem cokoliv smazat).
- [ ] **4.2. Zátěžový test a test v mobilních prohlížečích:**
  - [ ] Otestovat na iOS Safari, Android Chrome a různých velikostech monitorů.
- [ ] **4.3. Instruktáž a předání prof. Doležalové:**
  - [ ] Předat odkaz na `/admin` s vytvořeným hlavním účtem pro paní profesorku.
