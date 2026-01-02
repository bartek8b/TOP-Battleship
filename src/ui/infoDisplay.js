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

    // Block clicks globally while message is visible
    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.add('blocked');
    }

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

    // Remove global click block
    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.remove('blocked');
    }
  }

  // Show after configured delay (useful to allow hide animation before showing next message)
  _delayedShow(html, duration = null) {
    this._clearTimers();
    this._showTimer = setTimeout(
      () => this.show(html, duration),
      this.showDelay,
    );
  }

  // Public convenience methods
  welcome() {
    this.hide();
    this._delayedShow('Battleship 1.0.0 by 8b', 2000);
  }

  placeShips() {
    this.hide();
    this._delayedShow(
      `Place your ships on the board or use ${placeShipsBtn}`,
      3000,
    );
  }

  miss(player) {
    this.hide();
    this._delayedShow(`${player.name} missed!`, 1500);
  }

  accurate(player) {
    this.hide();
    this._delayedShow(`${player.name} hit the opponent's ship!`, 1500);
  }

  sunk(player, ship) {
    this.hide();
    this._delayedShow(`${player.name} sunk the opponent's ${ship.type}!`, 2200);
  }

  allSunk(player) {
    this.hide();
    this._delayedShow(
      `${player.name} sunk the entire opponent's fleet! ${rematchBtn}`,
      3500,
    );
  }
}

const placeShipsBtn = `<button id="place-ships-btn">Random</button>`;

const rematchBtn = `<button id="rematch-btn">Rematch</button>`;
