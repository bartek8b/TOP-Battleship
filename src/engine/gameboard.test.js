import { Gameboard } from './gameboard.js';

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

  test('Ship with 0 length cannot be placed', () => {
    const gameboard = new Gameboard();
    expect(() => gameboard.placeShip(0, 1, 2)).toThrow();
  });

  test('Ship with 5 length cannot be placed', () => {
    const gameboard = new Gameboard();
    expect(() => gameboard.placeShip(5, 1, 2)).toThrow();
  });

  test('Ship with row -1 cannot be placed', () => {
    const gameboard = new Gameboard();
    expect(() => gameboard.placeShip(1, -1, 2)).toThrow();
  });

  test('Ship with row 10 length cannot be placed', () => {
    const gameboard = new Gameboard();
    expect(() => gameboard.placeShip(1, 10, 2)).toThrow();
  });

  test('Ship with col -1 length cannot be placed', () => {
    const gameboard = new Gameboard();
    expect(() => gameboard.placeShip(2, 2, -1)).toThrow();
  });

  test('Ship with col 10 length cannot be placed', () => {
    const gameboard = new Gameboard();
    expect(() => gameboard.placeShip(3, 3, 10)).toThrow();
  });
});
