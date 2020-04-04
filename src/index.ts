import { pickCommandsForTurn } from './ai';
import {
  getWalkableCoordinates,
  transformGameInputToTerrain,
  initTorpedoReachabilityMatrix,
  initTorpedoReachabilityMapMatrix,
  createBlankWalkabilityMatrix,
  ETerrain,
} from './maps';
import {
  ESonarResult,
  applyCommandsToSubmarine,
  calculateSonarResult,
  getSubmarinesFilteredByEnemyCommands,
  getSubmarinesFilteredByOwnCommands,
  transformCommandsStringToCommands,
  transformCommandsToCommandString,
} from './commands';
import { createBlankGameState } from './game-state';
import { createSubmarine, setNewSubmarineState } from './submarines';
import { HEALTH_SUBMARINE } from './constants';

declare const readline: any;

try {
  const readNextLine = (): string => {
    return readline();
  };

  const gameState = createBlankGameState();

  const [width, height /*, myId*/] = readNextLine()
    .split(' ')
    .map(elem => {
      return parseInt(elem, 10);
    });

  gameState.map.width = width;
  gameState.map.height = height;
  gameState.map.sectorSize = 5;
  gameState.map.walkabilityMatrix = createBlankWalkabilityMatrix(gameState.map);

  for (let y = 0; y < height; y++) {
    const line: string = readNextLine();
    const cells = [...line.split('')];
    for (let x = 0; x < width; x++) {
      const cell = cells[x];
      gameState.map.walkabilityMatrix[x][y] = transformGameInputToTerrain(cell) === ETerrain.WATER;
    }
  }

  initTorpedoReachabilityMatrix(gameState.map);
  initTorpedoReachabilityMapMatrix(gameState.map);

  const walkableTerrainCells = getWalkableCoordinates(gameState.map.walkabilityMatrix);

  gameState.map.numOfWalkableTerrainCells = walkableTerrainCells.length;
  gameState.map.numOfSectors = 9;

  const mySubmarineStartingCoordinates =
    walkableTerrainCells[Math.floor(Math.random() * walkableTerrainCells.length)];

  gameState.players.me.real = createSubmarine({
    health: HEALTH_SUBMARINE,
    coordinates: mySubmarineStartingCoordinates,
    gameMap: gameState.map,
  });
  gameState.players.me.phantoms = walkableTerrainCells.map(coordinates => {
    return createSubmarine({
      health: HEALTH_SUBMARINE,
      coordinates,
      gameMap: gameState.map,
    });
  });
  gameState.players.opponent.phantoms = walkableTerrainCells.map(coordinates => {
    return createSubmarine({
      health: HEALTH_SUBMARINE,
      coordinates,
      gameMap: gameState.map,
    });
  });

  console.log(`${mySubmarineStartingCoordinates.x} ${mySubmarineStartingCoordinates.y}`);

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

    const opponentCommands = transformCommandsStringToCommands(opponentCommandsString);

    const start = new Date().getTime();
    gameState.players.opponent.phantoms = getSubmarinesFilteredByEnemyCommands({
      gameMap: gameState.map,
      ownMinHealth: opponentHealth,
      ownSubmarines: gameState.players.opponent.phantoms,
      enemyCommands: gameState.players.me.real.lastCommands,
      enemySonarResult: sonarResultByMe,
    });
    console.error(start - new Date().getTime());
    gameState.players.opponent.phantoms = getSubmarinesFilteredByOwnCommands({
      gameMap: gameState.map,
      ownMinHealth: opponentHealth,
      ownSubmarines: gameState.players.opponent.phantoms,
      ownCommands: opponentCommands,
    });
    console.error(start - new Date().getTime());
    gameState.players.me.phantoms = getSubmarinesFilteredByEnemyCommands({
      gameMap: gameState.map,
      ownMinHealth: myHealth,
      ownSubmarines: gameState.players.me.phantoms,
      enemyCommands: opponentCommands,
      enemySonarResult: calculateSonarResult({
        entityCoordinates: gameState.players.me.real.coordinates,
        gameMap: gameState.map,
        commands: opponentCommands,
      }),
    });
    gameState.players.me.phantoms = getSubmarinesFilteredByOwnCommands({
      gameMap: gameState.map,
      ownMinHealth: myHealth,
      ownSubmarines: gameState.players.me.phantoms,
      ownCommands: gameState.players.me.real.lastCommands,
    });

    setNewSubmarineState({
      submarine: gameState.players.me.real,
      newState: {
        x,
        y,
        health: myHealth,
        torpedoCooldown,
        sonarCooldown,
        silenceCooldown,
        mineCooldown,
      },
    });

    const myCommands = pickCommandsForTurn({ gameState });

    applyCommandsToSubmarine({
      commands: myCommands,
      gameMap: gameState.map,
      submarine: gameState.players.me.real,
    });

    console.log(transformCommandsToCommandString(myCommands));
  }
} catch (error) {
  console.error(error);
}
