import { getDamageTakenFromMine } from '../../weapons';
import { ISubmarine } from '../../submarines';
import { ICoordinates } from '../../maps';
import { DAMAGE_MINE } from '../../constants';

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
  if (opponentHealth <= damageToMyOpponent && damageToMe < myHealth) {
    return 1;
  }

  if (0 < damageToMe) {
    return 0;
  }

  if (0 < damageToMyOpponent) {
    return DAMAGE_MINE === damageToMyOpponent ? 1 : 0.9;
  }

  return 0;
};

export const calculateMineDamageUtility = ({
  coordinatesToDetonateAt,
  mySubmarine,
  opponentSubmarines,
}: {
  coordinatesToDetonateAt: ICoordinates;
  mySubmarine: ISubmarine;
  opponentSubmarines: ISubmarine[];
}): number => {
  const damageToMe = getDamageTakenFromMine({
    submarineCoordinates: mySubmarine.coordinates,
    detonatedAtCoordinates: coordinatesToDetonateAt,
  });

  let utility = 0;

  opponentSubmarines.forEach(opponentSubmarine => {
    const damageToMyOpponent = getDamageTakenFromMine({
      submarineCoordinates: opponentSubmarine.coordinates,
      detonatedAtCoordinates: coordinatesToDetonateAt,
    });

    utility +=
      getUtilityForDamage({
        damageToMe,
        damageToMyOpponent,
        myHealth: mySubmarine.health,
        opponentHealth: opponentSubmarine.health,
      }) / opponentSubmarines.length;
  });

  return utility;
};
