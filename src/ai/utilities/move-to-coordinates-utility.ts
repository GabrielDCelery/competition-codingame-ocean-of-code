import {
  ICoordinates,
  IGameMap,
  cloneWalkabilityMatrix,
  getListOfCoordinatesBetweenCoordinatesConnectedByStraightLine,
} from '../../maps';
import { ISubmarine } from '../../submarines';
import { calculateFreeMovementUtility } from './free-movement';
import { calculatThreatOfBeingShotAtCoordinatesUtility } from './threat-of-being-shot-at-coordinates';
import { calculateFireTorpedoAtCoordinatesUtility } from './fire-torpedo-at-coordinates';
import { weightedAverage } from '../../common';
import { chooseHighestUtility } from '../utils';
import { calculateOptimalDistanceFromTargetUtility } from './optimal-distance-from-target';

export const calculateMoveToCoordinatestUtility = ({
  coordinatesMoveFrom,
  coordinatesMoveTo,
  gameMap,
  mySubmarine,
  opponentSubmarines,
}: {
  coordinatesMoveFrom: ICoordinates;
  coordinatesMoveTo: ICoordinates;
  gameMap: IGameMap;
  mySubmarine: ISubmarine;
  opponentSubmarines: ISubmarine[];
}): number => {
  const clonedWalkabilityMatrix = cloneWalkabilityMatrix(mySubmarine.walkabilityMatrix);

  getListOfCoordinatesBetweenCoordinatesConnectedByStraightLine({
    source: coordinatesMoveFrom,
    target: coordinatesMoveTo,
  }).forEach(({ x, y }) => {
    clonedWalkabilityMatrix[x][y] = false;
  });

  const freeMovementUtility = calculateFreeMovementUtility({
    coordinatesMoveTo,
    walkabilityMatrix: clonedWalkabilityMatrix,
  });
  /*
  const threatOfBeingShotaAtUtility = calculatThreatOfBeingShotAtCoordinatesUtility({
    gameMap,
    coordinates: coordinatesMoveTo,
    targetSubmarine: mySubmarine,
    possibleSourceSubmarines: opponentSubmarines,
  });

  const bestChanceForSettingUpShotUtility = chooseHighestUtility<ICoordinates>(
    gameMap.matrixes.torpedoReachability[coordinatesMoveTo.x][coordinatesMoveTo.y],
    coordinatesToShootAt => {
      return calculateFireTorpedoAtCoordinatesUtility({
        coordinatesToShootAt,
        sourceSubmarine: mySubmarine,
        possibleTargetSubmarines: opponentSubmarines,
      });
    }
  ).utility;
    */
  const optimalDistanceFromTargetUtility = calculateOptimalDistanceFromTargetUtility({
    coordinatesMoveFrom,
    coordinatesMoveTo,
    sourceSubmarine: mySubmarine,
    targetSubmarines: opponentSubmarines,
  });

  return weightedAverage([
    {
      weight: 0.7,
      value: optimalDistanceFromTargetUtility,
    },
    /*
    {
      weight: 0.2,
      value: bestChanceForSettingUpShotUtility,
    },
    {
      weight: 0.4,
      value: 1 - threatOfBeingShotaAtUtility,
    },
    */
    {
      weight: 0.3,
      value: freeMovementUtility,
    },
  ]);
};
