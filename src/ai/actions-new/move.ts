/*
import { TActionUtilityCalculator } from './interfaces';
import { ECommand } from '../../commands';
import { chooseHighestUtility, calculateTorpedoDamageUtility } from '../utils';
import {
  ICoordinates,
  getNeighbouringCells,
  transformVectorToDirection,
  createVectorFromCoordinates,
  areCoordinatesWalkable,
} from '../../maps';
import { chooseChargeCommand } from './move-charge';
import { weightedAverage } from '../../common';
import {
  calculateFreeMovementUtility,
  calculatThreatOfBeingShotAtCoordinatesUtility,
} from '../utilities';

export const calculateMoveActionUtility: TActionUtilityCalculator = ({
  mySubmarine,
  opponentSubmarines,
  gameMap,
}) => {
  const possibleLocationsToMoveTo = getNeighbouringCells(mySubmarine.coordinates).filter(
    coordinates => {
      return areCoordinatesWalkable({
        coordinates,
        walkabilityMatrix: mySubmarine.walkabilityMatrix,
      });
    }
  );

  if (possibleLocationsToMoveTo.length === 0) {
    return {
      type: ECommand.MOVE,
      utility: 0,
      parameters: {},
    };
  }

  const { utility, params } = chooseHighestUtility<ICoordinates>(
    possibleLocationsToMoveTo,
    possibleLocationToMoveTo => {
      const freeMovementUtility = calculateFreeMovementUtility({
        coordinatesToMoveFrom: mySubmarine.coordinates,
        coordinatesToMoveTo: possibleLocationToMoveTo,
        gameMap,
        walkabilityMatrix: mySubmarine.walkabilityMatrix,
      });
    }
  );

  const vector = createVectorFromCoordinates({ source: mySubmarine.coordinates, target: params });
  const direction = transformVectorToDirection(vector);

  return {
    type: ECommand.MOVE,
    utility,
    parameters: {
      direction,
      chargeCommand: chooseChargeCommand({
        mySubmarine,
        opponentSubmarines,
        gameMap,
      }),
    },
  };
};
*/
