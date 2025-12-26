import { Ship } from './ship.js';
import { Player } from './players.js';

describe('Player', () => {
  test('randomShipPlacement places all ships with no overlap', () => {
    const player = new Player();
    player.randomShipsPlacement();

    // Check sum of all ship's segments on gameboard
    const shipCounts = { 4: 0, 3: 0, 2: 0, 1: 0 };
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const cell = player.gameboard.grid[row][col];
        if (cell instanceof Ship) {
          shipCounts[cell.length]++;
        }
      }
    }

    // Divide by length: each ship occupies `length` segments, so total segments / length = number of ships
    expect(shipCounts[4] / 4).toEqual(1); // battleship
    expect(shipCounts[3] / 3).toEqual(2); // cruisers
    expect(shipCounts[2] / 2).toEqual(3); // destroyers
    expect(shipCounts[1] / 1).toEqual(4); // submarines
  });
});
