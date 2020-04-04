import { ICoordinates, IGameMap, TWalkabilityMatrix, getRegionSize } from '../../maps';
import { normalizeLinear } from '../../common';

export const calculateFreeMovementUtility = ({
  coordinatesToMoveTo,
  gameMap,
  walkabilityMatrix,
}: {
  coordinatesToMoveTo: ICoordinates;
  gameMap: IGameMap;
  walkabilityMatrix: TWalkabilityMatrix;
}): number => {
  const regionSize = getRegionSize({
    gameMap,
    coordinatesToCalculateFrom: coordinatesToMoveTo,
    walkabilityMatrix,
  });

  return normalizeLinear({
    value: regionSize,
    max: gameMap.numOfWalkableTerrainCells,
  });
};
