import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

/** Busca un Chromium ya instalado (el de Playwright) por si Remotion no puede descargar el suyo. */
export function buscarChromium(): string | undefined {
  if (process.env.BROWSER_EXECUTABLE) return process.env.BROWSER_EXECUTABLE;
  try {
    const exe = chromium.executablePath();
    if (fs.existsSync(exe)) return exe;
  } catch {}
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH ?? path.join(process.env.HOME ?? '', '.cache', 'ms-playwright');
  if (!fs.existsSync(base)) return undefined;
  for (const d of fs.readdirSync(base).filter((x) => x.startsWith('chromium-')).sort().reverse()) {
    for (const sub of ['chrome-linux/chrome', 'chrome-linux64/chrome', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium', 'chrome-win/chrome.exe']) {
      const exe = path.join(base, d, sub);
      if (fs.existsSync(exe)) return exe;
    }
  }
  return undefined;
}
