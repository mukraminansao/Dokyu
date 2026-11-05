import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, manilaTime } from '@dokyu/shared';
import { HomeText as AppText } from './HomeText';
import { ReferenceDoki } from '../ui/ReferenceDoki';
import { Icon } from '../ui/Icon';
import { Float } from '../../lib/motion';
import { useSettings } from '../../lib/settings';
import { useLayout } from '../../lib/useLayout';
import { useNow } from '../../lib/offices';
import { GradientFill } from '../ui/GradientFill';

function timeGreeting(hour: number) {
  if (hour < 12) return 'home.morning';
  if (hour < 18) return 'home.afternoon';
  return 'home.evening';
}

/** Personalized header and the approved Bayan Blue welcome banner. */
export function GreetingCard({ name }: { name?: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { municipality, province, largeText } = useSettings();
  const { width, isDesktop } = useLayout();
  const area = [municipality, province].filter(Boolean).join(', ');
  const now = useNow();
  const compact = width < 600;
  const stacked = largeText || width < 360;

  return (
    <View className="gap-4">
      <View className="flex-row items-start justify-between gap-3">
        <View style={{ flex: 1 }}>
          <AppText
            variant={isDesktop ? 'hero' : 'h1'}
            weight="bold"
            tone="primaryDark"
            style={{
              fontSize: largeText ? 32 : isDesktop ? 28 : 24,
              lineHeight: largeText ? 42 : 34,
            }}
          >
            {t(timeGreeting(Math.floor(manilaTime(now).minutes / 60)))} {name ?? t('home.friend')}
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('home.changeArea') + ': ' + (area || t('home.setArea'))}
            onPress={() => router.push('/setup')}
            className="min-h-[44px] flex-row items-center gap-2 self-start py-1"
            style={{ maxWidth: '100%' }}
          >
            <Icon name="pin" size={16} color={colors.primary} />
            <AppText variant="body" weight="medium" tone="primaryDark" style={{ flexShrink: 1 }}>
              {municipality || province || t('home.setArea')}
            </AppText>
            <View style={{ transform: [{ rotate: '90deg' }] }}>
              <Icon name="chevronRight" size={14} color={colors.primaryDark} />
            </View>
          </Pressable>
        </View>
        {isDesktop ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('nav.account')}
            onPress={() => router.push('/account')}
            className="min-h-[44px] flex-row items-center gap-2 rounded-full bg-primary-soft px-3"
          >
            <Icon name="account" size={20} color={colors.primaryDark} />
            {name ? (
              <AppText variant="body" weight="medium">
                {name}
              </AppText>
            ) : null}
          </Pressable>
        ) : null}
      </View>
      <View
        className="overflow-hidden rounded-card bg-primary-soft"
        style={{
          padding: compact ? 16 : 24,
          flexDirection: stacked ? 'column' : 'row',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <GradientFill from={colors.heroTop} to={colors.heroBottom} />
        <View style={{ flex: stacked ? undefined : 1, alignSelf: 'stretch' }} className="gap-2">
          <AppText
            variant={compact ? 'h1' : 'hero'}
            weight="bold"
            tone="primary"
            style={{
              fontSize: largeText ? 32 : compact ? 24 : 36,
              lineHeight: largeText ? 44 : compact ? 28 : 43,
              letterSpacing: -0.8,
            }}
          >
            {t('home.heroTitle')}
          </AppText>
          {!compact || largeText ? (
            <AppText variant="bodyLg" tone="primaryDark">
              {t('home.heroBody')}
            </AppText>
          ) : null}
        </View>
        <View
          aria-hidden
          pointerEvents="none"
          style={{
            alignSelf: stacked ? 'flex-end' : 'center',
            width: compact ? 92 : 180,
            height: compact ? 54 : 100,
          }}
        >
          <View style={{ position: 'absolute', top: compact ? -5 : -12, left: 0 }}>
            <Float amount={3}>
              <ReferenceDoki size={compact ? 100 : 180} />
            </Float>
          </View>
        </View>
      </View>
    </View>
  );
}
