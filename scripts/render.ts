import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {ensureBrowser, renderMedia, selectComposition} from '@remotion/renderer';
import {cargarCliente, DIR_SALIDA, RAIZ} from './lib/clientes.js';
import {comprimirParaWhatsApp, hayFfmpeg} from './lib/ffmpeg.js';
import {buscarChromium} from './lib/navegador.js';
import {prepararAssets} from './lib/preparar.js';

const MB = 1024 * 1024;

export async function renderizar(slug: string) {
  if (!hayFfmpeg()) throw new Error('FFmpeg no está instalado (ver README: "Requisitos").');
  const cliente = cargarCliente(slug);
  const {props, publicDir} = prepararAssets(cliente);
  fs.mkdirSync(DIR_SALIDA, {recursive: true});

  // Reutilizamos el Chromium de Playwright (ya instalado para capturar); si no hay, Remotion descarga el suyo.
  const browserExecutable = buscarChromium() ?? null;
  if (!browserExecutable) await ensureBrowser();

  console.log(`📦 Empaquetando plantilla…`);
  const serveUrl = await bundle({entryPoint: path.join(RAIZ, 'src', 'index.ts'), publicDir});
  const chromeMode = browserExecutable ? 'chrome-for-testing' : 'headless-shell'; // Chromium completo → modo nuevo
  const comp = await selectComposition({serveUrl, id: 'Promo', inputProps: props, browserExecutable, chromeMode});

  const salida = path.join(DIR_SALIDA, `${slug}.mp4`);
  console.log(`🎬 Renderizando ${comp.durationInFrames} frames (${(comp.durationInFrames / comp.fps).toFixed(1)} s)…`);
  let ultimo = -1;
  await renderMedia({
    composition: comp,
    serveUrl,
    codec: 'h264',
    outputLocation: salida,
    inputProps: props,
    crf: 17,
    pixelFormat: 'yuv420p',
    browserExecutable,
    chromeMode,
    onProgress: ({progress}) => {
      const p = Math.floor(progress * 10) * 10;
      if (p !== ultimo) { ultimo = p; process.stdout.write(`\r   ${p}%`); }
    },
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
  if (!slug) {
    console.error('Uso: npm run render -- <slug>');
    process.exit(1);
  }
  renderizar(slug).catch((e) => { console.error('✖', e.message); process.exit(1); });
}
