"use client";

import React, { useState } from "react";
import {
  X,
  BookOpen,
  Crop,
  FileText,
  Gamepad2,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Users,
  ShieldCheck,
  Search,
  Award,
} from "lucide-react";

export default function StudioHelpModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"heurist" | "crop" | "metadata" | "games" | "trophies" | "workflow">("heurist");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-[#14100c] border border-[#3d3122] rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#e8ded1]">
        {/* ZÁHLAVÍ */}
        <div className="px-6 py-4 border-b border-[#2e261d] bg-[#1a1510] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#2e2318] border border-[#52412c] flex items-center justify-center text-[#ffd580]">
              <HelpCircle size={20} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#ffd580] tracking-wide">
                Příručka editora Quilldrop Studia
              </h3>
              <p className="text-xs text-[#8c7b6d]">
                Odborné instrukce pro zpracování středověkých kolofonů pod vedením prof. Lucie Doležalové
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8c7b6d] hover:text-white p-1.5 rounded hover:bg-[#251d16] transition cursor-pointer"
            title="Zavřít"
          >
            <X size={20} />
          </button>
        </div>

        {/* LIŠTA ZÁLOŽEK */}
        <div className="flex border-b border-[#2e261d] bg-[#17120e] px-4 overflow-x-auto text-xs shrink-0">
          {[
            { id: "heurist", label: "1. Výběr z Heuristu", icon: BookOpen },
            { id: "crop", label: "2. Ořez folia (4:3)", icon: Crop },
            { id: "metadata", label: "3. Překlad a data", icon: FileText },
            { id: "games", label: "4. Tvorba miniher", icon: Gamepad2 },
            { id: "trophies", label: "5. Výzvy & Achievementy", icon: Award },
            { id: "workflow", label: "6. Stavy a schvalování", icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 flex items-center gap-2 border-b-2 font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? "border-[#d4af37] text-[#ffd580] bg-[#221a13]"
                    : "border-transparent text-[#8c7b6d] hover:text-[#c9a96e]"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* OBSAH ZÁLOŽEK */}
        <div className="flex-1 overflow-y-auto p-6 text-xs leading-relaxed space-y-4">
          {activeTab === "heurist" && (
            <div className="space-y-4">
              <div className="bg-[#1c1611] p-4 rounded-lg border border-[#3b2f23]">
                <h4 className="font-serif font-bold text-sm text-[#ffd580] mb-1 flex items-center gap-2">
                  <Search size={16} className="text-[#d4af37]" /> Jak vybrat kolofon pro novou kartu
                </h4>
                <p className="text-[#c9b8a3]">
                  V horní liště klikněte na zlaté tlačítko <strong>„+ Kolofon (Heurist)“</strong>. Otevře se soupis 3 640 digitalizovaných kolofonů z univerzitní databáze prof. Lucie Doležalové.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="bg-[#17120e] p-3.5 rounded-lg border border-[#2e261d]">
                  <strong className="text-[#ffd580] text-xs block mb-1">🏛️ Přednostní digitalizáty (FF UK Scribes)</strong>
                  <p className="text-[#8c7b6d]">
                    Klikněte na filtr <em>„🏛️ FF UK Scribes“</em>. Jedná se o 567 snímků přímo z fakultního serveru ve špičkovém rozlišení z archivů v Praze, Olomouci a Vyšším Brodě.
                  </p>
                </div>
                <div className="bg-[#17120e] p-3.5 rounded-lg border border-[#2e261d]">
                  <strong className="text-[#ffd580] text-xs block mb-1">🎨 Hledejte vizuální zajímavosti</strong>
                  <p className="text-[#8c7b6d]">
                    Filtry <em>„S kresbou“</em> a <em>„S rubrikou“</em> zobrazí kolofony obsahující kresbičky, zvířata, obličeje, ozdobné iniciály či červený inkoust. Tyto karty jsou pro hráče nejatraktivnější!
                  </p>
                </div>
                <div className="bg-[#17120e] p-3.5 rounded-lg border border-[#2e261d]">
                  <strong className="text-[#ffd580] text-xs block mb-1">🔍 Důkladné prozkoumání fotky (Lupa)</strong>
                  <p className="text-[#8c7b6d]">
                    V náhledu klikněte na tlačítko <em>„🔍 Prozkoumat snímek“</em>. Otevře se celoobrazovková lupa, kde můžete snímek přibližovat a posouvat, abyste si ověřili, zda je text kolofonu dobře čitelný.
                  </p>
                </div>
                <div className="bg-[#17120e] p-3.5 rounded-lg border border-[#2e261d]">
                  <strong className="text-[#ffd580] text-xs block mb-1">⚡ Pouze dosud nezařazené</strong>
                  <p className="text-[#8c7b6d]">
                    Tento filtr je zapnutý automaticky a zaručuje, že nebudete zpracovávat kolofon, který už některý z vašich kolegů zařadil.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "crop" && (
            <div className="space-y-4">
              <div className="bg-[#1c1611] p-4 rounded-lg border border-[#3b2f23]">
                <h4 className="font-serif font-bold text-sm text-[#ffd580] mb-1 flex items-center gap-2">
                  <Crop size={16} className="text-[#d4af37]" /> Zlatá pravidla ořezu folia (poměr 4:3)
                </h4>
                <p className="text-[#c9b8a3]">
                  Hrací karty v Quilldropu mají přísný horizontální poměr stran <strong>4:3</strong>. Systém automaticky zabraňuje deformaci písma (uniformní škálování).
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex gap-3 bg-[#17120e] p-3 rounded-lg border border-[#2e261d]">
                  <span className="w-6 h-6 rounded-full bg-[#3d3120] text-[#ffd580] flex items-center justify-center font-bold shrink-0">1</span>
                  <div>
                    <strong className="text-[#e8ded1] block">Zaměřte se na samotný text kolofonu</strong>
                    <p className="text-[#8c7b6d] mt-0.5">
                      Rámeček ořezu umístěte tak, aby pokryl kompletní text kolofonu (obvykle spodní část stránky folia). Pokud kolofon začíná ozdobnou iniciálou nebo je vedle něj marginální kresba, zahrňte ji do výřezu.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 bg-[#17120e] p-3 rounded-lg border border-[#2e261d]">
                  <span className="w-6 h-6 rounded-full bg-[#3d3120] text-[#ffd580] flex items-center justify-center font-bold shrink-0">2</span>
                  <div>
                    <strong className="text-[#e8ded1] block">Zachovejte vzdušnost kolem textu</strong>
                    <p className="text-[#8c7b6d] mt-0.5">
                      Neořezávejte písmena těsně k okraji – nechte kolem textu alespoň 1–2 centimetry pergamenového okraje, aby karta působila harmonicky.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 bg-[#17120e] p-3 rounded-lg border border-[#2e261d]">
                  <span className="w-6 h-6 rounded-full bg-[#3d3120] text-[#ffd580] flex items-center justify-center font-bold shrink-0">3</span>
                  <div>
                    <strong className="text-[#e8ded1] block">Pravý náhled karty 4:3 je vaší kontrolou</strong>
                    <p className="text-[#8c7b6d] mt-0.5">
                      V pravém panelu okamžitě vidíte, jak přesně bude výřez vypadat v rámu sběratelské karty. Písmo musí být ostré a dobře čitelné.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "metadata" && (
            <div className="space-y-4">
              <div className="bg-[#1c1611] p-4 rounded-lg border border-[#3b2f23]">
                <h4 className="font-serif font-bold text-sm text-[#ffd580] mb-1 flex items-center gap-2">
                  <FileText size={16} className="text-[#d4af37]" /> Latinský originál, české i anglické překlady a kodikologie
                </h4>
                <p className="text-[#c9b8a3]">
                  Karta učí studenty i mezinárodní veřejnost lidskému rozměru středověkého písemnictví. Věnujte péči oběma jazykovým verzím!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="bg-[#17120e] p-3.5 rounded-lg border border-[#2e261d] md:col-span-2">
                  <strong className="text-[#ffd580] block mb-1">📜 Původní latinský přepis (z Heuristu)</strong>
                  <p className="text-[#8c7b6d]">
                    V editoru je přímo nad překlady trvale zobrazen kompletní latinský přepis kolofonu. Máte tak originál neustále před očima a můžete jej v případě chyby v Heuristu přímo opravit.
                  </p>
                </div>

                <div className="bg-[#17120e] p-3.5 rounded-lg border border-[#2e261d]">
                  <strong className="text-[#ffd580] block mb-1">🇨🇿 Český překlad (přirozený a výstižný)</strong>
                  <p className="text-[#8c7b6d]">
                    Nepřekládejte otrocky slovo od slova. Zachovejte emoci písaře (např. <em>„Kniha je dokončena, dejte písaři napít vína!“</em> nebo <em>„Tři prsty píší, ale celé tělo trpí.“</em>).
                  </p>
                </div>

                <div className="bg-[#17120e] p-3.5 rounded-lg border border-[#2e261d]">
                  <strong className="text-[#ffd580] block mb-1">🇬🇧 English Translation (pro zahraniční hráče)</strong>
                  <p className="text-[#8c7b6d]">
                    Vyplňte anglický překlad latinské formule a anglický název karty (např. <em>„The Scribe Finished the Codex“</em>). Quilldrop má plný anglický režim pro mezinárodní studenty.
                  </p>
                </div>

                <div className="bg-[#17120e] p-3.5 rounded-lg border border-[#2e261d]">
                  <strong className="text-[#ffd580] block mb-1">Důvod rarity (česky & anglicky)</strong>
                  <p className="text-[#8c7b6d]">
                    Uveďte 1–2 věty, proč má karta danou vzácnost (např. <em>„Vzácná rýmovaná formule s červenou rubrikací.“</em> / <em>„Rare rhymed formula with red rubrication.“</em>).
                  </p>
                </div>

                <div className="bg-[#17120e] p-3.5 rounded-lg border border-[#2e261d]">
                  <strong className="text-[#ffd580] block mb-1">Pravidla pro stanovení rarity:</strong>
                  <ul className="text-[#8c7b6d] space-y-1 mt-1">
                    <li>• <strong>Common:</strong> Běžná závěrečná formule (Finitus est liber...).</li>
                    <li>• <strong>Uncommon:</strong> Zmínka písaře, letopočet, červená rubrika.</li>
                    <li>• <strong>Rare:</strong> Žertovná stížnost, přání vína, kresba zvířete.</li>
                    <li>• <strong>Epic / Legendary:</strong> Šifra, kryptogram, královský rukopis, bohatá iniciála.</li>
                    <li>• <strong>Unique:</strong> Zcela ojedinělý nález (např. Podlažický ďábel, autograf významné osobnosti).</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === "games" && (
            <div className="space-y-4">
              <div className="bg-[#1c1611] p-4 rounded-lg border border-[#3b2f23]">
                <h4 className="font-serif font-bold text-sm text-[#ffd580] mb-1 flex items-center gap-2">
                  <Gamepad2 size={16} className="text-[#d4af37]" /> Tvorba výukových miniher a centrální správa
                </h4>
                <p className="text-[#c9b8a3]">
                  Výukové minihry tvoří didaktické jádro Quilldropu. Umožňují studentům aktivně proniknout do tajů středověkých kolofonů, nálad písařů, kryptogramů a paleografie.
                </p>
              </div>

              {/* 2 ZPŮSOBY TVORBY A SPRÁVY */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[#17120e] p-3 rounded-lg border border-[#2e261d]">
                  <strong className="text-[#ffd580] text-xs block mb-1 flex items-center gap-1.5">
                    🏛️ 1. Centrální okno miniher (Horní lišta)
                  </strong>
                  <p className="text-[#8c7b6d] text-[11.5px]">
                    Kliknutím na tlačítko <strong>„Minihry“</strong> v horní liště administrace otevřete centrální manažer. Zde můžete procházet a spravovat <strong>všechny vytvořené minihry</strong> na jednom místě, filtrovat je podle disciplíny či rukopisu, bleskově je upravovat a vytvářet nové minihry s přiřazením k libovolnému kodexu.
                  </p>
                </div>
                <div className="bg-[#17120e] p-3 rounded-lg border border-[#2e261d]">
                  <strong className="text-[#ffd580] text-xs block mb-1 flex items-center gap-1.5">
                    📜 2. Tvorba u konkrétní karty (Pravý panel)
                  </strong>
                  <p className="text-[#8c7b6d] text-[11.5px]">
                    Při úpravě konkrétního rukopisu klikněte v pravém panelu na záložku <strong>„Písařské výzvy“</strong>. Minihra se automaticky prováže s právě otevřenou kartou a můžete rovnou pracovat s jejím obrazovým výřezem a transkripcí.
                  </p>
                </div>
              </div>

              {/* 4 SAMOSTATNÉ DISCIPLÍNY */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-2 flex items-center gap-1.5">
                  <Sparkles size={13} /> 4 herní disciplíny a systém odměn
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* 1. NÁLADA */}
                  <div className="bg-[#17120e] p-3.5 rounded-lg border border-[#2e261d] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <strong className="text-[#ffd580] text-xs">
                          1. Nálada písaře (Mood quiz)
                        </strong>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 shrink-0">
                          📦 Běžný balíček
                        </span>
                      </div>
                      <p className="text-[#8c7b6d] text-[11.5px] mb-2">
                        Student zkoumá text kolofonu a odhaduje citové rozpoložení písaře v momentu dopsání díla (únava ruky, touha po pivu/vínu, radost z dokončení, pokora před Bohem, vztek na zimu či nekvalitní pergamen).
                      </p>
                      <div className="bg-[#120e0a] p-2 rounded border border-[#261e16] text-[11px] text-[#c9b8a3] space-y-1">
                        <div><strong>Nastavení v editoru:</strong> 4 možnosti s tematickými emoji, 1 správná volba.</div>
                        <div><strong>Didaktika:</strong> Do vysvětlení uveďte citaci z kolofonu, která náladu dokládá.</div>
                      </div>
                    </div>
                  </div>

                  {/* 2. ŠIFRA */}
                  <div className="bg-[#17120e] p-3.5 rounded-lg border border-[#2e261d] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <strong className="text-[#ffd580] text-xs">
                          2. Rozlušti šifru (Cipher challenge)
                        </strong>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/50 shrink-0">
                          📜 Učencův balíček
                        </span>
                      </div>
                      <p className="text-[#8c7b6d] text-[11.5px] mb-2">
                        Dešifrování středověkých kryptogramů, tajných písem, substitučních šifer (tečky místo samohlásek: . = a, : = e, :. = i...), chronogramů s římskými číslicemi, přesmyček, kleteb na zloděje knih či skrytých jmen písařů.
                      </p>
                      <div className="bg-[#120e0a] p-2 rounded border border-[#261e16] text-[11px] text-[#c9b8a3] space-y-1">
                        <div><strong>Nastavení v editoru:</strong> Otázka, typ šifry, správné rozluštění a záchranná nápověda pro hráče.</div>
                        <div><strong>Didaktika:</strong> Ukažte princip středověkého šifrování a logiku písaře.</div>
                      </div>
                    </div>
                  </div>

                  {/* 3. PÍSMO */}
                  <div className="bg-[#17120e] p-3.5 rounded-lg border border-[#2e261d] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <strong className="text-[#ffd580] text-xs">
                          3. Poznej středověké písmo (Script identification)
                        </strong>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/50 shrink-0">
                          📜 Učencův balíček
                        </span>
                      </div>
                      <p className="text-[#8c7b6d] text-[11.5px] mb-2">
                        Určování duktu a stylu písma podle paleografických pravidel: Gotická textura formalis, Gotická bastarda, Gotická kurzíva / notula, Humanistická antikva, Karolinská minuskula atd.
                      </p>
                      <div className="bg-[#120e0a] p-2 rounded border border-[#261e16] text-[11px] text-[#c9b8a3] space-y-1">
                        <div><strong>Nastavení v editoru:</strong> Výběr stylu písma, správná odpověď a 3 distraktory.</div>
                        <div><strong>Didaktika:</strong> Popište charakteristické rysy (lámání dříků, bříška, ligatury, smyčky).</div>
                      </div>
                    </div>
                  </div>

                  {/* 4. PŘEPIS */}
                  <div className="bg-[#17120e] p-3.5 rounded-lg border border-[#2e261d] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <strong className="text-[#ffd580] text-xs">
                          4. Paleografický přepis (Master transcription)
                        </strong>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/50 shrink-0">
                          👑 Královský balíček
                        </span>
                      </div>
                      <p className="text-[#8c7b6d] text-[11.5px] mb-2">
                        Vrcholná disciplína: student samostatně přepisuje 1 až 3 řádky přímo z digitálního originálu. Trénuje čtení zkracovacích znamének, ligatur a historické ortografie.
                      </p>
                      <div className="bg-[#120e0a] p-2 rounded border border-[#261e16] text-[11px] text-[#c9b8a3] space-y-1">
                        <div><strong>Nastavení v editoru:</strong> Výběr řádků na foliu, vzorový přepis a alternativní znění.</div>
                        <div><strong>Didaktika:</strong> Zadejte i běžné varianty (rozepsané abreviatury, u/v, i/j).</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* DŮLEŽITÉ FUNKCE PRO HRÁČE A EDITORY */}
              <div className="bg-[#17120e] p-3.5 rounded-lg border border-[#2e261d] space-y-2.5">
                <strong className="text-[#ffd580] text-xs block">
                  🔍 Paleografická lupa na 1000 % a ergonomie vyhodnocení
                </strong>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11.5px] text-[#8c7b6d]">
                  <div className="bg-[#120e0a] p-2.5 rounded border border-[#261e16]">
                    <span className="text-[#ffd580] font-bold block mb-1">🔬 Přiblížení až 1000 %:</span>
                    V minihře přepisu má student k dispozici interaktivní lupu s plynulým zvětšením od 100 % do 1000 % s kontrastním vykreslením. Umožňuje bezpečně rozpoznat i ty nejjemnější diakritické a zkracovací tečky či háčky.
                  </div>
                  <div className="bg-[#120e0a] p-2.5 rounded border border-[#261e16]">
                    <span className="text-[#ffd580] font-bold block mb-1">⏸️ Ruční potvrzení výsledku:</span>
                    Po dokončení jakékoliv minihry se okno <em>nikdy nezavře automaticky</em> ani nepřebije hráče vyskakovacím oknem s novým levelem. Hráč musí výsledek potvrdit tlačítkem <strong>„Pokračovat“</strong>, aby si stihl v klidu prostudovat správné řešení, vzorový přepis a didaktický komentář.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "trophies" && (
            <div className="space-y-4">
              <div className="bg-[#1c1611] p-4 rounded-lg border border-[#3b2f23]">
                <h4 className="font-serif font-bold text-sm text-[#ffd580] mb-1 flex items-center gap-2">
                  <Award size={16} className="text-[#d4af37]" /> Tvorba Výzev a Achievementů (Modulární stavebnice)
                </h4>
                <p className="text-[#c9b8a3]">
                  V horní liště administrace otevřete sekci <strong>„Výzvy“</strong>. Můžete spravovat kategorie i tvořit výzvy se 4 stupni obtížnosti a libovolnou kombinací herních podmínek.
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-[#17120e] p-3.5 rounded-lg border border-[#2e261d]">
                  <strong className="text-[#ffd580] text-xs block mb-1.5">🧱 4 bloky podmínky (Stavebnice)</strong>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px] text-[#c9b8a3]">
                    <div className="bg-[#14100c] p-2.5 rounded border border-[#261d15]">
                      <span className="text-[#ffd580] font-bold block">1. Co se sleduje (Doména):</span>
                      Karty podle rarity, celková sbírka, minihry, balíčky, úroveň, XP, zlaťáky, streak, mozaika, města...
                    </div>
                    <div className="bg-[#14100c] p-2.5 rounded border border-[#261d15]">
                      <span className="text-[#ffd580] font-bold block">2. Kritérium množství:</span>
                      99 % výzev funguje automaticky na <em>„Alespoň (≥)“</em>. Možnost <em>„Přesně (=)“</em> se nabízí pouze tam, kde má smysl (easter eggy zlaťáků, přesnost v %).
                    </div>
                    <div className="bg-[#14100c] p-2.5 rounded border border-[#261d15]">
                      <span className="text-[#ffd580] font-bold block">3. Počet s jednotkou:</span>
                      Číslo s automatickým štítkem (např. 10 <em>karet</em>, 5 <em>miniher</em>, 500 <em>XP</em>, 7 <em>dní</em>).
                    </div>
                    <div className="bg-[#14100c] p-2.5 rounded border border-[#261d15]">
                      <span className="text-[#ffd580] font-bold block">4. Filtr / Rarita / Skriptorium:</span>
                      Výběr konkrétní rarity, módu, města nebo kombinací (např. <em>„Buď N Legendárních NEBO N Unikátních“</em>).
                    </div>
                  </div>
                </div>

                <div className="bg-[#17120e] p-3.5 rounded-lg border border-[#2e261d]">
                  <strong className="text-[#ffd580] text-xs block mb-1">💡 Živé lidské shrnutí v reálném čase</strong>
                  <p className="text-[#8c7b6d] text-[11.5px]">
                    Přímo pod nastavenými bloky se v zeleném panelu ihned zobrazuje přesné znění podmínky v češtině (např. <em>„💡 Hráč musí: Vlastnit alespoň 10 karet rarity: Vzácná“</em>). Vždy tak přesně víte, jak se podmínka ve hře vyhodnotí.
                  </p>
                </div>

                <div className="bg-[#17120e] p-3.5 rounded-lg border border-[#2e261d]">
                  <strong className="text-[#ffd580] text-xs block mb-1">🎯 4 stupně obtížnosti a vyvážení XP</strong>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs mt-2">
                    <div className="p-2 rounded bg-[#1e2a1e] border border-[#2e7d32]/40 text-emerald-300">
                      <strong className="block text-[11px]">🟢 Lehká</strong>
                      <span className="text-[10px] text-emerald-400/80">75–100 XP</span>
                      <p className="text-[9.5px] text-[#8c7b6d] mt-1">První balíček, 5 karet, 1. minihra, noc</p>
                    </div>
                    <div className="p-2 rounded bg-[#2e2416] border border-[#b26a00]/40 text-amber-300">
                      <strong className="block text-[11px]">🔵 Střední</strong>
                      <span className="text-[10px] text-amber-400/80">200–250 XP</span>
                      <p className="text-[9.5px] text-[#8c7b6d] mt-1">25 kodexů, 7 dní streak, 3 vzácné</p>
                    </div>
                    <div className="p-2 rounded bg-[#2d1b1b] border border-[#c62828]/40 text-rose-300">
                      <strong className="block text-[11px]">🟣 Těžká</strong>
                      <span className="text-[10px] text-rose-400/80">400–500 XP</span>
                      <p className="text-[9.5px] text-[#8c7b6d] mt-1">45 kodexů, 30 dní streak, 2 šifry</p>
                    </div>
                    <div className="p-2 rounded bg-[#291730] border border-[#6a1b9a]/40 text-purple-300">
                      <strong className="block text-[11px]">🔴 Nemožná</strong>
                      <span className="text-[10px] text-purple-400/80">1000–1500 XP</span>
                      <p className="text-[9.5px] text-[#8c7b6d] mt-1">60 kodexů + 5 legend, 100 dní streak</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "workflow" && (
            <div className="space-y-4">
              <div className="bg-[#1c1611] p-4 rounded-lg border border-[#3b2f23]">
                <h4 className="font-serif font-bold text-sm text-[#ffd580] mb-1 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#d4af37]" /> Stavy karet, bezpečnost a schvalování
                </h4>
                <p className="text-[#c9b8a3]">
                  Systém chrání ostrou hru studentů. Nově vytvořené karty se do balíčků dostanou až po schválení!
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-3 bg-[#17120e] p-3 rounded-lg border border-amber-900/40">
                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-700/60 uppercase">
                    Koncept (Draft)
                  </span>
                  <p className="text-[#8c7b6d] text-xs">
                    Výchozí stav pro novou kartu. Zde zkoušíte výřezy a píšete překlad. Hráči v ostré hře tuto kartu zatím nevidí.
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-[#17120e] p-3 rounded-lg border border-blue-900/40">
                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-blue-950 text-blue-300 border border-blue-700/60 uppercase">
                    Ke kontrole (Review)
                  </span>
                  <p className="text-[#8c7b6d] text-xs">
                    Jakmile kartu dokončíte (ořez, překlad, minihra), přepněte ji do stavu <em>„Ke kontrole“</em>. Správce či paní profesorka ví, že je karta připravena ke schválení.
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-[#17120e] p-3 rounded-lg border border-emerald-900/40">
                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 uppercase">
                    Publikováno (Published)
                  </span>
                  <p className="text-[#8c7b6d] text-xs">
                    Karta je schválena, vstupuje do živé hry a hráči ji mohou vylosovat z balíčků.
                  </p>
                </div>
              </div>

              <div className="bg-[#1f1710] p-3.5 rounded-lg border border-[#4a3520] flex items-start gap-2.5 mt-3">
                <AlertCircle size={16} className="text-[#ffd580] shrink-0 mt-0.5" />
                <p className="text-[11.5px] text-[#c9b8a3]">
                  <strong>Real-time ochrana proti kolizi:</strong> Systém hlídá, na které kartě právě pracujete. Pokud váš kolega otevře stejnou kartu, zobrazí se mu zřetelné upozornění, aby nedošlo k přepsání neuložených změn.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* PATIČKA */}
        <div className="px-6 py-3 border-t border-[#2e261d] bg-[#17120e] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#8c7b6d]">
            Quilldrop Studio · Verze pro studentské editory FF UK
          </span>
          <button
            type="button"
            onClick={onClose}
            className="bg-[#d4af37] hover:bg-[#c39e2e] text-[#120f0c] font-bold text-xs px-5 py-2 rounded-lg transition cursor-pointer shadow"
          >
            Rozumím, pokračovat v práci
          </button>
        </div>
      </div>
    </div>
  );
}
