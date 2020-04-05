import { ISubmarine, INewSubmarineState } from './interfaces';
import { ECharge } from '../commands';
import { ICoordinates, createTerrainWalkabilityMatrix, IGameMap } from '../maps';
import { CHARGE_MINE, CHARGE_SILENCE, CHARGE_TORPEDO, CHARGE_SONAR } from '../constants';

export const createSubmarine = ({
  health,
  coordinates,
  gameMap,
}: {
  health: number;
  coordinates: ICoordinates;
  gameMap: IGameMap;
}): ISubmarine => {
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

export const cloneSubmarine = (submarine: ISubmarine): ISubmarine => {
  return JSON.parse(JSON.stringify(submarine));
};

export const setNewSubmarineState = ({
  submarine,
  newState,
}: {
  submarine: ISubmarine;
  newState: INewSubmarineState;
}): void => {
  const { x, y, health, torpedoCooldown, sonarCooldown, silenceCooldown, mineCooldown } = newState;
  submarine.health = health;
  submarine.coordinates = { x, y };
  submarine.charges = {
    [ECharge.TORPEDO]: CHARGE_TORPEDO - (torpedoCooldown < 0 ? 0 : torpedoCooldown),
    [ECharge.SONAR]: CHARGE_SONAR - (sonarCooldown < 0 ? 0 : sonarCooldown),
    [ECharge.MINE]: CHARGE_MINE - (mineCooldown < 0 ? 0 : mineCooldown),
    [ECharge.SILENCE]: CHARGE_SILENCE - (silenceCooldown < 0 ? 0 : silenceCooldown),
  };
};

export const chargePhantomSubmarine = ({
  submarine,
  amount,
}: {
  submarine: ISubmarine;
  amount: number;
}): ISubmarine => {
  submarine.charges[ECharge.TORPEDO] = submarine.charges[ECharge.TORPEDO] += amount;
  submarine.charges[ECharge.SONAR] = submarine.charges[ECharge.SONAR] += amount;
  submarine.charges[ECharge.MINE] = submarine.charges[ECharge.MINE] += amount;
  submarine.charges[ECharge.SILENCE] = submarine.charges[ECharge.SILENCE] += amount;

  return submarine;
};

export const useChargeForPhantomSubmarine = ({
  submarine,
  amount,
}: {
  submarine: ISubmarine;
  amount: number;
}): ISubmarine => {
  submarine.charges[ECharge.TORPEDO] = Math.max(0, submarine.charges[ECharge.TORPEDO] - amount);
  submarine.charges[ECharge.SONAR] = Math.max(0, submarine.charges[ECharge.SONAR] - amount);
  submarine.charges[ECharge.MINE] = Math.max(0, submarine.charges[ECharge.MINE] - amount);
  submarine.charges[ECharge.SILENCE] = Math.max(0, submarine.charges[ECharge.SILENCE] - amount);

  return submarine;
};

export const chargeRealSubmarine = ({
  submarine,
  type,
  amount,
}: {
  submarine: ISubmarine;
  type: ECharge;
  amount: number;
}): ISubmarine => {
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
