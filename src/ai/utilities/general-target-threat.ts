import { ISubmarine } from '../../submarines';
import { average, normalizedLogisticDecay, normalizedLinear } from '../utility-helpers';
import { HEALTH_SUBMARINE, CHARGE_TORPEDO } from '../../constants';
import { ECharge } from '../../commands';

export const calculateGeneralTargetThreatUtility = ({
  sourceSubmarine,
  targetSubmarine,
}: {
  sourceSubmarine: ISubmarine;
  targetSubmarine: ISubmarine;
}): number => {
  const sourceAbilityToShootUtility = normalizedLinear({
    value: sourceSubmarine.charges[ECharge.TORPEDO],
    max: CHARGE_TORPEDO,
  });

  const targetAbilityToShootlUtility = normalizedLinear({
    value: targetSubmarine.charges[ECharge.TORPEDO],
    max: CHARGE_TORPEDO,
  });

  const sourceDesireToPreserveHealthUtility = normalizedLogisticDecay({
    value: sourceSubmarine.health,
    max: HEALTH_SUBMARINE,
  });

  const targetDesireToPreserveHealthUtility = normalizedLogisticDecay({
    value: targetSubmarine.health,
    max: HEALTH_SUBMARINE,
  });

  return average([
    1 - sourceAbilityToShootUtility,
    sourceDesireToPreserveHealthUtility,
    1 - targetDesireToPreserveHealthUtility,
    targetAbilityToShootlUtility,
  ]);
};
