# Videos promocionales de hubs · SmartTap

Genera un MP4 vertical (1080×1920, 30 fps, ~16 s) para Reels y WhatsApp a partir de un archivo JSON por cliente.
Escenas: intro con logo → toque NFC → scroll del hub en un celular → cierre con @instagram y firma SmartTap.

## Requisitos (una sola vez)

- **Node.js 18+** y **FFmpeg**. Comprueba con `node -v` y `ffmpeg -version`.
  - Mac: `brew install node ffmpeg`
  - Windows: `winget install OpenJS.NodeJS.LTS Gyan.FFmpeg`
  - Ubuntu/Debian: `sudo apt install ffmpeg` y Node desde https://nodejs.org
- Instalar el proyecto: `npm install` y luego `npx playwright install chromium`

## Agregar un cliente nuevo

1. Crea `clientes/<slug>.json` (el slug es el nombre del archivo, ej. `pizzeria-sur`):

```json
{
  "nombre": "Café Aromo",
  "hub": "https://cafearomo.pages.dev",
  "logo": "logos/cafearomo.png",
  "colorPrincipal": "#6f3b1e",
  "colorSecundario": "#e8a33d",
  "instagram": "cafearomo.cl",
  "frase": "Toda nuestra carta en un toque"
}
```

| Campo | Obligatorio | Notas |
|---|---|---|
| `nombre` | sí | Nombre del negocio |
| `hub` | sí | URL del hub o ruta a un HTML local (ej. `hubs/ejemplo.html`) |
| `colorPrincipal`, `colorSecundario` | sí | Formato `#rrggbb` |
| `instagram` | sí | Con o sin `@` |
| `logo` | no | PNG/SVG/JPG. Sin logo se usa el nombre en grande |
| `frase` | no | Por defecto: "Todo en un solo toque" |
| `etiquetas` | no | Ej. `["Carta","WhatsApp"]`. Si lo omites se detectan solas (Carta, Ubicación, WhatsApp, Instagram) mirando los links del hub |
| `musica` | no | Archivo dentro de `musica/`. Si lo omites se usa el primero que haya; `false` = sin música |

2. Genera el video:

```bash
npm run capturar -- <slug>   # captura el hub → capturas/<slug>/
npm run render -- <slug>     # → salida/<slug>.mp4  y  salida/<slug>-whatsapp.mp4 (< 16 MB)
npm run todos                # captura + render de todos los clientes de /clientes
```

Para ver y ajustar la animación en vivo: `npm run estudio -- <slug>` (después de capturar).

## Música

Deja un `.mp3`/`.m4a`/`.wav` con licencia libre en `musica/`. Entra con fade-in de 1,2 s y sale con fade-out. Sin música, el video queda en silencio.

## Cómo funciona la captura

Playwright abre el hub en un celular simulado (390×844, escala ×3), espera fuentes e imágenes, recorre la página para activar lazy-load y toma **una imagen de página completa**. Remotion anima el scroll sobre esa imagen. Se eligió esto en vez de grabar video porque el scroll queda exacto cuadro a cuadro (sin tirones ni compresión doble) y se puede ajustar la velocidad sin volver a capturar. Si el hub es muy largo, la escala baja sola (×2, ×1) para no superar el límite de Chromium (~16.000 px).

## Márgenes seguros

Todo el texto importante queda entre el 15 % superior y el 15 % inferior (y 72 px laterales). Constantes en `src/theme.ts`.

## Estructura

```
clientes/  hubs/  logos/  musica/     ← tus datos
capturas/<slug>/                      ← hub.png + meta.json (generado)
salida/                               ← MP4 finales (generado)
src/                                  ← plantilla Remotion (escenas en src/scenes)
scripts/                              ← capturar, render, todos, estudio
```

## Videos de producto (hamburguesa, postre, etc.)

Plantilla "producto estrella" (13 s, 1080×1920): llama de marca, producto flotando, ingredientes con flechas, precio, mascota y datos del local.

```bash
npm run producto -- <slug>              # lee productos/<slug>.json → salida/<slug>.mp4 y -whatsapp.mp4
npm run producto -- <slug> --frame=150  # un solo fotograma en .tmp/ para revisar rápido
```

Ejemplo: `productos/laonce-clasic.json`. Necesita un recorte PNG del producto con fondo transparente (`imagen`) y, opcionalmente, una mascota (`mascota`). Los `callouts` indican qué ingrediente señalar (`lado` L/R, posición `y` de la etiqueta y `objetivo` [x, y] en el video).
