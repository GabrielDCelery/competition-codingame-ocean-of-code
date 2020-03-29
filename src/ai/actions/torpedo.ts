import BaseAction, { IWeightedCommand } from './base-action';
import { CHARGE_TORPEDO } from '../../constants';
import { ECommand, ECharge } from '../../commands';
import { calculateTorpedoDamageUtility } from '../utils';

export class TorpedoAction extends BaseAction {
  calculateUtility(): IWeightedCommand {
    if (this.gameState.players.me.real.charges[ECharge.TORPEDO] < CHARGE_TORPEDO) {
      return {
        type: ECommand.TORPEDO,
        utility: 0,
        parameters: {},
      };
    }

    const torpedoDamageUtility = calculateTorpedoDamageUtility({
      mySubmarine: this.gameState.players.me.real,
      opponentSubmarines: this.gameState.players.opponent.phantoms,
      gameMapDimensions: this.gameState.map.dimensions,
      terrainMap: this.gameState.map.terrain,
    });

    console.error({
      type: ECommand.TORPEDO,
      ...torpedoDamageUtility,
    });

    return {
      type: ECommand.TORPEDO,
      ...torpedoDamageUtility,
    };
  }
}

export default TorpedoAction;
