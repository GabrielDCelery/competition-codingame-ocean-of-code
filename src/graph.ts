export enum EDirection {
  N = 'N',
  S = 'S',
  W = 'W',
  E = 'E',
}

export interface ICoordinates {
  x: number;
  y: number;
}

export interface IVector {
  x: number;
  y: number;
}

const vectors = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

const directionToVectorTransformations = {
  [EDirection.N]: vectors.UP,
  [EDirection.S]: vectors.DOWN,
  [EDirection.W]: vectors.LEFT,
  [EDirection.E]: vectors.RIGHT,
};

class Graph {
  transformDirectionToVector(direction: EDirection): IVector {
    return directionToVectorTransformations[direction];
  }

  transformVectorToDirection({ x, y }: IVector): EDirection {
    if (x === vectors.UP.x && y === vectors.UP.y) {
      return EDirection.N;
    }

    if (x === vectors.DOWN.x && y === vectors.DOWN.y) {
      return EDirection.S;
    }

    if (x === vectors.LEFT.x && y === vectors.LEFT.y) {
      return EDirection.W;
    }

    if (x === vectors.RIGHT.x && y === vectors.RIGHT.y) {
      return EDirection.E;
    }

    throw new Error(`Invalid vector transformation -> ${{ x, y }}`);
  }

  addVectorToCoordinates = ({
    coordinates,
    vector,
  }: {
    coordinates: ICoordinates;
    vector: IVector;
  }): ICoordinates => {
    return {
      x: coordinates.x + vector.x,
      y: coordinates.y + vector.y,
    };
  };

  createVectorFromCoordinates({
    source,
    target,
  }: {
    source: ICoordinates;
    target: ICoordinates;
  }): IVector {
    return {
      x: target.x - source.x,
      y: target.y - source.y,
    };
  }

  getDistanceBetweenCoordinates = (
    coordinatesOne: ICoordinates,
    coordinatesTwo: ICoordinates
  ): number => {
    const distX = Math.abs(coordinatesOne.x - coordinatesTwo.x);
    const distY = Math.abs(coordinatesOne.y - coordinatesTwo.y);

    return distX + distY;
  };

  getNeighbouringCells(coordinates: ICoordinates): ICoordinates[] {
    const { UP, DOWN, LEFT, RIGHT } = vectors;
    return [
      this.addVectorToCoordinates({ coordinates, vector: UP }),
      this.addVectorToCoordinates({ coordinates, vector: DOWN }),
      this.addVectorToCoordinates({ coordinates, vector: LEFT }),
      this.addVectorToCoordinates({ coordinates, vector: RIGHT }),
    ];
  }

  getNeighbouringCellsIncludingDiagonal(coordinates: ICoordinates): ICoordinates[] {
    const { UP, DOWN, LEFT, RIGHT } = vectors;
    const coordinatesUp = this.addVectorToCoordinates({ coordinates, vector: UP });
    const coordinatesDown = this.addVectorToCoordinates({ coordinates, vector: DOWN });
    return [
      coordinatesUp,
      this.addVectorToCoordinates({ coordinates: coordinatesUp, vector: LEFT }),
      this.addVectorToCoordinates({ coordinates: coordinatesUp, vector: RIGHT }),
      coordinatesDown,
      this.addVectorToCoordinates({ coordinates: coordinatesDown, vector: LEFT }),
      this.addVectorToCoordinates({ coordinates: coordinatesDown, vector: RIGHT }),
      this.addVectorToCoordinates({ coordinates, vector: LEFT }),
      this.addVectorToCoordinates({ coordinates, vector: RIGHT }),
    ];
  }

  transformCoordinatesToKey({ x, y }: ICoordinates): string {
    return `${x}_${y}`;
  }

  transformKeyToCoordinates(key: string): ICoordinates {
    const [x, y] = key.split('_').map(elem => parseInt(elem, 10));

    return { x, y };
  }

  isCoordinatesInCoordinatesList(
    coordinates: ICoordinates,
    coordinatesList: ICoordinates[]
  ): boolean {
    for (let i = 0, iMax = coordinatesList.length; i < iMax; i++) {
      if (coordinates.x === coordinatesList[i].x && coordinates.y === coordinatesList[i].y) {
        return true;
      }
    }

    return false;
  }

  getCoordinatesAtSpecificDistance({
    coordinates,
    distance,
  }: {
    coordinates: ICoordinates;
    distance: number;
  }): ICoordinates[] {
    const { x, y } = coordinates;
    const cellsAtDistance: ICoordinates[] = [];

    for (
      let offsetX = -Math.abs(distance), offsetXMax = distance;
      offsetX <= offsetXMax;
      offsetX++
    ) {
      for (
        let offsetY = -Math.abs(distance), offsetYMax = distance;
        offsetY <= offsetYMax;
        offsetY++
      ) {
        if (Math.abs(offsetX) + Math.abs(offsetY) === distance) {
          cellsAtDistance.push({ x: x + offsetX, y: y + offsetY });
        }
      }
    }

    return cellsAtDistance;
  }
}

export default new Graph();
