import { IWeightedCommand, TActionUtilityCalculator } from './actions';
import { ECommand, applyCommandsToRealSubmarine } from '../commands';
import { cloneRealSubmarine, IPhantomSubmarine, IRealSubmarine } from '../submarines';
import { IGameMap } from '../maps';

export interface ICommandsSubSet {
  mySubmarine: IRealSubmarine;
  pickedCommands: IWeightedCommand[];
}

export const pickCommandsFromCommandSet = ({
  pickedCommands,
  mySubmarine,
  myPhantomSubmarines,
  opponentSubmarines,
  gameMap,
  utilityActions,
  minUtility,
}: {
  pickedCommands: IWeightedCommand[];
  mySubmarine: IRealSubmarine;
  myPhantomSubmarines: IPhantomSubmarine[];
  opponentSubmarines: IPhantomSubmarine[];
  gameMap: IGameMap;
  utilityActions: Array<{
    utilityCalculator: TActionUtilityCalculator;
    types: ECommand[];
  }>;
  minUtility: number;
}): ICommandsSubSet => {
  let highestUtility = minUtility;

  const alreadyPickedCommansMap: { [index: string]: boolean } = {};

  pickedCommands.forEach(({ type }) => {
    alreadyPickedCommansMap[type] = true;
  });

  const toCheckCommands: IWeightedCommand[] = [];

  utilityActions.forEach(({ utilityCalculator, types }) => {
    for (let i = 0, iMax = types.length; i < iMax; i++) {
      if (alreadyPickedCommansMap[types[i]]) {
        return;
      }
    }

    toCheckCommands.push(
      utilityCalculator({
        mySubmarine,
        myPhantomSubmarines,
        opponentSubmarines,
        gameMap,
      })
    );
  });

  const chosenCommands = toCheckCommands.filter(({ utility }) => {
    if (highestUtility < utility) {
      highestUtility = utility;
      return true;
    }

    return false;
  });

  if (chosenCommands.length === 0) {
    return { mySubmarine, pickedCommands };
  }

  const clonedSubmarine = cloneRealSubmarine(mySubmarine);

  applyCommandsToRealSubmarine({
    commands: chosenCommands,
    gameMap,
    submarine: clonedSubmarine,
  });

  return pickCommandsFromCommandSet({
    pickedCommands: [...pickedCommands, chosenCommands[0]],
    mySubmarine: clonedSubmarine,
    myPhantomSubmarines,
    opponentSubmarines,
    gameMap,
    utilityActions,
    minUtility,
  });
};
