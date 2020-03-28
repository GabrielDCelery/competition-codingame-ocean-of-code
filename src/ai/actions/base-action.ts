import { ICommand } from '../../commands';
import { IGameState } from '../../game-state';

export interface IWeightedCommand extends ICommand {
  utility: number;
}

class BaseAction {
  protected gameState: IGameState;

  constructor({ gameState }: { gameState: IGameState }) {
    this.gameState = gameState;
  }
}

export default BaseAction;
