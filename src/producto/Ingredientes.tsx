import React from 'react';

export type Tipo = 'cebolla' | 'pepinillo' | 'queso' | 'gota' | 'papa' | 'semilla';

/** Ilustraciones simples (estilo plano) de los ingredientes que flotan alrededor del producto. */
export const Ingrediente: React.FC<{tipo: Tipo; size: number; suave: string; acento: string}> = ({tipo, size, suave, acento}) => {
  const s = {width: size, height: size, display: 'block' as const, overflow: 'visible' as const};
  switch (tipo) {
    case 'cebolla':
      return (
        <svg viewBox="0 0 100 100" style={s}>
          <circle cx="50" cy="50" r="38" fill="none" stroke="#8d5fb0" strokeWidth="14" />
          <circle cx="50" cy="50" r="38" fill="none" stroke="#c9a6e3" strokeWidth="4" strokeDasharray="60 180" strokeLinecap="round" />
          <circle cx="50" cy="50" r="24" fill="none" stroke="#a97bc9" strokeWidth="5" opacity=".8" />
        </svg>
      );
    case 'pepinillo':
      return (
        <svg viewBox="0 0 100 100" style={s}>
          <circle cx="50" cy="50" r="42" fill="#4f8a2b" />
          <circle cx="50" cy="50" r="34" fill="#a5cf6b" />
          <circle cx="50" cy="50" r="20" fill="#cde89a" opacity=".85" />
          {[[38, 44], [58, 40], [48, 60], [62, 58], [36, 60]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="3" ry="5" fill="#f3f7cf" transform={`rotate(${i * 35} ${x} ${y})`} />)}
        </svg>
      );
    case 'queso':
      return (
        <svg viewBox="0 0 100 100" style={s}>
          <path d="M8 14h84v54c0 12-9 12-12 4-3-9-12-9-14 0-3 14-14 14-17 0-3-9-12-9-14 0-3 12-12 12-14 0-2-8-9-8-13 0z" fill={acento} />
          <path d="M8 14h84v10H8z" fill="#fff" opacity=".25" />
        </svg>
      );
    case 'gota':
      return (
        <svg viewBox="0 0 100 100" style={s}>
          <path d="M50 6c18 26 34 42 34 60a34 34 0 0 1-68 0c0-18 16-34 34-60z" fill="#d6281b" />
          <ellipse cx="36" cy="62" rx="7" ry="13" fill="#fff" opacity=".35" transform="rotate(20 36 62)" />
        </svg>
      );
    case 'papa':
      return (
        <svg viewBox="0 0 100 100" style={s}>
          <rect x="36" y="2" width="28" height="96" rx="6" fill="#f2c14e" />
          <rect x="36" y="2" width="12" height="96" rx="6" fill="#ffe08a" />
          {[22, 40, 58, 76].map((y) => <path key={y} d={`M36 ${y}h28`} stroke="#d99a1f" strokeWidth="3" opacity=".6" />)}
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 100 100" style={s}>
          <ellipse cx="50" cy="50" rx="16" ry="28" fill="#fff3d1" stroke={suave} strokeWidth="0" />
          <ellipse cx="44" cy="40" rx="4" ry="9" fill="#fff" opacity=".6" />
        </svg>
      );
  }
};
