import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Easing, interpolate, random, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import archivoVar from '@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2';
import mono400 from '@fontsource/space-mono/files/space-mono-latin-400-normal.woff2';
import mono700 from '@fontsource/space-mono/files/space-mono-latin-700-normal.woff2';
import {ESCENAS, inicioEscenas, ONDA, tiemposEscena, VOZ} from './guion';
import type {Fondo, Linea} from './guion';
import {ap, Bloque, CL, Comparador, Cronometro, Defs, Destello, Eje, Equis, GROTESK, Grieta, Hilo, IconoDesalineado, Lupa, mezcla, MONO, Motor, OndaVib, P, Portapapeles, rebote, sale, Sello} from './piezas';

const W = 1080;
const H = 1920;
const MARGEN = 72;

// ---------- fuentes ----------
let cargadas = false;
const cargarFuentes = () => {
  if (cargadas) return;
  cargadas = true;
  const espera = delayRender('fuentes análisis');
  const defs: [string, string, FontFaceDescriptors][] = [
    ['Archivo', archivoVar, {weight: '100 900', stretch: '62% 125%'}],
    ['Space Mono', mono400, {weight: '400'}],
    ['Space Mono', mono700, {weight: '700'}],
  ];
  Promise.all(defs.map(async ([fam, url, d]) => { const ff = new FontFace(fam, `url(${url})`, d); await ff.load(); document.fonts.add(ff); }))
    .catch((e) => console.warn('fuentes', e))
    .finally(() => continueRender(espera));
};

const tinta = (fondo: Fondo) => (fondo === 'papel' ? P.tinta : P.crema);
const colorPalabra = (c: string, fondo: Fondo) => (c === 'naranja' ? P.naranja : c === 'azul' ? (fondo === 'noche' ? '#6E80FF' : P.azul) : c === 'lima' ? (fondo === 'papel' ? '#7A9A00' : P.lima) : tinta(fondo));

// ---------- grano de película ----------
const Grano: React.FC<{fondo: Fondo}> = ({fondo}) => {
  const f = useCurrentFrame();
  const seed = Math.floor(f / 2) % 12;
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: fondo === 'papel' ? 0.2 : 0.14, mixBlendMode: fondo === 'papel' ? 'multiply' : 'screen', pointerEvents: 'none'}}>
      <filter id={`grano${seed}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={W} height={H} filter={`url(#grano${seed})`} />
    </svg>
  );
};

/** Trama de puntos muy suave de fondo, como papel impreso. */
const FondoPlano: React.FC<{fondo: Fondo}> = ({fondo}) => (
  <AbsoluteFill style={{background: fondo === 'papel' ? P.papel : P.noche}}>
    <AbsoluteFill
      style={{
        backgroundImage: `radial-gradient(${fondo === 'papel' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)'} 1.4px, transparent 1.6px)`,
        backgroundSize: '14px 14px',
      }}
    />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(0,0,0,0.22) 100%)'}} />
  </AbsoluteFill>
);

// ---------- titulares palabra a palabra ----------
const tamTitular = (lineas: Linea[]) => {
  const n = lineas.reduce((a, l) => a + l.reduce((b, p) => b + p.texto.length + 1, 0), 0);
  const larga = Math.max(...lineas.flat().map((p) => p.texto.length));
  const base = n <= 26 ? 116 : n <= 44 ? 98 : n <= 64 ? 84 : 72;
  return Math.min(base, Math.floor((W - MARGEN * 2) / (larga * 0.74)));
};

