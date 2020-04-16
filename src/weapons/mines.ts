import {
  ICoordinates,
  IMineField,
  areCoordinatesTheSame,
  getDistanceBetweenCoordinates,
  getNeighbouringCells,
  getNeighbouringCellsIncludingDiagonal,
  transformCoordinatesToKey,
  transformKeyToCoordinates,
  IGameMap,
  areCoordinatesWalkable,
} from '../maps';
import { DAMAGE_MINE } from '../constants';

export interface IMineTracker {
  mineCount: number;
  mines: {
    [index: string]: { [index: string]: true };
  };
  triggerCount: number;
  triggers: {
    [index: string]: ICoordinates;
  };
}

export const createBlankMineField = (gameMap: IGameMap): IMineField => {
  const { width, height } = gameMap;
  return new Array(width).fill(null).map(() => new Array(height).fill(0));
};

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
  gameMap,
  deployedFrom,
  mineTracker,
}: {
  gameMap: IGameMap;
  deployedFrom: ICoordinates;
  mineTracker: IMineTracker;
}): void => {
  const neighbouringCoordinatesList = getNeighbouringCells(deployedFrom).filter(coordinates => {
    return areCoordinatesWalkable({
      coordinates,
      walkabilityMatrix: gameMap.walkabilityMatrix,
    });
  });
  mineTracker.mines[mineTracker.mineCount] = {};
  neighbouringCoordinatesList.forEach(coordinates => {
    mineTracker.mines[mineTracker.mineCount][transformCoordinatesToKey(coordinates)] = true;
  });
  mineTracker.mineCount += 1;
};

export const appendTriggerToTracker = ({
  triggeredAt,
  mineTracker,
}: {
  triggeredAt: ICoordinates;
  mineTracker: IMineTracker;
}): void => {
  mineTracker.triggers[mineTracker.triggerCount] = triggeredAt;
  mineTracker.triggerCount += 1;
};

export const mergeMineTrackers = (mineTrackers: IMineTracker[]): IMineTracker => {
  const mergedMineTracker: IMineTracker = {
    mineCount: mineTrackers[0].mineCount,
    mines: {},
    triggerCount: mineTrackers[0].triggerCount,
    triggers: mineTrackers[0].triggers,
  };

  for (let i = 0; i < mergedMineTracker.mineCount; i++) {
    let minesMap: { [index: string]: true } = {};

    mineTrackers.forEach(mineTracker => {
      minesMap = {
        ...minesMap,
        ...mineTracker.mines[i],
      };
    });

    mergedMineTracker.mines[i] = minesMap;
  }

  return mergedMineTracker;
};

/*
export const filterMineDeploysByTriggers = (mineTracker: IMineTracker): void => {
  if (mineTracker.triggerCount === 0) {
    return;
  }

  const possibleDeployLocationsAsKeys = getNeighbouringCells(mineTracker).map(
    transformCoordinatesToKey
  );
  const temp: { [index: string]: string[] } = {};

  for (let i = 0, iMax = mineTracker.deployCount; i < iMax; i++) {
    for (let j = 0, jMax = possibleDeployLocationsAsKeys.length; j < jMax; j++) {
      const possibleDeployLocationKey = possibleDeployLocationsAsKeys[j];

      if (mineTracker.deploys[i][possibleDeployLocationKey] === true) {
        temp[i] = temp[i] || [];
        temp[i].push(possibleDeployLocationKey);
      }
    }
  }

  console.error(temp);
};
*/
export const calculateMineProbabilityMatrix = ({
  gameMap,
  mineTrackers,
}: {
  gameMap: IGameMap;
  mineTrackers: IMineTracker[];
}): IMineField => {
  const { width, height } = gameMap;
  const probabilityMatrix = new Array(width).fill(null).map(() => new Array(height).fill(0));
  const numOfMineTrackers = mineTrackers.length;

  mineTrackers.forEach(mineTracker => {
    const { mineCount } = mineTracker;
    for (let i = 0, iMax = mineCount; i < iMax; i++) {
      const possibleMineLocationsAsKeys = Object.keys(mineTracker.mines[i]);
      const numOfPossibleLocationsForMine = possibleMineLocationsAsKeys.length;

      possibleMineLocationsAsKeys.forEach(possibleMineLocationAsKey => {
        const { x, y } = transformKeyToCoordinates(possibleMineLocationAsKey);

        probabilityMatrix[x][y] = probabilityMatrix[x][y] || new Array(mineCount).fill(0);
        probabilityMatrix[x][y][i] += 1 / numOfPossibleLocationsForMine / numOfMineTrackers;
      });
    }
  });

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (Array.isArray(probabilityMatrix[x][y])) {
        probabilityMatrix[x][y] =
          1 - probabilityMatrix[x][y].reduce((a: number, b: number) => (1 - b) * a, 1);
      }
    }
  }

  return probabilityMatrix;
};
