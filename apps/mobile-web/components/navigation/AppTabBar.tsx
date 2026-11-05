import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { colors, shadow, size } from '@dokyu/shared';
import { AppText } from '../ui/AppText';
import { ReferenceDoki } from '../ui/ReferenceDoki';
import { Icon, type IconName } from '../ui/Icon';
import { Wordmark } from '../ui/Wordmark';
import { Disclaimer } from '../ui/Disclaimer';
import { useLayout } from '../../lib/useLayout';
import { cn } from '../../lib/cn';
import { useTourTarget, type Measurable } from '../../lib/tour';
import { Float, PopOnChange } from '../../lib/motion';
import { useSettings } from '../../lib/settings';

/** Tabs in display order. "ask" is Doki's raised center button (plan §4.2). */
export const TABS: Array<{ name: string; label: string; icon: IconName | 'doki' }> = [
  { name: 'index', label: 'nav.home', icon: 'home' },
  { name: 'guides', label: 'nav.guides', icon: 'guides' },
  { name: 'ask', label: 'nav.ask', icon: 'doki' },
  { name: 'docs', label: 'nav.docs', icon: 'document' },
  { name: 'account', label: 'nav.account', icon: 'account' },
];

/**
 * One tab bar, two layouts (plan §4.2): a bottom bar with a raised Doki button on phones,
 * and a left sidebar on desktop web.
 */
export function AppTabBar(props: BottomTabBarProps) {
  const { isDesktop } = useLayout();
  return isDesktop ? <Sidebar {...props} /> : <BottomBar {...props} />;
}

function useTabs({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const current = state.routes[state.index]?.name;
  return TABS.map((tab) => {
    const route = state.routes.find((r) => r.name === tab.name);
    const focused = current === tab.name;
    const onPress = () => {
      if (!route) return;
      const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!focused && !event.defaultPrevented) navigateToTab(route.key);
    };
    return { ...tab, focused, onPress };
  });
}

function BottomBar(props: BottomTabBarProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tabs = useTabs(props);
  const { largeText } = useSettings();
  const askRef = useTourTarget('tab.ask');
  const guidesRef = useTourTarget('tab.guides');
  return (
    <View
      accessibilityRole="tablist"
      className="flex-row items-end px-1"
      style={{
        paddingBottom: Math.max(insets.bottom, 10),
        paddingTop: 6,
        overflow: 'visible',
      }}
    >
      {/* Reserve the raised control inside the tab bar's touch bounds on native.
          Only the white background is inset; no interactive child overflows its parent. */}
      <View
        aria-hidden
        pointerEvents="none"
        className="absolute inset-x-0 bottom-0 border-t border-line bg-surface"
        style={{ top: 30, boxShadow: '0 -4px 20px rgba(19, 40, 122, 0.04)' }}
      />
      {tabs.map((tab) =>
        tab.icon === 'doki' ? (
          <Pressable
            key={tab.name}
            accessibilityRole="tab"
            accessibilityLabel={t(tab.label)}
            accessibilityState={{ selected: tab.focused }}
            aria-selected={tab.focused}
            onPress={tab.onPress}
            className="items-center gap-1"
            style={{ width: size.dokiButton, flexGrow: 0, flexShrink: 0 }}
          >
            <View
              ref={askRef}
              collapsable={false}
              className="items-center justify-center bg-primary"
              style={{
                width: size.dokiButton,
                height: size.dokiButton,
                borderRadius: 24,
                borderWidth: 5,
                borderColor: colors.surface,
                boxShadow: tab.focused ? `${shadow.focusRing}, ${shadow.doki}` : shadow.doki,
              }}
            >
              <PopOnChange value={tab.focused} from={0.7}>
                <Float amount={2.5} duration={1300}>
                  <ReferenceDoki size={56} faceOnly />
                </Float>
              </PopOnChange>
            </View>
            <AppText variant="caption" weight="bold" tone="primary" style={{ textAlign: 'center' }}>
              Doki
            </AppText>
          </Pressable>
        ) : (
          <Pressable
            key={tab.name}
            ref={tab.name === 'guides' ? guidesRef : undefined}
            accessibilityRole="tab"
            accessibilityLabel={t(tab.label)}
            accessibilityState={{ selected: tab.focused }}
            aria-selected={tab.focused}
            onPress={tab.onPress}
            className="min-h-[52px] flex-1 items-center justify-end gap-1 px-0.5"
            style={{ minHeight: largeText ? 68 : 52 }}
          >
            <PopOnChange value={tab.focused} from={0.55}>
              <Icon
                name={tab.icon}
                color={tab.focused ? colors.primary : colors.textMuted}
                fill={tab.focused ? colors.primaryTint : 'none'}
              />
            </PopOnChange>
            <TabLabel focused={tab.focused}>{t(tab.label)}</TabLabel>
          </Pressable>
        ),
      )}
    </View>
  );
}

