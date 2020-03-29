import {
  calculateMoveActionUtility,
  calculateSurfaceActionUtility,
  calculateTorpedoActionUtility,
  IWeightedCommand,
} from './actions';
import { ECommand, ICommand, applyCommandsToSubmarine } from '../commands';
import { IGameState } from '../game-state';
import { ISubmarine, cloneSubmarine } from '../submarines';
import { IGameMapDimensions, ITerrainMap } from '../maps';

export const appendNextCommand = ({
  pickedCommands,
  mySubmarine,
  opponentSubmarines,
  gameMapDimensions,
  terrainMap,
}: {
  pickedCommands: IWeightedCommand[];
  mySubmarine: ISubmarine;
  opponentSubmarines: ISubmarine[];
  gameMapDimensions: IGameMapDimensions;
  terrainMap: ITerrainMap;
}): IWeightedCommand[] => {
  let maxUtility = 0.2;

  const pickedCommandsMap: { [index: string]: boolean } = {};

  pickedCommands.forEach(({ type }) => {
    pickedCommandsMap[type] = true;
  });

  const toCheckCommands: IWeightedCommand[] = [];

  if (pickedCommandsMap[ECommand.MOVE] !== true) {
    toCheckCommands.push(
      calculateMoveActionUtility({
        mySubmarine,
        opponentSubmarines,
        gameMapDimensions,
        terrainMap,
      })
    );
  }

  if (pickedCommandsMap[ECommand.TORPEDO] !== true) {
    toCheckCommands.push(
      calculateTorpedoActionUtility({
        mySubmarine,
        opponentSubmarines,
        gameMapDimensions,
        terrainMap,
      })
    );
  }

  if (pickedCommandsMap[ECommand.SURFACE] !== true) {
    toCheckCommands.push(
      calculateSurfaceActionUtility({
        mySubmarine,
        gameMapDimensions,
        terrainMap,
      })
    );
  }

  const chosenCommands = toCheckCommands.filter(({ utility }) => {
    if (maxUtility < utility) {
      maxUtility = utility;
      return true;
    }

    return false;
  });

  if (chosenCommands.length === 0) {
    return pickedCommands;
  }

  const clonedSubmarine = cloneSubmarine(mySubmarine);

  applyCommandsToSubmarine({
    commands: chosenCommands,
    gameMapDimensions,
    submarine: clonedSubmarine,
  });

  return appendNextCommand({
    pickedCommands: [...pickedCommands, chosenCommands[0]],
    mySubmarine: clonedSubmarine,
    opponentSubmarines,
    gameMapDimensions,
    terrainMap,
  });
};

export const pickCommandsForTurn = ({ gameState }: { gameState: IGameState }): ICommand[] => {
  const pickedCommands = appendNextCommand({
    pickedCommands: [],
    mySubmarine: gameState.players.me.real,
    opponentSubmarines: gameState.players.opponent.phantoms,
    gameMapDimensions: gameState.map.dimensions,
    terrainMap: gameState.map.terrain,
  });

  return pickedCommands.map(({ type, parameters }) => {
    return { type, parameters };
  });
};
