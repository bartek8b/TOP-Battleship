export class Gameboard {
  constructor() {
    this.grid = Array.from({ length: 10 }, () => Array(10).fill(null));
  }

  placeShip(ship, row, col) {
    //Check if provided arguments are in bounds
    if (row < 0 || row > 9) {
      throw new Error('The row index is out of bounds');
    }
    if (col < 0 || col > 9) {
      throw new Error('The column index is out of bounds');
    }
  }
}
