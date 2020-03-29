import { ISubmarine, chargeRealSubmarine } from '../submarines';
import { ECommand, ECharge } from './enums';
import { ICommand, IMoveCommandParameters, ITorpedoCommandParameters } from './interfaces';
import {
  createVisitedMap,
  IGameMapDimensions,
  addVectorToCoordinates,
  transformDirectionToVector,
} from '../maps';
import { CHARGE_ANY_PER_MOVE, CHARGE_TORPEDO } from '../constants';
import { getDamageTakenFromTorpedo } from '../weapons';

export const applyCommandsToSubmarine = ({
  commands,
  gameMapDimensions,
  submarine,
}: {
  commands: ICommand[];
  gameMapDimensions: IGameMapDimensions;
  submarine: ISubmarine;
}): void => {
  submarine.commands.last = commands;

  commands.forEach(command => {
    const { type, parameters } = command;

    switch (type) {
      case ECommand.MOVE: {
        const { direction, chargeCommand } = parameters as IMoveCommandParameters;
        const newCoordinates = addVectorToCoordinates({
          coordinates: submarine.coordinates,
          vector: transformDirectionToVector(direction),
        });
        const { x, y } = submarine.coordinates;
        submarine.maps.visited[x][y] = true;
        submarine.coordinates = newCoordinates;
        chargeRealSubmarine({
          submarine,
          amount: CHARGE_ANY_PER_MOVE,
          type: chargeCommand as ECharge,
        });
        return;
      }

      case ECommand.SURFACE: {
        submarine.health = submarine.health - 1;
        submarine.maps.visited = createVisitedMap(gameMapDimensions);
        return;
      }

      case ECommand.TORPEDO: {
        const { coordinates } = parameters as ITorpedoCommandParameters;
        const damageTaken = getDamageTakenFromTorpedo({
          submarineCoordinates: submarine.coordinates,
          detonatedAtCoordinates: coordinates,
        });
        submarine.health = submarine.health - damageTaken;
        submarine.charges[ECharge.TORPEDO] -= CHARGE_TORPEDO;
        return;
      }

      default: {
        console.error(`Could not process command -> ${command}`);
        throw new Error(`Could not process command -> ${command}`);
      }
    }
  });
};
