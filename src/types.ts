export type HubInfo = {
  /** Ruta de la captura dentro de la carpeta public (staticFile) */
  imagen: string;
  /** Tamaño real de la captura en píxeles */
  ancho: number;
  alto: number;
  /** Etiquetas detectadas (o definidas en el JSON), ordenadas por posición en la página */
  etiquetas: string[];
};

export type PromoProps = {
  nombre: string;
  instagram: string;
  primario: string;
  secundario: string;
  frase: string;
  /** Ruta del logo dentro de public, si existe */
  logo?: string;
  hub: HubInfo;
  /** Ruta de la música dentro de public, si existe */
  musica?: string;
};

export type Callout = {texto: string; lado: 'L' | 'R'; y: number; objetivo: [number, number]};

/** Video de un producto estrella (hamburguesa, postre, etc.) */
export type ProductoProps = {
  marca: string;
  producto: string;
  tagline: string;
  precio: string;
  notaPrecio?: string;
  imagen: string; // recorte PNG con transparencia (en public)
  mascota?: string;
  colores: {principal: string; acento: string; claro: string; suave: string};
  callouts: Callout[];
  instagram: string;
  direccion: string;
  horario?: string;
  musica?: string;
};
