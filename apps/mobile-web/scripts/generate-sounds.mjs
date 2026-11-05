// Run from the project root: node --import tsx apps/mobile-web/scripts/generate-sounds.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import { SOUND_CUES, SOUND_SAMPLE_RATE, renderSound } from '../lib/soundCues.ts';

const folder = new URL('../assets/sounds/', import.meta.url);
await mkdir(folder, { recursive: true });
for (const cue of Object.keys(SOUND_CUES)) {
  const samples = renderSound(cue);
  const wav = Buffer.alloc(44 + samples.length * 2);
  wav.write('RIFF');
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(SOUND_SAMPLE_RATE, 24);
  wav.writeUInt32LE(SOUND_SAMPLE_RATE * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write('data', 36);
  wav.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((sample, i) =>
    wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, sample)) * 32767), 44 + i * 2),
  );
  await writeFile(new URL(cue + '.wav', folder), wav);
  console.log(cue, wav.length, 'bytes');
}
