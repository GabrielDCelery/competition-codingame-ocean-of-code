import {
  ECommand,
  IMoveCommand,
  ISurfaceCommand,
  ITorpedoCommand,
  TCommand,
} from './command-interpreter';
import {
  GameMap,
  GameMapFactory,
  ICoordinates,
  addVectorToCoordinates,
  getDistanceBetweenCoordinates,
  transformCoordinatesToKey,
} from './maps';
import { CONST_TORPEDO_RANGE } from './constants';

class PhantomSubmarine {
  private position: ICoordinates;
  private gameMap: GameMap;

  getPosition(): ICoordinates {
    const { x, y } = this.position;

    return { x, y };
  }

  setPosition({ x, y }: ICoordinates): this {
    this.position = { x, y };

    return this;
  }

  setGameMap(gameMap: GameMap): this {
    this.gameMap = gameMap;

    return this;
  }

  validateAndActionCommand(command: TCommand): boolean {
    const { type } = command;

    switch (type) {
      case ECommand.NA: {
        return true;
      }

      case ECommand.MOVE: {
        const { vector } = command as IMoveCommand;

        const newPosition = addVectorToCoordinates({
          coordinates: this.position,
          vector,
        });

        if (!this.gameMap.isCellWalkable(newPosition)) {
          return false;
        }

        this.gameMap.setCellHasBeenVisited({ hasBeenVisited: true, coordinates: this.position });
        this.setPosition(newPosition);

        return true;
      }

      case ECommand.SURFACE: {
        const { sector } = command as ISurfaceCommand;
        const submarineSector = this.gameMap.getSectorForCoordinates(this.position);

        if (sector !== submarineSector) {
          return false;
        }

        this.gameMap.resetHaveBeenVisitedCells();

        return true;
      }

      case ECommand.TORPEDO: {
        const { coordinates } = command as ITorpedoCommand;
        const distance = getDistanceBetweenCoordinates(this.position, coordinates);

        if (CONST_TORPEDO_RANGE < distance) {
          return false;
        }

        return true;
      }

      default: {
        console.error(`Could not process command -> ${type}`);
      }
    }

    throw new Error(`Could not process command -> ${type}`);
  }
}

export class PhantomSubmarineTracker {
  private life: number;
  private phantomSubmarines: PhantomSubmarine[];
  private possibleLocationsMap: { [index: string]: boolean } = {};
  private gameMap: GameMap;

  constructor({ gameMap }: { gameMap: GameMap }) {
    this.phantomSubmarines = [];
    this.possibleLocationsMap = {};
    this.gameMap = gameMap;
    const { width, height } = this.gameMap.getDimensions();

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (this.gameMap.isCellWalkable({ x, y })) {
          const phantomSubmarine = new PhantomSubmarine()
            .setGameMap(GameMapFactory.getSingleton().createGameMap())
            .setPosition({ x, y });
          this.phantomSubmarines.push(phantomSubmarine);
          this.possibleLocationsMap[transformCoordinatesToKey({ x, y })] = true;
        }
      }
    }
  }

  static createInstance({ gameMap }: { gameMap: GameMap }): PhantomSubmarineTracker {
    return new PhantomSubmarineTracker({ gameMap });
  }

  getOpponentLife(): number {
    return this.life;
  }

  setOpponentLife(opponentLife: number): this {
    this.life = opponentLife;

    return this;
  }

  getPossibleLocationsMap(): { [index: string]: boolean } {
    return this.possibleLocationsMap;
  }

  processCommandsForSubmarines(commands: TCommand[]): this {
    const filteredPhantomSubmarines: PhantomSubmarine[] = [];
    const possibleLocationsMap: { [index: string]: boolean } = {};

    this.phantomSubmarines.forEach(phantomSubmarine => {
      for (let i = 0, iMax = commands.length; i < iMax; i++) {
        const command = commands[i];
        const isCommandValid = phantomSubmarine.validateAndActionCommand(command);

        if (!isCommandValid) {
          return;
        }
      }

      filteredPhantomSubmarines.push(phantomSubmarine);
      possibleLocationsMap[transformCoordinatesToKey(phantomSubmarine.getPosition())] = true;
    });

    this.phantomSubmarines = filteredPhantomSubmarines;
    this.possibleLocationsMap = possibleLocationsMap;

    return this;
  }
}

export default PhantomSubmarineTracker;
