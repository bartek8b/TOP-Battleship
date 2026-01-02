import { Game } from '../engine/gameplay';
import { resetGrid, updateGrid } from './renderBoard';
import { setListeners } from './eventListeners';
import { MessageBoard } from './infoDisplay.js';

export function init() {
  const game = new Game();

  // Prepare UI grids
  resetGrid(game.cpu);
  resetGrid(game.player1);

  // Create MessageBoard with explicit container (safer than lazy-get)
  const messageBoard = new MessageBoard(
    document.getElementById('info-container'),
  );
  messageBoard.welcome();
  // Show placeShips prompt (includes "Random" button)
  setTimeout(() => messageBoard.placeShips(), 800);

  // Place ships randomly (temporary)
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
      // Clear player's grid and populate using the same player instance
      resetGrid(game.player1);
      // Reset existing player's gameboard instead of replacing the player object
      if (typeof game.player1.gameboard?.reset === 'function') {
        game.player1.gameboard.reset();
      }
      game.player1.randomShipsPlacement();
      updateGrid(game.player1);

      // Attach board-click listeners (only after player placed)
      attachGameListenersAfterPlayerPlaced();

      // Announce who starts and possibly start CPU loop
      const starter = game.onTheMove;
      messageBoard.show(`${starter.name} starts!`, 1400);

      // If CPU starts, begin cpu loop (it will only run if game.onTheMove === cpu)
      if (game.onTheMove === game.cpu) {
        game.startCpuLoop(500, (cpuShot) => {
          if (!cpuShot) return;
          if (cpuShot.result === 'miss') {
            messageBoard.miss(game.cpu);
          } else if (cpuShot.result === 'hit') {
            messageBoard.accurate(game.cpu);
          } else if (cpuShot.result === 'sunk') {
            messageBoard.sunk(game.cpu, cpuShot.ship);
          }
          updateGrid(game.player1);
        });
      }
    }

    if (id === 'rematch-btn') {
      // Reset engine state, re-render grids. CPU gets ships immediately, player must click Random again.
      game.resetGame();

      resetGrid(game.cpu);
      resetGrid(game.player1);

      // CPU places ships immediately for the new match
      game.cpu.randomShipsPlacement();
      updateGrid(game.cpu);

      // Do NOT place player's ships automatically
      listenersAttached = false; // require player to click Random again
      // Show placeShips prompt again
      messageBoard.placeShips();
    }
  });
}
