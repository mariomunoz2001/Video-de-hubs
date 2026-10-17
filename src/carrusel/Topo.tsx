import React from 'react';
import {useCurrentFrame} from 'remotion';
import {HEIGHT, WIDTH} from '../theme';

// Líneas "topográficas": anillos deformados alrededor de algunos centros (determinista).
const CENTROS = [
  {x: 160, y: 300, s: 1}, {x: 980, y: 760, s: 2}, {x: 260, y: 1500, s: 3}, {x: 900, y: 1820, s: 4}, {x: 620, y: 1080, s: 5},
];
const anillo = (cx: number, cy: number, r: number, seed: number) => {
  const n = 72;
  let d = '';
  for (let k = 0; k <= n; k++) {
    const a = (k / n) * Math.PI * 2;
    const rr = r * (1 + 0.13 * Math.sin(3 * a + seed) + 0.07 * Math.sin(5 * a + seed * 1.7) + 0.04 * Math.sin(9 * a + seed * 0.3));
    d += `${k ? 'L' : 'M'}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr * 0.86).toFixed(1)}`;
  }
  return d + 'Z';
};
const PATHS = CENTROS.flatMap((c) => Array.from({length: 9}, (_, i) => anillo(c.x, c.y, 40 + i * 52, c.s + i * 0.35)));

export const Topo: React.FC<{color: string; fondo: string}> = ({color, fondo}) => {
  const frame = useCurrentFrame();
  return (
    <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0, background: fondo}}>
      <g transform={`translate(${Math.sin(frame / 90) * 18} ${-frame * 0.25})`} fill="none" stroke={color} strokeWidth="2.4" opacity=".16">
        {PATHS.map((d, i) => <path key={i} d={d} />)}
      </g>
    </svg>
  );
};
