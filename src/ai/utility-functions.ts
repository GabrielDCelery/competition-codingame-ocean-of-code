export const sum = (array: Array<number>): number => {
  return array.reduce((a, b) => a + b, 0);
};

export const average = (array: Array<number>): number => {
  return sum(array) / array.length;
};

export const weightedAverage = (array: Array<{ value: number; weight: number }>): number => {
  let final = 0;
  let totalWeight = 0;

  array.forEach(({ weight, value }) => {
    final += weight * value;
    totalWeight += weight;
  });

  if (totalWeight !== 1) {
    throw new Error(`Total weight shoul be 1, intead recieved: ${totalWeight}`);
  }

  return final;
};

export const normalizedLinear = ({
  value,
  max,
  a = 1,
}: {
  value: number;
  max: number;
  a?: number;
}): number => {
  const x = value / max;
  return a < 1 ? Math.min(1, x / a) : x / a;
};

export const normalizedExponential = ({
  value,
  max,
  a = 2,
}: {
  value: number;
  max: number;
  a?: number;
}): number => {
  const x = value / max;

  if (a < 1) {
    throw new Error(`a cannot be less than 1, recieved: ${a}`);
  }

  return Math.pow(x, a);
};

export const normalizedExponentialDecay = ({
  value,
  max,
  a = 2,
}: {
  value: number;
  max: number;
  a?: number;
}): number => {
  const x = 1 - value / max;

  if (a < 1) {
    throw new Error(`a cannot be less than 1, recieved: ${a}`);
  }

  return Math.pow(x, a);
};

export const normalizedLogistic = ({
  value,
  max,
  a = 1,
}: {
  value: number;
  max: number;
  a?: number;
}): number => {
  const x = value / max;

  return 1 / (1 + Math.pow(Math.E, -1 * a * (4 * Math.E * x - 2 * Math.E)));
};

export const normalizedLogisticDecay = ({
  value,
  max,
  a = 1,
}: {
  value: number;
  max: number;
  a?: number;
}): number => {
  const x = 1 - value / max;

  return 1 / (1 + Math.pow(Math.E, -1 * a * (4 * Math.E * x - 2 * Math.E)));
};
