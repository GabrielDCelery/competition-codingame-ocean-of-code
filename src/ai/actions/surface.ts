import { ECommand } from '../../commands';
import {
  getNeighbouringCells,
  areCoordinatesWalkable,
  getOpenRegionSize,
  cloneWalkabilityMatrix,
} from '../../maps';
import { TActionUtilityCalculator } from './interfaces';
import { normalizedLogistic } from '../utility-helpers';

const MAX_REGION_SIZE_TO_CHECK = 50;

export const calculateSurfaceActionUtility: TActionUtilityCalculator = ({
  mySubmarine,
  gameMap,
}) => {
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

  const { count, threat } = getOpenRegionSize({
    maxSize: MAX_REGION_SIZE_TO_CHECK,
    coordinatesToCalculateFrom: mySubmarine.coordinates,
    walkabilityMatrix: cloneWalkabilityMatrix(mySubmarine.walkabilityMatrix),
    gameMap,
  });

  const utility = normalizedLogistic({
    value: threat,
    max: Math.min(count, MAX_REGION_SIZE_TO_CHECK),
  });

  return {
    type: ECommand.SURFACE,
    utility,
    parameters: {},
  };
};
