(function () {
  'use strict';

  const SC = window.SC;

  SC.effects = {
    burst(game, x, y, color, count = 16) {
      const room = Math.max(0, 140 - game.particles.length);
      const total = Math.min(count, room);
      for (let i = 0; i < total; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 45 + Math.random() * 135;
        game.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 1.4 + Math.random() * 2.2,
          color,
          life: 0.2 + Math.random() * 0.28,
          maxLife: 0.48
        });
      }
    },

    updateParticles(game, dt) {
      for (let i = game.particles.length - 1; i >= 0; i--) {
        const p = game.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= Math.pow(0.08, dt);
        p.vy *= Math.pow(0.08, dt);
        p.life -= dt;
        if (p.life <= 0) game.particles.splice(i, 1);
      }
    }
  };
})();

