'use strict';

let gameBoard = [];
let rows = 8;
let columns = 8;
let minesCount = 10;
let minesLocation = [];
let tilesClicked = 0;
let gameOver = false;
let minesFound = 0;
let flagsLocation = [];
let firstClick = true;
let timeElapsed = 0;
let isPaused = true;
let timerInterval;

const timerElement = document.getElementById("timer");
const minesLeft = document.getElementById('mines-count');

const formatTime = (timeInSeconds) => {
  const minutes = Math.floor(timeInSeconds / 60).toString().padStart(2, "0");
  const seconds = (timeInSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const random = (size) => (Math.floor(Math.random() * size));

const updateTimerDisplay = () => {
  timerElement.textContent = formatTime(timeElapsed);
};

const toggleTimer = () => {
  if (isPaused) {
    isPaused = false;
    timerInterval = setInterval(() => {
      timeElapsed++;
      updateTimerDisplay();
    }, 1000);
  } else {
    isPaused = true;
    clearInterval(timerInterval);
  }
};

const resetTimer = () => {
  clearInterval(timerInterval);
  timeElapsed = 0;
  isPaused = true;
  updateTimerDisplay();
};

const rightClick = (event, tile) => {
  event.preventDefault();
  if (gameOver) {
    return
  } 
  if (tile.classList.contains('tile-clicked')) {
    return;
  }
  if (tile.innerText === '' && flagsLocation.length < minesCount) {
    tile.innerText = '🚩';
    flagsLocation.push(tile.id);
  } else if (tile.innerText === '🚩') {
    tile.innerText = '';
    flagsLocation = flagsLocation.filter(id => id !== tile.id);
  }
  minesLeft.innerText = minesCount - flagsLocation.length;
};

const setMines = (tileId) => {
  let minesLeft = minesCount;
  while (minesLeft > 0) {
    const row = random(rows);
    const col = random(columns);
    const id = col + '-' + row;
    if (!minesLocation.includes(id) && id !== tileId) {
      minesLocation.push(id);
      minesLeft -= 1;
    }
  }
};
const resetBoard = () => {
  gameBoard = [];
  minesLocation = [];
  flagsLocation = [];
  tilesClicked = 0;
  gameOver = false;
  firstClick = true; 
}
const startGame = () => {
  const board = document.getElementById('board');
  board.innerHTML = '';
  board.addEventListener("contextmenu", (event) => event.preventDefault());

  resetBoard();
  
  minesLeft.innerText = minesCount;
  for (let col = 0; col < columns; col++) {
    gameBoard[col] = [];
    for (let row = 0; row < rows; row++) {
      const tile = document.createElement('div');
      tile.id = col + '-' + row;
      tile.addEventListener('click', () => clickTile(tile));
      tile.addEventListener('contextmenu', (event) => rightClick(event, tile));
      tile.addEventListener("dblclick", () => dblclickTile(tile));
      board.append(tile);
      gameBoard[col][row] = tile;
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
  for (let col = 0; col < columns; col++) {
    for (let row = 0; row < rows; row++) {
      const tile = gameBoard[col][row];
      if (minesLocation.includes(tile.id)) {
        tile.innerText = '💣';
        tile.style.backgroundColor = 'red';
      }
    }
  }
};

const check = (col, row, checkWhat) => {
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      minesFound += checkWhat(col + i, row + j);
    }
  }
};

const checkTile = (col, row) => {
  if (row < 0 || row >= rows || col < 0 || col >= columns) {
    return 0;
  }
  if (minesLocation.includes(col + '-' + row)) {
    return 1;
  }
  return 0;
};

const checkFlag = (col, row) => {
  if (row < 0 || row >= rows || col < 0 || col >= columns) {
    return 0;
  }
  if (flagsLocation.includes(col + '-' + row)) {
    return 1;
  }
  return 0;
};

const checkWin = () => {
  if (tilesClicked === rows * columns - minesCount) {
    document.getElementById('Win').innerText = 'You are the winner!';
    gameOver = true;
    toggleTimer();
  }
};

const checkMine = (col, row) => {
  if (col < 0 || col >= columns || row < 0 || row >= rows) {
    return;
  }

  const tile = gameBoard[col][row];

  if (tile.classList.contains('tile-clicked') || tile.innerText === '🚩') {
    return;
  }

  tile.classList.add('tile-clicked');
  tilesClicked += 1;

  minesFound = 0;
  check(col, row, checkTile);

  if (minesFound > 0) {
    tile.innerText = minesFound;
    tile.classList.add('text' + minesFound);
  } else {
    check(col, row, checkMine);
  }

  checkWin();
};

const clickTile = (tile) => {
  if (firstClick) {
  setMines(tile.id);
  firstClick = false;
  toggleTimer();
  }
  if (gameOver || tile.classList.contains('tile-clicked') || tile.innerText === '🚩') {
    return;
  }

  if (minesLocation.includes(tile.id)) {
    gameOver = true;
    revealMines();
    toggleTimer();
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
  if (gameOver || tile.innerText === '🚩') {
    return;
  }

  if (minesLocation.includes(tile.id)) {
    gameOver = true;
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

  const boardWidth = rows * (tileSize + gapSize);
  const boardHeight = columns * (tileSize + gapSize);

  board.style.width = `${boardWidth}px`;
  board.style.height = `${boardHeight}px`;
};

const setDifficulty = (mode) => {
  if (mode == "Easy") {
    rows = 8;
    columns = 8;
    minesCount = 10;
  } else if (mode == "Normal") {
    rows = 16;
    columns = 16;
    minesCount = 40;
  } else if (mode == "Hard") {
    rows = 30;
    columns = 16;
    minesCount = 99;
  }
  updateBoardSize();
  startGame();
  resetTimer();
}
