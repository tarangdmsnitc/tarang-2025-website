document.addEventListener('DOMContentLoaded', function() {
  initParticleSystem();
  // Other initializations (navbar etc.) come here after!
});

function initParticleSystem() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 3 + 1;
      this.speedX = (Math.random() - 0.5) * 1;
      this.speedY = (Math.random() - 0.5) * 1;
      this.opacity = Math.random() * 0.8 + 0.2;
      this.pulseSpeed = Math.random() * 0.02 + 0.01;
      this.pulsePhase = Math.random() * Math.PI * 2;
      this.currentOpacity = this.opacity;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      // Wrap
      if(this.x > canvas.width) this.x = 0;
      if(this.x < 0) this.x = canvas.width;
      if(this.y > canvas.height) this.y = 0;
      if(this.y < 0) this.y = canvas.height;
      this.pulsePhase += this.pulseSpeed;
      this.currentOpacity = Math.max(0.1, this.opacity + Math.sin(this.pulsePhase) * 0.3);
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.currentOpacity;
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
      gradient.addColorStop(0, '#32b8c5');
      gradient.addColorStop(0.5, 'rgba(50,184,197,0.5)');
      gradient.addColorStop(1, 'rgba(50,184,197,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
      ctx.fill();
      // Core
      ctx.fillStyle = '#32b8c5';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Responsive # of particles!
  function getCount() {
    return Math.min(80, Math.floor(canvas.width * canvas.height / 12000));
  }

  let particles = [];
  function createParticles() {
    let n = getCount();
    particles = [];
    for(let i=0;i<n;i++) particles.push(new Particle());
  }
  createParticles();
  window.addEventListener('resize', createParticles);

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p=>{ p.update(); p.draw(); });
    // Connect nearby particles
    for(let i=0;i<particles.length;i++) {
      for(let j=i+1;j<particles.length;j++) {
        let a = particles[i], b = particles[j];
        let d = Math.sqrt((a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y));
        if(d < 120) {
          ctx.save();
          ctx.globalAlpha = (120-d)/120*0.3;
          ctx.strokeStyle = '#32b8c5';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
    requestAnimationFrame(animate);
  }

  animate();
}
