import { ETerrain } from './enums';
import {
  ICoordinates,
  ITerrainMap,
  IVisitedMap,
  IGameMapDimensions,
  TWalkabilityMatrix,
  IGameMap,
} from './interfaces';
import { transformCoordinatesToKey, getNeighbouringCells } from './common-utils';
import { getCoordinatesReachableByTorpedo } from '../weapons';

export const isTerrainCellWalkable = ({
  coordinates,
  terrainMap,
}: {
  coordinates: ICoordinates;
  terrainMap: ITerrainMap;
}): boolean => {
  const { x, y } = coordinates;

  return terrainMap[x][y] === ETerrain.WATER;
};

export const hasVisitedCellBefore = ({
  coordinates,
  visitedMap,
}: {
  coordinates: ICoordinates;
  visitedMap: IVisitedMap;
}): boolean => {
  const { x, y } = coordinates;

  return visitedMap[x][y] === true;
};

export const createTerrainMap = (gameMapDimensions: IGameMapDimensions): ITerrainMap => {
  const { width, height } = gameMapDimensions;
  const map = new Array(width).fill(null).map(() => new Array(height).fill(null));
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      map[x][y] = ETerrain.WATER;
    }
  }
  return map;
};

export const setTerrainMapCell = ({
  type,
  coordinates,
  terrainMap,
}: {
  type: ETerrain;
  coordinates: ICoordinates;
  terrainMap: ITerrainMap;
}): ITerrainMap => {
  const { x, y } = coordinates;

  terrainMap[x][y] = type;

  return terrainMap;
};

export const initTorpedoReachabilityMatrix = (gameMap: IGameMap): void => {
  const { width, height } = gameMap.dimensions;
  const matrix = new Array(width).fill(null).map(() => new Array(height).fill(null));
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      matrix[x][y] = getCoordinatesReachableByTorpedo({
        coordinatesToShootFrom: { x, y },
        gameMapDimensions: gameMap.dimensions,
        terrainMap: gameMap.terrain,
      });
    }
  }

  gameMap.matrixes.torpedoReachability = matrix;
};

export const createVisitedMap = (gameMapDimensions: IGameMapDimensions): IVisitedMap => {
  const { width, height } = gameMapDimensions;
  return new Array(width).fill(null).map(() => new Array(height).fill(false));
};

export const setCellToVisited = ({
  coordinates,
  visitedMap,
}: {
  coordinates: ICoordinates;
  visitedMap: IVisitedMap;
}): void => {
  const { x, y } = coordinates;
  visitedMap[x][y] = true;
};

export const areCoordinatesWithinBoundaries = ({
  coordinates,
  gameMapDimensions,
}: {
  coordinates: ICoordinates;
  gameMapDimensions: IGameMapDimensions;
}): boolean => {
  const { x, y } = coordinates;
  const { width, height } = gameMapDimensions;
  return -1 < x && x < width && -1 < y && y < height;
};

export const isCellWalkable = ({
  coordinates,
  gameMapDimensions,
  terrainMap,
  visitedMap,
}: {
  coordinates: ICoordinates;
  gameMapDimensions: IGameMapDimensions;
  terrainMap: ITerrainMap;
  visitedMap: IVisitedMap;
}): boolean => {
  return (
    areCoordinatesWithinBoundaries({ coordinates, gameMapDimensions }) === true &&
    isTerrainCellWalkable({ coordinates, terrainMap }) === true &&
    hasVisitedCellBefore({ coordinates, visitedMap }) === false
  );
};

export const isCellValid = ({
  coordinates,
  gameMap,
}: {
  coordinates: ICoordinates;
  gameMap: IGameMap;
}): boolean => {
  return (
    areCoordinatesWithinBoundaries({ coordinates, gameMapDimensions: gameMap.dimensions }) ===
      true && isTerrainCellWalkable({ coordinates, terrainMap: gameMap.terrain }) === true
  );
};

export const getWalkableTerrainCells = ({
  gameMapDimensions,
  terrainMap,
}: {
  gameMapDimensions: IGameMapDimensions;
  terrainMap: ITerrainMap;
}): ICoordinates[] => {
  const coordinatesList: ICoordinates[] = [];
  const { width, height } = gameMapDimensions;

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const coordinates = { x, y };
      if (isTerrainCellWalkable({ coordinates, terrainMap })) {
        coordinatesList.push({ x, y });
      }
    }
  }

  return coordinatesList;
};

