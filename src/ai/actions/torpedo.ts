import { IWeightedCommand } from './base-action';
import { CHARGE_TORPEDO } from '../../constants';
import { ECommand, ECharge } from '../../commands';
import { calculateTorpedoDamageUtility, chooseHighestUtility } from '../utils';
import { ISubmarine } from '../../submarines';
import { IGameMap, ICoordinates } from '../../maps';

export const calculateTorpedoActionUtility = ({
  mySubmarine,
  opponentSubmarines,
  gameMap,
}: {
  mySubmarine: ISubmarine;
  opponentSubmarines: ISubmarine[];
  gameMap: IGameMap;
}): IWeightedCommand => {
  if (mySubmarine.charges[ECharge.TORPEDO] < CHARGE_TORPEDO) {
    return {
      type: ECommand.TORPEDO,
      utility: 0,
      parameters: {},
    };
  }

  const { utility, params } = chooseHighestUtility<ICoordinates>(
    gameMap.matrixes.torpedoReachability[mySubmarine.coordinates.x][mySubmarine.coordinates.y],
    coordinatesToShootAt => {
      const torpedoDamageUtility = calculateTorpedoDamageUtility({
        coordinatesToShootAt,
        mySubmarine,
        opponentSubmarines,
      });

      return torpedoDamageUtility;
    }
  );

  return {
    type: ECommand.TORPEDO,
    utility,
    parameters: { coordinates: params },
  };
};
