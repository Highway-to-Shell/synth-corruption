(function () {
  'use strict';

  const SC = window.SC;

  SC.PLAYER_SPEED = 190;
  SC.PLAYER_RADIUS = 15;
  SC.BULLET_SPEED = 520;
  SC.BULLET_RADIUS = 3;
  SC.MAX_PLAYER_TRAIL = 14;

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
      this.fireRate = 9.5;
      this.warpTimer = 0;
      this.warpCooldown = 0;
      this.warping = false;
      this.trail = [];
      this.lastTrailX = this.x;
      this.lastTrailY = this.y;
    }

    update(dt, game) {
      this.updateAim();
      this.updateMovement(dt, game);
      this.updateTrail(dt);
      this.updateWarp(dt);
      this.updateShooting(dt, game);
    }

    updateAim() {
      const mouse = SC.input.mouse;
      this.angle = Math.atan2(mouse.y - this.y, mouse.x - this.x);
    }

    updateMovement(dt, game) {
      const keys = SC.input.keys;
      let x = 0;
      let y = 0;

      if (keys.a || keys.arrowleft) x -= 1;
      if (keys.d || keys.arrowright) x += 1;
      if (keys.w || keys.arrowup) y -= 1;
      if (keys.s || keys.arrowdown) y += 1;

      const dir = SC.normalize(x, y);
      const onCorruption = game.isPlayerOnCorruption?.() || false;
      const speed = SC.PLAYER_SPEED * (this.warping ? 1.45 : 1) * (onCorruption ? 0.62 : 1);
      const oldX = this.x;
      const oldY = this.y;

      this.x = SC.clamp(this.x + dir.x * speed * dt, this.radius, SC.W - this.radius);
      this.y = SC.clamp(this.y + dir.y * speed * dt, this.radius, SC.H - this.radius);

      const moved = Math.hypot(this.x - oldX, this.y - oldY) > 0.01;
      const spacing = this.warping ? 4 : 10;
      if (moved && Math.hypot(this.x - this.lastTrailX, this.y - this.lastTrailY) >= spacing) {
        const life = this.warping ? 0.34 : 0.22;
        this.trail.push({ x: oldX, y: oldY, angle: this.angle, life, maxLife: life });
        if (this.trail.length > SC.MAX_PLAYER_TRAIL) this.trail.shift();
        this.lastTrailX = this.x;
        this.lastTrailY = this.y;
      }
    }

    updateTrail(dt) {
      for (let i = this.trail.length - 1; i >= 0; i--) {
        this.trail[i].life -= dt;
        if (this.trail[i].life <= 0) this.trail.splice(i, 1);
      }
    }

    updateWarp(dt) {
      if ((SC.input.mouse.right || SC.input.keys[' '] || SC.input.just.warp) && this.warpCooldown <= 0) {
        this.warpTimer = 0.4;
        this.warpCooldown = 1.05;
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

