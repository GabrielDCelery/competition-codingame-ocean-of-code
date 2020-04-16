import {
  ICoordinates,
  IGameMap,
  cloneWalkabilityMatrix,
  getListOfCoordinatesBetweenCoordinatesConnectedByStraightLine,
} from '../../maps';
import { ISubmarine } from '../../submarines';
import { calculateFreeMovementUtility } from './free-movement';
import { calculatThreatOfBeingShotAtCoordinatesUtility } from './threat-of-being-shot-at-coordinates';
//import { calculateFireTorpedoAtCoordinatesUtility } from './fire-torpedo-at-coordinates';
//import { chooseHighestUtility } from '../utility-helpers';
import { calculateOptimalDistanceFromTargetUtility } from './optimal-distance-from-target';
import { weightedAverage } from '../utility-helpers';
import { calculateThreatOfTakingMineDamageUtility } from './threat-of-taking-mine-damage';

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

  /*
  const bestChanceForSettingUpShotUtility = chooseHighestUtility<ICoordinates>(
    gameMap.cache.torpedoReachabilityListMatrix[coordinatesMoveTo.x][coordinatesMoveTo.y],
    coordinatesToShootAt => {
      return calculateFireTorpedoAtCoordinatesUtility({
        coordinatesToShootAt,
        sourceSubmarine: mySubmarine,
        possibleTargetSubmarines: opponentSubmarines,
      });
    }
  ).utility;
  */

  const freeMovementUtility = calculateFreeMovementUtility({
    coordinatesMoveTo,
    walkabilityMatrix: clonedWalkabilityMatrix,
    gameMap,
  });

  const threatOfBeingShotaAtUtility = calculatThreatOfBeingShotAtCoordinatesUtility({
    gameMap,
    coordinates: coordinatesMoveTo,
    targetSubmarine: mySubmarine,
    possibleSourceSubmarines: opponentSubmarines,
  });

  const optimalDistanceFromTargetUtility = calculateOptimalDistanceFromTargetUtility({
    coordinatesMoveFrom,
    coordinatesMoveTo,
    sourceSubmarine: mySubmarine,
    targetSubmarines: opponentSubmarines,
  });

  const threatOfTakingMineDamageUtility = calculateThreatOfTakingMineDamageUtility({
    coordinatesMoveTo,
    gameMap,
  });

  return weightedAverage([
    /*
    {
      weight: 0.2,
      value: bestChanceForSettingUpShotUtility,
    },
    */
    {
      weight: 0.2,
      value: optimalDistanceFromTargetUtility,
    },
    {
      weight: 0.4,
      value: 1 - threatOfTakingMineDamageUtility,
    },
    {
      weight: 0.3,
      value: 1 - threatOfBeingShotaAtUtility,
    },
    {
      weight: 0.1,
      value: freeMovementUtility,
    },
  ]);
};
