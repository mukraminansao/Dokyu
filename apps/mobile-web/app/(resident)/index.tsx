/** Bayan Blue refined Home; see docs/UI-REFINEMENT-PLAN.md for the approved direction. */
import { useCallback, useState } from 'react';
import { HOME_TOUR, HOME_TOUR_VERSION, useTour, useTourTarget } from '../../lib/tour';
import { useFocusEffect, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@dokyu/shared';
import { Screen } from '../../components/ui/Screen';
import { Wordmark } from '../../components/ui/Wordmark';
import { HomeText as AppText } from '../../components/home/HomeText';
import { PressableCard } from '../../components/ui/Card';
import { Disclaimer } from '../../components/ui/Disclaimer';
import { Icon } from '../../components/ui/Icon';
import { GreetingCard } from '../../components/home/GreetingCard';
import { ServiceGrid, type Tile } from '../../components/home/ServiceGrid';
import { ForYouCard } from '../../components/home/ForYouCard';
import { PopularGuides, VisitTools } from '../../components/home/HomeSections';
import { FadeIn } from '../../lib/motion';
import { useLayout } from '../../lib/useLayout';
import { useAuth } from '../../lib/auth';
import { useGuides } from '../../lib/guides';
import { useSettings } from '../../lib/settings';
import { useAllChecklists } from '../../lib/checklist';
import { forYou } from '../../lib/forYou';
import { docAlerts, useMyDocs } from '../../lib/mydocs';
import { manilaTime } from '@dokyu/shared';
import { useNow } from '../../lib/offices';
import { TextLink } from '../../components/ui/TextLink';

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const { width, isDesktop } = useLayout();
  const { user } = useAuth();
  const { largeText, goals, tourSeen, homeTourVersion, update, ready } = useSettings();
  const columns = width >= 900 && !largeText;
  const tour = useTour();
  const servicesRef = useTourTarget('home.services');
  const forYouRef = useTourTarget('home.forYou');
  const startTour = tour.start;
  const touring = tour.steps !== null;
  // First visit: Doki shows the user around once.
  useFocusEffect(
    useCallback(() => {
      if (!ready || (tourSeen && homeTourVersion >= HOME_TOUR_VERSION) || touring) return;
      const timer = setTimeout(
        () =>
          startTour(HOME_TOUR, () =>
            update({ tourSeen: true, homeTourVersion: HOME_TOUR_VERSION }),
          ),
        900,
      );
      return () => clearTimeout(timer);
    }, [ready, tourSeen, homeTourVersion, touring, startTour, update]),
  );
  const { data: guides } = useGuides();

  // Re-read checklist progress whenever Home comes back into view.
  const [visit, setVisit] = useState(0);
  useFocusEffect(useCallback(() => setVisit((v) => v + 1), []));
  const ticks = useAllChecklists(
    guides.map((g) => g.slug),
    visit,
  );
  const next = forYou(guides, goals, ticks);
  const { docs } = useMyDocs();
  const now = useNow();
  // One line per document, even if a document has two alerts (ready + expired).
  const alerts = [...new Set(docAlerts(docs, manilaTime(now).iso).map((a) => a.doc.id))];
  const firstName = user?.fullName.split(' ')[0];

  // Document types: each opens Guides on that category.
  const findTiles: Tile[] = [
    { key: 'ids', icon: 'identity', label: t('tiles.ids'), category: 'identity' },
    {
      key: 'clearances',
      icon: 'shieldCheck',
      label: t('tiles.clearances'),
      category: 'clearances',
    },
    { key: 'civil', icon: 'document', label: t('tiles.civilRegistry'), category: 'civilRegistry' },
    { key: 'travel', icon: 'plane', label: t('tiles.travel'), category: 'travel' },
  ].map(({ category, ...tile }) => ({
    ...tile,
    icon: tile.icon as Tile['icon'],
    onPress: () => router.push({ pathname: '/guides', params: { category } }),
  }));
  // Tools for the trip itself.
  const planTiles: Tile[] = [
    {
      key: 'offices',
      icon: 'pin',
      label: t('home.findOffice'),
      onPress: () => router.push('/offices'),
    },
    {
      key: 'holidays',
      icon: 'calendar',
      label: t('home.checkHolidays'),
      onPress: () => router.push('/holidays'),
    },
    {
      key: 'checklists',
      icon: 'checklist',
      label: t('tiles.checklists'),
      onPress: () => router.push('/checklists'),
    },
    { key: 'docs', icon: 'docs', label: t('tiles.myDocs'), onPress: () => router.push('/docs') },
  ];

  return (
    <Screen wide tourScroll canvas dashboard className={isDesktop ? 'gap-4' : 'gap-3'}>
      {!isDesktop ? (
        <FadeIn style={{ marginBottom: -4 }}>
          <View className="flex-row items-center justify-between gap-4">
            <Wordmark size={32} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('nav.account')}
              onPress={() => router.push('/account')}
              className="h-11 w-11 items-center justify-center rounded-full border border-line bg-primary-soft active:bg-primary-soft"
            >
              <Icon
                name="accountFilled"
                size={22}
                color={colors.primaryDark}
                fill={colors.primaryDark}
              />
            </Pressable>
          </View>
        </FadeIn>
      ) : null}

      <FadeIn delay={40}>
        <GreetingCard name={firstName} />
      </FadeIn>

      {alerts.length ? (
        <FadeIn delay={60}>
          <PressableCard
            tone="gold"
            className="flex-row items-center gap-3"
            onPress={() => router.push('/docs')}
          >
            <Icon name="bell" size={22} color="#8A6400" />
            <AppText
              variant="body"
              weight="semibold"
              className="flex-1"
              style={{ color: '#5C4300' }}
            >
              {t('home.docAlerts', { count: alerts.length })}
            </AppText>
            <Icon name="chevronRight" size={20} color="#8A6400" />
          </PressableCard>
        </FadeIn>
      ) : null}

      {!isDesktop ? <HomeSearch /> : null}

      <FadeIn delay={80}>
        <View ref={forYouRef} collapsable={false}>
          <ForYouCard item={next} />
        </View>
      </FadeIn>

      {isDesktop ? <HomeSearch /> : null}

      <FadeIn delay={110}>
        <View className="gap-3">
          <View ref={servicesRef} collapsable={false}>
            <ServiceGrid tiles={findTiles} />
          </View>
        </View>
      </FadeIn>

      <View style={{ flexDirection: columns ? 'row' : 'column', gap: 20, alignItems: 'stretch' }}>
        <FadeIn delay={150} style={{ flex: columns ? 1.25 : undefined, minWidth: 0 }}>
          <PopularGuides guides={guides} />
        </FadeIn>
        <FadeIn delay={180} style={{ flex: columns ? 1 : undefined, minWidth: 0 }}>
          <View className="gap-4">
            <VisitTools tiles={planTiles} />
            <View className="flex-row items-start gap-3 rounded-card bg-gold-soft p-4">
              <Icon name="bell" size={26} color="#FFBB00" />
              <View className="flex-1 gap-1">
                <AppText variant="body" weight="semibold" tone="primaryDark">
                  {t('home.visitTipTitle')}
                </AppText>
                <AppText variant="small" tone="primaryDark">
                  {t('home.visitTipBody')}
                </AppText>
              </View>
            </View>
          </View>
        </FadeIn>
      </View>
      <View className="flex-row flex-wrap justify-center gap-5">
        <TextLink
          onPress={() =>
            startTour(HOME_TOUR, () =>
              update({ tourSeen: true, homeTourVersion: HOME_TOUR_VERSION }),
            )
          }
        >
          {t('tour.replay')}
        </TextLink>
        <TextLink onPress={() => router.push('/checklists')}>{t('tiles.checklists')}</TextLink>
        <TextLink onPress={() => router.push('/docs')}>{t('tiles.myDocs')}</TextLink>
      </View>
      <Disclaimer />
    </Screen>
  );
}

function HomeSearch() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isDesktop } = useLayout();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('home.search')}
      onPress={() => router.push({ pathname: '/guides', params: { focus: '1' } })}
      className="min-h-[44px] flex-row items-center gap-3 rounded-lg border border-line bg-surface px-4 py-2 active:bg-primary-soft"
      style={{ borderColor: colors.refinedBorder }}
    >
      <Icon name="search" size={20} color={colors.textMuted} />
      <AppText variant="body" tone="muted" style={{ flex: 1 }}>
        {t(isDesktop ? 'home.searchDesktop' : 'home.search')}
      </AppText>
    </Pressable>
  );
}
