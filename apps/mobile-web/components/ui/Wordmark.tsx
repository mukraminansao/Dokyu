import { Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { colors } from '@dokyu/shared';

/** Folder mark and blue wordmark from the approved refined design. */
export function Wordmark({ size = 24 }: { size?: number }) {
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Dokyu"
      style={{ flexDirection: 'row', alignItems: 'center', gap: size * 0.2 }}
    >
      <View aria-hidden pointerEvents="none">
        <Svg width={size * 1.1} height={size} viewBox="0 0 40 36">
          <Rect x={6} y={5} width={19} height={8} rx={3} fill="#E5485B" />
          <Path d="M3 11h24a3 3 0 0 1 3 3v17H3z" fill={colors.goldBright} />
          <Path d="M7 9h19l8 7v14H7z" fill="#FFFFFF" stroke={colors.primaryTint} />
          <Path d="M9 14h26a3 3 0 0 1 3 3l-4 13a3 3 0 0 1-3 2H5z" fill={colors.primary} />
        </Svg>
      </View>
      <Text
        aria-hidden
        className="font-poppins-bold"
        style={{ fontSize: size, letterSpacing: -0.8, color: colors.primary }}
        maxFontSizeMultiplier={1}
      >
        dokyu
      </Text>
    </View>
  );
}
