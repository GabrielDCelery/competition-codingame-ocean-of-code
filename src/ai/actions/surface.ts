import BaseAction, { IWeightedCommand } from './base-action';
import { ECommand } from '../../command-interpreter';
import { uGetNeighbouringCells } from '../../maps';

export class SurfaceAction extends BaseAction {
  calculateUtility(): IWeightedCommand {
    const myLocation = this.me.getPosition();
    const gameMap = this.me.getGameMap();
    const possibleLocationsToMoveTo = uGetNeighbouringCells(myLocation).filter(coordinates => {
      return gameMap.isCellWalkable(coordinates);
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
