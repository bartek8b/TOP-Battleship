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
    return this.cpu.attack(this.player1.gameboard);
  }

  // Coordinates delivered by UI
  player1Move(row, col) {
    return this.cpu.gameboard.receiveAttack(row, col);
  }
}
