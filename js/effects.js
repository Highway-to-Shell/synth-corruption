(function () {
  'use strict';

  const SC = window.SC;
  const crtCanvas = document.createElement('canvas');
  crtCanvas.width = SC.W;
  crtCanvas.height = SC.H;
  const crtCtx = crtCanvas.getContext('2d');

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
      const intensity = Math.min(
        1.6,
        0.16 +
        (game.glitch || 0) +
        (game.cores?.length || 0) * 0.1 +
        (game.enemyBullets?.length || 0) * 0.004 +
        (game.player?.warping ? 0.35 : 0)
      );

      targetCtx.save();
      targetCtx.clearRect(0, 0, W, H);
      targetCtx.imageSmoothingEnabled = true;

      crtCtx.save();
      crtCtx.clearRect(0, 0, W, H);
      crtCtx.imageSmoothingEnabled = true;
      const strip = low ? 10 : 5;
      for (let y = 0; y < H; y += strip) {
        const ny = (y + strip * 0.5 - H / 2) / (H / 2);
        const curve = ny * ny;
        const scaleX = 1 - 0.13 * curve;
        const scaleY = 1 + 0.03 * curve;
        const dx = (W - W * scaleX) / 2 + Math.sin(game.time * 7 + y * 0.018) * intensity * 1.4;
        const dy = H / 2 + (y - H / 2) * (1 + 0.04 * curve);
        crtCtx.drawImage(buffer, 0, y, W, strip, dx, dy, W * scaleX, strip * scaleY + 0.7);
      }
      crtCtx.restore();

      targetCtx.drawImage(crtCanvas, 0, 0);

      if (intensity > 0.05) {
        targetCtx.globalCompositeOperation = 'lighter';
        targetCtx.globalAlpha = 0.11 + intensity * 0.07;
        targetCtx.drawImage(crtCanvas, -2 - intensity * 7, 0);
        targetCtx.globalAlpha = 0.09 + intensity * 0.06;
        targetCtx.drawImage(crtCanvas, 2 + intensity * 5, 0);
        targetCtx.globalCompositeOperation = 'source-over';
      }

      const strips = low ? 2 : 3 + Math.floor(intensity * 7);
      for (let i = 0; i < strips; i++) {
        const y = Math.random() * H;
        const h = 2 + Math.random() * 16;
        const dx = (Math.random() - 0.5) * 76 * intensity;
        targetCtx.globalAlpha = 0.2 + Math.random() * 0.2;
        targetCtx.drawImage(crtCanvas, 0, y, W, h, dx, y, W, h);
      }
      targetCtx.globalAlpha = 1;

      targetCtx.fillStyle = 'rgba(0,0,0,.18)';
      for (let y = 0; y < H; y += (low ? 6 : 4)) {
        targetCtx.fillRect(0, y, W, 1);
      }

      targetCtx.fillStyle = 'rgba(255,255,255,.035)';
      for (let y = Math.floor(game.time * 45) % 4; y < H; y += (low ? 6 : 4)) {
        targetCtx.fillRect(0, y, W, 1);
      }

      targetCtx.globalAlpha = 0.1 + intensity * 0.08;
      const noiseCount = low ? 14 : 34 + intensity * 46;
      for (let i = 0; i < noiseCount; i++) {
        targetCtx.fillStyle = i % 2 ? 'rgba(255,255,255,.8)' : 'rgba(72,255,206,.8)';
        targetCtx.fillRect(Math.random() * W, Math.random() * H, 1 + Math.random() * 2, 1 + Math.random() * 2);
      }
      targetCtx.globalAlpha = 1;

      const vignette = targetCtx.createRadialGradient(W / 2, H / 2, 120, W / 2, H / 2, 520);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(0.72, 'rgba(0,0,0,.18)');
      vignette.addColorStop(1, 'rgba(0,0,0,.76)');
      targetCtx.fillStyle = vignette;
      targetCtx.fillRect(0, 0, W, H);

      targetCtx.globalAlpha = 0.62;
      targetCtx.strokeStyle = 'rgba(0,0,0,.95)';
      targetCtx.lineWidth = 30;
      targetCtx.strokeRect(12, 12, W - 24, H - 24);
      targetCtx.globalAlpha = 1;
      targetCtx.restore();
    }
  };
})();

