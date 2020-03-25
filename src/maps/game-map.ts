import { getNeighbouringCells, transformCoordinatesToKey, ICoordinates } from './common';
import { TerrainMap } from './terrain-map';
import { VisitedMap } from './visited-map';

export class GameMap {
  private width: number;
  private height: number;
  private sectorSize: number;
  private terrainMap: TerrainMap;
  private visitedMap: VisitedMap;

  constructor({
    width,
    height,
    sectorSize,
    terrainMap,
  }: {
    width: number;
    height: number;
    sectorSize: number;
    terrainMap: TerrainMap;
  }) {
    this.width = width;
    this.height = height;
    this.sectorSize = sectorSize;
    this.terrainMap = terrainMap;
    this.visitedMap = VisitedMap.createInstance({ width, height });
  }

  static createInstance({
    width,
    height,
    sectorSize,
    terrainMap,
  }: {
    width: number;
    height: number;
    sectorSize: number;
    terrainMap: TerrainMap;
  }): GameMap {
    return new GameMap({ width, height, sectorSize, terrainMap });
  }

  getDimensions(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  setCellHasBeenVisited({
    hasBeenVisited,
    coordinates,
  }: {
    hasBeenVisited: boolean;
    coordinates: ICoordinates;
  }): this {
    this.visitedMap.setCell({ type: hasBeenVisited, coordinates });

    return this;
  }

  resetHaveBeenVisitedCells(): this {
    this.visitedMap.reset();

    return this;
  }

  areCoordinatesWithinBoundaries({ x, y }: ICoordinates): boolean {
    return -1 < x && x < this.width && -1 < y && y < this.height;
  }

  isCellWalkable(coordinates: ICoordinates): boolean {
    return (
      this.areCoordinatesWithinBoundaries(coordinates) &&
      this.terrainMap.isCellWalkable(coordinates) &&
      this.visitedMap.isCellWalkable(coordinates)
    );
  }

  getWalkableCoordinatesList(): ICoordinates[] {
    const coordinatesList: ICoordinates[] = [];

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.terrainMap.isCellWalkable({ x, y }) && this.visitedMap.isCellWalkable({ x, y })) {
          coordinatesList.push({ x, y });
        }
      }
    }

    return coordinatesList;
  }

  getSectorForCoordinates(coordinates: ICoordinates): number {
    const { x, y } = coordinates;
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
    reachableCoordinates.push(coordinates);
    visitedCells[transformCoordinatesToKey(coordinates)] = true;

    if (distance === maxDistance) {
      return;
    }

    getNeighbouringCells(coordinates).forEach(neighbourCoordinates => {
      if (
        this.areCoordinatesWithinBoundaries(neighbourCoordinates) === false ||
        this.terrainMap.isCellWalkable(neighbourCoordinates) === false ||
        visitedCells[transformCoordinatesToKey(neighbourCoordinates)] === true
      ) {
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
        matrix[y][x] =
          this.terrainMap.isCellWalkable({ x, y }) && this.visitedMap.isCellWalkable({ x, y })
            ? 0
            : 1;
      }
    }

    return matrix;
  }
}

export default GameMap;
