import { ETerrain } from './enums';

export interface ICoordinates {
  x: number;
  y: number;
}

export interface IVector {
  x: number;
  y: number;
}

export interface IGameMapDimensions {
  width: number;
  height: number;
  sectorSize: number;
}

export interface ITerrainMap {
  [index: number]: {
    [index: number]: ETerrain;
  };
}

export interface IVisitedMap {
  [index: number]: {
    [index: number]: boolean;
  };
}

export type TWalkabilityMatrix = Array<Array<number>>;
