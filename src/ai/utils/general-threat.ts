import { ISubmarine } from '../../submarines';
import { HEALTH_SUBMARINE } from '../../constants';
import { normalizeExponential, average } from '../../common';
import { IGameMap } from '../../maps';

export const calculateGeneralThreateUtility = ({
  gameMap,
  mySubmarine,
  myPhantomSubmarines,
  opponentSubmarines,
}: {
  gameMap: IGameMap;
  mySubmarine: ISubmarine;
  myPhantomSubmarines: ISubmarine[];
  opponentSubmarines: ISubmarine[];
}): number => {
  const opponentSubmarine = opponentSubmarines[0];

  const normalizedValues = [
    1 - normalizeExponential({ max: HEALTH_SUBMARINE, value: opponentSubmarine.health, k: 4 }),
    1 -
      normalizeExponential({
        max: gameMap.numOfWalkableTerrainCells,
        value: opponentSubmarines.length,
        k: 4,
      }),
  ];

  return average(normalizedValues);
};
