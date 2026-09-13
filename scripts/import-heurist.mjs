import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const source = process.argv[2];
const shouldDownload = !process.argv.includes("--no-download");
const TARGET_COUNT = 30;
if (!source) {
  console.error('Usage: npm run import:heurist -- "C:\\path\\export.json" [--no-download]');
  process.exit(1);
}

const raw = JSON.parse(await readFile(source, "utf8"));
const records = raw?.heurist?.records;
if (!Array.isArray(records)) throw new Error("This does not look like a Heurist JSON export.");

const recordById = new Map(records.map((record) => [String(record.rec_ID), record]));
const values = (record, field) => (record?.details || []).filter((d) => d.fieldName === field).map((d) => d.value);
const first = (record, ...fields) => {
  for (const field of fields) {
    const value = values(record, field)[0];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return null;
};
const label = (value) => typeof value === "object" ? value?.title || value?.id || "" : String(value || "");
const clean = (value) => label(value).replace(/\s+/g, " ").trim();
const yes = (record, field) => (record.details || []).some((d) => d.fieldName === field && (d.termLabel === "Yes" || d.value === "5444"));
const yearFrom = (value) => Number(clean(value).match(/(?:1[0-9]{3}|[5-9][0-9]{2})/)?.[0] || 0);
const safeName = (value) => value.replace(/[^a-zA-Z0-9_-]/g, "-");

const normalize = (text) => clean(text)
  .toLowerCase()
  .replace(/\[[^\]]*]/g, " ")
  .replace(/m[°º]?c+[°º]?l*x*v*i*/gi, " ")
  .replace(/\b\d+\b/g, " ")
  .replace(/[^a-zà-ž]+/gi, " ")
  .replace(/\s+/g, " ")
  .trim();
const ngrams = (text) => {
  const words = normalize(text).split(" ").filter(Boolean);
  const out = [];
  for (const size of [3, 4, 5]) for (let i = 0; i <= words.length - size; i += 1) out.push(words.slice(i, i + size).join(" "));
  return out;
};

const textual = records.filter((record) => record.rec_RecTypeName === "Textual Interaction");
const formulaCounts = new Map();
for (const record of textual) {
  const unique = new Set(ngrams(first(record, "quote_clean", "quote") || ""));
  for (const phrase of unique) formulaCounts.set(phrase, (formulaCounts.get(phrase) || 0) + 1);
}

const preferredHosts = new Map([
  ["img.scribes.ff.cuni.cz", 42],
  ["iiif.ub.uni-leipzig.de", 34],
  ["www.e-codices.unifr.ch", 31],
  ["stacks.stanford.edu", 29],
  ["images.iiif.slub-dresden.de", 28],
  ["digital.slub-dresden.de", 26],
  ["imagines.manuscriptorium.com", 18],
  ["bibliotheca.hu", -20],
]);
const featureData = (record) => {
  const note = clean(first(record, "visual_note", "note", "scriptNote"));
  const quote = clean(first(record, "quote_clean", "quote"));
  const combined = `${quote} ${note}`.toLowerCase();
  const features = [];
  if (yes(record, "graphical_element") || /draw|drawing|figure|animal|face|head|cross|symbol|sign|sketch|ornament|decorat|flourish/.test(combined)) features.push("graphical element");
  if (yes(record, "script_colour_change") || /red|blue|green|gold|colour|rubric/.test(combined)) features.push("colour change");
  if (yes(record, "highlight") || /highlight|underlin|enlarged initial|initial enlarged/.test(combined)) features.push("highlighted writing");
  if (yes(record, "erasure") || /eras|smudg|scrap|crossed out/.test(combined)) features.push("erasure");
  if (yes(record, "later_layer")) features.push("later addition");
  if (yes(record, "layout_change") || yes(record, "line_break") || yes(record, "blank_space")) features.push("distinctive layout");
  if (/cipher|crypt|monogram|encoded|secret|riddle|acrostic|name game|wordplay/.test(combined)) features.push("cipher or wordplay");
  if (/versus|verse|hexameter|rhyme|rhym|metre|meter/.test(combined)) features.push("verse");
  if (/wine|vinum|potum|beer|cervisia|drink/.test(combined)) features.push("drink");
  if (/manus mea dolet|hand hurts|aching hand|lassus|fatig|tired|sleep/.test(combined)) features.push("scribal complaint");
  return [...new Set(features)];
};

