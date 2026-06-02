(function () {
  'use strict';

  const SC = window.SC;

  const input = SC.input = {
    keys: Object.create(null),
    mouse: {
      x: SC.W / 2,
      y: SC.H / 2,
      left: false,
      right: false
    },
    just: {
      shoot: false,
      warp: false,
      pause: false,
      start: false
    },
    consumeFrame() {
      this.just.shoot = false;
      this.just.warp = false;
      this.just.pause = false;
      this.just.start = false;
    }
  };

  function updatePointer(event) {
    const canvas = document.getElementById('c');
    const rect = canvas.getBoundingClientRect();
    input.mouse.x = SC.clamp((event.clientX - rect.left) * SC.W / rect.width, 0, SC.W);
    input.mouse.y = SC.clamp((event.clientY - rect.top) * SC.H / rect.height, 0, SC.H);
  }

  window.addEventListener('pointermove', updatePointer);

  window.addEventListener('pointerdown', (event) => {
    updatePointer(event);
    if (event.button === 2) {
      input.mouse.right = true;
      input.just.warp = true;
    } else {
      input.mouse.left = true;
      input.just.shoot = true;
    }
    event.preventDefault();
  });

  window.addEventListener('pointerup', (event) => {
    updatePointer(event);
    if (event.button === 2) input.mouse.right = false;
    else input.mouse.left = false;
    event.preventDefault();
  });

  window.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });

  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    input.keys[key] = true;

    if (!event.repeat) {
      if (key === ' ') input.just.warp = true;
      if (key === 'escape') input.just.pause = true;
      if (key === 'enter') input.just.start = true;
    }

    if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright', ' ', 'escape'].includes(key)) {
      event.preventDefault();
    }
  });

  window.addEventListener('keyup', (event) => {
    input.keys[event.key.toLowerCase()] = false;
  });
})();

