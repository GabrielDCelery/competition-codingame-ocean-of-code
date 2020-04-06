import { getDamageTakenFromTorpedo } from '../../weapons';
import { ISubmarine } from '../../submarines';
import { ICoordinates } from '../../maps';
import { DAMAGE_TORPEDO } from '../../constants';
import { calculateDamageUtility } from './damage';
import { average } from '../utility-functions';

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

  const utilities = possibleTargetSubmarines.map(opponentSubmarine => {
    const damageToTarget = getDamageTakenFromTorpedo({
      submarineCoordinates: opponentSubmarine.coordinates,
      detonatedAtCoordinates: coordinatesToShootAt,
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
