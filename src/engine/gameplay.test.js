import { Game } from './gameplay.js';

describe('Game', () => {
  test('onTheMove links to firstToMove & contains player1 or cpu', () => {
    const game = new Game();
    expect(game.onTheMove).toBe(game.firstToMove);
    expect([game.player1, game.cpu]).toContain(game.onTheMove);
    game.onTheMove = null;
    expect(game.onTheMove).not.toBe(game.firstToMove)
  });
});