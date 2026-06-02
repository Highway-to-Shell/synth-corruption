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

  function drawSplash(ctx, game) {
    drawGrid(ctx, game.time);
    SC.drawText(ctx, 'SYNTH CORRUPTION', SC.W / 2, 210, 34, SC.colors.cyan);
    SC.drawText(ctx, 'SURVIVE THE BROKEN SIGNAL', SC.W / 2, 282, 13, SC.colors.magenta);
    SC.drawText(ctx, 'CLICK OR PRESS ENTER', SC.W / 2, 372, 13, SC.colors.yellow);
    SC.drawText(ctx, 'WASD / ARROWS MOVE   MOUSE AIM   LEFT CLICK FIRE', SC.W / 2, 424, 10, SC.colors.white);
  }

  function drawHud(ctx, game) {
    SC.drawText(ctx, `SCORE ${Math.floor(game.score)}`, 24, 18, 12, SC.colors.cyan, 'left');
    SC.drawText(ctx, `BEST ${Math.floor(game.highScore)}`, SC.W - 24, 18, 12, SC.colors.magenta, 'right');
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
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle + Math.PI / 2);
    ctx.strokeStyle = SC.colors.cyan;
    ctx.shadowColor = SC.colors.cyan;
    ctx.shadowBlur = player.warping ? 18 : 10;
    ctx.lineWidth = 2;
    SC.drawPolygon(ctx, player.shape, player.radius);
    ctx.stroke();
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
    drawBullets(ctx, game.bullets);
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

