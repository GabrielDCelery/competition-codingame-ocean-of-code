import {
  ICoordinates,
  uGetNeighbouringCellsIncludingDiagonal,
  uTransformCoordinatesToKey,
  uGetDistanceBetweenCoordinates,
} from '../maps';
import { DAMAGE_TORPEDO, RANGE_TORPEDO } from '../constants';

export const getTorpedoSplashDamageMap = (
  detonatedAtCoordinates: ICoordinates
): { [index: string]: number } => {
  const map: { [index: string]: number } = {};

  map[uTransformCoordinatesToKey(detonatedAtCoordinates)] = DAMAGE_TORPEDO;

  uGetNeighbouringCellsIncludingDiagonal(detonatedAtCoordinates).map(coordinates => {
    map[uTransformCoordinatesToKey(coordinates)] = DAMAGE_TORPEDO / 2;
  });

  return map;
};

export const areCoordinatesReachableByTorpedo = (
  source: ICoordinates,
  target: ICoordinates
): boolean => {
  return uGetDistanceBetweenCoordinates(source, target) <= RANGE_TORPEDO;
};

export const getDamageTakenFromTorpedo = ({
  submarineCoordinates,
  detonatedAtCoordinates,
}: {
  submarineCoordinates: ICoordinates;
  detonatedAtCoordinates: ICoordinates;
}): number => {
  const damageMap = getTorpedoSplashDamageMap(detonatedAtCoordinates);
  const damageTaken = damageMap[uTransformCoordinatesToKey(submarineCoordinates)] || 0;

  return damageTaken;
};
