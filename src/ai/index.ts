import {
  IWeightedCommand,
  calculateDeployMineUtility,
  calculateMoveActionUtility,
  calculateSurfaceActionUtility,
  calculateTorpedoActionUtility,
  calculateTriggerMineUtility,
} from './actions';
import { ECommand, ICommand, applyCommandsToSubmarine } from '../commands';
import { IGameState } from '../game-state';
import { ISubmarine, cloneSubmarine } from '../submarines';
import { IGameMap } from '../maps';

export const appendNextCommand = ({
  pickedCommands,
  mySubmarine,
  myPhantomSubmarines,
  opponentSubmarines,
  gameMap,
}: {
  pickedCommands: IWeightedCommand[];
  mySubmarine: ISubmarine;
  myPhantomSubmarines: ISubmarine[];
  opponentSubmarines: ISubmarine[];
  gameMap: IGameMap;
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
        gameMapDimensions: gameMap.dimensions,
        terrainMap: gameMap.terrain,
        gameMap,
      })
    );
  }

  if (pickedCommandsMap[ECommand.TORPEDO] !== true) {
    toCheckCommands.push(
      calculateTorpedoActionUtility({
        mySubmarine,
        myPhantomSubmarines,
        opponentSubmarines,
        gameMap,
      })
    );
  }

  if (pickedCommandsMap[ECommand.SURFACE] !== true) {
    toCheckCommands.push(
      calculateSurfaceActionUtility({
        mySubmarine,
        gameMapDimensions: gameMap.dimensions,
        terrainMap: gameMap.terrain,
      })
    );
  }

  if (pickedCommandsMap[ECommand.MINE] !== true && pickedCommandsMap[ECommand.TRIGGER] !== true) {
    toCheckCommands.push(
      calculateDeployMineUtility({
        mySubmarine,
        gameMap,
      })
    );
  }

  if (pickedCommandsMap[ECommand.MINE] !== true && pickedCommandsMap[ECommand.TRIGGER] !== true) {
    toCheckCommands.push(
      calculateTriggerMineUtility({
        mySubmarine,
        opponentSubmarines,
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
    gameMapDimensions: gameMap.dimensions,
    submarine: clonedSubmarine,
  });

  return appendNextCommand({
    pickedCommands: [...pickedCommands, chosenCommands[0]],
    mySubmarine: clonedSubmarine,
    myPhantomSubmarines,
    opponentSubmarines,
    gameMap,
  });
};

export const pickCommandsForTurn = ({ gameState }: { gameState: IGameState }): ICommand[] => {
  const pickedCommands = appendNextCommand({
    pickedCommands: [],
    mySubmarine: gameState.players.me.real,
    myPhantomSubmarines: gameState.players.me.phantoms,
    opponentSubmarines: gameState.players.opponent.phantoms,
    gameMap: gameState.map,
  });

  return pickedCommands.map(({ type, parameters }) => {
    return { type, parameters };
  });
};
