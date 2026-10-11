import fs from 'node:fs';
import path from 'node:path';
import {chromium, type Browser} from 'playwright';
import {carpetaCaptura, cargarCliente, urlDelHub, type Cliente} from './lib/clientes.js';

const VIEWPORT = {width: 390, height: 844};
/** Chromium no captura texturas de más de ~16384 px; dejamos margen. */
const MAX_PX = 16000;

export type MetaCaptura = {
  ancho: number;
  alto: number;
  escala: number;
  titulo: string;
  etiquetas: string[];
};

/** Playwright pide un Chromium de una revisión concreta; si no está, usamos el que haya instalado. */
async function abrirNavegador(): Promise<Browser> {
  try {
    return await chromium.launch();
  } catch (e) {
    const base = process.env.PLAYWRIGHT_BROWSERS_PATH ?? path.join(process.env.HOME ?? '', '.cache', 'ms-playwright');
    const candidatos = fs.existsSync(base)
      ? fs.readdirSync(base).filter((d) => d.startsWith('chromium')).sort().reverse()
      : [];
    for (const d of candidatos) {
      for (const sub of ['chrome-linux/chrome', 'chrome-linux64/chrome', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium', 'chrome-win/chrome.exe']) {
        const exe = path.join(base, d, sub);
        if (fs.existsSync(exe)) return chromium.launch({executablePath: exe});
      }
    }
    throw new Error('No se pudo abrir Chromium. Ejecuta: npx playwright install chromium\n' + (e as Error).message);
  }
}

async function nuevaPagina(navegador: Browser, escala: number) {
  const ctx = await navegador.newContext({viewport: VIEWPORT, deviceScaleFactor: escala, isMobile: true, hasTouch: true, locale: 'es-CL'});
  // tsx/esbuild inserta __name() en las funciones; en el navegador no existe.
  await ctx.addInitScript('window.__name = (f) => f;');
  return {ctx, page: await ctx.newPage()};
}

export async function capturar(c: Cliente): Promise<MetaCaptura> {
  const url = urlDelHub(c);
  const dir = carpetaCaptura(c.slug);
  fs.mkdirSync(dir, {recursive: true});

  const navegador = await abrirNavegador();
  try {
    // Si la página es muy larga bajamos el factor de escala para no pasar el límite de Chromium.
    let escala = 3;
    const {ctx, page} = await nuevaPagina(navegador, escala);
    await page.goto(url, {waitUntil: 'networkidle', timeout: 60_000});

    // Fuentes e imágenes
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        Array.from(document.images).map((img) => {
          img.loading = 'eager';
          return img.complete ? undefined : new Promise((r) => { img.onload = img.onerror = r; });
        }),
      );
    });

    // Recorremos la página para disparar lazy-load y animaciones "al aparecer", y volvemos arriba.
    await page.evaluate(async () => {
      const paso = window.innerHeight * 0.6;
      for (let y = 0; y < document.documentElement.scrollHeight; y += paso) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 180));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 400));
      await document.fonts.ready;
    });
    await page.waitForLoadState('networkidle').catch(() => {});

    const info = await page.evaluate(() => {
      const abs = (el: Element) => el.getBoundingClientRect().top + window.scrollY;
      const hallazgos: {etiqueta: string; y: number}[] = [];
      const buscar = (etiqueta: string, test: (el: Element, texto: string, href: string) => boolean) => {
        const candidatos = Array.from(document.querySelectorAll('a, button, h1, h2, h3, section, [id]'));
        for (const el of candidatos) {
          const href = (el as HTMLAnchorElement).href ?? '';
          const texto = (el.textContent ?? '').trim().slice(0, 200).toLowerCase();
          const idc = ((el.id ?? '') + ' ' + (el.className?.toString() ?? '')).toLowerCase();
          if (test(el, texto + ' ' + idc, href.toLowerCase())) {
            hallazgos.push({etiqueta, y: abs(el)});
            return;
          }
        }
      };
      buscar('Carta', (_e, t) => /carta|men[uú]\b|cat[aá]logo|productos|servicios|precios/.test(t));
      buscar('Ubicación', (_e, t, h) => /maps\.|goo\.gl\/maps|waze\.com|maps\.app/.test(h) || /ubicaci|direcci[oó]n|c[oó]mo llegar/.test(t));
      buscar('WhatsApp', (_e, _t, h) => /wa\.me|api\.whatsapp|whatsapp\.com/.test(h));
      buscar('Instagram', (_e, _t, h) => /instagram\.com/.test(h));
      return {
        titulo: document.title,
        alto: Math.ceil(document.documentElement.scrollHeight),
        hallazgos,
      };
    });

    if (info.alto * escala > MAX_PX) {
      escala = Math.max(1, Math.floor(MAX_PX / info.alto));
      await ctx.close();
      const {page: p2} = await nuevaPagina(navegador, escala);
      await p2.goto(url, {waitUntil: 'networkidle', timeout: 60_000});
      await p2.evaluate(async () => {
        await document.fonts.ready;
        for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 150));
        }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 400));
      });
      return await guardar(p2, dir, c, info, escala);
    }
    return await guardar(page, dir, c, info, escala);
  } finally {
    await navegador.close();
  }
}

async function guardar(
  page: import('playwright').Page,
  dir: string,
  c: Cliente,
  info: {titulo: string; alto: number; hallazgos: {etiqueta: string; y: number}[]},
  escala: number,
): Promise<MetaCaptura> {
  const archivo = path.join(dir, 'hub.png');
  await page.screenshot({path: archivo, fullPage: true, animations: 'disabled'});
  const etiquetas = c.etiquetas?.length
    ? c.etiquetas
    : info.hallazgos.sort((a, b) => a.y - b.y).map((h) => h.etiqueta);
  const meta: MetaCaptura = {
    ancho: VIEWPORT.width * escala,
    alto: info.alto * escala,
    escala,
    titulo: info.titulo,
    etiquetas,
  };
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2));
  return meta;
}

// Ejecución directa: npm run capturar -- <slug>
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const slug = process.argv[2];
  if (!slug) {
    console.error('Uso: npm run capturar -- <slug>');
    process.exit(1);
  }
  const cliente = cargarCliente(slug);
  console.log(`📸 Capturando ${cliente.nombre} (${cliente.hub})…`);
  capturar(cliente)
    .then((m) => console.log(`✔ capturas/${slug}/hub.png  ${m.ancho}x${m.alto}px (x${m.escala})  etiquetas: ${m.etiquetas.join(', ') || '—'}`))
    .catch((e) => { console.error('✖', e.message); process.exit(1); });
}
