import {
  getDamageTakenFromTorpedo,
  canTorpedoDirectlyHitTheTarget,
  canTorpedoSplashDamageTheTarget,
} from '../../weapons';
import { ISubmarine } from '../../submarines';
import { ICoordinates, IGameMap } from '../../maps';
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

  const utils = opponentSubmarines.map(opponentSubmarine => {
    if (
      canTorpedoDirectlyHitTheTarget({
        source: opponentSubmarine.coordinates,
        target: coordinates,
        gameMap,
      }) ||
      canTorpedoSplashDamageTheTarget({
        source: opponentSubmarine.coordinates,
        target: coordinates,
        gameMap,
      })
    ) {
      const damageToMe = getDamageTakenFromTorpedo({
        submarineCoordinates: mySubmarine.coordinates,
        detonatedAtCoordinates: coordinates,
      });
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
    }

    return 0;
  });

  return average(utils);
};
