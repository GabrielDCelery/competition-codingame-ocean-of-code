import {
  ICoordinates,
  IGameMap,
  TWalkabilityMatrix,
  cloneWalkabilityMatrix,
  getRegionSize,
} from '../../maps';
import { normalizeLinear } from '../../common';

export const calculateFreeMovementUtility = ({
  coordinatesToMoveFrom,
  coordinatesToMoveTo,
  gameMap,
  walkabilityMatrix,
}: {
  coordinatesToMoveFrom: ICoordinates;
  coordinatesToMoveTo: ICoordinates;
  gameMap: IGameMap;
  walkabilityMatrix: TWalkabilityMatrix;
}): number => {
  const clonedWalkabilityMatrix = cloneWalkabilityMatrix(walkabilityMatrix);
  const { x, y } = coordinatesToMoveFrom;
  clonedWalkabilityMatrix[x][y] = false;
  const regionSize = getRegionSize({
    coordinatesToCalculateFrom: coordinatesToMoveTo,
    walkabilityMatrix: clonedWalkabilityMatrix,
  });

  return normalizeLinear({
    value: regionSize,
    max: gameMap.numOfWalkableTerrainCells,
  });
};
