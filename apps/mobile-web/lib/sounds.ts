import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { createSoundGate } from './soundGate';
import { SOUND_VOLUME, type SoundCue } from './soundCues';

// Static imports let Metro bundle the short clips for offline native playback.
/* eslint-disable @typescript-eslint/no-require-imports */
const SOURCES: Record<SoundCue, number> = {
  tap: require('../assets/sounds/tap.wav'),
  move: require('../assets/sounds/move.wav'),
  step: require('../assets/sounds/step.wav'),
  hello: require('../assets/sounds/hello.wav'),
  complete: require('../assets/sounds/complete.wav'),
};
/* eslint-enable @typescript-eslint/no-require-imports */
const gate = createSoundGate();
const players = new Map<SoundCue, AudioPlayer>();
let generation = 0;
const requests = new Map<SoundCue, number>();

export function initializeSounds() {
  void setAudioModeAsync({
    playsInSilentMode: false,
    interruptionMode: 'mixWithOthers',
    allowsRecording: false,
    shouldPlayInBackground: false,
    shouldRouteThroughEarpiece: false,
  }).catch(() => {});
  for (const cue of Object.keys(SOURCES) as SoundCue[]) {
    try {
      const player = createAudioPlayer(SOURCES[cue], { keepAudioSessionActive: false });
      player.volume = SOUND_VOLUME;
      players.set(cue, player);
    } catch {
      /* Audio must never prevent opening the app. */
    }
  }
  return () => {
    gate.setEnabled(false);
    generation++;
    for (const player of players.values()) {
      try {
        player.remove();
      } catch {
        /* Already released. */
      }
    }
    players.clear();
  };
}

function stop(cue: SoundCue) {
  requests.set(cue, (requests.get(cue) ?? 0) + 1);
  try {
    players.get(cue)?.pause();
  } catch {
    /* Released player. */
  }
}

export function stopGuideSounds() {
  for (const cue of players.keys()) if (cue !== 'tap') stop(cue);
}

export function setSoundEnabled(enabled: boolean) {
  gate.setEnabled(enabled);
  if (!enabled) {
    generation++;
    for (const cue of players.keys()) stop(cue);
  }
}

export function setSoundForeground(foreground: boolean) {
  gate.setForeground(foreground);
  if (!foreground) {
    generation++;
    for (const cue of players.keys()) stop(cue);
  }
}

/** Web implements gesture unlocking; native does not need it. */
export function unlockSounds() {}

export function playSound(cue: SoundCue) {
  if (!gate.accept(cue)) return;
  try {
    const player = players.get(cue);
    if (!player?.isLoaded) return;
    if (cue !== 'tap') stopGuideSounds();
    stop(cue);
    const session = generation;
    const request = requests.get(cue);
    void player
      .seekTo(0)
      .then(() => {
        if (gate.canPlay() && session === generation && request === requests.get(cue))
          player.play();
      })
      .catch(() => {});
  } catch {
    /* Platform audio errors cannot block the pressed action. */
  }
}
