import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, pick, type Guide } from '@dokyu/shared';
import { HomeText as AppText } from './HomeText';
import { Icon } from '../ui/Icon';
import { useSettings } from '../../lib/settings';
import type { Tile } from './ServiceGrid';
import { useLayout } from '../../lib/useLayout';

const POPULAR = ['nbi-clearance', 'passport', 'psa-birth-certificate'];

export function PopularGuides({ guides }: { guides: Guide[] }) {
  const { isDesktop } = useLayout();
  const { t } = useTranslation();
  const { language } = useSettings();
  const router = useRouter();
  const popular = POPULAR.flatMap((slug) => {
    const guide = guides.find((g) => g.slug === slug);
    return guide ? [guide] : [];
  });
  return (
    <View
      className={isDesktop ? 'rounded-card border bg-surface p-4' : 'gap-3'}
      style={{ borderColor: colors.refinedBorder }}
    >
      <View className="flex-row flex-wrap items-center justify-between gap-2 pb-2">
        <AppText variant="h2" weight="bold">
          {t('home.popular')}
        </AppText>
      </View>
      {(isDesktop ? popular : popular.slice(0, 1)).map((guide, index) => (
        <Pressable
          key={guide.slug}
          accessibilityRole="button"
          accessibilityLabel={pick(guide.title, language)}
          onPress={() => router.push({ pathname: '/guides/[slug]', params: { slug: guide.slug } })}
          className="flex-row items-center gap-3 px-2 py-3 active:opacity-70"
          style={{
            minHeight: 64,
            borderWidth: isDesktop ? 0 : 1,
            borderTopWidth: isDesktop ? (index ? 1 : 0) : 1,
            borderRadius: isDesktop ? 0 : 14,
            backgroundColor: '#FFFFFF',
            borderColor: colors.refinedBorder,
          }}
        >
          <Icon name="document" size={isDesktop ? 34 : 30} color={colors.primary} />
          <View className="flex-1 gap-1">
            <AppText variant="body" weight="bold">
              {pick(guide.title, language)}
            </AppText>
            <AppText variant="small" tone="muted">
              {t(`categories.${guide.category}`)}
            </AppText>
          </View>
          <Icon name="chevronRight" size={18} color={colors.primary} />
        </Pressable>
      ))}
    </View>
  );
}

export function VisitTools({ tiles }: { tiles: Tile[] }) {
  const { t } = useTranslation();
  return (
    <View
      className="gap-3 rounded-card border bg-surface p-4"
      style={{ borderColor: colors.refinedBorder }}
    >
      <AppText variant="h2" weight="bold">
        {t('home.planVisit')}
      </AppText>
      {tiles.slice(0, 2).map((tile) => (
        <Pressable
          key={tile.key}
          accessibilityRole="button"
          accessibilityLabel={tile.label}
          onPress={tile.onPress}
          className="min-h-[52px] flex-row items-center gap-3 rounded-lg border px-3 py-3 active:bg-primary-soft"
          style={{ borderColor: colors.refinedBorder }}
        >
          <Icon name={tile.icon} size={26} color={colors.primary} />
          <AppText variant="body" weight="semibold" style={{ flex: 1 }}>
            {tile.label}
          </AppText>
          <Icon name="chevronRight" size={16} color={colors.primary} />
        </Pressable>
      ))}
    </View>
  );
}
