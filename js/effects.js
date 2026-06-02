(function () {
  'use strict';

  const SC = window.SC;

  SC.effects = {
    burst(game, x, y, color, count = 16) {
      const maxParticles = game.lowQuality ? 90 : 140;
      const room = Math.max(0, maxParticles - game.particles.length);
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
    },

    postProcess(buffer, targetCtx, game) {
      const W = SC.W;
      const H = SC.H;
      const low = !!game.lowQuality;
      const intensity = Math.min(1.4, 0.08 + (game.cores?.length || 0) * 0.08 + (game.player?.warping ? 0.28 : 0));

      targetCtx.save();
      targetCtx.clearRect(0, 0, W, H);
      targetCtx.drawImage(buffer, 0, 0);

      if (intensity > 0.05) {
        targetCtx.globalCompositeOperation = 'lighter';
        targetCtx.globalAlpha = 0.08 + intensity * 0.05;
        targetCtx.drawImage(buffer, -2 - intensity * 4, 0);
        targetCtx.globalAlpha = 0.07 + intensity * 0.04;
        targetCtx.drawImage(buffer, 2 + intensity * 3, 0);
        targetCtx.globalCompositeOperation = 'source-over';
      }

      const strips = low ? 2 : 2 + Math.floor(intensity * 4);
      for (let i = 0; i < strips; i++) {
        const y = Math.random() * H;
        const h = 2 + Math.random() * 12;
        const dx = (Math.random() - 0.5) * 34 * intensity;
        targetCtx.globalAlpha = 0.18 + Math.random() * 0.18;
        targetCtx.drawImage(buffer, 0, y, W, h, dx, y, W, h);
      }
      targetCtx.globalAlpha = 1;

      targetCtx.fillStyle = 'rgba(0,0,0,.18)';
      for (let y = 0; y < H; y += (low ? 6 : 4)) {
        targetCtx.fillRect(0, y, W, 1);
      }

      targetCtx.globalAlpha = 0.08 + intensity * 0.04;
      const noiseCount = low ? 16 : 26 + intensity * 30;
      for (let i = 0; i < noiseCount; i++) {
        targetCtx.fillStyle = i % 2 ? 'rgba(255,255,255,.8)' : 'rgba(72,255,206,.8)';
        targetCtx.fillRect(Math.random() * W, Math.random() * H, 1.5, 1.5);
      }
      targetCtx.globalAlpha = 1;

      const vignette = targetCtx.createRadialGradient(W / 2, H / 2, 120, W / 2, H / 2, 520);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(0.72, 'rgba(0,0,0,.18)');
      vignette.addColorStop(1, 'rgba(0,0,0,.76)');
      targetCtx.fillStyle = vignette;
      targetCtx.fillRect(0, 0, W, H);
      targetCtx.restore();
    }
  };
})();