function TabLabel({ focused, children }: { focused: boolean; children: string }) {
  return (
    <AppText
      variant="caption"
      weight={focused ? 'semibold' : 'medium'}
      tone={focused ? 'primary' : 'muted'}
      style={{ textAlign: 'center' }}
    >
      {children}
    </AppText>
  );
}

function Sidebar(props: BottomTabBarProps) {
  const { t } = useTranslation();
  const tabs = useTabs(props);
  const router = useRouter();
  const askRef = useTourTarget('tab.ask');
  const guidesRef = useTourTarget('tab.guides');
  const showcaseActive = props.state.routes[props.state.index]?.name === 'showcase';
  return (
    <View
      className="h-full justify-between border-r border-line bg-surface px-4 py-6"
      style={{ width: 210 }}
    >
      <View className="gap-6">
        <View className="px-3">
          <Wordmark size={34} />
        </View>
        <View accessibilityRole="tablist" className="gap-1">
          {tabs.map((tab) => (
            <SidebarItem
              key={tab.name}
              targetRef={
                tab.icon === 'doki' ? askRef : tab.name === 'guides' ? guidesRef : undefined
              }
              label={t(tab.label)}
              icon={tab.icon === 'doki' ? 'chat' : tab.icon}
              focused={tab.focused}
              onPress={tab.onPress}
            />
          ))}
        </View>
      </View>
      <View className="gap-3">
        {/* Developer page: only in development builds, never in the real app. */}
        {__DEV__ && showcaseActive ? (
          <SidebarItem
            label={t('nav.showcase')}
            role="button"
            icon="palette"
            focused={showcaseActive}
            onPress={() => router.navigate('/(resident)/showcase')}
          />
        ) : null}
        <Disclaimer align="left" />
      </View>
    </View>
  );
}

function SidebarItem({
  label,
  icon,
  focused,
  onPress,
  targetRef,
  role = 'tab',
}: {
  label: string;
  icon: IconName;
  focused: boolean;
  onPress?: () => void;
  targetRef?: (node: Measurable | null) => void;
  role?: 'tab' | 'button';
}) {
  const { largeText } = useSettings();
  return (
    <Pressable
      ref={targetRef}
      accessibilityRole={role}
      accessibilityLabel={label}
      accessibilityState={role === 'tab' ? { selected: focused } : undefined}
      aria-selected={role === 'tab' ? focused : undefined}
      onPress={onPress}
      style={focused ? { backgroundColor: '#DCEAFF' } : undefined}
      className={cn(
        'min-h-[56px] flex-row items-center gap-4 rounded-lg px-3',
        focused ? 'bg-primary-soft' : 'active:bg-surface-alt',
      )}
    >
      <Icon
        name={icon}
        color={focused ? colors.primary : colors.textMuted}
        fill={focused && icon === 'home' ? colors.primary : 'none'}
      />
      <AppText
        variant="bodyLg"
        weight={focused ? 'semibold' : 'medium'}
        tone={focused ? 'primary' : 'default'}
        style={{ fontSize: largeText ? 22 : 18, lineHeight: largeText ? 32 : 26 }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}
