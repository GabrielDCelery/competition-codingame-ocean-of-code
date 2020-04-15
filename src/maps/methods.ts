import { ICoordinates, TWalkabilityMatrix, IGameMap, IVector } from './interfaces';
import { EDirection, ETerrain } from './enums';
import { baseVectors, gameDirectionToVectorTransformations } from './configs';

export const isTerrainWater = (terrain: ETerrain): boolean => {
  return terrain === ETerrain.WATER;
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
  return gameDirectionToVectorTransformations[direction];
};

export const transformVectorToDirection = ({ x, y }: IVector): EDirection => {
  if (x === baseVectors.UP.x && y === baseVectors.UP.y) {
    return EDirection.N;
  }

  if (x === baseVectors.DOWN.x && y === baseVectors.DOWN.y) {
    return EDirection.S;
  }

  if (x === baseVectors.LEFT.x && y === baseVectors.LEFT.y) {
    return EDirection.W;
  }

  if (x === baseVectors.RIGHT.x && y === baseVectors.RIGHT.y) {
    return EDirection.E;
  }

  throw new Error(`Invalid vector transformation -> ${{ x, y }}`);
};

export const areCoordinatesTheSame = (source: ICoordinates, target: ICoordinates): boolean => {
  return source.x === target.x && source.y === target.y;
};

export const isCoordinatesInCoordinatesList = ({
  coordinatesList,
  coordinates,
}: {
  coordinatesList: ICoordinates[];
  coordinates: ICoordinates;
}): boolean => {
  for (let i = 0, iMax = coordinatesList.length; i < iMax; i++) {
    if (areCoordinatesTheSame(coordinates, coordinatesList[i])) {
      return true;
    }
  }

  return false;
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
  const { UP, DOWN, LEFT, RIGHT } = baseVectors;
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
  const { UP, DOWN, LEFT, RIGHT } = baseVectors;
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

export const createBlankWalkabilityMatrix = ({
  width,
  height,
}: {
  width: number;
  height: number;
}): TWalkabilityMatrix => {
  return new Array(width).fill(null).map(() => new Array(height).fill(true));
};

export const createTerrainWalkabilityMatrix = (gameMap: IGameMap): TWalkabilityMatrix => {
  return gameMap.walkabilityMatrix.map(e => e.slice(0));
};

export const cloneWalkabilityMatrix = (
  walkabilityMatrix: TWalkabilityMatrix
): TWalkabilityMatrix => {
  return walkabilityMatrix.map(e => e.slice(0));
};

const combineWalkabilityMatrixesAtCoordinates = (
  coordinates: ICoordinates,
  matrixes: TWalkabilityMatrix[]
): boolean => {
  const { x, y } = coordinates;
  for (let i = 0, iMax = matrixes.length; i < iMax; i++) {
    if (matrixes[i][x][y] === false) {
      return false;
    }
  }
  return true;
};

export const combineWalkabilityMatrixes = (matrixes: TWalkabilityMatrix[]): TWalkabilityMatrix => {
  const width = matrixes[0].length;
  const height = matrixes[0][0].length;
  const combinedMatrix = createBlankWalkabilityMatrix({ width, height });

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      combinedMatrix[x][y] = combineWalkabilityMatrixesAtCoordinates({ x, y }, matrixes);
    }
  }

  return combinedMatrix;
};

const transposeWalkabilityMatrixesAtCoordinates = (
  coordinates: ICoordinates,
  matrixes: TWalkabilityMatrix[]
): boolean => {
  const { x, y } = coordinates;
  for (let i = 0, iMax = matrixes.length; i < iMax; i++) {
    if (matrixes[i][x][y] === true) {
      return true;
    }
  }
  return false;
};

export const transposeWalkabilityMatrixes = (
  matrixes: TWalkabilityMatrix[]
): TWalkabilityMatrix => {
  const width = matrixes[0].length;
  const height = matrixes[0][0].length;
  const transposedMatrix = createBlankWalkabilityMatrix({ width, height });

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      transposedMatrix[x][y] = transposeWalkabilityMatrixesAtCoordinates({ x, y }, matrixes);
    }
  }

  return transposedMatrix;
};

export const areCoordinatesWalkable = ({
  coordinates,
  walkabilityMatrix,
}: {
  coordinates: ICoordinates;
  walkabilityMatrix: TWalkabilityMatrix;
}): boolean => {
  const { x, y } = coordinates;
  const column = walkabilityMatrix[x];

  if (column === undefined) {
    return false;
  }

  return column[y] === true;
};

export const getWalkableCoordinates = (walkabilityMatrix: TWalkabilityMatrix): ICoordinates[] => {
  const coordinatesList: ICoordinates[] = [];
  const width = walkabilityMatrix.length;
  const height = walkabilityMatrix[0].length;

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (walkabilityMatrix[x][y] === true) {
        coordinatesList.push({ x, y });
      }
    }
  }

  return coordinatesList;
};

