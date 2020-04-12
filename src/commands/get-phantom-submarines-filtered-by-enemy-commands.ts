import { IPhantomSubmarine } from '../submarines';
import { ECommand, ESonarResult } from './enums';
import {
  ICommand,
  ISonarCommandParameters,
  ITorpedoCommandParameters,
  ITriggerCommandParameters,
} from './interfaces';
import { getDamageTakenFromTorpedo, getDamageTakenFromMine } from '../weapons';
import { getSectorForCoordinates, IGameMap } from '../maps';

const filterSubmarinesByTorpedoCommand = ({
  enemyCommand,
  phantomSubmarineMinHealth,
  phantomSubmarines,
}: {
  enemyCommand: ICommand;
  phantomSubmarineMinHealth: number;
  phantomSubmarines: IPhantomSubmarine[];
}): IPhantomSubmarine[] => {
  const final: IPhantomSubmarine[] = [];
  const { parameters } = enemyCommand;
  const { coordinates } = parameters as ITriggerCommandParameters;

  phantomSubmarines.forEach(phantomSubmarine => {
    const damageTaken = getDamageTakenFromMine({
      submarineCoordinates: phantomSubmarine.coordinates,
      detonatedAtCoordinates: coordinates,
    });
    phantomSubmarine.health = phantomSubmarine.health - damageTaken;
    if (phantomSubmarine.health < phantomSubmarineMinHealth) {
      return;
    }
    final.push(phantomSubmarine);
  });

  return final;
};

const filterSubmarinesByTriggerCommand = ({
  enemyCommand,
  phantomSubmarineMinHealth,
  phantomSubmarines,
}: {
  enemyCommand: ICommand;
  phantomSubmarineMinHealth: number;
  phantomSubmarines: IPhantomSubmarine[];
}): IPhantomSubmarine[] => {
  const final: IPhantomSubmarine[] = [];
  const { parameters } = enemyCommand;
  const { coordinates } = parameters as ITorpedoCommandParameters;

  phantomSubmarines.forEach(phantomSubmarine => {
    const damageTaken = getDamageTakenFromTorpedo({
      submarineCoordinates: phantomSubmarine.coordinates,
      detonatedAtCoordinates: coordinates,
    });
    phantomSubmarine.health = phantomSubmarine.health - damageTaken;
    if (phantomSubmarine.health < phantomSubmarineMinHealth) {
      return;
    }
    final.push(phantomSubmarine);
  });

  return final;
};

const filterSubmarinesBySonarCommand = ({
  enemyCommand,
  enemySonarResult,
  gameMap,
  phantomSubmarines,
}: {
  enemyCommand: ICommand;
  enemySonarResult: ESonarResult;
  gameMap: IGameMap;
  phantomSubmarines: IPhantomSubmarine[];
}): IPhantomSubmarine[] => {
  const final: IPhantomSubmarine[] = [];
  const { parameters } = enemyCommand;
  const { sector } = parameters as ISonarCommandParameters;

  phantomSubmarines.forEach(phantomSubmarine => {
    const mySector = getSectorForCoordinates({
      coordinates: phantomSubmarine.coordinates,
      gameMap,
    });

    if (enemySonarResult === ESonarResult.YES) {
      if (mySector === sector) {
        return final.push(phantomSubmarine);
      }

      return;
    }
    if (enemySonarResult === ESonarResult.NO) {
      if (mySector === sector) {
        return;
      }

      return final.push(phantomSubmarine);
    }
    throw new Error(`Unexpected result for processing sonar action`);
  });

  return final;
};

export const getPhantomSubmarinesFilteredByEnemyCommands = ({
  gameMap,
  phantomSubmarineMinHealth,
  phantomSubmarines,
  enemyCommands,
  enemySonarResult,
}: {
  gameMap: IGameMap;
  phantomSubmarineMinHealth: number;
  phantomSubmarines: IPhantomSubmarine[];
  enemyCommands: ICommand[];
  enemySonarResult: ESonarResult;
}): IPhantomSubmarine[] => {
  let filteredSubmarines: IPhantomSubmarine[] = [...phantomSubmarines];

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
        filteredSubmarines = filterSubmarinesBySonarCommand({
          gameMap,
          phantomSubmarines: filteredSubmarines,
          enemyCommand,
          enemySonarResult,
        });
        return;
      }

      case ECommand.TORPEDO: {
        filteredSubmarines = filterSubmarinesByTorpedoCommand({
          phantomSubmarineMinHealth,
          phantomSubmarines: filteredSubmarines,
          enemyCommand,
        });
        return;
      }

      case ECommand.TRIGGER: {
        filteredSubmarines = filterSubmarinesByTriggerCommand({
          phantomSubmarineMinHealth,
          phantomSubmarines: filteredSubmarines,
          enemyCommand,
        });
        return;
      }

      default: {
        throw new Error(`Could not process enemyCommand -> ${type}`);
      }
    }
  });

  return filteredSubmarines;
};
