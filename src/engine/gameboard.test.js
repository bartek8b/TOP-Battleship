import { Gameboard } from './gameboard.js';
import { Ship } from './ship.js';

describe('Gameboard', () => {
  test('Init & reset', () => {
    const gameboard = new Gameboard();
    const ship = new Ship(2, true);

    gameboard.placeShip(ship, 5, 5);
    expect(gameboard.fleet.length).toBe(1);
    expect(gameboard.fleet[0]).toBe(ship);
    expect(gameboard.fleet[1]).toBe(undefined);
    expect(gameboard.grid[5][5]).toBe(ship);
    expect(gameboard.grid[6][5]).toBe(ship);
    
    gameboard.reset();
    expect(gameboard.fleet.length).toBe(0);
    expect(gameboard.fleet[0]).toBe(undefined);
    expect(gameboard.grid[5][5]).toBe(null);
    expect(gameboard.grid[6][5]).toBe(null);
  });

  test('Grid have length 10', () => {
    const gameboard = new Gameboard();
    expect(gameboard.grid.length).toBe(10);
    expect(gameboard.grid[10]).toBe(undefined);
  });

  test('Each grid row has 10 elements', () => {
    const gameboard = new Gameboard();
    expect(gameboard.grid[0].length).toBe(10);
    expect(gameboard.grid[9].length).toBe(10);
  });

  test('Each cell is null on start', () => {
    const gameboard = new Gameboard();
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        expect(gameboard.grid[row][col]).toBe(null);
      }
    }
  });

  test('Cannot place ship outside grid (row = -1)', () => {
    const gameboard = new Gameboard();
    const ship = new Ship(1);
    expect(() => gameboard.placeShip(ship, -1, 2)).toThrow();
  });

  test('Cannot place ship outside grid (row = 10)', () => {
    const gameboard = new Gameboard();
    const ship = new Ship(1);
    expect(() => gameboard.placeShip(ship, 10, 2)).toThrow();
  });

  test('Cannot place ship outside grid (col = -1)', () => {
    const gameboard = new Gameboard();
    const ship = new Ship(4);
    expect(() => gameboard.placeShip(ship, 2, -1)).toThrow();
  });

  test('Cannot place ship outside grid (col = 10)', () => {
    const gameboard = new Gameboard();
    const ship = new Ship(3);
    expect(() => gameboard.placeShip(ship, 3, 10)).toThrow();
  });

  test('Horizontal ship is well placed on gameboard', () => {
    const gameboard = new Gameboard();
    const ship = new Ship(4);
    gameboard.placeShip(ship, 0, 6);
    expect(gameboard.grid[0][6]).toBe(ship);
    expect(gameboard.grid[0][7]).toBe(ship);
    expect(gameboard.grid[0][8]).toBe(ship);
    expect(gameboard.grid[0][9]).toBe(ship);
  });

  test('Vertical ship is well placed on gameboard', () => {
    const gameboard = new Gameboard();
    // True must be provided (for this.vertical)
    const ship = new Ship(4, true);
    gameboard.placeShip(ship, 6, 0);
    expect(gameboard.grid[6][0]).toBe(ship);
    expect(gameboard.grid[7][0]).toBe(ship);
    expect(gameboard.grid[8][0]).toBe(ship);
    expect(gameboard.grid[9][0]).toBe(ship);
  });

  test('Horizontal ship placed out of bounds throws', () => {
    const gameboard = new Gameboard();
    const ship = new Ship(3);
    expect(() => gameboard.placeShip(ship, 0, 8)).toThrow();
  });

  test('Vertical ship placed out of bounds throws', () => {
    const gameboard = new Gameboard();
    const ship = new Ship(2, true);
    expect(() => gameboard.placeShip(ship, 9, 0)).toThrow();
  });

  test('isEmptyOrNull returns true for empty cells', () => {
    const gameboard = new Gameboard();
    expect(gameboard.isEmptyOrNull(0, 0)).toBe(true);
    expect(gameboard.isEmptyOrNull(9, 9)).toBe(true);
  });

  test('isEmptyOrNull returns false for occupied cells', () => {
    const gameboard = new Gameboard();
    const ship = new Ship(1);
    gameboard.placeShip(ship, 3, 3);
    expect(gameboard.isEmptyOrNull(3, 3)).toBe(false);
  });

  test('isEmptyOrNull returns true for out of bounds', () => {
    const gameboard = new Gameboard();
    expect(gameboard.isEmptyOrNull(-1, 0)).toBe(true);
    expect(gameboard.isEmptyOrNull(0, -1)).toBe(true);
    expect(gameboard.isEmptyOrNull(10, 0)).toBe(true);
    expect(gameboard.isEmptyOrNull(0, 10)).toBe(true);
  });

  test('canPlaceShip returns false if ship would overlap', () => {
    const gameboard = new Gameboard();
    const ship1 = new Ship(2);
    const ship2 = new Ship(3);
    gameboard.placeShip(ship1, 5, 5);
    expect(gameboard.canPlaceShip(ship2, 5, 5)).toBe(false); // Collision
    expect(gameboard.canPlaceShip(ship2, 4, 5)).toBe(false); // Touch
    expect(gameboard.canPlaceShip(ship2, 6, 4)).toBe(false); // Touch
  });

  test('canPlaceShip returns true only if ship and neighbours are free', () => {
    const gameboard = new Gameboard();
    const ship1 = new Ship(2);
    gameboard.placeShip(ship1, 0, 0);
    // New ship away from ship1
    const ship2 = new Ship(3);
    expect(gameboard.canPlaceShip(ship2, 3, 3)).toBe(true);
  });

  test('canPlaceShip blocks placing ships next to each other horizontally', () => {
    const gameboard = new Gameboard();
    const ship1 = new Ship(3);
    gameboard.placeShip(ship1, 4, 4);
    // Try to place new ship touching ship1
    const ship2 = new Ship(2);
    expect(gameboard.canPlaceShip(ship2, 4, 7)).toBe(false);
    // Try to place new ship which don't touch ship1 even with its corner
    expect(gameboard.canPlaceShip(ship2, 4, 8)).toBe(true);
  });

  test('canPlaceShip blocks placing ships next to each other vertically', () => {
    const gameboard = new Gameboard();
    const ship1 = new Ship(4, true);
    gameboard.placeShip(ship1, 2, 2);
    const ship2 = new Ship(2, true);
    // Try to place new ship touching ship1
    expect(gameboard.canPlaceShip(ship2, 6, 2)).toBe(false);
    // Try to place new ship which don't touch ship1 even with its corner
    expect(gameboard.canPlaceShip(ship2, 8, 2)).toBe(true);
  });

  test('Cannot place more ships of the same type than stated in shipsAvailable object', () => {
    const gameboard = new Gameboard();
    const ship1 = new Ship(4);
    const ship2 = new Ship(4);
    gameboard.placeShip(ship1, 0, 0);
    expect(gameboard.shipsAvailable[ship1.length]).toBe(0);
    expect(() => gameboard.placeShip(ship2, 2, 0)).toThrow();
  });

  test('Cannot shot out of bounds', () => {
    const gameboard = new Gameboard();
    expect(() => gameboard.receiveAttack(-1, 0)).toThrow();
    expect(() => gameboard.receiveAttack(0, 10)).toThrow();
    expect(() => gameboard.receiveAttack(10, 5)).toThrow();
    expect(() => gameboard.receiveAttack(5, -1)).toThrow();
  });

  test('Properly tracks missed shot', () => {
    const gameboard = new Gameboard();
    gameboard.receiveAttack(0, 1);
    expect(gameboard.grid[0][1]).toBe('miss');
  });

  test('Properly tracks accurate shot', () => {
    const gameboard = new Gameboard();
    const ship = new Ship(1);
    gameboard.placeShip(ship, 0, 1);
    gameboard.receiveAttack(0, 1);
    gameboard.receiveAttack(0, 2);
    expect(gameboard.grid[0][1]).toBe('hit');
    expect(gameboard.grid[0][2]).toBe('miss');
    // Another shots into same cells
    expect(() => gameboard.receiveAttack(0, 1)).toThrow();
    expect(() => gameboard.receiveAttack(0, 2)).toThrow();
  });

  test('Properly tracks accurate shot', () => {
    const gameboard = new Gameboard();
    // Call allSipsSunk on empty gameboard
    expect(gameboard.allShipsSunk()).toBe(false);
    const ship1 = new Ship(1);
    const ship2 = new Ship(2, true);
    gameboard.placeShip(ship1, 0, 1);
    gameboard.placeShip(ship2, 8, 9);
    gameboard.receiveAttack(0, 1);
    expect(gameboard.allShipsSunk()).toBe(false);
    gameboard.receiveAttack(8, 9);
    gameboard.receiveAttack(9, 9);
    expect(gameboard.allShipsSunk()).toBe(true);
  });
});
