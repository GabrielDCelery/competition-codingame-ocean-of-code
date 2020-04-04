import { ECommand } from '../../commands';
import { getNeighbouringCells, areCoordinatesWalkable } from '../../maps';
import { TActionUtilityCalculator } from './base-action';

export const calculateSurfaceActionUtility: TActionUtilityCalculator = ({ mySubmarine }) => {
  const possibleLocationsToMoveTo = getNeighbouringCells(mySubmarine.coordinates).filter(
    coordinates => {
      return areCoordinatesWalkable({
        coordinates,
        walkabilityMatrix: mySubmarine.walkabilityMatrix,
      });
    }
  );

  const utility = possibleLocationsToMoveTo.length === 0 ? 2 : 0;

  return {
    type: ECommand.SURFACE,
    utility,
    parameters: {},
  };
};
