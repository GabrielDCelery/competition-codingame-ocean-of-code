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
  getDamageTakenFromTorpedo,
  getDamageTakenFromMine,
} from '../weapons';
import {
  EDirection,
  IGameMapDimensions,
  ITerrainMap,
  isCellWalkable,
  addVectorToCoordinates,
  multiplyVector,
  transformDirectionToVector,
  createVisitedMap,
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
  gameMapDimensions,
  ownCommand,
  ownMinHealth,
  ownSubmarine,
  terrainMap,
}: {
  gameMapDimensions: IGameMapDimensions;
  ownMinHealth: number;
  ownSubmarine: ISubmarine;
  ownCommand: ICommand;
  terrainMap: ITerrainMap;
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
      chargePhantomSubmarine({ submarine: ownSubmarine, amount: CHARGE_ANY_PER_MOVE });
      const newCoordinates = addVectorToCoordinates({
        coordinates: ownSubmarine.coordinates,
        vector: transformDirectionToVector(direction),
      });
      if (
        isCellWalkable({
          coordinates: newCoordinates,
          gameMapDimensions,
          terrainMap,
          visitedMap: ownSubmarine.maps.visited,
        }) === false
      ) {
        return [];
      }
      const { x, y } = ownSubmarine.coordinates;
      ownSubmarine.maps.visited[x][y] = true;
      ownSubmarine.coordinates = newCoordinates;
      return [ownSubmarine];
    }

    case ECommand.SURFACE: {
      ownSubmarine.health = ownSubmarine.health - 1;
      if (ownSubmarine.health < ownMinHealth) {
        return [];
      }
      ownSubmarine.maps.visited = createVisitedMap(gameMapDimensions);
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
            isCellWalkable({
              coordinates: targetCoordinates,
              gameMapDimensions,
              terrainMap,
              visitedMap: ownSubmarine.maps.visited,
            }) === false
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
            clonedOwnSubmarine.maps.visited[x][y] = true;
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
  gameMapDimensions,
  ownMinHealth,
  ownSubmarines,
  ownCommands,
  terrainMap,
}: {
  gameMapDimensions: IGameMapDimensions;
  ownMinHealth: number;
  ownSubmarines: ISubmarine[];
  ownCommands: ICommand[];
  terrainMap: ITerrainMap;
}): ISubmarine[] => {
  let filteredSubmarines: ISubmarine[] = ownSubmarines;

  ownCommands.forEach(ownCommand => {
    let newFilteredSubmarines: ISubmarine[] = [];

    filteredSubmarines.forEach(ownSubmarine => {
      const newFilteredSubmarinesFromCommand = createListOfSubmarinesFromProcessedCommand({
        gameMapDimensions,
        ownMinHealth,
        ownSubmarine,
        ownCommand,
        terrainMap,
      });

      newFilteredSubmarines = [...newFilteredSubmarines, ...newFilteredSubmarinesFromCommand];
    });

    filteredSubmarines = [...newFilteredSubmarines];
  });

  return filteredSubmarines;
};
