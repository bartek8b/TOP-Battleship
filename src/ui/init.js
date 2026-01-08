import { Game } from '../engine/gameplay';
import { Ship } from '../engine/ship.js';
import { resetGrid, updateGrid } from './renderBoard';
import { setListeners } from './eventListeners';
import { MessageBoard } from './infoDisplay.js';
import { UI_DURATIONS } from './uiConfig.js';

export function init() {
  const game = new Game();

  resetGrid(game.cpu);
  resetGrid(game.player1);

  const messageBoard = new MessageBoard(
    document.getElementById('info-container'),
  );

  const fleetContainer = document.querySelector('.fleet-container');
  const initialFleetMarkup = fleetContainer?.innerHTML || '';

  // Show welcome first
  messageBoard.welcome();

  // Schedule placeShips to appear after welcome finished.
  const smallGap = 200;
  const welcomeDelay =
    (messageBoard.showDelay || 0) + (UI_DURATIONS.start || 0) + smallGap;
  setTimeout(() => messageBoard.placeShips(), welcomeDelay);

  // CPU places ships immediately
  game.cpu.randomShipsPlacement();
  updateGrid(game.cpu);

  let listenersAttached = false;
  let battleStarted = false;

  const attachGameListenersAfterPlayerPlaced = () => {
    if (!listenersAttached) {
      setListeners(game, messageBoard);
      listenersAttached = true;
    }
  };

  const cpuLoopCallback = (cpuShot) => {
    const baseDelay = UI_DURATIONS.miss;
    if (!cpuShot) return baseDelay;

    updateGrid(game.player1);

    if (cpuShot.result === 'miss') {
      messageBoard.show(`${game.cpu.name} missed!`, UI_DURATIONS.miss);
      return UI_DURATIONS.miss;
    } else if (cpuShot.result === 'hit') {
      messageBoard.show(`${game.cpu.name} hit your ship!`, UI_DURATIONS.hit);
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
  };

  const startBattle = () => {
    if (battleStarted) return;
    battleStarted = true;

    attachGameListenersAfterPlayerPlaced();

    const starter = game.onTheMove;
    messageBoard.show(`${starter.name} starts!`, UI_DURATIONS.start);

    if (game.onTheMove === game.cpu) {
      const baseDelay = UI_DURATIONS.miss;
      setTimeout(() => {
        game.startCpuLoop(baseDelay, cpuLoopCallback);
      }, 0);
    }
  };

  /**
   * Drag & drop manual placement
   */
  const setupFleetDragAndDrop = () => {
    const grid = document.querySelector('#plr-container .board-container');
    if (!fleetContainer || !grid) return;

    // Clear any old listeners by rebuilding grid (already done via resetGrid) and fleet innerHTML
    const clearPreviews = () => {
      grid
        .querySelectorAll('.cell.preview-ok, .cell.preview-bad')
        .forEach((cell) => cell.classList.remove('preview-ok', 'preview-bad'));
    };

    let dragData = null;

    const previewPlacement = (row, col, length, vertical) => {
      clearPreviews();
      // quick bounds check to avoid creating a ship when obviously OOB
      if (row < 0 || col < 0) return;
      const ship = new Ship(length, vertical);
      const canPlace = game.player1.gameboard.canPlaceShip(ship, row, col);
      for (let i = 0; i < length; i++) {
        const r = vertical ? row + i : row;
        const c = vertical ? col : col + i;
        const cell = grid.querySelector(`.cell[data-x="${r}"][data-y="${c}"]`);
        if (cell) cell.classList.add(canPlace ? 'preview-ok' : 'preview-bad');
      }
    };

    const onAllShipsPlaced = () => {
      if (fleetContainer.querySelectorAll('.ship').length === 0) {
        startBattle();
      }
    };

    grid.addEventListener('dragover', (e) => {
      if (!dragData) {
        try {
          dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
        } catch {
          dragData = null;
        }
      }
      if (!dragData?.length) return;
      const cell = e.target.closest('.cell');
      if (!cell) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      const row = Number(cell.dataset.x);
      const col = Number(cell.dataset.y);
      previewPlacement(
        row,
        col,
        dragData.length,
        dragData.orientation === 'vertical',
      );
    });

    grid.addEventListener('dragleave', (e) => {
      // only clear if leaving the grid entirely
      if (!grid.contains(e.relatedTarget)) clearPreviews();
    });

    grid.addEventListener('drop', (e) => {
      e.preventDefault();
      const cell = e.target.closest('.cell');
      if (!cell) {
        dragData = null;
        clearPreviews();
        return;
      }

      // Recover data if not present
      if (!dragData) {
        try {
          dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
        } catch {
          dragData = null;
        }
      }

      const { length, orientation, idx } = dragData || {};
      dragData = null;
      clearPreviews();
      if (!length) return;

      const row = Number(cell.dataset.x);
      const col = Number(cell.dataset.y);
      const vertical = orientation === 'vertical';
      try {
        game.player1.gameboard.placeShip(new Ship(length, vertical), row, col);
        updateGrid(game.player1);
        const placedShipEl = fleetContainer.querySelector(
          `.ship[data-index="${idx}"]`,
        );
        if (placedShipEl) placedShipEl.remove();
        onAllShipsPlaced();
      } catch (err) {
        messageBoard.error(err?.message || 'Cannot place ship here');
      }
    });

    // Make each fleet ship draggable & rotatable
    const shipEls = fleetContainer.querySelectorAll('.ship');
    shipEls.forEach((shipEl, idx) => {
      const length =
        Number(shipEl.querySelector('p')?.textContent?.trim()) ||
        Number(shipEl.dataset.length);

      shipEl.dataset.length = length;
      shipEl.dataset.index = idx;
      shipEl.dataset.orientation = 'horizontal';
      shipEl.draggable = true;

      const syncOrientationClass = () => {
        if (shipEl.dataset.orientation === 'vertical')
          shipEl.classList.add('vertical');
        else shipEl.classList.remove('vertical');
      };
      syncOrientationClass();

      // Toggle orientation on click
      shipEl.addEventListener('click', (e) => {
        e.preventDefault();
        shipEl.dataset.orientation =
          shipEl.dataset.orientation === 'vertical' ? 'horizontal' : 'vertical';
        syncOrientationClass();
      });

      shipEl.addEventListener('dragstart', (e) => {
        dragData = {
          length,
          orientation: shipEl.dataset.orientation,
          idx,
        };
        e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
        e.dataTransfer.effectAllowed = 'move';
        shipEl.classList.add('dragging');
      });

      shipEl.addEventListener('dragend', () => {
        shipEl.classList.remove('dragging');
        clearPreviews();
        dragData = null;
      });
    });
  };

  const resetPlayerForManualPlacement = () => {
    resetGrid(game.player1);
    if (typeof game.player1.gameboard?.reset === 'function') {
      game.player1.gameboard.reset();
    }
    if (fleetContainer) {
      fleetContainer.innerHTML = initialFleetMarkup;
    }
    battleStarted = false;
    setupFleetDragAndDrop();
  };

  // Enable manual placement initially
  resetPlayerForManualPlacement();

  document.addEventListener('click', (e) => {
    const id = e.target?.id;

    if (id === 'place-ships-btn') {
      // Random placement
      resetGrid(game.player1);
      if (typeof game.player1.gameboard?.reset === 'function') {
        game.player1.gameboard.reset();
      }
      game.player1.randomShipsPlacement();
      updateGrid(game.player1);
      if (fleetContainer) fleetContainer.innerHTML = '';
      battleStarted = false;
      startBattle();
    }

    if (id === 'rematch-btn') {
      game.resetGame();
      resetGrid(game.cpu);
      resetGrid(game.player1);

      game.cpu.randomShipsPlacement();
      updateGrid(game.cpu);

      listenersAttached = false;
      battleStarted = false;
      if (fleetContainer) {
        fleetContainer.innerHTML = initialFleetMarkup;
      }
      setupFleetDragAndDrop();
      messageBoard.placeShips();
    }
  });
}
