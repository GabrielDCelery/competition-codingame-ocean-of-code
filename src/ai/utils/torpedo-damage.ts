import { getTorpedoFiredAtCoordinatesResult } from '../../weapons';
import { ISubmarine } from '../../submarines';
import { ICoordinates, IGameMap } from '../../maps';
import { DAMAGE_TORPEDO } from '../../constants';

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
    return DAMAGE_TORPEDO === damageToMyOpponent ? 1 : 0.4;
  }

  return 0;
};

export const calculateTorpedoDamageUtility = ({
  coordinatesToShootAt,
  mySubmarine,
  opponentSubmarines,
  gameMap,
}: {
  coordinatesToShootAt: ICoordinates;
  mySubmarine: ISubmarine;
  opponentSubmarines: ISubmarine[];
  gameMap: IGameMap;
}): number => {
  let utility = 0;

  opponentSubmarines.forEach(opponentSubmarine => {
    const [damageToMe, damageToMyOpponent] = getTorpedoFiredAtCoordinatesResult({
      sourceCoordinates: mySubmarine.coordinates,
      detonatedAtCoordinates: coordinatesToShootAt,
      targetCoordinates: opponentSubmarine.coordinates,
      gameMap,
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
