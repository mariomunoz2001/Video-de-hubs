# Página de SmartTap

Un solo archivo: `index.html` (más `_headers`, opcional).

## Antes de subir
Abre `index.html`, busca el bloque **CONFIGURA AQUÍ TUS DATOS** (al final) y completa:
- `WHATSAPP` → tu número con código de país, sin `+` (ej. `56912345678`). Mientras esté vacío, los botones de contacto usan el correo.
- `INSTAGRAM` → tu usuario sin `@`. Vacío = el enlace se oculta.

## Subir a Cloudflare
1. Cloudflare → **Workers y Pages → Crear → Pages → Cargar activos (Direct Upload)**.
2. Sube la carpeta `site/` y publica.
3. En el proyecto: **Dominios personalizados → Configurar dominio** y elige el que compraste.

## Probar en local
`npx serve site` (o abrir `index.html` directamente).
