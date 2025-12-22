import { Ship } from './ship.js';

test('Ship is not sunk on creation', () => {
  const ship = new Ship(3);
  expect(ship.isSunk()).toBe(false);
});
