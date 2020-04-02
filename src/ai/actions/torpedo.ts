import { CHARGE_TORPEDO } from '../../constants';
import { ECommand, ECharge } from '../../commands';
import { calculateTorpedoDamageUtility, chooseHighestUtility } from '../utils';
import { ICoordinates } from '../../maps';
import { TActionUtilityCalculator } from './base-action';

export const calculateTorpedoActionUtility: TActionUtilityCalculator = ({
  mySubmarine,
  opponentSubmarines,
  gameMap,
}) => {
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
