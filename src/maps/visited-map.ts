import { ICoordinates } from './common';

export class VisitedMap {
  private width: number;
  private height: number;
  private grid: Array<Array<boolean>>;

  constructor({ width, height }: { width: number; height: number }) {
    this.width = width;
    this.height = height;
    this.reset();
  }

  reset(): void {
    this.grid = new Array(this.width).fill(null).map(() => new Array(this.height).fill(false));
  }

  static createInstance({ width, height }: { width: number; height: number }): VisitedMap {
    return new VisitedMap({ width, height });
  }

  setCell({ type, coordinates }: { type: boolean; coordinates: ICoordinates }): this {
    const { x, y } = coordinates;

    this.grid[x][y] = type;

    return this;
  }

  isCellWalkable(coordinates: ICoordinates): boolean {
    const { x, y } = coordinates;

    return this.grid[x][y] === false;
  }
}

export default VisitedMap;
