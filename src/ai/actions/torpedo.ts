import {
  ICoordinates,
  uGetNeighbouringCellsIncludingDiagonal,
  uIsCoordinatesInCoordinatesList,
  uTransformCoordinatesToKey,
  getReachableCoordinatesAtDistance,
} from '../../maps';
import BaseAction, { IWeightedCommand } from './base-action';
import { RANGE_TORPEDO, DAMAGE_TORPEDO, CHARGE_TORPEDO } from '../../constants';
import { ECommand, ECharge } from '../../commands';

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
    return DAMAGE_TORPEDO;
  }

  if (collateral) {
    return DAMAGE_TORPEDO / 2;
  }

  return 0;
};

export class TorpedoAction extends BaseAction {
  calculateUtility(): IWeightedCommand {
    if (this.gameState.players.me.real.charges[ECharge.TORPEDO] < CHARGE_TORPEDO) {
      return {
        type: ECommand.TORPEDO,
        utility: 0,
        parameters: {},
      };
    }

    const myHealth = this.gameState.players.me.real.health;
    const myLocation = this.gameState.players.me.real.coordinates;

    const opponentHealth = this.gameState.players.opponent.phantoms[0].health;
    const possibleOpponentLocationsMap: { [index: string]: boolean } = {};
    this.gameState.players.opponent.phantoms.forEach(submarine => {
      possibleOpponentLocationsMap[uTransformCoordinatesToKey(submarine.coordinates)] = true;
    });
    const numOfPossibleLocationsForOpponent = this.gameState.players.opponent.phantoms.length;

    const possibleLocationsToFireAt = getReachableCoordinatesAtDistance({
      coordinates: myLocation,
      maxDistance: RANGE_TORPEDO,
      gameMapDimensions: this.gameState.map.dimensions,
      terrainMap: this.gameState.map.terrain,
    });

    let bestUtility = -1;
    let coordinatesToFireAt: ICoordinates = myLocation;

    possibleLocationsToFireAt.forEach(possibleLocationToFireAt => {
      const utilities: number[] = [];
      const possibleLocationsToCatchDamage = uGetNeighbouringCellsIncludingDiagonal(
        possibleLocationToFireAt
      );
      const doesItHitMe = uIsCoordinatesInCoordinatesList(myLocation, [possibleLocationToFireAt]);
      const doITakeCollateral = uIsCoordinatesInCoordinatesList(
        myLocation,
        possibleLocationsToCatchDamage
      );

      const damageToMe = calculateDamage({ direct: doesItHitMe, collateral: doITakeCollateral });
      const locationHitAtAsKey = uTransformCoordinatesToKey(possibleLocationToFireAt);

      if (possibleOpponentLocationsMap.hasOwnProperty(locationHitAtAsKey)) {
        utilities.push(
          expectedUtilityForDamage({
            damageToMe,
            damageToMyOpponent: calculateDamage({ direct: true, collateral: false }),
            myHealth,
            opponentHealth,
            maxDamage: DAMAGE_TORPEDO,
          })
        );
      } else {
        utilities.push(0);
      }

      possibleLocationsToCatchDamage.forEach(possibleLocationToCatchDamage => {
        const locationCaughtDamageAsKey = uTransformCoordinatesToKey(possibleLocationToCatchDamage);
        if (possibleOpponentLocationsMap.hasOwnProperty(locationCaughtDamageAsKey)) {
          utilities.push(
            expectedUtilityForDamage({
              damageToMe,
              damageToMyOpponent: calculateDamage({ direct: false, collateral: true }),
              myHealth,
              opponentHealth,
              maxDamage: DAMAGE_TORPEDO,
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
