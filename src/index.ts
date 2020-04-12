import { pickCommandsForTurn } from './ai';
import {
  getWalkableCoordinates,
  transformGameInputToTerrain,
  initTorpedoReachabilityMatrix,
  initTorpedoReachabilityMapMatrix,
  createBlankWalkabilityMatrix,
  isTerrainWater,
} from './maps';
import {
  ESonarResult,
  applyCommandsToRealSubmarine,
  calculateSonarResult,
  getPhantomSubmarinesFilteredByEnemyCommands,
  getPhantomSubmarinesFilteredByOwnCommands,
  transformCommandsStringToCommands,
  transformCommandsToCommandString,
} from './commands';
import { createBlankGameStateTemplate } from './game-state';
import {
  createRealSubmarine,
  createPhantomSubmarine,
  applyNewStateToRealSubmarine,
} from './submarines';
import { HEALTH_SUBMARINE } from './constants';

declare const readline: any;

try {
  const readNextLine = (): string => {
    return readline();
  };

  const gameState = createBlankGameStateTemplate();

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
      gameState.map.walkabilityMatrix[x][y] = isTerrainWater(transformGameInputToTerrain(cell));
    }
  }

  initTorpedoReachabilityMatrix(gameState.map);
  initTorpedoReachabilityMapMatrix(gameState.map);

  const walkableTerrainCells = getWalkableCoordinates(gameState.map.walkabilityMatrix);

  gameState.map.cache.numOfWalkableTerrainCells = walkableTerrainCells.length;

  const mySubmarineStartingCoordinates =
    walkableTerrainCells[Math.floor(Math.random() * walkableTerrainCells.length)];

  gameState.players.me.real = createRealSubmarine({
    health: HEALTH_SUBMARINE,
    coordinates: mySubmarineStartingCoordinates,
    gameMap: gameState.map,
  });

  gameState.players.me.phantoms = walkableTerrainCells.map(coordinates => {
    return createPhantomSubmarine({
      health: HEALTH_SUBMARINE,
      coordinates,
      gameMap: gameState.map,
    });
  });

  gameState.players.opponent.phantoms = walkableTerrainCells.map(coordinates => {
    return createPhantomSubmarine({
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

    gameState.players.opponent.phantoms = getPhantomSubmarinesFilteredByEnemyCommands({
      enemyCommands: gameState.players.me.real.lastCommands,
      enemySonarResult: sonarResultByMe,
      gameMap: gameState.map,
      phantomSubmarineMinHealth: opponentHealth,
      phantomSubmarines: gameState.players.opponent.phantoms,
    });

    gameState.players.opponent.phantoms = getPhantomSubmarinesFilteredByOwnCommands({
      gameMap: gameState.map,
      ownCommands: opponentCommands,
      phantomSubmarineMinHealth: opponentHealth,
      phantomSubmarines: gameState.players.opponent.phantoms,
    });

    gameState.players.me.phantoms = getPhantomSubmarinesFilteredByOwnCommands({
      gameMap: gameState.map,
      ownCommands: gameState.players.me.real.lastCommands,
      phantomSubmarineMinHealth: myHealth,
      phantomSubmarines: gameState.players.me.phantoms,
    });

    gameState.players.me.phantoms = getPhantomSubmarinesFilteredByEnemyCommands({
      enemyCommands: opponentCommands,
      enemySonarResult: calculateSonarResult({
        entityCoordinates: gameState.players.me.real.coordinates,
        gameMap: gameState.map,
        commands: opponentCommands,
      }),
      gameMap: gameState.map,
      phantomSubmarineMinHealth: myHealth,
      phantomSubmarines: gameState.players.me.phantoms,
    });

    applyNewStateToRealSubmarine({
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

    applyCommandsToRealSubmarine({
      commands: myCommands,
      gameMap: gameState.map,
      submarine: gameState.players.me.real,
    });

    console.log(transformCommandsToCommandString(myCommands));
  }
} catch (error) {
  console.error(error);
}
