import { ECharge, ECommand } from '../../commands';
import {
  ICoordinates,
  areCoordinatesWalkable,
  createVectorFromCoordinates,
  getNeighbouringCells,
  transformCoordinatesToKey,
  transformVectorToDirection,
} from '../../maps';
import { CHARGE_MINE } from '../../constants';
import { TActionUtilityCalculator } from './interfaces';

export const getRandomElemFromList = <T>(items: T[]): T => {
  return items[Math.floor(Math.random() * items.length)];
};

export const calculateMineActionUtility: TActionUtilityCalculator = ({ gameMap, mySubmarine }) => {
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
