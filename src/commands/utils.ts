import {
  EDirection,
  transformDirectionToVector,
  ICoordinates,
  IGameMapDimensions,
  getSectorForCoordinates,
} from '../maps';
import { ECommand, ECharge, ESonarResult } from './enums';
import {
  ICommand,
  IMoveCommandParameters,
  ITorpedoCommandParameters,
  ISonarCommandParameters,
  ISilenceCommandParameters,
  IMineCommandParameters,
  ITriggerCommandParameters,
} from './interfaces';

const COMMANDS_DELIMITER = '|';
const COMMAND_PARAMS_DELIMITER = ' ';

export const uTransformCommandStringToCommand = (commandString: string): ICommand => {
  const [command, ...restOfParams] = commandString
    .split(COMMAND_PARAMS_DELIMITER)
    .map(elem => elem.trim());

  switch (command) {
    case ECommand.MOVE: {
      const direction = restOfParams[0] as EDirection;
      const chargeCommand = restOfParams[1] as ECharge;
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
        ? transformDirectionToVector(restOfParams[0] as EDirection)
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

    case ECommand.MINE: {
      return {
        type: ECommand.MINE,
        parameters: {},
      };
    }

    case ECommand.TRIGGER: {
      const [x, y] = restOfParams.map(elem => parseInt(elem, 10));
      return {
        type: ECommand.TRIGGER,
        parameters: { coordinates: { x, y } },
      };
    }

    default: {
      return {
        type: ECommand.UNKNOWN,
        parameters: {},
      };
    }
  }
};

export const transformCommandsStringToCommands = (commandsString: string): ICommand[] => {
  return commandsString.split(COMMANDS_DELIMITER).map(commandString => {
    return uTransformCommandStringToCommand(commandString.trim());
  });
};

export const transformCommandsToCommandString = (commands: ICommand[]): string => {
  return commands
    .map(command => {
      const { type, parameters } = command;

      switch (type) {
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

        case ECommand.MINE: {
          const { direction } = parameters as IMineCommandParameters;
          return `${ECommand.MINE} ${direction}`;
        }

        case ECommand.TRIGGER: {
          const { coordinates } = parameters as ITriggerCommandParameters;
          const { x, y } = coordinates;
          return `${ECommand.TRIGGER} ${x} ${y}`;
        }

        default: {
          console.error(`Could not process command -> ${command}`);
        }
      }

      throw new Error(`Could not process command -> ${command}`);
    })
    .join(COMMANDS_DELIMITER);
};

export const uGetSonaredSectorFromCommands = (commands: ICommand[]): number | null => {
  for (let i = 0, iMax = commands.length; i < iMax; i++) {
    const { type, parameters } = commands[i];

    if (type === ECommand.SONAR) {
      const { sector } = parameters as ISonarCommandParameters;

      return sector;
    }
  }

  return null;
};

export const uGetSonarResultFromSectors = ({
  entitySector,
  targetedSector,
}: {
  entitySector: number;
  targetedSector: number | null;
}): ESonarResult => {
  if (targetedSector === null) {
    return ESonarResult.NA;
  }
  return entitySector === targetedSector ? ESonarResult.YES : ESonarResult.NO;
};

export const calculateSonarResult = ({
  gameMapDimensions,
  entityCoordinates,
  commands,
}: {
  entityCoordinates: ICoordinates;
  commands: ICommand[];
  gameMapDimensions: IGameMapDimensions;
}): ESonarResult => {
  let result = ESonarResult.NA;
  commands.forEach(command => {
    const { type, parameters } = command;
    if (type !== ECommand.SONAR) {
      return;
    }
    const entitySector = getSectorForCoordinates({
      coordinates: entityCoordinates,
      gameMapDimensions,
    });
    const { sector } = parameters as ISonarCommandParameters;

    result = entitySector === sector ? ESonarResult.YES : ESonarResult.NO;
  });
  return result;
};