export const getSectorForCoordinates = ({
  coordinates,
  gameMap,
}: {
  coordinates: ICoordinates;
  gameMap: IGameMap;
}): number => {
  const { x, y } = coordinates;
  const { width, sectorSize } = gameMap;
  const numOfSectorsX = width / sectorSize;
  const sectorX = Math.floor(x / sectorSize);
  const sectorY = Math.floor(y / sectorSize);

  return sectorX + 1 + numOfSectorsX * sectorY;
};

export const getRegionSize = ({
  coordinatesToCalculateFrom,
  walkabilityMatrix,
}: {
  coordinatesToCalculateFrom: ICoordinates;
  walkabilityMatrix: TWalkabilityMatrix;
}): number => {
  const { x, y } = coordinatesToCalculateFrom;
  if (!areCoordinatesWalkable({ coordinates: { x, y }, walkabilityMatrix })) {
    return 0;
  }
  walkabilityMatrix[x][y] = false;
  let size = 1;

  getNeighbouringCells({ x, y }).forEach(neighbouringCell => {
    size += getRegionSize({
      walkabilityMatrix,
      coordinatesToCalculateFrom: neighbouringCell,
    });
  });

  return size;
};

const processCoordinatesForReachibility = ({
  coordinates,
  distance,
  maxDistance,
  reachableCoordinates,
  trackedCellsForReachability,
  walkabilityMatrix,
}: {
  coordinates: ICoordinates;
  distance: number;
  maxDistance: number;
  reachableCoordinates: ICoordinates[];
  trackedCellsForReachability: { [index: string]: boolean };
  walkabilityMatrix: TWalkabilityMatrix;
}): void => {
  reachableCoordinates.push(coordinates);
  trackedCellsForReachability[transformCoordinatesToKey(coordinates)] = true;

  if (distance === maxDistance) {
    return;
  }

  getNeighbouringCells(coordinates).forEach(neighbourCoordinates => {
    if (
      !areCoordinatesWalkable({ coordinates: neighbourCoordinates, walkabilityMatrix }) ||
      trackedCellsForReachability[transformCoordinatesToKey(neighbourCoordinates)]
    ) {
      return;
    }

    return processCoordinatesForReachibility({
      coordinates: neighbourCoordinates,
      distance: distance + 1,
      maxDistance,
      reachableCoordinates,
      trackedCellsForReachability,
      walkabilityMatrix,
    });
  });
};

export const getReachableCoordinatesAtMaxDistance = ({
  coordinates,
  maxDistance,
  walkabilityMatrix,
}: {
  coordinates: ICoordinates;
  maxDistance: number;
  walkabilityMatrix: TWalkabilityMatrix;
}): ICoordinates[] => {
  if (!areCoordinatesWalkable({ coordinates, walkabilityMatrix })) {
    return [];
  }

  const reachableCoordinates: ICoordinates[] = [];
  const trackedCellsForReachability: { [index: string]: boolean } = {};

  processCoordinatesForReachibility({
    coordinates,
    distance: 0,
    maxDistance,
    reachableCoordinates,
    trackedCellsForReachability,
    walkabilityMatrix,
  });

  return reachableCoordinates;
};

export const getListOfCoordinatesBetweenCoordinatesConnectedByStraightLine = ({
  source,
  target,
}: {
  source: ICoordinates;
  target: ICoordinates;
}): ICoordinates[] => {
  const diffX = target.x - source.x;
  const diffY = target.y - source.y;
  const vectorX = 0 <= diffX ? baseVectors.RIGHT : baseVectors.LEFT;
  const vectorY = 0 <= diffY ? baseVectors.DOWN : baseVectors.UP;

  const diffToUse = diffX === 0 ? Math.abs(diffY) : Math.abs(diffX);
  const vector = diffX === 0 ? vectorY : vectorX;

  const listOfCoordinates: ICoordinates[] = [];

  for (let amount = 0; amount <= diffToUse; amount++) {
    listOfCoordinates.push(
      addVectorToCoordinates({
        coordinates: source,
        vector: multiplyVector({ amount, vector }),
      })
    );
  }

  return listOfCoordinates;
};

export const getOpenRegionSize = ({
  result = { count: 0, threat: 0 },
  maxSize,
  coordinatesToCalculateFrom,
  walkabilityMatrix,
  gameMap,
}: {
  result?: { count: number; threat: number };
  maxSize: number;
  coordinatesToCalculateFrom: ICoordinates;
  walkabilityMatrix: TWalkabilityMatrix;
  gameMap: IGameMap;
}): { count: number; threat: number } => {
  if (maxSize <= result.count) {
    return result;
  }
  result.count += 1;
  const { x, y } = coordinatesToCalculateFrom;
  result.threat += gameMap.cache.mineDirectDamageProbabilityMatrix[x][y];
  result.threat += gameMap.cache.mineSplashDamageProbabilityMatrix[x][y];
  walkabilityMatrix[x][y] = false;
  getNeighbouringCells({ x, y }).forEach(neighbouringCell => {
    if (!areCoordinatesWalkable({ coordinates: neighbouringCell, walkabilityMatrix })) {
      return;
    }

    getOpenRegionSize({
      result,
      maxSize,
      walkabilityMatrix,
      coordinatesToCalculateFrom: neighbouringCell,
      gameMap,
    });
  });

  return result;
};
