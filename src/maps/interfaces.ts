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

export interface ITorpedoDamageMap {
  [index: string]: [number, number];
}

export interface IGameMap {
  width: number;
  height: number;
  sectorSize: number;
  numOfWalkableTerrainCells: number;
  numOfSectors: number;
  walkabilityMatrix: TWalkabilityMatrix;
  matrixes: {
    torpedoReachability: ITorpedoReachabilityMatrix;
    torpedoReachabilityMap: ITorpedoReachabilityMap;
    torpedoDamageMap: ITorpedoDamageMap;
  };
}

export type TWalkabilityMatrix = boolean[][];
