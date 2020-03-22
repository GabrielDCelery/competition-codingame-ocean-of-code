import graph, { ICoordinates } from './graph';

export enum ETerrain {
  WATER,
  ISLAND,
}

export enum EWalkabilityType {
  WALKABLE = 0,
  NON_WALKABLE = 1,
}

export interface IDimensions {
  width: number;
  height: number;
}

const gameInputToCellTransformations: { [index: string]: ETerrain } = {
  '.': ETerrain.WATER,
  x: ETerrain.ISLAND,
};

export class GameMap {
  private width: number;
  private height: number;
  private sectorSize: number;
  private grid: Array<Array<[ETerrain, boolean]>>;

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
    this.grid = new Array(this.width).fill(null).map(() => new Array(this.height).fill(null));
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.grid[x][y] = [ETerrain.WATER, false];
      }
    }
  }

  static transformGameInputToTerrain(cell: string): ETerrain {
    return gameInputToCellTransformations[cell];
  }

  static createInstance({
    width,
    height,
    sectorSize,
  }: {
    width: number;
    height: number;
    sectorSize: number;
  }): GameMap {
    return new GameMap({ width, height, sectorSize });
  }

  cloneGameMap(): GameMap {
    const clonedGameMap = new GameMap({
      width: this.width,
      height: this.height,
      sectorSize: this.sectorSize,
    });

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const [terrain, hasBeenVisited] = this.grid[x][y];
        const coordinates = { x, y };

        clonedGameMap
          .setCellTerrain({ terrain, coordinates })
          .setCellHasBeenVisited({ hasBeenVisited, coordinates });
      }
    }

    return clonedGameMap;
  }

  getDimensions(): IDimensions {
    return { width: this.width, height: this.height };
  }

  setCellTerrain({ terrain, coordinates }: { terrain: ETerrain; coordinates: ICoordinates }): this {
    const { x, y } = coordinates;

    this.grid[x][y][0] = terrain;

    return this;
  }

  setCellHasBeenVisited({
    hasBeenVisited,
    coordinates,
  }: {
    hasBeenVisited: boolean;
    coordinates: ICoordinates;
  }): this {
    const { x, y } = coordinates;
    this.grid[x][y][1] = hasBeenVisited;

    return this;
  }

  resetHaveBeenVisitedCells(): this {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.setCellHasBeenVisited({ hasBeenVisited: false, coordinates: { x, y } });
      }
    }

    return this;
  }

  areCoordinatesWithinBoundaries({ x, y }: ICoordinates): boolean {
    return -1 < x && x < this.width && -1 < y && y < this.height;
  }

  isCellWalkable({ x, y }: ICoordinates): boolean {
    if (this.areCoordinatesWithinBoundaries({ x, y }) === false) {
      return false;
    }

    const [terrain, hasBeenVisited] = this.grid[x][y];

    if (terrain === ETerrain.ISLAND) {
      return false;
    }

    if (hasBeenVisited === true) {
      return false;
    }

    return true;
  }

  getWalkableCoordinates(): ICoordinates[] {
    const coordinates: ICoordinates[] = [];

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.isCellWalkable({ x, y })) {
          coordinates.push({ x, y });
        }
      }
    }

    return coordinates;
  }

  getSectorForCoordinates({ x, y }: ICoordinates): number {
    const numOfSectorsX = this.width / this.sectorSize;
    const sectorX = Math.floor(x / this.sectorSize);
    const sectorY = Math.floor(y / this.sectorSize);

    return sectorX + 1 + numOfSectorsX * sectorY;
  }

  private processCoordinatesForReachibility({
    coordinates,
    distance,
    maxDistance,
    reachableCoordinates,
    visitedCells,
  }: {
    coordinates: ICoordinates;
    distance: number;
    maxDistance: number;
    reachableCoordinates: ICoordinates[];
    visitedCells: { [index: string]: boolean };
  }): void {
    const { x, y } = coordinates;

    reachableCoordinates.push({ x, y });
    visitedCells[graph.transformCoordinatesToKey(coordinates)] = true;

    if (distance === maxDistance) {
      return;
    }

    graph.getNeighbouringCells(coordinates).forEach(neighbourCoordinates => {
      if (this.areCoordinatesWithinBoundaries(neighbourCoordinates) === false) {
        return;
      }

      const terrain = this.grid[neighbourCoordinates.x][neighbourCoordinates.y][0];

      if (terrain === ETerrain.ISLAND) {
        return;
      }

      if (visitedCells[graph.transformCoordinatesToKey(neighbourCoordinates)] === true) {
        return;
      }

      return this.processCoordinatesForReachibility({
        coordinates: neighbourCoordinates,
        distance: distance + 1,
        maxDistance,
        reachableCoordinates,
        visitedCells,
      });
    });
  }

  getReachableCoordinatesAtDistance({
    coordinates,
    maxDistance,
  }: {
    coordinates: ICoordinates;
    maxDistance: number;
  }): ICoordinates[] {
    const reachableCoordinates: ICoordinates[] = [];
    const visitedCells: { [index: string]: boolean } = {};

    this.processCoordinatesForReachibility({
      coordinates,
      distance: 0,
      maxDistance,
      reachableCoordinates,
      visitedCells,
    });

    return reachableCoordinates;
  }

  getPathFindingWalkabilityMatrix(): Array<Array<number>> {
    const matrix = new Array(this.height).fill(null).map(() => new Array(this.width).fill(null));

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        matrix[y][x] = this.isCellWalkable({ x, y }) ? 0 : 1;
      }
    }

    return matrix;
  }
}

export default GameMap;
