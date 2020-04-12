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

export interface IGameMap {
  width: number;
  height: number;
  sectorSize: number;
  walkabilityMatrix: TWalkabilityMatrix;
  cache: {
    numOfWalkableTerrainCells: number;
    torpedoReachabilityListMatrix: ITorpedoReachabilityListMatrix;
    torpedoReachabilityMapMatrix: ITorpedoReachabilityMapMatrix;
  };
}

export type TWalkabilityMatrix = boolean[][];
