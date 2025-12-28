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

  describe('async logic with cpuMove and playRound', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    test('cpuMove loops on consecutive hits and ends after miss', () => {
      const game = new Game();
      game.cpu.attack
        .mockImplementationOnce(() => ({ result: 'hit', ship: 'Destroyer' }))
        .mockImplementationOnce(() => ({ result: 'hit', ship: 'Cruiser' }))
        .mockImplementationOnce(() => ({ result: 'miss' }));
      game.player1.gameboard.allShipsSunk.mockReturnValue(false);

      const spyCpuMove = jest.spyOn(game, 'cpuMove');
      game.onTheMove = game.cpu;

      // Start the loop
      game.playRound();

      // Calls pending timers one by one
      jest.runOnlyPendingTimers();
      jest.runOnlyPendingTimers();
      jest.runOnlyPendingTimers();

      expect(spyCpuMove).toHaveBeenCalledTimes(3);
      expect(game.cpu.attack).toHaveBeenCalledTimes(3);
      expect(game.onTheMove).toBe(game.player1);

      spyCpuMove.mockRestore();
    });

    test('playRound: cpuMove is called if onTheMove is cpu', () => {
      const game = new Game();
      game.onTheMove = game.cpu;

      const cpuMoveSpy = jest
        .spyOn(game, 'cpuMove')
        .mockReturnValue('CPU_RESULT');
      game.playRound();

      // Not called immediately (pending mock timers)
      expect(cpuMoveSpy).not.toHaveBeenCalled();

      // Fast-forward timers (triggers mock)
      jest.runOnlyPendingTimers();

      // cpuMove should be called
      expect(cpuMoveSpy).toHaveBeenCalled();
      cpuMoveSpy.mockRestore();
    });

    test('playRound: does nothing if onTheMove is player1', () => {
      const game = new Game();
      game.onTheMove = game.player1;
      const cpuMoveSpy = jest.spyOn(game, 'cpuMove');
      const ret = game.playRound();
      expect(cpuMoveSpy).not.toHaveBeenCalled();
      expect(ret).toBeUndefined();
      cpuMoveSpy.mockRestore();
    });
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
