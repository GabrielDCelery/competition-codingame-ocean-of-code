import {
  ICoordinates,
  TWalkabilityMatrix,
  cloneWalkabilityMatrix,
  getOpenRegionSize,
  IGameMap,
} from '../../maps';
import { normalizedLogistic, normalizedLogisticDecay, average } from '../utility-helpers';

const MAX_REGION_SIZE_TO_CHECK = 50;

export const calculateFreeMovementUtility = ({
  coordinatesMoveTo,
  walkabilityMatrix,
  gameMap,
}: {
  coordinatesMoveTo: ICoordinates;
  walkabilityMatrix: TWalkabilityMatrix;
  gameMap: IGameMap;
}): number => {
  const { count, threat } = getOpenRegionSize({
    maxSize: MAX_REGION_SIZE_TO_CHECK,
    coordinatesToCalculateFrom: coordinatesMoveTo,
    walkabilityMatrix: cloneWalkabilityMatrix(walkabilityMatrix),
    gameMap,
  });

  const emptySpaceUtility = normalizedLogistic({
    value: count,
    max: MAX_REGION_SIZE_TO_CHECK,
    a: 0.8,
  });

  const mineFreeAreaUtility = normalizedLogisticDecay({
    value: threat,
    max: MAX_REGION_SIZE_TO_CHECK,
  });

  return average([emptySpaceUtility, mineFreeAreaUtility]);
};
