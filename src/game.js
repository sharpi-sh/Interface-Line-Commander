import { Score } from './score.js';
import { UI } from './ui.js';
import { Grid } from './grid.js';
import { Ship } from './sprites/ship.js';
import { Submarine } from './sprites/submarine.js';
import { Missile, Mine, Torpedo } from './sprites/weapons.js';
import { CLI } from './cli.js';
import { CollisionDetector } from './collision-detector.js';
import { Explosion } from './effects/explosion.js';

export class Game {
  constructor() {
    this.score = new Score();
    this.ui = new UI(this);
    this.grid = new Grid(100, 100);
    this.cli = new CLI(this);
    this.collisionDetector = new CollisionDetector();
    this.resetGame();
    this.init();
  }

  init() {
    this.ui.createGrid(this.grid);
    this.startGameLoop();
  }

  resetGame() {
    this.ship = new Ship();
    this.submarine = new Submarine();
    this.missiles = [];
    this.mines = [];
    this.torpedoes = [];
    this.explosions = [];
    this.lastTick = 0;
    this.quarterSecond = 250;
    this.cli.commandHistory = [];
    this.ui.updateCommandHistory([]);
  }

  createExplosions(segments) {
    this.explosions.push(...segments.map(segment => new Explosion(segment.x, segment.y)));
  }

  fireMissile(side) {
    if (this.ship.lives <= 0) return;
    
    const { x, y } = this.getMissileStartPosition(side);
    this.missiles.push(new Missile(x, y, this.getMissileDirection(side)));
  }

  getMissileStartPosition(side) {
    const isHorizontal = this.ship.heading === 'east' || this.ship.heading === 'west';
    let x = this.ship.position.x;
    let y = this.ship.position.y;
    
    if (isHorizontal) {
      x = Math.floor(x + this.ship.width / 2);
      if (this.ship.heading === 'east') {
        y = side === 'port' ? y - 1 : y + this.ship.height;
      } else {
        y = side === 'port' ? y + this.ship.height : y - 1;
      }
    } else {
      y = Math.floor(y + this.ship.height / 2);
      if (this.ship.heading === 'north') {
        x = side === 'port' ? x - 1 : x + this.ship.width;
      } else {
        x = side === 'port' ? x + this.ship.width : x - 1;
      }
    }
    
    return {
      x: ((x % 100) + 100) % 100,
      y: ((y % 100) + 100) % 100
    };
  }

  getMissileDirection(side) {
    const directions = {
      east: { port: 'north', starboard: 'south' },
      west: { port: 'south', starboard: 'north' },
      north: { port: 'west', starboard: 'east' },
      south: { port: 'east', starboard: 'west' }
    };
    return directions[this.ship.heading][side];
  }

  dropMine() {
    if (this.ship.lives <= 0) return;
    
    // Calculate position behind the ship based on heading
    let x = this.ship.position.x;
    let y = this.ship.position.y;
    
    switch (this.ship.heading) {
      case 'north':
        y = ((y + this.ship.height + 2) % 100 + 100) % 100;
        x = ((x + (this.ship.width / 2) - 1) % 100 + 100) % 100;
        break;
      case 'south':
        y = ((y - 2) % 100 + 100) % 100;
        x = ((x + (this.ship.width / 2) - 1) % 100 + 100) % 100;
        break;
      case 'east':
        x = ((x - 2) % 100 + 100) % 100;
        y = ((y + (this.ship.height / 2) - 1) % 100 + 100) % 100;
        break;
      case 'west':
        x = ((x + this.ship.width + 2) % 100 + 100) % 100;
        y = ((y + (this.ship.height / 2) - 1) % 100 + 100) % 100;
        break;
    }
    
    this.mines.push(new Mine(x, y));
  }

  update(timestamp) {
    if (timestamp - this.lastTick < this.quarterSecond) return;
    
    this.lastTick = timestamp;

    this.handleExplosions();
    this.updateEntities();
    this.checkCollisions();
  }

  handleExplosions() {
    if (this.ship.lives <= 0 && !this.ship.isExploding) {
      this.createExplosions(this.ship.explode());
    }
    if (this.submarine.lives <= 0 && !this.submarine.isExploding) {
      this.createExplosions(this.submarine.explode());
    }
  }

  updateEntities() {
    if (this.ship.lives > 0) this.ship.move();
    if (this.submarine.lives > 0) {
      this.submarine.move();
      const torpedo = this.submarine.fireTorpedo();
      if (torpedo) this.torpedoes.push(torpedo);
    }
    
    this.explosions = this.explosions.filter(explosion => explosion.update());
  }

  checkCollisions() {
    // Update missiles and check for collisions
    this.missiles = this.missiles.filter(missile => {
      // First check if missile has hit grid boundaries
      if (missile.move()) {
        this.explosions.push(new Explosion(missile.position.x, missile.position.y));
        return false;
      }
      
      // Then check for collision with submarine
      if (this.submarine.lives > 0 && this.collisionDetector.checkCollision(missile, this.submarine)) {
        this.handleMissileHit(missile);
        return false;
      }
      
      return true;
    });

    // Update torpedoes and check for collisions
    this.torpedoes = this.torpedoes.filter(torpedo => {
      // First check if torpedo has hit grid boundaries
      if (torpedo.move()) {
        this.explosions.push(new Explosion(torpedo.position.x, torpedo.position.y));
        return false;
      }
      
      // Then check for collision with ship
      if (this.ship.lives > 0 && this.collisionDetector.checkCollision(torpedo, this.ship)) {
        this.handleTorpedoHit(torpedo);
        return false;
      }
      
      return true;
    });

    // Check mine collisions
    this.mines = this.mines.filter(mine => !this.handleMineCollisions(mine));
  }

  handleMineCollisions(mine) {
    let collision = false;
    
    if (this.submarine.lives > 0 && this.collisionDetector.checkCollision(mine, this.submarine)) {
      this.handleMineHit(mine, this.submarine);
      collision = true;
    }
    
    if (this.ship.lives > 0 && this.collisionDetector.checkCollision(mine, this.ship)) {
      this.handleMineHit(mine, this.ship);
      collision = true;
    }
    
    return collision;
  }

  handleMissileHit(missile) {
    this.submarine.lives = Math.max(0, this.submarine.lives - 3);
    this.ship.addScore(1);
    this.explosions.push(new Explosion(missile.position.x, missile.position.y));
  }

  handleTorpedoHit(torpedo) {
    this.ship.lives = Math.max(0, this.ship.lives - 6);
    this.explosions.push(new Explosion(torpedo.position.x, torpedo.position.y));
  }

  handleMineHit(mine, sprite) {
    const damage = sprite === this.ship ? 3 : 5;
    sprite.lives = Math.max(0, sprite.lives - damage);
    
    if (sprite.lives <= 0 && !sprite.isExploding) {
      this.createExplosions(sprite.explode());
    } else {
      this.explosions.push(new Explosion(mine.position.x, mine.position.y));
    }
    
    if (sprite === this.submarine) {
      this.ship.addScore(3);
    } else if (sprite.lives > 0) {
      sprite.maxSpeed = 2;
      sprite.setSpeed(Math.min(sprite.speed, sprite.maxSpeed));
    }
  }

  startGameLoop() {
    const gameLoop = (timestamp) => {
      this.update(timestamp);
      this.ui.render(this.ship, this.submarine, [...this.missiles, ...this.torpedoes], this.explosions, this.mines);
      requestAnimationFrame(gameLoop);
    };
    requestAnimationFrame(gameLoop);
  }
}