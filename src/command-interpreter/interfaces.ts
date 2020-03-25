import { EDirection, ICoordinates } from '../maps';
import { ECommand, EChargeCommand } from './enums';

export interface ICommandParameters {
  direction?: EDirection;
  sector?: number;
  coordinates?: ICoordinates;
  amount?: number;
  chargeCommand?: EChargeCommand;
}

export interface ICommand {
  type: ECommand;
  parameters: ICommandParameters;
}

export interface DoNothingCommand extends ICommand {
  type: ECommand.NA;
}

export interface IMoveCommandParameters {
  direction: EDirection;
  chargeCommand?: EChargeCommand;
}

export interface IMoveCommand extends ICommand {
  type: ECommand.MOVE;
  parameters: IMoveCommandParameters;
}

export interface ISurfaceCommandParameters {
  sector: number;
}

export interface ISurfaceCommand extends ICommand {
  type: ECommand.SURFACE;
  parameters: ISurfaceCommandParameters;
}

export interface ITorpedoCommandParameters {
  coordinates: ICoordinates;
}

export interface ITorpedoCommand extends ICommand {
  type: ECommand.TORPEDO;
  parameters: ITorpedoCommandParameters;
}

export interface ISonarCommandParameters {
  sector: number;
}

export interface ISonarCommand extends ICommand {
  type: ECommand.SONAR;
  parameters: ISonarCommandParameters;
}

export interface ISilenceCommandParameters {
  direction?: EDirection;
  amount?: number;
}

export interface ISilenceCommand extends ICommand {
  type: ECommand.SILENCE;
  parameters: ISilenceCommandParameters;
}
