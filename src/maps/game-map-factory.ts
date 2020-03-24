import { ICoordinates } from './common';
import { ETerrain, TerrainMap } from './terrain-map';
import { GameMap } from './game-map';

let singleton: GameMapFactory;

export class GameMapFactory {
  private width: number;
  private height: number;
  private sectorSize: number;
  private terrainMap: TerrainMap;

  constructor({
    width,
    height,
    sectorSize,
  }: {
    width: number;
    height: number;
    sectorSize: number;
  }) {
    this.width = width;
    this.height = height;
    this.sectorSize = sectorSize;
    this.terrainMap = new TerrainMap({ width, height });
  }

  static createSingleton({
    width,
    height,
    sectorSize,
  }: {
    width: number;
    height: number;
    sectorSize: number;
  }): GameMapFactory {
    if (singleton) {
      throw new Error('Tried to initialize GameMapFactory twice!');
    }

    singleton = new GameMapFactory({ width, height, sectorSize });
    return singleton;
  }

  static getSingleton(): GameMapFactory {
    if (!singleton) {
      throw new Error('Intialize GameMapFactory first!');
    }

    return singleton;
  }

  createGameMap(): GameMap {
    return GameMap.createInstance({
      width: this.width,
      height: this.height,
      sectorSize: this.sectorSize,
      terrainMap: this.terrainMap,
    });
  }

  setTerrainCell({ coordinates, type }: { coordinates: ICoordinates; type: ETerrain }): this {
    this.terrainMap.setCell({ type, coordinates });

    return this;
  }
}

export default GameMapFactory;
