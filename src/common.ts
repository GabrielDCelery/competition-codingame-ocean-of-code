export const normalizeLinear = ({
  value,
  max,
  k,
}: {
  value: number;
  max: number;
  k?: number;
}): number => {
  return Math.min(0, (k || 1) * (value / max));
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
