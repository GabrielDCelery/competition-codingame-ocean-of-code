import { ICoordinates, TWalkabilityMatrix, IGameMap } from './interfaces';
import { transformCoordinatesToKey, getNeighbouringCells } from './common-utils';
import { getCoordinatesReachableByTorpedo } from '../weapons';

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
  return JSON.parse(JSON.stringify(gameMap.walkabilityMatrix));
};

export const cloneWalkabilityMatrix = (
  walkabilityMatrix: TWalkabilityMatrix
): TWalkabilityMatrix => {
  return JSON.parse(JSON.stringify(walkabilityMatrix));
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

export const initTorpedoReachabilityMatrix = (gameMap: IGameMap): void => {
  const { width, height } = gameMap;
  const matrix = new Array(width).fill(null).map(() => new Array(height).fill(null));
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      matrix[x][y] = getCoordinatesReachableByTorpedo({
        coordinatesToShootFrom: { x, y },
        gameMap,
      });
    }
  }

  gameMap.matrixes.torpedoReachability = matrix;
};

export const initTorpedoReachabilityMapMatrix = (gameMap: IGameMap): void => {
  const { width, height } = gameMap;
  const matrix = new Array(width).fill(null).map(() => new Array(height).fill(null));
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const map: { [index: string]: boolean } = {};

      getCoordinatesReachableByTorpedo({
        coordinatesToShootFrom: { x, y },
        gameMap,
      }).forEach(coordinates => {
        map[transformCoordinatesToKey(coordinates)] = true;
      });

      matrix[x][y] = map;
    }
  }

  gameMap.matrixes.torpedoReachabilityMap = matrix;
};
