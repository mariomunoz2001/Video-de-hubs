import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {cargarCliente, DIR_TMP} from './lib/clientes.js';
import {prepararAssets} from './lib/preparar.js';

const slug = process.argv[2];
if (!slug) {
  console.error('Uso: npm run estudio -- <slug>   (requiere haber capturado antes)');
  process.exit(1);
}
const {props, publicDir} = prepararAssets(cargarCliente(slug));
const propsFile = path.join(DIR_TMP, slug, 'props.json');
fs.writeFileSync(propsFile, JSON.stringify(props, null, 2));
spawn('npx', ['remotion', 'studio', 'src/index.ts', `--props=${propsFile}`, `--public-dir=${publicDir}`], {stdio: 'inherit'});
