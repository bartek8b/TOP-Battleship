export class Gameboard {
  constructor() {
    this.grid = Array.from({ length: 10 }, () => Array(10).fill(null));

    this.shipsAvailable = {
      // Legnth of ship: amount of ships in fleet
      4: 1,
      3: 2,
      2: 3,
      1: 4,
    };
  }

  // Helper to check if neighbour cell is null or if even exists (is out of bounds)
  isEmptyOrNull(row, col) {
    if (row < 0 || row > 9 || col < 0 || col > 9) return true; // out of bounds = OK, ship can be placed on bound
    return this.grid[row][col] === null;
  }

  // Helper to check if position is taken by other ship or if any neighbour cell is taken by other ship
  canPlaceShip(ship, row, col) {
    for (let i = 0; i < ship.length; i++) {
      // Segment position
      let r = ship.vertical ? row + i : row;
      let c = ship.vertical ? col : col + i;

      // Check cell and neighbours
      // dr = delta row, dc = delta cell
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (!this.isEmptyOrNull(r + dr, c + dc)) {
            return false;
          }
        }
      }
    }
    return true;
  }

  placeShip(ship, row, col) {
    // Check if player went out of ships of certain type
    if (
      !this.shipsAvailable[ship.length] ||
      this.shipsAvailable[ship.length] === 0
    ) {
      throw new Error(
        `All the ships with length of ${ship.length} are already palced`,
      );
    }

    // Check if provided arguments are in bounds
    if (row < 0 || row > 9) {
      throw new Error('The row index is out of bounds');
    }
    if (col < 0 || col > 9) {
      throw new Error('The column index is out of bounds');
    }

    // Check if horizontal ship isn't out of bounds / overlap other ship / touch other ship
    if (ship.vertical === false) {
      if (col + ship.length - 1 <= 9) {
        if (!this.canPlaceShip(ship, row, col)) {
          throw new Error('Ships cannot overlap or touch each other');
        }
        for (let i = 0; i < ship.length; i++) {
          this.grid[row][col + i] = ship;
        }
      } else {
        throw new Error('Cannot place ship out of bounds');
      }
    }

    // Check if vertical ship isn't out of bounds / overlap other ship / touch other ship
    if (ship.vertical === true) {
      if (row + ship.length - 1 <= 9) {
        if (!this.canPlaceShip(ship, row, col)) {
          throw new Error('Ships cannot overlap or touch each other');
        }
        for (let i = 0; i < ship.length; i++) {
          this.grid[row + i][col] = ship;
        }
      } else {
        throw new Error('Cannot place ship out of bounds');
      }
    }
    // Decrement amount of available ships of certain type
    this.shipsAvailable[ship.length]--;
  }
}
