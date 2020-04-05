import { ISubmarine, cloneSubmarine, chargePhantomSubmarine } from '../submarines';
import { ECommand, ECharge } from './enums';
import {
  ICommand,
  IMoveCommandParameters,
  ITorpedoCommandParameters,
  ITriggerCommandParameters,
} from './interfaces';
import {
  areCoordinatesReachableByTorpedo,
  getDamageTakenFromMine,
  getDamageTakenFromTorpedo,
} from '../weapons';
import {
  EDirection,
  IGameMap,
  addVectorToCoordinates,
  areCoordinatesWalkable,
  createTerrainWalkabilityMatrix,
  multiplyVector,
  transformDirectionToVector,
  transposeWalkabilityMatrixes,
  transformCoordinatesToKey,
} from '../maps';
import {
  CHARGE_ANY_PER_MOVE,
  CHARGE_MINE,
  CHARGE_SILENCE,
  CHARGE_SONAR,
  CHARGE_TORPEDO,
  RANGE_SILENCE,
} from '../constants';

const filterSubmarinesByMoveCommand = ({
  ownCommand,
  ownSubmarines,
}: {
  ownCommand: ICommand;
  ownSubmarines: ISubmarine[];
}): ISubmarine[] => {
  const { parameters } = ownCommand;
  const { direction } = parameters as IMoveCommandParameters;
  const vector = transformDirectionToVector(direction);
  const final: ISubmarine[] = [];
  ownSubmarines.forEach(ownSubmarine => {
    const newCoordinates = addVectorToCoordinates({
      coordinates: ownSubmarine.coordinates,
      vector,
    });
    if (
      !areCoordinatesWalkable({
        coordinates: newCoordinates,
        walkabilityMatrix: ownSubmarine.walkabilityMatrix,
      })
    ) {
      return;
    }
    chargePhantomSubmarine({ submarine: ownSubmarine, amount: CHARGE_ANY_PER_MOVE });
    const { x, y } = ownSubmarine.coordinates;
    ownSubmarine.walkabilityMatrix[x][y] = false;
    ownSubmarine.coordinates = newCoordinates;
    final.push(ownSubmarine);
  });
  return final;
};

const filterSubmarinesBySonarCommand = ({
  ownSubmarines,
}: {
  ownSubmarines: ISubmarine[];
}): ISubmarine[] => {
  return ownSubmarines.map(ownSubmarine => {
    Object.keys(ECharge).forEach(key => {
      ownSubmarine.charges[key as ECharge] -= CHARGE_SONAR;
    });
    return ownSubmarine;
  });
};

const filterSubmarinesBySurfaceCommand = ({
  ownMinHealth,
  ownSubmarines,
  gameMap,
}: {
  ownMinHealth: number;
  ownSubmarines: ISubmarine[];
  gameMap: IGameMap;
}): ISubmarine[] => {
  const final: ISubmarine[] = [];
  ownSubmarines.forEach(ownSubmarine => {
    ownSubmarine.health = ownSubmarine.health - 1;
    if (ownSubmarine.health < ownMinHealth) {
      return;
    }
    ownSubmarine.walkabilityMatrix = createTerrainWalkabilityMatrix(gameMap);
    final.push(ownSubmarine);
  });
  return final;
};

const filterSubmarinesByTorpedoCommand = ({
  ownCommand,
  ownMinHealth,
  ownSubmarines,
}: {
  ownCommand: ICommand;
  ownMinHealth: number;
  ownSubmarines: ISubmarine[];
}): ISubmarine[] => {
  const final: ISubmarine[] = [];
  const { parameters } = ownCommand;
  const { coordinates } = parameters as ITorpedoCommandParameters;

  ownSubmarines.forEach(ownSubmarine => {
    if (areCoordinatesReachableByTorpedo(ownSubmarine.coordinates, coordinates) === false) {
      return;
    }
    const damageTaken = getDamageTakenFromTorpedo({
      submarineCoordinates: ownSubmarine.coordinates,
      detonatedAtCoordinates: coordinates,
    });
    ownSubmarine.health = ownSubmarine.health - damageTaken;
    if (ownSubmarine.health < ownMinHealth) {
      return;
    }
    Object.keys(ECharge).forEach(key => {
      ownSubmarine.charges[key as ECharge] -= CHARGE_TORPEDO;
    });
    final.push(ownSubmarine);
  });

  return final;
};

