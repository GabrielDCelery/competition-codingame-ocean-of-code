import {
  ICoordinates,
  getNeighbouringCellsIncludingDiagonal,
  isCoordinatesInCoordinatesList,
  transformCoordinatesToKey,
} from '../maps';
import BaseAction, { IWeightedAction } from './base-action';
import { CONST_TORPEDO_RANGE, CONST_TORPEDO_DAMAGE } from '../constants';
import { ECommand } from '../command-interpreter';

const expectedUtilityForDamage = ({
  damageToMe,
  damageToMyOpponent,
  myHealth,
  opponentHealth,
  maxDamage,
}: {
  damageToMe: number;
  damageToMyOpponent: number;
  myHealth: number;
  opponentHealth: number;
  maxDamage: number;
}): number => {
  if (opponentHealth <= damageToMyOpponent && damageToMe < myHealth) {
    return 1;
  }

  if (0 < damageToMe) {
    return 0;
  }

  if (0 < damageToMyOpponent) {
    return maxDamage === damageToMyOpponent ? 1 : 0.8;
  }

  return 0;
};

const calculateDamage = ({
  direct,
  collateral,
}: {
  direct: boolean;
  collateral: boolean;
}): number => {
  if (direct) {
    return CONST_TORPEDO_DAMAGE;
  }

  if (collateral) {
    return CONST_TORPEDO_DAMAGE / 2;
  }

  return 0;
};

export class TorpedoAction extends BaseAction {
  calculateUtility(): IWeightedAction {
    if (this.mySubmarine.isTorpedoReady() === false) {
      return {
        type: ECommand.TORPEDO,
        utility: 0,
      };
    }

    const myHealth = this.mySubmarine.getLife();
    const myLocation = this.mySubmarine.getPosition();
    const gameMap = this.mySubmarine.getGameMap();

    const opponentHealth = this.phantomSubmarineTracker.getOpponentLife();
    const possibleOpponentLocationsMap = this.phantomSubmarineTracker.getPossibleLocationsMap();
    const numOfPossibleLocationsForOpponent = Object.keys(possibleOpponentLocationsMap).length;

    const possibleLocationsToFireAt = gameMap.getReachableCoordinatesAtDistance({
      coordinates: myLocation,
      maxDistance: CONST_TORPEDO_RANGE,
    });

    let bestUtility = -1;
    let coordinatesToFireAt: ICoordinates = myLocation;

    possibleLocationsToFireAt.forEach(possibleLocationToFireAt => {
      const utilities: number[] = [];
      const possibleLocationsToCatchDamage = getNeighbouringCellsIncludingDiagonal(
        possibleLocationToFireAt
      );
      const doesItHitMe = isCoordinatesInCoordinatesList(myLocation, [possibleLocationToFireAt]);
      const doITakeCollateral = isCoordinatesInCoordinatesList(
        myLocation,
        possibleLocationsToCatchDamage
      );

      const damageToMe = calculateDamage({ direct: doesItHitMe, collateral: doITakeCollateral });
      const locationHitAtAsKey = transformCoordinatesToKey(possibleLocationToFireAt);

      if (possibleOpponentLocationsMap[locationHitAtAsKey] === true) {
        utilities.push(
          expectedUtilityForDamage({
            damageToMe,
            damageToMyOpponent: calculateDamage({ direct: true, collateral: false }),
            myHealth,
            opponentHealth,
            maxDamage: CONST_TORPEDO_DAMAGE,
          })
        );
      } else {
        utilities.push(0);
      }

      possibleLocationsToCatchDamage.forEach(possibleLocationToCatchDamage => {
        const locationCaughtDamageAsKey = transformCoordinatesToKey(possibleLocationToCatchDamage);
        if (possibleOpponentLocationsMap[locationCaughtDamageAsKey] === true) {
          utilities.push(
            expectedUtilityForDamage({
              damageToMe,
              damageToMyOpponent: calculateDamage({ direct: false, collateral: true }),
              myHealth,
              opponentHealth,
              maxDamage: CONST_TORPEDO_DAMAGE,
            })
          );
        } else {
          utilities.push(0);
        }
      });

      const utility =
        utilities.reduce((a, b) => {
          return a + b;
        }, 0) / numOfPossibleLocationsForOpponent;

      if (bestUtility < utility) {
        bestUtility = utility;
        coordinatesToFireAt = possibleLocationToFireAt;
      }
    });

    return {
      type: ECommand.TORPEDO,
      utility: bestUtility,
      parameters: { coordinates: coordinatesToFireAt },
    };
  }
}

export default TorpedoAction;
