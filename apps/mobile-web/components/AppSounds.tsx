import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { useSettings } from '../lib/settings';
import {
  initializeSounds,
  playSound,
  setSoundEnabled,
  setSoundForeground,
  unlockSounds,
} from '../lib/sounds';

/** One lifecycle owner; covers browser links/switches in addition to shared Pressables. */
export function AppSounds() {
  const { ready, soundEffects } = useSettings();
  useEffect(() => {
    if (!ready) return;
    const dispose = initializeSounds();
    setSoundForeground(
      AppState.currentState !== 'background' && AppState.currentState !== 'inactive',
    );
    const subscription = AppState.addEventListener('change', (state) =>
      setSoundForeground(state === 'active'),
    );
    if (Platform.OS !== 'web')
      return () => {
        subscription.remove();
        dispose();
      };
    const visibility = () => setSoundForeground(!document.hidden);
    const click = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const control = target?.closest(
        'button,a,[role="button"],[role="tab"],[role="checkbox"],[role="radio"],[role="switch"]',
      );
      if (
        !control ||
        control.matches(':disabled') ||
        control.closest('[inert],[aria-disabled="true"],[disabled]')
      )
        return;
      playSound('tap');
    };
    document.addEventListener('pointerdown', unlockSounds, true);
    document.addEventListener('keydown', unlockSounds, true);
    document.addEventListener('click', click, true);
    document.addEventListener('visibilitychange', visibility);
    visibility();
    return () => {
      subscription.remove();
      document.removeEventListener('pointerdown', unlockSounds, true);
      document.removeEventListener('keydown', unlockSounds, true);
      document.removeEventListener('click', click, true);
      document.removeEventListener('visibilitychange', visibility);
      dispose();
    };
  }, [ready]);
  useEffect(() => setSoundEnabled(ready && soundEffects), [ready, soundEffects]);
  return null;
}
