export class Gameboard {
  constructor() {
    this.grid = Array.from({ length: 10 }, () => Array(10).fill(null));
  }

  placeShip(length, row, col) {
    if (length < 1 || length > 4) {
      throw new Error('Ship length must be between 1 & 4');
    }
    if (row < 0 || row > 9) {
      throw new Error('The row index is out of bounds');
    }
    if (col < 0 || col > 9) {
      throw new Error('The column index is out of bounds');
    }
  }
}
