import {
  IPhantomSubmarine,
  chargePhantomSubmarine,
  clonePhantomSubmarine,
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
  transformCoordinatesToKey,
  transformDirectionToVector,
  transposeWalkabilityMatrixes,
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
  phantomSubmarines,
}: {
  ownCommand: ICommand;
  phantomSubmarines: IPhantomSubmarine[];
}): IPhantomSubmarine[] => {
  const { parameters } = ownCommand;
  const { direction } = parameters as IMoveCommandParameters;
  const vector = transformDirectionToVector(direction);
  const final: IPhantomSubmarine[] = [];
  phantomSubmarines.forEach(phantomSubmarine => {
    const newCoordinates = addVectorToCoordinates({
      coordinates: phantomSubmarine.coordinates,
      vector,
    });
    if (
      !areCoordinatesWalkable({
        coordinates: newCoordinates,
        walkabilityMatrix: phantomSubmarine.walkabilityMatrix,
      })
    ) {
      return;
    }
    chargePhantomSubmarine({ submarine: phantomSubmarine, amount: CHARGE_ANY_PER_MOVE });
    const { x, y } = phantomSubmarine.coordinates;
    phantomSubmarine.walkabilityMatrix[x][y] = false;
    phantomSubmarine.coordinates = newCoordinates;
    final.push(phantomSubmarine);
  });
  return final;
};

const filterSubmarinesBySonarCommand = ({
  phantomSubmarines,
}: {
  phantomSubmarines: IPhantomSubmarine[];
}): IPhantomSubmarine[] => {
  const submarine = phantomSubmarines[0];
  if (submarine.charges[ECharge.SONAR] < CHARGE_SONAR) {
    return phantomSubmarines;
  }

  return phantomSubmarines.map(phantomSubmarine => {
    useChargeForPhantomSubmarine({ submarine: phantomSubmarine, type: ECharge.SONAR });
    return phantomSubmarine;
  });
};

const filterSubmarinesBySurfaceCommand = ({
  phantomSubmarineMinHealth,
  phantomSubmarines,
  gameMap,
}: {
  phantomSubmarineMinHealth: number;
  phantomSubmarines: IPhantomSubmarine[];
  gameMap: IGameMap;
}): IPhantomSubmarine[] => {
  const final: IPhantomSubmarine[] = [];
  phantomSubmarines.forEach(phantomSubmarine => {
    phantomSubmarine.health = phantomSubmarine.health - 1;
    if (phantomSubmarine.health < phantomSubmarineMinHealth) {
      return;
    }
    phantomSubmarine.walkabilityMatrix = createTerrainWalkabilityMatrix(gameMap);
    final.push(phantomSubmarine);
  });
  return final;
};

const filterSubmarinesByTorpedoCommand = ({
  ownCommand,
  phantomSubmarineMinHealth,
  phantomSubmarines,
}: {
  ownCommand: ICommand;
  phantomSubmarineMinHealth: number;
  phantomSubmarines: IPhantomSubmarine[];
}): IPhantomSubmarine[] => {
  const submarine = phantomSubmarines[0];
  if (submarine.charges[ECharge.TORPEDO] < CHARGE_TORPEDO) {
    return phantomSubmarines;
  }

  const final: IPhantomSubmarine[] = [];
  const { parameters } = ownCommand;
  const { coordinates } = parameters as ITorpedoCommandParameters;

  phantomSubmarines.forEach(phantomSubmarine => {
    if (areCoordinatesReachableByTorpedo(phantomSubmarine.coordinates, coordinates) === false) {
      return;
    }
    const damageTaken = getDamageTakenFromTorpedo({
      submarineCoordinates: phantomSubmarine.coordinates,
      detonatedAtCoordinates: coordinates,
    });
    phantomSubmarine.health = phantomSubmarine.health - damageTaken;
    if (phantomSubmarine.health < phantomSubmarineMinHealth) {
      return;
    }
    useChargeForPhantomSubmarine({ submarine: phantomSubmarine, type: ECharge.TORPEDO });
    final.push(phantomSubmarine);
  });

  return final;
};

const filterSubmarinesByMineCommand = ({
  phantomSubmarines,
}: {
  phantomSubmarines: IPhantomSubmarine[];
}): IPhantomSubmarine[] => {
  const submarine = phantomSubmarines[0];
  if (submarine.charges[ECharge.MINE] < CHARGE_MINE) {
    return phantomSubmarines;
  }

  return phantomSubmarines.map(phantomSubmarine => {
    useChargeForPhantomSubmarine({ submarine: phantomSubmarine, type: ECharge.MINE });
    return phantomSubmarine;
  });
};

