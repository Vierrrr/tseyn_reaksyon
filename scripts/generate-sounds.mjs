import fs from 'fs';
import path from 'path';

const outDir = path.resolve('assets', 'sounds');
fs.mkdirSync(outDir, { recursive: true });

function encodeWav(sampleRate, samples) {
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF chunk descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Write samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const int16 = s < 0 ? s * 0x8000 : s * 0x7fff;
    buffer.writeInt16LE(Math.round(int16), offset);
    offset += 2;
  }

  return buffer;
}

const SR = 44100;

function generateTap() {
  const duration = 0.08;
  const numSamples = Math.floor(SR * duration);
  const samples = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SR;
    const progress = t / duration;
    const freq = 750 * Math.exp(-progress * 2.8);
    const env = Math.exp(-progress * 6.5);
    const sine = Math.sin(2 * Math.PI * freq * t);
    samples[i] = sine * env * 0.8;
  }
  return encodeWav(SR, samples);
}

function generateBurst() {
  const duration = 0.22;
  const numSamples = Math.floor(SR * duration);
  const samples = new Float32Array(numSamples);
  let noiseFilter = 0;
  for (let i = 0; i < numSamples; i++) {
    const t = i / SR;
    const progress = t / duration;
    // Sub-bass punch
    const subFreq = 180 * Math.exp(-progress * 3.2);
    const subEnv = Math.exp(-progress * 5.0);
    const sub = Math.sin(2 * Math.PI * subFreq * t) * subEnv * 0.65;

    // Filtered noise explosion burst
    const rawNoise = (Math.random() * 2 - 1) * Math.exp(-progress * 7.5);
    noiseFilter += 0.15 * (rawNoise - noiseFilter);
    const noise = noiseFilter * 0.6;

    samples[i] = Math.max(-1, Math.min(1, sub + noise));
  }
  return encodeWav(SR, samples);
}

function generateBounce() {
  const duration = 0.1;
  const numSamples = Math.floor(SR * duration);
  const samples = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SR;
    const progress = t / duration;
    // Pitch slide up for bouncy rubber effect
    const freq = 320 + 260 * Math.sin(progress * Math.PI * 0.5);
    const env = Math.sin(progress * Math.PI) * Math.exp(-progress * 3.2);
    samples[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.75;
  }
  return encodeWav(SR, samples);
}

function generateEat() {
  const duration = 0.25;
  const numSamples = Math.floor(SR * duration);
  const samples = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SR;
    const progress = t / duration;
    // Crunch chew modulation: frequency wobbles up then plunges
    const freq1 = 520 - 320 * Math.sin(progress * Math.PI * 1.5);
    const freq2 = 380 - 240 * Math.sin(progress * Math.PI * 1.2);
    const env = Math.exp(-progress * 4.2);
    const tone1 = Math.sin(2 * Math.PI * freq1 * t);
    const tone2 = Math.sign(Math.sin(2 * Math.PI * freq2 * t)) * 0.5; // square distortion
    samples[i] = (tone1 * 0.6 + tone2 * 0.4) * env * 0.85;
  }
  return encodeWav(SR, samples);
}

function generateCombo(noteIdx) {
  const freqs = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
  const baseFreq = freqs[Math.min(noteIdx, freqs.length - 1)];
  const duration = 0.32;
  const numSamples = Math.floor(SR * duration);
  const samples = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SR;
    const progress = t / duration;
    const env = Math.exp(-progress * 4.0);
    // Fundamental + 2nd harmonic bell chime
    const sine1 = Math.sin(2 * Math.PI * baseFreq * t);
    const sine2 = Math.sin(2 * Math.PI * baseFreq * 2 * t) * 0.35;
    samples[i] = (sine1 + sine2) * env * 0.75;
  }
  return encodeWav(SR, samples);
}

function generateWin() {
  const duration = 0.7;
  const numSamples = Math.floor(SR * duration);
  const samples = new Float32Array(numSamples);
  const notes = [
    { freq: 523.25, start: 0.0, dur: 0.16 },
    { freq: 659.25, start: 0.12, dur: 0.16 },
    { freq: 783.99, start: 0.24, dur: 0.2 },
    { freq: 1046.5, start: 0.38, dur: 0.32 },
  ];
  for (const n of notes) {
    const startSample = Math.floor(n.start * SR);
    const noteSamples = Math.floor(n.dur * SR);
    for (let j = 0; j < noteSamples; j++) {
      const idx = startSample + j;
      if (idx >= numSamples) break;
      const t = j / SR;
      const progress = j / noteSamples;
      const env = Math.exp(-progress * 3.8);
      const tone = Math.sin(2 * Math.PI * n.freq * t) + Math.sin(4 * Math.PI * n.freq * t) * 0.25;
      samples[idx] += tone * env * 0.45;
    }
  }
  return encodeWav(SR, samples);
}

fs.writeFileSync(path.join(outDir, 'tap.wav'), generateTap());
fs.writeFileSync(path.join(outDir, 'burst.wav'), generateBurst());
fs.writeFileSync(path.join(outDir, 'bounce.wav'), generateBounce());
fs.writeFileSync(path.join(outDir, 'eat.wav'), generateEat());
fs.writeFileSync(path.join(outDir, 'combo1.wav'), generateCombo(0));
fs.writeFileSync(path.join(outDir, 'combo2.wav'), generateCombo(1));
fs.writeFileSync(path.join(outDir, 'combo3.wav'), generateCombo(2));
fs.writeFileSync(path.join(outDir, 'combo4.wav'), generateCombo(3));
fs.writeFileSync(path.join(outDir, 'combo5.wav'), generateCombo(4));
fs.writeFileSync(path.join(outDir, 'win.wav'), generateWin());

console.log('Successfully generated all WAV sound effects in assets/sounds!');
