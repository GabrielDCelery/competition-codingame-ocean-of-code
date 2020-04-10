import {
  ISubmarine,
  cloneSubmarine,
  chargePhantomSubmarine,
  useChargeForPhantomSubmarine,
} from '../submarines';
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
  const submarine = ownSubmarines[0];
  if (submarine.charges[ECharge.SONAR] < CHARGE_SONAR) {
    return ownSubmarines;
  }

  return ownSubmarines.map(ownSubmarine => {
    useChargeForPhantomSubmarine({ submarine: ownSubmarine, type: ECharge.SONAR });
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
  const submarine = ownSubmarines[0];
  if (submarine.charges[ECharge.TORPEDO] < CHARGE_TORPEDO) {
    return ownSubmarines;
  }

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
    useChargeForPhantomSubmarine({ submarine: ownSubmarine, type: ECharge.TORPEDO });
    final.push(ownSubmarine);
  });

  return final;
};

const filterSubmarinesByMineCommand = ({
  ownSubmarines,
}: {
  ownSubmarines: ISubmarine[];
}): ISubmarine[] => {
  const submarine = ownSubmarines[0];
  if (submarine.charges[ECharge.MINE] < CHARGE_MINE) {
    return ownSubmarines;
  }

  return ownSubmarines.map(ownSubmarine => {
    useChargeForPhantomSubmarine({ submarine: ownSubmarine, type: ECharge.MINE });
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
  const newSubmarinesMap: { [index: string]: ISubmarine } = {};

  ownSubmarines.forEach(ownSubmarine => {
    useChargeForPhantomSubmarine({ submarine: ownSubmarine, type: ECharge.SILENCE });

    const { x, y } = ownSubmarine.coordinates;
    const locationKey = transformCoordinatesToKey({ x, y });

    if (!newSubmarinesMap[locationKey]) {
      const clonedOwnSubmarine = cloneSubmarine(ownSubmarine);
      clonedOwnSubmarine.walkabilityMatrix = createTerrainWalkabilityMatrix(gameMap);
      newSubmarinesMap[locationKey] = clonedOwnSubmarine;
    }

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
        const locationKey = transformCoordinatesToKey(clonedOwnSubmarine.coordinates);
        if (!newSubmarinesMap[locationKey]) {
          clonedOwnSubmarine.walkabilityMatrix = createTerrainWalkabilityMatrix(gameMap);
          newSubmarinesMap[locationKey] = clonedOwnSubmarine;
        }
      }
    });
  });

  return Object.keys(newSubmarinesMap).map(locationKey => {
    return newSubmarinesMap[locationKey];
  });
};

const filterSubmarinesBySilenceCommandRobust = ({
  ownSubmarines,
}: {
  ownSubmarines: ISubmarine[];
}): ISubmarine[] => {
  const newSubmarinesMap: { [index: string]: ISubmarine[] } = {};

  ownSubmarines.forEach(ownSubmarine => {
    useChargeForPhantomSubmarine({ submarine: ownSubmarine, type: ECharge.SILENCE });

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
  if (ownSubmarines[0].charges[ECharge.SILENCE] < CHARGE_SILENCE) {
    return ownSubmarines;
  }

  if (ownSubmarines.length / gameMap.numOfWalkableTerrainCells <= 0.4) {
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
  let filteredSubmarines: ISubmarine[] = [...ownSubmarines];

  ownCommands.forEach(ownCommand => {
    const { type } = ownCommand;
    switch (type) {
      case ECommand.UNKNOWN: {
        return;
      }

      case ECommand.SONAR: {
        filteredSubmarines = filterSubmarinesBySonarCommand({ ownSubmarines: filteredSubmarines });
        return;
      }

      case ECommand.SURFACE: {
        filteredSubmarines = filterSubmarinesBySurfaceCommand({
          ownMinHealth,
          ownSubmarines: filteredSubmarines,
          gameMap,
        });
        return;
      }

      case ECommand.MOVE: {
        filteredSubmarines = filterSubmarinesByMoveCommand({
          ownSubmarines: filteredSubmarines,
          ownCommand,
        });
        return;
      }

      case ECommand.TORPEDO: {
        filteredSubmarines = filterSubmarinesByTorpedoCommand({
          ownCommand,
          ownMinHealth,
          ownSubmarines: filteredSubmarines,
        });
        return;
      }

      case ECommand.MINE: {
        filteredSubmarines = filterSubmarinesByMineCommand({ ownSubmarines: filteredSubmarines });
        return;
      }

      case ECommand.SILENCE: {
        filteredSubmarines = filterSubmarinesBySilenceCommand({
          gameMap,
          ownSubmarines: filteredSubmarines,
        });
        return;
      }

      case ECommand.TRIGGER: {
        filteredSubmarines = filterSubmarinesByTriggerCommand({
          ownCommand,
          ownMinHealth,
          ownSubmarines: filteredSubmarines,
        });
        return;
      }

      default: {
        throw new Error(`Could not process ownCommand -> ${type}`);
      }
    }
  });

  return filteredSubmarines;
};
