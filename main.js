'use strict';

const board = [];
const rows = 8;
const columns = 8;
const minesCount = 10;
const minesLocation = [];
let tilesClicked = 0;
let flagEnabled = false;
let gameOver = false;

document.getElementById('flag-button').addEventListener('click', setFlag);
document.getElementById('flag-button').addEventListener('click', setFlag);

const random = size => (Math.floor(Math.random() * size));

const setMines = () => {
  let minesLeft = minesCount;
  while (minesLeft > 0) {
    const row = random(rows);
    const col = random(columns);
    const id = col + '-' + row;
    if (!minesLocation.includes(id)) {
      minesLocation.push(id);
      minesLeft -= 1;
    }
  }
};

const startGame = () => {
  setMines();
  for (let col = 0; col < columns; col++) {
    board[col] = [];
    for (let row = 0; row < rows; row++) {
      const tile = document.createElement('div');
      tile.id = col + '-' + row;
      tile.addEventListener('click', clickTile);
      document.getElementById('board').append(tile);
      board[col][row] = tile;
    }
  }
};

startGame();

function setFlag() {
  if (flagEnabled) {
    flagEnabled = false;
    document.getElementById('flag-button').style.backgroundColor = 'lightgray';
  } else {
    flagEnabled = true;
    document.getElementById('flag-button').style.backgroundColor = 'darkgray';
  }
}

function clickTile() {
  if (gameOver || this.classList.contains('tile-clicked')) {
    return;
  }

  const tile = this;
  if (flagEnabled) {
    if (tile.innerText === '') {
      tile.innerText = '🚩';
    } else if (tile.innerText === '🚩') {
      tile.innerText = '';
    }
    return;
  }

  if (minesLocation.includes(tile.id)) {
    gameOver = true;
    revealMines();
    return;
  }

  const coords = tile.id.split('-');
  const col = parseInt(coords[0]);
  const row = parseInt(coords[1]);
  checkMine(col, row);
}

function revealMines() {
  for (let col = 0; col < columns; col++) {
    for (let row = 0; row < rows; row++) {
      const tile = board[col][row];
      if (minesLocation.includes(tile.id)) {
        tile.innerText = '💣';
        tile.style.backgroundColor = 'red';
      }
    }
  }
}

const upper = 1;
const lower = -1;

function checkMine(col, row) {
  if (col < 0 || col >= columns || row < 0 || row >= rows) {
    return;
  }
  if (board[col][row].classList.contains('tile-clicked')) {
    return;
  }

  board[col][row].classList.add('tile-clicked');
  tilesClicked += 1;

  let minesFound = 0;
  for (let i = lower; i <= upper; i++) {
    for (let j = lower; j <= upper; j++) {
      if (i !== 0 || j !== 0) {
        minesFound += checkTile(col + i, row + j);
      }
    }
  }

  if (minesFound > 0) {
    board[col][row].innerText = minesFound;
    board[col][row].classList.add('text' + minesFound);
  } else {
    for (let i = lower; i <= upper; i++) {
      for (let j = lower; j <= upper; j++) {
        if (i !== 0 || j !== 0) {
          minesFound += checkMine(col + i, row + j);
        }
      }
    }
  }

  if (tilesClicked === rows * columns - minesCount) {
    document.getElementById('Win').innerText = 'You are the winner!';
    gameOver = true;
  }

}

function checkTile(col, row) {
  if (row < 0 || row >= rows || col < 0 || col >= columns) {
    return 0;
  }
  if (minesLocation.includes(col + '-' + row)) {
    return 1;
  }
  return 0;
}
