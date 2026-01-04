import { updateGrid } from './renderBoard';
import { UI_DURATIONS } from './uiConfig.js';

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

    // Update CPU board after player's shot (render before showing message)
    updateGrid(game.cpu);

    // Show message for player's shot using UI_DURATIONS
    if (shot?.result === 'hit') {
      messageBoard.show(`${game.player1.name} hit the opponent's ship!`, UI_DURATIONS.hit);
    } else if (shot?.result === 'sunk') {
      messageBoard.show(`${game.player1.name} sunk the opponent's ${shot.ship.type}!`, UI_DURATIONS.sunk);
    } else if (shot?.result === 'miss') {
      messageBoard.show(`${game.player1.name} missed!`, UI_DURATIONS.miss);
    } else if (shot?.gameResult) {
      messageBoard.show(`${game.player1.name} sunk the entire opponent's fleet!`, UI_DURATIONS.gameOver);
    } else if (shot?.error) {
      messageBoard.show(`Error: ${shot.error}`, UI_DURATIONS.error);
    }

    // If player's shot produced a miss and control passed to CPU, start engine loop.
    // Use base delay derived from UI_DURATIONS.miss so CPU waits while message visible
    if (prevMove === game.player1 && game.onTheMove === game.cpu && !game.gameOver) {
      const baseDelay = UI_DURATIONS.miss;
      game.startCpuLoop(baseDelay, (cpuShot) => {
        if (!cpuShot) return;

        // Update player grid before showing message so board reflects hit/miss immediately
        updateGrid(game.player1);

        // Show CPU shot messages using UI_DURATIONS
        if (cpuShot.result === 'miss') {
          messageBoard.show(`${game.cpu.name} missed!`, UI_DURATIONS.miss);
        } else if (cpuShot.result === 'hit') {
          messageBoard.show(`${game.cpu.name} hit your ship!`, UI_DURATIONS.hit);
        } else if (cpuShot.result === 'sunk') {
          messageBoard.show(`${game.cpu.name} sunk your ${cpuShot.ship.type}!`, UI_DURATIONS.sunk);
        } else if (cpuShot.gameResult) {
          messageBoard.show(`${game.cpu.name} sunk your entire fleet!`, UI_DURATIONS.gameOver);
        } else if (cpuShot.error) {
          messageBoard.show(`Error: ${cpuShot.error}`, UI_DURATIONS.error);
        }
      });
    }
  });
}