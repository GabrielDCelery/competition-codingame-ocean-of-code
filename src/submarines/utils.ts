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
  return {
    health: submarine.health,
    coordinates: { x: submarine.coordinates.x, y: submarine.coordinates.y },
    lastCommands: submarine.lastCommands.slice(0),
    charges: {
      ...submarine.charges,
    },
    mines: submarine.mines.slice(0),
    walkabilityMatrix: submarine.walkabilityMatrix.map(e => e.slice(0)),
  };
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
  submarine.charges[ECharge.TORPEDO] = Math.min(
    submarine.charges[ECharge.TORPEDO] + amount,
    CHARGE_TORPEDO
  );
  submarine.charges[ECharge.SONAR] = Math.min(
    submarine.charges[ECharge.SONAR] + amount,
    CHARGE_SONAR
  );
  submarine.charges[ECharge.MINE] = Math.min(submarine.charges[ECharge.MINE] + amount, CHARGE_MINE);
  submarine.charges[ECharge.SILENCE] = Math.min(
    submarine.charges[ECharge.SILENCE] + amount,
    CHARGE_SILENCE
  );

  return submarine;
};

export const useChargeForPhantomSubmarine = ({
  submarine,
  type,
}: {
  submarine: ISubmarine;
  type: ECharge;
}): ISubmarine => {
  submarine.charges[ECharge.TORPEDO] =
    submarine.charges[ECharge.TORPEDO] - (type === ECharge.TORPEDO ? CHARGE_TORPEDO : 0);
  submarine.charges[ECharge.SONAR] =
    submarine.charges[ECharge.SONAR] - (type === ECharge.SONAR ? CHARGE_SONAR : 0);
  submarine.charges[ECharge.MINE] =
    submarine.charges[ECharge.MINE] - (type === ECharge.MINE ? CHARGE_MINE : 0);
  submarine.charges[ECharge.SILENCE] =
    submarine.charges[ECharge.SILENCE] - (type === ECharge.SILENCE ? CHARGE_SILENCE : 0);

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
