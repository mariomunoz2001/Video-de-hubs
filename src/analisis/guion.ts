/**
 * Guion del video "Análisis de falla · Integrante 3 (láminas 9 a 11)".
 * Cada `beat` es una frase hablada: dura lo que toma leerla en voz alta y
 * dispara la animación del elemento que le corresponde en pantalla.
 */

import tiempos from '../../analisis/tiempos.json';

export const FPS_GUION = 30;
export const INTRO = 84;
export const VOZ = 26; // la voz parte cuando ya entró el encabezado
export const COLA = 54; // pausa al final de cada lámina antes de pasar a la siguiente
export const TRANSICION = 14;

export const palabras = (t: string) => t.trim().split(/\s+/);
const aFrames = (ms: number) => Math.round((ms / 1000) * FPS_GUION);

export type Lamina = {
  numero: string;
  titulo: string;
  bajada: string;
  beats: string[];
};

export const LAMINAS: Lamina[] = [
  {
    numero: '09',
    titulo: 'Jerarquización',
    bajada: 'Evidencia × ¿explica la fatiga?',
    beats: [
      'Evaluamos cada causa según su evidencia y si explica la fatiga.',
      'Tres quedaron con prioridad alta:',
      'el desalineamiento, la falta de procedimiento y el montaje apresurado sin alinear.',
      'Cuentan una sola historia:',
      'sin procedimiento, se montó sin alinear, y eso generó el desalineamiento.',
    ],
  },
  {
    numero: '10',
    titulo: '5 ¿Por qué?',
    bajada: 'Cadena 1 · La fractura',
    beats: [
      'El eje se fracturó por fatiga,',
      'por flexión',
      'causada por el desalineamiento.',
      'El motor se montó sin alinear ni medir',
      'porque no existe un procedimiento obligatorio de montaje',
      'y la planificación no daba tiempo.',
    ],
  },
  {
    numero: '11',
    titulo: '5 ¿Por qué?',
    bajada: 'Cadena 2 · La operación',
    beats: [
      'El equipo siguió operando con vibración y ruido',
      'porque nadie tenía criterio para detenerlo:',
      'no había medición de referencia',
      'ni límites de alarma.',
      'En el fondo, no existe un protocolo de puesta en servicio y monitoreo de condición.',
    ],
  },
];

export type Palabra = {texto: string; ini: number; fin: number};

/**
 * Tiempos (en frames, relativos a la lámina) de cada beat y de cada palabra,
 * tomados de la narración real (analisis/tiempos.json).
 */
export const tiemposLamina = (i: number) => {
  const l = LAMINAS[i];
  const t = tiempos.laminas[i];
  const total = l.beats.reduce((n, b) => n + palabras(b).length, 0);
  if (total !== t.palabras.length) throw new Error(`Lámina ${l.numero}: el guion tiene ${total} palabras y tiempos.json ${t.palabras.length}`);
  let k = 0;
  const beats = l.beats.map((b) =>
    palabras(b).map((texto) => {
      const [ini, fin] = t.palabras[k++];
      return {texto, ini: VOZ + aFrames(ini), fin: VOZ + aFrames(fin)} as Palabra;
    }),
  );
  return {beats, inicios: beats.map((ps) => ps[0].ini - 3), finVoz: VOZ + aFrames(t.duracion_ms), audio: t.audio};
};

export const duracionLamina = (i: number) => tiemposLamina(i).finVoz + COLA;

/** Frame global en que empieza cada escena (intro + láminas), con solape para la transición. */
export const inicioEscenas = () => {
  const out = [0];
  let t = INTRO - TRANSICION;
  LAMINAS.forEach((_, i) => {
    out.push(t);
    t += duracionLamina(i) - TRANSICION;
  });
  return {inicios: out, total: t + TRANSICION};
};

export const DURACION_ANALISIS = inicioEscenas().total;
