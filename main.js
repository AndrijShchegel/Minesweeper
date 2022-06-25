'use strict';

const board = [];
const rows = 8;
const columns = 8;
const minesCount = 10;
const minesLocation = [];
let tilesClicked = 0;
let gameOver = false;

document.getElementById('mines-count').innerText = minesCount;

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
      tile.addEventListener('contextmenu', e => {
        e.preventDefault();
        if (tile.innerText === '') {
          tile.innerText = '🚩';
        } else if (tile.innerText === '🚩') {
          tile.innerText = '';
        }
      });
      document.getElementById('board').append(tile);
      board[col][row] = tile;
    }
  }
};

startGame();

const revealMines = () => {
  for (let col = 0; col < columns; col++) {
    for (let row = 0; row < rows; row++) {
      const tile = board[col][row];
      if (minesLocation.includes(tile.id)) {
        tile.innerText = '💣';
        tile.style.backgroundColor = 'red';
      }
    }
  }
};

const upper = 1;
const lower = -1;
let minesFound = 0;
const check = (col, row, checkWhat) => {
  for (let i = lower; i <= upper; i++) {
    for (let j = lower; j <= upper; j++) {
      if (i !== 0 || j !== 0) {
        minesFound += checkWhat(col + i, row + j);
      }
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

const checkMine = (col, row) => {
  if (col < 0 || col >= columns || row < 0 || row >= rows) {
    return;
  }
  if (board[col][row].classList.contains('tile-clicked')) {
    return;
  }

  board[col][row].classList.add('tile-clicked');
  tilesClicked += 1;

  minesFound = 0;
  check(col, row, checkTile);

  if (minesFound > 0) {
    board[col][row].innerText = minesFound;
    board[col][row].classList.add('text' + minesFound);
  } else {
    check(col, row, checkMine);
  }

  if (tilesClicked === rows * columns - minesCount) {
    document.getElementById('Win').innerText = 'You are the winner!';
    gameOver = true;
  }
};

function clickTile() {
  if (gameOver || this.classList.contains('tile-clicked')) {
    return;
  }

  if (minesLocation.includes(this.id)) {
    gameOver = true;
    revealMines();
    return;
  }

  const coords = this.id.split('-');
  const col = parseInt(coords[0]);
  const row = parseInt(coords[1]);
  checkMine(col, row);
}
