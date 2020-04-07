import { getDamageTakenFromTorpedo } from '../../weapons';
import { ISubmarine } from '../../submarines';
import { ICoordinates } from '../../maps';
import { DAMAGE_TORPEDO } from '../../constants';
import { calculateDamageUtility } from './damage';
import { averageUtilities } from '../utility-helpers';

export const calculateFireTorpedoAtCoordinatesUtility = ({
  coordinatesToShootAt,
  sourceSubmarine,
  possibleTargetSubmarines,
}: {
  coordinatesToShootAt: ICoordinates;
  sourceSubmarine: ISubmarine;
  possibleTargetSubmarines: ISubmarine[];
}): number => {
  const damageToSource = getDamageTakenFromTorpedo({
    submarineCoordinates: sourceSubmarine.coordinates,
    detonatedAtCoordinates: coordinatesToShootAt,
  });

  return averageUtilities<ISubmarine>(possibleTargetSubmarines, possibleTargetSubmarine => {
    const damageToTarget = getDamageTakenFromTorpedo({
      submarineCoordinates: possibleTargetSubmarine.coordinates,
      detonatedAtCoordinates: coordinatesToShootAt,
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
