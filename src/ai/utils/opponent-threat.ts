import { ISubmarine } from '../../submarines';
import { HEALTH_SUBMARINE, CHARGE_TORPEDO } from '../../constants';
import { normalizeExponential, average, normalizeLinear } from '../../common';
import { IGameMap } from '../../maps';
import { ECharge } from '../../commands';

export const calculateOpponentThreatUtility = ({
  gameMap,
  opponentSubmarines,
}: {
  gameMap: IGameMap;
  opponentSubmarines: ISubmarine[];
}): number => {
  const opponentSubmarine = opponentSubmarines[0];

  const normalizedValues = [
    normalizeExponential({
      value: opponentSubmarine.charges[ECharge.TORPEDO],
      max: CHARGE_TORPEDO,
      k: 3,
    }),
    normalizeExponential({ value: opponentSubmarine.health, max: HEALTH_SUBMARINE, k: 2 }),
    normalizeLinear({
      value: opponentSubmarines.length,
      max: gameMap.numOfWalkableTerrainCells,
    }),
  ];

  return average(normalizedValues);
};
