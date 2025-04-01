export class Score {
  constructor() {
    this.score = 0;
    this.lives = 3;
  }

  addScore(points) {
    this.score += points;
  }

  loseLife() {
    this.lives--;
    return this.lives <= 0;
  }

  reset() {
    this.score = 0;
    this.lives = 3;
  }
}