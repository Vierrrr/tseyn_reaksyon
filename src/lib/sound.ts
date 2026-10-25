import { Platform } from 'react-native';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

let soundEnabled = true;

// Ensure audio plays even if iPhone/Android is in silent mode
if (Platform.OS !== 'web') {
  setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
}

export function getSoundEnabled(): boolean {
  return soundEnabled;
}

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
}

export function toggleSound(): boolean {
  soundEnabled = !soundEnabled;
  return soundEnabled;
}

// -------------------------------------------------------------
// Native Audio Asset Players (iOS & Android via expo-audio)
// -------------------------------------------------------------
const SOUND_ASSETS = {
  tap: require('../../assets/sounds/tap.wav'),
  burst: require('../../assets/sounds/burst.wav'),
  bounce: require('../../assets/sounds/bounce.wav'),
  eat: require('../../assets/sounds/eat.wav'),
  combo1: require('../../assets/sounds/combo1.wav'),
  combo2: require('../../assets/sounds/combo2.wav'),
  combo3: require('../../assets/sounds/combo3.wav'),
  combo4: require('../../assets/sounds/combo4.wav'),
  combo5: require('../../assets/sounds/combo5.wav'),
  win: require('../../assets/sounds/win.wav'),
};

const nativePlayers: Partial<Record<keyof typeof SOUND_ASSETS, AudioPlayer>> = {};

function playNative(key: keyof typeof SOUND_ASSETS): void {
  try {
    let player = nativePlayers[key];
    if (!player) {
      player = createAudioPlayer(SOUND_ASSETS[key]);
      nativePlayers[key] = player;
    }
    player.seekTo(0);
    player.play();
  } catch {
    // ignore audio playback errors
  }
}

// -------------------------------------------------------------
// Web Audio Procedural Sound Synthesizer (Zero-latency on Web)
// -------------------------------------------------------------
type AudioContextType = typeof window extends { AudioContext: infer T } ? T : any;
let audioCtx: any = null;

function getAudioContext(): any {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: AudioContextType }).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

const COMBO_FREQS = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];

export function playTapSound(): void {
  if (!soundEnabled) return;

  if (Platform.OS !== 'web') {
    playNative('tap');
    return;
  }

  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.07);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.075);
  } catch {
    // ignore
  }
}

export function playBurstSound(): void {
  if (!soundEnabled) return;

  if (Platform.OS !== 'web') {
    playNative('burst');
    return;
  }

  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.16);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.17);

    const bufferSize = Math.floor(ctx.sampleRate * 0.1);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(700, now);
    filter.Q.setValueAtTime(2, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
  } catch {
    // ignore
  }
}

export function playBounceSound(): void {
  if (!soundEnabled) return;

  if (Platform.OS !== 'web') {
    playNative('bounce');
    return;
  }

  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.08);

    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.095);
  } catch {
    // ignore
  }
}

export function playEatSound(): void {
  if (!soundEnabled) return;

  if (Platform.OS !== 'web') {
    playNative('eat');
    return;
  }

  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';

    osc1.frequency.setValueAtTime(520, now);
    osc1.frequency.linearRampToValueAtTime(240, now + 0.07);
    osc1.frequency.linearRampToValueAtTime(420, now + 0.12);
    osc1.frequency.exponentialRampToValueAtTime(140, now + 0.22);

    osc2.frequency.setValueAtTime(380, now);
    osc2.frequency.linearRampToValueAtTime(190, now + 0.08);
    osc2.frequency.exponentialRampToValueAtTime(110, now + 0.22);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.22);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.25);
    osc2.stop(now + 0.25);
  } catch {
    // ignore
  }
}

export function playComboSound(comboStep: number): void {
  if (!soundEnabled) return;

  if (Platform.OS !== 'web') {
    const key = `combo${Math.min(5, Math.max(1, comboStep))}` as keyof typeof SOUND_ASSETS;
    playNative(key);
    return;
  }

  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const noteIdx = Math.min(comboStep - 1, COMBO_FREQS.length - 1);
    const baseFreq = COMBO_FREQS[Math.max(0, noteIdx)];

    const osc = ctx.createOscillator();
    const harmonic = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);

    harmonic.type = 'triangle';
    harmonic.frequency.setValueAtTime(baseFreq * 2, now);

    const volume = Math.min(0.45, 0.25 + comboStep * 0.03);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    harmonic.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    harmonic.start(now);
    osc.stop(now + 0.3);
    harmonic.stop(now + 0.3);
  } catch {
    // ignore
  }
}

export function playWinSound(): void {
  if (!soundEnabled) return;

  if (Platform.OS !== 'web') {
    playNative('win');
    return;
  }

  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const now = ctx.currentTime + i * 0.11;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.35, now);
      const duration = i === notes.length - 1 ? 0.6 : 0.18;
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    });
  } catch {
    // ignore
  }
}
