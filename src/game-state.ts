import { IGameMap } from './maps';
import { ISubmarine } from './submarines';
import { ECharge } from './commands';

export interface IGameState {
  map: IGameMap;
  players: {
    me: {
      real: ISubmarine;
      phantoms: ISubmarine[];
    };
    opponent: {
      phantoms: ISubmarine[];
    };
  };
}

export const createBlankGameState = (): IGameState => {
  return {
    map: {
      width: 0,
      height: 0,
      sectorSize: 0,
      numOfWalkableTerrainCells: 0,
      numOfSectors: 0,
      walkabilityMatrix: [],
      matrixes: {
        torpedoReachability: [],
        torpedoReachabilityMap: [],
        torpedoDamageMap: {},
      },
    },
    players: {
      me: {
        real: {
          health: 0,
          coordinates: { x: 0, y: 0 },
          lastCommands: [],
          walkabilityMatrix: [[]],
          mines: [],
          charges: {
            [ECharge.TORPEDO]: 0,
            [ECharge.SONAR]: 0,
            [ECharge.SILENCE]: 0,
            [ECharge.MINE]: 0,
          },
        },
        phantoms: [],
      },
      opponent: {
        phantoms: [],
      },
    },
  };
};
