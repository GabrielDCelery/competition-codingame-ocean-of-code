import { ECharge, ICommand } from '../commands';
import {
  ICoordinates,
  IGameMap,
  cloneWalkabilityMatrix,
  createTerrainWalkabilityMatrix,
} from '../maps';
import { CHARGE_MINE, CHARGE_SILENCE, CHARGE_TORPEDO, CHARGE_SONAR } from '../constants';
import { ISubmarine, INewSubmarineState } from './interfaces';

export interface IRealSubmarine extends ISubmarine {
  lastCommands: ICommand[];
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
  const { x, y } = coordinates;
  const walkabilityMatrix = createTerrainWalkabilityMatrix(gameMap);
  walkabilityMatrix[x][y] = false;

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
    walkabilityMatrix,
    mines: [],
  };
};

export const cloneRealSubmarine = (submarine: IRealSubmarine): IRealSubmarine => {
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

export const applyNewStateToRealSubmarine = ({
  submarine,
  newState,
}: {
  submarine: IRealSubmarine;
  newState: INewSubmarineState;
}): IRealSubmarine => {
  const { x, y, health, torpedoCooldown, sonarCooldown, silenceCooldown, mineCooldown } = newState;
  submarine.health = health;
  submarine.coordinates = { x, y };
  submarine.charges = {
    [ECharge.TORPEDO]: CHARGE_TORPEDO - (torpedoCooldown < 0 ? 0 : torpedoCooldown),
    [ECharge.SONAR]: CHARGE_SONAR - (sonarCooldown < 0 ? 0 : sonarCooldown),
    [ECharge.MINE]: CHARGE_MINE - (mineCooldown < 0 ? 0 : mineCooldown),
    [ECharge.SILENCE]: CHARGE_SILENCE - (silenceCooldown < 0 ? 0 : silenceCooldown),
  };

  return submarine;
};
