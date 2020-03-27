import { GameMap, GameMapFactory, ICoordinates } from '../maps';
import { ECommand, ICommand } from '../command-interpreter';

export class Submarine {
  private position: ICoordinates;
  private health: number;
  private torpedoCooldown: number;
  private sonarCooldown: number;
  private silenceCooldown: number;
  private mineCooldown: number;
  private gameMap: GameMap;
  private executedCommands: ICommand[];

  constructor({ gameMap }: { gameMap: GameMap }) {
    this.executedCommands = [];
    this.gameMap = gameMap;
  }

  static createInstance(): Submarine {
    return new Submarine({ gameMap: GameMapFactory.getSingleton().createGameMap() });
  }

  getLife(): number {
    return this.health;
  }

  getPosition(): ICoordinates {
    const { x, y } = this.position;

    return { x, y };
  }

  getGameMap(): GameMap {
    return this.gameMap;
  }

  getExecutedCommands(): ICommand[] {
    return this.executedCommands;
  }

  isTorpedoReady(): boolean {
    return this.torpedoCooldown === 0;
  }

  setPosition({ x, y }: ICoordinates): this {
    this.position = { x, y };

    return this;
  }

  setState({
    x,
    y,
    health,
    torpedoCooldown,
    sonarCooldown,
    silenceCooldown,
    mineCooldown,
  }: {
    x: number;
    y: number;
    health: number;
    torpedoCooldown: number;
    sonarCooldown: number;
    silenceCooldown: number;
    mineCooldown: number;
  }): this {
    this.position = { x, y };
    this.health = health;
    this.torpedoCooldown = torpedoCooldown;
    this.sonarCooldown = sonarCooldown;
    this.silenceCooldown = silenceCooldown;
    this.mineCooldown = mineCooldown;

    return this;
  }

  processCommands(commands: ICommand[]): void {
    this.executedCommands = commands;

    for (let i = 0, iMax = commands.length; i < iMax; i++) {
      const command = commands[i];
      const { type } = command;

      switch (type) {
        case ECommand.MOVE: {
          this.gameMap.setCellHasBeenVisited({ hasBeenVisited: true, coordinates: this.position });
          return;
        }

        case ECommand.SURFACE: {
          this.gameMap.resetHaveBeenVisitedCells();
          return;
        }

        case ECommand.TORPEDO: {
          return;
        }

        default: {
          console.error(`Could not process command -> ${command}`);
          throw new Error(`Could not process command -> ${command}`);
        }
      }
    }
  }
}

export default Submarine;
