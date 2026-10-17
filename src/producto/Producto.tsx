import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {aclarar, cargarFuentes, conAlfa, HEIGHT, oscurecer, SAFE_BOTTOM, SAFE_TOP, WIDTH} from '../theme';
import type {ProductoProps} from '../types';
import {ALTO, ANCHO, centroCapa, Hamburguesa} from './Hamburguesa';
import {Ingrediente, type Tipo} from './Ingredientes';

export const DURACION_PRODUCTO = 390; // 13 s a 30 fps
const CIERRE = [262, 292] as const;
const BURGER_TOP = 600;
const BURGER_LEFT = (WIDTH - ANCHO) / 2;

const HANDWRITING = "'Caveat', 'Segoe Print', cursive";
const SANS = "'Poppins', system-ui, sans-serif";

const FLOTANTES: {tipo: Tipo; x: number; y: number; size: number; rot: number}[] = [
  {tipo: 'cebolla', x: 120, y: 470, size: 150, rot: -20},
  {tipo: 'pepinillo', x: 950, y: 450, size: 130, rot: 25},
  {tipo: 'queso', x: 70, y: 1010, size: 140, rot: -18},
  {tipo: 'gota', x: 975, y: 790, size: 100, rot: 14},
  {tipo: 'papa', x: 960, y: 1010, size: 140, rot: 28},
  {tipo: 'papa', x: 130, y: 1230, size: 110, rot: -35},
  {tipo: 'pepinillo', x: 95, y: 720, size: 84, rot: 10},
  {tipo: 'cebolla', x: 985, y: 1200, size: 96, rot: 40},
  {tipo: 'papa', x: 880, y: 1330, size: 90, rot: -50},
  {tipo: 'gota', x: 190, y: 380, size: 70, rot: -25},
  {tipo: 'queso', x: 905, y: 330, size: 84, rot: 30},
  {tipo: 'pepinillo', x: 320, y: 1330, size: 70, rot: 55},
  {tipo: 'semilla', x: 300, y: 330, size: 54, rot: 30},
  {tipo: 'semilla', x: 760, y: 320, size: 44, rot: -40},
  {tipo: 'semilla', x: 880, y: 640, size: 40, rot: 70},
  {tipo: 'semilla', x: 205, y: 1010, size: 46, rot: -20},
  {tipo: 'semilla', x: 640, y: 1290, size: 40, rot: 15},
];

// Llama dividida en lenguas que parpadean por separado (viewBox 1080 x 950)
const CUERPO = 'M540 950C170 950 40 790 80 600C110 460 230 410 540 390C850 410 970 460 1000 600C1040 790 910 950 540 950Z';
const LENGUAS = [
  {d: 'M400 450C405 320 500 240 580 30C605 200 720 290 705 450Z', f: 1, ph: 0},
  {d: 'M150 500C135 390 235 340 262 140C335 240 395 330 365 490Z', f: 1.3, ph: 1.7},
  {d: 'M715 490C700 390 760 330 805 170C935 280 995 410 965 540Z', f: 1.15, ph: 3.1},
];

