import GameMap from './game-map';
import PhantomSubmarineTracker from './phantom-submarine-tracker';
import MySubmarine from './my-submarine';
import AI from './ai';
import commandInterpreter from './command-interpreter';

declare const readline: any;

try {
  const readNextLine = (): string => {
    return readline();
  };

  const [width, height, myId] = readNextLine()
    .split(' ')
    .map(elem => {
      return parseInt(elem, 10);
    });

  const gameMap = GameMap.createInstance({ width, height, sectorSize: 5 });
  const phantomSubmarineTracker = PhantomSubmarineTracker.createInstance({ gameMap });
  const mySubmarine = MySubmarine.createInstance({ gameMap });
  const ai = AI.createInstance({ mySubmarine, phantomSubmarineTracker });

  for (let y = 0; y < height; y++) {
    const line: string = readNextLine();
    const cells = [...line.split('')];

    for (let x = 0; x < width; x++) {
      const cell = cells[x];
      gameMap.setCellTerrain({
        terrain: GameMap.transformGameInputToTerrain(cell),
        coordinates: { x, y },
      });
    }
  }

  const walkableCoordinates = gameMap.getWalkableCoordinates();
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
