import {continueRender, delayRender} from 'remotion';
import poppins400 from '@fontsource/poppins/files/poppins-latin-400-normal.woff2';
import poppins600 from '@fontsource/poppins/files/poppins-latin-600-normal.woff2';
import poppins700 from '@fontsource/poppins/files/poppins-latin-700-normal.woff2';
import poppins800 from '@fontsource/poppins/files/poppins-latin-800-normal.woff2';
import caveat700 from '@fontsource/caveat/files/caveat-latin-700-normal.woff2';
import fraunces700 from '@fontsource/fraunces/files/fraunces-latin-700-normal.woff2';
import fraunces800 from '@fontsource/fraunces/files/fraunces-latin-800-normal.woff2';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/** Reels tapa ~15% arriba y abajo: todo lo importante va entre estos dos valores. */
export const SAFE_TOP = Math.round(HEIGHT * 0.15); // 288
export const SAFE_BOTTOM = HEIGHT - SAFE_TOP; // 1632
export const SAFE_SIDE = 72;

export const FONT = "'Poppins', system-ui, sans-serif";

/** Duración de cada escena (frames) y solape para el cross-fade. */
export const ESCENAS = {intro: 90, nfc: 90, hub: 240, cierre: 90} as const;
export const SOLAPE = 8;
export const DURACION_TOTAL = ESCENAS.intro + ESCENAS.nfc + ESCENAS.hub + ESCENAS.cierre - 3 * SOLAPE;

let cargada = false;
export function cargarFuentes() {
  if (cargada) return;
  cargada = true;
  const espera = delayRender('fuentes');
  const defs: [string, string, string][] = [
    ['Poppins', '400', poppins400],
    ['Poppins', '600', poppins600],
    ['Poppins', '700', poppins700],
    ['Poppins', '800', poppins800],
    ['Caveat', '700', caveat700],
    ['Fraunces', '700', fraunces700],
    ['Fraunces', '800', fraunces800],
  ];
  Promise.all(
    defs.map(async ([familia, peso, url]) => {
      const f = new FontFace(familia, `url(${url})`, {weight: peso});
      await f.load();
      document.fonts.add(f);
    }),
  )
    .catch((e) => console.warn('No se pudieron cargar las fuentes', e))
    .finally(() => continueRender(espera));
}

// ---------- utilidades de color ----------
const aRgb = (hex: string): [number, number, number] => {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const aHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');

export const mezclar = (a: string, b: string, t: number) => {
  const [r1, g1, b1] = aRgb(a);
  const [r2, g2, b2] = aRgb(b);
  return aHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
};
export const oscurecer = (c: string, t: number) => mezclar(c, '#000000', t);
export const aclarar = (c: string, t: number) => mezclar(c, '#ffffff', t);
export const conAlfa = (c: string, a: number) => {
  const [r, g, b] = aRgb(c);
  return `rgba(${r},${g},${b},${a})`;
};
export const luminancia = (c: string) => {
  const [r, g, b] = aRgb(c).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
/** Blanco o casi negro según qué contraste mejor con el fondo dado. */
export const textoSobre = (fondo: string) => (luminancia(fondo) > 0.42 ? '#161616' : '#ffffff');
