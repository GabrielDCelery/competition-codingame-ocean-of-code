import {
  IWeightedCommand,
  TActionUtilityCalculator,
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

export const createChainedCommands = ({
  pickedCommands,
  mySubmarine,
  opponentSubmarines,
  gameMap,
  utilityActions,
  minUtility,
}: {
  pickedCommands: IWeightedCommand[];
  mySubmarine: ISubmarine;
  opponentSubmarines: ISubmarine[];
  gameMap: IGameMap;
  utilityActions: Array<{
    utilityCalculator: TActionUtilityCalculator;
    types: ECommand[];
  }>;
  minUtility: number;
}): { mySubmarine: ISubmarine; pickedCommands: IWeightedCommand[] } => {
  let highestUtility = minUtility;

  const alreadyPickedCommansMap: { [index: string]: boolean } = {};

  pickedCommands.forEach(({ type }) => {
    alreadyPickedCommansMap[type] = true;
  });

  const toCheckCommands: IWeightedCommand[] = [];

  utilityActions.forEach(({ utilityCalculator, types }) => {
    for (let i = 0, iMax = types.length; i < iMax; i++) {
      if (alreadyPickedCommansMap[types[i]]) {
        return;
      }
    }

    toCheckCommands.push(
      utilityCalculator({
        mySubmarine,
        opponentSubmarines,
        gameMap,
      })
    );
  });

  const chosenCommands = toCheckCommands.filter(({ utility }) => {
    if (highestUtility < utility) {
      highestUtility = utility;
      return true;
    }

    return false;
  });

  if (chosenCommands.length === 0) {
    return { mySubmarine, pickedCommands };
  }

  const clonedSubmarine = cloneSubmarine(mySubmarine);

  applyCommandsToSubmarine({
    commands: chosenCommands,
    gameMap,
    submarine: clonedSubmarine,
  });

  return createChainedCommands({
    pickedCommands: [...pickedCommands, chosenCommands[0]],
    mySubmarine: clonedSubmarine,
    opponentSubmarines,
    gameMap,
    utilityActions,
    minUtility,
  });
};

export const pickCommandsForTurn = ({ gameState }: { gameState: IGameState }): ICommand[] => {
  const tierOneCommands = createChainedCommands({
    pickedCommands: [],
    mySubmarine: cloneSubmarine(gameState.players.me.real),
    opponentSubmarines: gameState.players.opponent.phantoms,
    gameMap: gameState.map,
    utilityActions: [
      { utilityCalculator: calculateSurfaceActionUtility, types: [ECommand.SURFACE] },
      { utilityCalculator: calculateDeployMineUtility, types: [ECommand.MINE, ECommand.TRIGGER] },
      { utilityCalculator: calculateTriggerMineUtility, types: [ECommand.MINE, ECommand.TRIGGER] },
    ],
    minUtility: 0.2,
  });

  const tierTwoCommands = createChainedCommands({
    pickedCommands: tierOneCommands.pickedCommands,
    mySubmarine: cloneSubmarine(tierOneCommands.mySubmarine),
    opponentSubmarines: gameState.players.opponent.phantoms,
    gameMap: gameState.map,
    utilityActions: [
      { utilityCalculator: calculateMoveActionUtility, types: [ECommand.MOVE] },
      { utilityCalculator: calculateTorpedoActionUtility, types: [ECommand.TORPEDO] },
    ],
    minUtility: 0.2,
  });

  const tierThreeCommands = createChainedCommands({
    pickedCommands: tierTwoCommands.pickedCommands,
    mySubmarine: cloneSubmarine(tierTwoCommands.mySubmarine),
    opponentSubmarines: gameState.players.opponent.phantoms,
    gameMap: gameState.map,
    utilityActions: [
      { utilityCalculator: calculateSurfaceActionUtility, types: [ECommand.SURFACE] },
      { utilityCalculator: calculateDeployMineUtility, types: [ECommand.MINE, ECommand.TRIGGER] },
      { utilityCalculator: calculateTriggerMineUtility, types: [ECommand.MINE, ECommand.TRIGGER] },
    ],
    minUtility: 0.2,
  });

  return tierThreeCommands.pickedCommands.map(({ type, parameters }) => {
    return { type, parameters };
  });
};