const Titulares: React.FC<{frases: Linea[][]; fondo: Fondo}> = ({frases, fondo}) => {
  const f = useCurrentFrame();
  const inicioFrase = frases.map((fr) => fr[0][0].ini);
  return (
    <div style={{position: 'absolute', left: MARGEN, right: MARGEN, top: 292, height: 420}}>
      {frases.map((fr, i) => {
        const ini = inicioFrase[i] - 3;
        const fin = i < frases.length - 1 ? inicioFrase[i + 1] - 7 : Infinity;
        if (f < ini - 1 || f > fin + 10) return null;
        const fs = tamTitular(fr);
        let k = 0;
        return (
          <div key={i} style={{position: 'absolute', left: 0, right: 0, top: 0}}>
            {fr.map((linea, li) => (
              <div key={li} style={{display: 'flex', flexWrap: 'wrap', columnGap: fs * 0.26}}>
                {linea.map((p) => {
                  const idx = k++;
                  const entra = ap(f, p.ini - 3, 6);
                  const fuera = Number.isFinite(fin) ? sale(f, fin + idx * 0.6, 7) : 0;
                  const y = (1 - entra) * 105 - fuera * 110;
                  return (
                    <span key={idx} style={{display: 'inline-block', overflow: 'hidden', lineHeight: 1.04, paddingBottom: fs * 0.08, marginBottom: -fs * 0.08}}>
                      <span
                        style={{
                          display: 'inline-block', transform: `translateY(${y}%)`, fontFamily: GROTESK, fontWeight: 800, fontStretch: '125%',
                          fontSize: fs, letterSpacing: -fs * 0.025, color: colorPalabra(p.color, fondo), whiteSpace: 'nowrap',
                        }}
                      >
                        {p.texto.toLowerCase()}
                      </span>
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

/** Texto pequeño monoespaciado tipo máquina de escribir. */
const Mono: React.FC<{x: number; y: number; texto: string; f: number; ini: number; color: string; tam?: number; ancla?: 'start' | 'middle' | 'end'; acento?: string}> = ({x, y, texto, f, ini, color, tam = 26, ancla = 'start', acento}) => {
  const n = Math.max(0, Math.min(texto.length, Math.floor((f - ini) * 1.6)));
  if (n <= 0) return null;
  return (
    <text x={x} y={y} fontFamily={MONO} fontWeight={700} fontSize={tam} fill={acento ?? color} textAnchor={ancla}>
      {texto.slice(0, n)}
    </text>
  );
};

const Etiqueta: React.FC<{texto: string; fondo: Fondo; activa: number}> = ({texto, fondo, activa}) => {
  const f = useCurrentFrame();
  const c = fondo === 'papel' ? 'rgba(21,21,21,0.6)' : 'rgba(242,238,230,0.55)';
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <Mono x={MARGEN} y={1608} texto={texto} f={f} ini={4} color={c} tam={25} />
      {activa >= 0 && [0, 1, 2].map((i) => (
        <circle key={i} cx={W - MARGEN - 12 - (2 - i) * 34} cy={1600} r={i === activa ? 10 : 7} fill={i === activa ? P.naranja : c} opacity={ap(f, 6 + i * 3, 8)} />
      ))}
    </svg>
  );
};

// =====================================================================
// Escena 00 · portada
// =====================================================================
const Portada: React.FC = () => {
  const f = useCurrentFrame();
  const T = tiemposEscena(0);
  const tGrieta = T.w(0, 3);
  const golpe = f >= tGrieta && f < tGrieta + 8 ? Math.sin((f - tGrieta) * 2.4) * (8 - (f - tGrieta)) * 1.6 : 0;
  const entra = ap(f, 0, 18);
  const giro = f * 9;
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <g transform={`translate(${golpe} ${(1 - entra) * 120}) translate(540 1080) scale(1.1) translate(-552 -1080)`} opacity={entra}>
        <ellipse cx={600} cy={1250} rx={440} ry={26} fill="#000" opacity={0.35} />
        <Eje x1={420} x2={990} y={1080} giro={giro} grosor={54} />
        <Bloque x={850} y={1040} w={84} h={150} c={P.azul} trama="tramaAzul" rx={10} />
        <circle cx={892} cy={1080} r={34} fill={P.azulOsc} />
        <Motor x={430} y={1080} f={f} fondo="noche" s={1.05} />
        <Grieta x={700} y={1080} alto={64} p={ap(f, tGrieta, 10)} />
        {f > tGrieta + 4 && <circle cx={700} cy={1080} r={mezcla(30, 110, ap(f, tGrieta + 4, 14))} fill="none" stroke={P.naranja} strokeWidth={4} opacity={1 - ap(f, tGrieta + 8, 16)} />}
        <Destello x={742} y={1012} f={f} ini={T.w(0, 5)} s={1.1} />
      </g>
    </svg>
  );
};

// =====================================================================
// Escena 09 · jerarquización
// =====================================================================
// Posiciones ilustrativas de las causas evaluadas: [evidencia, explica la fatiga]
const CAUSAS: [number, number][] = [
  [0.18, 0.3], [0.42, 0.14], [0.82, 0.86], [0.3, 0.55], [0.6, 0.22], [0.12, 0.72],
  [0.9, 0.76], [0.52, 0.42], [0.7, 0.5], [0.76, 0.93], [0.36, 0.84], [0.24, 0.12],
];
const ALTAS = [2, 9, 6]; // desalineamiento, procedimiento, montaje

const Jerarquizacion: React.FC = () => {
  const f = useCurrentFrame();
  const T = tiemposEscena(1);
  const ox = 170, oy = 1400, aw = 800, ah = 560;
  const ejeX = ap(f, T.b(1) - 2, 16);
  const ejeY = ap(f, T.b(2) - 2, 16);
  const aX = ap(f, T.w(1, 2), 18, Easing.inOut(Easing.cubic));
  const aY = ap(f, T.w(2, 2), 18, Easing.inOut(Easing.cubic));
  const zona = ap(f, T.b(3), 14);
  const fueraGrafico = ap(f, T.b(4) - 4, 12);
  const lupaX = interpolate(f, [T.b(1) - 6, T.b(2) + 6], [-200, 1200], {...CL, easing: Easing.inOut(Easing.quad)});

  // tres causas: columnas (orden hablado) y luego orden de la historia
  const cols = [205, 540, 875];
  const yIcono = 1060;
  const ordenHistoria = [2, 0, 1]; // desal→der, proc→izq, montaje→centro
  const reordena = ap(f, T.b(8) - 6, 20, Easing.inOut(Easing.cubic));
  const iconoX = (k: number) => mezcla(cols[k], cols[ordenHistoria[k]], reordena);
  const iconoY = (k: number) => yIcono - Math.sin(Math.PI * reordena) * (k === 0 ? 200 : 110);
  const tIcono = [T.b(4) + 2, T.w(5, 3), T.w(6, 2)];
  const resalta = (k: number) => {
    const tt = [T.w(10, 4), T.b(8) + 14, T.b(9)][k];
    return rebote(f, tt, 16) * (1 - ap(f, tt + 30, 20)) * 0.12;
  };

  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      {/* gráfico evidencia × explica */}
      <g opacity={1 - fueraGrafico} transform={`translate(0 ${-fueraGrafico * 80})`}>
        <line x1={ox} y1={oy} x2={ox + aw * ejeX} y2={oy} stroke={P.tinta} strokeWidth={5} strokeLinecap="round" />
        <line x1={ox} y1={oy} x2={ox} y2={oy - ah * ejeY} stroke={P.tinta} strokeWidth={5} strokeLinecap="round" />
        <Mono x={ox + aw} y={oy + 48} texto="evidencia →" f={f} ini={T.w(1, 2)} color={P.tinta} ancla="end" />
        <g transform={`translate(${ox - 26} ${oy - ah}) rotate(-90)`}>
          <Mono x={0} y={0} texto="← ¿explica la fatiga?" f={f} ini={T.w(2, 2)} color={P.tinta} ancla="end" />
        </g>
        {zona > 0 && (
          <g opacity={zona}>
            <rect x={ox + aw * 0.62} y={oy - ah * 1.02} width={aw * 0.38 * zona + 20} height={ah * 0.36} rx={18} fill={P.naranja} fillOpacity={0.1} stroke={P.naranja} strokeWidth={5} strokeDasharray="14 10" />
          </g>
        )}
        {CAUSAS.map(([ev, ex], i) => {
          const x0 = 170 + i * 67;
          const pop = rebote(f, T.b(0) + i * 2.2, 14);
          const x = mezcla(x0, ox + ev * aw, aX);
          const y = mezcla(1130, oy - 26, aX) - ex * ah * aY + (aY > 0 ? 0 : 0);
          const alta = ALTAS.includes(i);
          const gris = zona * (alta ? 0 : 1);
          const r = 22 * pop * (alta ? 1 + zona * 0.35 : 1 - zona * 0.25);
          return <circle key={i} cx={x} cy={aX < 1 ? y : y} r={Math.max(0, r)} fill={alta && zona > 0 ? P.naranja : gris > 0 ? '#BDB7AB' : P.tinta} />;
        })}
        {f > T.b(1) - 8 && f < T.b(2) + 8 && <Lupa x={lupaX} y={1130} s={0.95} />}
      </g>
      <g opacity={1 - ap(f, T.b(7) - 6, 10)}><Sello x={560} y={760} lineas={['prioridad', 'alta']} f={f} ini={T.w(3, 3)} ang={-6} ancho={520} /></g>

      {/* las tres causas como iconos */}
      {[0, 1, 2].map((k) => {
        const ini = tIcono[k];
        const p = rebote(f, ini, 16);
        if (p <= 0) return null;
        const x = iconoX(k);
        const y = iconoY(k);
        const s = p * 1.25 * (1 + resalta(k));
        const etiqueta = ['desalineamiento', 'sin procedimiento', 'montaje apurado'][k];
        const final = k === 0 && f >= T.w(10, 3);
        return (
          <g key={k}>
            <g transform={`translate(${x} ${y}) scale(${s})`}>
              {k === 0 && <IconoDesalineado x={0} y={0} s={0.78} f={f} ang={7} />}
              {k === 1 && <Portapapeles x={0} y={0} s={0.7} titulo="PROCEDIMIENTO" />}
              {k === 2 && <Cronometro x={-14} y={0} s={0.66} f={f} vel={2.6} />}
            </g>
            <Mono x={x} y={y + 215} texto={etiqueta} f={f} ini={ini + 2} color={final ? P.naranja : P.tinta} ancla="middle" tam={26} />
          </g>
        );
      })}
      {/* "una sola historia": hilo que las une */}
      <g opacity={1 - ap(f, T.b(8) - 8, 8)}>
        <Hilo d="M 0 820 C 120 820 120 1060 205 1060 S 380 820 540 820 S 700 1060 875 1060 S 1000 840 1080 820" p={ap(f, T.b(7), 34, Easing.inOut(Easing.cubic))} ancho={14} />
      </g>
      <Destello x={1000} y={830} f={f} ini={T.w(7, 3)} s={0.9} />
      {/* flechas de la historia: procedimiento → montaje → desalineamiento */}
      {[0, 1].map((i) => {
        const t = [T.b(9), T.b(10)][i] - 4;
        const p = ap(f, t, 10);
        if (p <= 0) return null;
        const x1 = cols[i] + 128, x2 = cols[i + 1] - 128;
        const xe = mezcla(x1, x2, p);
        return (
          <g key={i} stroke={P.naranja} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <line x1={x1} y1={yIcono} x2={xe} y2={yIcono} />
            {p > 0.8 && <path d={`M ${xe - 22} ${yIcono - 22} L ${xe} ${yIcono} L ${xe - 22} ${yIcono + 22}`} />}
          </g>
        );
      })}
    </svg>
  );
};

// =====================================================================
// Escena 10 · cadena 1
// =====================================================================
const CadenaFractura: React.FC = () => {
  const f = useCurrentFrame();
  const T = tiemposEscena(2);
  const giro = f * 9;
  const tGrieta = T.w(0, 3);
  const flex = ap(f, T.b(1), 14) * (1 - ap(f, T.b(5) - 6, 10) * 0.6);
  const curva = Math.sin(f / 4.2) * 26 * flex;
  const des = ap(f, T.w(2, 3), 18, Easing.inOut(Easing.cubic));
  // el motor se levanta y vuelve a caer (montaje)
  const tM = T.b(3);
  const sube = ap(f, tM - 2, 10, Easing.out(Easing.quad));
  const cae = ap(f, tM + 12, 7, Easing.in(Easing.quad));
  const altura = -320 * sube * (1 - cae);
  const aplasta = f >= tM + 19 && f < tM + 27 ? Math.sin(((f - tM - 19) / 8) * Math.PI) * 0.06 : 0;
  const motorAng = -4.5 * des;
  const motorDy = -30 * des + altura;
  // el conjunto se va al fondo cuando aparece el procedimiento
  const fondoP = ap(f, T.b(5) - 6, 16, Easing.inOut(Easing.cubic));
  const conj = {y: fondoP * 380, s: 1.18 - fondoP * 0.5, o: 1 - fondoP * 0.88};
  const mx = 440, my = 1110;
  // extremo del eje del motor (sigue al motor inclinado)
  const rad = (motorAng * Math.PI) / 180;
  const ex = mx + Math.cos(rad) * 6, ey = my + motorDy + Math.sin(rad) * 6;
  const burbuja = ap(f, tGrieta + 8, 14) * (1 - ap(f, T.b(1) + 4, 10));
  const nPorque = [T.b(1), T.b(2), T.b(3), T.b(5), T.b(6)].filter((t) => f >= t).length;

  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <g transform={`translate(${W / 2} ${my + conj.y}) scale(${conj.s}) translate(${-W / 2} ${-my})`} opacity={conj.o}>
        <ellipse cx={620} cy={1262} rx={460} ry={24} fill="#000" opacity={0.4} />
        {/* línea de centros de la máquina conducida (lima) y del motor (naranja) */}
        {des > 0 && (
          <g opacity={des}>
            <line x1={80} y1={my} x2={1040} y2={my} stroke={P.lima} strokeWidth={4} strokeDasharray="16 12" />
            <line x1={80} y1={my} x2={1040} y2={my} stroke={P.naranja} strokeWidth={4} strokeDasharray="16 12" transform={`rotate(${motorAng} ${mx} ${my + motorDy})`} />
            <Mono x={1020} y={my - 60} texto="desalineado" f={f} ini={T.w(2, 3) + 6} color={P.naranja} ancla="end" />
          </g>
        )}
        <Eje x1={ex} x2={1000} y={ey} y2={my} curva={curva} giro={giro} grosor={46} />
        <Grieta x={700} y={(ey + my) / 2 + curva * 1.0} alto={56 + Math.abs(curva) * 0.3} p={ap(f, tGrieta, 12)} />
        <Bloque x={880} y={my - 40} w={86} h={150} c={P.azul} trama="tramaAzul" rx={10} />
        <circle cx={923} cy={my} r={34} fill={P.azulOsc} />
        {/* flechas de flexión */}
        {flex > 0.05 && (
          <g stroke={P.lima} strokeWidth={8} fill="none" strokeLinecap="round" opacity={flex}>
            <path d={`M 600 ${my - 110} Q 700 ${my - 140 - curva} 800 ${my - 110}`} />
            <path d={`M 785 ${my - 128} L 802 ${my - 108} L 778 ${my - 98}`} />
            <path d={`M 600 ${my + 110} Q 700 ${my + 140 - curva} 800 ${my + 110}`} />
          </g>
        )}
        <g transform={`translate(${mx} ${my + motorDy}) scale(${1 + aplasta} ${1 - aplasta}) translate(${-mx} ${-(my + motorDy)})`}>
          <Motor x={mx} y={my + motorDy} ang={motorAng} f={f} fondo="noche" />
        </g>
        {/* polvo del golpe */}
        {f >= tM + 19 && f < tM + 40 && [0, 1, 2, 3, 4, 5].map((i) => {
          const t = (f - tM - 19) / 21;
          const lado = i < 3 ? -1 : 1;
          return <circle key={i} cx={mx - 130 + lado * (150 + t * (80 + i * 25))} cy={my + 120 - t * (20 + (i % 3) * 18)} r={(10 - (i % 3) * 2) * (1 - t)} fill={P.crema} />;
        })}
      </g>
      {/* zoom a la superficie de fractura */}
      {burbuja > 0 && (
        <g opacity={burbuja} transform={`translate(780 780) scale(${0.6 + 0.4 * burbuja})`}>
          <line x1={-40} y1={150} x2={-80} y2={300} stroke={P.crema} strokeWidth={3} strokeDasharray="6 8" />
          <circle r={150} fill={P.metal} stroke={P.crema} strokeWidth={6} />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const p = ap(f, tGrieta + 10 + i * 3, 8);
            const r = 40 + i * 30;
            return <path key={i} d={`M ${-150} ${-150 + r} A ${r} ${r} 0 0 0 ${-150 + r} ${-150}`} transform="translate(0 0)" stroke={P.azul} strokeWidth={5} fill="none" opacity={p} clipPath="url(#corteFractura)" />;
          })}
          <clipPath id="corteFractura"><circle r={146} /></clipPath>
          <path d="M 40 150 A 150 150 0 0 0 150 40 L 150 150 Z" fill={P.naranja} opacity={ap(f, tGrieta + 30, 8)} clipPath="url(#corteFractura)" />
          <circle cx={-118} cy={-118} r={10} fill={P.naranja} />
        </g>
      )}
      {/* sin alinear ni medir */}
      {f >= T.w(4, 3) - 4 && f < T.b(5) + 4 && (
        <g opacity={1 - ap(f, T.b(5) - 6, 8)}>
          <g transform={`translate(0 ${(1 - rebote(f, T.w(4, 3) - 4, 14)) * 60})`}>
            <Comparador x={700} y={800} s={1.05} f={f} />
          </g>
          <Equis x={700} y={800} r={90} p={ap(f, T.w(4, 3) + 4, 10)} />
        </g>
      )}
      {/* causa raíz: no hay procedimiento + no había tiempo */}
      {f >= T.w(5, 3) - 4 && (
        <g transform={`translate(0 ${(1 - rebote(f, T.w(5, 3) - 4, 16)) * 900})`}>
          <Portapapeles x={320} y={960} s={1.4} titulo="MONTAJE" ang={-4} />
        </g>
      )}
      <Sello x={320} y={1000} lineas={['no', 'existe']} f={f} ini={T.w(5, 2) + 14} ancho={340} ang={-10} />
      {f >= T.w(6, 2) - 4 && (
        <g transform={`translate(780 960) scale(${rebote(f, T.w(6, 2) - 4, 16)})`}>
          <Cronometro x={0} y={0} s={1.2} f={f} vel={4} />
        </g>
      )}
      <Mono x={320} y={1270} texto="causa raíz" f={f} ini={T.w(6, 5)} color={P.naranja} ancla="middle" />
      <Mono x={780} y={1270} texto="causa raíz" f={f} ini={T.w(6, 5) + 6} color={P.naranja} ancla="middle" />
      <Destello x={550} y={1262} f={f} ini={T.w(6, 5) + 12} s={0.7} />
      {/* contador de ¿por qué? */}
      <g transform="translate(0 0)" opacity={ap(f, T.b(1) - 6, 10)}>
        <Mono x={MARGEN} y={1488} texto={`¿por qué? ${nPorque} de 5`} f={f} ini={T.b(1) - 6} color={P.crema} tam={26} />
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={W - MARGEN - 16 - (4 - i) * 46} cy={1480} r={i < nPorque ? 15 : 10} fill={i < nPorque ? P.lima : 'none'} stroke={P.crema} strokeOpacity={0.5} strokeWidth={i < nPorque ? 0 : 3} />
        ))}
      </g>
    </svg>
  );
};

// =====================================================================
// Escena 11 · cadena 2
// =====================================================================
const CadenaOperacion: React.FC = () => {
  const f = useCurrentFrame();
  const T = tiemposEscena(3);
  const giro = f * 10;
  const vib = ap(f, T.w(1, 1), 20) * 14;
  const sinMaquina = ap(f, T.b(3) - 6, 14, Easing.inOut(Easing.cubic));
  const caer = ap(f, T.w(5, 2) - 2, 16, Easing.in(Easing.cubic));
  const ox = 150, oy = 1400, aw = 820, ah = 560;
  const graf = ap(f, T.b(3) - 2, 16);
  const ondaP = ap(f, T.b(3) + 4, 120, Easing.linear);
  const amp = (x: number) => 14 + x * x * 200 * Math.min(1, ondaP * 1.4);
  const limite = ap(f, T.w(4, 1), 14);
  const tachado = ap(f, T.w(4, 3) + 2, 10);
  const nPorque = [T.b(2), T.b(3), T.b(4), T.b(6)].filter((t) => f >= t).length + (f >= T.b(1) ? 1 : 0);
  const caida = (i: number) => caer * (1400 + i * 120);
  const giroCaida = (i: number) => caer * (i % 2 ? 24 : -18);

  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      {/* máquina funcionando con vibración y ruido */}
      <g opacity={1 - sinMaquina} transform={`translate(${W / 2} 1000) scale(${1.15 - sinMaquina * 0.5}) translate(${-W / 2} -1060) translate(0 ${-sinMaquina * 220})`}>
        <ellipse cx={600} cy={1210} rx={440} ry={22} fill="#000" opacity={0.14} />
        <Eje x1={470} x2={760} y={1060} giro={giro} grosor={42} />
        {/* bomba */}
        <g transform={`translate(${vib ? (random(`b${f}`) - 0.5) * vib * 0.6 : 0} 0)`}>
          <Bloque x={740} y={980} w={190} h={170} c={P.naranja} trama="tramaNaranja" rx={80} />
          <circle cx={835} cy={1065} r={46} fill={P.papel} />
          <g transform={`translate(835 1065) rotate(${giro * 2})`}>
            {[0, 60, 120, 180, 240, 300].map((a) => <rect key={a} x={-4} y={-40} width={8} height={40} fill={P.tinta} transform={`rotate(${a})`} />)}
          </g>
          <rect x={790} y={1150} width={90} height={40} fill={P.tinta} />
        </g>
        <Motor x={470} y={1060} f={f} fondo="papel" vib={vib} />
        {/* arcos de vibración */}
        {vib > 1 && [0, 1, 2].map((i) => {
          const t = ((f / 9 + i / 3) % 1);
          return (
            <g key={i} opacity={(1 - t) * (vib / 14)} stroke={P.naranja} strokeWidth={7} fill="none" strokeLinecap="round">
              <path d={`M ${120 - t * 80} ${990} Q ${90 - t * 90} ${1060} ${120 - t * 80} ${1130}`} />
              <path d={`M ${960 + t * 80} ${990} Q ${990 + t * 90} ${1060} ${960 + t * 80} ${1130}`} />
            </g>
          );
        })}
        {/* ondas de ruido */}
        {f >= T.w(1, 3) && [0, 1, 2].map((i) => {
          const t = (((f - T.w(1, 3)) / 24 + i / 3) % 1);
          return <circle key={i} cx={330} cy={900} r={40 + t * 160} fill="none" stroke={P.tinta} strokeWidth={5} opacity={(1 - t) * 0.6} strokeDasharray="4 14" strokeLinecap="round" />;
        })}
      </g>

      {/* nadie tenía criterio para detenerlo */}
      {f >= T.b(2) - 4 && (
        <g opacity={1 - sinMaquina}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => {
            const x = 180 + i * 120;
            const p = rebote(f, T.b(2) + i * 2, 14);
            const q = rebote(f, T.w(2, 3) + i * 2.5, 12);
            return (
              <g key={i} transform={`translate(${x} ${1360}) scale(${p})`}>
                <circle cx={0} cy={0} r={22} fill={P.tinta} />
                <path d="M -32 70 Q 0 20 32 70 Z" fill={P.tinta} />
                {q > 0 && <text x={0} y={-40} textAnchor="middle" fontFamily={GROTESK} fontWeight={900} fontSize={52 * q} fill={i % 3 === 1 ? P.azul : P.tinta}>?</text>}
              </g>
            );
          })}
          <g transform={`translate(860 780) scale(${rebote(f, T.w(2, 5) - 2, 14)}) rotate(${Math.sin(f / 3) * 3})`}>
            <circle r={92} fill={P.tinta} />
            <circle r={74} fill={P.naranja} />
            <circle r={74} fill="url(#tramaNaranja)" mask="url(#mitadAbajo)" />
            <text y={14} textAnchor="middle" fontFamily={GROTESK} fontWeight={900} fontSize={38} fill={P.papel} style={{fontStretch: '115%'}}>STOP</text>
          </g>
        </g>
      )}

      {/* gráfico: sin referencia y sin límite de alarma */}
      {graf > 0 && (
        <g transform={`translate(0 ${caida(0)}) rotate(${giroCaida(0)} 540 1100)`}>
          <line x1={ox} y1={oy} x2={ox + aw * graf} y2={oy} stroke={P.tinta} strokeWidth={5} strokeLinecap="round" />
          <line x1={ox} y1={oy} x2={ox} y2={oy - ah * graf} stroke={P.tinta} strokeWidth={5} strokeLinecap="round" />
          <Mono x={ox + aw} y={oy + 46} texto="tiempo →" f={f} ini={T.b(3)} color={P.tinta} ancla="end" />
          <g transform={`translate(${ox - 24} ${oy - ah}) rotate(-90)`}>
            <Mono x={0} y={0} texto="vibración →" f={f} ini={T.b(3) + 4} color={P.tinta} ancla="end" />
          </g>
          <OndaVib x0={ox + 10} y={oy - 150} w={aw - 20} amp={amp} fase={f / 2.5} p={ondaP} color={P.naranja} />
          {/* referencia: no existe */}
          <g opacity={ap(f, T.w(3, 4) - 2, 8) * (0.5 + 0.5 * Math.sin(f / 3))}>
            <line x1={ox} y1={oy - 150} x2={ox + aw} y2={oy - 150} stroke={P.azul} strokeWidth={4} strokeDasharray="10 12" />
          </g>
          <Mono x={ox + aw} y={oy - 166} texto="referencia: ¿?" f={f} ini={T.w(3, 4)} color={P.azul} ancla="end" />
          {/* límite de alarma tachado */}
          {limite > 0 && (
            <g opacity={limite}>
              <line x1={ox} y1={oy - 420} x2={ox + aw * limite} y2={oy - 420} stroke={P.tinta} strokeWidth={5} strokeDasharray="18 12" />
              <Mono x={ox + 10} y={oy - 440} texto="límite de alarma" f={f} ini={T.w(4, 1)} color={P.tinta} />
              <line x1={ox} y1={oy - 448} x2={ox + 290 * tachado} y2={oy - 448 - 2} stroke={P.naranja} strokeWidth={8} strokeLinecap="round" />
            </g>
          )}
        </g>
      )}
      <g transform={`translate(0 ${caida(1)})`}>
        <Destello x={860} y={870} f={f} ini={T.w(4, 3) + 8} s={0.8} />
      </g>

      {/* en el fondo: no existe protocolo */}
      {f >= T.w(6, 3) - 6 && (
        <g transform={`translate(0 ${(1 - rebote(f, T.w(6, 3) - 6, 18)) * 1000})`}>
          <Portapapeles x={540} y={1070} s={1.6} titulo="PROTOCOLO" ang={3} />
          <Mono x={540} y={1390} texto="puesta en servicio" f={f} ini={T.w(6, 7)} color={P.tinta} ancla="middle" />
          <Mono x={540} y={1430} texto="+ monitoreo de condición" f={f} ini={T.w(6, 9)} color={P.tinta} ancla="middle" />
        </g>
      )}
      <Sello x={540} y={1100} lineas={['no', 'existe']} f={f} ini={T.w(6, 1) + 18} ancho={380} ang={-9} />
      <Mono x={540} y={1505} texto="causa raíz" f={f} ini={T.finVoz + 6} color={P.naranja} ancla="middle" tam={34} />
      <Destello x={730} y={1492} f={f} ini={T.finVoz + 14} s={0.8} />
      {/* contador */}
      <g opacity={ap(f, T.b(1) - 6, 10) * (1 - caer)}>
        <Mono x={MARGEN} y={1488} texto={`¿por qué? ${nPorque} de 5`} f={f} ini={T.b(1) - 6} color={P.tinta} tam={26} />
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={W - MARGEN - 16 - (4 - i) * 46} cy={1480} r={i < nPorque ? 15 : 10} fill={i < nPorque ? P.naranja : 'none'} stroke={P.tinta} strokeOpacity={0.4} strokeWidth={i < nPorque ? 0 : 3} />
        ))}
      </g>
    </svg>
  );
};

