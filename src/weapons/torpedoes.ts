import {
  ICoordinates,
  getNeighbouringCellsIncludingDiagonal,
  transformCoordinatesToKey,
  getDistanceBetweenCoordinates,
  getReachableCoordinatesAtMaxDistance,
  IGameMapDimensions,
  ITerrainMap,
  areCoordinatesTheSame,
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

export const getDamageTakenFromTorpedo = ({
  submarineCoordinates,
  detonatedAtCoordinates,
}: {
  submarineCoordinates: ICoordinates;
  detonatedAtCoordinates: ICoordinates;
}): number => {
  if (2 < getDistanceBetweenCoordinates(submarineCoordinates, detonatedAtCoordinates)) {
    return 0;
  }

  if (areCoordinatesTheSame(submarineCoordinates, detonatedAtCoordinates)) {
    return DAMAGE_TORPEDO;
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
