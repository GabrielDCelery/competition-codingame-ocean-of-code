import { IWeightedCommand, TActionUtilityCalculator } from './actions';
import { ECommand, ICommand } from '../commands';
import { IGameState } from '../game-state';
import { cloneRealSubmarine } from '../submarines';
import { ICommandsSubSet, pickCommandsFromCommandSet } from './pick-commands-from-command-set';
import { playerAiCommandSets } from './player-ai-command-sets';
import { calculateMineProbabilityMatrix } from '../weapons';

export interface IUtilityAction {
  utilityCalculator: TActionUtilityCalculator;
  types: ECommand[];
}

export interface IActionSet {
  utilityActions: IUtilityAction[];
  minUtility: number;
}

const createWeightedCommandsFromActionsSets = ({
  gameState,
  commandSet,
}: {
  gameState: IGameState;
  commandSet: IActionSet[];
}): IWeightedCommand[] => {
  let commandsSubSet: ICommandsSubSet = {
    mySubmarine: gameState.players.me.real,
    pickedCommands: [],
  };

  commandSet.forEach(actionSet => {
    const { pickedCommands, mySubmarine } = commandsSubSet;
    const { utilityActions, minUtility } = actionSet;

    commandsSubSet = pickCommandsFromCommandSet({
      pickedCommands,
      mySubmarine: cloneRealSubmarine(mySubmarine),
      myPhantomSubmarines: gameState.players.me.phantoms,
      opponentSubmarines: gameState.players.opponent.phantoms,
      gameMap: gameState.map,
      utilityActions,
      minUtility,
    });
  });

  return commandsSubSet.pickedCommands;
};

export const pickCommandsForTurn = (gameState: IGameState): ICommand[] => {
  console.error(gameState.players.opponent.phantoms.length);
  console.error(gameState.players.me.phantoms.length);
  gameState.map.cache.mineLocationsProbabilityMatrix = calculateMineProbabilityMatrix({
    gameMap: gameState.map,
    mineTrackers: gameState.players.opponent.phantoms.map(e => e.mineTracker),
  });

  const weightedCommands = createWeightedCommandsFromActionsSets({
    gameState,
    commandSet: playerAiCommandSets.v1,
  });

  return weightedCommands.map(({ type, parameters }) => {
    return { type, parameters };
  });
};
