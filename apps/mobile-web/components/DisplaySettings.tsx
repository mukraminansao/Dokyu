import { Switch, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@dokyu/shared';
import { AppText } from './ui/AppText';
import { Card } from './ui/Card';
import { SegmentedControl } from './ui/SegmentedControl';
import { LANGUAGES } from '../lib/i18n';
import { useSettings } from '../lib/settings';
import { useAuth } from '../lib/auth';
import { playSound, setSoundEnabled } from '../lib/sounds';
import { Button } from './ui/Button';

/** Language, accessibility and local sound preferences. */
export function DisplaySettings() {
  const { t } = useTranslation();
  const { language, setLanguage, largeText, setLargeText, soundEffects, update } = useSettings();
  const { updateProfile } = useAuth();
  // Signed-in users keep these on their profile too, so a new phone starts the same way.
  const changeLanguage = (l: typeof language) => {
    setLanguage(l);
    updateProfile({ language: l }).catch(() => {});
  };
  const changeLargeText = (on: boolean) => {
    playSound('tap');
    setLargeText(on);
    updateProfile({ textSize: on ? 'large' : 'normal' }).catch(() => {});
  };
  const changeSound = (on: boolean) => {
    setSoundEnabled(on);
    update({ soundEffects: on });
    if (on) {
      playSound('tap');
    }
  };
  return (
    <View className="gap-2">
      <AppText variant="title">{t('settings.title')}</AppText>
      <Card className="gap-4">
        <View className="gap-2">
          <AppText variant="small" weight="medium" tone="muted">
            {t('settings.language')}
          </AppText>
          <SegmentedControl
            label={t('settings.language')}
            value={language}
            onChange={changeLanguage}
            options={LANGUAGES.map((l) => ({ value: l.code, label: l.label }))}
          />
        </View>
        <View className="flex-row items-center gap-4">
          <View className="flex-1">
            <AppText variant="body" weight="medium">
              {t('settings.largeText')}
            </AppText>
            <AppText variant="small" tone="muted">
              {t('settings.largeTextHint')}
            </AppText>
          </View>
          <Switch
            accessibilityLabel={t('settings.largeText')}
            value={largeText}
            onValueChange={changeLargeText}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
            {...({ activeThumbColor: '#FFFFFF' } as object)}
          />
        </View>
        <View className="flex-row items-center gap-4">
          <View className="flex-1">
            <AppText variant="body" weight="medium">
              {t('settings.soundEffects')}
            </AppText>
            <AppText variant="small" tone="muted">
              {t('settings.soundEffectsHint')}
            </AppText>
          </View>
          <Switch
            accessibilityLabel={t('settings.soundEffects')}
            value={soundEffects}
            onValueChange={changeSound}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
            {...({ activeThumbColor: '#FFFFFF' } as object)}
          />
        </View>
        {soundEffects ? (
          <Button
            label={t('settings.previewSound')}
            variant="secondary"
            size="md"
            fullWidth
            onPress={() => playSound('hello')}
          />
        ) : null}
      </Card>
    </View>
  );
}
