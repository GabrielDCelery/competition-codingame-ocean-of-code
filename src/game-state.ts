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
      dimensions: {
        width: 0,
        height: 0,
        sectorSize: 0,
      },
      terrain: [],
      numOfWalkableTerrainCells: 0,
      numOfSectors: 0,
    },
    players: {
      me: {
        real: {
          health: 0,
          coordinates: { x: 0, y: 0 },
          commands: { last: [] },
          charges: {
            [ECharge.TORPEDO]: 0,
            [ECharge.SONAR]: 0,
            [ECharge.SILENCE]: 0,
            [ECharge.MINE]: 0,
          },
          maps: {
            visited: [],
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