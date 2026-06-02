(function () {
  'use strict';

  const SC = window.SC;
  const FONT_STACK = '"Press Start 2P", Consolas, Monaco, monospace';

  SC.drawText = function drawText(ctx, text, x, y, size, color = SC.colors.white, alignOrOptions = 'center') {
    const options = typeof alignOrOptions === 'object' ? alignOrOptions : { align: alignOrOptions };
    const align = options.align || 'center';
    const value = String(text);
    let fontSize = size;

    ctx.save();
    ctx.textAlign = align;
    ctx.textBaseline = 'top';
    ctx.font = `${fontSize}px ${FONT_STACK}`;

    if (options.maxWidth) {
      while (fontSize > 7 && ctx.measureText(value).width > options.maxWidth) {
        fontSize -= 1;
        ctx.font = `${fontSize}px ${FONT_STACK}`;
      }
    }

    if (options.accentColor) {
      ctx.globalAlpha = options.accentAlpha ?? 0.62;
      ctx.fillStyle = options.accentColor;
      ctx.shadowColor = options.accentColor;
      ctx.shadowBlur = Math.max(0, fontSize * 0.15);
      ctx.fillText(value, x + (options.accentOffset ?? 2), y + (options.accentOffset ?? 2));
    }

    ctx.globalAlpha = options.alpha ?? 1;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = Math.max(0, fontSize * 0.18);
    ctx.fillText(value, x, y);
    ctx.restore();
  };
})();

