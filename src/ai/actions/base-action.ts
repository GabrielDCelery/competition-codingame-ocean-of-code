import { ICommand } from '../../commands';
import { IGameMap } from '../../maps';
import { ISubmarine } from '../../submarines';

export interface IWeightedCommand extends ICommand {
  utility: number;
}

export type TActionUtilityCalculator = ({
  gameMap,
  mySubmarine,
  opponentSubmarines,
}: {
  gameMap: IGameMap;
  mySubmarine: ISubmarine;
  opponentSubmarines: ISubmarine[];
}) => IWeightedCommand;
