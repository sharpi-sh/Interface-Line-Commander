export class Grid {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.cells = new Map();
  }

  getCell(x, y) {
    return this.cells.get(`${x},${y}`);
  }

  setCell(x, y, value) {
    this.cells.set(`${x},${y}`, value);
  }

  getCellCoordinates(x, y) {
    return {
      x: Math.floor(x / this.cellSize),
      y: Math.floor(y / this.cellSize)
    };
  }
}