import { Ship } from './ship.js';

describe('Ship', () => {
  test('Ship is not sunk on creation & has 0 hits', () => {
    const ship = new Ship(3);
    expect(ship.type).toBe('3-masted ship');
    expect(ship.isSunk()).toBe(false);
    expect(ship.hitsReceived).toBe(0);
  });

  test('Ship has 1 hit after being hit once', () => {
    const ship = new Ship(4);
    expect(ship.type).toBe('4-masted ship');
    ship.hit();
    expect(ship.hitsReceived).toBe(1);
  });

  test('Ship is sunk after receiving the amount of hits that equals to ship.length', () => {
    const ship = new Ship(2);
    expect(ship.type).toBe('2-masted ship');
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(true);
  });

  test('Ship doesnt recieve more hits after being sunk', () => {
    const ship = new Ship(1);
    expect(ship.type).toBe('1-masted ship');
    ship.hit();
    ship.hit();
    expect(ship.hitsReceived).toBe(1);
    expect(ship.isSunk()).toBe(true);
  });

  test('Cannot make too short ship', () => {
    expect(() => new Ship(0)).toThrow();
  });

  test('Cannot make too long ship', () => {
    expect(() => new Ship(5)).toThrow();
  });
});
