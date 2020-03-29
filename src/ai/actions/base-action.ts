import { ICommand } from '../../commands';

export interface IWeightedCommand extends ICommand {
  utility: number;
}
