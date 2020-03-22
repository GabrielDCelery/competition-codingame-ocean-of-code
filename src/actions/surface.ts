import graph from '../graph';
import BaseAction, { IWeightedAction } from './base-action';
import { ECommand } from '../command-interpreter';

export class SurfaceAction extends BaseAction {
  calculateUtility(): IWeightedAction {
    const myLocation = this.mySubmarine.getPosition();
    const gameMap = this.mySubmarine.getGameMap();
    const possibleLocationsToMoveTo = graph.getNeighbouringCells(myLocation).filter(coordinates => {
      return gameMap.isCellWalkable(coordinates);
    });

    const utility = possibleLocationsToMoveTo.length === 0 ? 1 : 0;

    return {
      type: ECommand.SURFACE,
      utility,
    };
  }
}

export default SurfaceAction;
