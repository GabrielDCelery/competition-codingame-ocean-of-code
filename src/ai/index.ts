import {
  calculateMoveActionUtility,
  calculateSurfaceActionUtility,
  calculateTorpedoActionUtility,
  IWeightedCommand,
} from './actions';
import { ECommand, ICommand } from '../commands';
import { IGameState } from '../game-state';

export const pickCommandsForTurn = ({ gameState }: { gameState: IGameState }): ICommand[] => {
  let maxUtility = -1;
  let chosenCommand: IWeightedCommand = { type: ECommand.UNKNOWN, utility: 0, parameters: {} };

  const commandsToChoseFrom: IWeightedCommand[] = [
    calculateTorpedoActionUtility({
      mySubmarine: gameState.players.me.real,
      opponentSubmarines: gameState.players.opponent.phantoms,
      gameMapDimensions: gameState.map.dimensions,
      terrainMap: gameState.map.terrain,
    }),
    calculateSurfaceActionUtility({
      mySubmarine: gameState.players.me.real,
      gameMapDimensions: gameState.map.dimensions,
      terrainMap: gameState.map.terrain,
    }),
    calculateMoveActionUtility({
      mySubmarine: gameState.players.me.real,
      opponentSubmarines: gameState.players.opponent.phantoms,
      gameMapDimensions: gameState.map.dimensions,
      terrainMap: gameState.map.terrain,
    }),
  ];

  for (let i = 0, iMax = commandsToChoseFrom.length; i < iMax; i++) {
    const { utility } = commandsToChoseFrom[i];

    if (maxUtility < utility) {
      maxUtility = utility;
      chosenCommand = commandsToChoseFrom[i];
    }
  }

  return [chosenCommand].map(({ type, parameters }) => {
    return { type, parameters };
  });
};
