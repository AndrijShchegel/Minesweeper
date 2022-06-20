'use strict';

const board = [];
const rows = 8;
const columns = 8;
const minesCount = 10;
const minesLocation = [];

const startGame = () => {
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
