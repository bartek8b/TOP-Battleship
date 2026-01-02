export class MessageBoard {
  // containerElement: optional DOM element. showDelay: ms before showing after hide.
  constructor(containerElement = null, showDelay = 600) {
    this.container = containerElement;
    this.showDelay = showDelay;
    this._showTimer = null;
    this._hideTimer = null;
  }

  // Lazy-get the container (safe if module imported early)
  _getContainer() {
    if (!this.container) {
      this.container = document.getElementById('info-container');
    }
    return this.container;
  }

  // Clear pending timers
  _clearTimers() {
    if (this._showTimer) {
      clearTimeout(this._showTimer);
      this._showTimer = null;
    }
    if (this._hideTimer) {
      clearTimeout(this._hideTimer);
      this._hideTimer = null;
    }
  }

  // Immediately show HTML. If duration (ms) provided, auto-hide after duration.
  show(html, duration = null) {
    const container = this._getContainer();
    if (!container) return;

    this._clearTimers();
    container.innerHTML = html;
    container.classList.add('visible');

    if (typeof duration === 'number' && duration > 0) {
      this._hideTimer = setTimeout(() => {
        this.hide();
      }, duration);
    }
  }

  // Immediately hide (remove visible class). Does not clear content.
  hide() {
    const container = this._getContainer();
    if (!container) return;

    this._clearTimers();
    container.classList.remove('visible');
  }

  // Show after configured delay (useful to allow hide animation before showing next message)
  _delayedShow(html, duration = null) {
    this._clearTimers();
    this._showTimer = setTimeout(
      () => this.show(html, duration),
      this.showDelay,
    );
  }

  welcome() {
    this.hide();
    setTimeout(this.show('Battleship 1.0.0 by 8b'), 600);
  }

  placeShips() {
    this.hide();
    setTimeout(
      this.show(`Place your ships on the board or use ${placeShipsBtn}`),
      600,
    );
  }
  miss(player) {
    this.hide();
    setTimeout(this.show(`${player.name} missed!`), 600);
  }

  accurate(player) {
    this.hide();
    setTimeout(this.show(`${player.name} hit the opponents ship!`), 600);
  }

  sunk(player, ship) {
    this.hide();
    setTimeout(
      this.show(`${player.name} sunk the opponents ${ship.type}!`),
      600,
    );
  }

  allSunk(player) {
    this.hide();
    setTimeout(
      this.show(
        `${player.name} sunk the entire opponents fleet! ${rematchBtn}`,
      ),
      600,
    );
  }
}

const placeShipsBtn = `<button id="place-ships-btn">Random</button>`;

const rematchBtn = `<button id="rematch-btn">Rematch</button>`;
