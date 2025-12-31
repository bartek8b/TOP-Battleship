import { resetGrid, updateGrid } from './renderBoard';
import { Game } from '../engine/gameplay';

export function test() {
  const game = new Game();
  const player1 = game.player1;
  const cpu = game.cpu;

  resetGrid(player1);
  resetGrid(cpu);

  player1.randomShipsPlacement();
  cpu.randomShipsPlacement();

  updateGrid(player1);
  updateGrid(cpu);

  game.player1Move(1, 0);
  updateGrid(cpu);

  game.cpuMove();
  updateGrid(player1);

  game.player1Move(5, 6);
  updateGrid(cpu);

  game.cpuMove();
  updateGrid(player1);

  game.player1Move(0, 9);
  updateGrid(cpu);

  game.cpuMove();
  updateGrid(player1);
}
