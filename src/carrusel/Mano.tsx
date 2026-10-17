import React from 'react';

/** Mano ilustrada que apunta (trazo azul como la mascota). La yema del índice está en (PUNTA_X, PUNTA_Y). */
export const PUNTA_X = 112;
export const PUNTA_Y = 16;
export const MANO_W = 380;
export const MANO_H = 980;

export const Mano: React.FC<{tinta: string; piel?: string; manga: string; puno: string}> = ({tinta, piel = '#F6D2B0', manga, puno}) => (
  <svg viewBox="0 0 380 980" width={MANO_W} height={MANO_H} style={{display: 'block', overflow: 'visible'}}>
    <g stroke={tinta} strokeWidth="7" strokeLinejoin="round" strokeLinecap="round">
      {/* antebrazo / manga */}
      <path d="M168 520 L300 488 L392 980 L222 980 Z" fill={manga} />
      <path d="M160 512 L304 478 L316 540 L172 576 Z" fill={puno} />
      {/* índice (detrás de la palma) */}
      <path d="M92 346 L88 70 C86 10 140 4 142 62 L156 340 Z" fill={piel} />
      {/* palma */}
      <path d="M146 300 C150 248 214 232 262 252 C306 270 318 330 310 388 C302 450 268 500 220 508 C176 514 146 474 142 420 Z" fill={piel} />
      <path d="M100 56 C100 30 130 28 131 52 L130 84 C118 90 106 88 101 82 Z" fill="#FBE6D3" strokeWidth="4" />
      {/* dedos doblados */}
      <rect x="128" y="300" width="112" height="56" rx="28" fill={piel} />
      <rect x="134" y="350" width="104" height="54" rx="27" fill={piel} />
      <rect x="142" y="398" width="92" height="52" rx="26" fill={piel} />
      {/* pulgar */}
      <path d="M150 300 C120 290 98 312 104 340 C110 366 150 372 178 360 C196 352 198 332 186 320" fill={piel} />
      {/* pliegues */}
      <path d="M262 300 C272 330 274 370 266 400" fill="none" strokeWidth="5" opacity=".5" />
      <path d="M96 250 Q118 244 140 250" fill="none" strokeWidth="4" opacity=".55" />
      <path d="M94 170 Q116 164 138 170" fill="none" strokeWidth="4" opacity=".55" />
    </g>
  </svg>
);
