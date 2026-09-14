import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const exportFile = process.argv[2] || "Export_lucie_colophons_20260717002244.json";
const outputFile = path.join("app", "data", "heuristCatalog.json");

console.log(`[Heurist Catalog Generator] Načítám export: ${exportFile}...`);
let raw;
try {
  raw = JSON.parse(readFileSync(exportFile, "utf8"));
} catch (e) {
  console.error("Chyba při čtení exportního souboru:", e.message);
  process.exit(1);
}

const records = raw?.heurist?.records;
if (!Array.isArray(records)) {
  console.error("Neplatný formát Heurist JSON exportu (heurist.records chybí).");
  process.exit(1);
}

const recordById = new Map(records.map((r) => [String(r.rec_ID), r]));
const values = (r, field) => (r?.details || []).filter((d) => d.fieldName === field).map((d) => d.value);
const first = (r, ...fields) => {
  for (const f of fields) {
    const v = values(r, f)[0];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return null;
};
const label = (v) => (typeof v === "object" ? v?.title || v?.id || "" : String(v || ""));
const clean = (v) => label(v).replace(/\s+/g, " ").trim();
const yes = (r, field) =>
  (r.details || []).some(
    (d) => d.fieldName === field && (d.termLabel === "Yes" || d.value === "5444")
  );

const yearFrom = (v) => {
  const match = clean(v).match(/(?:1[0-9]{3}|[5-9][0-9]{2})/);
  return match ? Number(match[0]) : 0;
};

const textual = records.filter((r) => r.rec_RecTypeName === "Textual Interaction");
console.log(`Celkem nalezeno ${textual.length} textových interakcí.`);

const catalog = [];
for (const r of textual) {
  const fileDetail = (r.details || []).find(
    (d) =>
      d.fieldType === "file" &&
      (/^image\/(jpeg|png|tiff)$/i.test(d.value?.file?.fxm_MimeType || "") ||
        /\.(jpe?g|png|webp)/i.test(d.value?.file?.ulf_ExternalFileReference || ""))
  );
  if (!fileDetail) continue;

  const quote = clean(first(r, "quote_clean", "quote"));
  if (!quote) continue;

  const rawUrl = fileDetail.value?.file?.ulf_ExternalFileReference || "";
  let host = "";
  try {
    host = new URL(rawUrl).hostname;
  } catch {
    host = "unknown";
  }

  const manuscriptRef = first(r, "Manuscript_key");
  const manuscript = manuscriptRef?.id ? recordById.get(String(manuscriptRef.id)) : null;

  const idno = clean(
    first(manuscript || {}, "idno", "shelfmark", "shelfMark") || first(r, "shelfmark") || ""
  );
  const repo = clean(
    first(manuscript || {}, "repository_key") || first(manuscript || {}, "institution") || ""
  );
  const msTitle = clean(manuscriptRef || "");

  let shelfmark = idno;
  if (repo && idno) {
    shelfmark = `${repo}, ${idno}`;
  } else if (msTitle) {
    shelfmark = msTitle;
  } else if (!shelfmark) {
    shelfmark = "Rukopis bez signatury";
  }

  const place = clean(
    first(r, "origPlace : proposed location", "origPlace") ||
      first(manuscript || {}, "origPlace : proposed origin", "origPlace") ||
      ""
  );
  const dateStr = clean(
    first(r, "origDate : proposed date", "origDate") ||
      first(manuscript || {}, "origDate : proposed date", "origDate : from") ||
      ""
  );
  const year = yearFrom(dateStr);
  const scribe = clean(
    first(r, "scribe (text)", "scribe (author of the annotation)", "scribe") || ""
  );
  const locus = clean(first(r, "locus") || "");
  const translation = clean(
    first(r, "translation_cs", "translation", "translationCs") || ""
  );
  const note = clean(first(r, "visual_note", "note", "scriptNote") || "");

  const features = [];
  const noteLower = note.toLowerCase();
  if (
    yes(r, "graphical_element") ||
    /draw|drawing|figure|animal|face|cross|sketch|ornament|symbol|margin|border/i.test(
      noteLower
    )
  ) {
    features.push("Kresba");
  }
  if (
    yes(r, "script_colour_change") ||
    /red|blue|green|colour|rubric|červen/i.test(noteLower)
  ) {
    features.push("Rubrika");
  }
  if (
    yes(r, "highlight") ||
    /iniciál|initial|gold|zlato|illuminat/i.test(noteLower)
  ) {
    features.push("Iniciála");
  }

  catalog.push({
    id: Number(r.rec_ID),
    shelfmark: shelfmark,
    institution: repo || "Neznámá instituce",
    idno: idno || "",
    locus: locus || "fol. ?",
    scribe: scribe || "Neznámý písař",
    place: place || "Neznámé místo",
    date: dateStr || (year ? String(year) : ""),
    year: year || 1400,
    quote: quote,
    translation: translation,
    img: rawUrl,
    host: host,
    features: features,
    note: note ? note.slice(0, 160) : "",
  });
}

// Seřadíme: nejdříve FF UK Scribes, pak Manuscriptorium, pak s kresbami, pak podle ID
catalog.sort((a, b) => {
  const aHostScore = a.host.includes("scribes.ff.cuni.cz") ? 2 : a.host.includes("manuscriptorium") ? 1 : 0;
  const bHostScore = b.host.includes("scribes.ff.cuni.cz") ? 2 : b.host.includes("manuscriptorium") ? 1 : 0;
  if (aHostScore !== bHostScore) return bHostScore - aHostScore;
  if (a.features.length !== b.features.length) return b.features.length - a.features.length;
  return a.id - b.id;
});

console.log(`Úspěšně extrahováno ${catalog.length} kolofonů s digitalizáty.`);
writeFileSync(outputFile, JSON.stringify(catalog), "utf8");
const sizeKb = Math.round(readFileSync(outputFile).length / 1024);
console.log(`Soubor uložen: ${outputFile} (${sizeKb} KB).`);