export const Producto: React.FC<ProductoProps> = (p) => {
  cargarFuentes();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const c = p.colores;
  const sua = Easing.inOut(Easing.cubic);
  const cierre = interpolate(frame, [CIERRE[0], CIERRE[1]], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: sua});

  const bg = `linear-gradient(180deg, ${c.claro} 0%, ${aclarar(c.acento, 0.74)} 32%, ${c.acento} 72%, ${oscurecer(c.acento, 0.16)} 100%)`;

  // llama
  const llama = spring({frame, fps, config: {damping: 13, stiffness: 55, mass: 1.1}});

  // hamburguesa: se arma, se "explosiona" para señalar ingredientes y vuelve a armarse
  const gapIn = spring({frame: frame - 100, fps, config: {damping: 13, stiffness: 90}});
  const gap = gapIn * (1 - interpolate(frame, [250, 280], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: sua}));
  const bob = Math.sin(frame / 18) * 14;
  const giro = Math.sin(frame / 30) * 2.6;

  // título
  const sello = spring({frame: frame - 92, fps, config: {damping: 8, stiffness: 150}});
  const sub = spring({frame: frame - 298, fps, config: {damping: 14}});
  const perro = spring({frame: frame - 290, fps, config: {damping: 16, stiffness: 55}});
  const info = spring({frame: frame - 318, fps, config: {damping: 16, stiffness: 100}});
  const firma = spring({frame: frame - 340, fps, config: {damping: 200}, durationInFrames: 22});
  const trote = Math.abs(Math.sin(frame / 3.2)) * 12;

  const palabras = p.producto.split(' ');
  const [l1, l2] = palabras.length > 1 ? [palabras.slice(0, -1).join(' '), palabras[palabras.length - 1]] : [p.producto, ''];
  const linea = (txt: string, tam: number, base: number) =>
    txt.split('').map((ch, i) => {
      const e = spring({frame: frame - (base + i * 3), fps, config: {damping: 9, stiffness: 170}});
      return (
        <span key={i} style={{display: 'inline-block', color: c.claro, WebkitTextStroke: `${tam * 0.07}px ${c.principal}`, paintOrder: 'stroke fill', textShadow: `0 ${tam * 0.05}px 0 ${oscurecer(c.principal, 0.45)}`, transform: `translateY(${(1 - e) * 120}px) scale(${0.3 + 0.7 * e}) rotate(${(1 - e) * (i % 2 ? 22 : -22)}deg)`, opacity: Math.min(1, e * 2)}}>
          {ch}
        </span>
      );
    });

  return (
    <AbsoluteFill style={{background: bg, overflow: 'hidden'}}>
      {/* llamas del fondo (abajo) */}
      <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0}}>
        <path d={`M0 ${1380 + Math.sin(frame / 25) * 10} C140 1300 120 1220 220 1160 C230 1260 330 1300 380 1360 C520 1330 700 1400 ${WIDTH} 1340 V${HEIGHT} H0Z`} fill={conAlfa(oscurecer(c.acento, 0.14), 0.5)} />
        <path d={`M${WIDTH} ${1450 + Math.cos(frame / 22) * 10} C900 1380 940 1290 880 1230 C1000 1270 1040 1330 ${WIDTH} 1340 Z`} fill={conAlfa(oscurecer(c.acento, 0.3), 0.45)} />
        <path d={`M0 ${1560 + Math.cos(frame / 22) * 10} C260 1480 620 1620 ${WIDTH} 1520 V${HEIGHT} H0Z`} fill={conAlfa(oscurecer(c.acento, 0.22), 0.6)} />
      </svg>

      {/* llama de marca */}
      <svg viewBox="0 0 1080 950" width={WIDTH} height={950} style={{position: 'absolute', left: 0, top: 350 - cierre * 140, transformOrigin: '50% 100%', transform: `scale(${(0.15 + 0.85 * llama) * (1 - cierre * 0.1)})`, opacity: Math.min(1, llama * 2)}}>
        <path d={CUERPO} fill={c.principal} style={{transformOrigin: '540px 950px', transform: `scale(${1 + Math.sin(frame / 15) * 0.014}, ${1 + Math.cos(frame / 19) * 0.02})`}} />
        {LENGUAS.map((l, i) => (
          <path key={i} d={l.d} fill={c.principal} style={{transformBox: 'fill-box', transformOrigin: '50% 100%', transform: `scaleY(${1 + Math.sin(frame / (9 / l.f) + l.ph) * 0.07}) skewX(${Math.sin(frame / (13 / l.f) + l.ph) * 5}deg)`}} />
        ))}
        <path d={CUERPO} fill={oscurecer(c.principal, 0.45)} transform="translate(135 235) scale(.75 .76)" />
        <path d="M300 760C380 650 520 700 545 590C565 500 470 470 520 360" fill="none" stroke={c.suave} strokeWidth="26" strokeLinecap="round" opacity=".45" />
        <path d="M820 780C760 700 690 720 700 640C708 580 780 570 770 500" fill="none" stroke={c.suave} strokeWidth="18" strokeLinecap="round" opacity=".4" />
        <circle cx="170" cy="840" r="24" fill={c.suave} opacity=".35" />
        <circle cx="905" cy="880" r="17" fill={c.suave} opacity=".35" />
        <circle cx="260" cy="560" r="12" fill={c.claro} opacity=".5" />
      </svg>

      {/* marca */}
      <div style={{position: 'absolute', top: SAFE_TOP + 8, left: 0, right: 0, textAlign: 'center', fontFamily: HANDWRITING, fontWeight: 700, fontSize: 108, lineHeight: 1, color: c.principal, opacity: interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp'}), transform: `translateY(${interpolate(frame, [0, 18], [-30, 0], {extrapolateRight: 'clamp'})}px) rotate(-2deg)`}}>
        {p.marca}
      </div>

      {/* ingredientes flotantes */}
      {FLOTANTES.map((f, i) => {
        const e = spring({frame: frame - (12 + i * 2.5), fps, config: {damping: 11, stiffness: 80}});
        const x = interpolate(e, [0, 1], [WIDTH / 2, f.x]) + Math.sin(frame / (26 + i * 3) + i) * 16;
        const y = interpolate(e, [0, 1], [880, f.y]) + Math.cos(frame / (22 + i * 2) + i) * 20 - cierre * 70;
        return (
          <div key={i} style={{position: 'absolute', left: x - f.size / 2, top: y - f.size / 2, transform: `rotate(${f.rot + frame * (i % 2 ? 0.5 : -0.42)}deg) scale(${e})`, opacity: Math.min(1, e * 1.5), filter: 'drop-shadow(0 14px 14px rgba(0,0,0,.28))'}}>
            <Ingrediente tipo={f.tipo} size={f.size} suave={c.suave} acento={c.acento} />
          </div>
        );
      })}

      {/* hamburguesa ilustrada */}
      <div style={{position: 'absolute', left: BURGER_LEFT, top: BURGER_TOP, width: ANCHO, height: ALTO, transform: `translateY(${bob - cierre * 110}px) rotate(${giro}deg) scale(${1 - cierre * 0.14})`, filter: 'drop-shadow(0 40px 30px rgba(5,15,60,.45))'}}>
        <Hamburguesa gap={gap} inicio={10} />
      </div>

      {/* flechas y etiquetas de ingredientes */}
      <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0, opacity: 1 - interpolate(frame, [255, 272], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
        {p.callouts.map((co, i) => {
          const t0 = 112 + i * 26;
          const cc = centroCapa(co.capa, gap);
          const tx = BURGER_LEFT + cc.x + (co.lado === 'L' ? -90 : 90);
          const ty = BURGER_TOP + cc.y + bob;
          const draw = interpolate(frame, [t0 + 6, t0 + 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const x0 = co.lado === 'L' ? 396 : 684;
          const y0 = co.y + 42;
          return (
            <g key={i}>
              <path d={`M${x0} ${y0} Q${(x0 + tx) / 2} ${Math.min(y0, ty) - 36} ${tx} ${ty}`} fill="none" stroke={c.claro} strokeWidth="6" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
              <circle cx={tx} cy={ty} r={14 * (draw > 0.95 ? 1 : 0)} fill={c.acento} stroke={c.claro} strokeWidth="5" />
            </g>
          );
        })}
      </svg>
      {p.callouts.map((co, i) => {
        const t0 = 112 + i * 26;
        const e = spring({frame: frame - t0, fps, config: {damping: 12, stiffness: 140}});
        const fuera = interpolate(frame, [255, 272], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return (
          <div key={i} style={{position: 'absolute', top: co.y, ...(co.lado === 'L' ? {left: 36} : {right: 36}), width: 360, height: 84, borderRadius: 42, background: c.claro, color: c.principal, boxShadow: '0 16px 30px rgba(5,15,60,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontFamily: SANS, fontWeight: 700, fontSize: 35, opacity: Math.min(1, e * 1.6) * (1 - fuera), transform: `translateX(${(1 - e) * (co.lado === 'L' ? -420 : 420)}px) rotate(${co.lado === 'L' ? -2 : 2}deg)`, zIndex: 8}}>
            <span style={{width: 16, height: 16, borderRadius: '50%', background: c.acento, boxShadow: `0 0 0 4px ${conAlfa(c.acento, 0.35)}`}} />
            {co.texto}
          </div>
        );
      })}

      {/* sello de precio */}
      <div style={{position: 'absolute', left: 52, top: 500, width: 232, height: 232, borderRadius: '50%', background: c.acento, color: c.principal, boxShadow: `0 0 0 8px ${c.claro}, 0 24px 40px rgba(5,15,60,.35)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${sello}) rotate(${-12 + (1 - sello) * 40 + Math.sin(frame / 12) * 2}deg)`, opacity: Math.min(1, sello * 2), zIndex: 9}}>
        {p.notaPrecio && <div style={{fontFamily: HANDWRITING, fontWeight: 700, fontSize: 40, lineHeight: 1, marginBottom: 2}}>{p.notaPrecio}</div>}
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 68, lineHeight: 1}}>{p.precio}</div>
      </div>

      {/* título en dos líneas inclinadas (como la referencia) */}
      <div style={{position: 'absolute', top: interpolate(cierre, [0, 1], [1030, 915]), left: 0, width: WIDTH, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingRight: 70, fontFamily: HANDWRITING, fontWeight: 700, lineHeight: 0.82, whiteSpace: 'pre', zIndex: 7, transformOrigin: '70% 0%', transform: `translateX(${-cierre * 190}px) scale(${1 - cierre * 0.42}) rotate(${-7 + cierre * 4}deg)`}}>
        <div style={{fontSize: 250}}>{linea(l1, 250, 44)}</div>
        {l2 && <div style={{fontSize: 330, marginRight: 40}}>{linea(l2, 330, 44 + l1.length * 3)}</div>}
      </div>

      {/* cierre */}
      <div style={{position: 'absolute', top: 1240, left: 0, right: 0, textAlign: 'center', fontFamily: HANDWRITING, fontWeight: 700, fontSize: 90, lineHeight: 1, color: c.principal, opacity: sub, transform: `translateY(${(1 - sub) * 40}px) rotate(-2deg)`, zIndex: 7}}>
        {p.tagline}
      </div>
      {p.mascota && (
        <Img src={staticFile(p.mascota)} style={{position: 'absolute', top: 1332 - trote * (perro > 0.95 ? 1 : 0), left: interpolate(perro, [0, 1], [-300, 455]), width: 170, opacity: perro > 0.01 ? 1 : 0}} />
      )}
      <div style={{position: 'absolute', top: 1466, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 16, opacity: info, transform: `translateY(${(1 - info) * 30}px)`}}>
        <div style={{padding: '14px 32px', borderRadius: 50, background: c.principal, color: c.claro, fontFamily: SANS, fontWeight: 700, fontSize: 36}}>@{p.instagram}</div>
        <div style={{padding: '14px 32px', borderRadius: 50, background: c.claro, color: c.principal, fontFamily: SANS, fontWeight: 700, fontSize: 36}}>{p.direccion}</div>
      </div>
      {p.horario && (
        <div style={{position: 'absolute', top: 1544, left: 0, right: 0, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 26, color: c.principal, opacity: info}}>{p.horario}</div>
      )}
      <div style={{position: 'absolute', left: 72, right: 72, top: SAFE_BOTTOM - 54, height: 50, borderRadius: 25, background: 'rgba(5,15,60,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 25, color: '#fff', whiteSpace: 'nowrap', opacity: firma, transform: `translateY(${(1 - firma) * 16}px)`}}>
        Hub creado por SmartTap · smarttap.cl@gmail.com
      </div>
    </AbsoluteFill>
  );
};
