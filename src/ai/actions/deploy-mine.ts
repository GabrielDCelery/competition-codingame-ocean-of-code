import { IWeightedCommand } from './base-action';
import { ECharge, ECommand } from '../../commands';
import { getNeighbouringCells, isTerrainCellWalkable, ICoordinates, IGameMap } from '../../maps';
import { ISubmarine } from '../../submarines';
import {
  areCoordinatesWithinBoundaries,
  transformCoordinatesToKey,
  createVectorFromCoordinates,
  transformVectorToDirection,
} from '../../maps';
import { getRandomElemFromList } from '../../common';
import { CHARGE_MINE } from '../../constants';

export const calculateDeployMineUtility = ({
  gameMap,
  mySubmarine,
}: {
  gameMap: IGameMap;
  mySubmarine: ISubmarine;
}): IWeightedCommand => {
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
    const locationKey = transformCoordinatesToKey(coordinates);
    return (
      areCoordinatesWithinBoundaries({ coordinates, gameMapDimensions: gameMap.dimensions }) &&
      isTerrainCellWalkable({ coordinates, terrainMap: gameMap.terrain }) &&
      minesMap[locationKey] !== true
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
