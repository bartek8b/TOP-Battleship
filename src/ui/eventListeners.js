import { updateGrid } from './renderBoard';
import { UI_DURATIONS } from './uiConfig.js';

// setListeners(game, messageBoard) - attach delegated click listener for CPU board clicks.
// Uses event delegation and uses message durations to pace CPU.
export function setListeners(game, messageBoard) {
  if (document._cpuCellClickListenerAttached) return;
  document._cpuCellClickListenerAttached = true;

  document.addEventListener('click', (e) => {
    const cell = e.target.closest('#cpu-container .board-container .cell');
    if (!cell) return;

    if (document.body.classList.contains('blocked')) return;
    if (game.gameOver) return;
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

    // Render CPU board first so visual hit/miss is visible
    updateGrid(game.cpu);

    // Show message corresponding to shot (immediate)
    if (shot?.result === 'hit') {
      messageBoard.show(
        `${game.player1.name} hit the opponent's ship!`,
        UI_DURATIONS.hit,
      );
    } else if (shot?.result === 'sunk') {
      messageBoard.show(
        `${game.player1.name} sunk the opponent's ${shot.ship.type}!`,
        UI_DURATIONS.sunk,
      );
    } else if (shot?.result === 'miss') {
      messageBoard.show(`${game.player1.name} missed!`, UI_DURATIONS.miss);
    } else if (shot?.gameResult) {
      // Player1 won
      messageBoard.allSunk(game.player1);
    } else if (shot?.error) {
      messageBoard.show(`Error: ${shot.error}`, UI_DURATIONS.error);
    }

    // If player's miss transferred control to CPU, start cpu loop (deferred) that uses durations returned by callback
    if (
      prevMove === game.player1 &&
      game.onTheMove === game.cpu &&
      !game.gameOver
    ) {
      const baseDelay = UI_DURATIONS.miss;
      // Defer starting the CPU loop one tick so browser can paint the player's message
      setTimeout(() => {
        game.startCpuLoop(baseDelay, (cpuShot) => {
          if (!cpuShot) return baseDelay;

          // Update player grid first
          updateGrid(game.player1);

          // Show message and return duration for next loop iteration
          if (cpuShot.result === 'miss') {
            messageBoard.show(`${game.cpu.name} missed!`, UI_DURATIONS.miss);
            return UI_DURATIONS.miss;
          } else if (cpuShot.result === 'hit') {
            messageBoard.show(
              `${game.cpu.name} hit your ship!`,
              UI_DURATIONS.hit,
            );
            return UI_DURATIONS.hit;
          } else if (cpuShot.result === 'sunk') {
            messageBoard.show(
              `${game.cpu.name} sunk your ${cpuShot.ship.type}!`,
              UI_DURATIONS.sunk,
            );
            return UI_DURATIONS.sunk;
          } else if (cpuShot.gameResult) {
            // CPU won
            messageBoard.allSunk(game.cpu);
            return UI_DURATIONS.gameOver;
          } else if (cpuShot.error) {
            messageBoard.show(`Error: ${cpuShot.error}`, UI_DURATIONS.error);
            return UI_DURATIONS.error;
          }

          return baseDelay;
        });
      }, UI_DURATIONS.miss);
    }
  });
}
