import React from 'react';

/** Patita de schnauzer (estilo de la mascota: trazo azul, relleno claro, mechones de pelo).
 *  El punto de contacto (dedos centrales) queda en (PATA_PUNTA_X, PATA_PUNTA_Y). */
export const PATA_PUNTA_X = 162;
export const PATA_PUNTA_Y = 40;

// Mechones puntiagudos a lo largo de un borde (apuntan hacia afuera y un poco hacia abajo)
const mechones = (a: [number, number], b: [number, number], paso: number, amp: number, lado: 1 | -1) => {
  const [x0, y0] = a;
  const [x1, y1] = b;
  const len = Math.hypot(x1 - x0, y1 - y0);
  const ux = (x1 - x0) / len;
  const uy = (y1 - y0) / len;
  const nx = -uy * lado;
  const ny = ux * lado;
  const n = Math.round(len / paso);
  let d = '';
  for (let k = 0; k < n; k++) {
    const t = ((k + 0.62) / n) * len;
    const t1 = ((k + 1) / n) * len;
    const v = amp * (0.75 + 0.25 * Math.sin(k * 2.3 + lado));
    const tipx = x0 + ux * t + nx * v;
    const tipy = y0 + uy * t + ny * v + 6;
    d += ` Q${(x0 + ux * (t - paso * 0.25) + nx * v * 0.5).toFixed(1)} ${(y0 + uy * (t - paso * 0.25) + ny * v * 0.5).toFixed(1)} ${tipx.toFixed(1)} ${tipy.toFixed(1)}`;
    d += ` Q${(x0 + ux * (t + paso * 0.1)).toFixed(1)} ${(y0 + uy * (t + paso * 0.1)).toFixed(1)} ${(x0 + ux * t1).toFixed(1)} ${(y0 + uy * t1).toFixed(1)}`;
  }
  return d;
};

// Silueta continua: 4 dedos arriba, pie, y pierna peluda hacia abajo a la derecha
const SILUETA =
  'M44 176' +
  'C28 124 68 74 102 98' + // dedo 1
  'C96 44 150 30 162 72' + // dedo 2
  'C174 30 230 42 224 98' + // dedo 3
  'C258 74 300 116 284 176' + // dedo 4
  'C282 204 272 224 262 240' +
  mechones([262, 240], [466, 1320], 62, 20, -1) +
  ' L292 1320' +
  mechones([292, 1320], [68, 246], 62, 20, -1) +
  ' C54 226 46 202 44 176Z';

export const Pata: React.FC<{tinta: string; pelo?: string; sombra?: string}> = ({tinta, pelo = '#FDFCF9', sombra = 'rgba(113,137,196,.3)'}) => (
  <svg viewBox="0 0 480 1320" width={480} height={1320} style={{display: 'block', overflow: 'visible'}}>
    <defs>
      <clipPath id="pata-clip"><path d={SILUETA} /></clipPath>
    </defs>
    <path d={SILUETA} fill={pelo} />
    {/* sombreado lateral (dentro de la silueta) */}
    <g clipPath="url(#pata-clip)" fill={sombra}>
      <path d="M250 230C300 420 360 760 420 1320L480 1320L480 200Z" />
      <path d="M58 150C70 200 120 236 180 238C230 238 262 214 280 180L290 250L50 260Z" opacity=".55" />
    </g>
    <path d={SILUETA} fill="none" stroke={tinta} strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" />

    <g fill="none" stroke={tinta} strokeLinecap="round" strokeLinejoin="round">
      {/* separación de dedos */}
      <path d="M102 98C106 122 112 140 120 156" strokeWidth="5.5" />
      <path d="M162 72C162 100 163 126 166 150" strokeWidth="5.5" />
      <path d="M224 98C220 120 214 140 206 156" strokeWidth="5.5" />
      {/* uñitas */}
      <path d="M58 104C54 94 58 84 68 80" strokeWidth="5" />
      <path d="M120 44C120 34 128 28 138 28" strokeWidth="5" />
      <path d="M190 30C198 26 208 30 212 38" strokeWidth="5" />
      <path d="M262 92C270 88 280 92 284 102" strokeWidth="5" />
      {/* mechones interiores (pelaje de schnauzer) */}
      <path d="M128 300l-6 34M164 292l-2 38M200 300l4 34" strokeWidth="4.5" opacity=".5" />
      <path d="M156 470l-5 34M192 462l0 38M228 472l5 32" strokeWidth="4.5" opacity=".42" />
      <path d="M190 650l-4 34M226 644l2 38M262 656l6 32" strokeWidth="4.5" opacity=".36" />
      {/* pliegue del tobillo */}
      <path d="M84 236C120 252 200 256 250 238" strokeWidth="4.5" opacity=".5" />
    </g>
  </svg>
);
