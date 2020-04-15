import { ICoordinates, IGameMap } from '../../maps';
import { average, normalizedLogistic } from '../utility-helpers';

export const calculateThreatOfTakingMineDamageUtility = ({
  coordinatesMoveTo,
  gameMap,
}: {
  coordinatesMoveTo: ICoordinates;
  gameMap: IGameMap;
}): number => {
  const { x, y } = coordinatesMoveTo;

  return average([
    normalizedLogistic({
      value: gameMap.cache.mineDirectDamageProbabilityMatrix[x][y],
      max: 1,
      a: 0.5,
    }),
    normalizedLogistic({
      value: gameMap.cache.mineSplashDamageProbabilityMatrix[x][y],
      max: 1,
      a: 0.5,
    }),
  ]);
};
