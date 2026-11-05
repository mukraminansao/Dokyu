import { useEffect, useId, useRef, useState } from 'react';
import { AppState, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Stop } from 'react-native-svg';
import { useReducedMotion } from '../../lib/motion';

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

/** A character clock that stops when motion is reduced or the app/tab is hidden. */
function useCharacterClock(enabled: boolean) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const started = Date.now();
    const timer = setInterval(() => {
      if (AppState.currentState !== 'active') return;
      if (typeof document !== 'undefined' && document.hidden) return;
      setElapsed(Date.now() - started);
    }, 50);
    return () => clearInterval(timer);
  }, [enabled]);
  return elapsed;
}

const INK = '#060C42';

/** Articulated version of the approved folder, folded paper and gold ID.
 * Arms, feet, gaze and mouth are independent shapes, not a moving still image.
 */
export function Doki({
  size = 120,
  pose = 'idle',
  facing = 'right',
  alive = true,
  mouthOpen,
  label = 'Doki, your Dokyu guide',
}: DokiProps) {
  return (
    <Character
      size={size}
      pose={pose}
      facing={facing}
      alive={alive}
      mouthOpen={mouthOpen}
      label={label}
    />
  );
}

export function DokiFace({ size = 52, active = false }: { size?: number; active?: boolean }) {
  return <Character size={size} pose={active ? 'happy' : 'idle'} faceOnly />;
}

