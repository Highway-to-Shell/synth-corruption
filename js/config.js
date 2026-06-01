(function () {
  'use strict';

  const SC = window.SC = window.SC || {};

  SC.W = 800;
  SC.H = 600;
  SC.GRID = 40;

  SC.colors = {
    bg: '#040509',
    grid: 'rgba(72, 255, 206, 0.16)',
    gridStrong: 'rgba(72, 255, 206, 0.36)',
    cyan: '#48ffce',
    magenta: '#f952ff',
    yellow: '#fce980',
    red: '#ff3a4f',
    white: '#f8ffff',
    panel: 'rgba(0, 0, 0, 0.66)'
  };

  SC.clamp = function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  };

  SC.drawPolygon = function drawPolygon(ctx, points, scale) {
    if (!points.length) return;
    ctx.beginPath();
    ctx.moveTo(points[0][0] * scale, points[0][1] * scale);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0] * scale, points[i][1] * scale);
    }
    ctx.closePath();
  };
})();
