export const chooseHighestUtility = <T>(
  list: T[],
  applyFunc: (n: T) => number
): { utility: number; params: T } => {
  let utility = -1;
  let params: T = list[0];

  list.forEach(elem => {
    const currentUtility = applyFunc(elem);

    if (utility < currentUtility) {
      utility = currentUtility;
      params = elem;
    }
  });

  return { utility, params };
};

export const averageUtilities = <T>(list: T[], applyFunc: (n: T) => number): number => {
  let total = 0;
  const iMax = list.length;

  for (let i = 0; i < iMax; i++) {
    total += applyFunc(list[i]);
  }

  return total / iMax;
};
