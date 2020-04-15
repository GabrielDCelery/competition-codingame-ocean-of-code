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

const DIRECT_DAMAGE_INDEX = 0;
const SPLASH_DAMAGE_INDEX = 1;

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
const calculateSingleDeployProbabilityMap = ({
  mineId,
  mineTrackers,
}: {
  mineId: string;
  mineTrackers: IMineTracker[];
}): any => {
  const probabilityMap: any = {};
  const numOfMineTrackers = mineTrackers.length;

  mineTrackers.forEach(mineTracker => {
    const mineLocationsAsKeys = Object.keys(mineTracker.mines[mineId]);
    const numOfMines = mineLocationsAsKeys.length;

    mineLocationsAsKeys.forEach(mineLocationAsKey => {
      probabilityMap[mineLocationAsKey] = probabilityMap[mineLocationAsKey] || 0;
      probabilityMap[mineLocationAsKey] += 1 / numOfMines / numOfMineTrackers;
    });
  });

  return probabilityMap;
};

const convertSingleDeployProbabilityMapToDamageProbabilityMap = ({
  gameMap,
  singleDeployProbabilityMap,
}: {
  gameMap: IGameMap;
  singleDeployProbabilityMap: any;
}): any => {
  const damageProbabilityMap: any = {};

  Object.keys(singleDeployProbabilityMap).forEach(detonatedAtLocationKey => {
    damageProbabilityMap[detonatedAtLocationKey] = damageProbabilityMap[detonatedAtLocationKey] || [
      0,
      0,
    ];
    damageProbabilityMap[detonatedAtLocationKey][DIRECT_DAMAGE_INDEX] +=
      singleDeployProbabilityMap[detonatedAtLocationKey];

    getNeighbouringCells(transformKeyToCoordinates(detonatedAtLocationKey))
      .filter(coordinates => {
        return areCoordinatesWalkable({
          coordinates,
          walkabilityMatrix: gameMap.walkabilityMatrix,
        });
      })
      .forEach(splashCoordinates => {
        const splashLocationKey = transformCoordinatesToKey(splashCoordinates);
        damageProbabilityMap[splashLocationKey] = damageProbabilityMap[splashLocationKey] || [0, 0];
        damageProbabilityMap[splashLocationKey][SPLASH_DAMAGE_INDEX] +=
          singleDeployProbabilityMap[detonatedAtLocationKey];
      });
  });

  return damageProbabilityMap;
};

export const createMineFieldUsingMineTrackers = ({
  gameMap,
  mineTrackers,
}: {
  gameMap: IGameMap;
  mineTrackers: IMineTracker[];
}): [IMineField, IMineField] => {
  const damageProbabilityMaps: any[] = [];

  for (let i = 0, iMax = mineTrackers[0].mineCount; i < iMax; i++) {
    const singleDeployProbabilityMap = calculateSingleDeployProbabilityMap({
      mineId: `${i}`,
      mineTrackers,
    });

    const singleDamageProbabilityMap = convertSingleDeployProbabilityMapToDamageProbabilityMap({
      gameMap,
      singleDeployProbabilityMap,
    });

    damageProbabilityMaps.push(singleDamageProbabilityMap);
  }

  const directDamageProbabilityMap: any = {};
  const splashDamageProbabilityMap: any = {};

  damageProbabilityMaps.forEach(damageProbabilityMap => {
    Object.keys(damageProbabilityMap).forEach(key => {
      directDamageProbabilityMap[key] = directDamageProbabilityMap[key] || [];
      splashDamageProbabilityMap[key] = splashDamageProbabilityMap[key] || [];
      directDamageProbabilityMap[key].push(damageProbabilityMap[key][DIRECT_DAMAGE_INDEX]);
      splashDamageProbabilityMap[key].push(damageProbabilityMap[key][SPLASH_DAMAGE_INDEX]);
    });
  });

  const mineDirectDamageProbabilityMatrix = createBlankMineField(gameMap);
  const mineSplashDamageProbabilityMatrix = createBlankMineField(gameMap);

  Object.keys(directDamageProbabilityMap).forEach(key => {
    const { x, y } = transformKeyToCoordinates(key);

    mineDirectDamageProbabilityMatrix[x][y] =
      directDamageProbabilityMap[key].length === 1
        ? directDamageProbabilityMap[key][0]
        : 1 - directDamageProbabilityMap[key].reduce((a: number, b: number) => (1 - b) * a, 1);

    mineSplashDamageProbabilityMatrix[x][y] =
      splashDamageProbabilityMap[key].length === 1
        ? splashDamageProbabilityMap[key][0]
        : 1 - splashDamageProbabilityMap[key].reduce((a: number, b: number) => (1 - b) * a, 1);
  });

  return [mineDirectDamageProbabilityMatrix, mineSplashDamageProbabilityMatrix];
};
