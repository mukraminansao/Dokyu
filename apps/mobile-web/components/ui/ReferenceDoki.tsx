import { Image, View } from 'react-native';

/** Transparent rendition of the approved mascot; the navbar reuses its face crop.
 * Only the illustration is raster artwork; surrounding controls remain real UI.
 */
export function ReferenceDoki({
  size = 170,
  faceOnly = false,
}: {
  size?: number;
  faceOnly?: boolean;
}) {
  const crop = faceOnly
    ? { x: 170, y: 100, width: 920, height: 790 }
    : { x: 0, y: 0, width: 1476, height: 1065 };
  const scale = size / crop.width;
  return (
    <View
      aria-hidden
      pointerEvents="none"
      style={{
        width: size,
        height: crop.height * scale,
        overflow: 'hidden',
        borderRadius: faceOnly ? 12 : 0,
      }}
    >
      <Image
        // Metro resolves bundled native image assets through a static require.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        source={require('../../assets/doki-transparent.png')}
        resizeMode="stretch"
        style={{
          position: 'absolute',
          width: 1476 * scale,
          height: 1065 * scale,
          left: -crop.x * scale,
          top: -crop.y * scale,
        }}
      />
    </View>
  );
}
