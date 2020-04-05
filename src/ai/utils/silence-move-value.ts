import { ICoordinates, getDistanceBetweenCoordinates } from '../../maps';
import { normalizeExponential } from '../../common';
import { ISubmarine } from '../../submarines';
import { RANGE_SILENCE } from '../../constants';

export const calculateSilenceMoveValueUtility = ({
  coordinates,
  mySubmarine,
}: {
  coordinates: ICoordinates;
  mySubmarine: ISubmarine;
}): number => {
  const ditance = getDistanceBetweenCoordinates(coordinates, mySubmarine.coordinates);

  return normalizeExponential({
    value: ditance,
    max: RANGE_SILENCE,
    k: 2,
  });
};
