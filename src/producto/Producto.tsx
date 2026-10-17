import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {aclarar, cargarFuentes, conAlfa, HEIGHT, oscurecer, SAFE_BOTTOM, SAFE_TOP, WIDTH} from '../theme';
import type {ProductoProps} from '../types';
import {Ingrediente, type Tipo} from './Ingredientes';

export const DURACION_PRODUCTO = 390; // 13 s a 30 fps
const CIERRE = [262, 292] as const;

const HANDWRITING = "'Caveat', 'Segoe Print', cursive";
const SANS = "'Poppins', system-ui, sans-serif";

// Posición de los ingredientes flotantes (alrededor del producto)
const FLOTANTES: {tipo: Tipo; x: number; y: number; size: number; rot: number; fase: number}[] = [
  {tipo: 'cebolla', x: 150, y: 470, size: 150, rot: -20, fase: 0},
  {tipo: 'pepinillo', x: 930, y: 440, size: 130, rot: 25, fase: 1},
  {tipo: 'queso', x: 90, y: 1190, size: 150, rot: -18, fase: 2},
  {tipo: 'gota', x: 960, y: 760, size: 96, rot: 14, fase: 3},
  {tipo: 'papa', x: 930, y: 1260, size: 130, rot: 28, fase: 4},
  {tipo: 'papa', x: 190, y: 1330, size: 100, rot: -35, fase: 5},
  {tipo: 'pepinillo', x: 110, y: 700, size: 78, rot: 10, fase: 6},
  {tipo: 'cebolla', x: 980, y: 1080, size: 90, rot: 40, fase: 7},
  {tipo: 'semilla', x: 300, y: 380, size: 54, rot: 30, fase: 8},
  {tipo: 'semilla', x: 760, y: 330, size: 44, rot: -40, fase: 9},
  {tipo: 'semilla', x: 860, y: 600, size: 40, rot: 70, fase: 10},
  {tipo: 'semilla', x: 230, y: 1010, size: 46, rot: -20, fase: 11},
];

// Llama con lenguas en la parte alta (viewBox 1080 x 950)
const BLOB = 'M540 950C170 950 30 710 110 500C165 360 275 330 270 170C370 250 420 330 395 430C440 330 480 220 575 90C590 230 705 290 745 410C790 330 815 270 800 190C905 290 1065 480 995 700C950 860 800 950 540 950Z';

