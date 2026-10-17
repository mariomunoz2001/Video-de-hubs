import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';

/** Hamburguesa ilustrada en capas (Clasic GO: cheddar, cebolla morada, pepinillos y kétchup). Ancho local: 700. */
export const ANCHO = 700;
export type Capa = 'panArriba' | 'ketchup' | 'pepinillos' | 'cebolla' | 'queso' | 'carne' | 'panAbajo';

// orden de arriba hacia abajo; y = borde superior, h = alto, cx = x donde se señala
export const CAPAS: {id: Capa; y: number; h: number; cx: number}[] = [
  {id: 'panArriba', y: 0, h: 210, cx: 350},
  {id: 'ketchup', y: 190, h: 76, cx: 520},
  {id: 'pepinillos', y: 226, h: 66, cx: 190},
  {id: 'cebolla', y: 262, h: 64, cx: 540},
  {id: 'queso', y: 296, h: 70, cx: 170},
  {id: 'carne', y: 316, h: 100, cx: 350},
  {id: 'panAbajo', y: 398, h: 108, cx: 350},
];
export const ALTO = 506;
export const PASO_EXPLOSION = 34;

/** Desplazamiento vertical de una capa en la vista "explosionada" (gap 0..1). */
export const dyCapa = (i: number, gap: number) => (i - 3) * PASO_EXPLOSION * gap;
export const centroCapa = (id: Capa, gap: number) => {
  const i = CAPAS.findIndex((c) => c.id === id);
  const c = CAPAS[i];
  return {x: c.cx, y: c.y + c.h / 2 + dyCapa(i, gap)};
};

const semillas = [[120, 120], [210, 70], [300, 40], [400, 60], [500, 80], [570, 140], [160, 170], [350, 110], [470, 150], [260, 150]];
const puntos = Array.from({length: 38}, (_, i) => [30 + ((i * 97) % 640), 18 + ((i * 53) % 62), 3 + (i % 3)]);

