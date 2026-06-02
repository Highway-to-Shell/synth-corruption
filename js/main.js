(function () {
  'use strict';

  const SC = window.SC;
  const visibleCanvas = document.getElementById('c');
  const bufferCanvas = document.getElementById('g');
  const game = window.game = new SC.Game(visibleCanvas, bufferCanvas);

  let lastTime = 0;

  function frame(now) {
    if (!lastTime) lastTime = now;
    const dt = Math.min(0.1, (now - lastTime) / 1000);
    lastTime = now;

    game.update(dt);
    SC.render(game);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();

