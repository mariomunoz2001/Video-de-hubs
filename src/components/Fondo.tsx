import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {conAlfa, oscurecer} from '../theme';

/** Fondo con degradado de marca y dos halos que se mueven muy despacio. */
export const Fondo: React.FC<{primario: string; secundario: string; oscuro?: number}> = ({primario, secundario, oscuro = 0.35}) => {
  const frame = useCurrentFrame();
  const d = interpolate(frame, [0, 300], [0, 1], {extrapolateRight: 'extend'});
  return (
    <AbsoluteFill style={{background: `linear-gradient(165deg, ${primario} 0%, ${oscurecer(primario, oscuro + 0.25)} 100%)`}}>
      <div
        style={{
          position: 'absolute', width: 900, height: 900, borderRadius: '50%',
          left: -300 + d * 40, top: 120 - d * 30,
          background: `radial-gradient(circle, ${conAlfa(secundario, 0.35)}, transparent 65%)`,
        }}
      />
      <div
        style={{
          position: 'absolute', width: 1000, height: 1000, borderRadius: '50%',
          right: -400 - d * 30, bottom: 80 + d * 30,
          background: `radial-gradient(circle, ${conAlfa(secundario, 0.22)}, transparent 65%)`,
        }}
      />
    </AbsoluteFill>
  );
};
