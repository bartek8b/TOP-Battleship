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

  const hideFleetContainer = () => {
    if (fleetContainer) fleetContainer.classList.add('fleet-hidden');
  };
  const showFleetContainer = () => {
    if (fleetContainer) fleetContainer.classList.remove('fleet-hidden');
  };

  // Hide fleet until placeShips prompt appears
  hideFleetContainer();

  // Show welcome first
  messageBoard.welcome();

  // Schedule placeShips after welcome finishes
  const smallGap = 200;
  const welcomeDelay =
    (messageBoard.showDelay || 0) + (UI_DURATIONS.start || 0) + smallGap;
  setTimeout(() => {
    messageBoard.placeShips();
    showFleetContainer();
  }, welcomeDelay);

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

    // Remove previous DnD handlers to avoid duplicate placement on rematch
    if (grid._dndHandlers) {
      const { dragover, dragleave, drop } = grid._dndHandlers;
      grid.removeEventListener('dragover', dragover);
      grid.removeEventListener('dragleave', dragleave);
      grid.removeEventListener('drop', drop);
    }

    // Clear any old preview classes
    const clearPreviews = () => {
      grid
        .querySelectorAll('.cell.preview-ok, .cell.preview-bad')
        .forEach((cell) => cell.classList.remove('preview-ok', 'preview-bad'));
    };

    let dragData = null;

    const previewPlacement = (row, col, length, vertical) => {
      clearPreviews();
      if (row < 0 || col < 0) return;

      // Detect out-of-bounds segments
      let outOfBounds = false;
      for (let i = 0; i < length; i++) {
        const r = vertical ? row + i : row;
        const c = vertical ? col : col + i;
        if (r < 0 || r > 9 || c < 0 || c > 9) {
          outOfBounds = true;
          break;
        }
      }

      const ship = new Ship(length, vertical);
      // canPlaceShip does not treat OOB as invalid, so combine with outOfBounds
      const canPlaceBase = game.player1.gameboard.canPlaceShip(ship, row, col);
      const canPlace = !outOfBounds && canPlaceBase;

      for (let i = 0; i < length; i++) {
        const r = vertical ? row + i : row;
        const c = vertical ? col : col + i;
        const cell = grid.querySelector(
          `.cell[data-x="${r}"][data-y="${c}"]`,
        );
        if (cell) cell.classList.add(canPlace ? 'preview-ok' : 'preview-bad');
      }

      // If any part is out of bounds, mark the anchor cell as bad
      if (outOfBounds) {
        const anchorCell = grid.querySelector(
          `.cell[data-x="${row}"][data-y="${col}"]`,
        );
        if (anchorCell) anchorCell.classList.add('preview-bad');
      }
    };

    const onAllShipsPlaced = () => {
      if (fleetContainer.querySelectorAll('.ship').length === 0) {
        startBattle();
      }
    };

    const handleDragover = (e) => {
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
    };

    const handleDragleave = (e) => {
      // Clear previews when leaving the grid entirely
      if (!grid.contains(e.relatedTarget)) clearPreviews();
    };

    const handleDrop = (e) => {
      e.preventDefault();
      const cell = e.target.closest('.cell');
      if (!cell) {
        dragData = null;
        clearPreviews();
        return;
      }

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
    };

    grid.addEventListener('dragover', handleDragover);
    grid.addEventListener('dragleave', handleDragleave);
    grid.addEventListener('drop', handleDrop);
    grid._dndHandlers = {
      dragover: handleDragover,
      dragleave: handleDragleave,
      drop: handleDrop,
    };

    // Make each fleet ship draggable and rotatable
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

  // Enable manual placement initially (hidden until placeShips is shown)
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
      hideFleetContainer();
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
      showFleetContainer();
    }
  });
}