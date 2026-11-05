import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { colors } from '@dokyu/shared';

/** Web connectivity notice; offline guide fallbacks remain available on both platforms. */
export function ConnectionNotice() {
  const { t } = useTranslation();
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);
  if (!offline) return null;
  return (
    <View
      accessibilityRole="alert"
      className="flex-row items-center gap-3 rounded-lg bg-gold-soft p-3"
    >
      <Icon name="info" color={colors.warning} size={20} />
      <AppText variant="small" style={{ flex: 1, color: '#5C4300' }}>
        {t('common.offline')}
      </AppText>
    </View>
  );
}