const filterSubmarinesByTriggerCommand = ({
  ownCommand,
  phantomSubmarineMinHealth,
  phantomSubmarines,
}: {
  ownCommand: ICommand;
  phantomSubmarineMinHealth: number;
  phantomSubmarines: IPhantomSubmarine[];
}): IPhantomSubmarine[] => {
  const final: IPhantomSubmarine[] = [];
  const { parameters } = ownCommand;
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
    return final.push(phantomSubmarine);
  });

  return final;
};

const filterSubmarinesBySilenceCommand = ({
  phantomSubmarines,
}: {
  phantomSubmarines: IPhantomSubmarine[];
}): IPhantomSubmarine[] => {
  if (phantomSubmarines[0].charges[ECharge.SILENCE] < CHARGE_SILENCE) {
    return phantomSubmarines;
  }

  const newSubmarinesMap: { [index: string]: IPhantomSubmarine[] } = {};

  phantomSubmarines.forEach(phantomSubmarine => {
    useChargeForPhantomSubmarine({ submarine: phantomSubmarine, type: ECharge.SILENCE });

    const clonedPhantomSubmarine = clonePhantomSubmarine(phantomSubmarine);
    const { x, y } = clonedPhantomSubmarine.coordinates;
    clonedPhantomSubmarine.walkabilityMatrix[x][y] = false;
    const locationKey = transformCoordinatesToKey({ x, y });
    if (newSubmarinesMap[locationKey] === undefined) {
      newSubmarinesMap[locationKey] = [];
    }
    newSubmarinesMap[locationKey].push(clonedPhantomSubmarine);

    [EDirection.N, EDirection.S, EDirection.W, EDirection.E].forEach(direction => {
      const vector = transformDirectionToVector(direction);
      for (let range = 1; range <= RANGE_SILENCE; range++) {
        const targetCoordinates = addVectorToCoordinates({
          coordinates: phantomSubmarine.coordinates,
          vector: multiplyVector({ vector, amount: range }),
        });
        if (
          !areCoordinatesWalkable({
            coordinates: targetCoordinates,
            walkabilityMatrix: phantomSubmarine.walkabilityMatrix,
          })
        ) {
          return;
        }
        const clonedPhantomSubmarine = clonePhantomSubmarine(phantomSubmarine);
        clonedPhantomSubmarine.coordinates = targetCoordinates;
        for (let i = 0; i < range; i++) {
          const visitedCoordinates = addVectorToCoordinates({
            coordinates: phantomSubmarine.coordinates,
            vector: multiplyVector({ vector, amount: i }),
          });
          const { x, y } = visitedCoordinates;
          clonedPhantomSubmarine.walkabilityMatrix[x][y] = false;
        }
        const locationKey = transformCoordinatesToKey(clonedPhantomSubmarine.coordinates);
        if (newSubmarinesMap[locationKey] === undefined) {
          newSubmarinesMap[locationKey] = [];
        }
        newSubmarinesMap[locationKey].push(clonedPhantomSubmarine);
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

export const getPhantomSubmarinesFilteredByOwnCommands = ({
  phantomSubmarineMinHealth,
  phantomSubmarines,
  ownCommands,
  gameMap,
}: {
  phantomSubmarineMinHealth: number;
  phantomSubmarines: IPhantomSubmarine[];
  ownCommands: ICommand[];
  gameMap: IGameMap;
}): IPhantomSubmarine[] => {
  let filteredSubmarines: IPhantomSubmarine[] = [...phantomSubmarines];

  ownCommands.forEach(ownCommand => {
    const { type } = ownCommand;
    switch (type) {
      case ECommand.UNKNOWN: {
        return;
      }

      case ECommand.SONAR: {
        filteredSubmarines = filterSubmarinesBySonarCommand({
          phantomSubmarines: filteredSubmarines,
        });
        return;
      }

      case ECommand.SURFACE: {
        filteredSubmarines = filterSubmarinesBySurfaceCommand({
          phantomSubmarineMinHealth,
          phantomSubmarines: filteredSubmarines,
          gameMap,
        });
        return;
      }

      case ECommand.MOVE: {
        filteredSubmarines = filterSubmarinesByMoveCommand({
          phantomSubmarines: filteredSubmarines,
          ownCommand,
        });
        return;
      }

      case ECommand.TORPEDO: {
        filteredSubmarines = filterSubmarinesByTorpedoCommand({
          ownCommand,
          phantomSubmarineMinHealth,
          phantomSubmarines: filteredSubmarines,
        });
        return;
      }

      case ECommand.MINE: {
        filteredSubmarines = filterSubmarinesByMineCommand({
          phantomSubmarines: filteredSubmarines,
        });
        return;
      }

      case ECommand.SILENCE: {
        filteredSubmarines = filterSubmarinesBySilenceCommand({
          phantomSubmarines: filteredSubmarines,
        });
        return;
      }

      case ECommand.TRIGGER: {
        filteredSubmarines = filterSubmarinesByTriggerCommand({
          ownCommand,
          phantomSubmarineMinHealth,
          phantomSubmarines: filteredSubmarines,
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
