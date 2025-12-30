export class MessageBoard {
  constructor() {}

  welcome() {
    return 'Battleship 1.0.0 by 8b';
  }

  placeShips(){
    return 'Place your ships on the board'
  }

  miss(player) {
    return `${player.name} missed!`;
  }

  accurate(player) {
    return `${player.name} hit the opponents ship!`;
  }

  sunk(player, ship) {
    return `${player.name} sunk the opponents ${ship.type}!`;
  }

  allSunk(player) {
    return `${player.name} sunk the entire opponents fleet!`;
  }
}
