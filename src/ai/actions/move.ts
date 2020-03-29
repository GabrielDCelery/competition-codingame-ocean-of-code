import {
  ICoordinates,
  getNeighbouringCells,
  getCoordinatesAtSpecificDistance,
  getDistanceBetweenCoordinates,
  createVectorFromCoordinates,
  transformVectorToDirection,
  getPathFindingWalkabilityMatrix,
} from '../../maps';
import { IWeightedCommand } from './base-action';
import { ECommand, ECharge } from '../../commands';
import * as PF from 'pathfinding';
import { isCellWalkable } from '../../maps';
import { ISubmarine } from '../../submarines';
import { IGameMapDimensions, ITerrainMap } from '../../maps';

const finder: PF.AStarFinder = new PF.AStarFinder();

export const calculateMoveActionUtility = ({
  mySubmarine,
  opponentSubmarines,
  gameMapDimensions,
  terrainMap,
}: {
  mySubmarine: ISubmarine;
  opponentSubmarines: ISubmarine[];
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

  if (possibleLocationsToMoveTo.length === 0) {
    return {
      type: ECommand.MOVE,
      utility: 0,
      parameters: {},
    };
  }

  const item = opponentSubmarines[Math.floor(Math.random() * opponentSubmarines.length)];
  const targetCoordinates = [
    ...getCoordinatesAtSpecificDistance({
      coordinates: item.coordinates,
      distance: 3,
    }),
  ].filter(coordinates => {
    return (
      getDistanceBetweenCoordinates(mySubmarine.coordinates, coordinates) !== 0 &&
      isCellWalkable({
        coordinates,
        gameMapDimensions,
        terrainMap,
        visitedMap: mySubmarine.maps.visited,
      })
    );
  });

  let distance = Infinity;
  let selectedCoordinates: ICoordinates = { x: 0, y: 0 };

  for (let i = 0, iMax = targetCoordinates.length; i < iMax; i++) {
    const targetDistance = getDistanceBetweenCoordinates(
      mySubmarine.coordinates,
      targetCoordinates[i]
    );

    if (targetDistance < distance) {
      distance = targetDistance;
      selectedCoordinates = targetCoordinates[i];
    }
  }

  const grid: PF.Grid = new PF.Grid(
    getPathFindingWalkabilityMatrix({
      gameMapDimensions,
      terrainMap,
      visitedMap: mySubmarine.maps.visited,
    })
  );
  const path: Array<Array<number>> = finder.findPath(
    mySubmarine.coordinates.x,
    mySubmarine.coordinates.y,
    selectedCoordinates.x,
    selectedCoordinates.y,
    grid
  );

  if (path[1] === undefined) {
    const { x, y } = possibleLocationsToMoveTo[0];
    const vector = createVectorFromCoordinates({
      source: mySubmarine.coordinates,
      target: { x, y },
    });
    const direction = transformVectorToDirection(vector);
    return {
      type: ECommand.MOVE,
      utility: 0.3,
      parameters: { direction, chargeCommand: ECharge.TORPEDO },
    };
  }

  const [x, y] = path[1];

  const vector = createVectorFromCoordinates({ source: mySubmarine.coordinates, target: { x, y } });
  const direction = transformVectorToDirection(vector);

  return {
    type: ECommand.MOVE,
    utility: 0.3,
    parameters: { direction, chargeCommand: ECharge.TORPEDO },
  };
};
