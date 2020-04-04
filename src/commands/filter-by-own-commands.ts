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
} from '../maps';
import {
  CHARGE_ANY_PER_MOVE,
  CHARGE_MINE,
  CHARGE_SILENCE,
  CHARGE_SONAR,
  CHARGE_TORPEDO,
  RANGE_SILENCE,
} from '../constants';

const createListOfSubmarinesFromProcessedCommand = ({
  ownCommand,
  ownMinHealth,
  ownSubmarine,
  gameMap,
}: {
  ownMinHealth: number;
  ownSubmarine: ISubmarine;
  ownCommand: ICommand;
  gameMap: IGameMap;
}): ISubmarine[] => {
  const { type, parameters } = ownCommand;

  switch (type) {
    case ECommand.UNKNOWN: {
      return [ownSubmarine];
    }

    case ECommand.SONAR: {
      Object.keys(ECharge).forEach(key => {
        ownSubmarine.charges[key as ECharge] -= CHARGE_SONAR;
      });
      return [ownSubmarine];
    }

    case ECommand.MOVE: {
      const { direction } = parameters as IMoveCommandParameters;
      const newCoordinates = addVectorToCoordinates({
        coordinates: ownSubmarine.coordinates,
        vector: transformDirectionToVector(direction),
      });
      if (
        !areCoordinatesWalkable({
          coordinates: newCoordinates,
          walkabilityMatrix: ownSubmarine.walkabilityMatrix,
        })
      ) {
        return [];
      }
      chargePhantomSubmarine({ submarine: ownSubmarine, amount: CHARGE_ANY_PER_MOVE });
      const { x, y } = ownSubmarine.coordinates;
      ownSubmarine.walkabilityMatrix[x][y] = false;
      ownSubmarine.coordinates = newCoordinates;
      return [ownSubmarine];
    }

    case ECommand.SURFACE: {
      ownSubmarine.health = ownSubmarine.health - 1;
      if (ownSubmarine.health < ownMinHealth) {
        return [];
      }
      ownSubmarine.walkabilityMatrix = createTerrainWalkabilityMatrix(gameMap);
      return [ownSubmarine];
    }

    case ECommand.TORPEDO: {
      const { coordinates } = parameters as ITorpedoCommandParameters;
      if (areCoordinatesReachableByTorpedo(ownSubmarine.coordinates, coordinates) === false) {
        return [];
      }
      const damageTaken = getDamageTakenFromTorpedo({
        submarineCoordinates: ownSubmarine.coordinates,
        detonatedAtCoordinates: coordinates,
      });
      ownSubmarine.health = ownSubmarine.health - damageTaken;
      if (ownSubmarine.health < ownMinHealth) {
        return [];
      }
      Object.keys(ECharge).forEach(key => {
        ownSubmarine.charges[key as ECharge] -= CHARGE_TORPEDO;
      });
      return [ownSubmarine];
    }

    case ECommand.SILENCE: {
      Object.keys(ECharge).forEach(key => {
        ownSubmarine.charges[key as ECharge] -= CHARGE_SILENCE;
      });
      const newSubmarines: ISubmarine[] = [];
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
          newSubmarines.push(clonedOwnSubmarine);
        }
      });
      return newSubmarines;
    }

    case ECommand.MINE: {
      Object.keys(ECharge).forEach(key => {
        ownSubmarine.charges[key as ECharge] -= CHARGE_MINE;
      });
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

    default: {
      throw new Error(`Could not process enemyCommand -> ${type}`);
    }
  }
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
  const { width, height } = gameMap;
  let finalList: ISubmarine[] = ownSubmarines;

  ownCommands.forEach(ownCommand => {
    const newFilteredSubmarinesList: ISubmarine[] = [];
    const newFilteredSubmarinesMatrix: ISubmarine[][] = new Array(width)
      .fill(null)
      .map(() => new Array(height).fill(null));

    finalList.forEach(ownSubmarine => {
      createListOfSubmarinesFromProcessedCommand({
        ownMinHealth,
        ownSubmarine,
        ownCommand,
        gameMap,
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
