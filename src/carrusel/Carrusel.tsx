import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {cargarFuentes, conAlfa, oscurecer, SAFE_BOTTOM, SAFE_TOP, WIDTH} from '../theme';
import type {CarruselProps} from '../types';
import {Mano, PUNTA_X, PUNTA_Y} from './Mano';
import {Topo} from './Topo';

const SERIF = "'Fraunces', Georgia, serif";
const SANS = "'Poppins', system-ui, sans-serif";
const HAND = "'Caveat', cursive";

const ENTRA = 14; // la fila de tarjetas entra
const SLOT = 40; // frames por producto
const PASO = 590; // distancia entre tarjetas
const CARD_W = 500;
const CARD_H = 660;
const CARD_TOP = 500;
const TEXTO = 76; // "No esperes / ..."
const LOGO = 84;

export const duracionCarrusel = (n: number) => ENTRA + n * SLOT + TEXTO + LOGO;

const ease = Easing.inOut(Easing.cubic);

export const Carrusel: React.FC<CarruselProps> = (p) => {
  cargarFuentes();
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const c = p.colores;
  const n = p.items.length;
  const finCartas = ENTRA + n * SLOT;
  const iniTexto = finCartas;
  const iniLogo = finCartas + TEXTO;

  // --- posición del carrusel (índice continuo) con transición suave entre productos
  const posicion = (f: number) => {
    if (f < ENTRA) return interpolate(f, [0, ENTRA], [-1.6, 0], {easing: Easing.out(Easing.cubic)});
    const t = f - ENTRA;
    const k = Math.floor(t / SLOT);
    const local = t - k * SLOT;
    const mov = interpolate(local, [SLOT - 9, SLOT], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
    return Math.min(k + mov, n - 1 + (f >= finCartas - 12 ? interpolate(f, [finCartas - 12, finCartas], [0, 1.8], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)}) : 0));
  };
  const o = posicion(frame);
  const vel = (posicion(frame + 1) - posicion(frame - 1)) / 2;
  const blur = Math.min(26, Math.abs(vel) * PASO * 0.32);

  // --- mano: toca la tarjeta y luego desliza a la izquierda
  const t = frame - ENTRA;
  const k = Math.floor(Math.max(0, t) / SLOT);
  const local = Math.max(0, t) - k * SLOT;
  const reposo = {x: 650, y: 1150};
  const toque = {x: 585, y: 1062};
  const fin = {x: 330, y: 1090};
  const tapIn = interpolate(local, [4, 11], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  const tapOut = interpolate(local, [13, 19], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  const swipe = interpolate(local, [SLOT - 10, SLOT - 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  const vuelve = interpolate(local, [SLOT - 2, SLOT], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  let hx = reposo.x + (toque.x - reposo.x) * tapIn - (toque.x - reposo.x) * tapOut * 0.6;
  let hy = reposo.y + (toque.y - reposo.y) * tapIn - (toque.y - reposo.y) * tapOut * 0.55;
  hx = hx + (fin.x - hx) * swipe * (1 - vuelve) + (reposo.x - hx) * vuelve * 0;
  hy = hy + (fin.y - hy) * swipe * (1 - vuelve);
  const entraMano = spring({frame: frame - 6, fps, config: {damping: 16, stiffness: 70}});
  const saleMano = interpolate(frame, [finCartas - 10, finCartas + 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
  const manoY = hy + (1 - entraMano) * 900 + saleMano * 1000;
  const presion = Math.max(0, Math.sin(Math.PI * interpolate(local, [9, 17], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})));

  // --- logo superior
  const logoTop = interpolate(frame, [0, 14], [0, 1], {extrapolateRight: 'clamp'}) * (1 - interpolate(frame, [iniLogo - 6, iniLogo + 4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));

  // --- texto final
  const tt = frame - iniTexto;
  const pre = spring({frame: tt - 2, fps, config: {damping: 200}, durationInFrames: 14});
  const l1 = interpolate(tt, [10, 22], [-1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const l2 = interpolate(tt, [16, 28], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const textoFuera = interpolate(tt, [TEXTO - 12, TEXTO], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
  const blurL1 = Math.abs(interpolate(tt, [10, 16, 22], [30, 18, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const blurL2 = Math.abs(interpolate(tt, [16, 22, 28], [30, 18, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));

  // --- logo final
  const lg = spring({frame: frame - iniLogo, fps, config: {damping: 12, stiffness: 110}});
  const lgSub = spring({frame: frame - iniLogo - 14, fps, config: {damping: 200}, durationInFrames: 16});
  const firma = spring({frame: frame - iniLogo - 26, fps, config: {damping: 200}, durationInFrames: 18});

  const fade = fps * 1;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Topo color={c.principal} fondo={c.fondo} />
      <svg width="0" height="0" style={{position: 'absolute'}}>
        <filter id="hblur" x="-20%" y="-5%" width="140%" height="110%"><feGaussianBlur stdDeviation={`${blur} 0`} /></filter>
        <filter id="hb1" x="-20%" y="-5%" width="140%" height="110%"><feGaussianBlur stdDeviation={`${blurL1} 0`} /></filter>
        <filter id="hb2" x="-20%" y="-5%" width="140%" height="110%"><feGaussianBlur stdDeviation={`${blurL2} 0`} /></filter>
      </svg>

      {/* logo arriba (como la referencia) */}
      <div style={{position: 'absolute', top: SAFE_TOP - 10, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', color: c.principal, opacity: logoTop, lineHeight: 0.9}}>
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 62, letterSpacing: -1.5}}>{p.marca.l1}</div>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 70, letterSpacing: -2, color: c.acento, WebkitTextStroke: `3px ${c.principal}`, paintOrder: 'stroke fill'}}>{p.marca.l2}</div>
      </div>

      {/* tarjetas */}
      {frame < finCartas + 2 && (
        <div style={{position: 'absolute', inset: 0, filter: blur > 0.6 ? 'url(#hblur)' : undefined}}>
          {p.items.map((it, i) => {
            const d = i - o;
            if (Math.abs(d) > 2.2) return null;
            const cx = WIDTH / 2 + d * PASO;
            const lejos = Math.min(1, Math.abs(d));
            const activo = Math.abs(d) < 0.5 && i === k;
            const esc = (1 - 0.16 * lejos) * (activo ? 1 - presion * 0.045 : 1);
            return (
              <div key={i} style={{position: 'absolute', left: cx - CARD_W / 2, top: CARD_TOP, width: CARD_W, height: CARD_H, borderRadius: 40, background: `linear-gradient(170deg, ${c.principal}, ${oscurecer(c.principal, 0.3)})`, boxShadow: `0 ${40 - presion * 14}px 70px -18px ${conAlfa('#050f3c', 0.55)}, inset 0 0 0 3px ${conAlfa(c.suave, 0.35)}`, transform: `scale(${esc})`, display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden'}}>
                <div style={{marginTop: 46, fontFamily: SERIF, fontWeight: 800, fontSize: it.nombre.length > 14 ? 58 : 72, lineHeight: 0.98, letterSpacing: -2, color: c.claro, textAlign: 'center', padding: '0 30px', textShadow: `0 6px 0 ${oscurecer(c.principal, 0.5)}`, minHeight: 150, display: 'flex', alignItems: 'center'}}>
                  {it.nombre}
                </div>
                <div style={{position: 'relative', marginTop: 18, width: CARD_W - 64, height: 340, borderRadius: 28, overflow: 'hidden', boxShadow: `0 0 0 6px ${c.acento}`}}>
                  <Img src={staticFile(it.foto)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: it.pos ?? '50% 50%'}} />
                </div>
                {it.precio && (
                  <div style={{position: 'absolute', bottom: 30, right: 34, padding: '8px 22px', borderRadius: 40, background: c.acento, color: c.principal, fontFamily: SANS, fontWeight: 800, fontSize: 38, boxShadow: '0 10px 20px rgba(0,0,0,.3)'}}>{it.precio}</div>
                )}
                <div style={{position: 'absolute', bottom: 34, left: 34, fontFamily: HAND, fontWeight: 700, fontSize: 46, color: c.suave}}>{p.marca.l1} {p.marca.l2}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* mano */}
      {frame < finCartas + 8 && (
        <div style={{position: 'absolute', left: hx - PUNTA_X, top: manoY - PUNTA_Y, transform: 'rotate(-14deg) scale(.84)', transformOrigin: `${PUNTA_X}px ${PUNTA_Y}px`, filter: 'drop-shadow(-18px 26px 22px rgba(5,15,60,.28))'}}>
          <Mano tinta={c.principal} manga={c.acento} puno={c.principal} />
        </div>
      )}

      {/* texto final */}
      {frame >= iniTexto - 2 && frame < iniLogo + 2 && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 1 - textoFuera, transform: `scale(${1 - textoFuera * 0.2})`}}>
          <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 64, color: c.principal, opacity: pre, marginBottom: 6}}>{p.final.pre}</div>
          <div style={{fontFamily: SERIF, fontWeight: 800, fontSize: 150, lineHeight: 0.95, letterSpacing: -4, color: c.principal, transform: `translateX(${l1 * 900}px)`, filter: blurL1 > 0.5 ? 'url(#hb1)' : undefined}}>{p.final.l1}</div>
          <div style={{fontFamily: SERIF, fontWeight: 800, fontSize: 150, lineHeight: 0.95, letterSpacing: -4, color: c.acento, WebkitTextStroke: `5px ${c.principal}`, paintOrder: 'stroke fill', transform: `translateX(${l2 * 900}px)`, filter: blurL2 > 0.5 ? 'url(#hb2)' : undefined}}>{p.final.l2}</div>
        </AbsoluteFill>
      )}

      {/* logo final */}
      {frame >= iniLogo - 2 && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 60}}>
          {p.mascota && <Img src={staticFile(p.mascota)} style={{width: 230, marginBottom: 6, transform: `scale(${lg}) rotate(${(1 - lg) * -20}deg)`, opacity: Math.min(1, lg * 2)}} />}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', color: c.principal, lineHeight: 0.88, transform: `scale(${0.4 + 0.6 * lg})`, opacity: Math.min(1, lg * 2)}}>
            <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 132, letterSpacing: -4}}>{p.marca.l1}</div>
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 150, letterSpacing: -5, color: c.acento, WebkitTextStroke: `6px ${c.principal}`, paintOrder: 'stroke fill'}}>{p.marca.l2}</div>
          </div>
          <div style={{marginTop: 26, fontFamily: HAND, fontWeight: 700, fontSize: 76, color: c.suave, opacity: lgSub, transform: `translateY(${(1 - lgSub) * 20}px) rotate(-2deg)`}}>{p.tagline}</div>
          <div style={{marginTop: 26, padding: '12px 30px', borderRadius: 50, background: c.principal, color: c.claro, fontFamily: SANS, fontWeight: 700, fontSize: 36, opacity: lgSub}}>@{p.instagram}</div>
        </AbsoluteFill>
      )}
      <div style={{position: 'absolute', left: 72, right: 72, top: SAFE_BOTTOM - 54, height: 50, borderRadius: 25, background: conAlfa(c.principal, 0.85), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 25, color: '#fff', whiteSpace: 'nowrap', opacity: firma}}>
        Hub creado por SmartTap · smarttap.cl@gmail.com
      </div>

      {p.musica && (
        <Audio src={staticFile(p.musica)} volume={(f) => 0.8 * interpolate(f, [0, fade, durationInFrames - fade, durationInFrames], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
      )}
    </AbsoluteFill>
  );
};
