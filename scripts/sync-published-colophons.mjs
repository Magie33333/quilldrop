import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabase = createClient(
  "https://xqsfjbmexokkmsfcsmdi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhxc2ZqYm1leG9ra21zZmNzbWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MjE4MDYsImV4cCI6MjEwNDI5NzgwNn0.qn1i3hNkBJHxUf1UzXOiNYeJetNKpGK2CJicUKvBk24"
);

async function sync() {
  console.log("Fetching all published cards from Supabase...");
  const { data, error } = await supabase
    .from("cards")
    .select(`
      id,
      slug,
      title,
      title_en,
      rarity,
      rarity_reason,
      rarity_reason_en,
      mood,
      sigil,
      status,
      image_url,
      crop_x,
      crop_y,
      crop_w,
      crop_h,
      colophons (
        id,
        heurist_id,
        quote,
        translation_cs,
        translation_en,
        scribe,
        place,
        year,
        locus,
        manuscript_shelfmark,
        visual_note,
        features,
        formula_frequency,
        source_url
      )
    `)
    .eq("status", "published")
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error("Failed to fetch published cards:", error);
    process.exit(1);
  }

  console.log(`Found ${data.length} published cards.`);

  const mapped = data.map((c) => ({
    id: c.colophons?.heurist_id || c.id,
    uuid: c.id,
    slug: c.slug || "",
    title: c.title,
    title_cs: c.title,
    title_en: c.title_en || undefined,
    quote: c.colophons?.quote || "Explicit...",
    translation: c.colophons?.translation_cs || "Překlad se připravuje",
    translation_cs: c.colophons?.translation_cs || undefined,
    translation_en: c.colophons?.translation_en || undefined,
    scribe: c.colophons?.scribe || "Neznámý písař",
    place: c.colophons?.place || "Neznámé místo",
    year: c.colophons?.year || 1400,
    rarity: c.rarity || "Common",
    mood: c.mood || "scribal voice",
    sigil: c.sigil || "Q",
    imageUrl: c.image_url || "/colophons/placeholder.jpg",
    remoteImageUrl: c.image_url || "/colophons/placeholder.jpg",
    manuscript: c.colophons?.manuscript_shelfmark || "Neznámý rukopis",
    locus: c.colophons?.locus || "fol. ?",
    sourceUrl: c.colophons?.source_url || c.image_url || "",
    formulaFrequency: c.colophons?.formula_frequency || 1,
    features: c.colophons?.features || [],
    rarityReason: c.rarity_reason || "",
    rarityReason_cs: c.rarity_reason || "",
    rarityReason_en: c.rarity_reason_en || undefined,
    visualNote: c.colophons?.visual_note || "",
    crop_x: Number(c.crop_x) || 0,
    crop_y: Number(c.crop_y) || 0,
    crop_w: Number(c.crop_w) || 100,
    crop_h: Number(c.crop_h) || 100,
    status: c.status || "published",
  }));

  const outPath = path.resolve("app/data/colophons.generated.ts");
  const content = `// Generated from Supabase published cards (${mapped.length} records).
export const HEURIST_COLOPHONS = ${JSON.stringify(mapped, null, 2)} as const;
`;

  fs.writeFileSync(outPath, content, "utf8");
  console.log(`✅ Successfully updated ${outPath} with ${mapped.length} published cards.`);
}

sync();
