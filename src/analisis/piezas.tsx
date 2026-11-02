/**
 * Piezas ilustradas (SVG) del video de análisis: estilo editorial plano con trama de puntos,
 * hilo naranja, sellos de goma y destellos lima. Todas se dibujan en coordenadas de 1080×1920.
 */
import React from 'react';
import {Easing, interpolate, random} from 'remotion';

export const P = {
  papel: '#ECE8DF',
  noche: '#141416',
  tinta: '#151515',
  crema: '#F2EEE6',
  naranja: '#FF4A1C',
  azul: '#2D43E6',
  azulOsc: '#1A2794',
  lima: '#D8F53A',
  gris: '#A9A49A',
  metal: '#E4DFD5',
};
export const GROTESK = "'Archivo', 'Arial Black', sans-serif";
export const MONO = "'Space Mono', ui-monospace, monospace";

export const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ap = (f: number, ini: number, dur = 12, ease = Easing.out(Easing.cubic)) => interpolate(f, [ini, ini + dur], [0, 1], {...CL, easing: ease});
export const sale = (f: number, ini: number, dur = 10) => interpolate(f, [ini, ini + dur], [0, 1], {...CL, easing: Easing.in(Easing.cubic)});
/** Rebote tipo resorte entre 0 y 1 (sobrepasa un poco). */
export const rebote = (f: number, ini: number, dur = 16) => {
  if (f <= ini) return 0;
  const t = Math.min(1, (f - ini) / dur);
  return 1 - Math.cos(t * Math.PI * 2.5) * Math.exp(-t * 5.5) * (1 - t * 0.2);
};
export const mezcla = (a: number, b: number, t: number) => a + (b - a) * t;

/** Patrones compartidos: tramas de puntos y textura de sello gastado. Se monta una sola vez. */
export const Defs: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      {([
        ['tramaAzul', P.azulOsc, 9, 2.2],
        ['tramaTinta', '#000000', 8, 1.9],
        ['tramaCrema', '#9C968B', 8, 1.7],
        ['tramaNaranja', '#B22A08', 9, 2.1],
        ['tramaLima', '#7E9A0C', 8, 1.8],
      ] as const).map(([id, c, s, r]) => (
        <pattern key={id} id={id} width={s} height={s} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <circle cx={s / 2} cy={s / 2} r={r} fill={c} />
        </pattern>
      ))}
      <filter id="gastado" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves={2} seed={4} result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.2 2.35" result="m" />
        <feComposite in="SourceGraphic" in2="m" operator="in" />
      </filter>
      <radialGradient id="brilloLima">
        <stop offset="0" stopColor={P.lima} stopOpacity={0.55} />
        <stop offset="1" stopColor={P.lima} stopOpacity={0} />
      </radialGradient>
      <linearGradient id="sombraV" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity={0} />
        <stop offset="0.55" stopColor="#fff" stopOpacity={0} />
        <stop offset="1" stopColor="#fff" stopOpacity={1} />
      </linearGradient>
      <mask id="mitadAbajo" maskContentUnits="objectBoundingBox">
        <rect width={1} height={1} fill="url(#sombraV)" />
      </mask>
    </defs>
  </svg>
);

/** Rectángulo con relleno plano + trama en la mitad inferior (sombreado de puntos). */
export const Bloque: React.FC<{x: number; y: number; w: number; h: number; c: string; trama: string; rx?: number; stroke?: string}> = ({x, y, w, h, c, trama, rx = 8, stroke}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={rx} fill={c} stroke={stroke} strokeWidth={stroke ? 3 : 0} />
    <rect x={x} y={y} width={w} height={h} rx={rx} fill={`url(#${trama})`} mask="url(#mitadAbajo)" />
  </g>
);

