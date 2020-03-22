import PhantomSubmarineTracker from '../phantom-submarine-tracker';
import MySubmarine from '../my-submarine';
import { ECommand } from '../command-interpreter';

export interface IWeightedAction {
  type: ECommand;
  utility: number;
  parameters?: any;
}

class BaseAction {
  protected mySubmarine: MySubmarine;
  protected phantomSubmarineTracker: PhantomSubmarineTracker;

  constructor({
    mySubmarine,
    phantomSubmarineTracker,
  }: {
    mySubmarine: MySubmarine;
    phantomSubmarineTracker: PhantomSubmarineTracker;
  }) {
    this.mySubmarine = mySubmarine;
    this.phantomSubmarineTracker = phantomSubmarineTracker;
  }
}

export default BaseAction;
