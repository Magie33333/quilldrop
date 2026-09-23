import assert from "node:assert";

// 1. Test fastHash and computeStateSignature logic
const INTEGRITY_SALT = "quilldrop_sigil_guard_2026_sec_alpha";
function fastHash(str) {
  let h1 = 0x811c9dc5;
  let h2 = 5381;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 0x01000193);
    h2 = (Math.imul(h2, 33) + ch) | 0;
  }
  return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
}

function computeStateSignature(state, userId) {
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

function verifyStateSignature(savedStateWithSig, userId) {
  if (!savedStateWithSig || typeof savedStateWithSig !== "object") return false;
  const sig = savedStateWithSig._sig;
  if (!sig || typeof sig !== "string") return false;
  return sig === computeStateSignature(savedStateWithSig, userId);
}

function sanitizeCollection(rawCollection, validCards) {
  const result = {};
  if (!rawCollection || typeof rawCollection !== "object") return result;
  const validIds = new Set(validCards.map((c) => String(c.id)));
  for (const [key, rawCount] of Object.entries(rawCollection)) {
    const keyStr = String(key);
    if (!validIds.has(keyStr)) continue;
    const count = parseInt(String(rawCount), 10);
    if (!isNaN(count) && count > 0) {
      result[key] = Math.min(Math.max(1, count), 99);
    }
  }
  return result;
}

function getDaysDifference(dateStr1, dateStr2) {
  if (!dateStr1 || !dateStr2) return 999;
  const d1 = new Date(dateStr1 + "T00:00:00Z");
  const d2 = new Date(dateStr2 + "T00:00:00Z");
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 999;
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

console.log("=== BEZPEČNOSTNÍ TESTY PROTI PODVODŮM ===");

// TEST 1: Podpis a detekce lokální modifikace
const legitimateState = {
  xp: 150,
  coins: 80,
  streak: 3,
  puzzle: 3,
  packsOpened: 1,
  gamesPlayed: 2,
  lastPlayed: "2026-09-23",
  lastLoginDate: "2026-09-23",
  collection: { 1: 2, 2: 1 },
  trophies: ["first-spark"],
};
const sig = computeStateSignature(legitimateState, "user-123");
const saved = { ...legitimateState, _sig: sig };

assert.strictEqual(verifyStateSignature(saved, "user-123"), true, "Legitimní stav musí projít.");
console.log("✓ Test 1A: Legitimní stav ověřen jako pravý.");

// Pokus o cheat: Zvýšení XP
const hackedXp = { ...saved, xp: 999999 };
assert.strictEqual(verifyStateSignature(hackedXp, "user-123"), false, "Změna XP v localStorage musí selhat.");
console.log("✓ Test 1B: Podvržení XP úspěšně detekováno a zablokováno.");

// Pokus o cheat: Přidání karty
const hackedCard = { ...saved, collection: { ...saved.collection, 999: 1 } };
assert.strictEqual(verifyStateSignature(hackedCard, "user-123"), false, "Přidání karty v localStorage musí selhat.");
console.log("✓ Test 1C: Podvržení neoprávněné karty úspěšně detekováno a zablokováno.");

// Pokus o cheat: Vynulování otevřených balíčků
const hackedPacks = { ...saved, packsOpened: 0 };
assert.strictEqual(verifyStateSignature(hackedPacks, "user-123"), false, "Vynulování počtu balíčků musí selhat.");
console.log("✓ Test 1D: Resetování denních balíčků v localStorage úspěšně detekováno a zablokováno.");

// Pokus o cheat: Vynulování počtu her
const hackedGames = { ...saved, gamesPlayed: 0 };
assert.strictEqual(verifyStateSignature(hackedGames, "user-123"), false, "Vynulování počtu her musí selhat.");
console.log("✓ Test 1E: Resetování počtu her v localStorage úspěšně detekováno a zablokováno.");

// TEST 2: Detekce manipulace s časem (Time Manipulation)
assert.strictEqual(getDaysDifference("2026-09-23", "2026-09-24"), 1, "Posun na další den = 1.");
assert.strictEqual(getDaysDifference("2026-09-24", "2026-09-23"), -1, "Vrácení hodin zpět = -1 (nesmí zvýšit streak!).");
assert.strictEqual(getDaysDifference("2026-09-23", "2026-09-23"), 0, "Stejný den = 0.");
assert.strictEqual(getDaysDifference("2026-09-23", "2026-09-26"), 3, "Vynechání 3 dní = 3 (streak se zruší).");
console.log("✓ Test 2: Výpočet dnů je orientovaný (signed) a rollback hodin vrací záporné číslo.");

// TEST 3: Sanitizace neexistujících karet
const mockCatalog = [{ id: 1 }, { id: 2 }, { id: 3 }];
const dirtyCollection = { 1: 5, 2: 1, 999: 10, "xss-inject": 1, 3: 1000 };
const clean = sanitizeCollection(dirtyCollection, mockCatalog);
assert.deepStrictEqual(clean, { 1: 5, 2: 1, 3: 99 }, "Neplatné karty musí být zahozeny a počty zastropovány.");
console.log("✓ Test 3: Podvržené ID karet zahozeny a počty bezpečně omezeny na max 99.");

console.log("==========================================");
console.log("VŠECHNY BEZPEČNOSTNÍ TESTY PROŠLY NA 100%!");
