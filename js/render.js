(function () {
  'use strict';

  const SC = window.SC;

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

  SC.render = function render(game) {
    const ctx = game.ctx;
    ctx.fillStyle = SC.colors.bg;
    ctx.fillRect(0, 0, SC.W, SC.H);

    drawGrid(ctx, game.time);
    SC.drawText(ctx, 'SYNTH CORRUPTION', SC.W / 2, 230, 46, SC.colors.cyan);
    SC.drawText(ctx, 'CANVAS SHELL', SC.W / 2, 300, 18, SC.colors.magenta);
  };
})();

