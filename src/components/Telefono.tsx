import React from 'react';

export const TEL_ANCHO = 612;
export const TEL_ALTO = 1276;
export const MARCO = 16;
export const PANTALLA_ANCHO = TEL_ANCHO - MARCO * 2;
export const PANTALLA_ALTO = TEL_ALTO - MARCO * 2;

/** Mockup de celular moderno (bordes finos, isla dinámica). Los hijos van dentro de la pantalla. */
export const Telefono: React.FC<{
  children?: React.ReactNode;
  pantallaEncendida?: number; // 0..1, para la escena NFC
  style?: React.CSSProperties;
}> = ({children, pantallaEncendida = 1, style}) => (
  <div
    style={{
      width: TEL_ANCHO,
      height: TEL_ALTO,
      borderRadius: 96,
      padding: MARCO,
      background: 'linear-gradient(145deg,#3a3d44,#0f1013 45%,#2a2c32)',
      boxShadow: '0 60px 120px rgba(0,0,0,.45), 0 0 0 2px #50545c inset, 0 0 0 1px rgba(0,0,0,.6)',
      position: 'relative',
      ...style,
    }}
  >
    {/* botones laterales */}
    <div style={{position: 'absolute', right: -5, top: 300, width: 6, height: 150, borderRadius: 4, background: '#2a2c32'}} />
    <div style={{position: 'absolute', left: -5, top: 240, width: 6, height: 90, borderRadius: 4, background: '#2a2c32'}} />
    <div style={{position: 'absolute', left: -5, top: 360, width: 6, height: 90, borderRadius: 4, background: '#2a2c32'}} />
    <div
      style={{
        width: PANTALLA_ANCHO,
        height: PANTALLA_ALTO,
        borderRadius: 80,
        overflow: 'hidden',
        background: '#050506',
        position: 'relative',
      }}
    >
      <div style={{position: 'absolute', inset: 0, opacity: pantallaEncendida}}>{children}</div>
      {/* isla dinámica */}
      <div style={{position: 'absolute', top: 22, left: '50%', transform: 'translateX(-50%)', width: 150, height: 42, borderRadius: 24, background: '#000', zIndex: 5}} />
      {/* brillo */}
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(115deg,rgba(255,255,255,.10),rgba(255,255,255,0) 35%)', pointerEvents: 'none', zIndex: 6}} />
    </div>
  </div>
);
