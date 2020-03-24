import PhantomSubmarineTracker from './phantom-submarine-tracker';
import MySubmarine from './my-submarine';
import AI from './ai';
import commandInterpreter from './command-interpreter';
import { ETerrain, GameMapFactory } from './maps';

declare const readline: any;

const gameInputToCellTransformations: { [index: string]: ETerrain } = {
  '.': ETerrain.WATER,
  x: ETerrain.ISLAND,
};

try {
  const readNextLine = (): string => {
    return readline();
  };

  const [width, height, myId] = readNextLine()
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

  const phantomSubmarineTracker = PhantomSubmarineTracker.createInstance({
    gameMap: gameMapFactory.createGameMap(),
  });
  const mySubmarine = MySubmarine.createInstance({ gameMap: gameMapFactory.createGameMap() });
  const ai = AI.createInstance({ mySubmarine, phantomSubmarineTracker });

  const walkableCoordinates = mySubmarine.getGameMap().getWalkableCoordinatesList();
  const mySubmarineStartingAt =
    walkableCoordinates[Math.floor(Math.random() * walkableCoordinates.length)];

  console.log(`${mySubmarineStartingAt.x} ${mySubmarineStartingAt.y}`);

  // game loop
  while (true) {
    const [
      x,
      y,
      myLife,
      oppLife,
      torpedoCooldown,
      sonarCooldown,
      silenceCooldown,
      mineCooldown,
    ] = readNextLine()
      .split(' ')
      .map(elem => {
        return parseInt(elem, 10);
      });

    const sonarResult = readNextLine();
    const opponentCommandsString = readNextLine();
    const opponentCommands = commandInterpreter.transformCommandsStringToCommands(
      opponentCommandsString
    );

    phantomSubmarineTracker.setOpponentLife(oppLife).processCommandsForSubmarines(opponentCommands);
    mySubmarine.setState({
      x,
      y,
      myLife,
      torpedoCooldown,
      sonarCooldown,
      silenceCooldown,
      mineCooldown,
    });

    const commandsStr = commandInterpreter.transformCommandsToCommandString({
      commands: ai.pickCommands(),
      mySubmarine,
    });

    console.log(commandsStr);
  }
} catch (error) {
  console.error(error);
}
