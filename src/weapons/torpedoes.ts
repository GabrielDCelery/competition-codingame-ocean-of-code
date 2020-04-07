import {
  ICoordinates,
  IGameMap,
  ITorpedoDamageMap,
  areCoordinatesTheSame,
  areCoordinatesWalkable,
  getDistanceBetweenCoordinates,
  getNeighbouringCellsIncludingDiagonal,
  getReachableCoordinatesAtMaxDistance,
  transformCoordinatesToKey,
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

export const createKeyOfTorpedoAction = ({
  sourceCoordinates,
  targetCoordinates,
  detonatedAtCoordinates,
}: {
  sourceCoordinates: ICoordinates;
  targetCoordinates: ICoordinates;
  detonatedAtCoordinates: ICoordinates;
}): string => {
  return [
    sourceCoordinates.x,
    sourceCoordinates.y,
    targetCoordinates.x,
    targetCoordinates.y,
    detonatedAtCoordinates.x,
    detonatedAtCoordinates.y,
  ].join('_');
};

export const initTorpedoDamageMap = (gameMap: IGameMap): void => {
  const torpedoDamageMap: ITorpedoDamageMap = {};
  const { width, height } = gameMap;

  new Array(width).fill(null).forEach((item, x) => {
    new Array(height).fill(null).forEach((item, y) => {
      const sourceCoordinates = { x, y };

      if (
        !areCoordinatesWalkable({
          coordinates: sourceCoordinates,
          walkabilityMatrix: gameMap.walkabilityMatrix,
        })
      ) {
        return;
      }

      gameMap.matrixes.torpedoReachability[sourceCoordinates.x][sourceCoordinates.y].forEach(
        ({ x, y }) => {
          const detonatedAtCoordinates = { x, y };

          new Array(width).fill(null).forEach((item, x) => {
            new Array(height).fill(null).forEach((item, y) => {
              const targetCoordinates = { x, y };

              const targetDamage = getDamageTakenFromTorpedo({
                submarineCoordinates: targetCoordinates,
                detonatedAtCoordinates,
              });

              if (targetDamage === 0) {
                return;
              }

              const sourceDamage = getDamageTakenFromTorpedo({
                submarineCoordinates: sourceCoordinates,
                detonatedAtCoordinates,
              });

              torpedoDamageMap[
                createKeyOfTorpedoAction({
                  sourceCoordinates,
                  targetCoordinates,
                  detonatedAtCoordinates,
                })
              ] = [sourceDamage, targetDamage];
            });
          });
        }
      );
    });
  });

  gameMap.matrixes.torpedoDamageMap = torpedoDamageMap;
};

export const getTorpedoFiredAtCoordinatesResult = ({
  sourceCoordinates,
  targetCoordinates,
  detonatedAtCoordinates,
  gameMap,
}: {
  sourceCoordinates: ICoordinates;
  targetCoordinates: ICoordinates;
  detonatedAtCoordinates: ICoordinates;
  gameMap: IGameMap;
}): [number, number] => {
  const result =
    gameMap.matrixes.torpedoDamageMap[
      createKeyOfTorpedoAction({
        sourceCoordinates,
        targetCoordinates,
        detonatedAtCoordinates,
      })
    ];
  if (result === undefined) {
    return [
      getDamageTakenFromTorpedo({
        submarineCoordinates: sourceCoordinates,
        detonatedAtCoordinates,
      }),
      0,
    ];
  }

  return result;
};
