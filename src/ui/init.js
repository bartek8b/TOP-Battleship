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
  const messageBoard = new MessageBoard(document.getElementById('info-container'));
  messageBoard.welcome();

  // Place ships randomly (temporary)
  game.cpu.randomShipsPlacement();
  updateGrid(game.cpu);

  game.player1.randomShipsPlacement();
  updateGrid(game.player1);

  // Set up listeners, passing messageBoard so clicks can show messages
  setListeners(game, messageBoard);

  // Listen for action buttons inside message area (place-ships / rematch)
  document.addEventListener('click', (e) => {
    const id = e.target?.id;
    if (id === 'place-ships-btn') {
      // Randomize player's ships and update
      // If you later implement a reset method on player/gameboard, use it; for now, place randomly
      // Clear player's board first: resetGrid + re-place ships
      resetGrid(game.player1);
      game.player1 = new (game.player1.constructor)(); // create new Player instance preserving constructor usage
      game.player1.randomShipsPlacement();
      updateGrid(game.player1);
      messageBoard.show('Player ships randomized', 1200);
    }
    if (id === 'rematch-btn') {
      // Reset game and grids, re-place ships randomly
      game.resetGame();
      resetGrid(game.cpu);
      resetGrid(game.player1);
      game.cpu.randomShipsPlacement();
      game.player1.randomShipsPlacement();
      updateGrid(game.cpu);
      updateGrid(game.player1);
      messageBoard.show('Rematch started', 1200);
    }
  });

  // If CPU starts, start loop in engine and pass callback to update player view
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