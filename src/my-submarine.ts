import { GameMap, ICoordinates } from './maps';

class MySubmarine {
  private position: ICoordinates;
  private health: number;
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
    return this.health;
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
    myHealth,
    torpedoCooldown,
    sonarCooldown,
    silenceCooldown,
    mineCooldown,
  }: {
    x: number;
    y: number;
    myHealth: number;
    torpedoCooldown: number;
    sonarCooldown: number;
    silenceCooldown: number;
    mineCooldown: number;
  }): this {
    this.position = { x, y };
    this.health = myHealth;
    this.torpedoCooldown = torpedoCooldown;
    this.sonarCooldown = sonarCooldown;
    this.silenceCooldown = silenceCooldown;
    this.mineCooldown = mineCooldown;

    return this;
  }
}

export default MySubmarine;
