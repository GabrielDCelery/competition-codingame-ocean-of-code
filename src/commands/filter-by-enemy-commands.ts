import { ISubmarine } from '../submarines';
import { ECommand, ESonarResult } from './enums';
import { ICommand, ISonarCommandParameters, ITorpedoCommandParameters } from './interfaces';
import { getTorpedoSplashDamageMap } from '../weapons';
import { transformCoordinatesToKey, getSectorForCoordinates, IGameMapDimensions } from '../maps';

const createListOfSubmarinesFromProcessedCommand = ({
  gameMapDimensions,
  ownMinHealth,
  ownSubmarine,
  enemyCommand,
  enemySonarResult,
}: {
  gameMapDimensions: IGameMapDimensions;
  ownMinHealth: number;
  ownSubmarine: ISubmarine;
  enemyCommand: ICommand;
  enemySonarResult: ESonarResult;
}): ISubmarine[] => {
  const { type, parameters } = enemyCommand;

  switch (type) {
    case ECommand.UNKNOWN: {
      return [ownSubmarine];
    }

    case ECommand.MOVE: {
      return [ownSubmarine];
    }

    case ECommand.SURFACE: {
      return [ownSubmarine];
    }

    case ECommand.SILENCE: {
      return [ownSubmarine];
    }

    case ECommand.TORPEDO: {
      const { coordinates } = parameters as ITorpedoCommandParameters;
      const damageMap = getTorpedoSplashDamageMap(coordinates);
      const damageTaken = damageMap[transformCoordinatesToKey(ownSubmarine.coordinates)] || 0;
      ownSubmarine.health = ownSubmarine.health - damageTaken;
      if (ownSubmarine.health < ownMinHealth) {
        return [];
      }
      return [ownSubmarine];
    }

    case ECommand.SONAR: {
      const { sector } = parameters as ISonarCommandParameters;
      const mySector = getSectorForCoordinates({
        coordinates: ownSubmarine.coordinates,
        gameMapDimensions,
      });
      if (enemySonarResult === ESonarResult.YES) {
        return mySector === sector ? [ownSubmarine] : [];
      }
      if (enemySonarResult === ESonarResult.NO) {
        return mySector === sector ? [] : [ownSubmarine];
      }
      throw new Error(`Unexpected result for processing sonar action`);
    }

    default: {
      throw new Error(`Could not process enemyCommand -> ${type}`);
    }
  }
};

export const getSubmarinesFilteredByEnemyCommands = ({
  gameMapDimensions,
  ownMinHealth,
  ownSubmarines,
  enemyCommands,
  enemySonarResult,
}: {
  gameMapDimensions: IGameMapDimensions;
  ownMinHealth: number;
  ownSubmarines: ISubmarine[];
  enemyCommands: ICommand[];
  enemySonarResult: ESonarResult;
}): ISubmarine[] => {
  let filteredSubmarines: ISubmarine[] = ownSubmarines;

  enemyCommands.forEach(enemyCommand => {
    let newFilteredSubmarines: ISubmarine[] = [];

    filteredSubmarines.forEach(ownSubmarine => {
      const newFilteredSubmarinesFromCommand = createListOfSubmarinesFromProcessedCommand({
        gameMapDimensions,
        ownMinHealth,
        ownSubmarine,
        enemyCommand,
        enemySonarResult,
      });

      newFilteredSubmarines = [...newFilteredSubmarines, ...newFilteredSubmarinesFromCommand];
    });

    filteredSubmarines = [...newFilteredSubmarines];
  });

  return filteredSubmarines;
};