export const getWalkableCoordinatesList = ({
  gameMapDimensions,
  terrainMap,
  visitedMap,
}: {
  gameMapDimensions: IGameMapDimensions;
  terrainMap: ITerrainMap;
  visitedMap: IVisitedMap;
}): ICoordinates[] => {
  const coordinatesList: ICoordinates[] = [];
  const { width, height } = gameMapDimensions;

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const coordinates = { x, y };
      if (
        isTerrainCellWalkable({ coordinates, terrainMap }) === true &&
        hasVisitedCellBefore({ coordinates, visitedMap }) === false
      ) {
        coordinatesList.push({ x, y });
      }
    }
  }

  return coordinatesList;
};

export const getSectorForCoordinates = ({
  coordinates,
  gameMapDimensions,
}: {
  coordinates: ICoordinates;
  gameMapDimensions: IGameMapDimensions;
}): number => {
  const { x, y } = coordinates;
  const { width, sectorSize } = gameMapDimensions;
  const numOfSectorsX = width / sectorSize;
  const sectorX = Math.floor(x / sectorSize);
  const sectorY = Math.floor(y / sectorSize);

  return sectorX + 1 + numOfSectorsX * sectorY;
};

export const createWalkabilityMatrix = ({
  currentlyAtCoordinates,
  gameMap,
  visitedMap,
}: {
  currentlyAtCoordinates: ICoordinates;
  gameMap: IGameMap;
  visitedMap: IVisitedMap;
}): TWalkabilityMatrix => {
  const { width, height } = gameMap.dimensions;
  const matrix = new Array(height).fill(null).map(() => new Array(width).fill(null));

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const coordinates = { x, y };

      matrix[x][y] =
        isTerrainCellWalkable({ coordinates, terrainMap: gameMap.terrain }) === true &&
        hasVisitedCellBefore({ coordinates, visitedMap }) === false
          ? true
          : false;
    }
  }

  matrix[currentlyAtCoordinates.x][currentlyAtCoordinates.y] = false;

  return matrix;
};

export const getRegionSize = ({
  size,
  gameMap,
  coordinatesToCalculateFrom,
  walkabilityMatrix,
}: {
  size: number;
  gameMap: IGameMap;
  coordinatesToCalculateFrom: ICoordinates;
  walkabilityMatrix: TWalkabilityMatrix;
}): number => {
  const { x, y } = coordinatesToCalculateFrom;
};

const processCoordinatesForReachibility = ({
  coordinates,
  distance,
  maxDistance,
  reachableCoordinates,
  trackedCellsForReachability,
  gameMapDimensions,
  terrainMap,
}: {
  coordinates: ICoordinates;
  distance: number;
  maxDistance: number;
  reachableCoordinates: ICoordinates[];
  trackedCellsForReachability: { [index: string]: boolean };
  gameMapDimensions: IGameMapDimensions;
  terrainMap: ITerrainMap;
}): void => {
  reachableCoordinates.push(coordinates);
  trackedCellsForReachability[transformCoordinatesToKey(coordinates)] = true;

  if (distance === maxDistance) {
    return;
  }

  getNeighbouringCells(coordinates).forEach(neighbourCoordinates => {
    if (
      !areCoordinatesWithinBoundaries({ coordinates: neighbourCoordinates, gameMapDimensions }) ||
      !isTerrainCellWalkable({ coordinates: neighbourCoordinates, terrainMap }) ||
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
      gameMapDimensions,
      terrainMap,
    });
  });
};

export const getReachableCoordinatesAtMaxDistance = ({
  coordinates,
  maxDistance,
  gameMapDimensions,
  terrainMap,
}: {
  coordinates: ICoordinates;
  maxDistance: number;
  gameMapDimensions: IGameMapDimensions;
  terrainMap: ITerrainMap;
}): ICoordinates[] => {
  if (
    !areCoordinatesWithinBoundaries({ coordinates, gameMapDimensions }) ||
    !isTerrainCellWalkable({ coordinates, terrainMap })
  ) {
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
    gameMapDimensions,
    terrainMap,
  });

  return reachableCoordinates;
};
