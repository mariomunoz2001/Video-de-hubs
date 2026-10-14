# Página de SmartTap

Un solo archivo: `index.html` (más `_headers`, opcional).

## Antes de subir
- Tu WhatsApp (56945294606) y el correo ya están puestos. Para cambiarlos o agregar tu Instagram, edita el bloque **CONFIGURA AQUÍ TUS DATOS** al final de `index.html`.
- **Videos (opcional):** si copias a `site/media/` los archivos `tarjeta.mp4` y `placa.mp4` (con `tarjeta.jpg` y `placa.jpg` como portada), se muestran en la sección Productos. Si no están, la página muestra las ilustraciones.

## Subir a Cloudflare
1. Cloudflare → **Workers y Pages → Crear → Pages → Cargar activos (Direct Upload)**.
2. Sube la carpeta `site/` y publica.
3. En el proyecto: **Dominios personalizados → Configurar dominio** y elige el que compraste.

## Probar en local
`npx serve site` (o abrir `index.html` directamente).
