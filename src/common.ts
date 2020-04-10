export const normalizeLinear = ({
  value,
  max,
  k = 1,
}: {
  value: number;
  max: number;
  k?: number;
}): number => {
  return Math.min(1, k * (value / max));
};

export const normalizeExponential = ({
  value,
  max,
  k,
}: {
  value: number;
  max: number;
  k: number;
}): number => {
  const x = value / max;

  return (Math.pow(k, x) - 1) / (k - 1);
};

export const sum = (array: Array<number>): number => {
  return array.reduce((a, b) => a + b, 0);
};

export const average = (array: Array<number>): number => {
  return sum(array) / array.length;
};

export const weightedAverage = (array: Array<{ value: number; weight: number }>): number => {
  let final = 0;

  array.forEach(({ weight, value }) => {
    final += weight * value;
  });

  return final;
};

export const getRandomElemFromList = <T>(items: T[]): T => {
  return items[Math.floor(Math.random() * items.length)];
};
