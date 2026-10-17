import React from 'react';

/** Mano ilustrada vista desde el dorso, apuntando con el índice (trazo azul como la mascota).
 *  La yema del índice queda en (PUNTA_X, PUNTA_Y). */
export const PUNTA_X = 120;
export const PUNTA_Y = 20;
export const MANO_W = 400;
export const MANO_H = 940;

// Silueta continua: índice + puño + muñeca
const SILUETA =
  'M120 20C99 20 88 36 88 62L92 282C70 300 56 338 64 378C72 414 102 434 132 442C136 472 142 500 150 528L292 528C300 480 314 430 314 380C314 340 304 312 286 302C272 292 256 290 246 294C236 282 216 278 200 286C188 290 178 290 168 284L152 62C152 36 142 20 120 20Z';

export const Mano: React.FC<{tinta: string; piel?: string; sombra?: string; manga: string; puno: string}> = ({
  tinta,
  piel = '#F3C9A2',
  sombra = 'rgba(176,96,60,.28)',
  manga,
  puno,
}) => (
  <svg viewBox="0 0 400 940" width={MANO_W} height={MANO_H} style={{display: 'block', overflow: 'visible'}}>
    <defs>
      <clipPath id="mano-clip"><path d={SILUETA} /></clipPath>
    </defs>
    {/* manga */}
    <path d="M138 566L306 566C334 690 362 810 384 940L192 940C170 816 150 694 138 566Z" fill={manga} stroke={tinta} strokeWidth="7" strokeLinejoin="round" />
    <path d="M200 640C230 700 250 790 258 900" fill="none" stroke={tinta} strokeWidth="4" opacity=".35" strokeLinecap="round" />
    <path d="M280 620C300 700 318 790 328 880" fill="none" stroke={tinta} strokeWidth="4" opacity=".25" strokeLinecap="round" />

    {/* mano */}
    <path d={SILUETA} fill={piel} />
    <g clipPath="url(#mano-clip)">
      {/* sombra lateral derecha y bajo los nudillos */}
      <path d="M314 360C318 430 304 490 292 540L258 540C272 480 284 420 280 360Z" fill={sombra} />
      <path d="M160 380C200 398 256 398 316 384L316 420C260 432 200 432 150 414Z" fill={sombra} opacity=".55" />
      <path d="M140 60C142 120 146 200 156 284L168 284L152 62Z" fill={sombra} opacity=".7" />
    </g>
    <path d={SILUETA} fill="none" stroke={tinta} strokeWidth="7" strokeLinejoin="round" />

    <g fill="none" stroke={tinta} strokeLinecap="round" strokeLinejoin="round">
      {/* uña */}
      <path d="M101 44C101 30 139 30 139 44L137 78C125 85 112 85 103 78Z" fill="#FBE3CF" strokeWidth="4.5" />
      {/* pliegues del índice */}
      <path d="M100 160Q120 154 144 160" strokeWidth="4" opacity=".55" />
      <path d="M100 172Q118 168 138 172" strokeWidth="3" opacity=".35" />
      <path d="M98 228Q122 220 150 228" strokeWidth="4" opacity=".55" />
      {/* pulgar */}
      <path d="M92 284C112 300 130 322 138 352C142 370 138 392 132 410" strokeWidth="5" opacity=".75" />
      <path d="M80 360C86 352 96 350 104 356" strokeWidth="3.5" opacity=".4" />
      {/* dedos doblados (separaciones) */}
      <path d="M200 290C198 318 196 350 198 384" strokeWidth="4.5" opacity=".65" />
      <path d="M246 296C244 324 242 352 242 386" strokeWidth="4.5" opacity=".65" />
      <path d="M286 304C284 330 282 354 280 382" strokeWidth="4" opacity=".55" />
      {/* nudillos */}
      <path d="M210 300Q222 294 234 300" strokeWidth="3.5" opacity=".45" />
      <path d="M254 306Q266 302 276 308" strokeWidth="3.5" opacity=".45" />
      {/* tendones del dorso */}
      <path d="M222 400C220 440 218 470 214 510" strokeWidth="3" opacity=".25" />
      <path d="M262 402C262 440 258 474 252 510" strokeWidth="3" opacity=".25" />
    </g>

    {/* puño de la manga */}
    <path d="M136 520L304 520L310 576L132 576Z" fill={puno} stroke={tinta} strokeWidth="7" strokeLinejoin="round" />
    <path d="M150 548L296 548" stroke="#ffffff" strokeOpacity=".25" strokeWidth="5" strokeLinecap="round" />
  </svg>
);
