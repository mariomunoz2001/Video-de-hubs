import {execFileSync, spawnSync} from 'node:child_process';
import fs from 'node:fs';

export function hayFfmpeg(): boolean {
  return spawnSync('ffmpeg', ['-version']).status === 0;
}

const MB = 1024 * 1024;

/**
 * Crea una versión H.264/AAC que pese menos de `limiteMB`. Parte de una calidad alta
 * y la baja de a poco hasta entrar en el límite.
 */
export function comprimirParaWhatsApp(entrada: string, salida: string, limiteMB = 15.5): number {
  if (!hayFfmpeg()) throw new Error('FFmpeg no está instalado (ver README: "Requisitos").');
  const intentos = [
    {crf: 21, maxrate: '6M', alto: 1920},
    {crf: 24, maxrate: '5M', alto: 1920},
    {crf: 27, maxrate: '3500k', alto: 1920},
    {crf: 29, maxrate: '2500k', alto: 1280},
    {crf: 32, maxrate: '1500k', alto: 1280},
  ];
  let tam = Infinity;
  for (const i of intentos) {
    execFileSync(
      'ffmpeg',
      [
        '-y', '-loglevel', 'error', '-i', entrada,
        '-vf', `scale=-2:${i.alto}`,
        '-c:v', 'libx264', '-profile:v', 'high', '-level', '4.1', '-pix_fmt', 'yuv420p', '-preset', 'slow',
        '-crf', String(i.crf), '-maxrate', i.maxrate, '-bufsize', String(parseInt(i.maxrate) * 2) + (i.maxrate.endsWith('k') ? 'k' : 'M'),
        '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart',
        salida,
      ],
      {stdio: 'inherit'},
    );
    tam = fs.statSync(salida).size;
    if (tam < limiteMB * MB) return tam;
  }
  throw new Error(`No se logró bajar de ${limiteMB} MB (quedó en ${(tam / MB).toFixed(1)} MB)`);
}
