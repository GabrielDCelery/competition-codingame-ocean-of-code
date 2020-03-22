import PhantomSubmarineTracker from './phantom-submarine-tracker';
import MySubmarine from './my-submarine';
import { MoveAction, SurfaceAction, TorpedoAction, IWeightedAction } from './actions';
import { ECommand } from './command-interpreter';

class AI {
  private torpedoAction: TorpedoAction;
  private surfaceAction: SurfaceAction;
  private moveAction: MoveAction;

  constructor({
    mySubmarine,
    phantomSubmarineTracker,
  }: {
    mySubmarine: MySubmarine;
    phantomSubmarineTracker: PhantomSubmarineTracker;
  }) {
    this.torpedoAction = new TorpedoAction({ mySubmarine, phantomSubmarineTracker });
    this.surfaceAction = new SurfaceAction({ mySubmarine, phantomSubmarineTracker });
    this.moveAction = new MoveAction({ mySubmarine, phantomSubmarineTracker });
  }

  static createInstance({
    mySubmarine,
    phantomSubmarineTracker,
  }: {
    mySubmarine: MySubmarine;
    phantomSubmarineTracker: PhantomSubmarineTracker;
  }): AI {
    return new AI({ mySubmarine, phantomSubmarineTracker });
  }

  pickCommands(): IWeightedAction[] {
    let maxUtility = -1;
    let chosenAction = { type: ECommand.NA, utility: 0 };

    const actionsToChoseFrom: IWeightedAction[] = [
      this.torpedoAction.calculateUtility(),
      this.surfaceAction.calculateUtility(),
      this.moveAction.calculateUtility(),
    ];

    for (let i = 0, iMax = actionsToChoseFrom.length; i < iMax; i++) {
      const { utility } = actionsToChoseFrom[i];

      if (maxUtility < utility) {
        maxUtility = utility;
        chosenAction = actionsToChoseFrom[i];
      }
    }

    return [chosenAction];
  }
}

export default AI;
