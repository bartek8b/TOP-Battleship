export class Ship {
  constructor(length, vertical = false) {
    if (length < 1 || length > 4) {
      throw new Error('Ship length must be between 1 & 4');
    }
    this.length = length;
    this.vertical = vertical;
    this.hitsReceived = 0;
  }

  hit() {
    if (this.hitsReceived < this.length) {
      this.hitsReceived++;
    }
  }

  isSunk() {
    return this.hitsReceived >= this.length;
  }
}
