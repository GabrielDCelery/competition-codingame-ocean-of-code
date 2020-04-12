import { CHARGE_TORPEDO } from '../../constants';
import { ECommand, ECharge } from '../../commands';
import { calculateFireTorpedoAtCoordinatesUtility } from '../utilities';
import { chooseHighestUtility } from '../utility-helpers';
import { ICoordinates } from '../../maps';
import { TActionUtilityCalculator } from './interfaces';

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

  const coordinatesToShootAtList =
    gameMap.cache.torpedoReachability[mySubmarine.coordinates.x][mySubmarine.coordinates.y];

  const { utility, params } = chooseHighestUtility<ICoordinates>(
    coordinatesToShootAtList,
    coordinatesToShootAt => {
      const utility = calculateFireTorpedoAtCoordinatesUtility({
        coordinatesToShootAt,
        sourceSubmarine: mySubmarine,
        possibleTargetSubmarines: opponentSubmarines,
      });

      return utility;
    }
  );

  return {
    type: ECommand.TORPEDO,
    utility,
    parameters: { coordinates: params },
  };
};
