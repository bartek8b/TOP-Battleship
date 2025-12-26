import { getRandomIntBetween } from './utils.js';

test('getRandomIntBetween 0,9 zwraca liczby 0-9', () => {
  for (let i = 0; i < 1000; i++) {
    const n = getRandomIntBetween(0, 9);
    expect(n).toBeGreaterThanOrEqual(0);
    expect(n).toBeLessThanOrEqual(9);
  }
});
test('getRandomIntBetween zwraca min==max', () => {
  expect(getRandomIntBetween(5, 5)).toBe(5);
});