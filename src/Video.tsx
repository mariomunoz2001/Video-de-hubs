import React from 'react';
import {Audio, interpolate, Sequence, staticFile, useVideoConfig} from 'remotion';
import {Escena} from './components/Escena';
import {Cierre} from './scenes/Cierre';
import {Hub} from './scenes/Hub';
import {Intro} from './scenes/Intro';
import {ToqueNFC} from './scenes/ToqueNFC';
import {cargarFuentes, ESCENAS, SOLAPE} from './theme';
import type {PromoProps} from './types';

export const Video: React.FC<PromoProps> = (props) => {
  cargarFuentes();
  const {durationInFrames, fps} = useVideoConfig();

  const inicios = {
    intro: 0,
    nfc: ESCENAS.intro - SOLAPE,
    hub: ESCENAS.intro + ESCENAS.nfc - 2 * SOLAPE,
    cierre: ESCENAS.intro + ESCENAS.nfc + ESCENAS.hub - 3 * SOLAPE,
  };

  const fade = fps * 1.2;
  return (
    <>
      <Sequence from={inicios.intro} durationInFrames={ESCENAS.intro}>
        <Escena fundido={false}><Intro {...props} /></Escena>
      </Sequence>
      <Sequence from={inicios.nfc} durationInFrames={ESCENAS.nfc}>
        <Escena><ToqueNFC {...props} /></Escena>
      </Sequence>
      <Sequence from={inicios.hub} durationInFrames={ESCENAS.hub}>
        <Escena><Hub {...props} /></Escena>
      </Sequence>
      <Sequence from={inicios.cierre} durationInFrames={ESCENAS.cierre}>
        <Escena><Cierre {...props} /></Escena>
      </Sequence>
      {props.musica && (
        <Audio
          src={staticFile(props.musica)}
          volume={(f) =>
            0.8 * interpolate(f, [0, fade, durationInFrames - fade, durationInFrames], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
          }
        />
      )}
    </>
  );
};
