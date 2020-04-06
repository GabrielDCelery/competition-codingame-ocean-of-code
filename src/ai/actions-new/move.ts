import { TActionUtilityCalculator } from './interfaces';
import { ECommand } from '../../commands';
import { chooseHighestUtility, calculateTorpedoDamageUtility } from '../utils';
import {
  ICoordinates,
  getNeighbouringCells,
  transformVectorToDirection,
  createVectorFromCoordinates,
  areCoordinatesWalkable,
} from '../../maps';
import { chooseChargeCommand } from './move-charge';
import { weightedAverage } from '../../common';
import {
  calculateFreeMovementUtility,
  calculatThreatOfBeingShotAtCoordinatesUtility,
} from '../utilities';

export const calculateMoveActionUtility: TActionUtilityCalculator = ({
  mySubmarine,
  opponentSubmarines,
  gameMap,
}) => {
  const possibleLocationsToMoveTo = getNeighbouringCells(mySubmarine.coordinates).filter(
    coordinates => {
      return areCoordinatesWalkable({
        coordinates,
        walkabilityMatrix: mySubmarine.walkabilityMatrix,
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
      const freeMovementUtility = calculateFreeMovementUtility({
        coordinatesToMoveFrom: mySubmarine.coordinates,
        coordinatesToMoveTo: possibleLocationToMoveTo,
        gameMap,
        walkabilityMatrix: mySubmarine.walkabilityMatrix,
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

      const coordinatesThreatUtility = calculatThreatOfBeingShotAtCoordinatesUtility({
        gameMap,
        coordinates: possibleLocationToMoveTo,
        targetSubmarine: mySubmarine,
        possibleSourceSubmarines: opponentSubmarines,
      });

      return weightedAverage([
        {
          weight: 0.2,
          value: utility,
        },
        {
          weight: 0.6,
          value: 1 - coordinatesThreatUtility,
        },
        {
          weight: 0.2,
          value: freeMovementUtility,
        },
      ]);
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
