export class Explosion {
  constructor(x, y) {
    this.x = Math.floor(x);
    this.y = Math.floor(y);
    this.radius = 0;
    this.maxRadius = 4;
    this.segments = [];
    this.age = 0;
    this.maxAge = 12;
    this.colors = ['#FFA500', '#FFD700', '#FFFFFF']; // Orange, yellow, and white
    this.particles = [];
    this.createParticles();
    this.updateSegments();
  }

  createParticles() {
    // Create particles moving in all directions (full 360 degrees)
    for (let i = 0; i < 24; i++) {
      const angle = (Math.PI * 2 * i / 24) + (Math.random() - 0.5) * 0.5;
      const speed = 1 + Math.random() * 2;
      this.particles.push({
        x: this.x,
        y: this.y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        color: '#FFFFFF'
      });
    }
  }

  updateSegments() {
    this.segments = [];
    
    // Add ring segments in all directions
    for (let dx = -this.radius; dx <= this.radius; dx++) {
      for (let dy = -this.radius; dy <= this.radius; dy++) {
        // Create a ring shape by checking if the point is near the radius
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (Math.abs(distance - this.radius) <= 1) {
          const x = this.x + dx;
          const y = this.y + dy;
          
          // Don't wrap around edges
          if (x >= 0 && x < 100 && y >= 0 && y < 100) {
            this.segments.push({
              x: x,
              y: y,
              color: this.colors[Math.floor(Math.random() * (this.colors.length - 1))] // Don't include white in ring
            });
          }
        }
      }
    }

    // Add particle segments
    this.particles.forEach(particle => {
      // Update particle position
      particle.x += particle.dx;
      particle.y += particle.dy;
      
      // Only show particles within grid bounds (no wrapping)
      const x = Math.floor(particle.x);
      const y = Math.floor(particle.y);
      
      if (x >= 0 && x < 100 && y >= 0 && y < 100) {
        this.segments.push({
          x: x,
          y: y,
          color: particle.color
        });
      }
    });
  }

  update() {
    this.age++;
    if (this.age % 2 === 0 && this.radius < this.maxRadius) {
      this.radius++;
    }
    this.updateSegments();
    return this.age < this.maxAge;
  }
}