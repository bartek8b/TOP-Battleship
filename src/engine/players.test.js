import { Ship } from './ship.js';
import { Player, CPU } from './players.js';

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

  test('randomAttack selects and removes move', () => {
    const cpu = new CPU();
    cpu.possibleMoves = [[5, 5]]; // Only one cell
    // Mock
    const enemyBoard = { receiveAttack: jest.fn() };

    cpu.randomAttack(enemyBoard);

    expect(enemyBoard.receiveAttack).toHaveBeenCalledWith(5, 5);
    expect(cpu.possibleMoves.length).toBe(0);
  });

  test('randomAttack switches to target on hit', () => {
    const cpu = new CPU();
    cpu.possibleMoves = [[0, 0]];
    const mockShip = new Ship(2);
    // Change return value of mockShip.isSunk()
    jest.spyOn(mockShip, 'isSunk').mockReturnValue(false);
    const enemyBoard = { receiveAttack: jest.fn(() => mockShip) };

    cpu.randomAttack(enemyBoard);

    expect(cpu.mode).toBe('target');
  });

  test('randomAttack does not switch to target if miss', () => {
    const cpu = new CPU();
    cpu.possibleMoves = [[1, 2]];
    const enemyBoard = { receiveAttack: jest.fn(() => null) };

    cpu.randomAttack(enemyBoard);

    expect(cpu.mode).toBe('random');
  });

  test('randomAttack does not switch to target if ship is sunk', () => {
    const cpu = new CPU();
    cpu.possibleMoves = [[3, 3]];
    const mockShip = { isSunk: () => true };
    const enemyBoard = { receiveAttack: jest.fn(() => mockShip) };

    cpu.randomAttack(enemyBoard);

    expect(cpu.mode).toBe('random');
  });

  test('randomAttack throws error when no moves left', () => {
    const cpu = new CPU();
    cpu.possibleMoves = [];
    const enemyBoard = {};
    expect(() => cpu.randomAttack(enemyBoard)).toThrow();
  });
});
