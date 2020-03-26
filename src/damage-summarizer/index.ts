import {
  ICoordinates,
  uGetNeighbouringCellsIncludingDiagonal,
  uTransformCoordinatesToKey,
} from '../maps';
import { ECommand, ICommand, ITorpedoCommandParameters } from '../command-interpreter';
import { DAMAGE_TORPEDO } from '../constants';

export interface ICoordinatesDamageMap {
  [index: string]: number;
}
export interface IDamageSummarizerData {
  general: number;
  coordinatesMap: ICoordinatesDamageMap;
}

export class DamageSummarizer {
  private general: number;
  private coordinatesMap: ICoordinatesDamageMap;

  constructor() {
    this.general = 0;
    this.coordinatesMap = {};
  }

  static createInstance(): DamageSummarizer {
    return new DamageSummarizer();
  }

  getData(): IDamageSummarizerData {
    return {
      general: this.general,
      coordinatesMap: this.coordinatesMap,
    };
  }

  private appendDamageToCoordinatesMap({
    damage,
    coordinates,
  }: {
    damage: number;
    coordinates: ICoordinates;
  }): void {
    const locationKey = uTransformCoordinatesToKey(coordinates);

    if (this.coordinatesMap[locationKey] === undefined) {
      this.coordinatesMap[locationKey] = 0;
    }

    this.coordinatesMap[locationKey] += damage;
  }

  processSurfaceDamage(commands: ICommand[]): this {
    commands.forEach(command => {
      const { type } = command;

      if (type !== ECommand.SURFACE) {
        return;
      }

      this.general += 1;
    });

    return this;
  }

  processTorpedoDamage(commands: ICommand[]): this {
    commands.forEach(command => {
      const { type, parameters } = command;

      if (type !== ECommand.TORPEDO) {
        return;
      }

      const { coordinates } = parameters as ITorpedoCommandParameters;
      this.appendDamageToCoordinatesMap({ damage: DAMAGE_TORPEDO, coordinates });

      const neighbouringCoordinatesList = uGetNeighbouringCellsIncludingDiagonal(coordinates);

      neighbouringCoordinatesList.forEach(neighbouringCoordinates => {
        this.appendDamageToCoordinatesMap({
          damage: DAMAGE_TORPEDO / 2,
          coordinates: neighbouringCoordinates,
        });
      });
    });

    return this;
  }
}

export default DamageSummarizer;
