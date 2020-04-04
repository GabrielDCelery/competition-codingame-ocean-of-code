import { TActionUtilityCalculator } from './base-action';
import { ECommand } from '../../commands';
import {
  calculateCoordinatesThreatUtility,
  chooseHighestUtility,
  calculateTorpedoDamageUtility,
  calculateFreeMovementUtility,
} from '../utils';
import {
  ICoordinates,
  isCellWalkable,
  getNeighbouringCells,
  transformVectorToDirection,
  createVectorFromCoordinates,
  createWalkabilityMatrix,
} from '../../maps';
import { chooseChargeCommand } from './charge';
import { average } from '../../common';

export const calculateMoveActionUtility: TActionUtilityCalculator = ({
  mySubmarine,
  opponentSubmarines,
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
      const walkabilityMatrix = createWalkabilityMatrix({
        currentlyAtCoordinates: mySubmarine.coordinates,
        gameMap,
        visitedMap: mySubmarine.maps.visited,
      });

      const freeMovementUtility = calculateFreeMovementUtility({
        coordinatesToMoveTo: possibleLocationToMoveTo,
        gameMap,
        walkabilityMatrix,
      });

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

      return average([utility, 1 - coordinatesThreatUtility, freeMovementUtility]);
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
