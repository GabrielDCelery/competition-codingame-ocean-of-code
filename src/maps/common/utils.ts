import { EDirection } from './enums';
import { ICoordinates, IVector } from './interfaces';

const vectors = {
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

export const uTransformDirectionToVector = (direction: EDirection): IVector => {
  return directionToVectorTransformations[direction];
};

export const uTransformVectorToDirection = ({ x, y }: IVector): EDirection => {
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

export const uAreCoordinatesTheSame = (source: ICoordinates, target: ICoordinates): boolean => {
  return source.x === target.x && source.y === target.y;
};

export const uMultiplyVector = ({
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

export const uAddVectorToCoordinates = ({
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

export const uCreateVectorFromCoordinates = ({
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

export const uGetDistanceBetweenCoordinates = (
  source: ICoordinates,
  target: ICoordinates
): number => {
  const distX = Math.abs(source.x - target.x);
  const distY = Math.abs(source.y - target.y);

  return distX + distY;
};

export const uGetNeighbouringCells = (coordinates: ICoordinates): ICoordinates[] => {
  const { UP, DOWN, LEFT, RIGHT } = vectors;
  return [
    uAddVectorToCoordinates({ coordinates, vector: UP }),
    uAddVectorToCoordinates({ coordinates, vector: DOWN }),
    uAddVectorToCoordinates({ coordinates, vector: LEFT }),
    uAddVectorToCoordinates({ coordinates, vector: RIGHT }),
  ];
};

export const uGetNeighbouringCellsIncludingDiagonal = (
  coordinates: ICoordinates
): ICoordinates[] => {
  const { UP, DOWN, LEFT, RIGHT } = vectors;
  const coordinatesUp = uAddVectorToCoordinates({ coordinates, vector: UP });
  const coordinatesDown = uAddVectorToCoordinates({ coordinates, vector: DOWN });
  return [
    coordinatesUp,
    uAddVectorToCoordinates({ coordinates: coordinatesUp, vector: LEFT }),
    uAddVectorToCoordinates({ coordinates: coordinatesUp, vector: RIGHT }),
    coordinatesDown,
    uAddVectorToCoordinates({ coordinates: coordinatesDown, vector: LEFT }),
    uAddVectorToCoordinates({ coordinates: coordinatesDown, vector: RIGHT }),
    uAddVectorToCoordinates({ coordinates, vector: LEFT }),
    uAddVectorToCoordinates({ coordinates, vector: RIGHT }),
  ];
};

export const uTransformCoordinatesToKey = ({ x, y }: ICoordinates): string => {
  return `${x}_${y}`;
};

export const uTransformKeyToCoordinates = (key: string): ICoordinates => {
  const [x, y] = key.split('_').map(elem => parseInt(elem, 10));

  return { x, y };
};

export const uIsCoordinatesInCoordinatesList = (
  coordinates: ICoordinates,
  coordinatesList: ICoordinates[]
): boolean => {
  for (let i = 0, iMax = coordinatesList.length; i < iMax; i++) {
    if (coordinates.x === coordinatesList[i].x && coordinates.y === coordinatesList[i].y) {
      return true;
    }
  }

  return false;
};

export const uGetCoordinatesAtSpecificDistance = ({
  coordinates,
  distance,
}: {
  coordinates: ICoordinates;
  distance: number;
}): ICoordinates[] => {
  const { x, y } = coordinates;
  const cellsAtDistance: ICoordinates[] = [];

  for (let offsetX = -Math.abs(distance), offsetXMax = distance; offsetX <= offsetXMax; offsetX++) {
    for (
      let offsetY = -Math.abs(distance), offsetYMax = distance;
      offsetY <= offsetYMax;
      offsetY++
    ) {
      if (Math.abs(offsetX) + Math.abs(offsetY) === distance) {
        cellsAtDistance.push({ x: x + offsetX, y: y + offsetY });
      }
    }
  }

  return cellsAtDistance;
};
