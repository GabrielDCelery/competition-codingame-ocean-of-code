import { ECharge } from '../../commands';
import { ISubmarine } from '../../submarines';
import { CHARGE_TORPEDO, CHARGE_SILENCE } from '../../constants';
import { getSectorForCoordinates, IGameMap } from '../../maps';
/*
const getOpponentSectorSpreadRatio = ({
  gameMap,
  opponentSubmarines,
}: {
  gameMap: IGameMap;
  opponentSubmarines: ISubmarine[];
}): number => {
  const sectorToOpponentCountMap: { [index: string]: number } = {};

  opponentSubmarines.forEach(opponentSubmarine => {
    const sector = getSectorForCoordinates({
      coordinates: opponentSubmarine.coordinates,
      gameMapDimensions: gameMap.dimensions,
    });

    if (sectorToOpponentCountMap[sector] === undefined) {
      sectorToOpponentCountMap[sector] = 0;
    }

    sectorToOpponentCountMap[sector] += 1;
  });

  return Object.keys(sectorToOpponentCountMap).length / gameMap.numOfSectors;
};
*/
export const chooseChargeCommand = ({
  gameMap,
  mySubmarine,
  opponentSubmarines,
}: {
  gameMap: IGameMap;
  mySubmarine: ISubmarine;
  opponentSubmarines: ISubmarine[];
}): ECharge => {
  if (mySubmarine.charges[ECharge.TORPEDO] < CHARGE_TORPEDO) {
    return ECharge.TORPEDO;
  }
  /*
  if (mySubmarine.charges[ECharge.SILENCE] < CHARGE_SILENCE) {
    return ECharge.SILENCE;
  }
*/
  /*
  if (
    mySubmarine.charges.SONAR < CHARGE_SONAR &&
    0.3 < getOpponentSectorSpreadRatio({ opponentSubmarines, gameMap })
  ) {
    return ECharge.SONAR;
  }
*/
  return ECharge.MINE;
};
