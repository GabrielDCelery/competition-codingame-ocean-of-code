import {
  ICoordinates,
  IGameMap,
  TWalkabilityMatrix,
  cloneWalkabilityMatrix,
  getRegionSize,
  getListOfCoordinatesBetweenCoordinatesConnectedByStraightLine,
} from '../../maps';
import { normalizedLogistic } from '../utility-functions';
import { ISubmarine } from '../../submarines';

/*
export const calculateMoveToCoordinatestUtility = ({
  coordinatesToMoveFrom,
  coordinatesToMoveTo,
  gameMap,
  mySubmarine,
  opponentSubmarines,
}: {
  coordinatesToMoveFrom: ICoordinates;
  coordinatesToMoveTo: ICoordinates;
  gameMap: IGameMap;
  mySubmarine: ISubmarine;
  opponentSubmarines: ISubmarine[];
}): number => {
  const clonedWalkabilityMatrix = cloneWalkabilityMatrix(mySubmarine.walkabilityMatrix);

  getListOfCoordinatesBetweenCoordinatesConnectedByStraightLine({
    source: coordinatesToMoveTo,
    target: coordinatesToMoveFrom,
  }).forEach(({ x, y }) => {
    clonedWalkabilityMatrix[x][y] = false;
  });

  const regionSize = getRegionSize({
    coordinatesToCalculateFrom: coordinatesToMoveTo,
    walkabilityMatrix: clonedWalkabilityMatrix,
  });
};
*/
