import { ICommand } from '../../commands';
import { IGameMap } from '../../maps';
import { ISubmarine } from '../../submarines';

export interface IWeightedCommand extends ICommand {
  utility: number;
}

export type TActionUtilityCalculator = ({
  gameMap,
  mySubmarine,
  myPhantomSubmarines,
  opponentSubmarines,
}: {
  gameMap: IGameMap;
  mySubmarine: ISubmarine;
  myPhantomSubmarines: ISubmarine[];
  opponentSubmarines: ISubmarine[];
}) => IWeightedCommand;
