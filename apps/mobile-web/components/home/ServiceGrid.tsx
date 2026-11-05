import { Animated, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@dokyu/shared';
import { HomeText as AppText } from './HomeText';
import { Icon, type IconName } from '../ui/Icon';
import { usePressScale } from '../../lib/motion';
import { useLayout } from '../../lib/useLayout';
import { useSettings } from '../../lib/settings';

export interface Tile {
  key: string;
  icon: IconName;
  label: string;
  soon?: boolean;
  onPress: () => void;
}

function TileButton({ tile }: { tile: Tile }) {
  const { width, isDesktop } = useLayout();
  const { largeText } = useSettings();
  const { t } = useTranslation();
  const press = usePressScale(0.97);
  return (
    <Animated.View style={[press.style, { flex: 1 }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={tile.soon ? tile.label + ', ' + t('home.soon') : tile.label}
        onPress={tile.onPress}
        {...press.handlers}
        className="flex-1 flex-row items-center rounded-lg border bg-surface py-3 active:bg-primary-soft"
        style={{
          minHeight: isDesktop ? 76 : largeText ? 72 : width < 360 ? 68 : 64,
          paddingHorizontal: isDesktop ? 10 : width < 360 ? 8 : 12,
          gap: isDesktop || width < 360 ? 6 : 8,
          borderColor: colors.refinedBorder,
        }}
      >
        <Icon name={tile.icon} size={isDesktop ? 30 : largeText ? 36 : 32} color={colors.primary} />
        <AppText
          variant="body"
          weight="semibold"
          tone="primaryDark"
          style={{
            flex: 1,
            minWidth: 0,
            ...(!isDesktop && !largeText
              ? { fontSize: width < 360 ? 14 : 15, lineHeight: 21 }
              : {}),
          }}
        >
          {tile.label}
        </AppText>
        {tile.soon ? (
          <AppText variant="caption" tone="muted">
            {t('home.soon')}
          </AppText>
        ) : isDesktop ? (
          <Icon name="chevronRight" size={14} color={colors.primary} />
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

/** Text-first category tiles, two across on phones and four on wider screens. */
export function ServiceGrid({ tiles }: { tiles: Tile[] }) {
  const { width, isDesktop } = useLayout();
  const { largeText } = useSettings();
  const columns = largeText ? (width >= 1180 ? 2 : 1) : width >= (isDesktop ? 1040 : 760) ? 4 : 2;
  return (
    <View className="flex-row flex-wrap" style={{ margin: -5 }}>
      {tiles.map((tile) => (
        <View
          key={tile.key}
          style={{ width: ((100 / columns).toString() + '%') as `${number}%`, padding: 5 }}
        >
          <TileButton tile={tile} />
        </View>
      ))}
    </View>
  );
}
