import { getDamageTakenFromMine } from '../../weapons';
import { ISubmarine } from '../../submarines';
import { ICoordinates } from '../../maps';
import { DAMAGE_TORPEDO } from '../../constants';
import { calculateDamageUtility } from './damage';
import { averageUtilities } from '../utility-helpers';

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

  return averageUtilities<ISubmarine>(possibleTargetSubmarines, possibleTargetSubmarine => {
    const damageToTarget = getDamageTakenFromMine({
      submarineCoordinates: possibleTargetSubmarine.coordinates,
      detonatedAtCoordinates: coordinatesToDetonateAt,
    });

    return calculateDamageUtility({
      maxDamage: DAMAGE_TORPEDO,
      damageToSource,
      damageToTarget,
      sourceHealth: sourceSubmarine.health,
      targetHealth: possibleTargetSubmarine.health,
    });
  });
};
