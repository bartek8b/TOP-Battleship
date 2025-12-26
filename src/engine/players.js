import { Gameboard } from './gameboard.js';
import { Ship } from './ship.js';
import { getRandomIntBetween } from './utils.js';

export class Player {
  constructor() {
    this.gameboard = new Gameboard();
  }

  randomShipsPlacement() {
    const isVertical = [false, true];

    for (let i = 4; i > 0; i--) {
      while (this.gameboard.shipsAvailable[i] > 0) {
        try {
          this.gameboard.placeShip(
            // Create new ship with randomly set orientation (index 0 or 1 of isVertical array) and coordinates (random from 0-9)
            new Ship(i, isVertical[getRandomIntBetween(0, 1)]),
            Math.floor(getRandomIntBetween(0, 9)),
            Math.floor(getRandomIntBetween(0, 9)),
          );
        } catch {
          // Failed placing ship, will retry
        }
      }
    }
  }
}

export class CPU extends Player {
  constructor() {
    super();
    // 'random' if prev shot inaccurate or 'target' if opposite
    this.mode = 'random';
    this.possibleMoves = [];
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        this.possibleMoves.push([row, col]);
      }
    }
  }

  // Helper if no ship hit
  randomAttack(enemyBoard) {
    if (this.possibleMoves.length === 0) {
      throw new Error('No moves left');
    }
    const idx = getRandomIntBetween(0, this.possibleMoves.length - 1);
    const [row, col] = this.possibleMoves.splice(idx, 1)[0];
    const shot = enemyBoard.receiveAttack(row, col);
    // Switch to target mode only if ship is hit but hasn't sunk yet
    if (shot instanceof Ship && !shot.isSunk()) this.mode = 'target';
  }

  // Helper for inteligent attack when ship hit
  targetAttack(enemyBoard) {}

  // Main attack method
  attack(enemyBoard) {
    if (this.mode === 'random') {
      return this.randomAttack(enemyBoard);
    } else {
      return this.targetAttack(enemyBoard);
    }
  }
}
