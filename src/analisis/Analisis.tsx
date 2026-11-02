import React from 'react';
import {AbsoluteFill, Easing, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {cargarFuentes, conAlfa, SAFE_SIDE, WIDTH} from '../theme';
import {duracionBeat, duracionLamina, iniciosBeats, inicioEscenas, INTRO, LAMINAS, palabras, TRANSICION} from './guion';

// ---------- paleta "plano técnico" ----------
const C = {
  fondo: '#0D1726',
  fondo2: '#13233A',
  carta: '#172A44',
  borde: 'rgba(160,190,230,0.18)',
  linea: 'rgba(160,190,230,0.10)',
  texto: '#F3EEE3',
  suave: '#93A6C2',
  naranja: '#FF7A1A',
  rojo: '#F0484E',
  ambar: '#FFC24B',
};
const SERIF = "'Fraunces', Georgia, serif";
const SANS = "'Poppins', system-ui, sans-serif";
const HAND = "'Caveat', cursive";

const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const salida = Easing.out(Easing.cubic);
const aparece = (f: number, ini: number, dur = 14) => interpolate(f, [ini, ini + dur], [0, 1], {...CL, easing: salida});

// ---------- fondo con cuadrícula de plano ----------
const Fondo: React.FC = () => {
  const f = useCurrentFrame();
  const d = f * 0.35;
  return (
    <AbsoluteFill style={{background: `linear-gradient(170deg, ${C.fondo2} 0%, ${C.fondo} 60%, #08101C 100%)`}}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${C.linea} 1px, transparent 1px), linear-gradient(90deg, ${C.linea} 1px, transparent 1px),
            linear-gradient(rgba(160,190,230,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(160,190,230,0.04) 1px, transparent 1px)`,
          backgroundSize: '120px 120px, 120px 120px, 24px 24px, 24px 24px',
          backgroundPosition: `${d}px ${d * 0.6}px`,
        }}
      />
      <div style={{position: 'absolute', width: 1100, height: 1100, borderRadius: '50%', left: -420, top: -260, background: `radial-gradient(circle, ${conAlfa(C.naranja, 0.13)}, transparent 62%)`}} />
      <div style={{position: 'absolute', width: 1200, height: 1200, borderRadius: '50%', right: -520, bottom: -300, background: `radial-gradient(circle, ${conAlfa('#3D7BD9', 0.16)}, transparent 62%)`}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)'}} />
    </AbsoluteFill>
  );
};

// ---------- encabezado de lámina ----------
const Encabezado: React.FC<{numero: string; titulo: string; bajada: string; activa: number}> = ({numero, titulo, bajada, activa}) => {
  const f = useCurrentFrame();
  const a = aparece(f, 2, 16);
  const b = aparece(f, 8, 16);
  return (
    <div style={{position: 'absolute', left: SAFE_SIDE, right: SAFE_SIDE, top: 250, height: 170}}>
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 26}}>
        <div style={{fontFamily: SERIF, fontWeight: 800, fontSize: 150, lineHeight: 0.8, color: 'transparent', WebkitTextStroke: `3px ${C.naranja}`, opacity: a, transform: `translateY(${(1 - a) * 40}px)`}}>
          {numero}
        </div>
        <div style={{opacity: b, transform: `translateX(${(1 - b) * 40}px)`, paddingBottom: 4}}>
          <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 25, letterSpacing: 5, color: C.naranja, textTransform: 'uppercase'}}>{bajada}</div>
          <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 78, lineHeight: 1, color: C.texto, marginTop: 6}}>{titulo}</div>
        </div>
      </div>
      <div style={{position: 'absolute', right: 0, top: -62, display: 'flex', gap: 10, opacity: a}}>
        {LAMINAS.map((l, i) => (
          <div key={l.numero} style={{fontFamily: SANS, fontWeight: 700, fontSize: 20, padding: '6px 14px', borderRadius: 30, color: i === activa ? C.fondo : C.suave, background: i === activa ? C.naranja : 'transparent', border: `2px solid ${i === activa ? C.naranja : C.borde}`}}>
            {l.numero}
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, bottom: 0, height: 3, width: `${b * 100}%`, background: `linear-gradient(90deg, ${C.naranja}, transparent)`}} />
    </div>
  );
};

// ---------- subtítulos palabra a palabra ----------
const Subtitulos: React.FC<{beats: string[]; inicios: number[]}> = ({beats, inicios}) => {
  const f = useCurrentFrame();
  let i = -1;
  for (let k = 0; k < inicios.length; k++) if (f >= inicios[k] - 2) i = k;
  if (i < 0) return null;
  const texto = beats[i];
  const dur = duracionBeat(texto);
  const local = f - inicios[i];
  const ws = palabras(texto);
  const paso = (dur - 12) / ws.length;
  const entra = aparece(f, inicios[i] - 2, 8);
  const sale = i === beats.length - 1 ? 0 : interpolate(local, [dur - 6, dur], [0, 1], CL);
  return (
    <div style={{position: 'absolute', left: SAFE_SIDE, right: SAFE_SIDE, top: 1450, height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: entra * (1 - sale)}}>
      <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 44, lineHeight: 1.32, textAlign: 'center', color: C.texto, textShadow: '0 4px 18px rgba(0,0,0,0.6)'}}>
        {ws.map((w, k) => {
          const t = local - k * paso;
          const on = interpolate(t, [0, 5], [0, 1], CL);
          const activa = t >= 0 && t < paso + 2;
          return (
            <span key={k} style={{opacity: 0.28 + on * 0.72, color: activa ? C.ambar : C.texto, display: 'inline-block', transform: `translateY(${(1 - on) * 8}px)`, marginRight: 12}}>
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ---------- tarjeta y conector ----------
type Tipo = 'problema' | 'porque' | 'raiz';
const ETIQUETA: Record<Tipo, string> = {problema: 'Falla', porque: '¿Por qué?', raiz: 'Causa raíz'};

const Tarjeta: React.FC<{texto: string; tipo: Tipo; ini: number; x: number; y: number; w: number; h: number; tam?: number; pad?: number; extra?: React.ReactNode}> = ({texto, tipo, ini, x, y, w, h, tam = 38, pad = 34, extra}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - ini, fps, config: {damping: 14, stiffness: 120}});
  const a = aparece(f, ini, 10);
  const color = tipo === 'problema' ? C.rojo : tipo === 'raiz' ? C.naranja : C.suave;
  const pulso = tipo === 'raiz' ? 0.5 + 0.5 * Math.sin((f - ini) / 9) : 0;
  const fondo = tipo === 'raiz' ? `linear-gradient(135deg, ${conAlfa(C.naranja, 0.95)}, #E0560B)` : tipo === 'problema' ? `linear-gradient(135deg, ${conAlfa(C.rojo, 0.22)}, ${C.carta})` : C.carta;
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 26, background: fondo, opacity: a,
        border: `2px solid ${tipo === 'porque' ? C.borde : color}`, transform: `translateY(${(1 - s) * 50}px) scale(${0.92 + s * 0.08})`,
        boxShadow: tipo === 'raiz' ? `0 0 ${30 + pulso * 40}px ${conAlfa(C.naranja, 0.35 + pulso * 0.2)}` : '0 18px 40px rgba(0,0,0,0.35)',
        padding: `0 ${pad}px`, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden', boxSizing: 'border-box',
      }}
    >
      {extra}
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 21, letterSpacing: 4, textTransform: 'uppercase', color: tipo === 'raiz' ? C.fondo : color, position: 'relative'}}>
        {ETIQUETA[tipo]}
      </div>
      <div style={{fontFamily: SANS, fontWeight: 600, fontSize: tam, lineHeight: 1.18, color: tipo === 'raiz' ? '#1A0D02' : C.texto, marginTop: 4, position: 'relative'}}>{texto}</div>
    </div>
  );
};

