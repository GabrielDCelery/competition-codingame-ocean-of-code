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
  ESonarResult,
  IMoveCommandParameters,
  ITorpedoCommandParameters,
  ISurfaceCommandParameters,
} from '../command-interpreter';
import { IDamageSummarizerData } from '../damage-summarizer';

interface IPossibleLocationData {
  position: ICoordinates;
  gameMap: GameMap;
}

interface IPossibleLocationsDataMap {
  [index: string]: IPossibleLocationData;
}

export class PhantomSubmarine {
  private health: number;
  private charges: number;
  private possibleLocations: IPossibleLocationData[];

  constructor() {
    this.health = HEALTH_SUBMARINE;
    this.charges = 0;
    this.possibleLocations = [];
    const gameMap = GameMapFactory.getSingleton().createGameMap();
    const { width, height } = gameMap.getDimensions();

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (gameMap.isCellWalkable({ x, y })) {
          this.possibleLocations.push({
            position: { x, y },
            gameMap: GameMapFactory.getSingleton().createGameMap(),
          });
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
    const dataMap: IPossibleLocationsDataMap = {};

    this.possibleLocations.forEach(({ position, gameMap }) => {
      const locationKey = uTransformCoordinatesToKey(position);
      dataMap[locationKey] = { position, gameMap };
    });

    return dataMap;
  }

  processDamageForTurn({
    damageSummarizerData,
    newHealth,
  }: {
    damageSummarizerData: IDamageSummarizerData;
    newHealth: number;
  }): this {
    let healthLost = this.health - newHealth;
    this.health = newHealth;
    const { general, coordinatesMap } = damageSummarizerData;

    healthLost = healthLost - general;

    if (healthLost === 0) {
      return this;
    }

    if (Object.keys(coordinatesMap).length === 0) {
      return this;
    }

    const possibleLocations: IPossibleLocationData[] = [];

    this.possibleLocations.forEach(({ position, gameMap }) => {
      const locationKey = uTransformCoordinatesToKey(position);
      const damage = coordinatesMap[locationKey];

      if (damage !== healthLost) {
        return;
      }

      possibleLocations.push({ position, gameMap });
    });

    this.possibleLocations = possibleLocations;

    return this;
  }

  processEnemySonarAction({
    result,
    sector,
  }: {
    result: ESonarResult;
    sector: number | null;
  }): this {
    if (sector === null || result !== ESonarResult.YES) {
      return this;
    }

    const possibleLocations: IPossibleLocationData[] = [];

    this.possibleLocations.forEach(({ position, gameMap }) => {
      if (gameMap.getSectorForCoordinates(position) !== sector) {
        return;
      }

      possibleLocations.push({ position, gameMap });
    });

    this.possibleLocations = possibleLocations;

    return this;
  }

  private processPhantomCommandsForPossibleLocation({
    command,
    possibleLocationData,
  }: {
    command: ICommand;
    possibleLocationData: IPossibleLocationData;
  }): IPossibleLocationData[] {
    const { position, gameMap } = possibleLocationData;
    const { type, parameters } = command;

    switch (type) {
      case ECommand.NA: {
        return [{ position, gameMap }];
      }

      case ECommand.MOVE: {
        this.charges += 1;
        const { direction } = parameters as IMoveCommandParameters;
        const newPosition = uAddVectorToCoordinates({
          coordinates: position,
          vector: uTransformDirectionToVector(direction),
        });
        if (gameMap.isCellWalkable(newPosition) === false) {
          return [];
        }
        gameMap.setCellHasBeenVisited({ hasBeenVisited: true, coordinates: position });
        return [{ position: newPosition, gameMap }];
      }

      case ECommand.SURFACE: {
        const { sector } = parameters as ISurfaceCommandParameters;
        if (sector !== gameMap.getSectorForCoordinates(position)) {
          return [];
        }
        gameMap.resetHaveBeenVisitedCells();
        return [{ position, gameMap }];
      }

      case ECommand.TORPEDO: {
        const { coordinates } = parameters as ITorpedoCommandParameters;
        const distance = uGetDistanceBetweenCoordinates(position, coordinates);
        if (RANGE_TORPEDO < distance) {
          return [];
        }
        this.charges -= CHARGE_TORPEDO;
        return [{ position, gameMap }];
      }

      case ECommand.SONAR: {
        this.charges -= CHARGE_SONAR;
        return [{ position, gameMap }];
      }

      case ECommand.SILENCE: {
        this.charges -= CHARGE_SILENCE;
        const newPossibleLocationsData: IPossibleLocationData[] = [];

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
            newPossibleLocationsData.push({ position: targetCoordinates, gameMap: clonedGameMap });
          }
        });

        return newPossibleLocationsData;
      }

      default: {
        console.error(`Could not process command -> ${type}`);
      }
    }

    throw new Error(`Could not process command -> ${type}`);
  }

  processPhantomCommands(commands: ICommand[]): this {
    let possibleLocations: IPossibleLocationData[] = this.possibleLocations;

    for (let i = 0, iMax = commands.length; i < iMax; i++) {
      const command = commands[i];
      let newPossibleLocationsForCommand: IPossibleLocationData[] = [];

      possibleLocations.forEach(possibleLocationData => {
        const newPossibleLocations = this.processPhantomCommandsForPossibleLocation({
          command,
          possibleLocationData,
        });

        newPossibleLocationsForCommand = [
          ...newPossibleLocationsForCommand,
          ...newPossibleLocations,
        ];
      });

      possibleLocations = [...newPossibleLocationsForCommand];
    }

    this.possibleLocations = possibleLocations;

    return this;
  }
}

export default PhantomSubmarine;