const curatedTitles = new Map(Object.entries({
  "67741": "Written in Prague Castle",
  "67452": "Praise to the Three and One",
  "67744": "Benedictus Begins in Bologna",
  "75396": "John Was His Name",
  "67595": "A Red Mark for Mary",
  "67501": "Keep This Great Secret",
  "67491": "Amen Written in Red Dots",
  "64398": "Petrarch’s Secret Conflict",
  "67500": "A Thing Greater Than Belief",
  "67494": "The Alphabet in the Margins",
  "67731": "Franciscus Writes in Florence",
  "77579": "Scribe, Now Stop",
  "77560": "I Know, But Dare Not Tell",
  "26741": "The Crossed-Out Flowers",
  "77569": "The Erased Secrets of Women",
  "63278": "The Revelation at Fulštejn",
  "75220": "The Jubilee Colophon",
  "27231": "The Scribe with Darkened Eyes",
  "67398": "Mark, Hand Over the Tablets",
  "27217": "Corrected at Esztergom",
  "77535": "A Prayer from Erasmus",
  "75635": "The Name Hidden in the Initials",
  "79938": "Thanks Within the Frame",
  "76163": "The Poet at the King’s Service",
  "67711": "The Good Man Is Dead",
  "78524": "A Drink for the Labour",
  "63437": "The Drawing Beside the Prayer",
  "77855": "Pray for Brother Nicholas",
  "67450": "My Beloved Quill",
  "75381": "Evening in Zittau",
  "80012": "And Thus It Ends",
  "80013": "The Little Work Is Finished",
  "67722": "My Beloved Margaret",
  "26879": "Whom Shall I Fear?",
}));

const titleFor = (card, used) => {
  const curated = curatedTitles.get(String(card.id));
  if (curated) return curated;
  const text = `${card.quote} ${card.visualNote}`.toLowerCase();
  const has = (value) => card.features.includes(value);
  let title;
  if (has("cipher or wordplay")) title = "The Scribe’s Hidden Name";
  else if (has("graphical element") && /animal|bird|dragon|face|head/.test(text)) title = "The Creature in the Final Line";
  else if (has("graphical element")) title = "The Sign Beside the Amen";
  else if (has("drink")) title = "A Cup After the Final Word";
  else if (has("scribal complaint")) title = "The Aching Hand";
  else if (has("erasure")) title = "The Farewell Almost Erased";
  else if (has("colour change") && has("highlighted writing")) title = "The Rubricated Farewell";
  else if (has("colour change")) title = "The Last Line in Red";
  else if (has("verse")) title = "The Scribe’s Closing Verse";
  else if (/qui scripsit|qui me scripsit/.test(text)) title = "Remember the Hand That Wrote Me";
  else if (/deo gratias|deo gracias|laus.*deo|laudetur/.test(text)) title = "Thanks at the Final Line";
  else if (/amen.*amen|amen\s*$/.test(text)) title = "The Final Amen";
  else if (/finit|explicit|complet/.test(text) && card.scribe !== "Unknown scribe") title = `The Testament of ${card.scribe.split(/[ ,]/)[0]}`;
  else if (has("later addition")) title = "A Voice Added in the Margin";
  else if (has("distinctive layout")) title = "Beyond the Final Line";
  else title = "A Voice at the Book’s End";
  const count = used.get(title) || 0;
  used.set(title, count + 1);
  return count === 0 ? title : `${title} · ${card.place.split(",")[0]}`;
};

const candidates = textual.map((record) => {
  const quote = clean(first(record, "quote_clean", "quote"));
  const fileDetail = (record.details || []).find((d) => d.fieldType === "file" && /^image\/(jpeg|png|tiff)$/i.test(d.value?.file?.fxm_MimeType || "") && /^https?:/i.test(d.value?.file?.ulf_ExternalFileReference || ""));
  if (!quote || !fileDetail) return null;
  const remoteImageUrl = fileDetail.value.file.ulf_ExternalFileReference;
  const host = new URL(remoteImageUrl).hostname.toLowerCase();
  const manuscriptRef = first(record, "Manuscript_key");
  const manuscript = manuscriptRef?.id ? recordById.get(String(manuscriptRef.id)) : null;
  const place = clean(first(record, "origPlace : proposed location", "origPlace") || first(manuscript || {}, "origPlace : proposed origin", "origPlace") || "Unknown place");
  const dateValue = first(record, "origDate", "origDate : proposed date") || first(manuscript || {}, "origDate : proposed date", "origDate : from");
  const scribe = clean(first(record, "scribe (text)", "scribe (author of the annotation)") || "Unknown scribe");
  const features = featureData(record);
  const frequencies = ngrams(quote).map((phrase) => formulaCounts.get(phrase) || 1);
  const formulaFrequency = frequencies.length ? Math.max(...frequencies) : 1;
  const visualScore = features.reduce((sum, feature) => sum + ({ "cipher or wordplay": 34, "graphical element": 29, "verse": 22, "scribal complaint": 20, drink: 18, "colour change": 16, "highlighted writing": 12, erasure: 15, "later addition": 9, "distinctive layout": 7 }[feature] || 0), 0);
  const formulaScore = Math.max(-20, 32 - Math.log2(formulaFrequency + 1) * 8);
  const metadataScore = (scribe !== "Unknown scribe" ? 6 : 0) + (place !== "Unknown place" ? 4 : 0) + (quote.length > 80 ? 5 : 0);
  const score = visualScore + formulaScore + metadataScore + (preferredHosts.get(host) ?? 8);
  return {
    record,
    score,
    quote,
    formulaFrequency,
    features,
    remoteImageUrl,
    fileDetail,
    place,
    year: yearFrom(dateValue) || 1400,
    scribe,
    locus: clean(first(record, "locus") || "unknown folio"),
    manuscript: clean(manuscript?.rec_Title || manuscriptRef || "Unidentified manuscript"),
    visualNote: clean(first(record, "visual_note", "note") || ""), visualScore,
  };
}).filter(Boolean).sort((a, b) => b.score - a.score);

