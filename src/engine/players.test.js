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

  test('removeAdjacentToSunkShip removes neighbors for horizontal ship (CPU)', () => {
    const cpu = new CPU();

    // Mock a board with 2-mast horizontal ship at (0,0)-(0,1)
    const enemyBoard = {
      grid: Array.from({ length: 10 }, () => Array(10).fill(null)),
    };
    const ship = new Ship(2, false);
    enemyBoard.grid[0][0] = ship;
    enemyBoard.grid[0][1] = ship;

    // Place all possible moves
    cpu.possibleMoves = [];
    for (let r = 0; r < 10; r++)
      for (let c = 0; c < 10; c++) cpu.possibleMoves.push([r, c]);

    cpu.removeAdjacentToSunkShip(ship, enemyBoard);

    // Check that all cells adjacent to both segments are removed (including diagonals and itself)
    const forbidden = [
      [0, 0],
      [0, 1],
      [0, 2], // row 0
      [1, 0],
      [1, 1],
      [1, 2], // row 1
    ];
    forbidden.forEach(([row, col]) => {
      expect(cpu.possibleMoves.some(([r, c]) => r === row && c === col)).toBe(
        false,
      );
    });

    // Ensure a distant cell remains
    expect(cpu.possibleMoves.some(([r, c]) => r === 5 && c === 5)).toBe(true);
  });

  test('CPU attack visits only available moves and never repeats', () => {
    const cpu = new CPU();
    const enemyBoard = { receiveAttack: jest.fn(() => null) };
    const allMoves = [];
    for (let r = 0; r < 10; r++)
      for (let c = 0; c < 10; c++) allMoves.push([r, c]);
    cpu.possibleMoves = [...allMoves];

    const attacked = [];
    for (let i = 0; i < 100; i++) {
      cpu.attack(enemyBoard);
      attacked.push([...cpu.possibleMoves]);
    }

    // Should be zero moves left (all attacked exactly once)
    expect(cpu.possibleMoves.length).toBe(0);
  });

  test('targetAttack (streak > 1) attacks only ship ends', () => {
    const cpu = new CPU();
    // Vertical ship streak at [(3,2), (4,2)]
    cpu.mode = 'target';
    cpu.movesStreak = [
      [3, 2],
      [4, 2],
    ];
    cpu.possibleMoves = [
      [2, 2], // one end
      [3, 2],
      [4, 2],
      [5, 2], // other end
      [7, 7],
    ];
    const enemyBoard = {
      receiveAttack: jest.fn(() => null),
    };

    cpu.targetAttack(enemyBoard);

    // Only 2,2 or 5,2 is valid for attackRow,attackCol
    const call = enemyBoard.receiveAttack.mock.calls[0];
    expect([
      [2, 2],
      [5, 2],
    ]).toContainEqual([call[0], call[1]]);
  });

  test('targetAttack resets mode/movesStreak after ship is sunk (streak > 1)', () => {
    const cpu = new CPU();
    // Place streak of vertical ship
    cpu.mode = 'target';
    cpu.movesStreak = [
      [3, 2],
      [4, 2],
      [5, 2],
    ];
    cpu.possibleMoves = [
      [2, 2],
      [6, 2],
    ];
    // Mock: return a Ship that's sunk
    const mockShip = new Ship(3, true);
    jest.spyOn(mockShip, 'isSunk').mockReturnValue(true);

    //Mock enemyBoard
    const enemyBoard = {
      receiveAttack: jest.fn(() => mockShip),
      grid: Array.from({ length: 10 }, () => Array(10).fill(null)),
    };
    enemyBoard.grid[3][2] = mockShip;
    enemyBoard.grid[4][2] = mockShip;
    enemyBoard.grid[5][2] = mockShip;

    cpu.targetAttack(enemyBoard);

    expect(cpu.mode).toBe('random');
    expect(cpu.movesStreak.length).toBe(0);
  });

  test('targetAttack falls back to randomAttack if no candidateMoves', () => {
    const cpu = new CPU();
    cpu.mode = 'target';
    cpu.movesStreak = [
      [1, 1],
      [1, 2],
    ];
    cpu.candidateMoves = [];
    cpu.possibleMoves = [[5, 5]];
    const enemyBoard = {
      receiveAttack: jest.fn(() => null),
    };
    const spyRandomAttack = jest.spyOn(cpu, 'randomAttack');
    cpu.targetAttack(enemyBoard);
    expect(spyRandomAttack).toHaveBeenCalled();
    spyRandomAttack.mockRestore();
  });

  test('removeAdjacentToSunkShip works for ship at grid edge', () => {
    const cpu = new CPU();
    // Ship at (0,9)-(1,9): top right corner
    const enemyBoard = {
      grid: Array.from({ length: 10 }, () => Array(10).fill(null)),
    };
    const ship = new Ship(2, true);
    enemyBoard.grid[0][9] = ship;
    enemyBoard.grid[1][9] = ship;

    cpu.possibleMoves = [];
    for (let r = 0; r < 10; r++)
      for (let c = 0; c < 10; c++) cpu.possibleMoves.push([r, c]);

    cpu.removeAdjacentToSunkShip(ship, enemyBoard);

    // There should not be any errors, and (0,9), (1,9) and their valid neighbors are removed
    [
      [0, 9],
      [0, 8],
      [1, 8],
      [1, 9],
      [2, 8],
      [2, 9],
    ].forEach(([row, col]) => {
      if (col >= 0 && row >= 0)
        expect(cpu.possibleMoves.some(([r, c]) => r === row && c === col)).toBe(
          false,
        );
    });
  });
});
