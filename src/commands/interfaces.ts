import { EDirection, ICoordinates } from '../maps';
import { ECommand, ECharge } from './enums';

export interface ICommandParameters {
  direction?: EDirection;
  sector?: number;
  coordinates?: ICoordinates;
  amount?: number;
  chargeCommand?: ECharge;
}

export interface ICommand {
  type: ECommand;
  parameters: ICommandParameters;
}

export interface IMoveCommandParameters {
  direction: EDirection;
  chargeCommand?: ECharge;
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

export interface IMineCommandParameters {
  direction?: EDirection;
}

export interface IMineCommand extends ICommand {
  type: ECommand.MINE;
  parameters: IMineCommandParameters;
}

export interface ITriggerCommandParameters {
  coordinates: ICoordinates;
}

export interface ITriggerCommand extends ICommand {
  type: ECommand.TRIGGER;
  parameters: ITriggerCommandParameters;
}
