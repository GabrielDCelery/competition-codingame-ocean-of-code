import { ICoordinates, IGameMap } from '../../maps';
import { average } from '../utility-helpers';

export const calculateThreatOfTakingMineDamageUtility = ({
  coordinatesMoveTo,
  gameMap,
}: {
  coordinatesMoveTo: ICoordinates;
  gameMap: IGameMap;
}): number => {
  const { x, y } = coordinatesMoveTo;
  const probabilityOfTakingDirectDamage = gameMap.cache.mineDirectDamageProbabilityMatrix[x][y];
  const probabilityOfTakingSplashDamage = gameMap.cache.mineSplashDamageProbabilityMatrix[x][y];

  return average([probabilityOfTakingDirectDamage, probabilityOfTakingSplashDamage]);
};
