import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {SOLAPE} from '../theme';

/** Envuelve una escena y la hace aparecer con un fundido (cubre a la escena anterior). */
export const Escena: React.FC<{fundido?: boolean; children: React.ReactNode}> = ({fundido = true, children}) => {
  const frame = useCurrentFrame();
  const opacity = fundido ? interpolate(frame, [0, SOLAPE], [0, 1], {extrapolateRight: 'clamp'}) : 1;
  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};
