import { createSoundGate } from './soundGate';
import { renderSound, SOUND_SAMPLE_RATE, SOUND_VOLUME, type SoundCue } from './soundCues';

const gate = createSoundGate();
let context: AudioContext | undefined;
let unlocked = false;
let generation = 0;
const buffers = new Map<SoundCue, AudioBuffer>();
const playing = new Map<AudioBufferSourceNode, SoundCue>();

export function initializeSounds() {
  return () => {
    setSoundEnabled(false);
    void context?.close().catch(() => {});
    context = undefined;
    buffers.clear();
    unlocked = false;
  };
}

function stop(cue?: SoundCue) {
  for (const [source, kind] of playing) {
    if (cue && kind !== cue) continue;
    try {
      source.stop();
    } catch {
      /* Already ended. */
    }
    source.disconnect();
    playing.delete(source);
  }
}

export function stopGuideSounds() {
  for (const cue of ['move', 'step', 'hello', 'complete'] as const) stop(cue);
}

export function setSoundEnabled(enabled: boolean) {
  gate.setEnabled(enabled);
  if (!enabled) {
    generation++;
    stop();
  }
}

export function setSoundForeground(foreground: boolean) {
  gate.setForeground(foreground);
  if (!foreground) {
    generation++;
    stop();
    void context?.suspend().catch(() => {});
  }
}

/** Called inside real pointer/keyboard activation. Never queue blocked automatic tour cues. */
export function unlockSounds() {
  if (!gate.canPlay()) return;
  try {
    const AudioContextClass =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    context ??= new AudioContextClass();
    unlocked = true;
    if (context.state === 'suspended') void context.resume().catch(() => {});
  } catch {
    /* Unsupported or blocked audio leaves the UI usable. */
  }
}

function start(cue: SoundCue) {
  if (!context || context.state !== 'running' || !gate.canPlay()) return;
  if (cue !== 'tap') stopGuideSounds();
  stop(cue);
  let buffer = buffers.get(cue);
  if (!buffer) {
    const samples = renderSound(cue);
    buffer = context.createBuffer(1, samples.length, SOUND_SAMPLE_RATE);
    buffer.getChannelData(0).set(samples);
    buffers.set(cue, buffer);
  }
  const source = context.createBufferSource();
  const volume = context.createGain();
  volume.gain.value = SOUND_VOLUME;
  source.buffer = buffer;
  source.connect(volume);
  volume.connect(context.destination);
  playing.set(source, cue);
  source.onended = () => {
    source.disconnect();
    volume.disconnect();
    playing.delete(source);
  };
  source.start();
  if (__DEV__) console.log('[Dokyu audio]', cue, context.state);
}

export function playSound(cue: SoundCue) {
  if (cue === 'tap') unlockSounds();
  if (!unlocked || !context || !gate.accept(cue)) return;
  try {
    if (context.state === 'running') start(cue);
    else if (cue === 'tap') {
      const requested = Date.now();
      const session = generation;
      void context
        .resume()
        .then(() => {
          if (session === generation && Date.now() - requested < 200) start(cue);
        })
        .catch(() => {});
    }
  } catch {
    /* Audio failure must not interrupt navigation or forms. */
  }
}
