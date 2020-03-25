import { EDirection, ICoordinates, IVector, transformDirectionToVector } from './maps';
import { IWeightedAction } from './actions';
import MySubmarine from './my-submarine';

export enum ECommand {
  NA = 'NA',
  MOVE = 'MOVE',
  SURFACE = 'SURFACE',
  TORPEDO = 'TORPEDO',
  SONAR = 'SONAR',
  SILENCE = 'SILENCE',
}

export interface ICommand {
  type: ECommand;
  parameters: any;
}

export interface DoNothingCommand extends ICommand {
  type: ECommand.NA;
}

export interface IMoveCommand extends ICommand {
  type: ECommand.MOVE;
  parameters: {
    vector: IVector;
  };
}

export interface ISurfaceCommand {
  type: ECommand.SURFACE;
  parameters: {
    sector: number;
  };
}

export interface ITorpedoCommand {
  type: ECommand.TORPEDO;
  parameters: {
    coordinates: ICoordinates;
  };
}

export type TCommand =
  | ICommand
  | DoNothingCommand
  | IMoveCommand
  | ISurfaceCommand
  | ITorpedoCommand;

const COMMANDS_DELIMITER = '|';
const COMMAND_PARAMS_DELIMITER = ' ';

class CommandInterpreter {
  private transformCommandStringToCommand(commandString: string): TCommand {
    const [command, ...params] = commandString
      .split(COMMAND_PARAMS_DELIMITER)
      .map(elem => elem.trim());

    switch (command) {
      case ECommand.NA: {
        return { type: ECommand.NA, parameters: {} };
      }

      case ECommand.MOVE: {
        const vector = transformDirectionToVector(params[0] as EDirection);
        return {
          type: ECommand.MOVE,
          parameters: { vector },
        };
      }

      case ECommand.SURFACE: {
        const sector = parseInt(params[0]);
        return {
          type: ECommand.SURFACE,
          parameters: { sector },
        };
      }

      case ECommand.TORPEDO: {
        const [x, y] = params.map(elem => parseInt(elem, 10));
        return {
          type: ECommand.TORPEDO,
          parameters: { coordinates: { x, y } },
        };
      }

      default: {
        console.error(`Could not process command -> ${command}`);
      }
    }

    throw new Error(`Could not process command -> ${command}`);
  }

  transformCommandsStringToCommands(opponentCommandsString: string): TCommand[] {
    return opponentCommandsString.split(COMMANDS_DELIMITER).map(commandString => {
      return this.transformCommandStringToCommand(commandString.trim());
    });
  }

  transformCommandsToCommandString({
    commands,
    mySubmarine,
  }: {
    commands: IWeightedAction[];
    mySubmarine: MySubmarine;
  }): string {
    const [command] = commands;
    const { type, parameters } = command;

    switch (type) {
      case ECommand.NA: {
        mySubmarine.getGameMap().resetHaveBeenVisitedCells();
        return `${ECommand.SURFACE}`;
      }

      case ECommand.MOVE: {
        const myLocation = mySubmarine.getPosition();
        mySubmarine
          .getGameMap()
          .setCellHasBeenVisited({ hasBeenVisited: true, coordinates: myLocation });

        return `${ECommand.MOVE} ${parameters.direction} ${parameters.chargeCommand}`;
      }

      case ECommand.SURFACE: {
        mySubmarine.getGameMap().resetHaveBeenVisitedCells();
        return `${ECommand.SURFACE}`;
      }

      case ECommand.TORPEDO: {
        return `${ECommand.TORPEDO} ${parameters.coordinates.x} ${parameters.coordinates.y}`;
      }

      default: {
        console.error(`Could not process command -> ${command}`);
      }
    }

    throw new Error(`Could not process command -> ${command}`);
  }
}

export default new CommandInterpreter();
