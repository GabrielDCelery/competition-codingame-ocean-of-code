import { IWeightedCommand } from './base-action';
import { CHARGE_TORPEDO } from '../../constants';
import { ECommand, ECharge } from '../../commands';
import { calculateTorpedoDamageUtility } from '../utils';
import { ISubmarine } from '../../submarines';
import { IGameMapDimensions, ITerrainMap } from '../../maps';

export const calculateTorpedoActionUtility = ({
  mySubmarine,
  opponentSubmarines,
  gameMapDimensions,
  terrainMap,
}: {
  mySubmarine: ISubmarine;
  opponentSubmarines: ISubmarine[];
  gameMapDimensions: IGameMapDimensions;
  terrainMap: ITerrainMap;
}): IWeightedCommand => {
  if (mySubmarine.charges[ECharge.TORPEDO] < CHARGE_TORPEDO) {
    return {
      type: ECommand.TORPEDO,
      utility: 0,
      parameters: {},
    };
  }

  const torpedoDamageUtility = calculateTorpedoDamageUtility({
    mySubmarine,
    opponentSubmarines,
    gameMapDimensions,
    terrainMap,
  });

  return {
    type: ECommand.TORPEDO,
    ...torpedoDamageUtility,
  };
};
