import { getDamageTakenFromTorpedo, getCoordinatesReachableByTorpedo } from '../../weapons';
import { ISubmarine } from '../../submarines';
import { IGameMapDimensions, ITerrainMap, ICoordinates } from '../../maps';
import { DAMAGE_TORPEDO } from '../../constants';

interface IUtility {
  utility: number;
  parameters: { coordinates: ICoordinates };
}

const getUtilityForDamage = ({
  damageToMe,
  damageToMyOpponent,
  myHealth,
  opponentHealth,
}: {
  damageToMe: number;
  damageToMyOpponent: number;
  myHealth: number;
  opponentHealth: number;
}): number => {
  if (opponentHealth <= damageToMyOpponent && damageToMe < myHealth) {
    return 1;
  }

  if (0 < damageToMe) {
    return 0;
  }

  if (0 < damageToMyOpponent) {
    return DAMAGE_TORPEDO === damageToMyOpponent ? 1 : 0.7;
  }

  return 0;
};

export const calculateTorpedoDamageUtility = ({
  mySubmarine,
  opponentSubmarines,
  gameMapDimensions,
  terrainMap,
}: {
  mySubmarine: ISubmarine;
  opponentSubmarines: ISubmarine[];
  gameMapDimensions: IGameMapDimensions;
  terrainMap: ITerrainMap;
}): IUtility => {
  let chosenUtility = -1;
  let chosenCoordinates: ICoordinates = mySubmarine.coordinates;

  getCoordinatesReachableByTorpedo({
    coordinatesToShootFrom: mySubmarine.coordinates,
    gameMapDimensions,
    terrainMap,
  }).forEach(coordinatesToShootAt => {
    const damageToMe = getDamageTakenFromTorpedo({
      submarineCoordinates: mySubmarine.coordinates,
      detonatedAtCoordinates: coordinatesToShootAt,
    });

    let utility = 0;

    opponentSubmarines.forEach(opponentSubmarine => {
      const damageToMyOpponent = getDamageTakenFromTorpedo({
        submarineCoordinates: opponentSubmarine.coordinates,
        detonatedAtCoordinates: coordinatesToShootAt,
      });

      utility +=
        getUtilityForDamage({
          damageToMe,
          damageToMyOpponent,
          myHealth: mySubmarine.health,
          opponentHealth: opponentSubmarine.health,
        }) / opponentSubmarines.length;
    });

    if (chosenUtility < utility) {
      chosenUtility = utility;
      chosenCoordinates = coordinatesToShootAt;
    }
  });

  return {
    utility: chosenUtility,
    parameters: { coordinates: chosenCoordinates },
  };
};
