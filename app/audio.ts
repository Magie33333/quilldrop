// Quilldrop Scriptorium Web Audio Engine
// Autentické procedurální zvukové efekty bez externích MP3 závislostí

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem("quilldrop_sound_enabled");
  return stored === null ? true : stored === "true";
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("quilldrop_sound_enabled", enabled ? "true" : "false");
}

/**
 * Prasknutí a rozpečetění voskové pečeti (Wax Seal Crack & Tear)
 */
export function playSealCrack() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 1. Křupnutí vosku (brittle crackle - burst of noise with sharp decay)
  const bufferSize = ctx.sampleRate * 0.15;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.025));
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(1400, now);
  filter.Q.setValueAtTime(3, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.7, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(now);

  // 2. Basový ráz rozlomení pečeti (low thump)
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);

  oscGain.gain.setValueAtTime(0.6, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.2);

  // 3. Roztržení hedvábné stuhy (gentle rip / rustle)
  setTimeout(() => {
    playParchmentFlip(0.2);
  }, 40);
}

/**
 * Šustění těžkého pergamenu při otočení či vysunutí karty
 */
export function playParchmentFlip(volume = 0.35) {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const duration = 0.22;
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Měkký šum s organickým průběhem
  for (let i = 0; i < bufferSize; i++) {
    const progress = i / bufferSize;
    const envelope = Math.sin(progress * Math.PI) * (1 - progress * 0.4);
    data[i] = (Math.random() * 2 - 1) * envelope;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(600, now);
  filter.frequency.linearRampToValueAtTime(1600, now + duration * 0.5);
  filter.frequency.linearRampToValueAtTime(500, now + duration);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(now);
}

/**
 * Škrábání husího brku o pergamen při psaní v paleografickém přepisu
 */
let lastScratchTime = 0;
export function playQuillScratch() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  if (now - lastScratchTime < 0.05) return; // ochrana proti přetížení při rychlém psaní
  lastScratchTime = now;

  const duration = 0.035 + Math.random() * 0.02;
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1);
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  const freq = 2800 + (Math.random() * 1400 - 700);
  filter.frequency.setValueAtTime(freq, now);
  filter.Q.setValueAtTime(4, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(now);
}

/**
 * Fanfára a zvonivý akord při odhalení karty podle její vzácnosti
 */
export function playTriumphFanfare(rarity: string) {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const normRarity = (rarity || "").toLowerCase();

  const notes: { freq: number; delay: number; duration: number }[] = [];

  if (normRarity.includes("unique") || normRarity.includes("legendary")) {
    // Majestátní slavnostní arpeggio (C4 - G4 - C5 - E5 - G5 - C6)
    const freqs = [261.63, 392.0, 523.25, 659.25, 783.99, 1046.5];
    freqs.forEach((f, idx) => {
      notes.push({ freq: f, delay: idx * 0.09, duration: 1.6 - idx * 0.1 });
    });
  } else if (normRarity.includes("epic")) {
    // Triumfální 4-tónový akord (G4 - C5 - E5 - G5)
    const freqs = [392.0, 523.25, 659.25, 783.99];
    freqs.forEach((f, idx) => {
      notes.push({ freq: f, delay: idx * 0.08, duration: 1.1 });
    });
  } else if (normRarity.includes("rare")) {
    // Stříbřitý trojzvuk (C5 - E5 - G5)
    const freqs = [523.25, 659.25, 783.99];
    freqs.forEach((f, idx) => {
      notes.push({ freq: f, delay: idx * 0.07, duration: 0.85 });
    });
  } else {
    // Příjemný pergamenový dvojtón (C4 -> G4)
    notes.push({ freq: 392.0, delay: 0, duration: 0.5 });
    notes.push({ freq: 523.25, delay: 0.08, duration: 0.7 });
  }

  notes.forEach(({ freq, delay, duration }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = normRarity.includes("legendary") || normRarity.includes("unique") ? "sine" : "triangle";
    osc.frequency.setValueAtTime(freq, now + delay);

    if (normRarity.includes("legendary")) {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(freq * 1.003, now + delay);
      gain2.gain.setValueAtTime(0.12, now + delay);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + delay);
      osc2.stop(now + delay + duration);
    }

    const maxGain = normRarity.includes("legendary") ? 0.22 : 0.18;
    gain.gain.setValueAtTime(0.001, now + delay);
    gain.gain.linearRampToValueAtTime(maxGain, now + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + delay);
    osc.stop(now + delay + duration);
  });
}

/**
 * Jemný dotykový pergamenový klik pro tlačítka
 */
export function playSoftClick() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(140, now + 0.04);

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.05);
}

/**
 * Zvonivý zvuk cinknutí zlatých mincí při nákupu či získání zlaťáků
 */
export function playCoinClink() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const coins = [
    { freq: 2400, delay: 0, dur: 0.28 },
    { freq: 3100, delay: 0.04, dur: 0.32 },
  ];

  coins.forEach(({ freq, delay, dur }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + delay);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.92, now + delay + dur);

    gain.gain.setValueAtTime(0.001, now + delay);
    gain.gain.linearRampToValueAtTime(0.18, now + delay + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + delay);
    osc.stop(now + delay + dur);
  });
}

