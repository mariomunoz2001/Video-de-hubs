import fs from 'node:fs';
import path from 'node:path';
import {carpetaCaptura, DIR_MUSICA, DIR_TMP, RAIZ, type Cliente} from './clientes.js';
import type {PromoProps} from '../../src/types.js';

const AUDIO = /\.(mp3|m4a|aac|wav|ogg)$/i;

function elegirMusica(c: Cliente): string | undefined {
  if (c.musica === false) return undefined;
  if (typeof c.musica === 'string') {
    const f = path.join(DIR_MUSICA, c.musica);
    if (!fs.existsSync(f)) throw new Error(`musica/${c.musica} no existe (clientes/${c.slug}.json)`);
    return f;
  }
  if (!fs.existsSync(DIR_MUSICA)) return undefined;
  const primero = fs.readdirSync(DIR_MUSICA).filter((f) => AUDIO.test(f)).sort()[0];
  return primero ? path.join(DIR_MUSICA, primero) : undefined;
}

/**
 * Junta en una carpeta `public` temporal todo lo que el video necesita (captura, logo, música)
 * y devuelve las props para Remotion.
 */
export function prepararAssets(c: Cliente): {props: PromoProps; publicDir: string} {
  const dirCaptura = carpetaCaptura(c.slug);
  const metaFile = path.join(dirCaptura, 'meta.json');
  if (!fs.existsSync(metaFile) || !fs.existsSync(path.join(dirCaptura, 'hub.png'))) {
    throw new Error(`No hay captura de "${c.slug}". Ejecuta primero: npm run capturar -- ${c.slug}`);
  }
  const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));

  const publicDir = path.join(DIR_TMP, c.slug, 'public');
  fs.rmSync(publicDir, {recursive: true, force: true});
  fs.mkdirSync(publicDir, {recursive: true});
  fs.copyFileSync(path.join(dirCaptura, 'hub.png'), path.join(publicDir, 'hub.png'));

  let logo: string | undefined;
  if (c.logo) {
    const origen = path.resolve(RAIZ, c.logo);
    if (!fs.existsSync(origen)) throw new Error(`No encuentro el logo: ${origen}`);
    logo = 'logo' + path.extname(origen).toLowerCase();
    fs.copyFileSync(origen, path.join(publicDir, logo));
  }

  let musica: string | undefined;
  const mus = elegirMusica(c);
  if (mus) {
    musica = 'musica' + path.extname(mus).toLowerCase();
    fs.copyFileSync(mus, path.join(publicDir, musica));
  }

  const props: PromoProps = {
    nombre: c.nombre,
    instagram: c.instagram,
    primario: c.colorPrincipal,
    secundario: c.colorSecundario,
    frase: c.frase?.trim() || 'Todo en un solo toque',
    logo,
    musica,
    hub: {imagen: 'hub.png', ancho: meta.ancho, alto: meta.alto, etiquetas: meta.etiquetas},
  };
  return {props, publicDir};
}
