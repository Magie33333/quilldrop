"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  X,
  PlusCircle,
  FilePlus,
  Sparkles,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  MapPin,
  Calendar,
  User,
  Layers,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export type HeuristCatalogItem = {
  id: number;
  shelfmark: string;
  institution: string;
  idno: string;
  locus: string;
  scribe: string;
  place: string;
  date: string;
  year: number;
  quote: string;
  translation: string;
  img: string;
  host: string;
  features: string[];
  note: string;
};

type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Unique";

export default function HeuristCatalogModal({
  isOpen,
  onClose,
  existingCards,
  onCardCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  existingCards: any[];
  onCardCreated: (newCard: any) => void;
}) {
  const [mode, setMode] = useState<"heurist" | "manual">("heurist");
  const [catalog, setCatalog] = useState<HeuristCatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  // Filtry
  const [searchQuery, setSearchQuery] = useState("");
  const [unimportedOnly, setUnimportedOnly] = useState(true);
  const [drawingOnly, setDrawingOnly] = useState(false);
  const [rubricOnly, setRubricOnly] = useState(false);
  const [hostFilter, setHostFilter] = useState<"all" | "scribes" | "manuscriptorium" | "other">("all");
  const [placeFilter, setPlaceFilter] = useState("all");

  // Vybraná položka pro detail / formulář
  const [selectedItem, setSelectedItem] = useState<HeuristCatalogItem | null>(null);

  // Formulářová pole pro vytvářenou kartu
  const [formTitle, setFormTitle] = useState("");
  const [formRarity, setFormRarity] = useState<Rarity>("Common");
  const [formQuote, setFormQuote] = useState("");
  const [formTranslation, setFormTranslation] = useState("");
  const [formShelfmark, setFormShelfmark] = useState("");
  const [formLocus, setFormLocus] = useState("");
  const [formScribe, setFormScribe] = useState("");
  const [formPlace, setFormPlace] = useState("");
  const [formYear, setFormYear] = useState<number | string>(1400);
  const [formImageUrl, setFormImageUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 30;

  // Dynamické načtení Heurist katalogu při otevření modalu
  useEffect(() => {
    if (isOpen && catalog.length === 0 && !catalogLoading) {
      setCatalogLoading(true);
      import("../data/heuristCatalog.json")
        .then((m) => {
          setCatalog(m.default as HeuristCatalogItem[]);
          setCatalogLoading(false);
        })
        .catch((err) => {
          console.error("Nepodařilo se načíst Heurist katalog:", err);
          setCatalogLoading(false);
        });
    }
  }, [isOpen, catalog.length, catalogLoading]);

  // Sada již zařazených ID z Heuristu a URL obrázků
  const existingHeuristIds = useMemo(() => {
    const ids = new Set<number>();
    for (const c of existingCards) {
      if (c.colophons?.heurist_id) ids.add(Number(c.colophons.heurist_id));
      if (c.slug && c.slug.startsWith("card-")) {
        const num = Number(c.slug.replace("card-", ""));
        if (!isNaN(num)) ids.add(num);
      }
    }
    return ids;
  }, [existingCards]);

  const existingImageUrls = useMemo(() => {
    const urls = new Set<string>();
    for (const c of existingCards) {
      if (c.image_url) urls.add(c.image_url);
    }
    return urls;
  }, [existingCards]);

  // Seznam unikátních míst pro výběrový filtr
  const availablePlaces = useMemo(() => {
    const set = new Set<string>();
    for (const item of catalog) {
      if (item.place) {
        const base = item.place.split(",")[0].trim();
        if (base && base !== "Neznámé místo" && base !== "Czechia" && base !== "Czechia?") {
          set.add(base);
        }
      }
    }
    return ["all", "Praha", "Vyšší Brod", "Olomouc", "Trhové Sviny", "Plzeň", "Jihlava", "Lipsko", "Vídeň", ...Array.from(set).filter(p => !["Praha", "Vyšší Brod", "Olomouc", "Trhové Sviny", "Plzeň", "Jihlava", "Lipsko", "Vídeň"].includes(p)).slice(0, 15)];
  }, [catalog]);

  // Filtrace položek
  const filteredCatalog = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return catalog.filter((item) => {
      // 1. Filtr nezařazených
      if (unimportedOnly) {
        if (existingHeuristIds.has(item.id) || existingImageUrls.has(item.img)) {
          return false;
        }
      }

      // 2. Kresba
      if (drawingOnly && !item.features.includes("Kresba")) {
        return false;
      }

      // 3. Rubrika
      if (rubricOnly && !item.features.includes("Rubrika")) {
        return false;
      }

      // 4. Host server
      if (hostFilter === "scribes" && !item.host.includes("scribes.ff.cuni.cz")) {
        return false;
      }
      if (hostFilter === "manuscriptorium" && !item.host.includes("manuscriptorium")) {
        return false;
      }
      if (hostFilter === "other" && (item.host.includes("scribes.ff.cuni.cz") || item.host.includes("manuscriptorium"))) {
        return false;
      }

      // 5. Místo
      if (placeFilter !== "all" && !item.place.toLowerCase().includes(placeFilter.toLowerCase())) {
        return false;
      }

      // 6. Fulltext hledání
      if (query) {
        const match =
          item.shelfmark.toLowerCase().includes(query) ||
          item.locus.toLowerCase().includes(query) ||
          item.scribe.toLowerCase().includes(query) ||
          item.place.toLowerCase().includes(query) ||
          item.quote.toLowerCase().includes(query) ||
          item.date.toLowerCase().includes(query) ||
          String(item.id).includes(query);
        if (!match) return false;
      }

      return true;
    });
  }, [catalog, searchQuery, unimportedOnly, drawingOnly, rubricOnly, hostFilter, placeFilter, existingHeuristIds, existingImageUrls]);

  // Reset stránky při změně filtrů
  useEffect(() => {
    setPage(1);
  }, [searchQuery, unimportedOnly, drawingOnly, rubricOnly, hostFilter, placeFilter]);

  // Stránkované položky
  const totalPages = Math.max(1, Math.ceil(filteredCatalog.length / PAGE_SIZE));
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredCatalog.slice(start, start + PAGE_SIZE);
  }, [filteredCatalog, page]);

  // Při výběru položky z Heuristu předvyplníme formulář
  const handleSelectItem = (item: HeuristCatalogItem) => {
    setSelectedItem(item);

    // Chytrý návrh názvu karty
    let suggestedTitle = "";
    if (item.scribe && item.scribe !== "Neznámý písař") {
      const shortScribe = item.scribe.split(",")[0].trim();
      suggestedTitle = `Písař ${shortScribe}`;
      if (item.place && item.place !== "Neznámé místo") {
        const shortPlace = item.place.split(",")[0].trim();
        suggestedTitle += ` (${shortPlace})`;
      }
    } else if (item.place && item.place !== "Neznámé místo") {
      const shortPlace = item.place.split(",")[0].trim();
      suggestedTitle = `Hlas z ${shortPlace}`;
    } else if (item.idno) {
      suggestedTitle = `Kolofon kodexu ${item.idno}`;
    } else {
      suggestedTitle = `Rukopis #${item.id}`;
    }

    // Chytrý odhad rarity
    let suggestedRarity: Rarity = "Common";
    if (item.features.includes("Kresba") && item.features.includes("Iniciála")) {
      suggestedRarity = "Epic";
    } else if (item.features.includes("Kresba")) {
      suggestedRarity = "Rare";
    } else if (item.features.includes("Rubrika")) {
      suggestedRarity = "Uncommon";
    }

    setFormTitle(suggestedTitle);
    setFormRarity(suggestedRarity);
    setFormQuote(item.quote);
    setFormTranslation(item.translation || "");
    setFormShelfmark(item.shelfmark);
    setFormLocus(item.locus);
    setFormScribe(item.scribe || "Neznámý písař");
    setFormPlace(item.place || "Neznámé místo");
    setFormYear(item.year || 1400);
    setFormImageUrl(item.img);
    setErrorMsg("");
  };

  // Odeslání a založení karty v Supabase
  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formImageUrl || !formQuote) {
      setErrorMsg("Je nutné zadat URL obrázku a latinský text kolofonu.");
      return;
    }

    setSaving(true);
    setErrorMsg("");

    try {
      const targetHeuristId = selectedItem ? selectedItem.id : Date.now();

      // 1. Založení kolofonu
      const { data: colophon, error: colError } = await supabase
        .from("colophons")
        .insert({
          heurist_id: targetHeuristId,
          quote: formQuote.trim(),
          translation_cs: formTranslation.trim() || null,
          scribe: formScribe.trim() || "Unknown scribe",
          place: formPlace.trim() || "Unknown place",
          year: Number(formYear) || 1400,
          locus: formLocus.trim() || "1r",
          manuscript_shelfmark: formShelfmark.trim() || "Neznámý rukopis",
          source_url: formImageUrl.trim(),
        })
        .select()
        .single();

      if (colError || !colophon) {
        throw new Error(`Chyba při ukládání kolofonu: ${colError?.message || "Neznámá chyba"}`);
      }

      // 2. Založení karty
      const { data: newCard, error: cardError } = await supabase
        .from("cards")
        .insert({
          colophon_id: colophon.id,
          slug: `card-${targetHeuristId}`,
          title: formTitle.trim() || "Nový kolofon",
          rarity: formRarity,
          status: "published",
          image_url: formImageUrl.trim(),
          crop_x: 15,
          crop_y: 15,
          crop_w: 70,
          crop_h: 52.5,
        })
        .select(
          `
          *,
          colophons (
            id, heurist_id, quote, translation_cs, scribe, place, year, locus, manuscript_shelfmark, visual_note
          )
        `
        )
        .single();

      if (cardError || !newCard) {
        throw new Error(`Chyba při vytváření karty: ${cardError?.message || "Neznámá chyba"}`);
      }

      // Úspěch: předáme kartu nadřazené komponentě
      onCardCreated(newCard);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Při vytváření karty nastala chyba.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#14100c] border border-[#3d3122] rounded-xl w-full max-w-6xl h-[92vh] max-h-[900px] flex flex-col shadow-2xl overflow-hidden text-[#e8ded1]">
        {/* ZÁHLAVÍ MODALU */}
        <div className="px-5 py-3.5 border-b border-[#2e261d] bg-[#1a1510] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2b2217] border border-[#52412c] flex items-center justify-center text-[#ffd580]">
              <BookOpen size={17} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#ffd580] tracking-wide">
                  Přidat nový kolofon do Quilldropu
                </h3>
                <span className="text-[11px] bg-[#292017] text-[#c9a96e] px-2 py-0.5 rounded border border-[#4a3928]">
                  {catalog.length > 0 ? `${catalog.length.toLocaleString("cs-CZ")} digitalizátů v Heuristu` : "Načítám katalog..."}
                </span>
              </div>
              <p className="text-[11px] text-[#8c7b6d]">
                Vyberte autentický rukopis ze soupisu Heurist nebo zadejte nový ručně.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Přepínač režimů */}
            <div className="flex bg-[#0f0c0a] p-0.5 rounded-lg border border-[#2e261d] text-xs">
              <button
                type="button"
                onClick={() => setMode("heurist")}
                className={`px-3 py-1 rounded-md transition cursor-pointer font-medium flex items-center gap-1.5 ${
                  mode === "heurist"
                    ? "bg-[#3d3120] text-[#ffd580] shadow-xs"
                    : "text-[#8c7b6d] hover:text-[#c9a96e]"
                }`}
              >
                <BookOpen size={12} /> Heurist soupis
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("manual");
                  setSelectedItem(null);
                  setFormTitle("");
                  setFormQuote("");
                  setFormTranslation("");
                  setFormShelfmark("");
                  setFormLocus("");
                  setFormScribe("");
                  setFormPlace("");
                  setFormYear(1400);
                  setFormImageUrl("");
                }}
                className={`px-3 py-1 rounded-md transition cursor-pointer font-medium flex items-center gap-1.5 ${
                  mode === "manual"
                    ? "bg-[#3d3120] text-[#ffd580] shadow-xs"
                    : "text-[#8c7b6d] hover:text-[#c9a96e]"
                }`}
              >
                <FilePlus size={12} /> Ruční zadání
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-[#8c7b6d] hover:text-white p-1.5 rounded hover:bg-[#251d16] transition cursor-pointer"
              title="Zavřít okno"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* OBSAH PODLE VYBRANÉHO REŽIMU */}
        {mode === "heurist" ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* FILTRAČNÍ LIŠTA */}
            <div className="p-3 border-b border-[#2e261d] bg-[#17120e] space-y-2 shrink-0">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7d6f62]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Hledat signaturu, písaře, město, text kolofonu nebo ID..."
                    className="w-full bg-[#1e1712] border border-[#3d3122] rounded-lg pl-8 pr-7 py-1.5 text-xs text-[#e8ded1] placeholder-[#7d6f62] focus:outline-none focus:border-[#d4af37]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7d6f62] hover:text-white"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Rychlý dropdown míst */}
                <select
                  value={placeFilter}
                  onChange={(e) => setPlaceFilter(e.target.value)}
                  className="bg-[#1e1712] border border-[#3d3122] rounded-lg px-2.5 py-1.5 text-xs text-[#e8ded1] focus:outline-none focus:border-[#d4af37] cursor-pointer shrink-0"
                >
                  <option value="all">Všechna města & regiony</option>
                  {availablePlaces
                    .filter((p) => p !== "all")
                    .map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                </select>
              </div>

              {/* Tlačítka filtrů */}
              <div className="flex items-center justify-between gap-2 flex-wrap text-[11px]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setUnimportedOnly(!unimportedOnly)}
                    className={`px-2.5 py-1 rounded-full border transition cursor-pointer flex items-center gap-1 font-medium ${
                      unimportedOnly
                        ? "bg-[#1f381f] text-[#86efac] border-[#22c55e]/50"
                        : "bg-[#1a140f] text-[#8c7b6d] border-[#2e261d] hover:text-[#c9a96e]"
                    }`}
                    title="Zobrazit pouze kolofony, které ještě nejsou v Quilldropu"
                  >
                    <CheckCircle2 size={11} /> Pouze dosud nezařazené
                  </button>

                  <button
                    type="button"
                    onClick={() => setDrawingOnly(!drawingOnly)}
                    className={`px-2.5 py-1 rounded-full border transition cursor-pointer flex items-center gap-1 ${
                      drawingOnly
                        ? "bg-[#3d3120] text-[#ffd580] border-[#d4af37]"
                        : "bg-[#1a140f] text-[#8c7b6d] border-[#2e261d] hover:text-[#c9a96e]"
                    }`}
                  >
                    <span>🎨</span> S kresbou
                  </button>

                  <button
                    type="button"
                    onClick={() => setRubricOnly(!rubricOnly)}
                    className={`px-2.5 py-1 rounded-full border transition cursor-pointer flex items-center gap-1 ${
                      rubricOnly
                        ? "bg-[#421d1d] text-[#fca5a5] border-[#ef4444]/60"
                        : "bg-[#1a140f] text-[#8c7b6d] border-[#2e261d] hover:text-[#c9a96e]"
                    }`}
                  >
                    <span>🔴</span> S rubrikou
                  </button>

                  <span className="h-3.5 w-px bg-[#3d3122] mx-1" />

                  {/* Servery */}
                  {(["all", "scribes", "manuscriptorium", "other"] as const).map((h) => {
                    const labels = {
                      all: "Všechny servery",
                      scribes: "🏛️ FF UK Scribes (567)",
                      manuscriptorium: "📖 Manuscriptorium (2 940)",
                      other: "Ostatní archivy",
                    };
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHostFilter(h)}
                        className={`px-2 py-0.5 rounded border transition cursor-pointer ${
                          hostFilter === h
                            ? "bg-[#2d2319] text-[#ffd580] border-[#d4af37]"
                            : "bg-[#130f0c] text-[#7d6f62] border-[#241c14] hover:text-[#c9a96e]"
                        }`}
                      >
                        {labels[h]}
                      </button>
                    );
                  })}
                </div>

                <div className="text-[#8c7b6d] text-[11px] font-medium">
                  {catalogLoading ? (
                    "Načítám záznamy z Heuristu..."
                  ) : (
                    <span>
                      Nalezeno <strong className="text-[#ffd580]">{filteredCatalog.length}</strong> kolofonů
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* HLAVNÍ SPLIT ZOBRAZENÍ: SEZNAM (60%) + INSPEKTOR S FORMULÁŘEM (40%) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
              {/* LEVÝ PANEL: SEZNAM RUKOPISŮ */}
              <div className="lg:col-span-7 border-r border-[#2e261d] flex flex-col min-h-0 bg-[#120e0b]">
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {catalogLoading ? (
                    <div className="h-64 flex flex-col items-center justify-center text-[#8c7b6d] text-xs gap-2">
                      <div className="w-6 h-6 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
                      <span>Načítám 3 640 digitalizátů ze soupisu Heurist...</span>
                    </div>
                  ) : paginatedItems.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-[#8c7b6d] text-center p-6">
                      <BookOpen size={28} className="mb-2 text-[#52412c]" />
                      <p className="font-bold text-sm text-[#c9a96e]">Žádný kolofon neodpovídá zadaným filtrům</p>
                      <p className="text-xs text-[#7d6f62] mt-1">
                        Zkuste uvolnit textové hledání nebo vypnout filtr „Pouze dosud nezařazené“.
                      </p>
                    </div>
                  ) : (
                    paginatedItems.map((item) => {
                      const isSelected = selectedItem?.id === item.id;
                      const isAlreadyImported =
                        existingHeuristIds.has(item.id) || existingImageUrls.has(item.img);

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectItem(item)}
                          className={`p-3 rounded-lg border text-left cursor-pointer transition flex gap-3 ${
                            isSelected
                              ? "bg-[#281f16] border-[#d4af37] shadow-md ring-1 ring-[#d4af37]/30"
                              : "bg-[#17120e] border-[#292017] hover:border-[#4a3928] hover:bg-[#1d1712]"
                          }`}
                        >
                          {/* Miniatura obrázku */}
                          <div className="w-16 h-20 rounded border border-[#3d3122] overflow-hidden shrink-0 bg-[#0d0a08] relative">
                            <img
                              src={item.img}
                              alt={item.shelfmark}
                              loading="lazy"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = "/illumination-rabbit.png";
                              }}
                            />
                            {item.host.includes("scribes.ff.cuni.cz") && (
                              <span
                                className="absolute bottom-0 inset-x-0 bg-[#691818]/90 text-[8px] text-white text-center py-0.2 uppercase font-bold"
                                title="Fakultní digitální knihovna FF UK"
                              >
                                FF UK
                              </span>
                            )}
                          </div>

                          {/* Textové informace */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="text-[10px] font-mono text-[#8c7b6d]">
                                  #{item.id} · {item.locus}
                                </span>
                                <div className="flex items-center gap-1">
                                  {item.features.map((f) => (
                                    <span
                                      key={f}
                                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                        f === "Kresba"
                                          ? "bg-[#3d3120] text-[#ffd580] border border-[#d4af37]/40"
                                          : f === "Rubrika"
                                          ? "bg-[#421d1d] text-[#fca5a5] border border-[#ef4444]/40"
                                          : "bg-[#251d16] text-[#c9a96e]"
                                      }`}
                                    >
                                      {f}
                                    </span>
                                  ))}
                                  {isAlreadyImported && (
                                    <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.2 rounded font-bold">
                                      Ve hře
                                    </span>
                                  )}
                                </div>
                              </div>

                              <h4 className="font-serif font-bold text-xs text-[#ffd580] truncate" title={item.shelfmark}>
                                {item.shelfmark}
                              </h4>

                              <div className="flex items-center gap-2 text-[10.5px] text-[#a89582] mt-0.5 truncate">
                                {item.scribe && item.scribe !== "Neznámý písař" && (
                                  <span className="flex items-center gap-1">
                                    <User size={10} className="text-[#d4af37]" /> {item.scribe}
                                  </span>
                                )}
                                {item.place && item.place !== "Neznámé místo" && (
                                  <span className="flex items-center gap-1">
                                    <MapPin size={10} className="text-[#8c7b6d]" /> {item.place.split(",")[0]}
                                  </span>
                                )}
                                {item.date && (
                                  <span className="flex items-center gap-1 text-[#8c7b6d]">
                                    <Calendar size={10} /> {item.date}
                                  </span>
                                )}
                              </div>

                              <p className="text-[11px] font-serif italic text-[#c9b79e] line-clamp-2 mt-1.5 bg-[#120e0b]/60 p-1.5 rounded border border-[#261d15]">
                                “{item.quote}”
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* STRÁNKOVÁNÍ */}
                <div className="px-4 py-2 border-t border-[#2e261d] bg-[#17120e] flex items-center justify-between text-xs text-[#8c7b6d] shrink-0">
                  <span>
                    Strana <strong className="text-[#e8ded1]">{page}</strong> z {totalPages} ({filteredCatalog.length} celkem)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="px-2.5 py-1 rounded bg-[#201913] hover:bg-[#2e241c] text-[#e8ded1] border border-[#3d3122] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition flex items-center gap-1 text-[11px]"
                    >
                      <ChevronLeft size={12} /> Předchozí
                    </button>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="px-2.5 py-1 rounded bg-[#201913] hover:bg-[#2e241c] text-[#e8ded1] border border-[#3d3122] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition flex items-center gap-1 text-[11px]"
                    >
                      Další <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </div>

              {/* PRAVÝ PANEL: DETAIL & PŘEDVYPLNĚNÝ FORMULÁŘ */}
              <div className="lg:col-span-5 flex flex-col min-h-0 bg-[#16110d] overflow-y-auto p-4 sm:p-5">
                {selectedItem ? (
                  <form onSubmit={handleCreateCard} className="space-y-3.5 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[#2e261d]">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#d4af37] tracking-wider">
                          1-Click Předvyplnění z Heuristu #{selectedItem.id}
                        </span>
                        <h4 className="font-serif font-bold text-sm text-[#ffd580] truncate max-w-[280px]">
                          {selectedItem.shelfmark}
                        </h4>
                      </div>
                      <a
                        href={selectedItem.img}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-[#c9a96e] hover:text-[#ffd580] flex items-center gap-1 underline"
                        title="Otevřít původní digitalizát ve vysokém rozlišení"
                      >
                        Originál <ExternalLink size={10} />
                      </a>
                    </div>

                    {/* Velký náhled folia */}
                    <div className="h-36 rounded-lg border border-[#3d3122] overflow-hidden bg-[#0d0a08] relative group">
                      <img
                        src={selectedItem.img}
                        alt={selectedItem.shelfmark}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/illumination-rabbit.png";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                        <span className="text-[11px] text-[#e8ded1] font-medium truncate">
                          {selectedItem.locus} · {selectedItem.institution}
                        </span>
                      </div>
                    </div>

                    {errorMsg && (
                      <div className="p-2.5 rounded bg-red-950/80 border border-red-800 text-red-200 text-xs">
                        {errorMsg}
                      </div>
                    )}

                    {/* Vstupní pole: Název a rarita */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-[11px] font-bold text-[#c9a96e] mb-1">
                          Název hrací karty *
                        </label>
                        <input
                          type="text"
                          required
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          placeholder="Písař Iohannes z Prahy"
                          className="w-full bg-[#1e1712] border border-[#3d3122] rounded px-2.5 py-1.5 text-xs text-[#e8ded1] focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#c9a96e] mb-1">
                          Rarita *
                        </label>
                        <select
                          value={formRarity}
                          onChange={(e) => setFormRarity(e.target.value as Rarity)}
                          className="w-full bg-[#1e1712] border border-[#3d3122] rounded px-2 py-1.5 text-xs text-[#e8ded1] focus:outline-none focus:border-[#d4af37]"
                        >
                          {["Common", "Uncommon", "Rare", "Epic", "Legendary", "Unique"].map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Latinský text kolofonu */}
                    <div>
                      <label className="block text-[11px] font-bold text-[#c9a96e] mb-1">
                        Původní text kolofonu (latinsky) *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={formQuote}
                        onChange={(e) => setFormQuote(e.target.value)}
                        className="w-full bg-[#1e1712] border border-[#3d3122] rounded p-2 text-xs text-[#e8ded1] focus:outline-none focus:border-[#d4af37] font-serif leading-relaxed"
                      />
                    </div>

                    {/* Český překlad */}
                    <div>
                      <label className="block text-[11px] font-bold text-[#c9a96e] mb-1">
                        Český překlad (pro studenty a hráče)
                      </label>
                      <textarea
                        rows={2}
                        value={formTranslation}
                        onChange={(e) => setFormTranslation(e.target.value)}
                        placeholder="Kniha je dokončena, dejte písaři napít..."
                        className="w-full bg-[#1e1712] border border-[#3d3122] rounded p-2 text-xs text-[#e8ded1] focus:outline-none focus:border-[#d4af37] leading-relaxed"
                      />
                    </div>

                    {/* Metadata: Signatura a Folio */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10.5px] text-[#8c7b6d] mb-1">Signatura rukopisu</label>
                        <input
                          type="text"
                          value={formShelfmark}
                          onChange={(e) => setFormShelfmark(e.target.value)}
                          className="w-full bg-[#1e1712] border border-[#3d3122] rounded px-2 py-1 text-xs text-[#e8ded1]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10.5px] text-[#8c7b6d] mb-1">Folio (locus)</label>
                        <input
                          type="text"
                          value={formLocus}
                          onChange={(e) => setFormLocus(e.target.value)}
                          className="w-full bg-[#1e1712] border border-[#3d3122] rounded px-2 py-1 text-xs text-[#e8ded1]"
                        />
                      </div>
                    </div>

                    {/* Písař, Místo, Rok */}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10.5px] text-[#8c7b6d] mb-1">Písař</label>
                        <input
                          type="text"
                          value={formScribe}
                          onChange={(e) => setFormScribe(e.target.value)}
                          className="w-full bg-[#1e1712] border border-[#3d3122] rounded px-2 py-1 text-xs text-[#e8ded1]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10.5px] text-[#8c7b6d] mb-1">Místo</label>
                        <input
                          type="text"
                          value={formPlace}
                          onChange={(e) => setFormPlace(e.target.value)}
                          className="w-full bg-[#1e1712] border border-[#3d3122] rounded px-2 py-1 text-xs text-[#e8ded1]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10.5px] text-[#8c7b6d] mb-1">Rok</label>
                        <input
                          type="number"
                          value={formYear}
                          onChange={(e) => setFormYear(Number(e.target.value))}
                          className="w-full bg-[#1e1712] border border-[#3d3122] rounded px-2 py-1 text-xs text-[#e8ded1]"
                        />
                      </div>
                    </div>

                    {/* Akční tlačítko */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 bg-[#d4af37] hover:bg-[#c39e2e] text-[#120f0c] font-bold text-xs py-2.5 px-4 rounded-lg shadow-lg transition cursor-pointer disabled:opacity-50"
                      >
                        {saving ? (
                          <span>Zakládám kartu a ořezávač...</span>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            <span>Zařadit kolofon a přejít k ořezu →</span>
                          </>
                        )}
                      </button>
                      <p className="text-[10px] text-[#8c7b6d] text-center mt-1.5">
                        Karta bude okamžitě vytvořena v Supabase a otevře se interaktivní ořezávač 4:3.
                      </p>
                    </div>
                  </form>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#8c7b6d]">
                    <div className="w-12 h-12 rounded-full bg-[#201913] border border-[#3d3122] flex items-center justify-center text-[#d4af37] mb-3">
                      <BookOpen size={22} />
                    </div>
                    <h4 className="font-serif font-bold text-sm text-[#ffd580]">
                      Vyberte kolofon ze soupisu vlevo
                    </h4>
                    <p className="text-xs text-[#7d6f62] max-w-xs mt-1 leading-relaxed">
                      Kliknutím na libovolný záznam se automaticky načte digitalizát folia, signatura, latinský text a navrhne se název karty i rarita.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* RUČNÍ ZADÁNÍ */
          <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full">
            <form onSubmit={handleCreateCard} className="space-y-4 text-xs">
              <div className="border-b border-[#2e261d] pb-2 mb-3">
                <h4 className="font-serif font-bold text-base text-[#ffd580]">
                  Ruční zadání nového rukopisu
                </h4>
                <p className="text-xs text-[#8c7b6d]">
                  Zadejte přímý odkaz na digitalizát folia a základní kodikologická data.
                </p>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded bg-red-950/80 border border-red-800 text-red-200 text-xs">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-[#c9a96e] mb-1">
                  URL adresa obrázku (přímý odkaz na JPG/PNG nebo IIIF) *
                </label>
                <input
                  type="url"
                  required
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://img.scribes.ff.cuni.cz/.../folio.jpg"
                  className="w-full bg-[#1e1712] border border-[#3d3122] rounded px-3 py-2 text-xs text-[#e8ded1] focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-[#c9a96e] mb-1">
                    Signatura rukopisu *
                  </label>
                  <input
                    type="text"
                    required
                    value={formShelfmark}
                    onChange={(e) => setFormShelfmark(e.target.value)}
                    placeholder="Např. NK ČR XIV A 17 nebo CO 340"
                    className="w-full bg-[#1e1712] border border-[#3d3122] rounded px-3 py-2 text-xs text-[#e8ded1]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#c9a96e] mb-1">Folio (locus) *</label>
                  <input
                    type="text"
                    required
                    value={formLocus}
                    onChange={(e) => setFormLocus(e.target.value)}
                    placeholder="Např. 193r"
                    className="w-full bg-[#1e1712] border border-[#3d3122] rounded px-3 py-2 text-xs text-[#e8ded1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#c9a96e] mb-1">
                  Původní text kolofonu (latinsky) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formQuote}
                  onChange={(e) => setFormQuote(e.target.value)}
                  placeholder="Explicit liber finitus per me..."
                  className="w-full bg-[#1e1712] border border-[#3d3122] rounded p-2.5 text-xs text-[#e8ded1] font-serif"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#c9a96e] mb-1">
                  Český překlad (volitelné)
                </label>
                <textarea
                  rows={2}
                  value={formTranslation}
                  onChange={(e) => setFormTranslation(e.target.value)}
                  placeholder="Kniha je dokončena..."
                  className="w-full bg-[#1e1712] border border-[#3d3122] rounded p-2.5 text-xs text-[#e8ded1]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10.5px] text-[#8c7b6d] mb-1">Písař</label>
                  <input
                    type="text"
                    value={formScribe}
                    onChange={(e) => setFormScribe(e.target.value)}
                    placeholder="Neznámý písař"
                    className="w-full bg-[#1e1712] border border-[#3d3122] rounded px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] text-[#8c7b6d] mb-1">Místo vzniku</label>
                  <input
                    type="text"
                    value={formPlace}
                    onChange={(e) => setFormPlace(e.target.value)}
                    placeholder="Praha"
                    className="w-full bg-[#1e1712] border border-[#3d3122] rounded px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] text-[#8c7b6d] mb-1">Rok</label>
                  <input
                    type="number"
                    value={formYear}
                    onChange={(e) => setFormYear(Number(e.target.value))}
                    className="w-full bg-[#1e1712] border border-[#3d3122] rounded px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#c9a96e] mb-1">Název karty</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Např. Písařské zvolání"
                    className="w-full bg-[#1e1712] border border-[#3d3122] rounded px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#c9a96e] mb-1">Rarita karty</label>
                  <select
                    value={formRarity}
                    onChange={(e) => setFormRarity(e.target.value as Rarity)}
                    className="w-full bg-[#1e1712] border border-[#3d3122] rounded px-2.5 py-1.5 text-xs text-[#e8ded1]"
                  >
                    <option value="Common">Common</option>
                    <option value="Uncommon">Uncommon</option>
                    <option value="Rare">Rare</option>
                    <option value="Epic">Epic</option>
                    <option value="Legendary">Legendary</option>
                    <option value="Unique">Unique</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#2e261d]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded text-[#8c7b6d] hover:bg-[#201913] transition cursor-pointer"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#d4af37] hover:bg-[#c39e2e] text-[#120f0c] font-bold px-5 py-2 rounded-lg transition cursor-pointer shadow disabled:opacity-50 flex items-center gap-1.5"
                >
                  {saving ? "Zakládám..." : "Vytvořit a přejít k ořezu →"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
