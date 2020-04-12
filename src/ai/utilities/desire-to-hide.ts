import { normalizedExponentialDecay } from '../utility-functions';
import { IPhantomSubmarine } from '../../submarines';
import { IGameMap } from '../../maps';

export const calculateDesireToHideUtility = ({
  phantomSubmarines,
  gameMap,
}: {
  phantomSubmarines: IPhantomSubmarine[];
  gameMap: IGameMap;
}): number => {
  return normalizedExponentialDecay({
    value: phantomSubmarines.length,
    max: gameMap.cache.numOfWalkableTerrainCells,
    a: 4,
  });
};
