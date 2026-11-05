import '../global.css';
import '../lib/i18n';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { SettingsProvider, useSettings } from '../lib/settings';
import { AuthProvider } from '../lib/auth';
import { MyDocsProvider } from '../lib/mydocs';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { TourProvider, useTour } from '../lib/tour';
import { TourOverlay } from '../components/doki/TourOverlay';
import { AppSounds } from '../components/AppSounds';

SplashScreen.preventAutoHideAsync().catch(() => {});

/** Web: fade out the "dokyu" loading screen from index.html (added by scripts/finish-web.mjs). */
function hideWebBoot() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const boot = document.getElementById('boot');
  if (!boot) return;
  boot.classList.add('hide');
  setTimeout(() => boot.remove(), 300);
}

function Root() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  const { ready } = useSettings();
  const loaded = fontsLoaded && ready;

  useEffect(() => {
    if (!loaded) return;
    SplashScreen.hideAsync().catch(() => {});
    hideWebBoot();
  }, [loaded]);

  if (!loaded) return null;
  return (
    <TourProvider>
      <StatusBar style="dark" />
      <RoutedScreens />
      <TourOverlay />
    </TourProvider>
  );
}

function RoutedScreens() {
  const { steps } = useTour();
  return (
    <View
      style={{ flex: 1 }}
      aria-hidden={!!steps}
      accessibilityElementsHidden={!!steps}
      importantForAccessibility={steps ? 'no-hide-descendants' : 'auto'}
    >
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <AppSounds />
          <AuthProvider>
            <MyDocsProvider>
              <Root />
            </MyDocsProvider>
          </AuthProvider>
        </SettingsProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
