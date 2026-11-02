/**
 * Guion del video "Análisis de falla · Integrante 3 (láminas 9 a 11)".
 *
 * Cada escena tiene `frases` (lo que se ve como titular, de a una) y cada frase
 * tiene `lineas` (beats hablados). Cada beat dispara su animación en pantalla.
 * Marcas de color por palabra: *naranja*  _azul_  ^lima^
 * El texto debe coincidir palabra por palabra con la narración (analisis/tiempos.json).
 */
import tiempos from '../../analisis/tiempos.json';

export const FPS_GUION = 30;
export const VOZ = 14; // frames desde que entra la escena hasta que parte la voz
export const ONDA = 16; // duración de la transición ondulada entre escenas

export type Fondo = 'papel' | 'noche';
export type Color = 'tinta' | 'naranja' | 'azul' | 'lima';

export type Escena = {
  id: string;
  fondo: Fondo;
  etiqueta: string;
  frases: string[][];
  /** frames que se queda la escena después de que termina la voz */
  cola: number;
};

export const ESCENAS: Escena[] = [
  {
    id: '00',
    fondo: 'noche',
    etiqueta: 'análisis de falla · integrante 3',
    frases: [['¿Por qué se *fracturó* el ^eje?^']],
    cola: 26,
  },
  {
    id: '09',
    fondo: 'papel',
    etiqueta: '09 · jerarquización',
    frases: [
      ['Evaluamos cada causa', 'según su _evidencia_'],
      ['y si explica la *fatiga.*'],
      ['Tres quedaron con *prioridad alta:*'],
      ['el *desalineamiento,*'],
      ['la falta de _procedimiento_'],
      ['y el montaje *apresurado* sin alinear.'],
      ['Cuentan una sola ^historia:^'],
      ['sin procedimiento,', 'se montó sin alinear,', 'y eso generó el *desalineamiento.*'],
    ],
    cola: 40,
  },
  {
    id: '10',
    fondo: 'noche',
    etiqueta: '10 · 5 ¿por qué? · cadena 1',
    frases: [
      ['El eje se *fracturó* por fatiga,'],
      ['por ^flexión,^'],
      ['causada por el *desalineamiento.*'],
      ['El motor se montó', 'sin alinear ni ^medir^'],
      ['porque no existe un *procedimiento obligatorio* de montaje'],
      ['y la planificación no daba _tiempo._'],
    ],
    cola: 44,
  },
  {
    id: '11',
    fondo: 'papel',
    etiqueta: '11 · 5 ¿por qué? · cadena 2',
    frases: [
      ['El equipo siguió operando', 'con *vibración* y *ruido,*'],
      ['porque nadie tenía _criterio_ para detenerlo:'],
      ['no había medición de _referencia_'],
      ['ni límites de *alarma.*'],
      ['En el fondo,', 'no existe un *protocolo* de puesta en servicio y monitoreo de condición.'],
    ],
    cola: 75,
  },
];

const MARCAS: Record<string, Color> = {'*': 'naranja', _: 'azul', '^': 'lima'};
const aFrames = (ms: number) => Math.round((ms / 1000) * FPS_GUION);

export type Palabra = {texto: string; color: Color; ini: number; fin: number};
/** Una línea del titular = un beat hablado. */
export type Linea = Palabra[];

/** Las marcas de un grupo de varias palabras (*procedimiento obligatorio*) colorean todas las del grupo. */
const parsear = (linea: string): {texto: string; color: Color}[] => {
  const out: {texto: string; color: Color}[] = [];
  let abierto: Color | null = null;
  for (const raw of linea.trim().split(/\s+/)) {
    const abre = raw[0] in MARCAS ? MARCAS[raw[0]] : null;
    const limpio = raw.replace(/[*_^]/g, '');
    const cierra = /[*_^][,.:;?!]*$/.test(raw);
    const color = abre ?? abierto ?? 'tinta';
    out.push({texto: limpio, color});
    if (abre && !cierra) abierto = abre;
    if (cierra) abierto = null;
  }
  return out;
};

/** Tiempos de cada palabra (frames, relativos a la escena) a partir de la narración real. */
export const tiemposEscena = (i: number) => {
  const e = ESCENAS[i];
  const t = tiempos.escenas[i];
  const frases = e.frases.map((lineas) => lineas.map(parsear));
  const total = frases.flat(2).length;
  if (total !== t.palabras.length) throw new Error(`Escena ${e.id}: el guion tiene ${total} palabras y tiempos.json ${t.palabras.length}`);
  let k = 0;
  const conTiempo: Linea[][] = frases.map((lineas) =>
    lineas.map((ps) => ps.map((p) => {
      const [ini, fin] = t.palabras[k++];
      return {...p, ini: VOZ + aFrames(ini), fin: VOZ + aFrames(fin)};
    })),
  );
  const beats = conTiempo.flat();
  return {
    frases: conTiempo,
    beats,
    /** frame en que empieza el beat k */
    b: (n: number) => beats[n][0].ini,
    /** frame en que empieza la palabra j del beat k */
    w: (n: number, j: number) => beats[n][j].ini,
    finVoz: VOZ + aFrames(t.duracion_ms),
    audio: t.audio,
  };
};

export const duracionEscena = (i: number) => tiemposEscena(i).finVoz + ESCENAS[i].cola;

/** Frame global en que empieza cada escena (se solapan ONDA frames). */
export const inicioEscenas = () => {
  const out: number[] = [];
  let t = 0;
  ESCENAS.forEach((_, i) => {
    out.push(t);
    t += duracionEscena(i) - ONDA;
  });
  return {inicios: out, total: t + ONDA};
};

export const DURACION_ANALISIS = inicioEscenas().total;
