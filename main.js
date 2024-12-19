'use strict';

const gameState = {
  board: [],
  rows: 8,
  columns: 8,
  minesCount: 10,
  minesLocation: [],
  tilesClicked: 0,
  gameOver: false,
  minesFound: 0,
  flagsLocation: [],
  firstClick: true,
};

const random = (size) => (Math.floor(Math.random() * size));

const rightClick = (event, tile) => {
  event.preventDefault();
  if (gameState.gameOver) {
    return
  } else if (tile.innerText === '' && gameState.flagsLocation.length < gameState.minesCount) {
    tile.innerText = '🚩';
    gameState.flagsLocation.push(tile.id);
  } else if (tile.innerText === '🚩') {
    tile.innerText = '';
    gameState.flagsLocation = gameState.flagsLocation.filter(id => id !== tile.id);
  }
  document.getElementById('mines-count').innerText = gameState.minesCount - gameState.flagsLocation.length;
};

const setMines = (tileId) => {
  let minesLeft = gameState.minesCount;
  while (minesLeft > 0) {
    const row = random(gameState.rows);
    const col = random(gameState.columns);
    const id = col + '-' + row;
    if (!gameState.minesLocation.includes(id) && id !== tileId) {
      gameState.minesLocation.push(id);
      minesLeft -= 1;
    }
  }
};
const resetBoard = () => {
  gameState.board = [];
  gameState.minesLocation = [];
  gameState.flagsLocation = [];
  gameState.tilesClicked = 0;
  gameState.gameOver = false;
  gameState.firstClick = true; 
}
const startGame = () => {
  const board = document.getElementById('board');
  board.innerHTML = '';
  board.addEventListener("contextmenu", (event) => event.preventDefault());

  resetBoard();
  
  document.getElementById('mines-count').innerText = gameState.minesCount;
  for (let col = 0; col < gameState.columns; col++) {
    gameState.board[col] = [];
    for (let row = 0; row < gameState.rows; row++) {
      const tile = document.createElement('div');
      tile.id = col + '-' + row;
      tile.addEventListener('click', () => clickTile(tile));
      tile.addEventListener('contextmenu', (event) => rightClick(event, tile));
      tile.addEventListener("dblclick", () => dblclickTile(tile));
      board.append(tile);
      gameState.board[col][row] = tile;
    }
  }
};
const setupDifficultyButtons = () => {
  const difficultyContainer = document.getElementById('difficulty');
  const difficulties = ['Easy', 'Normal', 'Hard'];

  difficulties.forEach((mode) => {
    const button = document.createElement('button');
    button.innerText = mode;
    button.addEventListener('click', () => {
      setDifficulty(mode); // Adjust game state
      startGame();         // Restart game with new mode
    });
    difficultyContainer.appendChild(button);
  });
};

setupDifficultyButtons();
document.addEventListener('DOMContentLoaded', startGame);

const revealMines = () => {
  for (let col = 0; col < gameState.columns; col++) {
    for (let row = 0; row < gameState.rows; row++) {
      const tile = gameState.board[col][row];
      if (gameState.minesLocation.includes(tile.id)) {
        tile.innerText = '💣';
        tile.style.backgroundColor = 'red';
      }
    }
  }
};

const check = (col, row, checkWhat) => {
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      gameState.minesFound += checkWhat(col + i, row + j);
    }
  }
};

const checkTile = (col, row) => {
  if (row < 0 || row >= gameState.rows || col < 0 || col >= gameState.columns) {
    return 0;
  }
  if (gameState.minesLocation.includes(col + '-' + row)) {
    return 1;
  }
  return 0;
};

const checkFlag = (col, row) => {
  if (row < 0 || row >= gameState.rows || col < 0 || col >= gameState.columns) {
    return 0;
  }
  if (gameState.flagsLocation.includes(col + '-' + row)) {
    return 1;
  }
  return 0;
};

const checkWin = () => {
  if (gameState.tilesClicked === gameState.rows * gameState.columns - gameState.minesCount) {
    document.getElementById('Win').innerText = 'You are the winner!';
    gameState.gameOver = true;
  }
};

const checkMine = (col, row) => {
  if (col < 0 || col >= gameState.columns || row < 0 || row >= gameState.rows) {
    return;
  }

  const tile = gameState.board[col][row];

  if (tile.classList.contains('tile-clicked') || tile.innerText === '🚩') {
    return;
  }

  tile.classList.add('tile-clicked');
  gameState.tilesClicked += 1;

  gameState.minesFound = 0;
  check(col, row, checkTile);

  if (gameState.minesFound > 0) {
    tile.innerText = gameState.minesFound;
    tile.classList.add('text' + gameState.minesFound);
  } else {
    check(col, row, checkMine);
  }

  checkWin();
};

const clickTile = (tile) => {
  if (gameState.firstClick) {
  setMines(tile.id);
  gameState.firstClick = false;
  }
  if (gameState.gameOver || tile.classList.contains('tile-clicked') || tile.innerText === '🚩') {
    return;
  }

  if (gameState.minesLocation.includes(tile.id)) {
    gameState.gameOver = true;
    revealMines();
    return;
  }
  const coords = tile.id.split('-');
  const col = +coords[0];
  const row = +coords[1];
  checkMine(col, row);
}

const getNeighbourFlags = (col, row) => {
  let flagsFound = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      flagsFound += checkFlag(col + i, row + j);
    }
  }
  return flagsFound;
}

const revealKnown = (col, row) => {
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const tile = document.getElementById(`${col+i}-${row+j}`);
      if (tile && tile.innerText !== '🚩') {
        clickTile(tile);
      }
    }
  }
}

const dblclickTile = (tile) => {
  if (gameState.gameOver || tile.innerText === '🚩') {
    return;
  }

  if (gameState.minesLocation.includes(tile.id)) {
    gameState.gameOver = true;
    revealMines();
    return;
  }
  const coords = tile.id.split('-');
  const col = +coords[0];
  const row = +coords[1];
  const flagsSpotted = getNeighbourFlags(col, row);
  if (tile.innerText == flagsSpotted) {
    revealKnown(col, row);
  }
}
const updateBoardSize = () => {
  const board = document.getElementById('board');
  const tileSize = 30; // Width and height of each tile in pixels
  const gapSize = 2;   // Gap size between tiles in pixels

  const boardWidth = gameState.rows * (tileSize + gapSize);
  const boardHeight = gameState.columns * (tileSize + gapSize);

  board.style.width = `${boardWidth}px`;
  board.style.height = `${boardHeight}px`;
};

const setDifficulty = (mode) => {
  if (mode == "Easy") {
    gameState.rows = 8;
    gameState.columns = 8;
    gameState.minesCount = 10;
  } else if (mode == "Normal") {
    gameState.rows = 16;
    gameState.columns = 16;
    gameState.minesCount = 40;
  } else if (mode == "Hard") {
    gameState.rows = 30;
    gameState.columns = 16;
    gameState.minesCount = 99;
  }
  updateBoardSize();
  startGame();
}