const filterSubmarinesByMineCommand = ({
  ownSubmarines,
}: {
  ownSubmarines: ISubmarine[];
}): ISubmarine[] => {
  return ownSubmarines.map(ownSubmarine => {
    Object.keys(ECharge).forEach(key => {
      ownSubmarine.charges[key as ECharge] -= CHARGE_MINE;
    });
    return ownSubmarine;
  });
};

const filterSubmarinesByTriggerCommand = ({
  ownCommand,
  ownMinHealth,
  ownSubmarines,
}: {
  ownCommand: ICommand;
  ownMinHealth: number;
  ownSubmarines: ISubmarine[];
}): ISubmarine[] => {
  const final: ISubmarine[] = [];
  const { parameters } = ownCommand;
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
    return final.push(ownSubmarine);
  });

  return final;
};

const filterSubmarinesBySilenceCommandQuick = ({
  gameMap,
  ownSubmarines,
}: {
  gameMap: IGameMap;
  ownSubmarines: ISubmarine[];
}): ISubmarine[] => {
  const newSubmarinesMap: { [index: string]: ISubmarine[] } = {};

  ownSubmarines.forEach(ownSubmarine => {
    Object.keys(ECharge).forEach(key => {
      ownSubmarine.charges[key as ECharge] -= CHARGE_SILENCE;
    });

    const clonedOwnSubmarine = cloneSubmarine(ownSubmarine);
    clonedOwnSubmarine.walkabilityMatrix = createTerrainWalkabilityMatrix(gameMap);
    const { x, y } = clonedOwnSubmarine.coordinates;
    const locationKey = transformCoordinatesToKey({ x, y });
    if (newSubmarinesMap[locationKey] === undefined) {
      newSubmarinesMap[locationKey] = [];
    }
    newSubmarinesMap[locationKey].push(clonedOwnSubmarine);

    [EDirection.N, EDirection.S, EDirection.W, EDirection.E].forEach(direction => {
      const vector = transformDirectionToVector(direction);
      for (let range = 1; range <= RANGE_SILENCE; range++) {
        const targetCoordinates = addVectorToCoordinates({
          coordinates: ownSubmarine.coordinates,
          vector: multiplyVector({ vector, amount: range }),
        });
        if (
          !areCoordinatesWalkable({
            coordinates: targetCoordinates,
            walkabilityMatrix: ownSubmarine.walkabilityMatrix,
          })
        ) {
          return;
        }
        const clonedOwnSubmarine = cloneSubmarine(ownSubmarine);
        const { x, y } = clonedOwnSubmarine.coordinates;
        const locationKey = transformCoordinatesToKey({ x, y });
        if (newSubmarinesMap[locationKey] === undefined) {
          newSubmarinesMap[locationKey] = [];
        }
        newSubmarinesMap[locationKey].push(clonedOwnSubmarine);
      }
    });
  });

  return Object.keys(newSubmarinesMap).map(locationKey => {
    const submarines = newSubmarinesMap[locationKey];
    const transposed = transposeWalkabilityMatrixes(
      submarines.map(submarine => {
        return submarine.walkabilityMatrix;
      })
    );

    submarines[0].walkabilityMatrix = transposed;

    return submarines[0];
  });
};

