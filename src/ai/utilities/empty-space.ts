import {
  ICoordinates,
  IGameMap,
  TWalkabilityMatrix,
  cloneWalkabilityMatrix,
  getRegionSize,
} from '../../maps';
import { normalizedLogistic } from '../utility-functions';

export const emptySpaceUtility = ({
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

  return normalizedLogistic({
    value: regionSize,
    max: gameMap.numOfWalkableTerrainCells,
    a: 0.8,
  });
};
