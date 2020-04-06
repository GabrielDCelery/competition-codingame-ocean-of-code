import { getDamageTakenFromMine } from '../../weapons';
import { ISubmarine } from '../../submarines';
import { ICoordinates } from '../../maps';
import { DAMAGE_TORPEDO } from '../../constants';
import { calculateDamageUtility } from './damage';
import { average } from '../utility-functions';

export const calculateTriggerMineAtCoordinatesUtility = ({
  coordinatesToDetonateAt,
  sourceSubmarine,
  possibleTargetSubmarines,
}: {
  coordinatesToDetonateAt: ICoordinates;
  sourceSubmarine: ISubmarine;
  possibleTargetSubmarines: ISubmarine[];
}): number => {
  const damageToSource = getDamageTakenFromMine({
    submarineCoordinates: sourceSubmarine.coordinates,
    detonatedAtCoordinates: coordinatesToDetonateAt,
  });

  const utilities = possibleTargetSubmarines.map(opponentSubmarine => {
    const damageToTarget = getDamageTakenFromMine({
      submarineCoordinates: opponentSubmarine.coordinates,
      detonatedAtCoordinates: coordinatesToDetonateAt,
    });

    return calculateDamageUtility({
      maxDamage: DAMAGE_TORPEDO,
      damageToSource,
      damageToTarget,
      sourceHealth: sourceSubmarine.health,
      targetHealth: opponentSubmarine.health,
    });
  });

  return average(utilities);
};