const Dibujo: React.FC<{id: Capa}> = ({id}) => {
  switch (id) {
    case 'panArriba':
      return (
        <svg viewBox="0 0 700 210" width={ANCHO} height={210} style={{display: 'block'}}>
          <defs><linearGradient id="pa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFD58A" /><stop offset=".45" stopColor="#F0A23C" /><stop offset="1" stopColor="#C97420" /></linearGradient></defs>
          <path d="M18 190C18 70 160 4 350 4S682 70 682 190q0 20-22 20H40q-22 0-22-20z" fill="url(#pa)" stroke="#8A4A12" strokeWidth="6" strokeLinejoin="round" />
          <path d="M70 120C90 62 170 30 250 24" stroke="#fff" strokeOpacity=".55" strokeWidth="16" strokeLinecap="round" fill="none" />
          <ellipse cx="610" cy="130" rx="14" ry="26" fill="#fff" opacity=".18" transform="rotate(-18 610 130)" />
          {semillas.map(([x, y], i) => <ellipse key={i} cx={x + 60} cy={y + 20} rx="11" ry="6" fill="#FFF3D1" stroke="#B8721F" strokeWidth="2" transform={`rotate(${(i * 47) % 160 - 80} ${x + 60} ${y + 20})`} />)}
        </svg>
      );
    case 'ketchup':
      return (
        <svg viewBox="0 0 700 76" width={ANCHO} height={76} style={{display: 'block'}}>
          <path d="M22 16Q350-8 678 16L666 40Q632 34 624 70Q610 40 580 44L130 46Q100 40 92 70Q80 38 40 42Z" fill="#D6281B" stroke="#8E140B" strokeWidth="5" strokeLinejoin="round" />
          <path d="M120 22Q260 10 360 20" stroke="#fff" strokeOpacity=".55" strokeWidth="9" strokeLinecap="round" fill="none" />
        </svg>
      );
    case 'pepinillos':
      return (
        <svg viewBox="0 0 700 66" width={ANCHO} height={66} style={{display: 'block'}}>
          {[110, 230, 350, 470, 590].map((x, i) => (
            <g key={x}>
              <ellipse cx={x} cy={33 + (i % 2) * 4} rx="84" ry="24" fill="#4A8A2B" stroke="#2A5A14" strokeWidth="5" />
              <ellipse cx={x} cy={31 + (i % 2) * 4} rx="62" ry="15" fill="#A8D26C" />
              <ellipse cx={x - 12} cy={29 + (i % 2) * 4} rx="26" ry="6" fill="#DFF2B0" opacity=".8" />
            </g>
          ))}
        </svg>
      );
    case 'cebolla':
      return (
        <svg viewBox="0 0 700 64" width={ANCHO} height={64} style={{display: 'block'}}>
          {[[150, 30, 118], [330, 38, 130], [520, 30, 130], [650, 36, 70]].map(([x, y, rx], i) => (
            <g key={i}>
              <ellipse cx={x} cy={y} rx={rx} ry="19" fill="none" stroke="#6E3A93" strokeWidth="15" />
              <ellipse cx={x} cy={y} rx={rx} ry="19" fill="none" stroke="#B88AD8" strokeWidth="5" strokeDasharray="90 170" strokeLinecap="round" />
              <ellipse cx={x} cy={y} rx={rx - 24} ry="9" fill="none" stroke="#9559BD" strokeWidth="5" opacity=".75" />
            </g>
          ))}
        </svg>
      );
    case 'queso':
      return (
        <svg viewBox="0 0 700 70" width={ANCHO} height={70} style={{display: 'block'}}>
          <path d="M12 12Q350 0 688 12L676 34L630 28L606 66L578 30L130 34L110 62L88 34L24 38Z" fill="#FFC21C" stroke="#B87C00" strokeWidth="5" strokeLinejoin="round" />
          <path d="M40 18Q300 8 520 16" stroke="#FFF1A6" strokeWidth="8" strokeLinecap="round" fill="none" />
        </svg>
      );
    case 'carne':
      return (
        <svg viewBox="0 0 700 100" width={ANCHO} height={100} style={{display: 'block'}}>
          <defs><linearGradient id="ca" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6B3D24" /><stop offset="1" stopColor="#3A1D0F" /></linearGradient></defs>
          <path d="M26 44C26 14 70 8 120 12L580 12C640 8 676 18 676 48C676 84 640 96 590 92L110 92C60 96 26 80 26 44Z" fill="url(#ca)" stroke="#2A1208" strokeWidth="6" />
          {puntos.map(([x, y, r], i) => <circle key={i} cx={x} cy={y + 14} r={r} fill={i % 2 ? '#8A5636' : '#2A1208'} opacity=".7" />)}
          <path d="M70 30Q200 16 330 22" stroke="#fff" strokeOpacity=".22" strokeWidth="9" strokeLinecap="round" fill="none" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 700 108" width={ANCHO} height={108} style={{display: 'block'}}>
          <defs><linearGradient id="pb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F4B658" /><stop offset="1" stopColor="#C97420" /></linearGradient></defs>
          <path d="M22 8H678q10 0 6 16C668 88 610 104 560 104H140C90 104 32 88 16 24q-4-16 6-16z" fill="url(#pb)" stroke="#8A4A12" strokeWidth="6" strokeLinejoin="round" />
          <path d="M60 60Q200 82 330 84" stroke="#fff" strokeOpacity=".35" strokeWidth="9" strokeLinecap="round" fill="none" />
        </svg>
      );
  }
};

/** gap: 0 = armada, 1 = vista explosionada. */
export const Hamburguesa: React.FC<{gap: number; inicio: number}> = ({gap, inicio}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  // se arma de abajo hacia arriba
  const orden = [...CAPAS].reverse();
  return (
    <div style={{position: 'relative', width: ANCHO, height: ALTO}}>
      {orden.map((c, n) => {
        const i = CAPAS.findIndex((x) => x.id === c.id);
        const e = spring({frame: frame - inicio - n * 7, fps, config: {damping: 9, stiffness: 120, mass: 0.9}});
        const caida = (1 - e) * -1100;
        const rot = (1 - e) * (i % 2 ? 14 : -14);
        const dy = dyCapa(i, gap);
        // orden de apilado: carne y pan de abajo detrás; queso encima de la carne; pan de arriba encima de todo
        const z = {panAbajo: 1, carne: 2, queso: 3, cebolla: 4, pepinillos: 5, ketchup: 6, panArriba: 7}[c.id];
        return (
          <div key={c.id} style={{position: 'absolute', left: 0, top: c.y + dy + caida, zIndex: z, transform: `rotate(${rot}deg)`, transformOrigin: '50% 50%', opacity: Math.min(1, e * 3), filter: 'drop-shadow(0 10px 8px rgba(40,10,0,.25))'}}>
            <Dibujo id={c.id} />
          </div>
        );
      })}
    </div>
  );
};
