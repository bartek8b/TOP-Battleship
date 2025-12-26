import { Gameboard } from './gameboard.js';
import { Ship } from './ship.js';

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
            new Ship(i, isVertical[Math.round(Math.random())]),
            Math.floor(Math.random() * 10),
            Math.floor(Math.random() * 10),
          );
        } catch {
          // Failed placing ship, will retry
        }
      }
    }
  }
}
