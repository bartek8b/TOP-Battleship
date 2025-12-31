import { updateGrid } from './renderBoard';

let cpuSeriesLock = false; // global for this module

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

    const prevMove = game.onTheMove;
    try {
      game.player1Move(x, y);
    } catch {
      return;
    }

    updateGrid(game.cpu);
    if (
      !cpuSeriesLock &&
      prevMove === game.player1 &&
      game.onTheMove === game.cpu
    ) {
      cpuSeriesLock = true;
      cpuSeries(game);
    }
  });
}

export function cpuSeries(game) {
  cpuSeriesLock = true;
  function loop() {
    console.log('cpuSeries START, onTheMove:', game.onTheMove.name);

    if (game.onTheMove !== game.cpu) {
      cpuSeriesLock = false;
      console.log('cpuSeries END, control to', game.onTheMove.name);
      return;
    }
    game.cpuMove();
    updateGrid(game.player1);

    if (game.onTheMove === game.cpu) {
      setTimeout(loop, 500);
    } else {
      cpuSeriesLock = false;
      console.log('cpuSeries END, control to', game.onTheMove.name);
    }
  }
  loop();
}
