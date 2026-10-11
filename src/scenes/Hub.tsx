import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Fondo} from '../components/Fondo';
import {PANTALLA_ALTO, PANTALLA_ANCHO, Telefono, TEL_ALTO, TEL_ANCHO} from '../components/Telefono';
import {FONT, HEIGHT, SAFE_BOTTOM, SAFE_SIDE, SAFE_TOP, WIDTH, textoSobre} from '../theme';
import type {PromoProps} from '../types';

const BAJA = [22, 135] as const;
const SUBE = [152, 225] as const;

const Etiqueta: React.FC<{texto: string; indice: number; total: number; aparece: number; secundario: string}> = ({
  texto, indice, total, aparece, secundario,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - aparece, fps, config: {damping: 13, stiffness: 130}});
  const izquierda = indice % 2 === 0;
  const hueco = (SAFE_BOTTOM - SAFE_TOP - 260) / Math.max(total - 1, 3);
  const y = SAFE_TOP + 130 + indice * hueco;
  const flota = Math.sin((frame + indice * 17) / 22) * 6;
  const desde = izquierda ? -420 : 420;
  return (
    <div
      style={{
        position: 'absolute', top: y + flota, ...(izquierda ? {left: SAFE_SIDE - 20} : {right: SAFE_SIDE - 20}),
        transform: `translateX(${(1 - p) * desde}px) scale(${0.85 + 0.15 * p})`, opacity: Math.min(1, p * 1.6),
        display: 'flex', alignItems: 'center', gap: 20, padding: '22px 40px 22px 26px', borderRadius: 100,
        background: '#ffffff', boxShadow: '0 24px 60px rgba(0,0,0,.35)', fontFamily: FONT, fontWeight: 700, fontSize: 50, color: '#1b1b1f',
      }}
    >
      <span
        style={{
          width: 62, height: 62, borderRadius: '50%', background: secundario, display: 'grid', placeItems: 'center', color: textoSobre(secundario),
        }}
      >
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      <span>{texto}</span>
    </div>
  );
};

export const Hub: React.FC<PromoProps> = ({hub, primario, secundario}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const entrada = spring({frame, fps, config: {damping: 17, stiffness: 90}});
  const alto = (hub.alto / hub.ancho) * PANTALLA_ANCHO;
  const maxScroll = Math.max(0, alto - PANTALLA_ALTO);
  const suave = Easing.inOut(Easing.cubic);
  const baja = interpolate(frame, [BAJA[0], BAJA[1]], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: suave});
  const sube = interpolate(frame, [SUBE[0], SUBE[1]], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: suave});
  const scroll = (baja - sube) * maxScroll;

  // Leve giro 3D para dar vida al mockup
  const giro = Math.sin(frame / 48) * 3.2;
  const cabeceo = Math.cos(frame / 60) * 1.4;

  const etiquetas = hub.etiquetas.slice(0, 5);
  const inicio = 34;
  const fin = BAJA[1] - 6;
  const paso = etiquetas.length > 1 ? (fin - inicio) / (etiquetas.length - 1) : 0;

  return (
    <AbsoluteFill>
      <Fondo primario={primario} secundario={secundario} />
      <AbsoluteFill style={{perspective: 2200}}>
        <div
          style={{
            position: 'absolute', left: (WIDTH - TEL_ANCHO) / 2, top: (HEIGHT - TEL_ALTO) / 2,
            transform: `translateY(${(1 - entrada) * 320}px) scale(${0.9 + 0.1 * entrada}) rotateY(${giro}deg) rotateX(${cabeceo}deg)`,
            opacity: Math.min(1, entrada * 2),
          }}
        >
          <Telefono>
            <div style={{width: PANTALLA_ANCHO, height: PANTALLA_ALTO, overflow: 'hidden', background: '#fff'}}>
              <Img
                src={staticFile(hub.imagen)}
                style={{width: PANTALLA_ANCHO, height: alto, display: 'block', transform: `translateY(${-scroll}px)`, willChange: 'transform'}}
              />
            </div>
          </Telefono>
        </div>
      </AbsoluteFill>
      {etiquetas.map((t, i) => (
        <Etiqueta key={t} texto={t} indice={i} total={etiquetas.length} aparece={Math.round(inicio + paso * i)} secundario={secundario} />
      ))}
    </AbsoluteFill>
  );
};
