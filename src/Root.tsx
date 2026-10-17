import React from 'react';
import {Composition} from 'remotion';
import {Video} from './Video';
import {DURACION_TOTAL, FPS, HEIGHT, WIDTH} from './theme';
import {DURACION_PRODUCTO, Producto} from './producto/Producto';
import type {ProductoProps, PromoProps} from './types';

// Valores de ejemplo solo para abrir la plantilla sin props. El render real los recibe desde scripts/render.ts.
const ejemplo: PromoProps = {
  nombre: 'Tu Negocio',
  instagram: 'tunegocio',
  primario: '#1f3a5f',
  secundario: '#f2a541',
  frase: 'Todo en un solo toque',
  hub: {imagen: 'ejemplo/hub.png', ancho: 1170, alto: 5000, etiquetas: ['Carta', 'Ubicación', 'WhatsApp', 'Instagram']},
};

const ejemploProducto: ProductoProps = {
  marca: 'Tu Marca', producto: 'Producto', tagline: 'Sabor a tu ritmo', precio: '$0',
  colores: {principal: '#0A2472', acento: '#F4A900', claro: '#FDFCF9', suave: '#7189C4'},
  callouts: [], instagram: 'tumarca', direccion: 'Tu dirección',
};

export const Root: React.FC = () => (
  <>
  <Composition
    id="Promo"
    component={Video}
    width={WIDTH}
    height={HEIGHT}
    fps={FPS}
    durationInFrames={DURACION_TOTAL}
    defaultProps={ejemplo}
  />
  <Composition id="Producto" component={Producto} width={WIDTH} height={HEIGHT} fps={FPS} durationInFrames={DURACION_PRODUCTO} defaultProps={ejemploProducto} />
  </>
);
