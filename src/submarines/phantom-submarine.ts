import { ECharge } from '../commands';
import { ICoordinates, TWalkabilityMatrix } from '../maps';
import { CHARGE_MINE, CHARGE_SILENCE, CHARGE_TORPEDO, CHARGE_SONAR } from '../constants';

export interface IPhantomSubmarinePossibleLocation {
  coordinates: ICoordinates;
  walkabilityMatrix: TWalkabilityMatrix;
}

export interface IPhantomSubmarine {
  health: number;
  charges: {
    [ECharge.TORPEDO]: number;
    [ECharge.SONAR]: number;
    [ECharge.SILENCE]: number;
    [ECharge.MINE]: number;
  };
  locations: IPhantomSubmarinePossibleLocation[];
}

export const chargePhantomSubmarine = ({
  submarine,
}: {
  submarine: IPhantomSubmarine;
}): IPhantomSubmarine => {
  submarine.charges[ECharge.TORPEDO] = Math.min(
    submarine.charges[ECharge.TORPEDO] + 1,
    CHARGE_TORPEDO
  );
  submarine.charges[ECharge.SONAR] = Math.min(submarine.charges[ECharge.SONAR] + 1, CHARGE_SONAR);
  submarine.charges[ECharge.MINE] = Math.min(submarine.charges[ECharge.MINE] + 1, CHARGE_MINE);
  submarine.charges[ECharge.SILENCE] = Math.min(
    submarine.charges[ECharge.SILENCE] + 1,
    CHARGE_SILENCE
  );

  return submarine;
};

export const useChargeForPhantomSubmarine = ({
  submarine,
  type,
}: {
  submarine: IPhantomSubmarine;
  type: ECharge;
}): IPhantomSubmarine => {
  submarine.charges[ECharge.TORPEDO] =
    submarine.charges[ECharge.TORPEDO] - (type === ECharge.TORPEDO ? CHARGE_TORPEDO : 0);
  submarine.charges[ECharge.SONAR] =
    submarine.charges[ECharge.SONAR] - (type === ECharge.SONAR ? CHARGE_SONAR : 0);
  submarine.charges[ECharge.MINE] =
    submarine.charges[ECharge.MINE] - (type === ECharge.MINE ? CHARGE_MINE : 0);
  submarine.charges[ECharge.SILENCE] =
    submarine.charges[ECharge.SILENCE] - (type === ECharge.SILENCE ? CHARGE_SILENCE : 0);

  return submarine;
};
