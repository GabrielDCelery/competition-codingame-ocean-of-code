import {
  EDirection,
  GameMap,
  GameMapFactory,
  ICoordinates,
  uAddVectorToCoordinates,
  uGetDistanceBetweenCoordinates,
  uMultiplyVector,
  uTransformCoordinatesToKey,
  uTransformDirectionToVector,
} from '../maps';
import {
  CHARGE_SILENCE,
  CHARGE_SONAR,
  CHARGE_TORPEDO,
  HEALTH_SUBMARINE,
  RANGE_TORPEDO,
  RANGE_SILENCE,
} from '../constants';
import {
  ECommand,
  ICommand,
  IMoveCommandParameters,
  ITorpedoCommandParameters,
  ISurfaceCommandParameters,
} from '../command-interpreter';

interface IPossibleLocationData {
  position: ICoordinates;
  gameMap: GameMap;
}

interface IPossibleLocationsDataMap {
  [index: string]: IPossibleLocationData;
}

enum ESonarResult {
  YES = 'Y',
  NO = 'N',
  NA = 'NA',
}

export class PhantomSubmarine {
  private health: number;
  private charges: number;
  private possibleLocationsDataMap: IPossibleLocationsDataMap;

  constructor() {
    this.health = HEALTH_SUBMARINE;
    this.charges = 0;
    this.possibleLocationsDataMap = {};
    const gameMap = GameMapFactory.getSingleton().createGameMap();
    const { width, height } = gameMap.getDimensions();

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (gameMap.isCellWalkable({ x, y })) {
          const key = uTransformCoordinatesToKey({ x, y });
          this.possibleLocationsDataMap[key] = {
            position: { x, y },
            gameMap: GameMapFactory.getSingleton().createGameMap(),
          };
        }
      }
    }
  }

  static createInstance(): PhantomSubmarine {
    return new PhantomSubmarine();
  }

  getLife(): number {
    return this.health;
  }

  getPossibleLocationsMap(): IPossibleLocationsDataMap {
    return this.possibleLocationsDataMap;
  }

  processSonarAction({ result, sector }: { result: ESonarResult; sector: number }): this {
    if (result !== ESonarResult.YES) {
      return this;
    }

    const possibleLocationsDataMap: IPossibleLocationsDataMap = {};

    Object.keys(this.possibleLocationsDataMap).forEach(key => {
      const { position, gameMap } = this.possibleLocationsDataMap[key];

      if (gameMap.getSectorForCoordinates(position) !== sector) {
        return;
      }

      possibleLocationsDataMap[key] = { position, gameMap };
    });

    this.possibleLocationsDataMap = possibleLocationsDataMap;

    return this;
  }

  private processPhantomCommandsForPossibleLocation({
    command,
    possibleLocationData,
    newPossibleLocationsDataMap,
  }: {
    command: ICommand;
    possibleLocationData: IPossibleLocationData;
    newPossibleLocationsDataMap: IPossibleLocationsDataMap;
  }): void {
    const { position, gameMap } = possibleLocationData;
    const { type, parameters } = command;

    switch (type) {
      case ECommand.NA: {
        const locationKey = uTransformCoordinatesToKey(position);
        newPossibleLocationsDataMap[locationKey] = { position, gameMap };
        return;
      }

      case ECommand.MOVE: {
        this.charges += 1;
        const { direction } = parameters as IMoveCommandParameters;
        const newPosition = uAddVectorToCoordinates({
          coordinates: position,
          vector: uTransformDirectionToVector(direction),
        });
        if (gameMap.isCellWalkable(newPosition) === false) {
          return;
        }
        gameMap.setCellHasBeenVisited({ hasBeenVisited: true, coordinates: position });
        const locationKey = uTransformCoordinatesToKey(newPosition);
        newPossibleLocationsDataMap[locationKey] = { position: newPosition, gameMap };
        return;
      }

      case ECommand.SURFACE: {
        const { sector } = parameters as ISurfaceCommandParameters;
        if (sector !== gameMap.getSectorForCoordinates(position)) {
          return;
        }
        gameMap.resetHaveBeenVisitedCells();
        const locationKey = uTransformCoordinatesToKey(position);
        newPossibleLocationsDataMap[locationKey] = { position, gameMap };
        return;
      }

      case ECommand.TORPEDO: {
        const { coordinates } = parameters as ITorpedoCommandParameters;
        const distance = uGetDistanceBetweenCoordinates(position, coordinates);
        if (RANGE_TORPEDO < distance) {
          return;
        }
        this.charges -= CHARGE_TORPEDO;
        const locationKey = uTransformCoordinatesToKey(position);
        newPossibleLocationsDataMap[locationKey] = { position, gameMap };
        return;
      }

      case ECommand.SONAR: {
        this.charges -= CHARGE_SONAR;
        const locationKey = uTransformCoordinatesToKey(position);
        newPossibleLocationsDataMap[locationKey] = { position, gameMap };
        return;
      }

      case ECommand.SILENCE: {
        this.charges -= CHARGE_SILENCE;
        const locationKey = uTransformCoordinatesToKey(position);
        newPossibleLocationsDataMap[locationKey] = { position, gameMap };
        [EDirection.N, EDirection.S, EDirection.W, EDirection.E].forEach(direction => {
          const vector = uTransformDirectionToVector(direction);
          for (let range = 1; range <= RANGE_SILENCE; range++) {
            const targetCoordinates = uAddVectorToCoordinates({
              coordinates: position,
              vector: uMultiplyVector({ vector, amount: range }),
            });
            if (!gameMap.isCellWalkable(targetCoordinates)) {
              return;
            }
            const clonedGameMap = gameMap.cloneGameMap();
            for (let i = 0; i < range; i++) {
              const visitedCoordinates = uAddVectorToCoordinates({
                coordinates: position,
                vector: uMultiplyVector({ vector, amount: i }),
              });
              clonedGameMap.setCellHasBeenVisited({
                hasBeenVisited: true,
                coordinates: visitedCoordinates,
              });
            }
            const locationKey = uTransformCoordinatesToKey(targetCoordinates);
            newPossibleLocationsDataMap[locationKey] = {
              position: targetCoordinates,
              gameMap: clonedGameMap,
            };
          }
        });
        return;
      }

      default: {
        console.error(`Could not process command -> ${type}`);
      }
    }

    throw new Error(`Could not process command -> ${type}`);
  }

  processPhantomCommands(commands: ICommand[]): this {
    const newPossibleLocationsDataMap: IPossibleLocationsDataMap = {};

    Object.keys(this.possibleLocationsDataMap).forEach(key => {
      for (let i = 0, iMax = commands.length; i < iMax; i++) {
        this.processPhantomCommandsForPossibleLocation({
          command: commands[i],
          possibleLocationData: this.possibleLocationsDataMap[key],
          newPossibleLocationsDataMap,
        });
      }
    });
    this.possibleLocationsDataMap = newPossibleLocationsDataMap;

    return this;
  }
}

export default PhantomSubmarine;
