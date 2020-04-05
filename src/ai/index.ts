import {
  IWeightedCommand,
  TActionUtilityCalculator,
  calculateDeployMineUtility,
  calculateMoveActionUtility,
  calculateSurfaceActionUtility,
  calculateTorpedoActionUtility,
  calculateTriggerMineUtility,
  calculateSilenceActionUtility,
} from './actions';
import { ECommand, ICommand, applyCommandsToSubmarine } from '../commands';
import { IGameState } from '../game-state';
import { ISubmarine, cloneSubmarine } from '../submarines';
import { IGameMap } from '../maps';

export const createChainedCommands = ({
  pickedCommands,
  mySubmarine,
  myPhantomSubmarines,
  opponentSubmarines,
  gameMap,
  utilityActions,
  minUtility,
}: {
  pickedCommands: IWeightedCommand[];
  mySubmarine: ISubmarine;
  myPhantomSubmarines: ISubmarine[];
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
        myPhantomSubmarines,
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
    myPhantomSubmarines,
    opponentSubmarines,
    gameMap,
    utilityActions,
    minUtility,
  });
};

export const pickCommandsForTurn = ({ gameState }: { gameState: IGameState }): ICommand[] => {
  const commands1 = createChainedCommands({
    pickedCommands: [],
    mySubmarine: cloneSubmarine(gameState.players.me.real),
    myPhantomSubmarines: gameState.players.me.phantoms,
    opponentSubmarines: gameState.players.opponent.phantoms,
    gameMap: gameState.map,
    utilityActions: [
      { utilityCalculator: calculateSurfaceActionUtility, types: [ECommand.SURFACE] },
      { utilityCalculator: calculateDeployMineUtility, types: [ECommand.MINE, ECommand.TRIGGER] },
      { utilityCalculator: calculateTriggerMineUtility, types: [ECommand.MINE, ECommand.TRIGGER] },
    ],
    minUtility: 0.2,
  });

  const commands2 = createChainedCommands({
    pickedCommands: commands1.pickedCommands,
    mySubmarine: cloneSubmarine(commands1.mySubmarine),
    myPhantomSubmarines: gameState.players.me.phantoms,
    opponentSubmarines: gameState.players.opponent.phantoms,
    gameMap: gameState.map,
    utilityActions: [
      { utilityCalculator: calculateTorpedoActionUtility, types: [ECommand.TORPEDO] },
    ],
    minUtility: 0.4,
  });

  const commands3 = createChainedCommands({
    pickedCommands: commands2.pickedCommands,
    mySubmarine: cloneSubmarine(commands2.mySubmarine),
    myPhantomSubmarines: gameState.players.me.phantoms,
    opponentSubmarines: gameState.players.opponent.phantoms,
    gameMap: gameState.map,
    utilityActions: [{ utilityCalculator: calculateMoveActionUtility, types: [ECommand.MOVE] }],
    minUtility: 0,
  });

  const commands4 = createChainedCommands({
    pickedCommands: commands3.pickedCommands,
    mySubmarine: cloneSubmarine(commands3.mySubmarine),
    myPhantomSubmarines: gameState.players.me.phantoms,
    opponentSubmarines: gameState.players.opponent.phantoms,
    gameMap: gameState.map,
    utilityActions: [
      { utilityCalculator: calculateTorpedoActionUtility, types: [ECommand.TORPEDO] },
    ],
    minUtility: 0.4,
  });

  const commands5 = createChainedCommands({
    pickedCommands: commands4.pickedCommands,
    mySubmarine: cloneSubmarine(commands4.mySubmarine),
    myPhantomSubmarines: gameState.players.me.phantoms,
    opponentSubmarines: gameState.players.opponent.phantoms,
    gameMap: gameState.map,
    utilityActions: [
      { utilityCalculator: calculateSurfaceActionUtility, types: [ECommand.SURFACE] },
      { utilityCalculator: calculateDeployMineUtility, types: [ECommand.MINE, ECommand.TRIGGER] },
      { utilityCalculator: calculateTriggerMineUtility, types: [ECommand.MINE, ECommand.TRIGGER] },
    ],
    minUtility: 0.2,
  });

  const commands6 = createChainedCommands({
    pickedCommands: commands5.pickedCommands,
    mySubmarine: cloneSubmarine(commands5.mySubmarine),
    myPhantomSubmarines: gameState.players.me.phantoms,
    opponentSubmarines: gameState.players.opponent.phantoms,
    gameMap: gameState.map,
    utilityActions: [
      { utilityCalculator: calculateSilenceActionUtility, types: [ECommand.SILENCE] },
    ],
    minUtility: 0.4,
  });

  return commands6.pickedCommands.map(({ type, parameters }) => {
    return { type, parameters };
  });
};
