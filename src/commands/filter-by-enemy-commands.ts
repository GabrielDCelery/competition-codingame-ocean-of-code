import { ISubmarine } from '../submarines';
import { ECommand, ESonarResult } from './enums';
import {
  ICommand,
  ISonarCommandParameters,
  ITorpedoCommandParameters,
  ITriggerCommandParameters,
} from './interfaces';
import { getDamageTakenFromTorpedo, getDamageTakenFromMine } from '../weapons';
import { getSectorForCoordinates, IGameMap } from '../maps';
/*
const createListOfSubmarinesFromProcessedCommand = ({
  gameMap,
  ownMinHealth,
  ownSubmarine,
  enemyCommand,
  enemySonarResult,
}: {
  gameMap: IGameMap;
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
      const damageTaken = getDamageTakenFromTorpedo({
        submarineCoordinates: ownSubmarine.coordinates,
        detonatedAtCoordinates: coordinates,
      });
      ownSubmarine.health = ownSubmarine.health - damageTaken;
      if (ownSubmarine.health < ownMinHealth) {
        return [];
      }
      return [ownSubmarine];
    }

    case ECommand.MINE: {
      return [ownSubmarine];
    }

    case ECommand.TRIGGER: {
      const { coordinates } = parameters as ITriggerCommandParameters;
      const damageTaken = getDamageTakenFromMine({
        submarineCoordinates: ownSubmarine.coordinates,
        detonatedAtCoordinates: coordinates,
      });
      ownSubmarine.health = ownSubmarine.health - damageTaken;
      if (ownSubmarine.health < ownMinHealth) {
        return [];
      }
      return [ownSubmarine];
    }

    case ECommand.SONAR: {
      const { sector } = parameters as ISonarCommandParameters;
      const mySector = getSectorForCoordinates({ coordinates: ownSubmarine.coordinates, gameMap });
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
*/
/*
export const getSubmarinesFilteredByEnemyCommands = ({
  gameMap,
  ownMinHealth,
  ownSubmarines,
  enemyCommands,
  enemySonarResult,
}: {
  gameMap: IGameMap;
  ownMinHealth: number;
  ownSubmarines: ISubmarine[];
  enemyCommands: ICommand[];
  enemySonarResult: ESonarResult;
}): ISubmarine[] => {
  const { width, height } = gameMap;
  let finalList: ISubmarine[] = ownSubmarines;

  enemyCommands.forEach(enemyCommand => {
    const newFilteredSubmarinesList: ISubmarine[] = [];
    const newFilteredSubmarinesMatrix: ISubmarine[][] = new Array(width)
      .fill(null)
      .map(() => new Array(height).fill(null));

    finalList.forEach(ownSubmarine => {
      createListOfSubmarinesFromProcessedCommand({
        gameMap,
        ownMinHealth,
        ownSubmarine,
        enemyCommand,
        enemySonarResult,
      }).forEach(newFilteredSubmarine => {
        const { x, y } = newFilteredSubmarine.coordinates;
        if (newFilteredSubmarinesMatrix[x][y] === null) {
          newFilteredSubmarinesMatrix[x][y] = newFilteredSubmarine;
          return;
        }

        newFilteredSubmarinesMatrix[x][y].walkabilityMatrix = transposeWalkabilityMatrixes([
          newFilteredSubmarinesMatrix[x][y].walkabilityMatrix,
          newFilteredSubmarine.walkabilityMatrix,
        ]);
      });
    });

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (newFilteredSubmarinesMatrix[x][y] !== null) {
          newFilteredSubmarinesList.push(newFilteredSubmarinesMatrix[x][y]);
        }
      }
    }

    finalList = [...newFilteredSubmarinesList];
  });

  return finalList;
};
*/

