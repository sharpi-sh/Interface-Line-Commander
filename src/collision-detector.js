export class CollisionDetector {
  checkCollision(spriteA, spriteB) {
    // Create a map of all cells occupied by spriteB for faster lookup
    const spriteBCells = new Set();
    for (const segB of spriteB.segments) {
      const x = Math.floor(segB.x);
      const y = Math.floor(segB.y);
      spriteBCells.add(`${x},${y}`);
    }

    // Check if any segment of spriteA collides with spriteB's cells
    for (const segA of spriteA.segments) {
      const x = Math.floor(segA.x);
      const y = Math.floor(segA.y);
      
      // Check the current position and adjacent cells for more accurate collision
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const checkX = ((x + dx) % 100 + 100) % 100;
          const checkY = ((y + dy) % 100 + 100) % 100;
          if (spriteBCells.has(`${checkX},${checkY}`)) {
            return true;
          }
        }
      }
    }
    return false;
  }
}