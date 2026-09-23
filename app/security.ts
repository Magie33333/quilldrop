/**
 * Quilldrop Anti-Cheat & Security Engine
 * 
 * Zajišťuje ochranu herní ekonomiky proti:
 * 1. Změnám systémového data a času (přetáčení hodin dopředu/dozadu pro neomezené balíčky a dny)
 * 2. Lokální manipulaci s kartami, XP, zlaťáky a herním postupem v localStorage
 * 3. Duplicitám uživatelských jmen při registraci v Supabase Auth
 */

const TIME_WATERMARK_KEY = "quilldrop_time_watermark_v1";
const INTEGRITY_SALT = "quilldrop_sigil_guard_2026_sec_alpha";

let cachedServerOffsetMs = 0;
let hasSynced = false;
let syncPromise: Promise<void> | null = null;

/**
 * Synchronizace s autoritativním serverovým časem (/api/time).
 */
export async function syncServerTime(): Promise<void> {
  if (typeof window === "undefined") return;
  if (syncPromise) return syncPromise;

  syncPromise = (async () => {
    try {
      const t0 = performance.now();
      const res = await fetch("/api/time", {
        cache: "no-store",
        headers: { Pragma: "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        const roundtrip = performance.now() - t0;
        const estimatedServerNow = Number(data.timestamp) + Math.round(roundtrip / 2);
        cachedServerOffsetMs = estimatedServerNow - Date.now();
        hasSynced = true;
      }
    } catch {
      // Offline fallback – zachová se stávající čas s ochranou proti rollbacku
    }
  })();

  return syncPromise;
}

/**
 * Získání autoritativního časového razítka s ochranou proti rollbacku (anti-tamper).
 */
export function getSecureTimestamp(): number {
  let now = Date.now() + cachedServerOffsetMs;

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(TIME_WATERMARK_KEY);
      const watermark = stored ? parseInt(stored, 10) : 0;
      if (watermark && now < watermark) {
        // Detekován pokus o posun systémových hodin dozadu!
        // Čas zmrazíme na nejvyšším dosaženém časovém bodu, aby nebylo možné obnovit denní limity.
        now = watermark;
      } else if (now > watermark) {
        localStorage.setItem(TIME_WATERMARK_KEY, String(now));
      }
    } catch {
      // Ignorovat chyby localStorage
    }
  }

  return now;
}

/**
 * Získání autoritativního data ve formátu YYYY-MM-DD.
 */
export function getSecureDate(): string {
  const ts = getSecureTimestamp();
  return new Date(ts).toISOString().slice(0, 10);
}

/**
 * Rychlý obousměrný hash pro integritu herního stavu.
 */
function fastHash(str: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 5381;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 0x01000193);
    h2 = (Math.imul(h2, 33) + ch) | 0;
  }
  return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
}

/**
 * Vypočítá kryptografický otisk legitimního herního stavu.
 */
export function computeStateSignature(state: any, userId?: string): string {
  if (!state || typeof state !== "object") return "";

  const sortedCards = Object.entries(state.collection || {})
    .filter(([_, count]) => typeof count === "number" && count > 0)
    .sort(([a], [b]) => String(a).localeCompare(String(b)))
    .map(([id, count]) => `${id}:${count}`)
    .join(",");

  const payload = [
    userId || "anon",
    Number(state.xp) || 0,
    Number(state.coins) || 0,
    Number(state.streak) || 1,
    Number(state.puzzle) || 1,
    Number(state.packsOpened) || 0,
    Number(state.gamesPlayed) || 0,
    state.lastPlayed || "",
    state.lastLoginDate || "",
    sortedCards,
    Array.isArray(state.trophies) ? [...state.trophies].sort().join(",") : "",
    INTEGRITY_SALT,
  ].join("|");

  return fastHash(payload);
}

/**
 * Ověří, zda nebyl herní stav v localStorage manuálně upraven nebo podvržen.
 */
export function verifyStateSignature(savedStateWithSig: any, userId?: string): boolean {
  if (!savedStateWithSig || typeof savedStateWithSig !== "object") return false;
  const sig = savedStateWithSig._sig;
  if (!sig || typeof sig !== "string") {
    // Starý nebo nepodepsaný stav
    return false;
  }
  const expected = computeStateSignature(savedStateWithSig, userId);
  return sig === expected;
}

/**
 * Očistí a zvaliduje sbírku karet proti oficiálnímu katalogu.
 * Zabraňuje podvržení neexistujících karet nebo nesmyslných počtů.
 */
export function sanitizeCollection(
  rawCollection: any,
  validCards: { id: string | number; uuid?: string }[]
): Record<string | number, number> {
  const result: Record<string | number, number> = {};
  if (!rawCollection || typeof rawCollection !== "object") return result;

  const validIds = new Set(validCards.map((c) => String(c.id)));
  const validUuids = new Set(validCards.filter((c) => c.uuid).map((c) => String(c.uuid)));

  for (const [key, rawCount] of Object.entries(rawCollection)) {
    const keyStr = String(key);
    if (!validIds.has(keyStr) && !validUuids.has(keyStr)) {
      continue; // Karta neexistuje v databázi, ignorujeme ji
    }
    const count = parseInt(String(rawCount), 10);
    if (!isNaN(count) && count > 0) {
      result[key] = Math.min(Math.max(1, count), 99); // Max 99 duplikátů
    }
  }

  return result;
}

/**
 * Bezpečné a unikátní generování uživatelského jména pro Supabase Auth.
 * Zabraňuje chybě 23505 (unique_violation), pokud se registruje více lidí se stejným jménem.
 */
export function generateSafeUsername(displayName: string, email: string): string {
  const base =
    displayName
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "") ||
    email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "") ||
    "scribe";

  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${base}_${randomSuffix}`;
}
