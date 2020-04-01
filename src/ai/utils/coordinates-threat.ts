import { getDamageTakenFromTorpedo, areCoordinatesReachableByTorpedo } from '../../weapons';
import { ISubmarine } from '../../submarines';
import {
  ICoordinates,
  isCellValid,
  getNeighbouringCellsIncludingDiagonal,
  IGameMap,
} from '../../maps';
import { average } from '../../common';
import { ECharge } from '../../commands';
import { CHARGE_TORPEDO } from '../../constants';

const getUtilityForDamage = ({
  damageToMe,
  damageToMyOpponent,
  myHealth,
  opponentHealth,
}: {
  damageToMe: number;
  damageToMyOpponent: number;
  myHealth: number;
  opponentHealth: number;
}): number => {
  if (damageToMyOpponent < opponentHealth && myHealth <= damageToMe) {
    return 1;
  }

  if (0 < damageToMe) {
    return 1;
  }

  return 0;
};

export const calculateCoordinatesThreatUtility = ({
  gameMap,
  coordinates,
  mySubmarine,
  opponentSubmarines,
}: {
  gameMap: IGameMap;
  coordinates: ICoordinates;
  mySubmarine: ISubmarine;
  opponentSubmarines: ISubmarine[];
}): number => {
  const opponentSubmarine = opponentSubmarines[0];

  if (opponentSubmarine.charges[ECharge.TORPEDO] < CHARGE_TORPEDO) {
    return 0;
  }

  const damageToMe = getDamageTakenFromTorpedo({
    submarineCoordinates: mySubmarine.coordinates,
    detonatedAtCoordinates: coordinates,
  });

  const directHitUtils = opponentSubmarines.map(opponentSubmarine => {
    if (areCoordinatesReachableByTorpedo(coordinates, opponentSubmarine.coordinates) === false) {
      return 0;
    }

    const damageToMyOpponent = getDamageTakenFromTorpedo({
      submarineCoordinates: opponentSubmarine.coordinates,
      detonatedAtCoordinates: coordinates,
    });

    return getUtilityForDamage({
      damageToMe,
      damageToMyOpponent,
      myHealth: mySubmarine.health,
      opponentHealth: opponentSubmarine.health,
    });
  });

  const splashDamageUtils = getNeighbouringCellsIncludingDiagonal(coordinates).map(coordinates => {
    if (isCellValid({ coordinates, gameMap }) === false) {
      return 0;
    }

    const damageToMe = getDamageTakenFromTorpedo({
      submarineCoordinates: mySubmarine.coordinates,
      detonatedAtCoordinates: coordinates,
    });

    const utils = opponentSubmarines.map(opponentSubmarine => {
      if (areCoordinatesReachableByTorpedo(coordinates, opponentSubmarine.coordinates) === false) {
        return 0;
      }

      const damageToMyOpponent = getDamageTakenFromTorpedo({
        submarineCoordinates: opponentSubmarine.coordinates,
        detonatedAtCoordinates: coordinates,
      });

      return getUtilityForDamage({
        damageToMe,
        damageToMyOpponent,
        myHealth: mySubmarine.health,
        opponentHealth: opponentSubmarine.health,
      });
    });

    return average(utils);
  });

  return average([...directHitUtils, ...splashDamageUtils]);
};
