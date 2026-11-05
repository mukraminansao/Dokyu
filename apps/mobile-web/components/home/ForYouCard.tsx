import { Animated, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GOALS, colors, pick } from '@dokyu/shared';
import { HomeText as AppText } from './HomeText';
import { Icon } from '../ui/Icon';
import { useLayout } from '../../lib/useLayout';
import { useAnimatedProgress, usePressScale } from '../../lib/motion';
import { useSettings } from '../../lib/settings';
import type { ForYou } from '../../lib/forYou';
import { GradientFill } from '../ui/GradientFill';

/** Blue next-step card with real progress and a clear gold action. */
export function ForYouCard({ item }: { item: ForYou }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { language, largeText } = useSettings();
  const { width } = useLayout();
  const horizontal = width >= 900 && !largeText;
  const press = usePressScale(0.98);
  const progress = useAnimatedProgress(item.kind === 'continue' ? item.done / item.total : 0);

  let label: string;
  let title: string;
  let text: string;
  let cta: string;
  let onPress: () => void;
  let art: React.ReactNode;

  if (item.kind === 'continue') {
    label = t('home.continueLabel');
    title = pick(item.guide.title, language);
    text = t('home.continueText', { done: item.done, total: item.total });
    cta = t('home.continueCta');
    onPress = () =>
      router.push({ pathname: '/guides/[slug]/checklist', params: { slug: item.guide.slug } });
    art = (
      <Icon name="documentPerson" size={horizontal ? 64 : 44} color="#FFFFFF" strokeWidth={1.7} />
    );
  } else if (item.kind === 'goal') {
    const goal = GOALS.find((g) => g.slug === item.goal);
    label = t('home.goalLabel', {
      goal: (goal ? (language === 'tl' ? goal.tl : goal.en) : '').toUpperCase(),
    });
    title = pick(item.guide.title, language);
    text = pick(item.why, language);
    cta = t('home.goalCta', { title: pick(item.guide.title, language) });
    onPress = () => router.push({ pathname: '/goals', params: { goal: item.goal } });
    art = (
      <Icon name="documentPerson" size={horizontal ? 64 : 44} color="#FFFFFF" strokeWidth={1.7} />
    );
  } else {
    label = t('home.pickLabel');
    title = t('home.pickTitle');
    text = t('home.pickText');
    cta = t('home.pickCta');
    onPress = () => router.push('/goals');
    art = (
      <Icon name="documentPerson" size={horizontal ? 64 : 44} color="#FFFFFF" strokeWidth={1.7} />
    );
  }

  return (
    <Animated.View style={press.style}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${text}. ${cta}`}
        onPress={onPress}
        {...press.handlers}
        className="overflow-hidden rounded-card bg-primary"
        style={{
          gap: horizontal ? 20 : 12,
          padding: horizontal ? 20 : 16,
          paddingLeft: horizontal ? 43 : 24,
          flexDirection: horizontal ? 'row' : 'column',
          alignItems: horizontal ? 'center' : 'stretch',
        }}
      >
        <GradientFill from={colors.primary} to="#1234B3" />
        <View
          className="flex-row items-center"
          style={{ flex: horizontal ? 1 : undefined, gap: horizontal ? 24 : 16 }}
        >
          {!largeText ? (
            <View
              aria-hidden
              pointerEvents="none"
              style={{
                paddingRight: horizontal ? 32 : 16,
                borderRightWidth: 1,
                borderRightColor: '#7189ED',
              }}
            >
              {art}
            </View>
          ) : null}
          <View className="flex-1" style={{ gap: horizontal ? 8 : 4 }}>
            <AppText variant="body" weight="semibold" style={{ color: '#FFFFFF' }}>
              {label}
            </AppText>
            <AppText
              variant={horizontal ? 'hero' : 'h1'}
              weight="bold"
              tone="inverse"
              style={{ lineHeight: largeText ? 44 : horizontal ? 40 : 30 }}
            >
              {title}
            </AppText>
            <AppText variant="body" style={{ color: '#FFFFFF' }}>
              {text}
            </AppText>
            {item.kind === 'continue' ? (
              <View
                accessibilityRole="progressbar"
                accessibilityLabel={t('home.checklistProgress')}
                accessibilityValue={{ min: 0, max: item.total, now: item.done, text }}
                className="mt-1 overflow-hidden rounded-full"
                style={{ height: 10, backgroundColor: 'rgba(255,255,255,0.3)' }}
              >
                <Animated.View
                  style={{
                    height: '100%',
                    borderRadius: 999,
                    width: progress,
                    backgroundColor: colors.goldBright,
                  }}
                />
              </View>
            ) : null}
          </View>
        </View>
        <View
          className="flex-row items-center justify-center gap-2 overflow-hidden rounded-lg bg-gold-bright px-4 py-2"
          style={{ minHeight: horizontal ? 52 : 44, width: horizontal ? 236 : undefined }}
        >
          <GradientFill from={colors.goldBright} to="#FFC633" />
          <AppText
            variant="bodyLg"
            weight="semibold"
            tone="primaryDark"
            style={{ flexShrink: 1, textAlign: 'center' }}
          >
            {cta}
          </AppText>
          <Icon name="arrowRight" color={colors.primaryDark} size={20} />
        </View>
      </Pressable>
    </Animated.View>
  );
}
