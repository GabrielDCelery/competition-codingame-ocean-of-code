import {
  ICoordinates,
  getNeighbouringCellsIncludingDiagonal,
  transformCoordinatesToKey,
  getDistanceBetweenCoordinates,
  getReachableCoordinatesAtMaxDistance,
  IGameMapDimensions,
  ITerrainMap,
  areCoordinatesTheSame,
  IGameMap,
} from '../maps';
import { DAMAGE_TORPEDO, RANGE_TORPEDO } from '../constants';

export const getTorpedoSplashDamageMap = (
  detonatedAtCoordinates: ICoordinates
): { [index: string]: number } => {
  const map: { [index: string]: number } = {};

  map[transformCoordinatesToKey(detonatedAtCoordinates)] = DAMAGE_TORPEDO;

  getNeighbouringCellsIncludingDiagonal(detonatedAtCoordinates).map(coordinates => {
    map[transformCoordinatesToKey(coordinates)] = DAMAGE_TORPEDO / 2;
  });

  return map;
};

export const areCoordinatesReachableByTorpedo = (
  source: ICoordinates,
  target: ICoordinates
): boolean => {
  return getDistanceBetweenCoordinates(source, target) <= RANGE_TORPEDO;
};

export const canTorpedoDirectlyHitTheTarget = ({
  source,
  target,
  gameMap,
}: {
  source: ICoordinates;
  target: ICoordinates;
  gameMap: IGameMap;
}): boolean => {
  return (
    gameMap.matrixes.torpedoReachabilityMap[source.x][source.y][
      transformCoordinatesToKey(target)
    ] === true
  );
};

export const canTorpedoSplashDamageTheTarget = ({
  source,
  target,
  gameMap,
}: {
  source: ICoordinates;
  target: ICoordinates;
  gameMap: IGameMap;
}): boolean => {
  const reachabilityMap = gameMap.matrixes.torpedoReachabilityMap[source.x][source.y];
  const neighbouringCells = getNeighbouringCellsIncludingDiagonal(target);

  for (let i = 0, iMax = neighbouringCells.length; i < iMax; i++) {
    if (reachabilityMap[transformCoordinatesToKey(neighbouringCells[i])] === true) {
      return true;
    }
  }

  return false;
};

export const getDamageTakenFromTorpedo = ({
  submarineCoordinates,
  detonatedAtCoordinates,
}: {
  submarineCoordinates: ICoordinates;
  detonatedAtCoordinates: ICoordinates;
}): number => {
  if (areCoordinatesTheSame(submarineCoordinates, detonatedAtCoordinates)) {
    return DAMAGE_TORPEDO;
  }
  if (2 < getDistanceBetweenCoordinates(submarineCoordinates, detonatedAtCoordinates)) {
    return 0;
  }
  const splashCoordinatesList = getNeighbouringCellsIncludingDiagonal(detonatedAtCoordinates);
  for (let i = 0, iMax = splashCoordinatesList.length; i < iMax; i++) {
    if (areCoordinatesTheSame(submarineCoordinates, splashCoordinatesList[i])) {
      return DAMAGE_TORPEDO / 2;
    }
  }
  return 0;
};

export const getCoordinatesReachableByTorpedo = ({
  coordinatesToShootFrom,
  gameMapDimensions,
  terrainMap,
}: {
  coordinatesToShootFrom: ICoordinates;
  gameMapDimensions: IGameMapDimensions;
  terrainMap: ITerrainMap;
}): ICoordinates[] => {
  return getReachableCoordinatesAtMaxDistance({
    coordinates: coordinatesToShootFrom,
    maxDistance: RANGE_TORPEDO,
    gameMapDimensions,
    terrainMap,
  });
};
