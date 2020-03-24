import { EDirection, ICoordinates, IVector, transformDirectionToVector } from './maps';
import { IWeightedAction } from './actions';
import MySubmarine from './my-submarine';

export enum ECommand {
  NA = 'NA',
  MOVE = 'MOVE',
  SURFACE = 'SURFACE',
  TORPEDO = 'TORPEDO',
}

export interface DoNothingCommand {
  type: ECommand.NA;
}

export interface IMoveCommand {
  type: ECommand.MOVE;
  vector: IVector;
}

export interface ISurfaceCommand {
  type: ECommand.SURFACE;
  sector: number;
}

export interface ITorpedoCommand {
  type: ECommand.TORPEDO;
  coordinates: ICoordinates;
}

export type TCommand = DoNothingCommand | IMoveCommand | ISurfaceCommand | ITorpedoCommand;

const COMMANDS_DELIMITER = '|';
const COMMAND_PARAMS_DELIMITER = ' ';

class CommandInterpreter {
  private transformCommandStringToCommand(commandString: string): TCommand {
    const [command, ...params] = commandString
      .split(COMMAND_PARAMS_DELIMITER)
      .map(elem => elem.trim());

    switch (command) {
      case ECommand.NA: {
        return { type: ECommand.NA };
      }

      case ECommand.MOVE: {
        const direction = params[0] as EDirection;
        return {
          type: ECommand.MOVE,
          vector: transformDirectionToVector(direction),
        };
      }

      case ECommand.SURFACE: {
        return {
          type: ECommand.SURFACE,
          sector: parseInt(params[0]),
        };
      }

      case ECommand.TORPEDO: {
        const [x, y] = params.map(elem => parseInt(elem, 10));
        return {
          type: ECommand.TORPEDO,
          coordinates: { x, y },
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
