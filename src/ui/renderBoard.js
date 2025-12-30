export { resetGrid };

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
