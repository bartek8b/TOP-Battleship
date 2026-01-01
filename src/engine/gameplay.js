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

    // Internal cpu loop control
    this._cpuLoopRunning = false;
    this._cpuLoopTimer = null;
  }

  // Automated CPU attack
  cpuMove() {
    const shot = this.cpu.attack(this.player1.gameboard);
    if (this.player1.gameboard.allShipsSunk())
      return { gameResult: 'CPU wins!' };
    if (shot?.result === 'hit' || shot?.result === 'sunk') {
      this.onTheMove = this.cpu;
      return shot;
    } else {
      this.onTheMove = this.player1;
      return shot;
    }
  }

  // Coordinates delivered by UI
  player1Move(row, col) {
    const shot = this.cpu.gameboard.receiveAttack(row, col);
    if (this.cpu.gameboard.allShipsSunk())
      return { gameResult: 'Player 1 wins!' };
    if (shot?.result === 'hit' || shot?.result === 'sunk') {
      // player hit -> keep player's turn
      this.onTheMove = this.player1;
      return shot;
    } else {
      // miss -> CPU starts
      this.onTheMove = this.cpu;
      return shot;
    }
  }

  // Start CPU loop inside engine.
  // delay: ms between cpu moves
  // onIteration: optional callback(shot) executed after each cpuMove (useful for UI updates)
  startCpuLoop(delay = 500, onIteration = null) {
    if (this._cpuLoopRunning) return; // already running
    this._cpuLoopRunning = true;

    const loop = () => {
      // Stop if not CPU turn
      if (this.onTheMove !== this.cpu) {
        this._cpuLoopRunning = false;
        this._cpuLoopTimer = null;
        return;
      }

      const shot = this.cpuMove();

      // call UI update callback if provided
      if (typeof onIteration === 'function') {
        try {
          onIteration(shot);
        } catch {
          // swallow UI callback errors to not break game loop
          /* noop */
        }
      }

      // If still CPU turn (i.e. hit), schedule next iteration
      if (this.onTheMove === this.cpu) {
        this._cpuLoopTimer = setTimeout(loop, delay);
      } else {
        this._cpuLoopRunning = false;
        this._cpuLoopTimer = null;
      }
    };

    // run immediately
    loop();
  }

  // Stop CPU loop if running
  stopCpuLoop() {
    if (this._cpuLoopTimer) {
      clearTimeout(this._cpuLoopTimer);
      this._cpuLoopTimer = null;
    }
    this._cpuLoopRunning = false;
  }

  resetGame() {
    this.player1 = new Player();
    this.cpu = new CPU();

    // Switch starting player
    this.wasPlayerFirst = !this.wasPlayerFirst;
    this.firstToMove = this.wasPlayerFirst ? this.player1 : this.cpu;
    this.onTheMove = this.firstToMove;

    // Reset internal loop state
    this.stopCpuLoop();
  }
}
