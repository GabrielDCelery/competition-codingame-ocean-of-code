import { ECommand, ECharge } from '../../commands';
import {
  areCoordinatesWalkable,
  EDirection,
  transformDirectionToVector,
  addVectorToCoordinates,
  multiplyVector,
  ICoordinates,
} from '../../maps';
import { TActionUtilityCalculator } from './base-action';
import { CHARGE_SILENCE, RANGE_SILENCE } from '../../constants';
import {
  calculateGeneralThreatUtility,
  calculateSilenceMoveValueUtility,
  chooseHighestUtility,
} from '../utils';
import { weightedAverage } from '../../common';

interface IPossibleMove {
  direction: EDirection;
  amount: number;
  coordinates: ICoordinates;
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

  const generalThreatUtility = calculateGeneralThreatUtility({
    gameMap,
    mySubmarine,
    myPhantomSubmarines,
    opponentSubmarines,
  });

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
        coordinates: targetCoordinates,
      });
    }
  });

  const { utility, params } = chooseHighestUtility<IPossibleMove>(
    possibleMoves,
    ({ coordinates }) => {
      return calculateSilenceMoveValueUtility({ coordinates, mySubmarine });
    }
  );

  const combinedUtility = weightedAverage([
    { value: generalThreatUtility, weight: 0.8 },
    { value: utility, weight: 0.2 },
  ]);

  const { direction, amount } = params;

  return {
    type: ECommand.SILENCE,
    utility: combinedUtility,
    parameters: {
      direction,
      amount,
    },
  };
};
