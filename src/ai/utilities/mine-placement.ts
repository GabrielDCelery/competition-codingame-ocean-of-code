import { average, normalizedLinear, normalizedLinearDecay } from '../utility-helpers';
import {
  ICoordinates,
  IGameMap,
  getNeighbouringCells,
  areCoordinatesWalkable,
  getDistanceBetweenCoordinates,
} from '../../maps';

export const calculateMinePlacementUtility = ({
  deployCoordinates,
  gameMap,
}: {
  deployCoordinates: ICoordinates;
  gameMap: IGameMap;
}): number => {
  const numOfOpenCells = getNeighbouringCells(deployCoordinates).filter(coordinates => {
    return areCoordinatesWalkable({
      coordinates,
      walkabilityMatrix: gameMap.walkabilityMatrix,
    });
  }).length;

  const opennessUtility = normalizedLinear({
    value: numOfOpenCells,
    max: 4,
  });

  const ditanceFromCenter = getDistanceBetweenCoordinates(deployCoordinates, {
    x: Math.round(gameMap.width),
    y: Math.round(gameMap.height),
  });

  const distanceFromCenterUtility = normalizedLinearDecay({
    value: ditanceFromCenter,
    max: 14,
  });

  return average([opennessUtility, distanceFromCenterUtility]);
};
