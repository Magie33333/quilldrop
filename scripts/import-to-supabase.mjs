import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const envFile = readFileSync(".env.local", "utf8");
const supabaseUrl = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const supabaseKey = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

if (!supabaseUrl || !supabaseKey) {
  console.error("Chybí přihlašovací údaje k Supabase v .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const exportFile = process.argv[2] || "Export_lucie_colophons_20260717002244.json";
const targetLimit = Number(process.argv[3]) || 60;

console.log(`Načítám export: ${exportFile} (limit: ${targetLimit} karet)...`);
let raw;
try {
  raw = JSON.parse(readFileSync(exportFile, "utf8"));
} catch (e) {
  console.error(`Chyba při čtení ${exportFile}:`, e.message);
  process.exit(1);
}

const records = raw?.heurist?.records;
if (!Array.isArray(records)) {
  console.error("Soubor neobsahuje platný Heurist JSON formát (heurist.records).");
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
const label = (v) => typeof v === "object" ? v?.title || v?.id || "" : String(v || "");
const clean = (v) => label(v).replace(/\s+/g, " ").trim();
const yearFrom = (v) => Number(clean(v).match(/(?:1[0-9]{3}|[5-9][0-9]{2})/)?.[0] || 0);

const textual = records.filter((r) => r.rec_RecTypeName === "Textual Interaction");
console.log(`Nalezeno ${textual.length} textových interakcí/kolofonů.`);

const candidates = [];
for (const record of textual) {
  const quote = clean(first(record, "quote_clean", "quote"));
  const fileDetail = (record.details || []).find(
    (d) => d.fieldType === "file" &&
      /^image\/(jpeg|png|tiff)$/i.test(d.value?.file?.fxm_MimeType || "") &&
      /^https?:/i.test(d.value?.file?.ulf_ExternalFileReference || "")
  );
  if (!quote || !fileDetail) continue;

  const remoteImageUrl = fileDetail.value.file.ulf_ExternalFileReference;
  const manuscriptRef = first(record, "Manuscript_key");
  const manuscript = manuscriptRef?.id ? recordById.get(String(manuscriptRef.id)) : null;
  const place = clean(first(record, "origPlace : proposed location", "origPlace") || first(manuscript || {}, "origPlace : proposed origin", "origPlace") || "Unknown place");
  const dateValue = first(record, "origDate", "origDate : proposed date") || first(manuscript || {}, "origDate : proposed date", "origDate : from");
  const scribe = clean(first(record, "scribe (text)", "scribe (author of the annotation)") || "Unknown scribe");
  const note = clean(first(record, "visual_note", "note", "scriptNote") || "");

  candidates.push({
    heuristId: Number(record.rec_ID),
    quote,
    scribe,
    place,
    year: yearFrom(dateValue) || 1400,
    locus: clean(first(record, "locus") || "fol. ?"),
    manuscript: clean(manuscript?.rec_Title || manuscriptRef || "Unidentified manuscript"),
    remoteImageUrl,
    visualNote: note,
  });
}

console.log(`Nalezeno ${candidates.length} kolofonů s přímými skeny.`);

const toProcess = candidates.slice(0, targetLimit);
let imported = 0;

for (const item of toProcess) {
  const { data: col, error: colErr } = await supabase
    .from("colophons")
    .upsert({
      heurist_id: item.heuristId,
      quote: item.quote,
      scribe: item.scribe,
      place: item.place,
      year: item.year,
      locus: item.locus,
      manuscript_shelfmark: item.manuscript,
      visual_note: item.visualNote || null,
      source_url: item.remoteImageUrl,
    }, { onConflict: "heurist_id" })
    .select()
    .single();

  if (colErr || !col) {
    console.warn(`Přeskočeno ${item.heuristId}:`, colErr?.message);
    continue;
  }

  const rarity = imported === 0 ? "Unique" : imported < 5 ? "Legendary" : imported < 15 ? "Epic" : imported < 30 ? "Rare" : "Common";

  const { error: cardErr } = await supabase
    .from("cards")
    .upsert({
      colophon_id: col.id,
      slug: `colophon-${item.heuristId}`,
      title: item.quote.length > 35 ? item.quote.slice(0, 35) + "…" : item.quote,
      rarity,
      status: "published",
      image_url: item.remoteImageUrl,
      crop_x: 0,
      crop_y: 0,
      crop_w: 100,
      crop_h: 100,
    }, { onConflict: "slug" });

  if (!cardErr) {
    imported++;
  }
}

console.log(`Hotovo! V databázi je nyní úspěšně synchronizováno ${imported} karet.`);