const filterSubmarinesBySilenceCommandRobust = ({
  ownSubmarines,
}: {
  ownSubmarines: ISubmarine[];
}): ISubmarine[] => {
  const newSubmarinesMap: { [index: string]: ISubmarine[] } = {};

  ownSubmarines.forEach(ownSubmarine => {
    Object.keys(ECharge).forEach(key => {
      ownSubmarine.charges[key as ECharge] -= CHARGE_SILENCE;
    });

    const clonedOwnSubmarine = cloneSubmarine(ownSubmarine);
    const { x, y } = clonedOwnSubmarine.coordinates;
    clonedOwnSubmarine.walkabilityMatrix[x][y] = false;
    const locationKey = transformCoordinatesToKey({ x, y });
    if (newSubmarinesMap[locationKey] === undefined) {
      newSubmarinesMap[locationKey] = [];
    }
    newSubmarinesMap[locationKey].push(clonedOwnSubmarine);

    [EDirection.N, EDirection.S, EDirection.W, EDirection.E].forEach(direction => {
      const vector = transformDirectionToVector(direction);
      for (let range = 1; range <= RANGE_SILENCE; range++) {
        const targetCoordinates = addVectorToCoordinates({
          coordinates: ownSubmarine.coordinates,
          vector: multiplyVector({ vector, amount: range }),
        });
        if (
          !areCoordinatesWalkable({
            coordinates: targetCoordinates,
            walkabilityMatrix: ownSubmarine.walkabilityMatrix,
          })
        ) {
          return;
        }
        const clonedOwnSubmarine = cloneSubmarine(ownSubmarine);
        clonedOwnSubmarine.coordinates = targetCoordinates;
        for (let i = 0; i < range; i++) {
          const visitedCoordinates = addVectorToCoordinates({
            coordinates: ownSubmarine.coordinates,
            vector: multiplyVector({ vector, amount: i }),
          });
          const { x, y } = visitedCoordinates;
          clonedOwnSubmarine.walkabilityMatrix[x][y] = false;
        }
        const locationKey = transformCoordinatesToKey(clonedOwnSubmarine.coordinates);
        if (newSubmarinesMap[locationKey] === undefined) {
          newSubmarinesMap[locationKey] = [];
        }
        newSubmarinesMap[locationKey].push(clonedOwnSubmarine);
      }
    });
  });

  return Object.keys(newSubmarinesMap).map(locationKey => {
    const submarines = newSubmarinesMap[locationKey];
    const transposed = transposeWalkabilityMatrixes(
      submarines.map(submarine => {
        return submarine.walkabilityMatrix;
      })
    );

    submarines[0].walkabilityMatrix = transposed;

    return submarines[0];
  });
};

const filterSubmarinesBySilenceCommand = ({
  gameMap,
  ownSubmarines,
}: {
  gameMap: IGameMap;
  ownSubmarines: ISubmarine[];
}): ISubmarine[] => {
  if (ownSubmarines.length / gameMap.numOfWalkableTerrainCells <= 0.5) {
    return filterSubmarinesBySilenceCommandRobust({ ownSubmarines });
  }

  return filterSubmarinesBySilenceCommandQuick({ gameMap, ownSubmarines });
};

export const getSubmarinesFilteredByOwnCommands = ({
  ownMinHealth,
  ownSubmarines,
  ownCommands,
  gameMap,
}: {
  ownMinHealth: number;
  ownSubmarines: ISubmarine[];
  ownCommands: ICommand[];
  gameMap: IGameMap;
}): ISubmarine[] => {
  ownCommands.forEach(ownCommand => {
    const { type } = ownCommand;
    switch (type) {
      case ECommand.UNKNOWN: {
        return;
      }

      case ECommand.SONAR: {
        ownSubmarines = filterSubmarinesBySonarCommand({ ownSubmarines });
        return;
      }

      case ECommand.SURFACE: {
        ownSubmarines = filterSubmarinesBySurfaceCommand({ ownMinHealth, ownSubmarines, gameMap });
        return;
      }

      case ECommand.MOVE: {
        ownSubmarines = filterSubmarinesByMoveCommand({ ownSubmarines, ownCommand });
        return;
      }

      case ECommand.TORPEDO: {
        ownSubmarines = filterSubmarinesByTorpedoCommand({
          ownCommand,
          ownMinHealth,
          ownSubmarines,
        });
        return;
      }

      case ECommand.MINE: {
        ownSubmarines = filterSubmarinesByMineCommand({ ownSubmarines });
        return;
      }

      case ECommand.SILENCE: {
        ownSubmarines = filterSubmarinesBySilenceCommand({ gameMap, ownSubmarines });
        return;
      }

      case ECommand.TRIGGER: {
        ownSubmarines = filterSubmarinesByTriggerCommand({
          ownCommand,
          ownMinHealth,
          ownSubmarines,
        });
        return;
      }

      default: {
        throw new Error(`Could not process ownCommand -> ${type}`);
      }
    }
  });

  return ownSubmarines;
};
