(function () {
  'use strict';

  const SC = window.SC;
  const FONT_STACK = '"Press Start 2P", Consolas, Monaco, monospace';

  SC.drawText = function drawText(ctx, text, x, y, size, color = SC.colors.white, align = 'center') {
    ctx.save();
    ctx.font = `${size}px ${FONT_STACK}`;
    ctx.textAlign = align;
    ctx.textBaseline = 'top';
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = Math.max(0, size * 0.18);
    ctx.fillText(String(text), x, y);
    ctx.restore();
  };
})();

