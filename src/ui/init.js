import { Game } from '../engine/gameplay';
import { resetGrid, updateGrid } from './renderBoard';
import { setListeners } from './eventListeners';
import { MessageBoard } from './infoDisplay.js';
import { UI_DURATIONS } from './uiConfig.js';

export function init() {
  const game = new Game();

  resetGrid(game.cpu);
  resetGrid(game.player1);

  const messageBoard = new MessageBoard(
    document.getElementById('info-container'),
  );

  // Show welcome first
  messageBoard.welcome();

  // Schedule placeShips to appear after welcome finished.
  // Use messageBoard.showDelay (time before welcome actually shows) + UI_DURATIONS.start (how long welcome stays)
  // plus smallGap to ensure ordering.
  const smallGap = 200;
  const welcomeDelay =
    (messageBoard.showDelay || 0) + (UI_DURATIONS.start || 0) + smallGap;
  setTimeout(() => messageBoard.placeShips(), welcomeDelay);

  // CPU places ships immediately
  game.cpu.randomShipsPlacement();
  updateGrid(game.cpu);

  let listenersAttached = false;
  function attachGameListenersAfterPlayerPlaced() {
    if (!listenersAttached) {
      setListeners(game, messageBoard);
      listenersAttached = true;
    }
  }

  document.addEventListener('click', (e) => {
    const id = e.target?.id;
    if (id === 'place-ships-btn') {
      resetGrid(game.player1);
      if (typeof game.player1.gameboard?.reset === 'function') {
        game.player1.gameboard.reset();
      }
      game.player1.randomShipsPlacement();
      updateGrid(game.player1);

      // Attach board-click listeners (only after player placed)
      attachGameListenersAfterPlayerPlaced();

      const starter = game.onTheMove;
      messageBoard.show(`${starter.name} starts!`, UI_DURATIONS.start);

      if (game.onTheMove === game.cpu) {
        const baseDelay = UI_DURATIONS.miss;
        setTimeout(() => {
          game.startCpuLoop(baseDelay, (cpuShot) => {
            if (!cpuShot) return baseDelay;
            updateGrid(game.player1);

            if (cpuShot.result === 'miss') {
              messageBoard.show(`${game.cpu.name} missed!`, UI_DURATIONS.miss);
              return UI_DURATIONS.miss;
            } else if (cpuShot.result === 'hit') {
              messageBoard.show(
                `${game.cpu.name} hit your ship!`,
                UI_DURATIONS.hit,
              );
              return UI_DURATIONS.hit;
            } else if (cpuShot.result === 'sunk') {
              messageBoard.show(
                `${game.cpu.name} sunk your ${cpuShot.ship.type}!`,
                UI_DURATIONS.sunk,
              );
              return UI_DURATIONS.sunk;
            } else if (cpuShot.gameResult) {
              messageBoard.show(
                `${game.cpu.name} sunk your entire fleet!`,
                UI_DURATIONS.gameOver,
              );
              return UI_DURATIONS.gameOver;
            } else if (cpuShot.error) {
              messageBoard.show(`Error: ${cpuShot.error}`, UI_DURATIONS.error);
              return UI_DURATIONS.error;
            }
            return baseDelay;
          });
        }, 0);
      }
    }

    if (id === 'rematch-btn') {
      game.resetGame();
      resetGrid(game.cpu);
      resetGrid(game.player1);

      game.cpu.randomShipsPlacement();
      updateGrid(game.cpu);

      listenersAttached = false;
      messageBoard.placeShips();
    }
  });
}
