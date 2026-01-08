import { UI_DURATIONS } from './uiConfig.js';

export class MessageBoard {
  constructor(containerElement = null, showDelay = 500) {
    this.container = containerElement;
    this.showDelay = showDelay;
    this._showTimer = null;
    this._hideTimer = null;
  }

  _getContainer() {
    if (!this.container) {
      this.container = document.getElementById('info-container');
    }
    return this.container;
  }

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

  // Show immediately and optionally auto-hide after duration (ms)
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

    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.remove('blocked');
    }
  }

  // Show after configured delay (useful for welcome/placeShips)
  _delayedShow(html, duration = null) {
    this._clearTimers();
    this._showTimer = setTimeout(
      () => this.show(html, duration),
      this.showDelay,
    );
  }

  // Public convenience methods — show immediately (no extra delay)
  welcome() {
    this.hide();
    this._delayedShow('Battleship 1.0.0 by 8b', UI_DURATIONS.start);
  }

  placeShips() {
    this.hide();
    this._delayedShow(
      `Place your ships on the board (change orientation by clicking on the ship) <br> or use button: <button id="place-ships-btn">Random</button>`,
      UI_DURATIONS.placeShips,
    );
  }

  miss(player) {
    this.show(`${player.name} missed!`, UI_DURATIONS.miss);
  }

  accurate(player) {
    this.show(`${player.name} hit the opponent's ship!`, UI_DURATIONS.hit);
  }

  sunk(player, ship) {
    this.show(
      `${player.name} sunk the opponent's ${ship.type}!`,
      UI_DURATIONS.sunk,
    );
  }

  allSunk(player) {
    this.show(
      `${player.name} sunk the entire opponent's fleet! <button id="rematch-btn">Rematch</button>`,
      UI_DURATIONS.gameOver,
    );
  }

  error(text) {
    this.show(`Error: ${text}`, UI_DURATIONS.error);
  }
}
