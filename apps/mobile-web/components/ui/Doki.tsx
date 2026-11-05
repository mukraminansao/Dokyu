import { View } from 'react-native';
import { useReducedMotion } from '../../lib/motion';
import { ReferenceDoki } from './ReferenceDoki';

export type DokiPose =
  'idle' | 'walk' | 'walk2' | 'point' | 'wave' | 'happy' | 'talk' | 'worried' | 'pointDown';

export interface DokiProps {
  size?: number;
  pose?: DokiPose;
  facing?: 'left' | 'right';
  alive?: boolean;
  mouthOpen?: boolean;
  label?: string;
}

/** One character across the app. Tour/chat wrappers animate position and speech feedback. */
export function Doki({
  size = 120,
  pose = 'idle',
  facing = 'right',
  mouthOpen = false,
  label = 'Doki, your Dokyu guide',
}: DokiProps) {
  const reduced = useReducedMotion();
  const tilt = reduced ? 0 : pose === 'walk' ? -3 : pose === 'walk2' ? 3 : 0;
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={label}
      style={{
        width: size,
        height: size * 1.2,
        justifyContent: 'center',
        transform: [
          { scaleX: facing === 'left' ? -1 : 1 },
          { rotate: tilt + 'deg' },
          { scale: !reduced && mouthOpen ? 1.015 : 1 },
        ],
      }}
    >
      <ReferenceDoki size={size} />
    </View>
  );
}

export function DokiFace({ size = 52 }: { size?: number }) {
  return <ReferenceDoki size={size} faceOnly />;
}
