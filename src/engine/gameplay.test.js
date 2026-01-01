import { Game } from './gameplay.js';
import { Player, CPU } from './players.js';

jest.mock('./players.js');

describe('Game class', () => {
  beforeEach(() => {
    Player.mockImplementation(() => ({
      gameboard: { allShipsSunk: jest.fn() },
    }));
    CPU.mockImplementation(() => ({
      attack: jest.fn(),
      gameboard: { receiveAttack: jest.fn(), allShipsSunk: jest.fn() },
    }));
  });

  test('cpuMove loops on consecutive hits and ends after miss', () => {
    const game = new Game();
    game.cpu.attack
      .mockImplementationOnce(() => ({ result: 'hit', ship: 'Destroyer' }))
      .mockImplementationOnce(() => ({ result: 'hit', ship: 'Cruiser' }))
      .mockImplementationOnce(() => ({ result: 'miss' }));
    game.player1.gameboard.allShipsSunk.mockReturnValue(false);

    const spyCpuMove = jest.spyOn(game, 'cpuMove');
    game.onTheMove = game.cpu; // CPU starts on the move

    // Simulate the UI loop: call cpuMove until it passes turn back to player
    while (game.onTheMove === game.cpu) {
      game.cpuMove();
    }

    expect(spyCpuMove).toHaveBeenCalledTimes(3); // 3 moves total
    expect(game.cpu.attack).toHaveBeenCalledTimes(3); // 3 attacks total
    expect(game.onTheMove).toBe(game.player1); // Ends with player1 on the move

    spyCpuMove.mockRestore();
  });

  test('resetGame switches starting player between player1 and cpu', () => {
    const game = new Game();
    const wasPlayerFirst = game.wasPlayerFirst;
    game.resetGame();
    expect(game.wasPlayerFirst).toBe(!wasPlayerFirst);
    // Ensure firstToMove matches flag
    if (wasPlayerFirst === true) {
      expect(game.firstToMove).toBe(game.cpu);
      expect(game.onTheMove).toBe(game.cpu);
    } else {
      expect(game.firstToMove).toBe(game.player1);
      expect(game.onTheMove).toBe(game.player1);
    }
  });
});
