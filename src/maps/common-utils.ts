import { EDirection, ETerrain } from './enums';
import { ICoordinates, IVector } from './interfaces';

export const vectors = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

const directionToVectorTransformations = {
  [EDirection.N]: vectors.UP,
  [EDirection.S]: vectors.DOWN,
  [EDirection.W]: vectors.LEFT,
  [EDirection.E]: vectors.RIGHT,
};

export const transformGameInputToTerrain = (gameInput: string): ETerrain => {
  if (gameInput === '.') {
    return ETerrain.WATER;
  }

  if (gameInput === 'x') {
    return ETerrain.ISLAND;
  }

  throw new Error(`Cannot process game input -> ${gameInput}`);
};

export const transformDirectionToVector = (direction: EDirection): IVector => {
  return directionToVectorTransformations[direction];
};

export const transformVectorToDirection = ({ x, y }: IVector): EDirection => {
  if (x === vectors.UP.x && y === vectors.UP.y) {
    return EDirection.N;
  }

  if (x === vectors.DOWN.x && y === vectors.DOWN.y) {
    return EDirection.S;
  }

  if (x === vectors.LEFT.x && y === vectors.LEFT.y) {
    return EDirection.W;
  }

  if (x === vectors.RIGHT.x && y === vectors.RIGHT.y) {
    return EDirection.E;
  }

  throw new Error(`Invalid vector transformation -> ${{ x, y }}`);
};

export const areCoordinatesTheSame = (source: ICoordinates, target: ICoordinates): boolean => {
  return source.x === target.x && source.y === target.y;
};

export const multiplyVector = ({
  vector,
  amount,
}: {
  vector: IVector;
  amount: number;
}): IVector => {
  const { x, y } = vector;
  return {
    x: x * amount,
    y: y * amount,
  };
};

export const addVectorToCoordinates = ({
  coordinates,
  vector,
}: {
  coordinates: ICoordinates;
  vector: IVector;
}): ICoordinates => {
  return {
    x: coordinates.x + vector.x,
    y: coordinates.y + vector.y,
  };
};

export const createVectorFromCoordinates = ({
  source,
  target,
}: {
  source: ICoordinates;
  target: ICoordinates;
}): IVector => {
  return {
    x: target.x - source.x,
    y: target.y - source.y,
  };
};

export const getDistanceBetweenCoordinates = (
  source: ICoordinates,
  target: ICoordinates
): number => {
  const distX = Math.abs(source.x - target.x);
  const distY = Math.abs(source.y - target.y);

  return distX + distY;
};

export const getNeighbouringCells = (coordinates: ICoordinates): ICoordinates[] => {
  const { UP, DOWN, LEFT, RIGHT } = vectors;
  return [
    addVectorToCoordinates({ coordinates, vector: UP }),
    addVectorToCoordinates({ coordinates, vector: DOWN }),
    addVectorToCoordinates({ coordinates, vector: LEFT }),
    addVectorToCoordinates({ coordinates, vector: RIGHT }),
  ];
};

export const getNeighbouringCellsIncludingDiagonal = (
  coordinates: ICoordinates
): ICoordinates[] => {
  const { UP, DOWN, LEFT, RIGHT } = vectors;
  const coordinatesUp = addVectorToCoordinates({ coordinates, vector: UP });
  const coordinatesDown = addVectorToCoordinates({ coordinates, vector: DOWN });
  return [
    coordinatesUp,
    addVectorToCoordinates({ coordinates: coordinatesUp, vector: LEFT }),
    addVectorToCoordinates({ coordinates: coordinatesUp, vector: RIGHT }),
    coordinatesDown,
    addVectorToCoordinates({ coordinates: coordinatesDown, vector: LEFT }),
    addVectorToCoordinates({ coordinates: coordinatesDown, vector: RIGHT }),
    addVectorToCoordinates({ coordinates, vector: LEFT }),
    addVectorToCoordinates({ coordinates, vector: RIGHT }),
  ];
};

export const transformCoordinatesToKey = ({ x, y }: ICoordinates): string => {
  return `${x}_${y}`;
};

export const transformKeyToCoordinates = (key: string): ICoordinates => {
  const [x, y] = key.split('_').map(elem => parseInt(elem, 10));

  return { x, y };
};