const similarity = (left, right) => {
  const a = new Set(normalize(left).split(" ").filter(Boolean));
  const b = new Set(normalize(right).split(" ").filter(Boolean));
  const intersection = [...a].filter((word) => b.has(word)).length;
  const union = new Set([...a, ...b]).size;
  return union ? intersection / union : 0;
};
const highInterest = candidates.slice(0, 26);
const highIds = new Set(highInterest.map((item) => item.record.rec_ID));
const commonFormulae = candidates
  .filter((item) => !highIds.has(item.record.rec_ID) && item.formulaFrequency >= 40 && item.visualScore <= 45 && (preferredHosts.get(new URL(item.remoteImageUrl).hostname.toLowerCase()) ?? 0) >= 18)
  .sort((a, b) => b.formulaFrequency - a.formulaFrequency || a.visualScore - b.visualScore)
  .slice(0, 12);
const queuedIds = new Set([...highInterest, ...commonFormulae].map((item) => item.record.rec_ID));
const selectionQueue = [...highInterest, ...commonFormulae, ...candidates.filter((item) => !queuedIds.has(item.record.rec_ID))];

const imageDir = path.resolve("public/colophons");
await mkdir(imageDir, { recursive: true });
const selected = [];
let failed = 0;
for (const candidate of selectionQueue) {
  if (selected.length >= TARGET_COUNT) break;
  if (selected.some((item) => similarity(item.quote, candidate.quote) > 0.76)) continue;
  const extension = /png/i.test(candidate.fileDetail.value.file.fxm_MimeType) ? "png" : /tiff/i.test(candidate.fileDetail.value.file.fxm_MimeType) ? "tif" : "jpg";
  const filename = `${safeName(String(candidate.record.rec_ID))}.${extension}`;
  if (shouldDownload) {
    try {
      const response = await fetch(candidate.remoteImageUrl, { redirect: "follow", signal: AbortSignal.timeout(20000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const mime = response.headers.get("content-type") || "";
      if (mime && !mime.startsWith("image/") && mime !== "application/octet-stream") throw new Error(`not an image (${mime})`);
      await writeFile(path.join(imageDir, filename), Buffer.from(await response.arrayBuffer()));
    } catch (error) {
      failed += 1;
      console.warn(`Skipped ${candidate.record.rec_ID}: ${error.message}`);
      continue;
    }
  }
  selected.push({ ...candidate, filename });
  process.stdout.write(`Selected ${selected.length}/${TARGET_COUNT}\r`);
}

const rarityByRank = (index) => index === 0 ? "Unique" : index < 5 ? "Legendary" : index < 12 ? "Epic" : index < 20 ? "Rare" : index < 26 ? "Uncommon" : "Common";
const usedTitles = new Map();
const cards = selected.map((item, index) => {
  const draft = {
    id: Number(item.record.rec_ID), quote: item.quote, translation: "Translation pending", scribe: item.scribe,
    place: item.place, year: item.year, rarity: rarityByRank(index), mood: item.features[0] || "scribal voice", sigil: "Q",
    imageUrl: `/colophons/${item.filename}`, remoteImageUrl: item.remoteImageUrl, manuscript: item.manuscript,
    locus: item.locus, sourceUrl: item.remoteImageUrl, formulaFrequency: item.formulaFrequency,
    features: item.features, rarityReason: `Formula appears in up to ${item.formulaFrequency} records; ${item.features.length ? item.features.join(", ") : "unusual wording"}.`,
    visualNote: item.visualNote,
  };
  return { ...draft, title: titleFor(draft, usedTitles) };
});

await mkdir(path.resolve("app/data"), { recursive: true });
await writeFile(path.resolve("app/data/colophons.generated.ts"), `// Generated from Heurist. Re-run npm run import:heurist to refresh.\nexport const HEURIST_COLOPHONS = ${JSON.stringify(cards, null, 2)} as const;\n`, "utf8");
await writeFile(path.resolve("app/data/colophons.manifest.json"), JSON.stringify({ generatedAt: new Date().toISOString(), source: path.basename(source), analysedRecords: textual.length, imageCandidates: candidates.length, selected: cards.length, failedDownloads: failed, method: "formula frequency + visual interest + image source reliability" }, null, 2), "utf8");
console.log(`\nAnalysed ${textual.length} colophons and selected ${cards.length}. Failed image attempts: ${failed}.`);
