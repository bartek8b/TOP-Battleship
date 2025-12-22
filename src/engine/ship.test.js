import { Ship } from './ship.js';

describe('Ship', () => {
  test('Ship is not sunk on creation & has 0 hits', () => {
    const ship = new Ship(3);
    expect(ship.isSunk()).toBe(false);
    expect(ship.hitsReceived).toBe(0);
  });

  test('Ship has 1 hit after being hit once', () => {
    const ship = new Ship(4);
    ship.hit();
    expect(ship.hitsReceived).toBe(1);
  });

  test('Ship is sunk after receiving the amount of hits that equals to ship.length', () => {
    const ship = new Ship(2);
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(true);
  });

  test('Ship doesnt recieve more hits after being sunk', () => {
    const ship = new Ship(2);
    ship.hit();
    ship.hit();
    ship.hit();
    expect(ship.hitsReceived).toBe(2);
    expect(ship.isSunk()).toBe(true);
  });
});