const filterSubmarinesByTorpedoCommand = ({
  ownMinHealth,
  ownSubmarines,
  enemyCommand,
}: {
  ownMinHealth: number;
  ownSubmarines: ISubmarine[];
  enemyCommand: ICommand;
}): ISubmarine[] => {
  const final: ISubmarine[] = [];
  const { parameters } = enemyCommand;
  const { coordinates } = parameters as ITriggerCommandParameters;

  ownSubmarines.forEach(ownSubmarine => {
    const damageTaken = getDamageTakenFromMine({
      submarineCoordinates: ownSubmarine.coordinates,
      detonatedAtCoordinates: coordinates,
    });
    ownSubmarine.health = ownSubmarine.health - damageTaken;
    if (ownSubmarine.health < ownMinHealth) {
      return;
    }
    final.push(ownSubmarine);
  });

  return final;
};

const filterSubmarinesByTriggerCommand = ({
  ownMinHealth,
  ownSubmarines,
  enemyCommand,
}: {
  ownMinHealth: number;
  ownSubmarines: ISubmarine[];
  enemyCommand: ICommand;
}): ISubmarine[] => {
  const final: ISubmarine[] = [];
  const { parameters } = enemyCommand;
  const { coordinates } = parameters as ITorpedoCommandParameters;

  ownSubmarines.forEach(ownSubmarine => {
    const damageTaken = getDamageTakenFromTorpedo({
      submarineCoordinates: ownSubmarine.coordinates,
      detonatedAtCoordinates: coordinates,
    });
    ownSubmarine.health = ownSubmarine.health - damageTaken;
    if (ownSubmarine.health < ownMinHealth) {
      return;
    }
    final.push(ownSubmarine);
  });

  return final;
};

const filterSubmarinesBySonarCommand = ({
  gameMap,
  ownSubmarines,
  enemyCommand,
  enemySonarResult,
}: {
  gameMap: IGameMap;
  ownSubmarines: ISubmarine[];
  enemyCommand: ICommand;
  enemySonarResult: ESonarResult;
}): ISubmarine[] => {
  const final: ISubmarine[] = [];
  const { parameters } = enemyCommand;
  const { sector } = parameters as ISonarCommandParameters;

  ownSubmarines.forEach(ownSubmarine => {
    const mySector = getSectorForCoordinates({ coordinates: ownSubmarine.coordinates, gameMap });
    if (enemySonarResult === ESonarResult.YES) {
      if (mySector === sector) {
        return final.push(ownSubmarine);
      }

      return;
    }
    if (enemySonarResult === ESonarResult.NO) {
      if (mySector === sector) {
        return;
      }

      return final.push(ownSubmarine);
    }
    throw new Error(`Unexpected result for processing sonar action`);
  });

  return final;
};

export const getSubmarinesFilteredByEnemyCommands = ({
  gameMap,
  ownMinHealth,
  ownSubmarines,
  enemyCommands,
  enemySonarResult,
}: {
  gameMap: IGameMap;
  ownMinHealth: number;
  ownSubmarines: ISubmarine[];
  enemyCommands: ICommand[];
  enemySonarResult: ESonarResult;
}): ISubmarine[] => {
  enemyCommands.forEach(enemyCommand => {
    const { type } = enemyCommand;
    switch (type) {
      case ECommand.UNKNOWN: {
        return;
      }

      case ECommand.MOVE: {
        return;
      }

      case ECommand.SURFACE: {
        return;
      }

      case ECommand.SILENCE: {
        return;
      }

      case ECommand.MINE: {
        return;
      }

      case ECommand.SONAR: {
        ownSubmarines = filterSubmarinesBySonarCommand({
          gameMap,
          ownSubmarines,
          enemyCommand,
          enemySonarResult,
        });
        return;
      }

      case ECommand.TORPEDO: {
        ownSubmarines = filterSubmarinesByTorpedoCommand({
          ownMinHealth,
          ownSubmarines,
          enemyCommand,
        });
        return;
      }

      case ECommand.TRIGGER: {
        ownSubmarines = filterSubmarinesByTriggerCommand({
          ownMinHealth,
          ownSubmarines,
          enemyCommand,
        });
        return;
      }

      default: {
        throw new Error(`Could not process enemyCommand -> ${type}`);
      }
    }
  });

  return ownSubmarines;
};
