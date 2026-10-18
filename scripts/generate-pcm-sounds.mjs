/**
 * Piwowar (Brewcraft) — Deterministic PCM Audio Alert Generator
 * Generates lossless 16-bit 44.1kHz mono WAV files:
 * 1. kettle_gong.wav (220-440Hz brass kettle resonance)
 * 2. workshop_bell.wav (1100Hz piercing workshop bell)
 * 3. hop_chime.wav (1320Hz/1760Hz two-tone action chime)
 */

import fs from 'fs';
import path from 'path';

const SAMPLE_RATE = 44100;

function createWavBuffer(samples) {
  const numSamples = samples.length;
  const subChunk2Size = numSamples * 2; // 16-bit mono = 2 bytes per sample
  const buffer = Buffer.alloc(44 + subChunk2Size);

  // RIFF chunk descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + subChunk2Size, 4);
  buffer.write('WAVE', 8);

  // fmt sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subChunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // audioFormat (1 = PCM)
  buffer.writeUInt16LE(1, 22); // numChannels (1 = mono)
  buffer.writeUInt32LE(SAMPLE_RATE, 24); // sampleRate
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28); // byteRate = sampleRate * numChannels * bitsPerSample/8
  buffer.writeUInt16LE(2, 32); // blockAlign = numChannels * bitsPerSample/8
  buffer.writeUInt16LE(16, 34); // bitsPerSample = 16

  // data sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(subChunk2Size, 40);

  // PCM samples
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    // Clamp sample between -1.0 and 1.0
    const clamped = Math.max(-1.0, Math.min(1.0, samples[i]));
    const intSample = clamped < 0 ? clamped * 32768 : clamped * 32767;
    buffer.writeInt16LE(Math.round(intSample), offset);
    offset += 2;
  }

  return buffer;
}

// 1. Kettle Gong: 2.5s deep vessel resonance
function generateKettleGong() {
  const duration = 2.5;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const attack = Math.min(1.0, t / 0.008); // 8ms attack
    const decay = 0.65 * Math.exp(-1.8 * t) + 0.35 * Math.exp(-0.75 * t);
    const tremolo = 1.0 + 0.08 * Math.sin(2 * Math.PI * 2.2 * t);

    // Partials
    const f0 = 220; // A3 fundamental
    const f1 = 440; // 1st overtone
    const f2 = 618; // Inharmonic bell metallic component
    const f3 = 880; // Bright ring

    const wave =
      0.55 * Math.sin(2 * Math.PI * f0 * t) +
      0.30 * Math.sin(2 * Math.PI * f1 * t) +
      0.15 * Math.sin(2 * Math.PI * f2 * t) * Math.exp(-3.0 * t) +
      0.08 * Math.sin(2 * Math.PI * f3 * t) * Math.exp(-4.5 * t);

    samples[i] = wave * attack * decay * tremolo * 0.95;
  }

  return samples;
}

// 2. Workshop Bell: 2.0s clear mechanical piercing bell
function generateWorkshopBell() {
  const duration = 2.0;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const attack = Math.min(1.0, t / 0.003); // 3ms crisp attack
    const decay = Math.exp(-3.2 * t);

    // Frequencies: 1100Hz + 2200Hz + 3300Hz
    const f0 = 1100;
    const f1 = 2200;
    const f2 = 3300;

    // Transient hammer strike noise
    const hammer = t < 0.02 ? (Math.random() * 2 - 1) * 0.15 * (1 - t / 0.02) : 0;

    const wave =
      0.65 * Math.sin(2 * Math.PI * f0 * t) +
      0.25 * Math.sin(2 * Math.PI * f1 * t) +
      0.10 * Math.sin(2 * Math.PI * f2 * t) +
      hammer;

    samples[i] = wave * attack * decay * 0.95;
  }

  return samples;
}

// 3. Hop Chime: 1.5s crisp two-tone alert (E6 + A6)
function generateHopChime() {
  const duration = 1.5;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  const tSplit = 0.22; // Note 1: 0..0.22s, Note 2: 0.22..1.5s

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;

    // Note 1: 1318.5 Hz (E6)
    if (t < tSplit + 0.5) {
      const t1 = t;
      const attack1 = Math.min(1.0, t1 / 0.004);
      const decay1 = Math.exp(-5.0 * t1);
      s += 0.5 * Math.sin(2 * Math.PI * 1318.5 * t1) * attack1 * decay1;
    }

    // Note 2: 1760.0 Hz (A6)
    if (t >= tSplit) {
      const t2 = t - tSplit;
      const attack2 = Math.min(1.0, t2 / 0.004);
      const decay2 = Math.exp(-2.8 * t2);
      s += 0.6 * Math.sin(2 * Math.PI * 1760.0 * t2) * attack2 * decay2;
    }

    samples[i] = s * 0.95;
  }

  return samples;
}

// Main execution
const targetDir = path.resolve('assets', 'sounds');
fs.mkdirSync(targetDir, { recursive: true });

const gongBuf = createWavBuffer(generateKettleGong());
fs.writeFileSync(path.join(targetDir, 'kettle_gong.wav'), gongBuf);
console.log(`[generate-pcm-sounds] Generated kettle_gong.wav (${gongBuf.length} bytes)`);

const bellBuf = createWavBuffer(generateWorkshopBell());
fs.writeFileSync(path.join(targetDir, 'workshop_bell.wav'), bellBuf);
console.log(`[generate-pcm-sounds] Generated workshop_bell.wav (${bellBuf.length} bytes)`);

const chimeBuf = createWavBuffer(generateHopChime());
fs.writeFileSync(path.join(targetDir, 'hop_chime.wav'), chimeBuf);
console.log(`[generate-pcm-sounds] Generated hop_chime.wav (${chimeBuf.length} bytes)`);
