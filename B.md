(function () {
  'use strict';

  const SC = window.SC;

  class Game {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.time = 0;
      this.states = new SC.StateMachine(SC.STATES.SPLASH);
      this.player = new SC.Player();
      this.score = 0;
      this.highScore = 0;
      this.bullets = [];
    }

    resetRun() {
      this.score = 0;
      this.bullets = [];
      this.player.reset();
    }

    startRun() {
      this.resetRun();
      this.states.startGame();
    }

    spawnBullet(x, y, angle) {
      this.bullets.push(new SC.Bullet(x, y, angle));
    }

    update(dt) {
      this.time += dt;

      if (SC.input.just.pause) {
        this.states.togglePause();
      }

      if (this.states.is(SC.STATES.SPLASH)) {
        if (SC.input.just.shoot || SC.input.just.start) this.startRun();
        SC.input.consumeFrame();
        return;
      }

      if (this.states.is(SC.STATES.PAUSED)) {
        SC.input.consumeFrame();
        return;
      }

      if (this.states.is(SC.STATES.PLAYING)) {
        this.updatePlaying(dt);
      }

      SC.input.consumeFrame();
    }

    updatePlaying(dt) {
      this.score += dt * 100;
      this.player.update(dt, this);
      this.updateBullets(dt);
    }

    updateBullets(dt) {
      for (let i = this.bullets.length - 1; i >= 0; i--) {
        if (!this.bullets[i].update(dt)) this.bullets.splice(i, 1);
      }
    }
  }

  SC.Game = Game;
})();

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
    const canvas = document.getElementById('game');
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
(function () {
  'use strict';

  const SC = window.SC;

  SC.PLAYER_SPEED = 190;
  SC.PLAYER_RADIUS = 15;
  SC.BULLET_SPEED = 520;
  SC.BULLET_RADIUS = 3;

  SC.normalize = function normalize(x, y) {
    const len = Math.hypot(x, y);
    if (!len) return { x: 0, y: 0 };
    return { x: x / len, y: y / len };
  };

  class Player {
    constructor() {
      this.shape = [[0, -1], [0.82, 0.85], [0, 0.48], [-0.82, 0.85]];
      this.reset();
    }

    reset() {
      this.x = SC.W / 2;
      this.y = SC.H / 2;
      this.radius = SC.PLAYER_RADIUS;
      this.angle = 0;
      this.fireCooldown = 0;
      this.fireRate = 9;
      this.warpTimer = 0;
      this.warpCooldown = 0;
      this.warping = false;
    }

    update(dt, game) {
      this.updateAim();
      this.updateMovement(dt);
      this.updateWarp(dt);
      this.updateShooting(dt, game);
    }

    updateAim() {
      const mouse = SC.input.mouse;
      this.angle = Math.atan2(mouse.y - this.y, mouse.x - this.x);
    }

    updateMovement(dt) {
      const keys = SC.input.keys;
      let x = 0;
      let y = 0;

      if (keys.a || keys.arrowleft) x -= 1;
      if (keys.d || keys.arrowright) x += 1;
      if (keys.w || keys.arrowup) y -= 1;
      if (keys.s || keys.arrowdown) y += 1;

      const dir = SC.normalize(x, y);
      const speed = SC.PLAYER_SPEED * (this.warping ? 1.45 : 1);

      this.x = SC.clamp(this.x + dir.x * speed * dt, this.radius, SC.W - this.radius);
      this.y = SC.clamp(this.y + dir.y * speed * dt, this.radius, SC.H - this.radius);
    }

    updateWarp(dt) {
      if ((SC.input.mouse.right || SC.input.keys[' '] || SC.input.just.warp) && this.warpCooldown <= 0) {
        this.warpTimer = 0.36;
        this.warpCooldown = 0.95;
      }

      this.warpTimer = Math.max(0, this.warpTimer - dt);
      this.warpCooldown = Math.max(0, this.warpCooldown - dt);
      this.warping = this.warpTimer > 0;
    }

    updateShooting(dt, game) {
      this.fireCooldown = Math.max(0, this.fireCooldown - dt);
      if (!SC.input.mouse.left || this.fireCooldown > 0) return;

      const muzzleX = this.x + Math.cos(this.angle) * (this.radius + 5);
      const muzzleY = this.y + Math.sin(this.angle) * (this.radius + 5);
      game.spawnBullet(muzzleX, muzzleY, this.angle);
      this.fireCooldown = 1 / this.fireRate;
    }
  }

  class Bullet {
    constructor(x, y, angle) {
      this.x = x;
      this.y = y;
      this.angle = angle;
      this.vx = Math.cos(angle) * SC.BULLET_SPEED;
      this.vy = Math.sin(angle) * SC.BULLET_SPEED;
      this.radius = SC.BULLET_RADIUS;
      this.life = 1.25;
    }

    update(dt) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.life -= dt;
      return this.life > 0 && this.x > -20 && this.x < SC.W + 20 && this.y > -20 && this.y < SC.H + 20;
    }
  }

  SC.Player = Player;
  SC.Bullet = Bullet;
})();

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


