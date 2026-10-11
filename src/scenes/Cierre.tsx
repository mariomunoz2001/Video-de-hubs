import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Fondo} from '../components/Fondo';
import {FONT, SAFE_BOTTOM, SAFE_SIDE, textoSobre} from '../theme';
import type {PromoProps} from '../types';

export const Cierre: React.FC<PromoProps> = ({frase, instagram, logo, primario, secundario}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const texto = textoSobre(primario);

  const logoIn = spring({frame: frame - 2, fps, config: {damping: 15}});
  const fraseIn = spring({frame: frame - 10, fps, config: {damping: 18, stiffness: 110}});
  const igIn = spring({frame: frame - 26, fps, config: {damping: 14, stiffness: 120}});
  const pie = spring({frame: frame - 40, fps, config: {damping: 200}, durationInFrames: 20});

  // La frase se parte en líneas de forma natural por ancho; ajustamos el tamaño según el largo.
  const tam = frase.length > 42 ? 80 : frase.length > 26 ? 92 : 108;

  return (
    <AbsoluteFill>
      <Fondo primario={primario} secundario={secundario} oscuro={0.15} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: `0 ${SAFE_SIDE}px`, paddingBottom: 60}}>
        {logo && (
          <div
            style={{
              width: 230, height: 230, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', marginBottom: 70,
              boxShadow: `0 24px 60px rgba(0,0,0,.3), 0 0 0 10px ${secundario}`, transform: `scale(${logoIn})`, opacity: logoIn,
            }}
          >
            <Img src={staticFile(logo)} style={{width: '76%', height: '76%', objectFit: 'contain'}} />
          </div>
        )}
        <div
          style={{
            fontFamily: FONT, fontWeight: 800, fontSize: tam, lineHeight: 1.1, color: texto, textAlign: 'center', letterSpacing: -1.5,
            opacity: fraseIn, transform: `translateY(${(1 - fraseIn) * 50}px)`,
          }}
        >
          {frase}
        </div>
        <div
          style={{
            marginTop: 70, padding: '24px 54px', borderRadius: 100, background: secundario, color: textoSobre(secundario),
            fontFamily: FONT, fontWeight: 700, fontSize: 58, boxShadow: '0 20px 50px rgba(0,0,0,.3)',
            transform: `scale(${igIn})`, opacity: igIn,
          }}
        >
          @{instagram}
        </div>
      </AbsoluteFill>

      {/* Franja SmartTap (queda dentro del margen seguro inferior) */}
      <div
        style={{
          position: 'absolute', left: SAFE_SIDE, right: SAFE_SIDE, top: SAFE_BOTTOM - 84, height: 70, borderRadius: 35,
          background: 'rgba(0,0,0,.38)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: FONT, fontWeight: 600, fontSize: 30, color: '#fff', opacity: pie, transform: `translateY(${(1 - pie) * 20}px)`,
          whiteSpace: 'nowrap',
        }}
      >
        Hub creado por SmartTap · smarttap.cl@gmail.com
      </div>
    </AbsoluteFill>
  );
};
