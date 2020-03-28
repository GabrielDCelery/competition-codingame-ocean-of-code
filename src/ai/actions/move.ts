import {
  ICoordinates,
  uGetNeighbouringCells,
  uGetCoordinatesAtSpecificDistance,
  uGetDistanceBetweenCoordinates,
  uCreateVectorFromCoordinates,
  transformVectorToDirection,
  getPathFindingWalkabilityMatrix,
} from '../../maps';
import BaseAction, { IWeightedCommand } from './base-action';
import { ECommand, ECharge } from '../../commands';
import * as PF from 'pathfinding';
import { isCellWalkable } from '../../maps';

const finder: PF.AStarFinder = new PF.AStarFinder();

export class MoveAction extends BaseAction {
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

    if (possibleLocationsToMoveTo.length === 0) {
      return {
        type: ECommand.MOVE,
        utility: 0,
        parameters: {},
      };
    }

    const items = this.gameState.players.opponent.phantoms;
    const item = items[Math.floor(Math.random() * items.length)];
    const targetCoordinates = [
      ...uGetCoordinatesAtSpecificDistance({
        coordinates: item.coordinates,
        distance: 3,
      }),
    ].filter(coordinates => {
      return (
        uGetDistanceBetweenCoordinates(myLocation, coordinates) !== 0 &&
        isCellWalkable({
          coordinates,
          gameMapDimensions: this.gameState.map.dimensions,
          terrainMap: this.gameState.map.terrain,
          visitedMap: this.gameState.players.me.real.maps.visited,
        })
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

    const grid: PF.Grid = new PF.Grid(
      getPathFindingWalkabilityMatrix({
        gameMapDimensions: this.gameState.map.dimensions,
        terrainMap: this.gameState.map.terrain,
        visitedMap: this.gameState.players.me.real.maps.visited,
      })
    );
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
      const direction = transformVectorToDirection(vector);
      return {
        type: ECommand.MOVE,
        utility: 0.3,
        parameters: { direction, chargeCommand: ECharge.TORPEDO },
      };
    }

    const [x, y] = path[1];

    const vector = uCreateVectorFromCoordinates({ source: myLocation, target: { x, y } });
    const direction = transformVectorToDirection(vector);

    return {
      type: ECommand.MOVE,
      utility: 0.3,
      parameters: { direction, chargeCommand: ECharge.TORPEDO },
    };
  }
}

export default MoveAction;
