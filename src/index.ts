import { pickCommandsForTurn } from './ai';
import {
  createTerrainMap,
  getWalkableTerrainCells,
  setTerrainMapCell,
  transformGameInputToTerrain,
  initTorpedoReachabilityMatrix,
  initTorpedoReachabilityMapMatrix,
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

  gameState.map.dimensions = { width, height, sectorSize: 5 };
  gameState.map.terrain = createTerrainMap(gameState.map.dimensions);

  for (let y = 0; y < height; y++) {
    const line: string = readNextLine();
    const cells = [...line.split('')];
    for (let x = 0; x < width; x++) {
      const cell = cells[x];

      setTerrainMapCell({
        coordinates: { x, y },
        type: transformGameInputToTerrain(cell),
        terrainMap: gameState.map.terrain,
      });
    }
  }

  initTorpedoReachabilityMatrix(gameState.map);
  initTorpedoReachabilityMapMatrix(gameState.map);

  const walkableTerrainCells = getWalkableTerrainCells({
    gameMapDimensions: gameState.map.dimensions,
    terrainMap: gameState.map.terrain,
  });

  gameState.map.numOfWalkableTerrainCells = walkableTerrainCells.length;
  gameState.map.numOfSectors = 9;

  const mySubmarineStartingCoordinates =
    walkableTerrainCells[Math.floor(Math.random() * walkableTerrainCells.length)];

  gameState.players.me.real = createSubmarine({
    health: HEALTH_SUBMARINE,
    coordinates: mySubmarineStartingCoordinates,
    gameMapDimensions: gameState.map.dimensions,
  });
  gameState.players.me.phantoms = walkableTerrainCells.map(coordinates => {
    return createSubmarine({
      health: HEALTH_SUBMARINE,
      coordinates,
      gameMapDimensions: gameState.map.dimensions,
    });
  });
  gameState.players.opponent.phantoms = walkableTerrainCells.map(coordinates => {
    return createSubmarine({
      health: HEALTH_SUBMARINE,
      coordinates,
      gameMapDimensions: gameState.map.dimensions,
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
    gameState.players.opponent.phantoms = getSubmarinesFilteredByEnemyCommands({
      gameMap: gameState.map,
      ownMinHealth: opponentHealth,
      ownSubmarines: gameState.players.opponent.phantoms,
      enemyCommands: gameState.players.me.real.commands.last,
      enemySonarResult: sonarResultByMe,
    });
    gameState.players.opponent.phantoms = getSubmarinesFilteredByOwnCommands({
      gameMap: gameState.map,
      ownMinHealth: opponentHealth,
      ownSubmarines: gameState.players.opponent.phantoms,
      ownCommands: opponentCommands,
    });
    gameState.players.me.phantoms = getSubmarinesFilteredByEnemyCommands({
      gameMap: gameState.map,
      ownMinHealth: myHealth,
      ownSubmarines: gameState.players.me.phantoms,
      enemyCommands: opponentCommands,
      enemySonarResult: calculateSonarResult({
        entityCoordinates: gameState.players.me.real.coordinates,
        gameMapDimensions: gameState.map.dimensions,
        commands: opponentCommands,
      }),
    });
    gameState.players.me.phantoms = getSubmarinesFilteredByOwnCommands({
      gameMap: gameState.map,
      ownMinHealth: myHealth,
      ownSubmarines: gameState.players.me.phantoms,
      ownCommands: gameState.players.me.real.commands.last,
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
      gameMapDimensions: gameState.map.dimensions,
      submarine: gameState.players.me.real,
    });

    console.log(transformCommandsToCommandString(myCommands));
  }
} catch (error) {
  console.error(error);
}
