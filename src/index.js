import './modern-normalize.min.css';
import './style.css';

import { resetGrid, updateGrid } from './ui/renderBoard';
import { Game } from './engine/gameplay';
import { Ship } from './engine/ship';

const game = new Game();
const player1 = game.player1;
const cpu = game.cpu;

resetGrid(player1);
resetGrid(cpu);
player1.gameboard.placeShip(new Ship(4), 2, 0);
cpu.gameboard.placeShip(new Ship(4), 2, 0);
game.player1Move(2, 0);
updateGrid(cpu);
game.cpuMove();
updateGrid(player1);
game.player1Move(5, 4);
updateGrid(cpu);
game.cpuMove();
updateGrid(player1);
