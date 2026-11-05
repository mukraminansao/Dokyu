/** Original Dokyu earcons. Web synthesis and bundled native WAVs use the same score. */
export const SOUND_CUES = {
  tap: [{ at: 0, duration: 0.055, frequency: 620, endFrequency: 430, gain: 0.16 }],
  move: [
    { at: 0, duration: 0.055, frequency: 380, endFrequency: 250, gain: 0.055 },
    { at: 0.075, duration: 0.055, frequency: 440, endFrequency: 280, gain: 0.045 },
  ],
  step: [
    { at: 0, duration: 0.1, frequency: 880, endFrequency: 880, gain: 0.09 },
    { at: 0.065, duration: 0.13, frequency: 1174.66, endFrequency: 1174.66, gain: 0.075 },
  ],
  hello: [
    { at: 0, duration: 0.15, frequency: 523.25, endFrequency: 523.25, gain: 0.1 },
    { at: 0.085, duration: 0.15, frequency: 659.25, endFrequency: 659.25, gain: 0.085 },
    { at: 0.17, duration: 0.18, frequency: 783.99, endFrequency: 783.99, gain: 0.075 },
  ],
  complete: [
    { at: 0, duration: 0.17, frequency: 783.99, endFrequency: 783.99, gain: 0.1 },
    { at: 0.09, duration: 0.18, frequency: 1046.5, endFrequency: 1046.5, gain: 0.09 },
    { at: 0.18, duration: 0.24, frequency: 1318.51, endFrequency: 1318.51, gain: 0.075 },
  ],
} as const;

export type SoundCue = keyof typeof SOUND_CUES;
export const SOUND_SAMPLE_RATE = 22050;
export const SOUND_VOLUME = 0.75;

/** Soft attack/release avoids clicks; quiet harmonics give the notes a rounded, wooden tone. */
export function renderSound(cue: SoundCue, sampleRate = SOUND_SAMPLE_RATE): Float32Array {
  const notes = SOUND_CUES[cue];
  const duration = Math.max(...notes.map((note) => note.at + note.duration));
  const samples = new Float32Array(Math.ceil((duration + 0.012) * sampleRate));
  for (const note of notes) {
    const offset = Math.round(note.at * sampleRate);
    const count = Math.ceil(note.duration * sampleRate);
    for (let i = 0; i < count; i++) {
      const t = i / sampleRate;
      const phase =
        2 *
        Math.PI *
        (note.frequency * t + ((note.endFrequency - note.frequency) * t * t) / (2 * note.duration));
      const attack = Math.min(1, t / 0.004);
      const release = Math.max(0, 1 - t / note.duration) ** 2;
      const tone = Math.sin(phase) + 0.12 * Math.sin(phase * 2);
      const index = offset + i;
      if (index < samples.length)
        samples[index] = (samples[index] ?? 0) + tone * attack * release * note.gain;
    }
  }
  return samples;
}
