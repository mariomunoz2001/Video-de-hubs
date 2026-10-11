import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const DIR_CLIENTES = path.join(RAIZ, 'clientes');
export const DIR_CAPTURAS = path.join(RAIZ, 'capturas');
export const DIR_SALIDA = path.join(RAIZ, 'salida');
export const DIR_MUSICA = path.join(RAIZ, 'musica');
export const DIR_TMP = path.join(RAIZ, '.tmp');

export type Cliente = {
  slug: string;
  nombre: string;
  /** URL del hub (https://...) o ruta a un HTML local (relativa a la raíz del proyecto) */
  hub: string;
  logo?: string;
  colorPrincipal: string;
  colorSecundario: string;
  instagram: string;
  frase?: string;
  /** Archivo dentro de /musica. Si se omite se usa el primero que haya; `false` fuerza silencio. */
  musica?: string | false;
  /** Opcional: reemplaza las etiquetas detectadas automáticamente */
  etiquetas?: string[];
};

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function listarSlugs(): string[] {
  return fs
    .readdirSync(DIR_CLIENTES)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .sort();
}

export function cargarCliente(slug: string): Cliente {
  const archivo = path.join(DIR_CLIENTES, `${slug}.json`);
  if (!fs.existsSync(archivo)) {
    throw new Error(`No existe clientes/${slug}.json. Clientes disponibles: ${listarSlugs().join(', ') || '(ninguno)'}`);
  }
  const bruto = JSON.parse(fs.readFileSync(archivo, 'utf8'));
  const c: Cliente = {slug, ...bruto};
  const faltan = (['nombre', 'hub', 'colorPrincipal', 'colorSecundario', 'instagram'] as const).filter((k) => !c[k]);
  if (faltan.length) throw new Error(`clientes/${slug}.json: faltan campos: ${faltan.join(', ')}`);
  for (const k of ['colorPrincipal', 'colorSecundario'] as const) {
    if (!HEX.test(c[k])) throw new Error(`clientes/${slug}.json: "${k}" debe ser un color hex (ej. #1a73e8), recibí "${c[k]}"`);
  }
  c.instagram = c.instagram.replace(/^@/, '').trim();
  return c;
}

/** Devuelve una URL navegable: https://… tal cual, o file:// para archivos locales. */
export function urlDelHub(c: Cliente): string {
  if (/^https?:\/\//i.test(c.hub)) return c.hub;
  const ruta = path.resolve(RAIZ, c.hub);
  if (!fs.existsSync(ruta)) throw new Error(`No encuentro el HTML local del hub: ${ruta}`);
  return 'file://' + ruta;
}

export function carpetaCaptura(slug: string) {
  return path.join(DIR_CAPTURAS, slug);
}
