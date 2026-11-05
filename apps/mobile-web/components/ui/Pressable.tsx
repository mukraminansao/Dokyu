import { forwardRef, type ElementRef } from 'react';
import { Pressable as NativePressable, type PressableProps } from 'react-native';
import { playSound } from '../../lib/sounds';

/** Shared activation feedback: scrolling, hover and disabled controls stay silent. */
export const Pressable = forwardRef<ElementRef<typeof NativePressable>, PressableProps>(
  function SoundPressable({ onPress, ...props }, ref) {
    return (
      <NativePressable
        {...props}
        ref={ref}
        android_disableSound
        onPress={
          onPress
            ? (event) => {
                playSound('tap');
                onPress(event);
              }
            : undefined
        }
      />
    );
  },
);
