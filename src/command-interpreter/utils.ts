import { EDirection, uTransformDirectionToVector } from '../maps';
import { ECommand, EChargeCommand } from './enums';
import {
  ICommand,
  IMoveCommandParameters,
  ITorpedoCommandParameters,
  ISonarCommandParameters,
  ISilenceCommandParameters,
} from './interfaces';

const COMMANDS_DELIMITER = '|';
const COMMAND_PARAMS_DELIMITER = ' ';

export const uTransformCommandStringToCommand = (commandString: string): ICommand => {
  const [command, ...restOfParams] = commandString
    .split(COMMAND_PARAMS_DELIMITER)
    .map(elem => elem.trim());

  switch (command) {
    case ECommand.NA: {
      return { type: ECommand.NA, parameters: {} };
    }

    case ECommand.MOVE: {
      const direction = restOfParams[0] as EDirection;
      const chargeCommand = restOfParams[1] as EChargeCommand;
      return {
        type: ECommand.MOVE,
        parameters: { direction, ...(chargeCommand ? { chargeCommand } : {}) },
      };
    }

    case ECommand.SURFACE: {
      const sector = parseInt(restOfParams[0], 10);
      return { type: ECommand.SURFACE, parameters: { sector } };
    }

    case ECommand.TORPEDO: {
      const [x, y] = restOfParams.map(elem => parseInt(elem, 10));
      return {
        type: ECommand.TORPEDO,
        parameters: { coordinates: { x, y } },
      };
    }

    case ECommand.SONAR: {
      const sector = parseInt(restOfParams[0], 10);
      return {
        type: ECommand.SONAR,
        parameters: { sector },
      };
    }

    case ECommand.SILENCE: {
      const vector = restOfParams[0]
        ? uTransformDirectionToVector(restOfParams[0] as EDirection)
        : null;
      const amount = restOfParams[1] ? parseInt(restOfParams[1], 10) : null;

      return {
        type: ECommand.SILENCE,
        parameters: {
          ...(vector ? { vector } : {}),
          ...(amount ? { amount } : {}),
        },
      };
    }

    default: {
      console.error(`Could not process command -> ${command}`);
    }
  }

  throw new Error(`Could not process command -> ${command}`);
};

export const uTransformCommandsStringToCommands = (commandsString: string): ICommand[] => {
  return commandsString.split(COMMANDS_DELIMITER).map(commandString => {
    return uTransformCommandStringToCommand(commandString.trim());
  });
};

export const uTransformCommandsToCommandString = (commands: ICommand[]): string => {
  const [command] = commands;
  const { type, parameters } = command;

  switch (type) {
    case ECommand.NA: {
      return `${ECommand.SURFACE}`;
    }

    case ECommand.MOVE: {
      const { direction, chargeCommand } = parameters as IMoveCommandParameters;
      return `${ECommand.MOVE} ${direction} ${chargeCommand}`;
    }

    case ECommand.SURFACE: {
      //const { sector } = parameters as ISurfaceCommandParameters;
      return `${ECommand.SURFACE}`;
    }

    case ECommand.TORPEDO: {
      const { coordinates } = parameters as ITorpedoCommandParameters;
      const { x, y } = coordinates;
      return `${ECommand.TORPEDO} ${x} ${y}`;
    }

    case ECommand.SONAR: {
      const { sector } = parameters as ISonarCommandParameters;
      return `${ECommand.SONAR} ${sector}`;
    }

    case ECommand.SILENCE: {
      const { direction, amount } = parameters as ISilenceCommandParameters;
      return `${ECommand.SILENCE} ${direction} ${amount}`;
    }

    default: {
      console.error(`Could not process command -> ${command}`);
    }
  }

  throw new Error(`Could not process command -> ${command}`);
};
