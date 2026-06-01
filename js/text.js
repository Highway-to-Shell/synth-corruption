(function () {
  'use strict';

  const SC = window.SC;

  SC.drawText = function drawText(ctx, text, x, y, size, color = SC.colors.white, align = 'center') {
    ctx.save();
    ctx.font = `${size}px Consolas, Monaco, monospace`;
    ctx.textAlign = align;
    ctx.textBaseline = 'top';
    ctx.fillStyle = color;
    ctx.fillText(String(text), x, y);
    ctx.restore();
  };
})();

