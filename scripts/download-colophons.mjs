import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const destDir = path.resolve(__dirname, "../public/colophons");
await mkdir(destDir, { recursive: true });

// Read colophons.generated.ts
const colophonsPath = path.resolve(__dirname, "../app/data/colophons.generated.ts");
const content = await import(`file://${colophonsPath.replace(/\\/g, "/")}`);
const list = content.HEURIST_COLOPHONS || [];

console.log(`Downloading ${list.length} images to ${destDir}...`);

for (const card of list) {
  const filename = `${card.id}.jpg`;
  const filePath = path.join(destDir, filename);
  if (existsSync(filePath)) {
    console.log(`[SKIP] ${filename} already exists`);
    continue;
  }
  const url = card.remoteImageUrl || card.sourceUrl;
  if (!url) {
    console.warn(`[WARN] No remote URL for ${card.id}`);
    continue;
  }
  try {
    console.log(`[FETCH] ${card.id} -> ${url}`);
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) {
      console.error(`[FAIL] HTTP ${res.status} for ${url}`);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(filePath, buf);
    console.log(`[OK] Saved ${filename} (${buf.length} bytes)`);
  } catch (err) {
    console.error(`[ERROR] ${card.id}:`, err.message);
  }
}

console.log("Download complete!");
