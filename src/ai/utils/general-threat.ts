import { IGameMap } from '../../maps';
import { average, normalizeLinear } from '../../common';
import { ISubmarine } from '../../submarines';
import { areCoordinatesReachableByTorpedo } from '../../weapons';

export const calculateGeneralThreatUtility = ({
  mySubmarine,
  opponentSubmarines,
}: {
  gameMap: IGameMap;
  mySubmarine: ISubmarine;
  myPhantomSubmarines: ISubmarine[];
  opponentSubmarines: ISubmarine[];
}): number => {
  const urgeToPreserveHealth =
    1 -
    normalizeLinear({
      value: mySubmarine.health,
      max: opponentSubmarines[0].health,
    });

  const urgeToMakeDistance = average(
    opponentSubmarines.map(opponentSubmarine => {
      return areCoordinatesReachableByTorpedo(
        opponentSubmarine.coordinates,
        mySubmarine.coordinates
      )
        ? urgeToPreserveHealth
        : 0;
    })
  );

  return urgeToMakeDistance;
};
