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
    this.mode = 'random';
    this.lastHits = [];
  }

  // Helper if no ship hit
  randomAttack(enemyBoard) {
    let attackSuccess = false;
    while (!attackSuccess) {
      const row = getRandomIntBetween(0, 9);
      const col = getRandomIntBetween(0, 9);
      try {
        enemyBoard.receiveAttack(row, col);
        // Will not be executed when error is catched
        attackSuccess = true;
      } catch {
        // Repeat if attack taken cell
      }
    }
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
