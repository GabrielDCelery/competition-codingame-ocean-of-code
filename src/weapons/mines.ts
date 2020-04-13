import {
  ICoordinates,
  IMineField,
  areCoordinatesTheSame,
  getDistanceBetweenCoordinates,
  getNeighbouringCells,
  getNeighbouringCellsIncludingDiagonal,
  transformCoordinatesToKey,
  transformKeyToCoordinates,
  isCoordinatesInCoordinatesList,
  IGameMap,
  areCoordinatesWalkable,
} from '../maps';
import { DAMAGE_MINE } from '../constants';

const DIRECT_DAMAGE_INDEX = 0;
const SPLASH_DAMAGE_INDEX = 1;

export interface IMineTracker {
  count: number;
  deploys: {
    [index: string]: { [index: string]: true };
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
  deployedFrom,
  mineTracker,
}: {
  deployedFrom: ICoordinates;
  mineTracker: IMineTracker;
}): void => {
  mineTracker.deploys[mineTracker.count] = { [transformCoordinatesToKey(deployedFrom)]: true };
  mineTracker.count += 1;
};

export const mergeMineTrackers = (mineTrackers: IMineTracker[]): IMineTracker => {
  const mergedMineTracker: IMineTracker = {
    count: 0,
    deploys: {},
  };

  mergedMineTracker.count = mineTrackers[0].count;

  for (let i = 0; i < mergedMineTracker.count; i++) {
    let coordinatesMap: { [index: string]: true } = {};

    mineTrackers.forEach(mineTracker => {
      coordinatesMap = {
        ...coordinatesMap,
        ...mineTracker.deploys[i],
      };
    });

    mergedMineTracker.deploys[i] = coordinatesMap;
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
    const deployCoordinates = Object.keys(mineTracker.deploys[i]).map(key => {
      return transformKeyToCoordinates(key);
    });
    for (let j = 0, jMax = deployCoordinates.length; j < jMax; j++) {
      if (
        isCoordinatesInCoordinatesList({
          coordinates: deployCoordinates[j],
          coordinatesList: neighbouringCells,
        })
      ) {
        return true;
      }
    }
  }

  return false;
};

const calculateSingleDeployProbabilityMap = ({
  gameMap,
  deployId,
  mineTrackers,
}: {
  gameMap: IGameMap;
  deployId: string;
  mineTrackers: IMineTracker[];
}): any => {
  const probabilityMap: any = {};
  const numOfMineTrackers = mineTrackers.length;

  mineTrackers.forEach(mineTracker => {
    const singleMineProbabilityMap: any = {};
    let numOfPossibleCoordinatesToDropMineTo = 0;

    Object.keys(mineTracker.deploys[deployId]).forEach(deployKey => {
      const deploy = transformKeyToCoordinates(deployKey);
      const coordinatesListToDropMineTo = getNeighbouringCells(deploy).filter(coordinates => {
        return areCoordinatesWalkable({
          coordinates,
          walkabilityMatrix: gameMap.walkabilityMatrix,
        });
      });

      numOfPossibleCoordinatesToDropMineTo += coordinatesListToDropMineTo.length;

      coordinatesListToDropMineTo.forEach(coordinatesToDropMineTo => {
        const locationKey = transformCoordinatesToKey(coordinatesToDropMineTo);
        singleMineProbabilityMap[locationKey] = singleMineProbabilityMap[locationKey] || 0;
        singleMineProbabilityMap[locationKey] += 1;
      });
    });

    Object.keys(singleMineProbabilityMap).forEach(locationKey => {
      probabilityMap[locationKey] = probabilityMap[locationKey] || 0;
      probabilityMap[locationKey] +=
        singleMineProbabilityMap[locationKey] /
        numOfPossibleCoordinatesToDropMineTo /
        numOfMineTrackers;
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

  for (let i = 0, iMax = mineTrackers[0].count; i < iMax; i++) {
    const singleDeployProbabilityMap = calculateSingleDeployProbabilityMap({
      gameMap,
      deployId: `${i}`,
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
