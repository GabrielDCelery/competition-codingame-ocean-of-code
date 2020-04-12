import { EDirection } from './enums';

export const baseVectors = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export const gameDirectionToVectorTransformations = {
  [EDirection.N]: baseVectors.UP,
  [EDirection.S]: baseVectors.DOWN,
  [EDirection.W]: baseVectors.LEFT,
  [EDirection.E]: baseVectors.RIGHT,
};
