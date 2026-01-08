import { Ship } from './ship.js';

export class Gameboard {
  constructor() {
    this.reset();
  }

  // Reset | Init
  reset() {
    this.grid = Array.from({ length: 10 }, () => Array(10).fill(null));

    this.shipsAvailable = {
      // Length of ship: amount of ships in fleet
      4: 1,
      3: 2,
      2: 3,
      1: 4,
    };

    // List of ships placed on this board, used by allShipsSunk()
    this.fleet = [];

    // Ship positions and sunk cells for UI highlighting
    this.shipPositions = new Map(); // ship -> array<[row,col]>
    this.sunkCells = new Set(); // "row,col"
  }

  // Helper to check if given cell is empty or nonexistent (out of bounds)
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
    )
      throw new Error(
        `All the ships with length of ${ship.length} are already palced`,
      );

    // Check if provided arguments are in bounds
    if (row < 0 || row > 9) throw new Error('The row index is out of bounds');

    if (col < 0 || col > 9)
      throw new Error('The column index is out of bounds');

    const coords = [];

    // Check if horizontal ship isn't out of bounds / overlap other ship / touch other ship
    if (ship.vertical === false) {
      if (col + ship.length - 1 <= 9) {
        if (!this.canPlaceShip(ship, row, col)) {
          throw new Error('Ships cannot overlap or touch each other');
        }
        for (let i = 0; i < ship.length; i++) {
          this.grid[row][col + i] = ship;
          coords.push([row, col + i]);
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
          coords.push([row + i, col]);
        }
      } else {
        throw new Error('Cannot place ship out of bounds');
      }
    }

    // Decrement amount of available ships of certain type
    this.shipsAvailable[ship.length]--;

    // Push ship into fleet array
    this.fleet.push(ship);

    // Store ship coordinates for later highlighting
    this.shipPositions.set(ship, coords);
  }

  receiveAttack(row, col) {
    if (row < 0 || row > 9 || col < 0 || col > 9)
      throw new Error('Cannot shot out of bounds');

    if (
      this.grid[row][col] === 'hit' ||
      this.grid[row][col] === 'miss' ||
      this.grid[row][col] === 'sunk'
    )
      throw new Error('Cannot shot same cell twice');

    if (this.grid[row][col] instanceof Ship) {
      const ship = this.grid[row][col];
      ship.hit();
      this.grid[row][col] = 'hit';

      const sunk = ship.isSunk();
      if (sunk) {
        const positions = this.shipPositions.get(ship) || [];
        positions.forEach(([r, c]) => {
          this.grid[r][c] = 'sunk'; // oznacz całość w grid
          this.sunkCells.add(`${r},${c}`); // i zapamiętaj do renderu
        });
      }

      return sunk ? { result: 'sunk', ship } : { result: 'hit', ship };
    } else {
      this.grid[row][col] = 'miss';
      return { result: 'miss' };
    }
  }

  allShipsSunk() {
    return this.fleet.length > 0 && this.fleet.every((ship) => ship.isSunk());
  }
}
