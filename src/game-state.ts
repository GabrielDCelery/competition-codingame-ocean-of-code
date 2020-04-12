import { IGameMap } from './maps';
import { ISubmarine, IRealSubmarine } from './submarines';
import { ECharge } from './commands';

export interface IGameState {
  map: IGameMap;
  players: {
    me: {
      real: IRealSubmarine;
      phantoms: ISubmarine[];
    };
    opponent: {
      phantoms: ISubmarine[];
    };
  };
}

export const createBlankGameStateTemplate = (): IGameState => {
  return {
    map: {
      width: 0,
      height: 0,
      sectorSize: 0,
      walkabilityMatrix: [],
      cache: { torpedoReachability: [], torpedoReachabilityMap: [], numOfWalkableTerrainCells: 0 },
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
