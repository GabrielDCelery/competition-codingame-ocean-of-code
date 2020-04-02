import { ECommand } from '../../commands';
import { getNeighbouringCells, isCellWalkable } from '../../maps';
import { TActionUtilityCalculator } from './base-action';

export const calculateSurfaceActionUtility: TActionUtilityCalculator = ({
  mySubmarine,
  gameMap,
}) => {
  const possibleLocationsToMoveTo = getNeighbouringCells(mySubmarine.coordinates).filter(
    coordinates => {
      return isCellWalkable({
        coordinates,
        gameMapDimensions: gameMap.dimensions,
        terrainMap: gameMap.terrain,
        visitedMap: mySubmarine.maps.visited,
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
