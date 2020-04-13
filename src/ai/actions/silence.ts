import { TActionUtilityCalculator } from './interfaces';
import { ECommand, ECharge } from '../../commands';
import {
  areCoordinatesWalkable,
  ICoordinates,
  transformDirectionToVector,
  EDirection,
  addVectorToCoordinates,
  multiplyVector,
} from '../../maps';
import { chooseHighestUtility, normalizedLogistic, weightedAverage } from '../utility-helpers';
import { calculateMoveToCoordinatestUtility, calculateDesireToHideUtility } from '../utilities';
import { CHARGE_SILENCE, RANGE_SILENCE } from '../../constants';

interface IPossibleMove {
  direction: EDirection;
  amount: number;
  coordinatesMoveTo: ICoordinates;
}

export const calculateSilenceActionUtility: TActionUtilityCalculator = ({
  mySubmarine,
  myPhantomSubmarines,
  opponentSubmarines,
  gameMap,
}) => {
  if (mySubmarine.charges[ECharge.SILENCE] < CHARGE_SILENCE) {
    return {
      type: ECommand.SILENCE,
      utility: 0,
      parameters: {},
    };
  }

  const possibleMoves: IPossibleMove[] = [];

  [EDirection.N, EDirection.S, EDirection.W, EDirection.E].forEach(direction => {
    const vector = transformDirectionToVector(direction);
    for (let range = 0; range <= RANGE_SILENCE; range++) {
      const targetCoordinates = addVectorToCoordinates({
        coordinates: mySubmarine.coordinates,
        vector: multiplyVector({ vector, amount: range }),
      });
      if (
        !areCoordinatesWalkable({
          coordinates: targetCoordinates,
          walkabilityMatrix: mySubmarine.walkabilityMatrix,
        })
      ) {
        return;
      }

      possibleMoves.push({
        direction,
        amount: range,
        coordinatesMoveTo: targetCoordinates,
      });
    }
  });

  const availableMovesUtility = normalizedLogistic({
    value: possibleMoves.length,
    max: 17,
  });

  const desireToHideUtility = calculateDesireToHideUtility({
    phantomSubmarines: myPhantomSubmarines,
    gameMap,
  });

  const { utility, params } = chooseHighestUtility<IPossibleMove>(
    possibleMoves,
    ({ coordinatesMoveTo }) => {
      const moveToCoordinatesUtility = calculateMoveToCoordinatestUtility({
        coordinatesMoveFrom: mySubmarine.coordinates,
        coordinatesMoveTo,
        gameMap,
        mySubmarine,
        opponentSubmarines,
      });

      return weightedAverage([
        { weight: 0.2, value: availableMovesUtility },
        { weight: 0.5, value: desireToHideUtility },
        { weight: 0.3, value: moveToCoordinatesUtility },
      ]);
    }
  );

  const { direction, amount } = params;

  return {
    type: ECommand.SILENCE,
    utility,
    parameters: {
      direction,
      amount,
    },
  };
};
