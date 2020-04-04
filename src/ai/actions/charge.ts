import { ECharge } from '../../commands';
import { ISubmarine } from '../../submarines';
import { CHARGE_TORPEDO } from '../../constants';
import { IGameMap } from '../../maps';

export const chooseChargeCommand = ({
  mySubmarine,
}: {
  gameMap: IGameMap;
  mySubmarine: ISubmarine;
  opponentSubmarines: ISubmarine[];
}): ECharge => {
  if (mySubmarine.charges[ECharge.TORPEDO] < CHARGE_TORPEDO) {
    return ECharge.TORPEDO;
  }

  return ECharge.MINE;
};
