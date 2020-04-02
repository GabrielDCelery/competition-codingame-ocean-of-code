import { getDamageTakenFromMine } from '../../weapons';
import { ISubmarine } from '../../submarines';
import { ICoordinates, IGameMap, createWalkabilityMatrix, TWalkabilityMatrix } from '../../maps';
import { DAMAGE_MINE } from '../../constants';

export const calculateBoxInUtility = ({
  coordinatesToMoveTo,
  walkabilityMatrix,
}: {
  coordinatesToMoveTo: ICoordinates;
  walkabilityMatrix: TWalkabilityMatrix;
}): number => {
  createWalkabilityMatrix({ gameMap, visitedMap: mySubmarine.maps.visited });

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
