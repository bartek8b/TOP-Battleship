import { updateGrid } from './renderBoard';

export function setListeners(game) {
  const grid = document.querySelector(`#cpu-container .board-container`);

  grid.addEventListener('click', (e) => {
    const cell = e.target.closest('.cell');
    if (!cell) return;

    // Only allow clicks if player1 is on the move
    if (game.onTheMove !== game.player1) return;

    const x = Number(cell.dataset.x);
    const y = Number(cell.dataset.y);

    const arr = game.cpu.gameboard.grid;
    if (arr[x][y] === 'hit' || arr[x][y] === 'miss') return;

    const prevMove = game.onTheMove;
    try {
      game.player1Move(x, y);
    } catch {
      return;
    }

    // Update CPU board after player's shot
    updateGrid(game.cpu);

    // If player's shot produced a miss and control passed to CPU, start engine loop.
    // game.startCpuLoop internally prevents multiple concurrent loops.
    if (prevMove === game.player1 && game.onTheMove === game.cpu) {
      // Provide callback to update player grid after each cpuMove
      game.startCpuLoop(500, () => updateGrid(game.player1));
    }
  });
}