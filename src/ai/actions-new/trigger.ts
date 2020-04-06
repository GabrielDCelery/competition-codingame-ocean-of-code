import { TActionUtilityCalculator } from './interfaces';
import { ECommand } from '../../commands';
import { ICoordinates } from '../../maps';
import { chooseHighestUtility } from '../utility-helpers';
import { calculateTriggerMineAtCoordinatesUtility } from '../utilities';

export const calculateTriggerActionUtility: TActionUtilityCalculator = ({
  mySubmarine,
  opponentSubmarines,
}) => {
  const { utility, params } = chooseHighestUtility<ICoordinates>(
    mySubmarine.mines,
    coordinatesToDetonateAt => {
      return calculateTriggerMineAtCoordinatesUtility({
        coordinatesToDetonateAt,
        sourceSubmarine: mySubmarine,
        possibleTargetSubmarines: opponentSubmarines,
      });
    }
  );

  return {
    type: ECommand.TRIGGER,
    utility,
    parameters: { coordinates: params },
  };
};
