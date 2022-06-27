'use strict';

const gameState = {
  board: [],
  rows: 8,
  columns: 8,
  minesCount: 10,
  minesLocation: [],
  tilesClicked: 0,
  gameOver: false,
  upper: 1,
  lower: -1,
  minesFound: 0
};

document.getElementById('mines-count').innerText = gameState.minesCount;

const random = size => (Math.floor(Math.random() * size));

const setMines = () => {
  let minesLeft = gameState.minesCount;
  while (minesLeft > 0) {
    const row = random(gameState.rows);
    const col = random(gameState.columns);
    const id = col + '-' + row;
    if (!gameState.minesLocation.includes(id)) {
      gameState.minesLocation.push(id);
      minesLeft -= 1;
    }
  }
};

const startGame = () => {
  setMines();
  for (let col = 0; col < gameState.columns; col++) {
    gameState.board[col] = [];
    for (let row = 0; row < gameState.rows; row++) {
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
      gameState.board[col][row] = tile;
    }
  }
};

startGame();

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
  for (let i = gameState.lower; i <= gameState.upper; i++) {
    for (let j = gameState.lower; j <= gameState.upper; j++) {
      if (i !== 0 || j !== 0) {
        gameState.minesFound += checkWhat(col + i, row + j);
      }
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
  
  if (gameState.board[col][row].classList.contains('tile-clicked')) {
    return;
  }

  gameState.board[col][row].classList.add('tile-clicked');
  gameState.tilesClicked += 1;

  gameState.minesFound = 0;
  check(col, row, checkTile);

  if (gameState.minesFound > 0) {
    gameState.board[col][row].innerText = gameState.minesFound;
    gameState.board[col][row].classList.add('text' + gameState.minesFound);
  } else {
    check(col, row, checkMine);
  }

  checkWin();
};

function clickTile() {
  if (gameState.gameOver || this.classList.contains('tile-clicked') || this.innerText === '🚩') {
    return;
  }

  if (gameState.minesLocation.includes(this.id)) {
    gameState.gameOver = true;
    revealMines();
    return;
  }

  const coords = this.id.split('-');
  const col = +coords[0];
  const row = +coords[1];
  checkMine(col, row);
}
