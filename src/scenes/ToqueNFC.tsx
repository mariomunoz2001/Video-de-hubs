import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Telefono, TEL_ANCHO} from '../components/Telefono';
import {FONT, SAFE_SIDE, WIDTH, aclarar, conAlfa, oscurecer, textoSobre} from '../theme';
import type {PromoProps} from '../types';

const PLACA_Y = 700;
const PLACA_R = 170;
const CONTACTO = 34; // frame en que el celular llega a la placa
const ESCALA_TEL = 0.78;

const IconoNFC: React.FC<{color: string; size: number}> = ({color, size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round">
    <path d="M6 8.5a7 7 0 0 1 0 7" />
    <path d="M9.5 6.5a10.5 10.5 0 0 1 0 11" />
    <path d="M13 4.5a14 14 0 0 1 0 15" />
    <circle cx="17.5" cy="12" r="0.6" fill={color} />
  </svg>
);

export const ToqueNFC: React.FC<PromoProps> = ({nombre, logo, primario, secundario}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const mesaOscura = oscurecer(primario, 0.78);
  const texto = '#ffffff';

  // Celular que se acerca
  const llegada = spring({frame: frame - 4, fps, config: {damping: 15, stiffness: 70, mass: 1}});
  const telY = interpolate(llegada, [0, 1], [1050, 0]);
  const telRot = interpolate(llegada, [0, 1], [9, 0]);
  // pequeño "toque": el celular se hunde un poco al contacto
  const hundir = frame >= CONTACTO ? Math.sin(Math.min(1, (frame - CONTACTO) / 10) * Math.PI) * -14 : 0;

  // Placa: pulso al contacto
  const pulsoPlaca = frame >= CONTACTO ? 1 + 0.08 * Math.sin(Math.min(1, (frame - CONTACTO) / 14) * Math.PI) : 1;
  const placaIn = spring({frame, fps, config: {damping: 16}});

  // Ondas
  const ondas = [0, 9, 18].map((retraso) => {
    const t = (frame - CONTACTO - retraso) / 36;
    if (t < 0 || t > 1) return null;
    const e = 1 - (1 - t) ** 2;
    return {r: PLACA_R + e * 380, o: (1 - t) * 0.7};
  });

  // Pantalla
  const encendida = spring({frame: frame - (CONTACTO + 8), fps, config: {damping: 200}, durationInFrames: 14});
  const contenido = spring({frame: frame - (CONTACTO + 16), fps, config: {damping: 16, stiffness: 120}});
  const barra = interpolate(frame, [CONTACTO + 20, 84], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // Texto superior
  const t1 = interpolate(frame, [0, 12, CONTACTO + 6, CONTACTO + 16], [0, 1, 1, 0], {extrapolateRight: 'clamp'});
  const t2 = interpolate(frame, [CONTACTO + 14, CONTACTO + 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 38%, ${oscurecer(primario, 0.5)} 0%, ${mesaOscura} 70%)`}}>
      {/* textura sutil de mesa */}
      <AbsoluteFill style={{background: 'repeating-linear-gradient(90deg, rgba(255,255,255,.015) 0 2px, transparent 2px 90px)'}} />

      {/* Ondas + placa (detrás del celular) */}
      <svg width={WIDTH} height={1920} style={{position: 'absolute', inset: 0}}>
        {ondas.map((o, i) =>
          o ? <circle key={i} cx={WIDTH / 2} cy={PLACA_Y} r={o.r} fill="none" stroke={secundario} strokeWidth={8} opacity={o.o} /> : null,
        )}
      </svg>
      <div
        style={{
          position: 'absolute', left: WIDTH / 2 - PLACA_R, top: PLACA_Y - PLACA_R, width: PLACA_R * 2, height: PLACA_R * 2, borderRadius: '50%',
          background: `radial-gradient(circle at 35% 30%, ${aclarar(primario, 0.25)}, ${primario} 70%)`,
          boxShadow: `0 40px 70px rgba(0,0,0,.55), 0 0 0 10px ${conAlfa('#ffffff', 0.08)}, 0 0 ${frame >= CONTACTO ? 90 : 0}px ${conAlfa(secundario, 0.55)}`,
          display: 'grid', placeItems: 'center',
          transform: `scale(${placaIn * pulsoPlaca})`, opacity: placaIn,
        }}
      >
        <IconoNFC color={textoSobre(primario)} size={190} />
      </div>

      {/* Celular */}
      <div
        style={{
          position: 'absolute', left: (WIDTH - TEL_ANCHO) / 2, top: 905,
          transform: `translateY(${telY + hundir}px) rotate(${telRot}deg) scale(${ESCALA_TEL})`,
          transformOrigin: '50% 0%',
        }}
      >
        <Telefono pantallaEncendida={1}>
          {/* pantalla apagada → encendida */}
          <AbsoluteFill style={{background: '#050506'}} />
          <AbsoluteFill
            style={{
              opacity: encendida,
              background: `linear-gradient(170deg, ${aclarar(primario, 0.1)}, ${oscurecer(primario, 0.45)})`,
              alignItems: 'center', paddingTop: 230,
            }}
          >
            {logo && (
              <div
                style={{
                  width: 220, height: 220, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center',
                  transform: `scale(${contenido})`, boxShadow: `0 0 0 8px ${secundario}`,
                }}
              >
                <Img src={staticFile(logo)} style={{width: '76%', height: '76%', objectFit: 'contain'}} />
              </div>
            )}
            <div
              style={{
                fontFamily: FONT, fontWeight: 800, fontSize: 56, color: textoSobre(primario), marginTop: 36, textAlign: 'center', padding: '0 30px',
                opacity: contenido, transform: `translateY(${(1 - contenido) * 24}px)`, lineHeight: 1.1,
              }}
            >
              {nombre}
            </div>
            <div style={{width: 320, height: 10, borderRadius: 5, background: 'rgba(255,255,255,.25)', marginTop: 50, overflow: 'hidden', opacity: contenido}}>
              <div style={{width: `${barra * 100}%`, height: '100%', background: secundario, borderRadius: 5}} />
            </div>
          </AbsoluteFill>
        </Telefono>
      </div>
      {/* Textos (encima de las ondas) */}
      <div style={{position: 'absolute', top: 340, left: SAFE_SIDE, right: SAFE_SIDE, textAlign: 'center', fontFamily: FONT, color: texto}}>
        <div style={{position: 'absolute', inset: 0, opacity: t1, fontSize: 64, fontWeight: 700, transform: `translateY(${(1 - t1) * 20}px)`}}>
          Acerca tu celular
        </div>
        <div style={{position: 'absolute', inset: 0, opacity: t2, fontSize: 64, fontWeight: 700, transform: `translateY(${(1 - t2) * 20}px)`}}>
          Se abre al instante
        </div>
      </div>

    </AbsoluteFill>
  );
};
