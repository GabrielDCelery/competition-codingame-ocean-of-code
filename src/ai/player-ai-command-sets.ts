import {
  calculateMineActionUtility,
  calculateMoveActionUtility,
  calculateSilenceActionUtility,
  calculateSurfaceActionUtility,
  calculateTorpedoActionUtility,
  calculateTriggerActionUtility,
} from './actions';
import { ECommand } from '../commands';

export const playerAiCommandSets = {
  v1: [
    {
      utilityActions: [
        { utilityCalculator: calculateSurfaceActionUtility, types: [ECommand.SURFACE] },
        {
          utilityCalculator: calculateMineActionUtility,
          types: [ECommand.MINE, ECommand.TRIGGER],
        },
        {
          utilityCalculator: calculateTriggerActionUtility,
          types: [ECommand.MINE, ECommand.TRIGGER],
        },
      ],
      minUtility: 0.2,
    },
    {
      utilityActions: [
        { utilityCalculator: calculateTorpedoActionUtility, types: [ECommand.TORPEDO] },
      ],
      minUtility: 0.4,
    },
    {
      utilityActions: [{ utilityCalculator: calculateMoveActionUtility, types: [ECommand.MOVE] }],
      minUtility: 0,
    },
    {
      utilityActions: [
        { utilityCalculator: calculateTorpedoActionUtility, types: [ECommand.TORPEDO] },
      ],
      minUtility: 0.4,
    },
    {
      utilityActions: [
        { utilityCalculator: calculateSurfaceActionUtility, types: [ECommand.SURFACE] },
        {
          utilityCalculator: calculateMineActionUtility,
          types: [ECommand.MINE, ECommand.TRIGGER],
        },
        {
          utilityCalculator: calculateTriggerActionUtility,
          types: [ECommand.MINE, ECommand.TRIGGER],
        },
      ],
      minUtility: 0.2,
    },
    {
      utilityActions: [
        { utilityCalculator: calculateSilenceActionUtility, types: [ECommand.SILENCE] },
      ],
      minUtility: 0.8,
    },
  ],
};
