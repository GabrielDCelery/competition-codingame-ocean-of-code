import { getDamageTakenFromTorpedo } from '../../weapons';
import { ISubmarine } from '../../submarines';
import { ICoordinates } from '../../maps';
import { DAMAGE_TORPEDO, CHARGE_TORPEDO } from '../../constants';
import { calculateDamageUtility } from './damage';
import { averageUtilities } from '../utility-helpers';
import { ECharge } from '../../commands';

export const calculateFireTorpedoAtCoordinatesUtility = ({
  coordinatesToShootAt,
  sourceSubmarine,
  possibleTargetSubmarines,
}: {
  coordinatesToShootAt: ICoordinates;
  sourceSubmarine: ISubmarine;
  possibleTargetSubmarines: ISubmarine[];
}): number => {
  if (sourceSubmarine.charges[ECharge.TORPEDO] < CHARGE_TORPEDO) {
    return 0;
  }

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
