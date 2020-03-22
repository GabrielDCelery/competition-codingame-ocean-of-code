import GameMap from './game-map';
import { ICoordinates } from './graph';

class MySubmarine {
  private position: ICoordinates;
  private life: number;
  private torpedoCooldown: number;
  private sonarCooldown: number;
  private silenceCooldown: number;
  private mineCooldown: number;
  private gameMap: GameMap;

  constructor({ gameMap }: { gameMap: GameMap }) {
    this.gameMap = gameMap;
  }

  static createInstance({ gameMap }: { gameMap: GameMap }): MySubmarine {
    return new MySubmarine({ gameMap });
  }

  getLife(): number {
    return this.life;
  }

  getPosition(): ICoordinates {
    const { x, y } = this.position;

    return { x, y };
  }

  getGameMap(): GameMap {
    return this.gameMap;
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
    myLife,
    torpedoCooldown,
    sonarCooldown,
    silenceCooldown,
    mineCooldown,
  }: {
    x: number;
    y: number;
    myLife: number;
    torpedoCooldown: number;
    sonarCooldown: number;
    silenceCooldown: number;
    mineCooldown: number;
  }): this {
    this.position = { x, y };
    this.life = myLife;
    this.torpedoCooldown = torpedoCooldown;
    this.sonarCooldown = sonarCooldown;
    this.silenceCooldown = silenceCooldown;
    this.mineCooldown = mineCooldown;

    return this;
  }
}

export default MySubmarine;
