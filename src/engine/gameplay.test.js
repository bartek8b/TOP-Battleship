import { Game } from './gameplay.js';
import { Player, CPU } from './players.js';

jest.mock('./players.js');

describe('Game class - full unit tests', () => {
  beforeEach(() => {
    // Mock Player and CPU to provide controlled dependencies
    Player.mockImplementation(() => ({
      gameboard: { allShipsSunk: jest.fn() },
    }));
    CPU.mockImplementation(() => ({
      attack: jest.fn(),
      gameboard: { receiveAttack: jest.fn(), allShipsSunk: jest.fn() },
    }));
  });

  test('onTheMove links to firstToMove & contains player1 or cpu', () => {
    const game = new Game();
    expect(game.onTheMove).toBe(game.firstToMove);
    expect([game.player1, game.cpu]).toContain(game.onTheMove);
    game.onTheMove = null;
    expect(game.onTheMove).not.toBe(game.firstToMove);
  });

  test('player1Move switches turn to cpu after miss', () => {
    // Simulate a miss on CPU gameboard
    const game = new Game();
    game.cpu.gameboard.receiveAttack.mockReturnValue({ result: 'miss' });
    game.cpu.gameboard.allShipsSunk.mockReturnValue(false);

    const result = game.player1Move(2, 7);
    expect(result).toEqual({ result: 'miss' });
    // onTheMove should now be cpu
    expect(game.onTheMove).toBe(game.cpu);
  });

  test('player1Move returns win result if CPU fleet is sunk', () => {
    const game = new Game();
    game.cpu.gameboard.receiveAttack.mockReturnValue({
      result: 'sunk',
      ship: 'Destroyer',
    });
    game.cpu.gameboard.allShipsSunk.mockReturnValue(true);

    const result = game.player1Move(5, 2);
    expect(result).toEqual({ gameResult: 'Player 1 wins!' });
  });

  test('cpuMove switches turn to player1 after miss', () => {
    // Simulate a miss by CPU
    const game = new Game();
    game.cpu.attack.mockReturnValue({ result: 'miss' });
    game.player1.gameboard.allShipsSunk.mockReturnValue(false);

    const result = game.cpuMove();
    expect(result).toEqual({ result: 'miss' });
    expect(game.onTheMove).toBe(game.player1);
  });

  test('cpuMove returns win result if player1 fleet is sunk', () => {
    // Simulate scenario where player1's fleet is sunk
    const game = new Game();
    game.cpu.attack.mockReturnValue({ result: 'sunk', ship: 'Cruiser' });
    game.player1.gameboard.allShipsSunk.mockReturnValue(true);

    const result = game.cpuMove();
    expect(result).toEqual({ gameResult: 'CPU wins!' });
  });

  test('cpuMove loops on consecutive hits and ends after miss', () => {
    // Simulate consecutive hits followed by a miss
    const game = new Game();
    game.cpu.attack
      .mockImplementationOnce(() => ({ result: 'hit', ship: 'Destroyer' }))
      .mockImplementationOnce(() => ({ result: 'hit', ship: 'Cruiser' }))
      .mockImplementationOnce(() => ({ result: 'miss' }));
    game.player1.gameboard.allShipsSunk.mockReturnValue(false);

    const result = game.cpuMove();
    expect(result).toEqual({ result: 'miss' });
    expect(game.onTheMove).toBe(game.player1);
    expect(game.cpu.attack).toHaveBeenCalledTimes(3);
  });
});
