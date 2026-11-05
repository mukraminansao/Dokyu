import { AppText, type AppTextProps } from '../ui/AppText';
import { useLayout } from '../../lib/useLayout';
import { useSettings } from '../../lib/settings';

/** Reference-specific typography; the app's old compact type scale is not reused. */
export function HomeText({ variant = 'body', style, ...props }: AppTextProps) {
  const { isDesktop } = useLayout();
  const { largeText, textSize } = useSettings();
  const desktop = {
    caption: 14,
    small: 14,
    body: 18,
    bodyLg: 18,
    title: 24,
    h2: 24,
    h1: 28,
    hero: 36,
    display: 88,
  };
  const phone = {
    caption: 12,
    small: 14,
    body: 14,
    bodyLg: 16,
    title: 22,
    h2: 22,
    h1: 26,
    hero: 28,
    display: 88,
  };
  const base = (isDesktop ? desktop : phone)[variant];
  const size = largeText ? Math.max(textSize(variant), base * 1.2) : base;
  return (
    <AppText
      {...props}
      variant={variant}
      style={[{ fontSize: size, lineHeight: Math.round(size * 1.3) }, style]}
    />
  );
}
