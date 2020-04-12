import { normalizedExponentialDecay } from '../utility-functions';
import { ISubmarine } from '../../submarines';
import { IGameMap } from '../../maps';

export const calculateDesireToHideUtility = ({
  phantomSubmarines,
  gameMap,
}: {
  phantomSubmarines: ISubmarine[];
  gameMap: IGameMap;
}): number => {
  return normalizedExponentialDecay({
    value: phantomSubmarines.length,
    max: gameMap.cache.numOfWalkableTerrainCells,
    a: 4,
  });
};
