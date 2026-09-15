import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// 1. Read credentials from .env.local
let dotenv = "";
try {
  dotenv = fs.readFileSync(".env.local", "utf8");
} catch {
  console.warn("Could not read .env.local, falling back to process.env");
}

const url = dotenv.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = dotenv.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("❌ Missing Supabase credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are present.");
  process.exit(1);
}

const supabase = createClient(url, key);

async function runBackup() {
  console.log("📜 Quilldrop Database Backup starting...");
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-");

  const backupDir = path.resolve("backups");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const tables = [
    { name: "cards", query: () => supabase.from("cards").select("*, colophons(*)") },
    { name: "colophons", query: () => supabase.from("colophons").select("*") },
    { name: "game_questions", query: () => supabase.from("game_questions").select("*") },
    { name: "profiles", query: () => supabase.from("profiles").select("*") },
    { name: "user_cards", query: () => supabase.from("user_cards").select("*") },
    { name: "card_gifts", query: () => supabase.from("card_gifts").select("*") },
  ];

  const backupData = {
    exported_at: now.toISOString(),
    version: "1.0",
    stats: {},
    tables: {},
  };

  for (const { name, query } of tables) {
    process.stdout.write(`  ⏳ Exporting table '${name}'... `);
    try {
      const { data, error } = await query();
      if (error) {
        console.log(`⚠️ Warning: ${error.message}`);
        backupData.tables[name] = [];
        backupData.stats[name] = 0;
      } else {
        const count = data ? data.length : 0;
        console.log(`✓ (${count} záznamů)`);
        backupData.tables[name] = data || [];
        backupData.stats[name] = count;
      }
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
      backupData.tables[name] = [];
      backupData.stats[name] = 0;
    }
  }

  const filename = `quilldrop-backup-${timestamp}.json`;
  const targetPath = path.join(backupDir, filename);
  const latestPath = path.join(backupDir, "latest.json");

  const jsonContent = JSON.stringify(backupData, null, 2);
  fs.writeFileSync(targetPath, jsonContent, "utf8");
  fs.writeFileSync(latestPath, jsonContent, "utf8");

  console.log("\n=======================================================");
  console.log("✅ Záloha databáze byla úspěšně vytvořena!");
  console.log(`📁 Soubor zálohy: ${targetPath}`);
  console.log(`📁 Poslední verze: ${latestPath}`);
  console.log("📊 Souhrn zálohy:");
  for (const [table, count] of Object.entries(backupData.stats)) {
    console.log(`   - ${table.padEnd(16)}: ${count} záznamů`);
  }
  console.log("=======================================================\n");
}

runBackup().catch((e) => {
  console.error("Backup failed:", e);
  process.exit(1);
});
