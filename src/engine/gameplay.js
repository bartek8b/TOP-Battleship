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

    // Game-over flag
    this.gameOver = false;

    // Internal cpu loop control
    this._cpuLoopRunning = false;
    this._cpuLoopTimer = null;
  }

  // Automated CPU attack
  cpuMove() {
    // If player's fleet is already sunk, return immediate game result (avoid calling cpu.attack)
    if (this.player1.gameboard.allShipsSunk()) {
      this.gameOver = true;
      this.onTheMove = null;
      // ensure CPU loop will stop
      return { gameResult: 'CPU wins!' };
    }

    // Perform one CPU attack (may throw) — protect with try/catch
    let shot;
    try {
      shot = this.cpu.attack(this.player1.gameboard);
    } catch (e) {
      // Stop cpu loop on unexpected engine error and return error object
      this._cpuLoopRunning = false;
      if (this._cpuLoopTimer) {
        clearTimeout(this._cpuLoopTimer);
        this._cpuLoopTimer = null;
      }
      // mark game as over to block further clicks
      this.gameOver = true;
      this.onTheMove = null;
      return { error: e?.message || String(e) };
    }

    // If attack finished the player's fleet, return game result
    if (this.player1.gameboard.allShipsSunk()) {
      this.gameOver = true;
      this.onTheMove = null;
      return { gameResult: 'CPU wins!' };
    }

    // Normal flow: set onTheMove according to shot result
    if (shot?.result === 'hit' || shot?.result === 'sunk') {
      this.onTheMove = this.cpu;
      return shot;
    } else if (shot?.result === 'miss') {
      this.onTheMove = this.player1;
      return shot;
    }

    // shot could be undefined (skipped) — do not change onTheMove
    return shot;
  }

  // Coordinates delivered by UI
  player1Move(row, col) {
    // If game is over, do not accept moves
    if (this.gameOver) return { error: 'Game is over' };

    const shot = this.cpu.gameboard.receiveAttack(row, col);

    // If player's shot finished the CPU fleet
    if (this.cpu.gameboard.allShipsSunk()) {
      this.gameOver = true;
      this.onTheMove = null;
      return { gameResult: 'Player 1 wins!' };
    }

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
  startCpuLoop(delay = 50, onIteration = null) {
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
          /* noop */
        }
      }

      // If game result or error occurred, stop the loop
      if (shot?.gameResult || shot?.error) {
        this._cpuLoopRunning = false;
        if (this._cpuLoopTimer) {
          clearTimeout(this._cpuLoopTimer);
          this._cpuLoopTimer = null;
        }
        return;
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

    // Reset game over flag
    this.gameOver = false;

    // Reset internal loop state
    this.stopCpuLoop();
  }
}
