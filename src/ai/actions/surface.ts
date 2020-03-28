import BaseAction, { IWeightedCommand } from './base-action';
import { ECommand } from '../../commands';
import { uGetNeighbouringCells, isCellWalkable } from '../../maps';

export class SurfaceAction extends BaseAction {
  calculateUtility(): IWeightedCommand {
    const myLocation = this.gameState.players.me.real.coordinates;
    const possibleLocationsToMoveTo = uGetNeighbouringCells(myLocation).filter(coordinates => {
      return isCellWalkable({
        coordinates,
        gameMapDimensions: this.gameState.map.dimensions,
        terrainMap: this.gameState.map.terrain,
        visitedMap: this.gameState.players.me.real.maps.visited,
      });
    });

    const utility = possibleLocationsToMoveTo.length === 0 ? 1 : 0;

    return {
      type: ECommand.SURFACE,
      utility,
      parameters: {},
    };
  }
}

export default SurfaceAction;
