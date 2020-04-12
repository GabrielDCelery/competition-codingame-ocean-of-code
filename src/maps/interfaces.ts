export interface ICoordinates {
  x: number;
  y: number;
}

export interface IVector {
  x: number;
  y: number;
}

export interface ITorpedoReachabilityMatrix {
  [index: number]: {
    [index: number]: ICoordinates[];
  };
}

export interface ITorpedoReachabilityMap {
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
    torpedoReachability: ITorpedoReachabilityMatrix;
    torpedoReachabilityMap: ITorpedoReachabilityMap;
  };
}

export type TWalkabilityMatrix = boolean[][];