function Character({
  size = 120,
  pose = 'idle',
  facing = 'right',
  alive = true,
  mouthOpen,
  label,
  faceOnly = false,
}: DokiProps & { faceOnly?: boolean }) {
  const reduced = useReducedMotion();
  const moving = alive && !reduced;
  const time = useCharacterClock(moving);
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const wave = moving ? Math.sin(time / 150) : 0;
  const breath = moving ? Math.sin(time / 650) : 0;
  const walking = pose === 'walk' || pose === 'walk2';
  const gaitOffset = useRef(pose === 'walk2' ? Math.PI : 0).current;
  const stride = walking
    ? moving
      ? Math.sin(time / 105 + gaitOffset)
      : pose === 'walk2'
        ? -0.7
        : 0.7
    : 0;
  const celebrating = pose === 'happy';
  const smiling = pose === 'wave' || celebrating;
  const blink = moving && time % 3900 > 3730;
  const rightArm =
    pose === 'wave'
      ? wave * 18
      : pose === 'point'
        ? -18 + breath * 3
        : pose === 'pointDown'
          ? 120 + breath * 3
          : celebrating
            ? -15 + wave * 12
            : walking
              ? 52 + stride * 28
              : pose === 'talk'
                ? 12 + wave * 12
                : pose === 'worried'
                  ? 92
                  : 108 + breath * 3;
  const leftArm = celebrating
    ? 75 - wave * 12
    : walking
      ? stride * 24
      : pose === 'worried'
        ? -45
        : breath * 4;
  const bounce = !moving
    ? 0
    : walking
      ? -Math.abs(stride) * 4
      : celebrating
        ? -Math.abs(wave) * 7
        : breath * 1.4;
  const eyeY = pose === 'pointDown' ? 4 : pose === 'point' ? -3 : 0;
  const speaking = !reduced && mouthOpen;
  return (
    <View
      accessibilityRole={label ? 'image' : undefined}
      accessibilityLabel={label}
      aria-hidden={label ? undefined : true}
      pointerEvents="none"
      style={{ width: size, height: faceOnly ? size * 0.9 : size * 1.2 }}
    >
      <Svg
        testID={`doki-${faceOnly ? 'face' : pose}`}
        width={size}
        height={faceOnly ? size * 0.9 : size * 1.2}
        viewBox={faceOnly ? '28 14 175 157' : '0 -42 240 288'}
      >
        <Defs>
          <LinearGradient id={`blue${id}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#2469FF" />
            <Stop offset="1" stopColor="#0343DF" />
          </LinearGradient>
          <LinearGradient id={`paper${id}`} x1="0" y1="0" x2="0.8" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" />
            <Stop offset="1" stopColor="#F4F8FF" />
          </LinearGradient>
        </Defs>
        {!faceOnly ? (
          <Ellipse cx="116" cy="194" rx={walking ? 56 : 64} ry="5" fill="#C5D9F7" opacity="0.75" />
        ) : null}
        <G
          transform={`translate(0 ${faceOnly ? 0 : bounce}) translate(${facing === 'left' ? 240 : 0} 0) scale(${facing === 'left' ? -1 : 1} 1)`}
          stroke={INK}
          strokeWidth="3.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <G transform={`rotate(${stride * 23} 80 151)`}>
            <Path d="M70 150 62 177C48 176 43 184 48 189Q58 194 76 189L90 151Z" fill="#0753F4" />
          </G>
          <G transform={`rotate(${-stride * 23} 139 151)`}>
            <Path
              d="M132 152 126 179Q122 193 142 193L155 192Q169 188 158 181L146 180 151 153Z"
              fill="#0753F4"
            />
          </G>
          <G transform={`rotate(${leftArm} 39 112)`}>
            <Path d="M43 108 28 129Q14 124 13 137Q12 148 24 148L49 122Z" fill="#0753F4" />
          </G>
          <G transform={`rotate(${rightArm} 185 116)`}>
            <Path
              d="M182 111 207 89Q204 76 215 73Q227 69 231 81Q235 94 222 98L194 131Z"
              fill="#0753F4"
            />
          </G>
          <Path d="M58 46 61 23Q62 15 74 16L111 18Q120 19 121 29L122 48Z" fill="#FF174E" />
          <Path
            d="M30 42Q26 40 24 54L21 139Q20 159 40 160L168 165Q182 165 185 147L194 67Q196 49 181 46Z"
            fill={`url(#blue${id})`}
          />
          <Path
            d="M75 62 176 47 197 74 189 128 130 150 59 122 63 78Q64 66 75 62Z"
            fill={`url(#paper${id})`}
          />
          <Path d="M176 47 171 69Q170 75 178 75L197 75Z" fill="#C3D7FF" />
          <G transform={`translate(0 ${eyeY})`} strokeWidth="5">
            {smiling || blink ? (
              <>
                <Path d={blink ? 'M88 94h15' : 'M86 96Q93 79 102 95'} fill="none" />
                <Path d={blink ? 'M137 95h15' : 'M136 96Q143 80 152 96'} fill="none" />
              </>
            ) : (
              <>
                <Ellipse cx="94" cy="92" rx="5.3" ry="7.2" fill={INK} stroke="none" />
                <Ellipse cx="144" cy="93" rx="5.3" ry="7.2" fill={INK} stroke="none" />
                <Circle cx="92.5" cy="89" r="1.6" fill="#FFFFFF" stroke="none" />
                <Circle cx="142.5" cy="90" r="1.6" fill="#FFFFFF" stroke="none" />
              </>
            )}
            {pose === 'worried' ? (
              <Path d="M86 78l14-5M137 74l14 6" fill="none" strokeWidth="3" />
            ) : null}
          </G>
          <Ellipse cx="79" cy="109" rx="9" ry="5.5" fill="#FF9EAF" stroke="none" />
          <Ellipse cx="158" cy="110" rx="9" ry="5.5" fill="#FF9EAF" stroke="none" />
          {pose === 'worried' ? (
            <Path d="M110 123Q119 114 128 124" fill="none" strokeWidth="3" />
          ) : speaking || (smiling && mouthOpen === undefined) ? (
            <>
              <Path
                d={
                  speaking
                    ? 'M108 109Q119 106 131 109Q132 130 119 131Q107 130 108 109Z'
                    : 'M107 109Q119 112 132 109Q128 128 119 128Q110 127 107 109Z'
                }
                fill={INK}
                strokeWidth="2"
              />
              <Path d="M111 122Q119 114 127 122Q120 131 111 122Z" fill="#FF3976" stroke="none" />
            </>
          ) : (
            <Path d="M109 114Q119 125 130 114" fill="none" strokeWidth="3" />
          )}
          <Path d="M75 130 115 155 166 132" fill="none" stroke="#FFCA23" strokeWidth="7" />
          <G transform={`rotate(${moving ? breath * 3 : 0} 121 150)`}>
            <Path
              d="M111 147h24q7 0 7 8l-1 20q0 7-8 7l-24-1q-7 0-7-7l2-19q0-8 7-8Z"
              fill="#FFD029"
              strokeWidth="3"
            />
            <Path d="M117 141h9v11h-9z" fill="#FFD029" strokeWidth="2.8" />
            <Circle cx="122" cy="161" r="4" fill="#FFFFFF" stroke="none" />
            <Path d="M115 175v-3q0-9 14-1v4Z" fill="#FFFFFF" stroke="none" />
          </G>
        </G>
        {pose === 'wave' && !faceOnly ? (
          <G
            stroke="#FFC600"
            strokeWidth="4"
            strokeLinecap="round"
            opacity={moving ? 0.65 + (wave + 1) * 0.17 : 1}
          >
            <Path d="m211 52 3-14m9 20 10-9m-4 22 10-2" />
          </G>
        ) : null}
      </Svg>
    </View>
  );
}
