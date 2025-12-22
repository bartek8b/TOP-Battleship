export class Ship {
  constructor(length) {
    this.length = length;
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
