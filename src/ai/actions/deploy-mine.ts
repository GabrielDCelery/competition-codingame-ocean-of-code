import { ECharge, ECommand } from '../../commands';
import {
  ICoordinates,
  areCoordinatesWalkable,
  createVectorFromCoordinates,
  getNeighbouringCells,
  transformCoordinatesToKey,
  transformVectorToDirection,
} from '../../maps';
import { getRandomElemFromList } from '../../common';
import { CHARGE_MINE } from '../../constants';
import { TActionUtilityCalculator } from './base-action';

export const calculateDeployMineUtility: TActionUtilityCalculator = ({ gameMap, mySubmarine }) => {
  if (mySubmarine.charges[ECharge.MINE] < CHARGE_MINE) {
    return {
      type: ECommand.MINE,
      utility: 0,
      parameters: {},
    };
  }

  const minesMap: { [index: string]: boolean } = {};
  mySubmarine.mines.forEach(mineCoordinates => {
    const locationKey = transformCoordinatesToKey(mineCoordinates);
    minesMap[locationKey] = true;
  });
  let possibleLocationsToDeploy = getNeighbouringCells(mySubmarine.coordinates);

  possibleLocationsToDeploy = possibleLocationsToDeploy.filter(coordinates => {
    return (
      areCoordinatesWalkable({ coordinates, walkabilityMatrix: gameMap.walkabilityMatrix }) &&
      minesMap[transformCoordinatesToKey(coordinates)] !== true
    );
  });

  if (possibleLocationsToDeploy.length === 0) {
    return {
      type: ECommand.MINE,
      utility: 0,
      parameters: {},
    };
  }

  const vector = createVectorFromCoordinates({
    source: mySubmarine.coordinates,
    target: getRandomElemFromList<ICoordinates>(possibleLocationsToDeploy),
  });
  const direction = transformVectorToDirection(vector);

  return {
    type: ECommand.MINE,
    utility: 1,
    parameters: {
      direction,
    },
  };
};