/** Flecha vertical que se dibuja de (x, y1) a (x, y2). */
const Flecha: React.FC<{x: number; y1: number; y2: number; ini: number; color?: string}> = ({x, y1, y2, ini, color = C.suave}) => {
  const f = useCurrentFrame();
  const p = aparece(f, ini, 10);
  const largo = (y2 - y1 - 14) * p;
  return (
    <svg style={{position: 'absolute', left: x - 20, top: y1, overflow: 'visible'}} width={40} height={y2 - y1}>
      <line x1={20} y1={0} x2={20} y2={largo} stroke={color} strokeWidth={4} strokeDasharray="2 10" strokeLinecap="round" />
      {p > 0.9 && <path d={`M 8 ${y2 - y1 - 16} L 20 ${y2 - y1 - 2} L 32 ${y2 - y1 - 16}`} stroke={color} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
};

/** Flecha que se abre desde un punto hacia dos tarjetas. */
const FlechaDoble: React.FC<{x: number; xs: [number, number]; y1: number; y2: number; ini: [number, number]; color?: string}> = ({x, xs, y1, y2, ini, color = C.suave}) => {
  const f = useCurrentFrame();
  const h = y2 - y1;
  return (
    <svg style={{position: 'absolute', left: 0, top: y1, overflow: 'visible'}} width={WIDTH} height={h}>
      {xs.map((xd, i) => {
        const p = aparece(f, ini[i], 12);
        const d = `M ${x} 0 C ${x} ${h * 0.55}, ${xd} ${h * 0.35}, ${xd} ${h - 6}`;
        return (
          <g key={i} opacity={p > 0 ? 1 : 0}>
            <path d={d} stroke={color} strokeWidth={4} fill="none" strokeDasharray="2 10" strokeLinecap="round" pathLength={1} style={{strokeDasharray: `${p} 1`}} />
            {p > 0.9 && <path d={`M ${xd - 12} ${h - 18} L ${xd} ${h - 4} L ${xd + 12} ${h - 18}`} stroke={color} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
          </g>
        );
      })}
    </svg>
  );
};

// ---------- cadena de 5 ¿por qué? ----------
type Fila = {cartas: {texto: string; tipo: Tipo; beat: number; extra?: React.ReactNode}[]};

const Cadena: React.FC<{filas: Fila[]; inicios: number[]; top?: number; alto?: number; hueco?: number}> = ({filas, inicios, top = 470, alto = 140, hueco = 52}) => {
  const ancho = WIDTH - SAFE_SIDE * 2;
  const mitad = (ancho - 28) / 2;
  const cx = WIDTH / 2;
  const els: React.ReactNode[] = [];
  filas.forEach((fila, i) => {
    const y = top + i * (alto + hueco);
    const doble = fila.cartas.length === 2;
    fila.cartas.forEach((c, k) => {
      const x = doble ? SAFE_SIDE + k * (mitad + 28) : SAFE_SIDE;
      els.push(<Tarjeta key={`${i}-${k}`} texto={c.texto} tipo={c.tipo} ini={inicios[c.beat]} x={x} y={y} w={doble ? mitad : ancho} h={alto} tam={doble ? 28 : 38} pad={doble ? 26 : 34} extra={c.extra} />);
    });
    if (i > 0) {
      const y1 = y - hueco + 4;
      const prevDoble = filas[i - 1].cartas.length === 2;
      const color = fila.cartas.some((c) => c.tipo === 'raiz') ? C.naranja : C.suave;
      if (doble && !prevDoble) {
        els.push(<FlechaDoble key={`f${i}`} x={cx} xs={[SAFE_SIDE + mitad / 2, SAFE_SIDE + mitad * 1.5 + 28]} y1={y1} y2={y + 2} ini={[inicios[fila.cartas[0].beat] - 8, inicios[fila.cartas[1].beat] - 8]} color={color} />);
      } else {
        els.push(<Flecha key={`f${i}`} x={cx} y1={y1} y2={y + 2} ini={inicios[fila.cartas[0].beat] - 8} color={color} />);
      }
    }
  });
  return <>{els}</>;
};

// ---------- ilustraciones ----------
/** Onda de vibración que crece sin que nada la detenga. */
const Vibracion: React.FC<{ini: number}> = ({ini}) => {
  const f = useCurrentFrame();
  const t = Math.max(0, f - ini);
  const amp = Math.min(46, 8 + t * 0.35);
  const pts: string[] = [];
  for (let x = 0; x <= 420; x += 4) {
    const env = 0.35 + 0.65 * (x / 420);
    const y = 70 + Math.sin(x / 9 + t / 2.2) * amp * env + Math.sin(x / 3.7 + t / 1.3) * amp * 0.25 * env;
    pts.push(`${x},${y.toFixed(1)}`);
  }
  return (
    <svg style={{position: 'absolute', right: 20, top: 0, opacity: 0.55}} width={420} height={140}>
      <polyline points={pts.join(' ')} fill="none" stroke={C.rojo} strokeWidth={3.5} strokeLinejoin="round" />
    </svg>
  );
};

/** Eje con acople desalineado y grieta, para la portada. */
const Eje: React.FC = () => {
  const f = useCurrentFrame();
  const giro = (f * 9) % 60;
  const grieta = aparece(f, 26, 22);
  const franjas = Array.from({length: 14}, (_, i) => i * 60 - giro);
  return (
    <svg width={936} height={300} viewBox="0 0 936 300" style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5D7290" />
          <stop offset="0.35" stopColor="#C9D6E8" />
          <stop offset="0.6" stopColor="#7F93AF" />
          <stop offset="1" stopColor="#2E3D55" />
        </linearGradient>
        <clipPath id="ejeA"><rect x={0} y={118} width={430} height={64} rx={10} /></clipPath>
        <clipPath id="ejeB"><rect x={0} y={-32} width={430} height={64} rx={10} /></clipPath>
      </defs>
      {/* motor */}
      <rect x={0} y={80} width={170} height={140} rx={18} fill={C.carta} stroke={C.borde} strokeWidth={2} />
      {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={24 + i * 28} y1={96} x2={24 + i * 28} y2={204} stroke={C.borde} strokeWidth={6} strokeLinecap="round" />)}
      {/* eje del motor */}
      <g transform="translate(170 0)">
        <g clipPath="url(#ejeA)">
          <rect x={0} y={118} width={430} height={64} fill="url(#metal)" />
          {franjas.map((x) => <rect key={x} x={x} y={118} width={8} height={64} fill="rgba(13,23,38,0.25)" />)}
        </g>
        {/* grieta */}
        <path d="M 300 118 L 292 134 L 306 146 L 294 160 L 304 172 L 298 182" stroke={C.rojo} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} style={{strokeDasharray: `${grieta} 1`, filter: `drop-shadow(0 0 ${8 * grieta}px ${C.rojo})`}} />
      </g>
      {/* acople y eje conducido, girado unos grados: desalineamiento */}
      <g transform="translate(600 150) rotate(-4)">
        <rect x={0} y={-56} width={60} height={112} rx={10} fill="#7F93AF" stroke="#C9D6E8" strokeWidth={2} />
        <g transform="translate(60 0)">
          <g clipPath="url(#ejeB)">
            <rect x={0} y={-32} width={300} height={64} fill="url(#metal)" />
            {franjas.map((x) => <rect key={x} x={x} y={-32} width={8} height={64} fill="rgba(13,23,38,0.25)" />)}
          </g>
        </g>
        <line x1={-430} y1={0} x2={380} y2={0} stroke={C.naranja} strokeWidth={2} strokeDasharray="14 10" opacity={0.8} />
      </g>
      <line x1={170} y1={150} x2={936} y2={150} stroke={C.suave} strokeWidth={2} strokeDasharray="14 10" opacity={0.5} />
      <text x={936} y={70} textAnchor="end" fontFamily={HAND} fontWeight={700} fontSize={40} fill={C.naranja} opacity={grieta}>desalineado</text>
      <text x={470} y={250} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={40} fill={C.rojo} opacity={grieta}>grieta por fatiga</text>
    </svg>
  );
};

// ---------- escenas ----------
const Portada: React.FC = () => {
  const f = useCurrentFrame();
  const a = aparece(f, 4, 18);
  const b = aparece(f, 12, 18);
  const c = aparece(f, 22, 18);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: SAFE_SIDE, right: SAFE_SIDE, top: 400}}>
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 28, letterSpacing: 6, textTransform: 'uppercase', color: C.naranja, opacity: a, transform: `translateY(${(1 - a) * 20}px)`}}>
          Análisis de causa raíz
        </div>
        <div style={{fontFamily: SERIF, fontWeight: 800, fontSize: 118, lineHeight: 1.0, color: C.texto, marginTop: 20, opacity: b, transform: `translateY(${(1 - b) * 40}px)`}}>
          ¿Por qué se fracturó el eje?
        </div>
      </div>
      <div style={{position: 'absolute', left: SAFE_SIDE, top: 870, opacity: c, transform: `translateX(${(1 - c) * -60}px)`}}>
        <Eje />
      </div>
      <div style={{position: 'absolute', left: SAFE_SIDE, right: SAFE_SIDE, top: 1330, display: 'flex', gap: 16, opacity: c}}>
        {['Jerarquización', 'Cadena 1', 'Cadena 2'].map((t, i) => (
          <div key={t} style={{fontFamily: SANS, fontWeight: 600, fontSize: 26, color: C.texto, padding: '12px 24px', borderRadius: 40, border: `2px solid ${C.borde}`, background: conAlfa(C.carta, 0.8)}}>
            <span style={{color: C.naranja, marginRight: 10}}>{LAMINAS[i].numero}</span>{t}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/** Lámina 9: matriz evidencia × explica la fatiga, y la historia que une las tres causas. */
const Jerarquizacion: React.FC<{inicios: number[]}> = ({inicios}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const X = SAFE_SIDE + 46;
  const Y = 470;
  const W = WIDTH - SAFE_SIDE * 2 - 46;
  const H = 480;
  const m = aparece(f, inicios[0], 18);
  const ejes = aparece(f, inicios[0] + 10, 20);
  const zona = aparece(f, inicios[1], 14);
  const causas = [
    {t: 'Desalineamiento', x: 0.6, y: 0.135, d: 0},
    {t: 'Sin procedimiento', x: 0.535, y: 0.255, d: 18},
    {t: 'Montaje sin alinear', x: 0.56, y: 0.375, d: 36},
  ];
  const historia = aparece(f, inicios[3], 14);
  const pasos = ['Sin procedimiento', 'Montaje sin alinear', 'Desalineamiento'];
  const cw = 268;
  const gap = (W + 46 - cw * 3) / 2;
  const palabrasB4 = palabras(LAMINAS[0].beats[4]).length;
  const ritmo = (duracionBeat(LAMINAS[0].beats[4]) - 12) / palabrasB4;
  const tPaso = [inicios[4], inicios[4] + Math.round(ritmo * 3), inicios[4] + Math.round(ritmo * 7)];
  return (
    <>
      {/* matriz */}
      <div style={{position: 'absolute', left: X, top: Y, width: W, height: H, opacity: m, transform: `scale(${0.96 + m * 0.04})`}}>
        <div style={{position: 'absolute', inset: 0, borderLeft: `3px solid ${C.suave}`, borderBottom: `3px solid ${C.suave}`}} />
        <div style={{position: 'absolute', left: W / 2, top: 0, bottom: 0, borderLeft: `2px dashed ${C.borde}`, opacity: ejes}} />
        <div style={{position: 'absolute', top: H / 2, left: 0, right: 0, borderTop: `2px dashed ${C.borde}`, opacity: ejes}} />
        <div style={{position: 'absolute', left: W / 2 + 2, top: 0, width: W / 2 - 2, height: H / 2, background: conAlfa(C.naranja, 0.16 * zona), border: `2px solid ${conAlfa(C.naranja, zona)}`, borderRadius: 18, boxSizing: 'border-box'}} />
        <div style={{position: 'absolute', left: W / 2 + 22, top: 14, fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: 3, color: C.naranja, opacity: zona}}>PRIORIDAD ALTA</div>
        <div style={{position: 'absolute', left: 30, bottom: 26, fontFamily: HAND, fontWeight: 700, fontSize: 38, color: C.suave, opacity: ejes * 0.8}}>baja evidencia,<br />no explica</div>
        <div style={{position: 'absolute', right: 0, bottom: -50, fontFamily: SANS, fontWeight: 600, fontSize: 24, color: C.suave, opacity: ejes}}>Evidencia →</div>
        <div style={{position: 'absolute', left: -50, top: 0, transformOrigin: 'left top', transform: 'rotate(-90deg) translate(-100%, 0)', fontFamily: SANS, fontWeight: 600, fontSize: 24, color: C.suave, opacity: ejes, whiteSpace: 'nowrap'}}>¿Explica la fatiga? →</div>
        {causas.map((c, i) => {
          const ritmo2 = (duracionBeat(LAMINAS[0].beats[2]) - 12) / palabras(LAMINAS[0].beats[2]).length;
          const ini = inicios[2] + Math.round([0, 2, 6][i] * ritmo2);
          const s = spring({frame: f - ini, fps, config: {damping: 12, stiffness: 140}});
          const brillo = historia;
          return (
            <div key={c.t} style={{position: 'absolute', left: c.x * W, top: c.y * H, display: 'flex', alignItems: 'center', gap: 14, transform: `scale(${s})`, transformOrigin: 'left center'}}>
              <div style={{width: 30, height: 30, borderRadius: '50%', background: C.naranja, boxShadow: `0 0 ${16 + brillo * 20}px ${conAlfa(C.naranja, 0.8)}`, border: '4px solid #FFD9B8'}} />
              <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 28, color: C.texto, background: conAlfa(C.fondo, 0.85), padding: '6px 16px', borderRadius: 14, border: `1px solid ${C.borde}`, whiteSpace: 'nowrap'}}>{c.t}</div>
            </div>
          );
        })}
      </div>

      {/* una sola historia */}
      <div style={{position: 'absolute', left: SAFE_SIDE, top: 1062, fontFamily: HAND, fontWeight: 700, fontSize: 52, color: C.ambar, opacity: historia, transform: `translateY(${(1 - historia) * 20}px) rotate(-2deg)`}}>
        Una sola historia:
      </div>
      {pasos.map((p, i) => {
        const s = spring({frame: f - tPaso[i], fps, config: {damping: 14, stiffness: 120}});
        const fin = i === 2;
        const x = SAFE_SIDE + i * (cw + gap);
        return (
          <React.Fragment key={p}>
            <div style={{position: 'absolute', left: x, top: 1150, width: cw, height: 200, borderRadius: 24, boxSizing: 'border-box', padding: '0 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * 40}px)`, background: fin ? `linear-gradient(135deg, ${C.rojo}, #B8262C)` : C.carta, border: `2px solid ${fin ? C.rojo : C.borde}`, boxShadow: '0 18px 40px rgba(0,0,0,0.35)'}}>
              <div style={{fontFamily: SERIF, fontWeight: 800, fontSize: 40, color: fin ? '#FFE3E3' : C.naranja, lineHeight: 1}}>{i + 1}</div>
              <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 27, lineHeight: 1.15, color: C.texto, marginTop: 10}}>{p}</div>
            </div>
            {i < 2 && f >= tPaso[i + 1] - 6 && (
              <svg style={{position: 'absolute', left: x + cw + 4, top: 1230, overflow: 'visible'}} width={gap - 8} height={40}>
                <path d={`M 4 20 L ${(gap - 16) * aparece(f, tPaso[i + 1] - 6, 8)} 20`} stroke={C.ambar} strokeWidth={5} strokeLinecap="round" />
                {f > tPaso[i + 1] && <path d={`M ${gap - 26} 8 L ${gap - 14} 20 L ${gap - 26} 32`} stroke={C.ambar} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
              </svg>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

const Cadena1: React.FC<{inicios: number[]}> = ({inicios}) => (
  <Cadena
    inicios={inicios}
    filas={[
      {cartas: [{texto: 'El eje se fracturó por fatiga', tipo: 'problema', beat: 0}]},
      {cartas: [{texto: 'Flexión cíclica en el eje', tipo: 'porque', beat: 1}]},
      {cartas: [{texto: 'Desalineamiento motor – eje', tipo: 'porque', beat: 2}]},
      {cartas: [{texto: 'El motor se montó sin alinear ni medir', tipo: 'porque', beat: 3}]},
      {cartas: [{texto: 'No existe procedimiento obligatorio de montaje', tipo: 'raiz', beat: 4}, {texto: 'La planificación no daba tiempo', tipo: 'raiz', beat: 5}]},
    ]}
    alto={146}
  />
);

const Cadena2: React.FC<{inicios: number[]}> = ({inicios}) => (
  <Cadena
    inicios={inicios}
    filas={[
      {cartas: [{texto: 'Siguió operando con vibración y ruido', tipo: 'problema', beat: 0, extra: <Vibracion ini={inicios[0]} />}]},
      {cartas: [{texto: 'Nadie tenía criterio para detenerlo', tipo: 'porque', beat: 1}]},
      {cartas: [{texto: 'Sin medición de referencia', tipo: 'porque', beat: 2}, {texto: 'Sin límites de alarma', tipo: 'porque', beat: 3}]},
      {cartas: [{texto: 'No existe protocolo de puesta en servicio y monitoreo de condición', tipo: 'raiz', beat: 4}]},
    ]}
    top={480}
    alto={170}
    hueco={64}
  />
);

const CONTENIDO = [Jerarquizacion, Cadena1, Cadena2];

/** Entrada y salida suaves de cada escena (se solapan TRANSICION frames). */
const Transicion: React.FC<{dur: number; children: React.ReactNode; primera?: boolean}> = ({dur, children, primera}) => {
  const f = useCurrentFrame();
  const entra = primera ? 1 : interpolate(f, [0, TRANSICION], [0, 1], {...CL, easing: salida});
  const sale = Number.isFinite(dur) ? interpolate(f, [dur - TRANSICION, dur], [0, 1], {...CL, easing: Easing.in(Easing.cubic)}) : 0;
  return <AbsoluteFill style={{opacity: entra * (1 - sale), transform: `translateX(${(1 - entra) * 120 - sale * 120}px)`}}>{children}</AbsoluteFill>;
};

export const Analisis: React.FC = () => {
  cargarFuentes();
  const {durationInFrames} = useVideoConfig();
  const {inicios} = inicioEscenas();
  return (
    <AbsoluteFill style={{background: C.fondo}}>
      <Fondo />
      <Sequence durationInFrames={INTRO}>
        <Transicion dur={INTRO} primera>
          <Portada />
        </Transicion>
      </Sequence>
      {LAMINAS.map((l, i) => {
        const dur = duracionLamina(l);
        const Contenido = CONTENIDO[i];
        const beats = iniciosBeats(l).inicios;
        const ultima = i === LAMINAS.length - 1;
        return (
          <Sequence key={l.numero} from={inicios[i + 1]} durationInFrames={ultima ? durationInFrames - inicios[i + 1] : dur}>
            <Transicion dur={ultima ? Infinity : dur}>
              <Encabezado numero={l.numero} titulo={l.titulo} bajada={l.bajada} activa={i} />
              <Contenido inicios={beats} />
              <Subtitulos beats={l.beats} inicios={beats} />
            </Transicion>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
