import { ICoordinates } from './common';

export enum ETerrain {
  WATER,
  ISLAND,
}

let singleton: TerrainMap;

export class TerrainMap {
  private width: number;
  private height: number;
  private grid: Array<Array<ETerrain>>;

  constructor({ width, height }: { width: number; height: number }) {
    this.width = width;
    this.height = height;
    this.grid = new Array(this.width).fill(null).map(() => new Array(this.height).fill(null));
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.grid[x][y] = ETerrain.WATER;
      }
    }
  }

  static createSingleton({ width, height }: { width: number; height: number }): TerrainMap {
    if (!singleton) {
      singleton = new TerrainMap({ width, height });
    }

    return singleton;
  }

  setCell({ type, coordinates }: { type: ETerrain; coordinates: ICoordinates }): this {
    const { x, y } = coordinates;

    this.grid[x][y] = type;

    return this;
  }

  isCellWalkable(coordinates: ICoordinates): boolean {
    const { x, y } = coordinates;

    return this.grid[x][y] === ETerrain.WATER;
  }
}

export default TerrainMap;
