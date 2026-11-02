import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {ensureBrowser, renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {DIR_SALIDA, DIR_TMP, RAIZ} from './lib/clientes.js';
import {comprimirParaWhatsApp, hayFfmpeg} from './lib/ffmpeg.js';
import {buscarChromium} from './lib/navegador.js';

/** Renderiza el video del análisis de falla (src/analisis/guion.ts) → salida/analisis-fatiga.mp4 */
const MB = 1024 * 1024;
const still = process.argv.find((a) => a.startsWith('--frame='))?.split('=')[1];

async function main() {
  if (!hayFfmpeg()) throw new Error('FFmpeg no está instalado (ver README: "Requisitos").');
  fs.mkdirSync(DIR_SALIDA, {recursive: true});
  const browserExecutable = buscarChromium() ?? null;
  if (!browserExecutable) await ensureBrowser();
  const chromeMode = browserExecutable ? 'chrome-for-testing' : 'headless-shell';
  console.log('📦 Empaquetando plantilla…');
  const publicDir = path.join(DIR_TMP, 'analisis', 'public');
  fs.rmSync(publicDir, {recursive: true, force: true});
  fs.mkdirSync(publicDir, {recursive: true});
  for (const f of fs.readdirSync(path.join(RAIZ, 'analisis'))) if (/\.(wav|mp3)$/i.test(f)) fs.copyFileSync(path.join(RAIZ, 'analisis', f), path.join(publicDir, f));
  const serveUrl = await bundle({entryPoint: path.join(RAIZ, 'src', 'index.ts'), publicDir});
  const comp = await selectComposition({serveUrl, id: 'Analisis', inputProps: {}, browserExecutable, chromeMode});
  if (still !== undefined) {
    for (const fr of still.split(',')) {
      const out = path.join(DIR_TMP, 'analisis', `frame-${fr.padStart(4, '0')}.png`);
      await renderStill({composition: comp, serveUrl, output: out, frame: Number(fr), inputProps: {}, browserExecutable, chromeMode});
      console.log('✔', out);
    }
    return;
  }
  const salida = path.join(DIR_SALIDA, 'analisis-fatiga.mp4');
  console.log(`🎬 Renderizando ${comp.durationInFrames} frames (${(comp.durationInFrames / comp.fps).toFixed(1)} s)…`);
  let ultimo = -1;
  await renderMedia({
    composition: comp, serveUrl, codec: 'h264', outputLocation: salida, inputProps: {}, crf: 17, pixelFormat: 'yuv420p', browserExecutable, chromeMode,
    onProgress: ({progress}) => { const p = Math.floor(progress * 10) * 10; if (p !== ultimo) { ultimo = p; process.stdout.write(`\r   ${p}%`); } },
  });
  process.stdout.write('\n');
  console.log(`✔ ${path.relative(RAIZ, salida)}  (${(fs.statSync(salida).size / MB).toFixed(1)} MB)`);
  const wsp = path.join(DIR_SALIDA, 'analisis-fatiga-whatsapp.mp4');
  const tam = comprimirParaWhatsApp(salida, wsp);
  console.log(`✔ ${path.relative(RAIZ, wsp)}  (${(tam / MB).toFixed(1)} MB)`);
}

main().catch((e) => { console.error('✖', e.message); process.exit(1); });
