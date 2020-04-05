import { ECharge } from '../../commands';
import { ISubmarine } from '../../submarines';
import { CHARGE_TORPEDO, CHARGE_SILENCE } from '../../constants';
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

  if (mySubmarine.charges[ECharge.SILENCE] < CHARGE_SILENCE) {
    return ECharge.SILENCE;
  }

  return ECharge.MINE;
};
