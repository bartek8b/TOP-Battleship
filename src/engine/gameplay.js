import { Player } from './players.js';
import { CPU } from './players.js';
import { getRandomIntBetween } from './utils.js';

export class Game {
  constructor() {
    this.player1 = new Player();
    this.cpu = new CPU();

    // Keep for rematch to be switched when rematch
    this.firstToMove =
      getRandomIntBetween(0, 1) === 0 ? this.player1 : this.cpu;

    this.onTheMove = this.firstToMove;
  }

  // Automated CPU attack
  cpuMove() {
    const shot = this.cpu.attack(this.player1.gameboard);
    if (this.player1.gameboard.allShipsSunk())
      return { gameResult: 'CPU wins!' };
    if (shot.ship) return this.cpuMove();
    else {
      this.onTheMove = this.player1;
      return shot;
    }
  }

  // Coordinates delivered by UI
  player1Move(row, col) {
    const shot = this.cpu.gameboard.receiveAttack(row, col);
    if (this.cpu.gameboard.allShipsSunk())
      return { gameResult: 'Player 1 wins!' };
    else {
      this.onTheMove = this.cpu;
      return shot;
    }
  }
}
