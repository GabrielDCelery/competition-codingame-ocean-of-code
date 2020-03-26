import { Submarine, PhantomSubmarine } from '../entities';
import { MoveAction, SurfaceAction, TorpedoAction, IWeightedCommand } from './actions';
import { ECommand, ICommand } from '../command-interpreter';

class AI {
  private torpedoAction: TorpedoAction;
  private surfaceAction: SurfaceAction;
  private moveAction: MoveAction;

  constructor({ me, opponent }: { me: Submarine; opponent: PhantomSubmarine }) {
    this.torpedoAction = new TorpedoAction({ me, opponent });
    this.surfaceAction = new SurfaceAction({ me, opponent });
    this.moveAction = new MoveAction({ me, opponent });
  }

  static createInstance({ me, opponent }: { me: Submarine; opponent: PhantomSubmarine }): AI {
    return new AI({ me, opponent });
  }

  pickCommands(): ICommand[] {
    let maxUtility = -1;
    let chosenCommand: IWeightedCommand = { type: ECommand.NA, utility: 0, parameters: {} };

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
