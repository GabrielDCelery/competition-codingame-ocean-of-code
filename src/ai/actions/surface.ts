import { IWeightedCommand } from './base-action';
import { ECommand } from '../../commands';
import { getNeighbouringCells, isCellWalkable } from '../../maps';
import { ISubmarine } from '../../submarines';
import { IGameMapDimensions, ITerrainMap } from '../../maps';

export const calculateSurfaceActionUtility = ({
  mySubmarine,
  gameMapDimensions,
  terrainMap,
}: {
  mySubmarine: ISubmarine;
  gameMapDimensions: IGameMapDimensions;
  terrainMap: ITerrainMap;
}): IWeightedCommand => {
  const possibleLocationsToMoveTo = getNeighbouringCells(mySubmarine.coordinates).filter(
    coordinates => {
      return isCellWalkable({
        coordinates,
        gameMapDimensions,
        terrainMap,
        visitedMap: mySubmarine.maps.visited,
      });
    }
  );

  const utility = possibleLocationsToMoveTo.length === 0 ? 1 : 0;

  return {
    type: ECommand.SURFACE,
    utility,
    parameters: {},
  };
};
