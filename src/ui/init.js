import { Game } from '../engine/gameplay';
import { resetGrid, updateGrid } from './renderBoard';
import { setListeners } from './eventListeners';

export function init() {
  const game = new Game();

  resetGrid(game.cpu);
  resetGrid(game.player1);

  game.cpu.randomShipsPlacement();
  updateGrid(game.cpu);

  // Manual placement to be implemented
  game.player1.randomShipsPlacement();
  updateGrid(game.player1);

  // In the end
  setListeners(game);

  // If CPU starts, start loop in engine and pass callback to update player view
  if (game.onTheMove === game.cpu) {
    game.startCpuLoop(500, () => updateGrid(game.player1));
  }
}
