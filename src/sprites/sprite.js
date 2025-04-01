export class Sprite {
  constructor(width, height, maxSpeed, color, startX, startY) {
    this.width = width;
    this.height = height;
    this.maxSpeed = maxSpeed;
    this.color = color;
    this.speed = 0;
    this.heading = 0;
    this.position = { x: startX, y: startY };
    this.segments = [];
    this.lives = 5;
    this.isExploding = false;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        this.segments.push({
          x: startX + x,
          y: startY + y
        });
      }
    }
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

  move() {
    if (this.isExploding) return;
    if (this.speed === 0) return;

    const cellsToMove = Math.ceil(this.speed);
    
    switch (this.heading) {
      case 0: // North
        for (let i = 0; i < cellsToMove; i++) {
          for (let j = 0; j < this.segments.length; j++) {
            this.segments[j].y--;
            if (this.segments[j].y < 0) {
              this.segments[j].y = 99;
            }
          }
        }
        break;
      case 90: // East
        for (let i = 0; i < cellsToMove; i++) {
          for (let j = 0; j < this.segments.length; j++) {
            this.segments[j].x++;
            if (this.segments[j].x > 99) {
              this.segments[j].x = 0;
            }
          }
        }
        break;
      case 180: // South
        for (let i = 0; i < cellsToMove; i++) {
          for (let j = 0; j < this.segments.length; j++) {
            this.segments[j].y++;
            if (this.segments[j].y > 99) {
              this.segments[j].y = 0;
            }
          }
        }
        break;
      case 270: // West
        for (let i = 0; i < cellsToMove; i++) {
          for (let j = 0; j < this.segments.length; j++) {
            this.segments[j].x--;
            if (this.segments[j].x < 0) {
              this.segments[j].x = 99;
            }
          }
        }
        break;
    }
    
    this.position.x = this.segments[0].x;
    this.position.y = this.segments[0].y;
  }

  setSpeed(speed) {
    this.speed = Math.min(Math.max(0, speed), this.maxSpeed);
  }

  stop() {
    this.speed = 0;
  }
}