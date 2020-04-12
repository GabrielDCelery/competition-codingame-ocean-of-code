import { ECharge, ICommand } from '../commands';
import {
  ICoordinates,
  IGameMap,
  TWalkabilityMatrix,
  cloneWalkabilityMatrix,
  createTerrainWalkabilityMatrix,
} from '../maps';
import { CHARGE_MINE, CHARGE_SILENCE, CHARGE_TORPEDO, CHARGE_SONAR } from '../constants';

export interface IRealSubmarine {
  health: number;
  charges: {
    [ECharge.TORPEDO]: number;
    [ECharge.SONAR]: number;
    [ECharge.SILENCE]: number;
    [ECharge.MINE]: number;
  };
  coordinates: ICoordinates;
  lastCommands: ICommand[];
  walkabilityMatrix: TWalkabilityMatrix;
  mines: ICoordinates[];
}

export const createRealSubmarine = ({
  health,
  coordinates,
  gameMap,
}: {
  health: number;
  coordinates: ICoordinates;
  gameMap: IGameMap;
}): IRealSubmarine => {
  return {
    health,
    coordinates,
    lastCommands: [],
    charges: {
      [ECharge.TORPEDO]: 0,
      [ECharge.SONAR]: 0,
      [ECharge.SILENCE]: 0,
      [ECharge.MINE]: 0,
    },
    walkabilityMatrix: createTerrainWalkabilityMatrix(gameMap),
    mines: [],
  };
};

export const cloneRealSubmarine = ({
  submarine,
}: {
  submarine: IRealSubmarine;
}): IRealSubmarine => {
  return {
    health: submarine.health,
    coordinates: submarine.coordinates,
    lastCommands: submarine.lastCommands.slice(0),
    charges: { ...submarine.charges },
    walkabilityMatrix: cloneWalkabilityMatrix(submarine.walkabilityMatrix),
    mines: [...submarine.mines],
  };
};

export const chargeRealSubmarine = ({
  submarine,
  type,
  amount,
}: {
  submarine: IRealSubmarine;
  type: ECharge;
  amount: number;
}): IRealSubmarine => {
  switch (type) {
    case ECharge.TORPEDO: {
      submarine.charges[ECharge.TORPEDO] = Math.min(
        CHARGE_TORPEDO,
        (submarine.charges[ECharge.TORPEDO] += amount)
      );
      return submarine;
    }
    case ECharge.SONAR: {
      submarine.charges[ECharge.SONAR] = Math.min(
        CHARGE_SONAR,
        (submarine.charges[ECharge.SONAR] += amount)
      );
      return submarine;
    }

    case ECharge.MINE: {
      submarine.charges[ECharge.MINE] = Math.min(
        CHARGE_MINE,
        (submarine.charges[ECharge.MINE] += amount)
      );
      return submarine;
    }

    case ECharge.SILENCE: {
      submarine.charges[ECharge.SILENCE] = Math.min(
        CHARGE_SILENCE,
        (submarine.charges[ECharge.SILENCE] += amount)
      );
      return submarine;
    }

    default: {
      throw new Error(`Invalid charge command -> ${type}`);
    }
  }
};
