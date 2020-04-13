import {
  ICoordinates,
  areCoordinatesTheSame,
  getDistanceBetweenCoordinates,
  getNeighbouringCells,
  getNeighbouringCellsIncludingDiagonal,
  transformCoordinatesToKey,
  transformKeyToCoordinates,
  isCoordinatesInCoordinatesList,
} from '../maps';
import { DAMAGE_MINE } from '../constants';

export interface IMineTracker {
  count: number;
  deploys: {
    [index: string]: ICoordinates[];
  };
}

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

export const appendMineToTracker = ({
  deployedFrom,
  mineTracker,
}: {
  deployedFrom: ICoordinates;
  mineTracker: IMineTracker;
}): void => {
  mineTracker.deploys[mineTracker.count] = [deployedFrom];
  mineTracker.count += 1;
};

export const mergeMineTrackers = (mineTrackers: IMineTracker[]): IMineTracker => {
  const mergedMineTracker: IMineTracker = {
    count: 0,
    deploys: {},
  };

  mergedMineTracker.count = mineTrackers[0].count;

  for (let i = 0; i < mergedMineTracker.count; i++) {
    const coordinatesMap: { [index: string]: boolean } = {};

    mineTrackers.forEach(mineTracker => {
      mineTracker.deploys[i].forEach(coordinates => {
        coordinatesMap[transformCoordinatesToKey(coordinates)] = true;
      });
    });

    mergedMineTracker.deploys[i] = Object.keys(coordinatesMap).map(locationKey => {
      return transformKeyToCoordinates(locationKey);
    });
  }

  return mergedMineTracker;
};

export const canMineBeTriggeredAtCoordinates = ({
  triggeredAt,
  mineTracker,
}: {
  triggeredAt: ICoordinates;
  mineTracker: IMineTracker;
}): boolean => {
  const neighbouringCells = getNeighbouringCells(triggeredAt);

  for (let i = 0, iMax = mineTracker.count; i < iMax; i++) {
    for (let j = 0, jMax = mineTracker.deploys[i].length; j < jMax; j++) {
      if (
        isCoordinatesInCoordinatesList({
          coordinates: mineTracker.deploys[i][j],
          coordinatesList: neighbouringCells,
        })
      ) {
        return true;
      }
    }
  }

  return false;
};
