import { ISubmarine, INewSubmarineState } from './interfaces';
import { ECharge } from '../commands';
import { ICoordinates, IGameMapDimensions, createVisitedMap } from '../maps';
import { CHARGE_MINE, CHARGE_SILENCE, CHARGE_TORPEDO, CHARGE_SONAR } from '../constants';

export const createSubmarine = ({
  health,
  coordinates,
  gameMapDimensions,
}: {
  health: number;
  coordinates: ICoordinates;
  gameMapDimensions: IGameMapDimensions;
}): ISubmarine => {
  return {
    health,
    coordinates,
    commands: {
      last: [],
    },
    charges: {
      [ECharge.TORPEDO]: 0,
      [ECharge.SONAR]: 0,
      [ECharge.SILENCE]: 0,
      [ECharge.MINE]: 0,
    },
    maps: {
      visited: createVisitedMap(gameMapDimensions),
    },
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
