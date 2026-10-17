import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {ensureBrowser, renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {DIR_MUSICA, DIR_SALIDA, DIR_TMP, RAIZ} from './lib/clientes.js';
import {comprimirParaWhatsApp, hayFfmpeg} from './lib/ffmpeg.js';
import {buscarChromium} from './lib/navegador.js';
import type {ProductoProps} from '../src/types.js';

const MB = 1024 * 1024;
const AUDIO = /\.(mp3|m4a|aac|wav|ogg)$/i;

type Config = Omit<ProductoProps, 'mascota' | 'musica'> & {mascota?: string; musica?: string | false};

function preparar(slug: string) {
  const archivo = path.join(RAIZ, 'productos', `${slug}.json`);
  if (!fs.existsSync(archivo)) throw new Error(`No existe productos/${slug}.json`);
  const cfg: Config = JSON.parse(fs.readFileSync(archivo, 'utf8'));
  const publicDir = path.join(DIR_TMP, `producto-${slug}`, 'public');
  fs.rmSync(publicDir, {recursive: true, force: true});
  fs.mkdirSync(publicDir, {recursive: true});
  const copiar = (rel: string, destino: string) => {
    const origen = path.resolve(RAIZ, rel);
    if (!fs.existsSync(origen)) throw new Error(`No encuentro ${rel}`);
    const nombre = destino + path.extname(origen).toLowerCase();
    fs.copyFileSync(origen, path.join(publicDir, nombre));
    return nombre;
  };
  let musica: string | undefined;
  if (cfg.musica !== false) {
    const elegida = typeof cfg.musica === 'string'
      ? path.join(DIR_MUSICA, cfg.musica)
      : fs.existsSync(DIR_MUSICA) ? fs.readdirSync(DIR_MUSICA).filter((f) => AUDIO.test(f)).sort().map((f) => path.join(DIR_MUSICA, f))[0] : undefined;
    if (elegida) {
      if (!fs.existsSync(elegida)) throw new Error(`No existe ${elegida}`);
      musica = 'musica' + path.extname(elegida).toLowerCase();
      fs.copyFileSync(elegida, path.join(publicDir, musica));
    }
  }
  const props: ProductoProps = {...cfg, mascota: cfg.mascota ? copiar(cfg.mascota, 'mascota') : undefined, musica};
  return {props, publicDir};
}

export async function renderizarProducto(slug: string, still?: number) {
  if (!hayFfmpeg()) throw new Error('FFmpeg no está instalado (ver README: "Requisitos").');
  const {props, publicDir} = preparar(slug);
  fs.mkdirSync(DIR_SALIDA, {recursive: true});
  const browserExecutable = buscarChromium() ?? null;
  if (!browserExecutable) await ensureBrowser();
  const chromeMode = browserExecutable ? 'chrome-for-testing' : 'headless-shell';

  console.log('📦 Empaquetando plantilla…');
  const serveUrl = await bundle({entryPoint: path.join(RAIZ, 'src', 'index.ts'), publicDir});
  const comp = await selectComposition({serveUrl, id: 'Producto', inputProps: props, browserExecutable, chromeMode});

  if (still !== undefined) {
    const out = path.join(DIR_TMP, `producto-${slug}`, `frame-${String(still).padStart(3, '0')}.png`);
    await renderStill({composition: comp, serveUrl, output: out, frame: still, inputProps: props, browserExecutable, chromeMode});
    console.log('✔', out);
    return;
  }

  const salida = path.join(DIR_SALIDA, `${slug}.mp4`);
  console.log(`🎬 Renderizando ${comp.durationInFrames} frames (${(comp.durationInFrames / comp.fps).toFixed(1)} s)…`);
  let ultimo = -1;
  await renderMedia({
    composition: comp, serveUrl, codec: 'h264', outputLocation: salida, inputProps: props, crf: 17, pixelFormat: 'yuv420p', browserExecutable, chromeMode,
    onProgress: ({progress}) => { const p = Math.floor(progress * 10) * 10; if (p !== ultimo) { ultimo = p; process.stdout.write(`\r   ${p}%`); } },
  });
  process.stdout.write('\n');
  console.log(`✔ ${path.relative(RAIZ, salida)}  (${(fs.statSync(salida).size / MB).toFixed(1)} MB)`);
  const wsp = path.join(DIR_SALIDA, `${slug}-whatsapp.mp4`);
  console.log('🗜  Comprimiendo para WhatsApp…');
  const tam = comprimirParaWhatsApp(salida, wsp);
  console.log(`✔ ${path.relative(RAIZ, wsp)}  (${(tam / MB).toFixed(1)} MB)`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const slug = process.argv[2];
  const still = process.argv.find((a) => a.startsWith('--frame='))?.split('=')[1];
  if (!slug) { console.error('Uso: npm run producto -- <slug> [--frame=N]'); process.exit(1); }
  renderizarProducto(slug, still ? Number(still) : undefined).catch((e) => { console.error('✖', e.message); process.exit(1); });
}
