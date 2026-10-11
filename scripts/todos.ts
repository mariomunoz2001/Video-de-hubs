import {capturar} from './capturar.js';
import {cargarCliente, listarSlugs} from './lib/clientes.js';
import {renderizar} from './render.js';

const slugs = listarSlugs();
if (!slugs.length) {
  console.error('No hay clientes en /clientes');
  process.exit(1);
}

const fallos: string[] = [];
for (const slug of slugs) {
  console.log(`\n━━━ ${slug} ━━━`);
  try {
    const c = cargarCliente(slug);
    const m = await capturar(c);
    console.log(`✔ captura ${m.ancho}x${m.alto}px · etiquetas: ${m.etiquetas.join(', ') || '—'}`);
    await renderizar(slug);
  } catch (e) {
    console.error(`✖ ${slug}: ${(e as Error).message}`);
    fallos.push(slug);
  }
}
console.log(`\nListo: ${slugs.length - fallos.length}/${slugs.length} videos.` + (fallos.length ? ` Fallaron: ${fallos.join(', ')}` : ''));
process.exit(fallos.length ? 1 : 0);
