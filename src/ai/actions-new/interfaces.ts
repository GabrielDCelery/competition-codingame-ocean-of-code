import { ICommand } from '../../commands';
import { IGameMap } from '../../maps';
import { IRealSubmarine, IPhantomSubmarine } from '../../submarines';

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
  mySubmarine: IRealSubmarine;
  myPhantomSubmarines: IPhantomSubmarine[];
  opponentSubmarines: IPhantomSubmarine[];
}) => IWeightedCommand;
