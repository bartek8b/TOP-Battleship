import { Player } from './players.js';
import { CPU } from './players.js';
import { getRandomIntBetween } from './utils.js';

export class Game {
  constructor() {
    this.player1 = new Player();
    this.cpu = new CPU();

    // Track which player started last, for rematch switching
    this.wasPlayerFirst = getRandomIntBetween(0, 1) === 0;
    this.firstToMove = this.wasPlayerFirst ? this.player1 : this.cpu;
    this.onTheMove = this.firstToMove;
  }

  // Automated CPU attack
  cpuMove() {
    const shot = this.cpu.attack(this.player1.gameboard);
    if (this.player1.gameboard.allShipsSunk())
      return { gameResult: 'CPU wins!' };
    if (shot?.ship) return this.playRound();
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
    if (shot?.ship) return shot;
    else {
      this.onTheMove = this.cpu;
      return shot;
    }
  }

  playRound() {
    if (this.onTheMove === this.cpu)
      return setTimeout(() => this.cpuMove(), 500);
  }

  resetGame() {
    this.player1 = new Player();
    this.cpu = new CPU();

    // Switch starting player
    this.wasPlayerFirst = !this.wasPlayerFirst;
    this.firstToMove = this.wasPlayerFirst ? this.player1 : this.cpu;
    this.onTheMove = this.firstToMove;
  }
}
