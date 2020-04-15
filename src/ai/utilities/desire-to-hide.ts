import { normalizedExponentialDecay } from '../utility-helpers';
import { IPhantomSubmarine, IRealSubmarine } from '../../submarines';
import { IGameMap } from '../../maps';

export const calculateDesireToHideUtility = ({
  myPhantomSubmarines,
  gameMap,
}: {
  mySubmarine: IRealSubmarine;
  myPhantomSubmarines: IPhantomSubmarine[];
  opponentSubmarines: IPhantomSubmarine[];
  gameMap: IGameMap;
}): number => {
  return normalizedExponentialDecay({
    value: myPhantomSubmarines.length,
    max: gameMap.cache.numOfWalkableTerrainCells,
    a: 4,
  });
};
