import { Gameboard } from './gameboard.js';
import { Ship } from './ship.js';

describe('Gameboard', () => {
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
});
