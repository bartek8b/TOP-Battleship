import { updateGrid } from './renderBoard';

export function setListeners(game, messageBoard) {
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
    let shot;
    try {
      shot = game.player1Move(x, y);
    } catch {
      return;
    }

    // Update CPU board after player's shot
    updateGrid(game.cpu);

    // Show message for player's shot (MessageBoard handles delayed show/hide)
    if (shot?.result === 'hit') {
      messageBoard.accurate(game.player1);
    } else if (shot?.result === 'sunk') {
      messageBoard.sunk(game.player1, shot.ship);
    } else if (shot?.result === 'miss') {
      messageBoard.miss(game.player1);
    }

    // If player's shot produced a miss and control passed to CPU, start engine loop.
    // game.startCpuLoop internally prevents multiple concurrent loops.
    if (prevMove === game.player1 && game.onTheMove === game.cpu) {
      // Provide callback to update player grid after each cpuMove and show messages
      game.startCpuLoop(500, (cpuShot) => {
        // cpuShot may be undefined (skipped) — ignore
        if (!cpuShot) return;

        if (cpuShot.result === 'miss') {
          messageBoard.miss(game.cpu);
        } else if (cpuShot.result === 'hit') {
          messageBoard.accurate(game.cpu);
        } else if (cpuShot.result === 'sunk') {
          messageBoard.sunk(game.cpu, cpuShot.ship);
        }

        // Update player grid after CPU shot
        updateGrid(game.player1);
      });
    }
  });
}