/** Destello lima de 4 puntas con halo. */
export const Destello: React.FC<{x: number; y: number; s?: number; f: number; ini: number}> = ({x, y, s = 1, f, ini}) => {
  const a = rebote(f, ini, 14);
  if (a <= 0) return null;
  const tw = 1 + 0.12 * Math.sin((f - ini) / 4);
  const r = 34 * s * a * tw;
  const d = `M 0 ${-r} C ${r * 0.12} ${-r * 0.12}, ${r * 0.12} ${-r * 0.12}, ${r} 0 C ${r * 0.12} ${r * 0.12}, ${r * 0.12} ${r * 0.12}, 0 ${r} C ${-r * 0.12} ${r * 0.12}, ${-r * 0.12} ${r * 0.12}, ${-r} 0 C ${-r * 0.12} ${-r * 0.12}, ${-r * 0.12} ${-r * 0.12}, 0 ${-r} Z`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${(f - ini) * 0.8})`}>
      <circle r={r * 2.6} fill="url(#brilloLima)" />
      <path d={d} fill={P.lima} />
    </g>
  );
};

/** Sello de goma: cae grande, golpea, y queda con textura gastada. */
export const Sello: React.FC<{x: number; y: number; lineas: string[]; f: number; ini: number; color?: string; ang?: number; ancho?: number}> = ({x, y, lineas, f, ini, color = P.azul, ang = -7, ancho = 520}) => {
  if (f < ini) return null;
  const t = f - ini;
  const caida = interpolate(t, [0, 6], [2.3, 1], {...CL, easing: Easing.in(Easing.quad)});
  const op = interpolate(t, [0, 3], [0, 1], CL);
  const fs = 70;
  const alto = lineas.length * fs * 1.02 + 56;
  const temblor = t > 5 && t < 12 ? Math.sin(t * 3) * (12 - t) * 0.6 : 0;
  return (
    <g transform={`translate(${x + temblor} ${y}) rotate(${ang}) scale(${caida})`} opacity={op}>
      <g filter="url(#gastado)">
        <rect x={-ancho / 2} y={-alto / 2} width={ancho} height={alto} rx={14} fill="none" stroke={color} strokeWidth={9} />
        <rect x={-ancho / 2 + 14} y={-alto / 2 + 14} width={ancho - 28} height={alto - 28} rx={8} fill="none" stroke={color} strokeWidth={3} />
        {lineas.map((l, i) => (
          <text key={i} x={0} y={-alto / 2 + 28 + fs * 0.86 + i * fs * 1.02} textAnchor="middle" fontFamily={GROTESK} fontWeight={900} fontSize={fs} fill={color} style={{fontStretch: '115%'}}>
            {l.toUpperCase()}
          </text>
        ))}
      </g>
    </g>
  );
};

/** Motor eléctrico de perfil. Origen: centro del eje en la cara del motor (sale hacia +x). */
export const Motor: React.FC<{x: number; y: number; s?: number; ang?: number; dy?: number; vib?: number; f: number; fondo: 'papel' | 'noche'}> = ({x, y, s = 1, ang = 0, dy = 0, vib = 0, f, fondo}) => {
  const jx = vib ? (random(`mx${f}`) - 0.5) * vib : 0;
  const jy = vib ? (random(`my${f}`) - 0.5) * vib : 0;
  const giro = (f * 11) % 360;
  return (
    <g transform={`translate(${x + jx} ${y + dy + jy}) rotate(${ang}) scale(${s})`}>
      {/* patas */}
      <rect x={-250} y={78} width={40} height={36} fill={P.azulOsc} />
      <rect x={-80} y={78} width={40} height={36} fill={P.azulOsc} />
      <rect x={-270} y={108} width={250} height={16} rx={4} fill={P.azul} />
      {/* cuerpo */}
      <Bloque x={-260} y={-90} w={230} h={175} c={P.azul} trama="tramaAzul" rx={22} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={-246 + i * 36} y={-104} width={18} height={203} rx={9} fill={P.azul} stroke={P.azulOsc} strokeWidth={3} />
      ))}
      {/* tapa del ventilador */}
      <Bloque x={-300} y={-70} w={48} h={136} c={P.azul} trama="tramaAzul" rx={14} />
      <g transform={`translate(-276 -2) rotate(${giro})`}>
        {[0, 90, 180, 270].map((a) => <rect key={a} x={-3} y={-30} width={6} height={30} fill={fondo === 'noche' ? P.crema : P.papel} transform={`rotate(${a})`} />)}
      </g>
      {/* brida */}
      <Bloque x={-34} y={-62} w={34} h={124} c={P.azul} trama="tramaAzul" rx={6} />
      {/* caja de conexiones */}
      <Bloque x={-180} y={-130} w={78} h={36} c={P.azul} trama="tramaAzul" rx={6} />
    </g>
  );
};

/**
 * Eje (cilindro) entre x1 y x2 a la altura y. `curva` lo flecta (px de flecha al centro),
 * `giro` mueve las franjas para que se vea girar.
 */
export const Eje: React.FC<{x1: number; x2: number; y: number; y2?: number; grosor?: number; curva?: number; giro: number; color?: string}> = ({x1, x2, y, y2, grosor = 44, curva = 0, giro, color = P.metal}) => {
  const yb = y2 ?? y;
  const mx = (x1 + x2) / 2;
  const my = (y + yb) / 2 + curva * 2;
  const d = `M ${x1} ${y} Q ${mx} ${my} ${x2} ${yb}`;
  return (
    <g>
      <path d={d} stroke={color} strokeWidth={grosor} fill="none" />
      <path d={d} stroke="#000" strokeOpacity={0.16} strokeWidth={grosor} fill="none" strokeDasharray="7 19" strokeDashoffset={-giro} />
      <path d={d} stroke="#fff" strokeOpacity={0.7} strokeWidth={grosor * 0.16} fill="none" transform={`translate(0 ${-grosor * 0.24})`} />
      <path d={d} stroke="url(#tramaCrema)" strokeWidth={grosor * 0.36} fill="none" transform={`translate(0 ${grosor * 0.26})`} />
    </g>
  );
};

/** Grieta en zigzag que se dibuja de arriba hacia abajo. */
export const Grieta: React.FC<{x: number; y: number; alto: number; p: number; color?: string}> = ({x, y, alto, p, color = P.naranja}) => {
  if (p <= 0) return null;
  const pts = [[0, -alto / 2], [-9, -alto / 4], [8, -alto / 12], [-7, alto / 8], [6, alto / 3], [0, alto / 2]];
  const d = pts.map(([px, py], i) => `${i ? 'L' : 'M'} ${x + px} ${y + py}`).join(' ');
  return <path d={d} stroke={color} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${p} 1`} />;
};

