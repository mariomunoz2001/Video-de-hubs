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
