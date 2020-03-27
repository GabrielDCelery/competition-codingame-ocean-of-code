import AI from './ai';
import { ETerrain, GameMapFactory } from './maps';
import { PhantomSubmarine, Submarine } from './entities';
import {
  ESonarResult,
  uTransformCommandsStringToCommands,
  uTransformCommandsToCommandString,
  uGetSonaredSectorFromCommands,
  uGetSonarResultFromSectors,
} from './command-interpreter';
import { DamageSummarizer } from './damage-summarizer';

declare const readline: any;

const gameInputToCellTransformations: { [index: string]: ETerrain } = {
  '.': ETerrain.WATER,
  x: ETerrain.ISLAND,
};

try {
  const readNextLine = (): string => {
    return readline();
  };

  const [width, height /*, myId*/] = readNextLine()
    .split(' ')
    .map(elem => {
      return parseInt(elem, 10);
    });

  const gameMapFactory = GameMapFactory.createSingleton({ width, height, sectorSize: 5 });

  for (let y = 0; y < height; y++) {
    const line: string = readNextLine();
    const cells = [...line.split('')];

    for (let x = 0; x < width; x++) {
      const cell = cells[x];
      gameMapFactory.setTerrainCell({
        type: gameInputToCellTransformations[cell],
        coordinates: { x, y },
      });
    }
  }
  const me = Submarine.createInstance();
  const mePhantom = PhantomSubmarine.createInstance();
  const opponent = PhantomSubmarine.createInstance();
  const ai = AI.createInstance({ me, opponent });

  const walkableCoordinates = me.getGameMap().getWalkableCoordinatesList();
  const mySubmarineStartingAt =
    walkableCoordinates[Math.floor(Math.random() * walkableCoordinates.length)];

  console.log(`${mySubmarineStartingAt.x} ${mySubmarineStartingAt.y}`);

  // game loop
  while (true) {
    const [
      x,
      y,
      myHealth,
      opponentHealth,
      torpedoCooldown,
      sonarCooldown,
      silenceCooldown,
      mineCooldown,
    ] = readNextLine()
      .split(' ')
      .map(elem => {
        return parseInt(elem, 10);
      });
    const sonarResultByMe = readNextLine() as ESonarResult;
    const opponentCommandsString = readNextLine();

    me.setState({
      x,
      y,
      health: myHealth,
      torpedoCooldown,
      sonarCooldown,
      silenceCooldown,
      mineCooldown,
    });

    const opponentCommands = uTransformCommandsStringToCommands(opponentCommandsString);

    const sonaredSectorByMe = uGetSonaredSectorFromCommands(me.getExecutedCommands());
    opponent.processEnemySonarAction({ result: sonarResultByMe, sector: sonaredSectorByMe });
    const opponentDamageSummarizer = DamageSummarizer.createInstance();
    opponentDamageSummarizer.processTorpedoDamage(me.getExecutedCommands());
    opponentDamageSummarizer
      .processSurfaceDamage(opponentCommands)
      .processTorpedoDamage(opponentCommands);
    opponent.processDamageForTurn({
      damageSummarizerData: opponentDamageSummarizer.getData(),
      newHealth: opponentHealth,
    });
    opponent.processPhantomCommands(opponentCommands);

    const commandsToExecute = ai.pickCommands();
    me.processCommands(commandsToExecute);

    const sonaredSectorByOpponent = uGetSonaredSectorFromCommands(opponentCommands);
    const sonarResultByOpponent = uGetSonarResultFromSectors({
      entitySector: me.getGameMap().getSectorForCoordinates(me.getPosition()),
      targetedSector: sonaredSectorByOpponent,
    });
    mePhantom.processEnemySonarAction({
      result: sonarResultByOpponent,
      sector: sonaredSectorByOpponent,
    });
    const meDamageSummarizer = DamageSummarizer.createInstance();
    meDamageSummarizer.processTorpedoDamage(opponentCommands);
    meDamageSummarizer
      .processSurfaceDamage(me.getExecutedCommands())
      .processTorpedoDamage(me.getExecutedCommands());

    mePhantom.processDamageForTurn({
      damageSummarizerData: meDamageSummarizer.getData(),
      newHealth: myHealth,
    });
    mePhantom.processPhantomCommands(me.getExecutedCommands());

    const commandsToExecuteStr = uTransformCommandsToCommandString(commandsToExecute);

    console.log(commandsToExecuteStr);
  }
} catch (error) {
  console.error(error);
}
