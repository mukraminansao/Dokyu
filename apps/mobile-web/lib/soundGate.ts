import type { SoundCue } from './soundCues';

/** One gate for mute, foreground state and nested/rapid duplicate tap events. */
export function createSoundGate() {
  let enabled = false;
  let foreground = true;
  let lastTap = -Infinity;
  return {
    setEnabled(value: boolean) {
      enabled = value;
      if (!value) lastTap = -Infinity;
    },
    setForeground(value: boolean) {
      foreground = value;
    },
    canPlay: () => enabled && foreground,
    accept(cue: SoundCue, now = Date.now()) {
      if (!enabled || !foreground) return false;
      if (cue === 'tap') {
        if (now - lastTap < 70) return false;
        lastTap = now;
      }
      return true;
    },
  };
}
