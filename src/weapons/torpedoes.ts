import {
  ICoordinates,
  getNeighbouringCellsIncludingDiagonal,
  transformCoordinatesToKey,
  getDistanceBetweenCoordinates,
  getReachableCoordinatesAtDistance,
  IGameMapDimensions,
  ITerrainMap,
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
  const damageMap = getTorpedoSplashDamageMap(detonatedAtCoordinates);
  const damageTaken = damageMap[transformCoordinatesToKey(submarineCoordinates)] || 0;

  return damageTaken;
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
  return getReachableCoordinatesAtDistance({
    coordinates: coordinatesToShootFrom,
    maxDistance: RANGE_TORPEDO,
    gameMapDimensions,
    terrainMap,
  });
};
