import {
  ICoordinates,
  TWalkabilityMatrix,
  cloneWalkabilityMatrix,
  getOpenRegionSize,
} from '../../maps';
import { normalizedLogistic } from '../utility-functions';

const MAX_REGION_SIZE_TO_CHECK = 100;

export const calculateFreeMovementUtility = ({
  coordinatesMoveTo,
  walkabilityMatrix,
}: {
  coordinatesMoveTo: ICoordinates;
  walkabilityMatrix: TWalkabilityMatrix;
}): number => {
  const regionSize = getOpenRegionSize({
    maxSize: MAX_REGION_SIZE_TO_CHECK,
    coordinatesToCalculateFrom: coordinatesMoveTo,
    walkabilityMatrix: cloneWalkabilityMatrix(walkabilityMatrix),
  });

  return normalizedLogistic({
    value: regionSize,
    max: MAX_REGION_SIZE_TO_CHECK,
    a: 0.8,
  });
};