/** Hilo naranja grueso (como lana) que se dibuja a lo largo de un path. */
export const Hilo: React.FC<{d: string; p: number; ancho?: number; color?: string}> = ({d, p, ancho = 16, color = P.naranja}) => {
  if (p <= 0) return null;
  return <path d={d} stroke={color} strokeWidth={ancho} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${p} 1`} />;
};

/** Portapapeles con hoja: `lineas` = cuántas líneas de texto escritas (0 = hoja vacía). */
export const Portapapeles: React.FC<{x: number; y: number; s?: number; titulo?: string; vacia?: boolean; ang?: number}> = ({x, y, s = 1, titulo, vacia = true, ang = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${ang}) scale(${s})`}>
    <Bloque x={-120} y={-150} w={240} h={300} c={P.azul} trama="tramaAzul" rx={18} />
    <rect x={-98} y={-118} width={196} height={250} rx={6} fill={P.crema} />
    <rect x={-98} y={-118} width={196} height={250} rx={6} fill="url(#tramaCrema)" opacity={0.25} />
    <rect x={-44} y={-168} width={88} height={40} rx={10} fill={P.azulOsc} />
    {titulo && (
      <text x={0} y={-82} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={19} fill={P.tinta}>
        {titulo}
      </text>
    )}
    {[0, 1, 2, 3, 4].map((i) => (
      <g key={i}>
        <rect x={-74} y={-52 + i * 36} width={22} height={22} rx={4} fill="none" stroke={P.tinta} strokeWidth={3} />
        <line x1={-38} y1={-41 + i * 36} x2={vacia ? -38 + 20 : 74 - (i % 2) * 40} y2={-41 + i * 36} stroke={P.gris} strokeWidth={6} strokeLinecap="round" strokeDasharray={vacia ? '4 10' : undefined} />
      </g>
    ))}
  </g>
);

/** Cronómetro con la aguja girando a `vel` vueltas por segundo. */
export const Cronometro: React.FC<{x: number; y: number; s?: number; f: number; vel?: number; color?: string}> = ({x, y, s = 1, f, vel = 1.5, color = P.naranja}) => {
  const a = (f / 30) * vel * 360;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-20} y={-148} width={40} height={30} rx={6} fill={P.tinta} />
      <rect x={-46} y={-160} width={92} height={18} rx={9} fill={P.tinta} />
      <circle r={120} fill={color} />
      <circle r={120} fill="url(#tramaNaranja)" mask="url(#mitadAbajo)" />
      <circle r={96} fill={P.crema} />
      {Array.from({length: 12}, (_, i) => (
        <line key={i} x1={0} y1={-84} x2={0} y2={i % 3 ? -76 : -68} stroke={P.tinta} strokeWidth={i % 3 ? 3 : 6} transform={`rotate(${i * 30})`} />
      ))}
      <line x1={0} y1={12} x2={0} y2={-78} stroke={P.tinta} strokeWidth={7} strokeLinecap="round" transform={`rotate(${a})`} />
      <line x1={0} y1={0} x2={0} y2={-50} stroke={P.naranja} strokeWidth={6} strokeLinecap="round" transform={`rotate(${a / 12})`} />
      <circle r={10} fill={P.tinta} />
      {/* líneas de velocidad */}
      {[0, 1, 2].map((i) => (
        <line key={i} x1={140 + i * 6} y1={-60 + i * 40} x2={190 + i * 16} y2={-60 + i * 40} stroke={P.tinta} strokeWidth={6} strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(f / 3 + i)} />
      ))}
    </g>
  );
};

