import { GameMap, GameMapFactory, transformCoordinatesToKey, ICoordinates } from '../maps';
import { CONST_SUBMARINE_HEALTH } from '../constants';
import { ECommand, TCommand } from '../command-interpreter';

interface IpossibleLocationsDictionary {
  [index: string]: { coordinates: ICoordinates; gameMap: GameMap };
}

enum ESonarResult {
  YES = 'Y',
  NO = 'N',
  NA = 'NA',
}

class PhantomSubmarine {
  private health: number;
  private charges: number;
  private possibleLocationsDictionary: IpossibleLocationsDictionary;

  constructor() {
    this.health = CONST_SUBMARINE_HEALTH;
    this.charges = 0;
    this.possibleLocationsDictionary = {};
    const gameMap = GameMapFactory.getSingleton().createGameMap();
    const { width, height } = gameMap.getDimensions();

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (gameMap.isCellWalkable({ x, y })) {
          const key = transformCoordinatesToKey({ x, y });
          this.possibleLocationsDictionary[key] = {
            coordinates: { x, y },
            gameMap: GameMapFactory.getSingleton().createGameMap(),
          };
        }
      }
    }
  }

  private validateAndActionCommand({
    command,
    coordinates,
    gameMap,
  }: {
    command: TCommand;
    coordinates: ICoordinates;
    gameMap: GameMap;
  }): { isCommandValid: boolean } {}

  processNewHealthInput({
    health,
    myCommands,
    opponentCommands,
  }: {
    health: number;
    myCommands: TCommand[];
    opponentCommands: TCommand[];
  }): this {
    if (this.health === health) {
      return this;
    }

    return this;
  }

  processSonarAction({ result, sector }: { result: ESonarResult; sector: number }): this {
    if (result !== ESonarResult.YES) {
      return this;
    }

    const possibleLocationsDictionary: IpossibleLocationsDictionary = {};

    Object.keys(this.possibleLocationsDictionary).forEach(key => {
      const { coordinates, gameMap } = this.possibleLocationsDictionary[key];

      if (gameMap.getSectorForCoordinates(coordinates) !== sector) {
        return;
      }

      possibleLocationsDictionary[key] = { coordinates, gameMap };
    });

    this.possibleLocationsDictionary = possibleLocationsDictionary;

    return this;
  }

  processShownCommands(commands: TCommand[]): this {
    const possibleLocationsDictionary: IpossibleLocationsDictionary = {};

    Object.keys(this.possibleLocationsDictionary).forEach(key => {
      const { coordinates, gameMap } = this.possibleLocationsDictionary[key];

      for (let i = 0, iMax = commands.length; i < iMax; i++) {
        const command = commands[i];
        const { isCommandValid } = this.validateAndActionCommand({ command, coordinates, gameMap });

        if (!isCommandValid) {
          return;
        }
      }
    });

    this.possibleLocationsDictionary = possibleLocationsDictionary;

    return this;
  }
}

export default PhantomSubmarine;
