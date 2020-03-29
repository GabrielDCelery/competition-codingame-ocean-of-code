import { ETerrain } from './enums';
import {
  ICoordinates,
  ITerrainMap,
  IVisitedMap,
  IGameMapDimensions,
  TWalkabilityMatrix,
} from './interfaces';

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

export const getPathFindingWalkabilityMatrix = ({
  gameMapDimensions,
  terrainMap,
  visitedMap,
}: {
  gameMapDimensions: IGameMapDimensions;
  terrainMap: ITerrainMap;
  visitedMap: IVisitedMap;
}): TWalkabilityMatrix => {
  const { width, height } = gameMapDimensions;
  const matrix = new Array(height).fill(null).map(() => new Array(width).fill(null));

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const coordinates = { x, y };
      matrix[y][x] =
        isTerrainCellWalkable({ coordinates, terrainMap }) === true &&
        hasVisitedCellBefore({ coordinates, visitedMap }) === false
          ? 0
          : 1;
    }
  }

  return matrix;
};

const isOffsetAtDistance = ({
  offsetX,
  offsetY,
  distance,
}: {
  offsetX: number;
  offsetY: number;
  distance: number;
}): boolean => {
  return Math.abs(offsetX) + Math.abs(offsetY) === distance;
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
  const cellsAtDistance = [];
  const { x, y } = coordinates;

  for (let distance = 0; distance <= maxDistance; distance++) {
    for (
      let offsetX = -Math.abs(distance), offsetXMax = distance;
      offsetX <= offsetXMax;
      offsetX++
    ) {
      for (
        let offsetY = -Math.abs(distance), offsetYMax = distance;
        offsetY <= offsetYMax;
        offsetY++
      ) {
        const offSettedCoordinates = { x: x + offsetX, y: y + offsetY };
        if (
          isOffsetAtDistance({ offsetX, offsetY, distance }) === true &&
          areCoordinatesWithinBoundaries({
            coordinates: offSettedCoordinates,
            gameMapDimensions,
          }) === true &&
          isTerrainCellWalkable({ coordinates, terrainMap }) === true
        ) {
          cellsAtDistance.push(offSettedCoordinates);
        }
      }
    }
  }
  return cellsAtDistance;
};
