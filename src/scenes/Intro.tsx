import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Fondo} from '../components/Fondo';
import {FONT, SAFE_SIDE, textoSobre} from '../theme';
import type {PromoProps} from '../types';

export const Intro: React.FC<PromoProps> = ({nombre, logo, primario, secundario}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const texto = textoSobre(primario);

  const entrada = spring({frame, fps, config: {damping: 14, stiffness: 110, mass: 0.9}});
  const logoScale = interpolate(entrada, [0, 1], [0.6, 1]);
  const nombreIn = spring({frame: frame - 14, fps, config: {damping: 18, stiffness: 120}});
  const lineaIn = spring({frame: frame - 24, fps, config: {damping: 200}, durationInFrames: 22});
  const sub = spring({frame: frame - 34, fps, config: {damping: 20}});

  return (
    <AbsoluteFill>
      <Fondo primario={primario} secundario={secundario} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: `0 ${SAFE_SIDE}px`}}>
        {logo && (
          <div
            style={{
              width: 360, height: 360, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center',
              boxShadow: `0 30px 80px rgba(0,0,0,.35), 0 0 0 14px ${secundario}`,
              transform: `scale(${logoScale})`, opacity: entrada, overflow: 'hidden', marginBottom: 70,
            }}
          >
            <Img src={staticFile(logo)} style={{width: '78%', height: '78%', objectFit: 'contain'}} />
          </div>
        )}
        <div
          style={{
            fontFamily: FONT, fontWeight: 800, color: texto, textAlign: 'center', lineHeight: 1.05,
            fontSize: logo ? 112 : 150, letterSpacing: -2,
            transform: `translateY(${interpolate(nombreIn, [0, 1], [50, 0])}px)`, opacity: nombreIn,
          }}
        >
          {nombre}
        </div>
        <div style={{width: 220 * lineaIn, height: 10, borderRadius: 5, background: secundario, marginTop: 44}} />
        <div
          style={{
            fontFamily: FONT, fontWeight: 600, fontSize: 44, color: texto, opacity: 0.85 * sub, marginTop: 40,
            transform: `translateY(${interpolate(sub, [0, 1], [24, 0])}px)`, textAlign: 'center',
          }}
        >
          Tu negocio, en un toque
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
