import { ISubmarine, chargeRealSubmarine } from '../submarines';
import { ECommand, ECharge } from './enums';
import {
  ICommand,
  IMoveCommandParameters,
  ITorpedoCommandParameters,
  IMineCommandParameters,
  ITriggerCommandParameters,
} from './interfaces';
import {
  EDirection,
  createVisitedMap,
  IGameMapDimensions,
  addVectorToCoordinates,
  transformDirectionToVector,
  areCoordinatesTheSame,
} from '../maps';
import { CHARGE_ANY_PER_MOVE, CHARGE_TORPEDO, CHARGE_MINE } from '../constants';
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

      case ECommand.MINE: {
        const { direction } = parameters as IMineCommandParameters;
        const mineCoordinates = addVectorToCoordinates({
          coordinates: submarine.coordinates,
          vector: transformDirectionToVector(direction as EDirection),
        });
        submarine.mines = [...submarine.mines, mineCoordinates];
        submarine.charges[ECharge.MINE] -= CHARGE_MINE;
        return;
      }

      case ECommand.TRIGGER: {
        const { coordinates } = parameters as ITriggerCommandParameters;
        submarine.mines = submarine.mines.filter(mineCoordinates => {
          return areCoordinatesTheSame(coordinates, mineCoordinates) === false;
        });
        return;
      }

      default: {
        console.error(`Could not process command -> ${command}`);
        throw new Error(`Could not process command -> ${command}`);
      }
    }
  });
};
