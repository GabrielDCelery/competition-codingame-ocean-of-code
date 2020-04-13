import { ECharge } from '../commands';
import {
  ICoordinates,
  IGameMap,
  cloneWalkabilityMatrix,
  createTerrainWalkabilityMatrix,
} from '../maps';
import { CHARGE_MINE, CHARGE_SILENCE, CHARGE_TORPEDO, CHARGE_SONAR } from '../constants';
import { ISubmarine } from './interfaces';
import { IMineTracker } from '../weapons';

export interface IPhantomSubmarine extends ISubmarine {
  mineTracker: IMineTracker;
}

export const createPhantomSubmarine = ({
  health,
  coordinates,
  gameMap,
}: {
  health: number;
  coordinates: ICoordinates;
  gameMap: IGameMap;
}): IPhantomSubmarine => {
  const { x, y } = coordinates;
  const walkabilityMatrix = createTerrainWalkabilityMatrix(gameMap);
  walkabilityMatrix[x][y] = false;

  return {
    health,
    coordinates,
    charges: {
      [ECharge.TORPEDO]: 0,
      [ECharge.SONAR]: 0,
      [ECharge.SILENCE]: 0,
      [ECharge.MINE]: 0,
    },
    walkabilityMatrix,
    mineTracker: {
      count: 0,
      deploys: {},
    },
  };
};

export const clonePhantomSubmarine = (submarine: IPhantomSubmarine): IPhantomSubmarine => {
  return {
    health: submarine.health,
    coordinates: submarine.coordinates,
    charges: { ...submarine.charges },
    walkabilityMatrix: cloneWalkabilityMatrix(submarine.walkabilityMatrix),
    mineTracker: JSON.parse(JSON.stringify(submarine.mineTracker)),
  };
};

export const chargePhantomSubmarine = ({
  submarine,
  amount,
}: {
  submarine: IPhantomSubmarine;
  amount: number;
}): IPhantomSubmarine => {
  submarine.charges = {
    [ECharge.TORPEDO]: Math.min(submarine.charges[ECharge.TORPEDO] + amount, CHARGE_TORPEDO),
    [ECharge.SONAR]: Math.min(submarine.charges[ECharge.SONAR] + amount, CHARGE_SONAR),
    [ECharge.MINE]: Math.min(submarine.charges[ECharge.MINE] + amount, CHARGE_MINE),
    [ECharge.SILENCE]: Math.min(submarine.charges[ECharge.SILENCE] + amount, CHARGE_SILENCE),
  };

  return submarine;
};

export const useChargeForPhantomSubmarine = ({
  submarine,
  type,
}: {
  submarine: IPhantomSubmarine;
  type: ECharge;
}): IPhantomSubmarine => {
  submarine.charges = {
    [ECharge.TORPEDO]:
      submarine.charges[ECharge.TORPEDO] - (type === ECharge.TORPEDO ? CHARGE_TORPEDO : 0),
    [ECharge.SONAR]: submarine.charges[ECharge.SONAR] - (type === ECharge.SONAR ? CHARGE_SONAR : 0),
    [ECharge.MINE]: submarine.charges[ECharge.MINE] - (type === ECharge.MINE ? CHARGE_MINE : 0),
    [ECharge.SILENCE]:
      submarine.charges[ECharge.SILENCE] - (type === ECharge.SILENCE ? CHARGE_SILENCE : 0),
  };

  return submarine;
};
