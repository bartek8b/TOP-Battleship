import { Ship } from '../engine/ship';

function resetGrid(player) {
  // Get board container for specified player
  const containerId =
    player.name === 'Player 1' ? 'plr-container' : 'cpu-container';
  const grid = document.querySelector(`#${containerId} .board-container`);
  grid.innerHTML = '';
  for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 10; y++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.x = x;
      cell.dataset.y = y;
      grid.appendChild(cell);
    }
  }
}

function updateGrid(player) {
  const arr = player.gameboard.grid;
  console.log(arr);
  const containerId =
    player.name === 'Player 1' ? 'plr-container' : 'cpu-container';
  const cells = document.querySelectorAll(
    `#${containerId} .board-container .cell`,
  );

  cells.forEach((cell) => {
    const x = Number(cell.dataset.x);
    const y = Number(cell.dataset.y);

    cell.className = 'cell'; // reset

    if (arr[x][y] === 'miss') {
      cell.classList.add('miss');
      cell.classList.add('inactive');
    } else if (arr[x][y] === 'hit') {
      // Add ship sunk svg
      cell.classList.add('hit');
      cell.classList.add('inactive');
    } else if (arr[x][y] instanceof Ship && player.name === 'Player 1') {
      // Show player 1's own ships on board
      // Add ship svg
      cell.classList.add('ship');
    }
  });
}

const shipSvg = ``;
const sunkShipSvg = ``;

export { resetGrid, updateGrid };
