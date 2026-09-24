// Quilldrop Medieval Level Curve & Stationer Economy Engine
// Autentický středověký systém zkušeností písaře a univerzitního stacionáře

export type PackQuality = "standard" | "refined" | "masterwork";
export type Language = "cs" | "en";

/**
 * Progresivní XP křivka pro další úroveň.
 * Čím vyšší je úroveň písaře, tím více zkušeností (XP) vyžaduje postup.
 */
export function xpNeededForNextLevel(currentLevel: number): number {
  if (currentLevel < 1) return 100;
  if (currentLevel <= 5) return 100;
  if (currentLevel <= 10) return 150;
  if (currentLevel <= 15) return 220;
  if (currentLevel <= 20) return 300;
  if (currentLevel <= 25) return 400;
  if (currentLevel <= 30) return 500;
  if (currentLevel <= 35) return 650;
  if (currentLevel <= 40) return 800;
  if (currentLevel <= 45) return 1000;
  if (currentLevel <= 50) return 1250;
  return 1500;
}

/**
 * Vypočítá úroveň hráče z celkového počtu XP podle progresivní křivky.
 */
export function levelForXp(xp: number): number {
  if (!xp || xp <= 0) return 1;
  let lvl = 1;
  let remaining = xp;
  while (true) {
    const needed = xpNeededForNextLevel(lvl);
    if (remaining >= needed) {
      remaining -= needed;
      lvl += 1;
    } else {
      break;
    }
  }
  return lvl;
}

export interface LevelProgress {
  level: number;
  currentXpInLevel: number;
  xpNeededForNextLevel: number;
  percent: number;
  remainingXp: number;
}

/**
 * Poskytuje detailní statistiku postupu v rámci aktuální úrovně.
 */
export function getLevelProgress(xp: number): LevelProgress {
  if (!xp || xp <= 0) {
    return {
      level: 1,
      currentXpInLevel: 0,
      xpNeededForNextLevel: 100,
      percent: 0,
      remainingXp: 100,
    };
  }
  let lvl = 1;
  let remaining = xp;
  while (true) {
    const needed = xpNeededForNextLevel(lvl);
    if (remaining >= needed) {
      remaining -= needed;
      lvl += 1;
    } else {
      break;
    }
  }
  const needed = xpNeededForNextLevel(lvl);
  const percent = Math.min(100, Math.max(0, Math.round((remaining / needed) * 100)));
  return {
    level: lvl,
    currentXpInLevel: remaining,
    xpNeededForNextLevel: needed,
    percent,
    remainingXp: Math.max(0, needed - remaining),
  };
}

/**
 * Autentické středověké tituly písařského cechu a univerzitního skriptoria
 * odstupňované každých 5 úrovní až po úroveň 51+.
 */
export function getTitleForLevel(level: number, lang: Language = "cs", role?: string): string {
  if (role === "admin") {
    return lang === "en" ? "👑 Master of Scriptorium" : "👑 Mistr skriptoria";
  }
  if (level >= 51) {
    return lang === "en" ? "Supreme Grandmaster of the Codex" : "Nejvyšší velmistr kodexu";
  }
  if (level >= 46) {
    return lang === "en" ? "Prior of the Scriptorium" : "Představený skriptoria";
  }
  if (level >= 41) {
    return lang === "en" ? "Protonotary Chancellor" : "Kancelářský protonotář";
  }
  if (level >= 36) {
    return lang === "en" ? "Master Corrector & Censor" : "Korektor a cenzor textů";
  }
  if (level >= 31) {
    return lang === "en" ? "Keeper of the Codices" : "Kustod kodexů & bibliotékář";
  }
  if (level >= 26) {
    return lang === "en" ? "Guild Notary" : "Cechovní notář & listinář";
  }
  if (level >= 21) {
    return lang === "en" ? "Master Illuminator" : "Mistr iluminátor";
  }
  if (level >= 16) {
    return lang === "en" ? "Rubricator & Glossator" : "Rubrikátor a glosátor";
  }
  if (level >= 11) {
    return lang === "en" ? "Copyist & Calligrapher" : "Písař kopiář & kaligraf";
  }
  if (level >= 6) {
    return lang === "en" ? "Journeyman Scribe" : "Písařský tovaryš";
  }
  return lang === "en" ? "Scriptorium Apprentice" : "Učedník ve skriptoriu";
}

/**
 * Ceny balíčků v cechovních zlaťácích v dílně stacionáře:
 * - Běžný balíček (Pecia exemplaris): 40 zlaťáků
 * - Učencův balíček (Collectio scholarium): 90 zlaťáků
 * - Královský balíček (Codex regius illuminatus): 220 zlaťáků
 */
export const STATIONER_PRICES: Record<PackQuality, number> = {
  standard: 40,
  refined: 90,
  masterwork: 220,
};

/**
 * Deterministický denní generátor skladových zásob stacionáře na základě data (YYYY-MM-DD).
 * Zajišťuje férovost a ochranu proti podvádění (obnovení stránky nezmění zásoby).
 */
export function getDailyStationerStock(dateStr: string): Record<PackQuality, number> {
  let h = 0x811c9dc5;
  for (let i = 0; i < dateStr.length; i++) {
    h = Math.imul(h ^ dateStr.charCodeAt(i), 0x01000193);
  }
  const seed = Math.abs(h);
  return {
    standard: 2 + (seed % 3),                   // 2, 3 nebo 4 ks
    refined: 1 + ((seed >> 3) % 2),             // 1 nebo 2 ks
    masterwork: ((seed >> 6) % 3 === 0) ? 0 : 1, // 0 nebo 1 ks (některé dny není královský kodex k dispozici)
  };
}
