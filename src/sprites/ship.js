import { Sprite } from './sprite.js';

export class Ship extends Sprite {
  constructor() {
    super(2, 8, 8, '#18FF27', 4, 46);
    this.name = 'SSX';
    this.lives = 10;
    this.score = 0;
    this.isExploding = false;
    this.maxLives = 10;
    this.targetSpeed = 0;
    this.speed = 0;
    this.acceleration = 0.25;
    this.heading = 'north';
    this.updateShape();
  }

  addScore(points) {
    this.score += points;
  }

  updateShape() {
    this.segments = [];
    const isHorizontal = this.heading === 'east' || this.heading === 'west';
    const width = isHorizontal ? 8 : 2;
    const height = isHorizontal ? 2 : 8;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const segX = ((this.position.x + x) % 100 + 100) % 100;
        const segY = ((this.position.y + y) % 100 + 100) % 100;
        this.segments.push({ x: segX, y: segY });
      }
    }
  }

  setHeading(newHeading) {
    // Only allow heading changes when the ship is moving
    if (this.speed > 0 && this.heading !== newHeading) {
      this.heading = newHeading;
      this.updateShape();
    }
  }

  move() {
    if (this.lives <= 0) return;

    if (this.speed < this.targetSpeed) {
      this.speed = Math.min(this.speed + this.acceleration, this.targetSpeed);
    } else if (this.speed > this.targetSpeed) {
      this.speed = Math.max(this.speed - this.acceleration, this.targetSpeed);
    }

    // Ensure speed is exactly 0 when very close to 0
    if (Math.abs(this.speed) < 0.01) {
      this.speed = 0;
      return;
    }

    const cellsToMove = Math.ceil(this.speed);

    for (let i = 0; i < cellsToMove; i++) {
      switch (this.heading) {
        case 'north':
          this.position.y--;
          if (this.position.y < 0) this.position.y = 99;
          break;
        case 'east':
          this.position.x++;
          if (this.position.x > 99) this.position.x = 0;
          break;
        case 'south':
          this.position.y++;
          if (this.position.y > 99) this.position.y = 0;
          break;
        case 'west':
          this.position.x--;
          if (this.position.x < 0) this.position.x = 99;
          break;
      }
      this.updateShape();
    }
  }

  setSpeed(speed) {
    this.targetSpeed = Math.min(Math.max(0, speed), this.maxSpeed);
  }

  stop() {
    this.targetSpeed = 0;
  }

  explode() {
    if (!this.isExploding) {
      this.lives = 0;
      this.isExploding = true;
      this.color = '#1F1E1E';
      this.stop();
      return this.segments.map(segment => ({ x: segment.x, y: segment.y }));
    }
    return [];
  }
}