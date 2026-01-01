import { Gameboard } from './gameboard.js';
import { Ship } from './ship.js';
import { getRandomIntBetween } from './utils.js';

export class Player {
  constructor(name = 'Player 1') {
    this.gameboard = new Gameboard();
    this.name = name;
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
    super('CPU');
    // 'random' if prev shot inaccurate or 'target' if opposite
    this.mode = 'random';

    this.possibleMoves = [];
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        this.possibleMoves.push([row, col]);
      }
    }

    // Queue for focused "target" moves: stores coordinates of first hit and candidate neighbors to try until the whole ship is sunk (used in targetAttack())
    this.movesStreak = [];

    this.candidateMoves = [];
  }

  // Helper to remove all adjacent cells of sunk ship
  removeAdjacentToSunkShip(ship, enemyBoard) {
    if (!ship) return;
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        if (enemyBoard.grid[r][c] === ship) {
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              // If in bounds of gameboard
              if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10) {
                // Delete form possibleMoves
                this.possibleMoves = this.possibleMoves.filter(
                  ([row, col]) => !(row === nr && col === nc),
                );
              }
            }
          }
        }
      }
    }
  }

  // Helper if no ship hit
  randomAttack(enemyBoard) {
    if (this.possibleMoves.length === 0) {
      throw new Error('No moves left');
    }

    // Keep trying until we find a cell that hasn't been attacked yet
    let idx;
    let row, col;
    let shot = null;

    while (this.possibleMoves.length > 0) {
      idx = getRandomIntBetween(0, this.possibleMoves.length - 1);
      [row, col] = this.possibleMoves.splice(idx, 1)[0];

      // If enemyBoard.grid exists, skip already attacked cells
      const cellVal = enemyBoard?.grid?.[row]?.[col];
      if (cellVal === 'hit' || cellVal === 'miss') {
        // Already attacked — skip and continue
        continue;
      }

      // Try attack; if it throws, skip and continue
      try {
        shot = enemyBoard.receiveAttack(row, col);
      } catch {
        // Try next move
        continue;
      }

      // Got a valid shot result
      break;
    }

    if (!shot) {
      // No valid moves left (all remaining were invalid)
      throw new Error('No moves left');
    }

    // Switch to target mode only if ship is hit but hasn't sunk yet
    if (shot?.result === 'hit') {
      this.mode = 'target';
      this.movesStreak.push([row, col]);
    }
    if (shot?.result === 'sunk') {
      this.removeAdjacentToSunkShip(shot.ship, enemyBoard);
    }
    return shot;
  }

  // Helper for inteligent attack when ship hit
  targetAttack(enemyBoard) {
    let shot = null;
    // In case we're not in target mode, fallback to random
    if (this.mode === 'random') return this.randomAttack(enemyBoard);

    if (this.movesStreak.length === 1) {
      this.candidateMoves = [];
      const [row, col] = this.movesStreak[0];

      // Remove diagonal neighbor positions from possibleMoves, as ships can't have segments there
      //Variations
      const impossiblePos = [
        [1, 1],
        [-1, 1],
        [-1, -1],
        [1, -1],
      ];
      // Deletion
      for (let [dr, dc] of impossiblePos) {
        const removeRow = row + dr;
        const removeCol = col + dc;
        const idx = this.possibleMoves.findIndex(
          ([r, c]) => r === removeRow && c === removeCol,
        );
        if (idx !== -1) {
          this.possibleMoves.splice(idx, 1);
        }
      }

      // Push into this.possibleMoves positions where ship's can be
      //Variations
      const possiblePos = [
        [1, 0],
        [0, 1],
        [-1, 0],
        [0, -1],
      ];

      // Insert
      for (let [dr, dc] of possiblePos) {
        const insertRow = row + dr;
        const insertCol = col + dc;
        const idx = this.possibleMoves.findIndex(
          ([r, c]) => r === insertRow && c === insertCol,
        );
        if (idx !== -1) {
          this.candidateMoves.push([insertRow, insertCol]);
        }
      }

      // Try candidateMoves until we find a valid (non-attacked) shot or run out
      if (this.candidateMoves.length > 0) {
        shot = null;
        while (this.candidateMoves.length > 0) {
          const idx = getRandomIntBetween(0, this.candidateMoves.length - 1);
          const [attackRow, attackCol] = this.candidateMoves.splice(idx, 1)[0];

          // skip if already attacked (defensive)
          if (
            enemyBoard?.grid?.[attackRow]?.[attackCol] === 'hit' ||
            enemyBoard?.grid?.[attackRow]?.[attackCol] === 'miss'
          ) {
            continue;
          }

          try {
            shot = enemyBoard.receiveAttack(attackRow, attackCol);
          } catch {
            shot = null;
            continue;
          }

          // valid shot found — handle results and exit loop
          if (shot?.result === 'hit') {
            this.movesStreak.push([attackRow, attackCol]);
          }
          if (shot?.result === 'sunk') {
            this.removeAdjacentToSunkShip(shot.ship, enemyBoard);
            this.movesStreak = [];
            this.mode = 'random';
          }
          break;
        }

        // If we didn't find any valid candidate shot, fallback to randomAttack
        if (!shot) {
          this.mode = 'random';
          this.movesStreak = [];
          return this.randomAttack(enemyBoard);
        }
      } else {
        // Fallback if no candidateMoves
        this.mode = 'random';
        this.movesStreak = [];
        return this.randomAttack(enemyBoard);
      }
    }

    if (this.movesStreak.length > 1) {
      // Determine the orientation of the streak
      const [r1] = this.movesStreak[0];
      const [r2] = this.movesStreak[1];
      const isVertical = r1 !== r2;

      // Find the ends of the streak and check only the adjacent cells at the ends
      let ends = [];
      if (isVertical) {
        this.movesStreak.sort(([rA], [rB]) => rA - rB);
        const head = this.movesStreak[0];
        const tail = this.movesStreak[this.movesStreak.length - 1];
        ends = [
          [head[0] - 1, head[1]],
          [tail[0] + 1, tail[1]],
        ];
      } else {
        this.movesStreak.sort(([, cA], [, cB]) => cA - cB);
        const head = this.movesStreak[0];
        const tail = this.movesStreak[this.movesStreak.length - 1];
        ends = [
          [head[0], head[1] - 1],
          [tail[0], tail[1] + 1],
        ];
      }
      // Check only the cells at the ends of the streak for possible moves
      this.candidateMoves = [];
      for (let [row, col] of ends) {
        const idx = this.possibleMoves.findIndex(
          ([r, c]) => r === row && c === col,
        );
        if (idx !== -1) {
          this.candidateMoves.push([row, col]);
        }
      }
      if (this.candidateMoves.length > 0) {
        // Try candidateMoves until we find a valid (non-attacked) shot or run out
        shot = null;
        while (this.candidateMoves.length > 0) {
          const idx = getRandomIntBetween(0, this.candidateMoves.length - 1);
          const [attackRow, attackCol] = this.candidateMoves.splice(idx, 1)[0];

          // skip if already attacked (defensive)
          if (
            enemyBoard?.grid?.[attackRow]?.[attackCol] === 'hit' ||
            enemyBoard?.grid?.[attackRow]?.[attackCol] === 'miss'
          ) {
            continue;
          }

          try {
            shot = enemyBoard.receiveAttack(attackRow, attackCol);
          } catch {
            shot = null;
            continue;
          }

          // valid shot found — handle results and exit loop
          if (shot?.result === 'hit') {
            this.movesStreak.push([attackRow, attackCol]);
          }
          if (shot?.result === 'sunk') {
            this.removeAdjacentToSunkShip(shot.ship, enemyBoard);
            this.movesStreak = [];
            this.mode = 'random';
          }
          break;
        }

        // If we didn't find any valid candidate shot, fallback to randomAttack
        if (!shot) {
          this.mode = 'random';
          this.movesStreak = [];
          return this.randomAttack(enemyBoard);
        }
      } else {
        // If there are no candidate moves at all, revert to random mode
        this.mode = 'random';
        this.movesStreak = [];
        return this.randomAttack(enemyBoard);
      }
    }
    return shot || this.randomAttack(enemyBoard);
  }

  // Main attack method
  attack(enemyBoard) {
    if (this.mode === 'random') return this.randomAttack(enemyBoard);
    else return this.targetAttack(enemyBoard);
  }
}
