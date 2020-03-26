import { PhantomSubmarine, Submarine } from '../../entities';
import { ICommand } from '../../command-interpreter';

export interface IWeightedCommand extends ICommand {
  utility: number;
}

class BaseAction {
  protected me: Submarine;
  protected opponent: PhantomSubmarine;

  constructor({ me, opponent }: { me: Submarine; opponent: PhantomSubmarine }) {
    this.me = me;
    this.opponent = opponent;
  }
}

export default BaseAction;
