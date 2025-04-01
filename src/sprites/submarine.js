import { Sprite } from './sprite.js';
import { Torpedo } from './weapons.js';

export class Submarine extends Sprite {
  constructor() {
    super(3, 7, 2, '#525252', 48, 10);
    this.heading = 180;
    this.lives = 10;
    this.maxLives = 10;
    this.speed = 1;
    this.targetSpeed = 1;
    this.lastTorpedoTime = 0;
    this.torpedoInterval = 10000; // 10 seconds
    this.updateShape();
  }

  updateShape() {
    this.segments = [];
    
    const pattern = [
      [1, 0, 1],
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0]
    ];

    for (let y = 0; y < pattern.length; y++) {
      for (let x = 0; x < pattern[y].length; x++) {
        if (pattern[y][x] === 1) {
          const segX = ((this.position.x + x) % 100 + 100) % 100;
          const segY = ((this.position.y + y) % 100 + 100) % 100;
          
          let segColor;
          if (this.lives <= 0) {
            segColor = '#1F1E1E';
          } else {
            segColor = (y === 1 && x === 1) ? '#FA442C' : this.color;
          }
          
          this.segments.push({ 
            x: segX, 
            y: segY,
            color: segColor
          });
        }
      }
    }
  }

  fireTorpedo() {
    if (this.lives <= 0) return null;
    const now = Date.now();
    if (now - this.lastTorpedoTime >= this.torpedoInterval) {
      this.lastTorpedoTime = now;
      return new Torpedo(this.position.x + 1, this.position.y + this.height);
    }
    return null;
  }

  move() {
    if (this.lives <= 0) return;

    // Move vertically down
    this.position.y++;
    
    // Wrap around to top when reaching bottom
    if (this.position.y >= 100) {
      this.position.y = 0;
    }
    
    this.updateShape();
  }

  explode() {
    if (!this.isExploding) {
      this.lives = 0;
      this.isExploding = true;
      this.color = '#1F1E1E';
      this.stop();
      this.updateShape();
      return this.segments.map(segment => ({ x: segment.x, y: segment.y }));
    }
    return [];
  }
}