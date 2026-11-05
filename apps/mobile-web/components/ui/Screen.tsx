import { useCallback, useRef, type ReactNode } from 'react';
import { Animated, Platform, ScrollView, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useTourMaybe, type Scrollable } from '../../lib/tour';
import { useReducedMotion } from '../../lib/motion';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLayout } from '../../lib/useLayout';
import { cn } from '../../lib/cn';
import { colors } from '@dokyu/shared';
import { ConnectionNotice } from './ConnectionNotice';

/**
 * Page wrapper: scrolls, respects the notch, and centres content with a readable max width.
 * Desktop gets more padding and a wider column; `wide` is for dashboards and the showcase.
 */
export function Screen({
  children,
  wide = false,
  className,
  tourScroll = false,
  canvas = true,
}: {
  children: ReactNode;
  wide?: boolean;
  className?: string;
  /** Let the guided tour scroll this screen to its targets. */
  tourScroll?: boolean;
  /** Soft canvas for the refined Home; other screens retain their current surface. */
  canvas?: boolean;
}) {
  const { isDesktop } = useLayout();
  const reduced = useReducedMotion();
  const tour = useTourMaybe();
  const scroll = useRef<Scrollable | null>(null);
  const offset = useRef(0);
  const setScroller = tour?.setScroller;
  useFocusEffect(
    useCallback(() => {
      if (!tourScroll || !scroll.current || !setScroller) return;
      setScroller({ ref: scroll.current, offset: () => offset.current });
      return () => setScroller(null);
    }, [tourScroll, setScroller]),
  );

  // Every time the screen comes into view it slides up and fades in a little.
  const enter = useRef(new Animated.Value(1)).current;
  useFocusEffect(
    useCallback(() => {
      if (reduced) return;
      enter.setValue(0);
      Animated.spring(enter, {
        toValue: 1,
        speed: 16,
        bounciness: 5,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }, [enter, reduced]),
  );
  const translateY = enter.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });
  const opacity = enter.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] });

  return (
    <SafeAreaView
      edges={isDesktop ? [] : ['top']}
      className={cn('flex-1', canvas ? 'bg-surface-alt' : 'bg-surface')}
      style={canvas ? { backgroundColor: colors.refinedCanvas } : undefined}
    >
      <ScrollView
        ref={(node: Scrollable | null) => {
          scroll.current = node;
        }}
        onScroll={(e) => {
          offset.current = e.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={32}
        contentContainerClassName={isDesktop ? 'px-6 pb-16 pt-7' : 'px-4 pb-16 pt-5'}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={{ opacity, transform: [{ translateY }] }}>
          <View
            className={cn('w-full self-center', canvas ? 'gap-4' : 'gap-5', className)}
            style={{ maxWidth: canvas ? 880 : wide ? 1080 : 760 }}
          >
            <ConnectionNotice />
            {children}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** A titled block inside a screen. */
export function Section({ children, className }: { children: ReactNode; className?: string }) {
  return <View className={cn('gap-3', className)}>{children}</View>;
}
