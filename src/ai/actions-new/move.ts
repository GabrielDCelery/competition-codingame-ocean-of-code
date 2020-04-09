/*
import { TActionUtilityCalculator } from './base-action';
import { ECommand } from '../../commands';
import { getNeighbouringCells, areCoordinatesWalkable, ICoordinates } from '../../maps';
import { chooseHighestUtility } from '../utility-helpers';
import { calculateFreeMovementUtility } from '../utilities';

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
};
*/
