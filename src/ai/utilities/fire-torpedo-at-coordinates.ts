import { getTorpedoFiredAtCoordinatesResult } from '../../weapons';
import { ISubmarine } from '../../submarines';
import { ICoordinates, IGameMap } from '../../maps';
import { DAMAGE_TORPEDO } from '../../constants';
import { calculateDamageUtility } from './damage';
import { average } from '../utility-functions';

export const calculateFireTorpedoAtCoordinatesUtility = ({
  coordinatesToShootAt,
  sourceSubmarine,
  possibleTargetSubmarines,
  gameMap,
}: {
  coordinatesToShootAt: ICoordinates;
  sourceSubmarine: ISubmarine;
  possibleTargetSubmarines: ISubmarine[];
  gameMap: IGameMap;
}): number => {
  const utilities = possibleTargetSubmarines.map(opponentSubmarine => {
    const [damageToSource, damageToTarget] = getTorpedoFiredAtCoordinatesResult({
      sourceCoordinates: sourceSubmarine.coordinates,
      detonatedAtCoordinates: coordinatesToShootAt,
      targetCoordinates: opponentSubmarine.coordinates,
      gameMap,
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
