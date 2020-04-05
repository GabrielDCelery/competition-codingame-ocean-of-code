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
