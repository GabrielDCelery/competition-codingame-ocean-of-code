import {
  getDamageTakenFromTorpedo,
  canTorpedoDirectlyHitTheTarget,
  canTorpedoSplashDamageTheTarget,
} from '../../weapons';
import { ISubmarine } from '../../submarines';
import { ICoordinates, IGameMap } from '../../maps';
import { ECharge } from '../../commands';
import { CHARGE_TORPEDO, DAMAGE_TORPEDO } from '../../constants';
import { calculateDamageUtility } from './damage';
import { averageUtilities } from '../utility-helpers';

export const calculatThreatOfBeingShotAtCoordinatesUtility = ({
  gameMap,
  coordinates,
  targetSubmarine,
  possibleSourceSubmarines,
}: {
  gameMap: IGameMap;
  coordinates: ICoordinates;
  targetSubmarine: ISubmarine;
  possibleSourceSubmarines: ISubmarine[];
}): number => {
  if (possibleSourceSubmarines[0].charges[ECharge.TORPEDO] < CHARGE_TORPEDO - 1) {
    return 0;
  }

  return averageUtilities<ISubmarine>(possibleSourceSubmarines, sourceSubmarine => {
    if (
      canTorpedoDirectlyHitTheTarget({
        source: sourceSubmarine.coordinates,
        target: coordinates,
        gameMap,
      }) ||
      canTorpedoSplashDamageTheTarget({
        source: sourceSubmarine.coordinates,
        target: coordinates,
        gameMap,
      })
    ) {
      const damageToTarget = getDamageTakenFromTorpedo({
        submarineCoordinates: targetSubmarine.coordinates,
        detonatedAtCoordinates: coordinates,
      });
      const damageToSource = getDamageTakenFromTorpedo({
        submarineCoordinates: sourceSubmarine.coordinates,
        detonatedAtCoordinates: coordinates,
      });

      return calculateDamageUtility({
        maxDamage: DAMAGE_TORPEDO,
        damageToTarget,
        damageToSource,
        targetHealth: targetSubmarine.health,
        sourceHealth: sourceSubmarine.health,
      });
    }

    return 0;
  });
};
