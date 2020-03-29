import {
  ICoordinates,
  getNeighbouringCellsIncludingDiagonal,
  getDistanceBetweenCoordinates,
  areCoordinatesTheSame,
} from '../maps';
import { DAMAGE_MINE } from '../constants';

export const getDamageTakenFromMine = ({
  submarineCoordinates,
  detonatedAtCoordinates,
}: {
  submarineCoordinates: ICoordinates;
  detonatedAtCoordinates: ICoordinates;
}): number => {
  if (2 < getDistanceBetweenCoordinates(submarineCoordinates, detonatedAtCoordinates)) {
    return 0;
  }

  if (areCoordinatesTheSame(submarineCoordinates, detonatedAtCoordinates)) {
    return DAMAGE_MINE;
  }
  const splashCoordinatesList = getNeighbouringCellsIncludingDiagonal(detonatedAtCoordinates);
  for (let i = 0, iMax = splashCoordinatesList.length; i < iMax; i++) {
    if (areCoordinatesTheSame(submarineCoordinates, splashCoordinatesList[i])) {
      return DAMAGE_MINE / 2;
    }
  }
  return 0;
};
