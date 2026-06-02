(function () {
  'use strict';

  const SC = window.SC;

  function clear(ctx) {
    ctx.fillStyle = SC.colors.bg;
    ctx.fillRect(0, 0, SC.W, SC.H);
  }

  function drawGrid(ctx, time) {
    ctx.save();
    ctx.strokeStyle = SC.colors.grid;
    ctx.lineWidth = 1;
    for (let x = 0; x <= SC.W; x += SC.GRID) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, SC.H);
      ctx.stroke();
    }
    for (let y = 0; y <= SC.H; y += SC.GRID) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(SC.W, y + 0.5);
      ctx.stroke();
    }
    ctx.strokeStyle = SC.colors.gridStrong;
    ctx.beginPath();
    ctx.moveTo(0, SC.H / 2 + Math.sin(time * 2) * 3);
    ctx.lineTo(SC.W, SC.H / 2 + Math.sin(time * 2) * 3);
    ctx.stroke();
    ctx.restore();
  }

  function drawCorruption(ctx, game) {
    ctx.save();
    for (const cell of game.corruption.values()) {
      const x = cell.cx * SC.GRID;
      const y = cell.cy * SC.GRID;
      const pulse = 0.24 + Math.sin(game.time * 5 + cell.cx + cell.cy) * 0.04;
      ctx.fillStyle = `rgba(255, 58, 79, ${pulse})`;
      ctx.fillRect(x, y, SC.GRID, SC.GRID);
      ctx.strokeStyle = 'rgba(255, 58, 79, 0.58)';
      ctx.strokeRect(x + 0.5, y + 0.5, SC.GRID - 1, SC.GRID - 1);
    }
    ctx.restore();
  }

  function drawSpawns(ctx, game) {
    for (const spawn of game.spawns) {
      const q = spawn.time / spawn.delay;
      ctx.save();
      ctx.translate(spawn.x, spawn.y);
      ctx.rotate(game.time * 4);
      ctx.globalAlpha = 0.25 + q * 0.75;
      ctx.strokeStyle = SC.colors.red;
      ctx.shadowColor = SC.colors.red;
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2;
      const size = 30 + q * 48;
      ctx.strokeRect(-size / 2, -size / 2, size, size);
      ctx.restore();
    }
  }

  function drawCores(ctx, game) {
    for (const core of game.cores) {
      ctx.save();
      ctx.translate(core.x, core.y);
      ctx.rotate(core.angle);
      ctx.strokeStyle = core.flash > 0 ? SC.colors.white : core.def.color;
      ctx.shadowColor = core.def.color;
      ctx.shadowBlur = 16;
      ctx.lineWidth = core.flash > 0 ? 3 : 2;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3;
        const r = core.radius * (i % 2 ? 0.78 : 1);
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.rotate(-core.angle);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,255,255,.32)';
      ctx.beginPath();
      ctx.arc(0, 0, core.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = SC.colors.white;
      ctx.beginPath();
      ctx.arc(0, 0, core.radius + 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (core.hp / core.maxHp));
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawSplash(ctx, game) {
    drawGrid(ctx, game.time);
    SC.drawText(ctx, 'SYNTH CORRUPTION', SC.W / 2, 205, 34, SC.colors.cyan);
    SC.drawText(ctx, 'DESTROY RED CORES', SC.W / 2, 278, 14, SC.colors.red);
    SC.drawText(ctx, 'DODGE ENEMIES AND HOSTILE PROJECTILES', SC.W / 2, 328, 10, SC.colors.yellow);
    SC.drawText(ctx, 'CLICK OR PRESS ENTER', SC.W / 2, 395, 13, SC.colors.white);
  }

  function drawHud(ctx, game) {
    SC.drawText(ctx, `SCORE ${Math.floor(game.score)}`, 24, 18, 12, SC.colors.cyan, 'left');
    SC.drawText(ctx, `BEST ${Math.floor(game.highScore)}`, SC.W - 24, 18, 12, SC.colors.magenta, 'right');
    SC.drawText(ctx, `WAVE ${game.wave || game.spawnLevel}`, SC.W / 2, 18, 12, SC.colors.white);
    SC.drawText(ctx, `CORES ${game.cores.length}`, 24, 46, 10, SC.colors.red, 'left');
    SC.drawText(ctx, `CORRUPTION ${game.corruption.size}`, SC.W - 24, 46, 10, SC.colors.red, 'right');
    if (game.bannerTimer > 0) {
      SC.drawText(ctx, game.banner, SC.W / 2, 548, 13, SC.colors.yellow);
    }
  }

  function drawOverlay(ctx, title, subtitle, color) {
    ctx.save();
    ctx.fillStyle = SC.colors.panel;
    ctx.fillRect(0, 0, SC.W, SC.H);
    SC.drawText(ctx, title, SC.W / 2, 235, 28, color);
    SC.drawText(ctx, subtitle, SC.W / 2, 315, 12, SC.colors.white);
    ctx.restore();
  }

  function drawPlayer(ctx, player) {
    for (const ghost of player.trail || []) {
      const alpha = Math.max(0, ghost.life / ghost.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha * 0.34;
      ctx.translate(ghost.x, ghost.y);
      ctx.rotate(ghost.angle + Math.PI / 2);
      ctx.strokeStyle = SC.colors.cyan;
      ctx.shadowColor = SC.colors.cyan;
      ctx.shadowBlur = 14;
      ctx.lineWidth = 2;
      SC.drawPolygon(ctx, player.shape, player.radius);
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle + Math.PI / 2);
    ctx.strokeStyle = SC.colors.cyan;
    ctx.shadowColor = SC.colors.cyan;
    ctx.shadowBlur = player.warping ? 20 : 10;
    ctx.lineWidth = 2;
    SC.drawPolygon(ctx, player.shape, player.radius);
    ctx.stroke();
    if (player.warping) {
      ctx.globalAlpha = 0.42;
      ctx.scale(1.35, 1.35);
      ctx.strokeStyle = SC.colors.white;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawBullets(ctx, bullets) {
    ctx.save();
    ctx.fillStyle = SC.colors.yellow;
    ctx.shadowColor = SC.colors.yellow;
    ctx.shadowBlur = 8;
    for (const bullet of bullets) {
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawEnemyBullets(ctx, bullets) {
    ctx.save();
    ctx.fillStyle = SC.colors.red;
    ctx.shadowColor = SC.colors.red;
    ctx.shadowBlur = 10;
    for (const bullet of bullets) {
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawEnemies(ctx, enemies) {
    for (const enemy of enemies) {
      ctx.save();
      ctx.translate(enemy.x, enemy.y);
      ctx.rotate(enemy.angle);
      ctx.strokeStyle = enemy.flash > 0 ? SC.colors.white : enemy.color;
      ctx.shadowColor = enemy.color;
      ctx.shadowBlur = enemy.flash > 0 ? 16 : 8;
      ctx.lineWidth = enemy.flash > 0 ? 3 : 2;
      SC.drawPolygon(ctx, enemy.shape, enemy.radius);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawParticles(ctx, particles) {
    ctx.save();
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawCrosshair(ctx) {
    const input = SC.input;
    ctx.save();
    ctx.translate(input.mouse.x, input.mouse.y);
    ctx.strokeStyle = SC.colors.cyan;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-9, 0);
    ctx.lineTo(9, 0);
    ctx.moveTo(0, -9);
    ctx.lineTo(0, 9);
    ctx.stroke();
    ctx.restore();
  }

  function drawWorld(ctx, game) {
    drawGrid(ctx, game.time);
    drawCorruption(ctx, game);
    drawSpawns(ctx, game);
    drawCores(ctx, game);
    drawParticles(ctx, game.particles);
    drawBullets(ctx, game.bullets);
    drawEnemyBullets(ctx, game.enemyBullets || []);
    drawEnemies(ctx, game.enemies);
    drawPlayer(ctx, game.player);
    drawHud(ctx, game);
    drawCrosshair(ctx);
  }

  SC.render = function render(game) {
    const ctx = game.ctx;
    clear(ctx);

    if (game.states.is(SC.STATES.SPLASH)) {
      drawSplash(ctx, game);
      return;
    }

    drawWorld(ctx, game);

    if (game.states.is(SC.STATES.PAUSED)) {
      drawOverlay(ctx, 'PAUSED', 'PRESS ESC TO RESUME', SC.colors.yellow);
    } else if (game.states.is(SC.STATES.GAMEOVER)) {
      drawOverlay(ctx, 'SIGNAL LOST', 'CLICK OR PRESS ENTER TO RESTART', SC.colors.red);
    }
  };
})();

