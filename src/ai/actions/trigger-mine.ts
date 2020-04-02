import { TActionUtilityCalculator } from './base-action';
import { ECommand } from '../../commands';
import { calculateMineDamageUtility, chooseHighestUtility } from '../utils';
import { ICoordinates } from '../../maps';

export const calculateTriggerMineUtility: TActionUtilityCalculator = ({
  mySubmarine,
  opponentSubmarines,
}) => {
  const { utility, params } = chooseHighestUtility<ICoordinates>(
    mySubmarine.mines,
    coordinatesToDetonateAt => {
      const mineDamageUtility = calculateMineDamageUtility({
        coordinatesToDetonateAt,
        mySubmarine,
        opponentSubmarines,
      });

      return mineDamageUtility;
    }
  );

  return {
    type: ECommand.TRIGGER,
    utility,
    parameters: { coordinates: params },
  };
};
