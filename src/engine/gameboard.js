export class Gameboard {
  constructor() {
    this.grid = Array.from({ length: 10 }, () => Array(10).fill(null));
  }

  placeShip(ship, row, col) {
    // Check if provided arguments are in bounds
    if (row < 0 || row > 9) {
      throw new Error('The row index is out of bounds');
    }
    if (col < 0 || col > 9) {
      throw new Error('The column index is out of bounds');
    }

    // Check if horizontal ship isn't out of bounds
    if (ship.vertical === false) {
      if (col + ship.length - 1 <= 9) {
        for (let i = 0; i < ship.length; i++) {
          this.grid[row][col + i] = ship;
        }
      } else {
        throw new Error('Cannot place ship out of bounds');
      }
    }

    // Check if vertical ship isn't out of bounds
    if (ship.vertical === true) {
      if (row + ship.length - 1 <= 9) {
        for (let i = 0; i < ship.length; i++) {
          this.grid[row + i][col] = ship;
        }
      } else {
        throw new Error('Cannot place ship out of bounds');
      }
    }
  }
}
