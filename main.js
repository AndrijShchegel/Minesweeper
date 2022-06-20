'use strict';

const board = [];
const rows = 8;
const columns = 8;
const minesCount = 10;
const minesLocation = [];

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
