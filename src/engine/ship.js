export class Ship {
  constructor(length, vertical = false) {
    if (length < 1 || length > 4) {
      throw new Error('Ship length must be between 1 & 4');
    }
    this.length = length;
    this.vertical = vertical;
    this.hitsReceived = 0;

    if (this.length === 4) this.type = '4-masted ship';
    else if (this.length === 3) this.type = '3-masted ship';
    else if (this.length === 2) this.type = '2-masted ship';
    else if (this.length === 1) this.type = '1-masted ship';
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