/** Icono de desalineamiento: dos ejes con acople y ejes de centro que no coinciden. */
export const IconoDesalineado: React.FC<{x: number; y: number; s?: number; f: number; ang?: number}> = ({x, y, s = 1, f, ang = 7}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Bloque x={-150} y={-40} w={70} h={80} c={P.azul} trama="tramaAzul" rx={10} />
    <Eje x1={-80} x2={-8} y={0} grosor={30} giro={f * 3} />
    <g transform={`rotate(${ang} 0 0)`}>
      <rect x={-12} y={-44} width={24} height={88} rx={5} fill={P.tinta} />
      <Eje x1={12} x2={140} y={0} grosor={30} giro={f * 3} />
    </g>
    <line x1={-170} y1={0} x2={170} y2={0} stroke={P.lima} strokeWidth={4} strokeDasharray="12 9" />
    <line x1={-170} y1={0} x2={170} y2={0} stroke={P.naranja} strokeWidth={4} strokeDasharray="12 9" transform={`rotate(${ang})`} />
  </g>
);

/** Reloj comparador (para "ni medir"). */
export const Comparador: React.FC<{x: number; y: number; s?: number; f: number}> = ({x, y, s = 1, f}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-10} y={70} width={20} height={70} fill={P.metal} />
    <circle r={82} fill={P.crema} stroke={P.metal} strokeWidth={12} />
    {Array.from({length: 20}, (_, i) => <line key={i} x1={0} y1={-66} x2={0} y2={i % 5 ? -58 : -50} stroke={P.tinta} strokeWidth={3} transform={`rotate(${i * 18})`} />)}
    <line x1={0} y1={8} x2={0} y2={-56} stroke={P.naranja} strokeWidth={5} strokeLinecap="round" transform={`rotate(${Math.sin(f / 6) * 8})`} />
    <circle r={7} fill={P.tinta} />
    <text y={36} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={20} fill={P.tinta}>?.?? mm</text>
  </g>
);

/** Equis de trazo grueso que se dibuja en dos golpes. */
export const Equis: React.FC<{x: number; y: number; r?: number; p: number; color?: string}> = ({x, y, r = 110, p, color = P.lima}) => {
  if (p <= 0) return null;
  const a = Math.min(1, p * 2);
  const b = Math.max(0, p * 2 - 1);
  return (
    <g transform={`translate(${x} ${y})`} stroke={color} strokeWidth={22} strokeLinecap="round">
      <line x1={-r} y1={-r} x2={-r + 2 * r * a} y2={-r + 2 * r * a} />
      {b > 0 && <line x1={r} y1={-r} x2={r - 2 * r * b} y2={-r + 2 * r * b} />}
    </g>
  );
};

/** Lupa. */
export const Lupa: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <line x1={62} y1={62} x2={150} y2={150} stroke={P.tinta} strokeWidth={30} strokeLinecap="round" />
    <circle r={92} fill={P.crema} fillOpacity={0.35} stroke={P.tinta} strokeWidth={18} />
    <path d="M -50 -40 A 64 64 0 0 1 -10 -66" stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" />
  </g>
);

/** Onda (vibración) desde x0 de ancho w, con amplitud amp y fase. */
export const OndaVib: React.FC<{x0: number; y: number; w: number; amp: (x: number) => number; fase: number; color?: string; grosor?: number; p?: number}> = ({x0, y, w, amp, fase, color = P.naranja, grosor = 7, p = 1}) => {
  const pts: string[] = [];
  const hasta = w * p;
  for (let x = 0; x <= hasta; x += 5) {
    const a = amp(x / w);
    pts.push(`${(x0 + x).toFixed(1)},${(y + Math.sin(x / 13 + fase) * a + Math.sin(x / 5.3 + fase * 1.7) * a * 0.3).toFixed(1)}`);
  }
  if (pts.length < 2) return null;
  return <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={grosor} strokeLinejoin="round" strokeLinecap="round" />;
};
