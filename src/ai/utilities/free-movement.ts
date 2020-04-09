import {
  ICoordinates,
  IGameMap,
  TWalkabilityMatrix,
  cloneWalkabilityMatrix,
  getRegionSize,
  getOpenRegionSize,
} from '../../maps';
import { normalizedLogistic } from '../utility-functions';

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
  console.error(
    getOpenRegionSize({
      maxSize: 25,
      coordinatesToCalculateFrom: coordinatesToMoveTo,
      walkabilityMatrix: cloneWalkabilityMatrix(walkabilityMatrix),
    })
  );

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
