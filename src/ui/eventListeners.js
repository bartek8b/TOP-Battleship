import { updateGrid } from './renderBoard';

export function setListeners(game) {
  const grid = document.querySelector(`#cpu-container .board-container`);

  grid.addEventListener('click', (e) => {
    const cell = e.target.closest('.cell');
    if (!cell) return;

    if (game.onTheMove !== game.player1) return;

    const x = Number(cell.dataset.x);
    const y = Number(cell.dataset.y);

    const arr = game.cpu.gameboard.grid;
    if (arr[x][y] === 'hit' || arr[x][y] === 'miss') return;

    try {
      game.player1Move(x, y);
    } catch {
      return;
    }

    updateGrid(game.cpu);

    if (game.onTheMove === game.cpu) {
      setTimeout(() => {
        game.cpuMove();
        updateGrid(game.player1);
        // Sprawdzić czy koniec gry
      }, 500);
    }
  });
}