export const Producto: React.FC<ProductoProps> = (p) => {
  cargarFuentes();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const c = p.colores;
  const sua = Easing.inOut(Easing.cubic);
  const cierre = interpolate(frame, [CIERRE[0], CIERRE[1]], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: sua});

  // --- fondo
  const bg = `linear-gradient(180deg, ${c.claro} 0%, ${aclarar(c.acento, 0.72)} 34%, ${c.acento} 74%, ${oscurecer(c.acento, 0.16)} 100%)`;

  // --- llama
  const llama = spring({frame, fps, config: {damping: 14, stiffness: 55, mass: 1.1}});
  const wob = `scale(${1 + Math.sin(frame / 15) * 0.018}, ${1 + Math.cos(frame / 19) * 0.026}) skewX(${Math.sin(frame / 27) * 1.6}deg)`;

  // --- hamburguesa
  const entra = spring({frame: frame - 8, fps, config: {damping: 11, stiffness: 70, mass: 1}});
  const BW = 720;
  const bh = BW * (789 / 1020);
  const burgerTransform = `translateY(${interpolate(entra, [0, 1], [1100, 0]) + Math.sin(frame / 20) * 13 - cierre * 120}px) rotate(${interpolate(entra, [0, 1], [-16, 0]) + Math.sin(frame / 31) * 2.4}deg) scale(${1 - cierre * 0.12})`;

  // --- título (letra por letra)
  const letras = p.producto.split('');
  const tamTitulo = interpolate(cierre, [0, 1], [270, 190]);
  const topTitulo = interpolate(cierre, [0, 1], [1195, 985]);

  // --- precio
  const sello = spring({frame: frame - 78, fps, config: {damping: 8, stiffness: 150}});

  // --- cierre
  const sub = spring({frame: frame - 296, fps, config: {damping: 14}});
  const perro = spring({frame: frame - 288, fps, config: {damping: 16, stiffness: 55}});
  const info = spring({frame: frame - 318, fps, config: {damping: 16, stiffness: 100}});
  const firma = spring({frame: frame - 340, fps, config: {damping: 200}, durationInFrames: 22});
  const trote = Math.abs(Math.sin(frame / 3.2)) * 14;

  return (
    <AbsoluteFill style={{background: bg, overflow: 'hidden'}}>
      {/* olas de fondo */}
      <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0}}>
        <path d={`M0 ${1420 + Math.sin(frame / 25) * 10} C300 1330 520 1500 ${WIDTH} 1380 V${HEIGHT} H0Z`} fill={conAlfa(oscurecer(c.acento, 0.12), 0.45)} />
        <path d={`M0 ${1560 + Math.cos(frame / 22) * 10} C260 1480 620 1620 ${WIDTH} 1520 V${HEIGHT} H0Z`} fill={conAlfa(oscurecer(c.acento, 0.2), 0.55)} />
      </svg>

      {/* llama / mancha de marca */}
      <svg viewBox="0 0 1080 950" width={WIDTH} height={950} style={{position: 'absolute', left: 0, top: 360 - cierre * 150, transformOrigin: '50% 100%', transform: `scale(${(0.15 + 0.85 * llama) * (1 - cierre * 0.1)}) ${wob}`, opacity: Math.min(1, llama * 2)}}>
        <path d={BLOB} fill={c.principal} />
        <path d={BLOB} fill={oscurecer(c.principal, 0.45)} transform="translate(130 215) scale(.76 .78)" />
        <path d="M215 520c-35-45-8-100 28-135 8 55 54 72 36 135-13 36-54 36-64 0z" fill={c.suave} opacity=".5" />
        <path d="M860 560c-28-38 0-84 32-112 6 46 44 58 28 112-11 32-49 32-60 0z" fill={c.suave} opacity=".4" />
        <circle cx="190" cy="800" r="24" fill={c.suave} opacity=".35" />
        <circle cx="880" cy="860" r="17" fill={c.suave} opacity=".35" />
      </svg>

      {/* marca */}
      <div style={{position: 'absolute', top: SAFE_TOP + 8, left: 0, right: 0, textAlign: 'center', fontFamily: HANDWRITING, fontWeight: 700, fontSize: 108, lineHeight: 1, color: c.principal, opacity: interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp'}), transform: `translateY(${interpolate(frame, [0, 18], [-30, 0], {extrapolateRight: 'clamp'})}px) rotate(-2deg)`}}>
        {p.marca}
      </div>

      {/* ingredientes flotantes */}
      {FLOTANTES.map((f, i) => {
        const e = spring({frame: frame - (14 + i * 3), fps, config: {damping: 11, stiffness: 80}});
        const x = interpolate(e, [0, 1], [WIDTH / 2, f.x]) + Math.sin(frame / (28 + i * 3) + i) * 14;
        const y = interpolate(e, [0, 1], [880, f.y]) + Math.cos(frame / (24 + i * 2) + i) * 18 - cierre * 70;
        return (
          <div key={i} style={{position: 'absolute', left: x - f.size / 2, top: y - f.size / 2, transform: `rotate(${f.rot + frame * (i % 2 ? 0.4 : -0.35)}deg) scale(${e})`, opacity: Math.min(1, e * 1.5), filter: 'drop-shadow(0 14px 14px rgba(0,0,0,.28))'}}>
            <Ingrediente tipo={f.tipo} size={f.size} suave={c.suave} acento={c.acento} />
          </div>
        );
      })}

      {/* producto */}
      <div style={{position: 'absolute', left: (WIDTH - BW) / 2, top: 590, width: BW, height: bh, transform: burgerTransform, filter: 'drop-shadow(0 50px 40px rgba(5,15,60,.5))'}}>
        <Img src={staticFile(p.imagen)} style={{width: BW, height: bh, display: 'block'}} />
      </div>

      {/* llamadas a ingredientes */}
      <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0, opacity: 1 - interpolate(frame, [255, 272], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
        {p.callouts.map((co, i) => {
          const t0 = 105 + i * 28;
          const draw = interpolate(frame, [t0 + 6, t0 + 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const x0 = co.lado === 'L' ? 396 : 684;
          const y0 = co.y + 42;
          const [tx, ty] = co.objetivo;
          const mx = (x0 + tx) / 2, my = Math.min(y0, ty) - 40;
          return <path key={i} d={`M${x0} ${y0} Q${mx} ${my} ${tx} ${ty}`} fill="none" stroke={c.claro} strokeWidth="6" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />;
        })}
        {p.callouts.map((co, i) => {
          const t0 = 105 + i * 28;
          const draw = interpolate(frame, [t0 + 18, t0 + 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return <circle key={i} cx={co.objetivo[0]} cy={co.objetivo[1]} r={14 * draw} fill={c.acento} stroke={c.claro} strokeWidth="5" />;
        })}
      </svg>
      {p.callouts.map((co, i) => {
        const t0 = 105 + i * 28;
        const e = spring({frame: frame - t0, fps, config: {damping: 12, stiffness: 140}});
        const fuera = interpolate(frame, [255, 272], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return (
          <div key={i} style={{position: 'absolute', top: co.y, ...(co.lado === 'L' ? {left: 36} : {right: 36}), width: 360, height: 84, borderRadius: 42, background: c.claro, color: c.principal, boxShadow: '0 16px 30px rgba(5,15,60,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontFamily: SANS, fontWeight: 700, fontSize: 35, opacity: Math.min(1, e * 1.6) * (1 - fuera), transform: `translateX(${(1 - e) * (co.lado === 'L' ? -380 : 380)}px) rotate(${co.lado === 'L' ? -2 : 2}deg)`}}>
            <span style={{width: 16, height: 16, borderRadius: '50%', background: c.acento, boxShadow: `0 0 0 4px ${conAlfa(c.acento, 0.35)}`}} />
            {co.texto}
          </div>
        );
      })}

      {/* sello de precio */}
      <div style={{position: 'absolute', left: 52, top: 500, width: 232, height: 232, borderRadius: '50%', background: c.acento, color: c.principal, boxShadow: `0 0 0 8px ${c.claro}, 0 24px 40px rgba(5,15,60,.35)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${sello}) rotate(${-12 + (1 - sello) * 40}deg)`, opacity: Math.min(1, sello * 2), zIndex: 3}}>
        {p.notaPrecio && <div style={{fontFamily: HANDWRITING, fontWeight: 700, fontSize: 40, lineHeight: 1, marginBottom: 2}}>{p.notaPrecio}</div>}
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 68, lineHeight: 1}}>{p.precio}</div>
      </div>

      {/* título */}
      <div style={{position: 'absolute', top: topTitulo, left: 0, right: 0, display: 'flex', justifyContent: 'center', fontFamily: HANDWRITING, fontWeight: 700, fontSize: tamTitulo, lineHeight: 1, whiteSpace: 'pre', zIndex: 4}}>
        {letras.map((ch, i) => {
          const e = spring({frame: frame - (44 + i * 3), fps, config: {damping: 9, stiffness: 170}});
          return (
            <span key={i} style={{display: 'inline-block', color: c.claro, WebkitTextStroke: `${tamTitulo * 0.06}px ${c.principal}`, paintOrder: 'stroke fill', textShadow: `0 ${tamTitulo * 0.05}px 0 ${oscurecer(c.principal, 0.4)}`, transform: `translateY(${(1 - e) * 90}px) scale(${0.3 + 0.7 * e}) rotate(${(1 - e) * (i % 2 ? 18 : -18) + (i % 2 ? 1.5 : -1.5)}deg)`, opacity: Math.min(1, e * 2)}}>
              {ch}
            </span>
          );
        })}
      </div>

      {/* cierre: tagline + mascota + datos */}
      <div style={{position: 'absolute', top: 1168, left: 0, right: 0, textAlign: 'center', fontFamily: HANDWRITING, fontWeight: 700, fontSize: 96, lineHeight: 1, color: c.principal, opacity: sub, transform: `translateY(${(1 - sub) * 40}px) rotate(-2deg)`}}>
        {p.tagline}
      </div>
      {p.mascota && (
        <Img src={staticFile(p.mascota)} style={{position: 'absolute', top: 1252 - trote * (perro > 0.95 ? 1 : 0), left: interpolate(perro, [0, 1], [-300, 425]), width: 230, opacity: perro > 0.01 ? 1 : 0, transform: `scaleX(1)`}} />
      )}
      <div style={{position: 'absolute', top: 1450, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 16, opacity: info, transform: `translateY(${(1 - info) * 30}px)`}}>
        <div style={{padding: '14px 32px', borderRadius: 50, background: c.principal, color: c.claro, fontFamily: SANS, fontWeight: 700, fontSize: 36}}>@{p.instagram}</div>
        <div style={{padding: '14px 32px', borderRadius: 50, background: c.claro, color: c.principal, fontFamily: SANS, fontWeight: 700, fontSize: 36}}>{p.direccion}</div>
      </div>
      {p.horario && (
        <div style={{position: 'absolute', top: 1530, left: 0, right: 0, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 27, color: c.principal, opacity: info}}>{p.horario}</div>
      )}
      <div style={{position: 'absolute', left: 72, right: 72, top: SAFE_BOTTOM - 58, height: 54, borderRadius: 27, background: 'rgba(5,15,60,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 26, color: '#fff', whiteSpace: 'nowrap', opacity: firma, transform: `translateY(${(1 - firma) * 16}px)`}}>
        Hub creado por SmartTap · smarttap.cl@gmail.com
      </div>
    </AbsoluteFill>
  );
};
