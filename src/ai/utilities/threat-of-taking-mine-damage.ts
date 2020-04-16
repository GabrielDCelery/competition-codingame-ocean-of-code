import { ICoordinates, IGameMap, getNeighbouringCells, areCoordinatesWalkable } from '../../maps';

export const calculateThreatOfTakingMineDamageUtility = ({
  coordinatesMoveTo,
  gameMap,
}: {
  coordinatesMoveTo: ICoordinates;
  gameMap: IGameMap;
}): number => {
  const probabilityOfTakingDamage =
    1 -
    [coordinatesMoveTo, ...getNeighbouringCells(coordinatesMoveTo)]
      .filter(coordinates => {
        return areCoordinatesWalkable({
          coordinates,
          walkabilityMatrix: gameMap.walkabilityMatrix,
        });
      })
      .map(({ x, y }) => {
        return gameMap.cache.mineLocationsProbabilityMatrix[x][y];
      })
      .reduce((a: number, b: number) => (1 - b) * a, 1);

  return 1 * probabilityOfTakingDamage;
};
