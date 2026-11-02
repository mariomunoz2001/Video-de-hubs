/**
 * Guion del video "Análisis de falla · Integrante 3 (láminas 9 a 11)".
 * Cada `beat` es una frase hablada: dura lo que toma leerla en voz alta y
 * dispara la animación del elemento que le corresponde en pantalla.
 */

export const FRAMES_POR_PALABRA = 10.5; // ~2,9 palabras por segundo a 30 fps
export const PAUSA_BEAT = 12;
export const INTRO = 84;
export const COLA = 36; // tiempo extra al final de cada lámina antes de pasar a la siguiente
export const TRANSICION = 14;

export const palabras = (t: string) => t.trim().split(/\s+/);
export const duracionBeat = (t: string) => Math.max(40, Math.round(palabras(t).length * FRAMES_POR_PALABRA) + PAUSA_BEAT);

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

/** Inicio (relativo a la lámina) de cada beat. */
export const iniciosBeats = (l: Lamina) => {
  const out: number[] = [];
  let t = 26; // deja entrar el encabezado antes de la primera frase
  for (const b of l.beats) {
    out.push(t);
    t += duracionBeat(b);
  }
  return {inicios: out, fin: t};
};

export const duracionLamina = (l: Lamina) => iniciosBeats(l).fin + COLA;

/** Frame global en que empieza cada escena (intro + láminas), con solape para la transición. */
export const inicioEscenas = () => {
  const out = [0];
  let t = INTRO - TRANSICION;
  for (const l of LAMINAS) {
    out.push(t);
    t += duracionLamina(l) - TRANSICION;
  }
  return {inicios: out, total: t + TRANSICION};
};

export const DURACION_ANALISIS = inicioEscenas().total;
