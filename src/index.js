import './modern-normalize.min.css';
import './style.css';

import { resetGrid } from './ui/renderBoard';
import { Game } from './engine/gameplay';

const game = new Game();
const player1 = game.player1;
const cpu = game.cpu;

resetGrid(player1);
resetGrid(cpu);
