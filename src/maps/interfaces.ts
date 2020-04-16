export interface ICoordinates {
  x: number;
  y: number;
}

export interface IVector {
  x: number;
  y: number;
}

export interface ITorpedoReachabilityListMatrix {
  [index: number]: {
    [index: number]: ICoordinates[];
  };
}

export interface ITorpedoReachabilityMapMatrix {
  [index: number]: {
    [index: number]: { [index: string]: boolean };
  };
}

export interface IMineField {
  [index: number]: {
    [index: number]: number;
  };
}

export interface IGameMap {
  width: number;
  height: number;
  sectorSize: number;
  walkabilityMatrix: TWalkabilityMatrix;
  cache: {
    numOfWalkableTerrainCells: number;
    torpedoReachabilityListMatrix: ITorpedoReachabilityListMatrix;
    torpedoReachabilityMapMatrix: ITorpedoReachabilityMapMatrix;
    mineLocationsProbabilityMatrix: IMineField;
  };
}

export type TWalkabilityMatrix = boolean[][];
