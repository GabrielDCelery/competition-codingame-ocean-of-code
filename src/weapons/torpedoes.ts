import {
  ICoordinates,
  getNeighbouringCellsIncludingDiagonal,
  transformCoordinatesToKey,
  getDistanceBetweenCoordinates,
  getReachableCoordinatesAtMaxDistance,
  areCoordinatesTheSame,
  IGameMap,
} from '../maps';
import { DAMAGE_TORPEDO, RANGE_TORPEDO } from '../constants';

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
  gameMap,
}: {
  coordinatesToShootFrom: ICoordinates;
  gameMap: IGameMap;
}): ICoordinates[] => {
  return getReachableCoordinatesAtMaxDistance({
    coordinates: coordinatesToShootFrom,
    maxDistance: RANGE_TORPEDO,
    walkabilityMatrix: gameMap.walkabilityMatrix,
  });
};