const VISUAL = [Portada, Jerarquizacion, CadenaFractura, CadenaOperacion];

/** Transición: la escena nueva sube con borde ondulado, como papel que tapa al anterior. */
const Onda: React.FC<{children: React.ReactNode; activa: boolean}> = ({children, activa}) => {
  const f = useCurrentFrame();
  if (!activa) return <AbsoluteFill>{children}</AbsoluteFill>;
  const p = ap(f, 0, ONDA, Easing.inOut(Easing.cubic));
  if (p >= 1) return <AbsoluteFill>{children}</AbsoluteFill>;
  const base = H + 80 - (H + 200) * p;
  let d = `M 0 ${H} L 0 ${base}`;
  for (let x = 0; x <= W; x += 30) d += ` L ${x} ${(base + Math.sin(x / 70 + p * 6) * 34 + Math.sin(x / 23) * 8).toFixed(1)}`;
  d += ` L ${W} ${H} Z`;
  return <AbsoluteFill style={{clipPath: `path('${d}')`}}>{children}</AbsoluteFill>;
};

export const Analisis: React.FC<{musica?: string | null; voz?: boolean}> = ({musica = 'musica.mp3', voz = true}) => {
  cargarFuentes();
  const {durationInFrames} = useVideoConfig();
  const {inicios} = inicioEscenas();
  const rangos = ESCENAS.map((_, i) => [inicios[i] + VOZ, inicios[i] + tiemposEscena(i).finVoz] as const);
  const volumenMusica = (f: number) => {
    const fade = interpolate(f, [0, 12, durationInFrames - 50, durationInFrames - 4], [0, 1, 1, 0], CL);
    if (!voz) return 0.55 * fade;
    const habla = Math.max(...rangos.map(([a, b]) => interpolate(f, [a - 10, a, b, b + 14], [0, 1, 1, 0], CL)));
    return (0.5 - 0.32 * habla) * fade;
  };
  return (
    <AbsoluteFill style={{background: P.noche}}>
      <Defs />
      {musica && <Audio src={staticFile(musica)} volume={volumenMusica} />}
      {ESCENAS.map((e, i) => {
        const t = tiemposEscena(i);
        const ultima = i === ESCENAS.length - 1;
        const dur = ultima ? durationInFrames - inicios[i] : t.finVoz + e.cola;
        return (
          <Sequence key={e.id} from={inicios[i]} durationInFrames={dur}>
            <Onda activa={i > 0}>
              <FondoPlano fondo={e.fondo} />
              {React.createElement(VISUAL[i])}
              <Titulares frases={t.frases} fondo={e.fondo} />
              <Etiqueta texto={e.etiqueta} fondo={e.fondo} activa={i - 1} />
              <Grano fondo={e.fondo} />
              {voz && (
                <Sequence from={VOZ} layout="none">
                  <Audio src={staticFile(t.audio)} />
                </Sequence>
              )}
            </Onda>
          </Sequence>
        );
      })}
      <FundidoFinal />
    </AbsoluteFill>
  );
};

const FundidoFinal: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const o = interpolate(f, [durationInFrames - 22, durationInFrames - 2], [0, 1], CL);
  return o > 0 ? <AbsoluteFill style={{background: P.noche, opacity: o}} /> : null;
};
