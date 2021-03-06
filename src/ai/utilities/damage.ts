import { normalizedExponential } from '../utility-helpers';

export const calculateDamageUtility = ({
  maxDamage,
  damageToTarget,
  damageToSource,
  targetHealth,
  sourceHealth,
}: {
  maxDamage: number;
  damageToTarget: number;
  damageToSource: number;
  targetHealth: number;
  sourceHealth: number;
}): number => {
  if (damageToTarget === 0) {
    return 0;
  }

  if (targetHealth <= damageToTarget && damageToSource < sourceHealth) {
    return 1;
  }

  if (0 < damageToSource) {
    return 0;
  }

  return normalizedExponential({
    value: damageToTarget,
    max: maxDamage,
    a: 1.3,
  });
};
