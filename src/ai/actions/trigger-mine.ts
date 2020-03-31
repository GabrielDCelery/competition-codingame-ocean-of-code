import { IWeightedCommand } from './base-action';
import { ECommand } from '../../commands';
import { calculateMineDamageUtility, chooseHighestUtility } from '../utils';
import { ISubmarine } from '../../submarines';
import { ICoordinates } from '../../maps';

export const calculateTriggerMineUtility = ({
  mySubmarine,
  opponentSubmarines,
}: {
  mySubmarine: ISubmarine;
  opponentSubmarines: ISubmarine[];
}): IWeightedCommand => {
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
