import { ICoordinates, getDistanceBetweenCoordinates } from '../../maps';
import { ISubmarine } from '../../submarines';
import { averageUtilities } from '../utility-helpers';
import { calculateGeneralTargetThreatUtility } from './general-target-threat';

export const calculateOptimalDistanceFromTargetUtility = ({
  coordinatesMoveFrom,
  coordinatesMoveTo,
  sourceSubmarine,
  targetSubmarines,
}: {
  coordinatesMoveFrom: ICoordinates;
  coordinatesMoveTo: ICoordinates;
  sourceSubmarine: ISubmarine;
  targetSubmarines: ISubmarine[];
}): number => {
  const generalTargetThreatUtility = calculateGeneralTargetThreatUtility({
    sourceSubmarine,
    targetSubmarine: targetSubmarines[0],
  });

  return averageUtilities<ISubmarine>(targetSubmarines, targetSubmarine => {
    const newDistance = getDistanceBetweenCoordinates(
      coordinatesMoveTo,
      targetSubmarine.coordinates
    );

    if (newDistance === 0 || newDistance === 1) {
      return 0;
    }

    const oldDistance = getDistanceBetweenCoordinates(
      coordinatesMoveFrom,
      targetSubmarine.coordinates
    );

    return oldDistance <= newDistance ? generalTargetThreatUtility : 1 - generalTargetThreatUtility;
  });
};
