import {
  ICoordinates,
  uGetNeighbouringCells,
  uTransformKeyToCoordinates,
  uGetCoordinatesAtSpecificDistance,
  uGetDistanceBetweenCoordinates,
  uCreateVectorFromCoordinates,
  uTransformVectorToDirection,
} from '../maps';
import BaseAction, { IWeightedCommand } from './base-action';
import { ECommand, EChargeCommand } from '../command-interpreter';
import * as PF from 'pathfinding';

const finder: PF.AStarFinder = new PF.AStarFinder();

export class MoveAction extends BaseAction {
  calculateUtility(): IWeightedCommand {
    const myLocation = this.me.getPosition();
    const gameMap = this.me.getGameMap();
    const possibleLocationsToMoveTo = uGetNeighbouringCells(myLocation).filter(coordinates => {
      return gameMap.isCellWalkable(coordinates);
    });

    if (possibleLocationsToMoveTo.length === 0) {
      return {
        type: ECommand.MOVE,
        utility: 0,
        parameters: {},
      };
    }

    const possibleOpponentLocationsMap = this.opponent.getPossibleLocationsMap();
    const coordinatesAsKeys = Object.keys(possibleOpponentLocationsMap);

    const possibleOpponentLocation: ICoordinates = uTransformKeyToCoordinates(
      coordinatesAsKeys[Math.floor(Math.random() * coordinatesAsKeys.length)]
    );
    const targetCoordinates = [
      ...uGetCoordinatesAtSpecificDistance({
        coordinates: possibleOpponentLocation,
        distance: 3,
      }),
    ].filter(coordinates => {
      return (
        uGetDistanceBetweenCoordinates(myLocation, coordinates) !== 0 &&
        gameMap.isCellWalkable(coordinates)
      );
    });

    let distance = Infinity;
    let selectedCoordinates: ICoordinates = { x: 0, y: 0 };

    for (let i = 0, iMax = targetCoordinates.length; i < iMax; i++) {
      const targetDistance = uGetDistanceBetweenCoordinates(myLocation, targetCoordinates[i]);

      if (targetDistance < distance) {
        distance = targetDistance;
        selectedCoordinates = targetCoordinates[i];
      }
    }

    const grid: PF.Grid = new PF.Grid(gameMap.getPathFindingWalkabilityMatrix());
    const path: Array<Array<number>> = finder.findPath(
      myLocation.x,
      myLocation.y,
      selectedCoordinates.x,
      selectedCoordinates.y,
      grid
    );

    if (path[1] === undefined) {
      const { x, y } = possibleLocationsToMoveTo[0];
      const vector = uCreateVectorFromCoordinates({ source: myLocation, target: { x, y } });
      const direction = uTransformVectorToDirection(vector);
      return {
        type: ECommand.MOVE,
        utility: 0.3,
        parameters: { direction, chargeCommand: EChargeCommand.TORPEDO },
      };
    }

    const [x, y] = path[1];

    const vector = uCreateVectorFromCoordinates({ source: myLocation, target: { x, y } });
    const direction = uTransformVectorToDirection(vector);

    return {
      type: ECommand.MOVE,
      utility: 0.3,
      parameters: { direction, chargeCommand: EChargeCommand.TORPEDO },
    };
  }
}

export default MoveAction;
