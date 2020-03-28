import { MoveAction, SurfaceAction, TorpedoAction, IWeightedCommand } from './actions';
import { ECommand, ICommand } from '../commands';
import { IGameState } from '../game-state';

class AI {
  private torpedoAction: TorpedoAction;
  private surfaceAction: SurfaceAction;
  private moveAction: MoveAction;

  constructor({ gameState }: { gameState: IGameState }) {
    this.torpedoAction = new TorpedoAction({ gameState });
    this.surfaceAction = new SurfaceAction({ gameState });
    this.moveAction = new MoveAction({ gameState });
  }

  static createInstance({ gameState }: { gameState: IGameState }): AI {
    return new AI({ gameState });
  }

  pickCommands(): ICommand[] {
    let maxUtility = -1;
    let chosenCommand: IWeightedCommand = { type: ECommand.UNKNOWN, utility: 0, parameters: {} };

    const commandsToChoseFrom: IWeightedCommand[] = [
      this.torpedoAction.calculateUtility(),
      this.surfaceAction.calculateUtility(),
      this.moveAction.calculateUtility(),
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
  }
}

export default AI;
