import { updateGrid } from './renderBoard';

// setListeners(game, messageBoard) - attach delegated click listener for CPU board clicks.
// Uses event delegation on document so it survives DOM rebuilds of the board.

export function setListeners(game, messageBoard) {
  // Guard: attach only once globally
  if (document._cpuCellClickListenerAttached) return;
  document._cpuCellClickListenerAttached = true;

  document.addEventListener('click', (e) => {
    // Find if the click was inside a CPU board cell
    const cell = e.target.closest('#cpu-container .board-container .cell');
    if (!cell) return;

    // Block clicks while a message is visible or blocked by MessageBoard
    if (document.body.classList.contains('blocked')) return;

    // If game over, ignore clicks
    if (game.gameOver) return;

    // Only allow clicks if player1 is on the move
    if (game.onTheMove !== game.player1) return;

    const x = Number(cell.dataset.x);
    const y = Number(cell.dataset.y);

    const arr = game.cpu.gameboard.grid;
    // Ignore clicks on already tried cells
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
    } else if (shot?.gameResult) {
      // player won
      messageBoard.allSunk(game.player1);
    } else if (shot?.error) {
      messageBoard.show(`Error: ${shot.error}`, 2000);
    }

    // If player's shot produced a miss and control passed to CPU, start engine loop.
    if (
      prevMove === game.player1 &&
      game.onTheMove === game.cpu &&
      !game.gameOver
    ) {
      // Provide callback to update player grid after each cpuMove and show messages
      game.startCpuLoop(50, (cpuShot) => {
        if (!cpuShot) return;
        if (cpuShot.result === 'miss') {
          messageBoard.miss(game.cpu);
        } else if (cpuShot.result === 'hit') {
          messageBoard.accurate(game.cpu);
        } else if (cpuShot.result === 'sunk') {
          messageBoard.sunk(game.cpu, cpuShot.ship);
        } else if (cpuShot.gameResult) {
          messageBoard.allSunk(game.cpu);
        } else if (cpuShot.error) {
          messageBoard.show(`Error: ${cpuShot.error}`, 2000);
        }

        // Update player grid after CPU shot
        updateGrid(game.player1);
      });
    }
  });
}
