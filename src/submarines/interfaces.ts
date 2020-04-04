import { ECharge, ICommand } from '../commands';
import { ICoordinates, TWalkabilityMatrix } from '../maps';

export interface ISubmarine {
  health: number;
  coordinates: ICoordinates;
  lastCommands: ICommand[];
  walkabilityMatrix: TWalkabilityMatrix;
  mines: ICoordinates[];
  charges: {
    [ECharge.TORPEDO]: number;
    [ECharge.SONAR]: number;
    [ECharge.SILENCE]: number;
    [ECharge.MINE]: number;
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
