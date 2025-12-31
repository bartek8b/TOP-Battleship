import { updateGrid } from './renderBoard';

export function setListeners(game) {
  const grid = document.querySelector(`#cpu-container .board-container`);

  grid.addEventListener('click', (e) => {
    const cell = e.target.closest('.cell');
    if (!cell) return;

    const x = Number(cell.dataset.x);
    const y = Number(cell.dataset.y);

    try {
      game.player1Move(x, y);
    } catch {
      // Double hit causes error in engine
    }

    updateGrid(game.cpu);
  });
}
