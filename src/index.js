import './modern-normalize.min.css';
import './style.css';

import { Game } from './engine/gameplay';
import { setListeners } from './ui/eventListeners';
import { resetGrid, updateGrid } from './ui/renderBoard';

const game = new Game();
const player1 = game.player1;
const cpu = game.cpu;

resetGrid(player1);
resetGrid(cpu);

player1.randomShipsPlacement();
cpu.randomShipsPlacement();

updateGrid(player1);
updateGrid(cpu);

setListeners(game);
