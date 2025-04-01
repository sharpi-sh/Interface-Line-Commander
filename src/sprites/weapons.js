import { Sprite } from './sprite.js';

export class Missile extends Sprite {
  constructor(x, y, direction) {
    super(1, 1, 16, '#FFA500', x, y);
    this.direction = direction;
    this.speed = 6;
  }

  move() {
    for (let i = 0; i < this.speed; i++) {
      switch (this.direction) {
        case 'north':
          this.position.y--;
          break;
        case 'south':
          this.position.y++;
          break;
        case 'east':
          this.position.x++;
          break;
        case 'west':
          this.position.x--;
          break;
      }

      // Check if missile has hit grid boundaries
      if (this.position.x < 0 || this.position.x >= 100 || 
          this.position.y < 0 || this.position.y >= 100) {
        return true;
      }
    }

    this.updateSegments();
    return false;
  }

  updateSegments() {
    this.segments = [{
      x: this.position.x,
      y: this.position.y
    }];
  }
}

export class Torpedo extends Sprite {
  constructor(x, y) {
    super(1, 6, 12, '#A5A5A5', x, y);
    this.speed = 4;
  }

  move() {
    for (let i = 0; i < this.speed; i++) {
      this.position.y++;
      if (this.position.y >= 100) {
        return true;
      }
    }

    this.updateSegments();
    return false;
  }

  updateSegments() {
    const now = Date.now();
    const flash1 = now % 500 < 250; // Slower flash rate (500ms period)
    const flash2 = (now + 250) % 500 < 250; // Second pattern offset by 250ms
    
    this.segments = [
      { x: this.position.x, y: this.position.y, color: flash2 ? '#000000' : '#563CCA' },     // Black/blue flashing
      { x: this.position.x, y: this.position.y + 1, color: flash2 ? '#000000' : '#563CCA' }, // Black/blue flashing
      { x: this.position.x, y: this.position.y + 2, color: flash1 ? '#FFFFFF' : '#563CCA' }, // White/blue flashing
      { x: this.position.x, y: this.position.y + 3, color: this.color },  // Gray
      { x: this.position.x, y: this.position.y + 4, color: this.color },  // Gray
      { x: this.position.x, y: this.position.y + 5, color: this.color }   // Gray
    ];
  }
}

export class Mine extends Sprite {
  constructor(x, y) {
    super(2, 2, 0, '#FFFFFF', x, y);
    this.updateSegments();
  }

  updateSegments() {
    this.segments = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const segX = ((this.position.x + x) % 100 + 100) % 100;
        const segY = ((this.position.y + y) % 100 + 100) % 100;
        this.segments.push({ x: segX, y: segY });
      }
    }
  }

  move() {
    return false;
  }
}