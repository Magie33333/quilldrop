import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const envFile = readFileSync(".env.local", "utf8");
const supabaseUrl = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const supabaseKey = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Načteme existující data z colophons.generated.ts
const content = readFileSync("app/data/colophons.generated.ts", "utf8");
const jsonStart = content.indexOf("[");
const jsonEnd = content.lastIndexOf("]") + 1;
const rawCards = JSON.parse(content.slice(jsonStart, jsonEnd));

console.log(`Nalezeno ${rawCards.length} kolofonů k nahrání...`);

for (const card of rawCards) {
  // 1. Vložíme nebo aktualizujeme colophon
  const { data: colophon, error: colError } = await supabase
    .from("colophons")
    .upsert({
      heurist_id: card.id,
      quote: card.quote,
      translation_cs: card.translation === "Translation pending" ? null : card.translation,
      scribe: card.scribe,
      place: card.place,
      year: card.year,
      locus: card.locus,
      visual_note: card.visualNote || null,
      features: card.features || [],
      formula_frequency: card.formulaFrequency || 1,
      source_url: card.sourceUrl,
      manuscript_shelfmark: card.manuscript,
    }, { onConflict: "heurist_id" })
    .select()
    .single();

  if (colError) {
    console.error(`Chyba při vkládání kolofonu ${card.id}:`, colError.message);
    continue;
  }

  // 2. Vložíme nebo aktualizujeme herní kartu
  const { error: cardError } = await supabase
    .from("cards")
    .upsert({
      colophon_id: colophon.id,
      slug: `colophon-${card.id}`,
      title: card.title,
      rarity: card.rarity,
      rarity_reason: card.rarityReason,
      mood: card.mood || "scribal voice",
      sigil: card.sigil || "Q",
      status: "published", // pro začátek published, aby se daly rovnou hrát
      image_url: card.remoteImageUrl,
      crop_x: 0,
      crop_y: 0,
      crop_w: 100,
      crop_h: 100,
    }, { onConflict: "slug" });

  if (cardError) {
    console.error(`Chyba při vkládání karty pro ${card.id}:`, cardError.message);
  } else {
    console.log(`✓ Karta nahrána: "${card.title}" (${card.rarity})`);
  }
}

console.log("\nHotovo! Všechny karty jsou bezpečně v Supabase.");
