import {
  ICoordinates,
  getNeighbouringCells,
  transformKeyToCoordinates,
  getCoordinatesAtSpecificDistance,
  getDistanceBetweenCoordinates,
  createVectorFromCoordinates,
  transformVectorToDirection,
} from '../maps';
import BaseAction, { IWeightedAction } from './base-action';
import { ECommand } from '../command-interpreter';
import * as PF from 'pathfinding';

const finder: PF.AStarFinder = new PF.AStarFinder();

export class MoveAction extends BaseAction {
  calculateUtility(): IWeightedAction {
    const myLocation = this.mySubmarine.getPosition();
    const gameMap = this.mySubmarine.getGameMap();
    const possibleLocationsToMoveTo = getNeighbouringCells(myLocation).filter(coordinates => {
      return gameMap.isCellWalkable(coordinates);
    });

    if (possibleLocationsToMoveTo.length === 0) {
      return {
        type: ECommand.MOVE,
        utility: 0,
      };
    }

    const possibleOpponentLocationsMap = this.phantomSubmarineTracker.getPossibleLocationsMap();
    const coordinatesAsKeys = Object.keys(possibleOpponentLocationsMap);

    const possibleOpponentLocation: ICoordinates = transformKeyToCoordinates(
      coordinatesAsKeys[Math.floor(Math.random() * coordinatesAsKeys.length)]
    );
    const targetCoordinates = [
      ...getCoordinatesAtSpecificDistance({
        coordinates: possibleOpponentLocation,
        distance: 3,
      }),
    ].filter(coordinates => {
      return (
        getDistanceBetweenCoordinates(myLocation, coordinates) !== 0 &&
        gameMap.isCellWalkable(coordinates)
      );
    });

    let distance = Infinity;
    let selectedCoordinates: ICoordinates = { x: 0, y: 0 };

    for (let i = 0, iMax = targetCoordinates.length; i < iMax; i++) {
      const targetDistance = getDistanceBetweenCoordinates(myLocation, targetCoordinates[i]);

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
      const vector = createVectorFromCoordinates({ source: myLocation, target: { x, y } });
      const direction = transformVectorToDirection(vector);
      return {
        type: ECommand.MOVE,
        utility: 0.3,
        parameters: { direction, chargeCommand: 'TORPEDO' },
      };
    }

    const [x, y] = path[1];

    const vector = createVectorFromCoordinates({ source: myLocation, target: { x, y } });
    const direction = transformVectorToDirection(vector);

    return {
      type: ECommand.MOVE,
      utility: 0.3,
      parameters: { direction, chargeCommand: 'TORPEDO' },
    };
  }
}

export default MoveAction;
