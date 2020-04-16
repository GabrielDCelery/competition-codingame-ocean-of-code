import { ECommand } from '../../commands';
import { getNeighbouringCells, areCoordinatesWalkable } from '../../maps';
import { TActionUtilityCalculator } from './interfaces';

export const calculateSurfaceActionUtility: TActionUtilityCalculator = ({ mySubmarine }) => {
  if (mySubmarine.health === 1) {
    return {
      type: ECommand.SURFACE,
      utility: 0,
      parameters: {},
    };
  }

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
      type: ECommand.SURFACE,
      utility: 3,
      parameters: {},
    };
  }

  return {
    type: ECommand.SURFACE,
    utility: 0,
    parameters: {},
  };
};
