import { IWeightedCommand } from './base-action';
import { ECommand } from '../../commands';
import {
  calculateCoordinatesThreatUtility,
  chooseHighestUtility,
  calculateTorpedoDamageUtility,
} from '../utils';
import { ISubmarine } from '../../submarines';
import {
  IGameMap,
  ICoordinates,
  isCellWalkable,
  getNeighbouringCells,
  transformVectorToDirection,
  createVectorFromCoordinates,
} from '../../maps';
import { chooseChargeCommand } from './charge';
import { average } from '../../common';

export const calculateGenericMoveActionUtility = ({
  mySubmarine,
  opponentSubmarines,
  gameMap,
}: {
  mySubmarine: ISubmarine;
  opponentSubmarines: ISubmarine[];
  gameMap: IGameMap;
}): IWeightedCommand => {
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

  if (possibleLocationsToMoveTo.length === 0) {
    return {
      type: ECommand.MOVE,
      utility: 0,
      parameters: {},
    };
  }

  const { utility, params } = chooseHighestUtility<ICoordinates>(
    possibleLocationsToMoveTo,
    possibleLocationToMoveTo => {
      const { utility } = chooseHighestUtility<ICoordinates>(
        gameMap.matrixes.torpedoReachability[possibleLocationToMoveTo.x][
          possibleLocationToMoveTo.y
        ],
        coordinatesToShootAt => {
          const torpedoDamageUtility = calculateTorpedoDamageUtility({
            coordinatesToShootAt,
            mySubmarine,
            opponentSubmarines,
          });

          return torpedoDamageUtility;
        }
      );

      const coordinatesThreatUtility = calculateCoordinatesThreatUtility({
        gameMap,
        coordinates: possibleLocationToMoveTo,
        mySubmarine,
        opponentSubmarines,
      });

      return average([utility, 1 - coordinatesThreatUtility]);
    }
  );

  const vector = createVectorFromCoordinates({ source: mySubmarine.coordinates, target: params });
  const direction = transformVectorToDirection(vector);

  return {
    type: ECommand.MOVE,
    utility,
    parameters: {
      direction,
      chargeCommand: chooseChargeCommand({
        mySubmarine,
        opponentSubmarines,
        gameMap,
      }),
    },
  };
};
