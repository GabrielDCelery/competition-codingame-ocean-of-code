import { TActionUtilityCalculator } from './interfaces';
import { ECommand } from '../../commands';
import {
  getNeighbouringCells,
  areCoordinatesWalkable,
  ICoordinates,
  createVectorFromCoordinates,
  transformVectorToDirection,
} from '../../maps';
import { chooseHighestUtility } from '../utility-helpers';
import { calculateMoveToCoordinatestUtility } from '../utilities';
import { chooseChargeCommand } from './move-charge';

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
      return calculateMoveToCoordinatestUtility({
        coordinatesMoveFrom: mySubmarine.coordinates,
        coordinatesMoveTo: possibleLocationToMoveTo,
        gameMap,
        mySubmarine,
        opponentSubmarines,
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
