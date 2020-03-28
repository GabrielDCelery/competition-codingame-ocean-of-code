import { ECharge, ICommand } from '../commands';
import { ICoordinates, IVisitedMap } from '../maps';

export interface ISubmarine {
  health: number;
  coordinates: ICoordinates;
  commands: {
    last: ICommand[];
  };
  charges: {
    [ECharge.TORPEDO]: number;
    [ECharge.SONAR]: number;
    [ECharge.SILENCE]: number;
    [ECharge.MINE]: number;
  };
  maps: {
    visited: IVisitedMap;
  };
}

export interface INewSubmarineState {
  x: number;
  y: number;
  health: number;
  torpedoCooldown: number;
  sonarCooldown: number;
  silenceCooldown: number;
  mineCooldown: number;
}
