(function () {
  'use strict';

  const SC = window.SC = window.SC || {};

  SC.W = 800;
  SC.H = 600;
  SC.GRID = 40;
  SC.COLS = Math.floor(SC.W / SC.GRID);
  SC.ROWS = Math.floor(SC.H / SC.GRID);

  SC.colors = {
    bg: '#040509',
    grid: 'rgba(72, 255, 206, 0.16)',
    gridStrong: 'rgba(72, 255, 206, 0.36)',
    cyan: '#48ffce',
    cyanDim: 'rgba(72, 255, 206, 0.38)',
    magenta: '#f952ff',
    yellow: '#fce980',
    red: '#ff3a4f',
    redDim: 'rgba(255, 58, 79, 0.36)',
    orange: '#ff9a3c',
    white: '#f8ffff',
    panel: 'rgba(0, 0, 0, 0.66)'
  };

  SC.clamp = function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  };

  SC.rand = function rand(max = 1, min = 0) {
    return Math.random() * (max - min) + min;
  };

  SC.irand = function irand(max, min = 0) {
    return Math.floor(SC.rand(max + 1, min));
  };

  SC.cellKey = function cellKey(cx, cy) {
    return `${cx},${cy}`;
  };

  SC.cellCenter = function cellCenter(cx, cy) {
    return {
      x: cx * SC.GRID + SC.GRID / 2,
      y: cy * SC.GRID + SC.GRID / 2
    };
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

