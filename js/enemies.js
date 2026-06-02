(function () {
  'use strict';

  const SC = window.SC;

  const enemyDefs = {
    chaser: {
      radius: 16,
      speed: 86,
      hp: 1,
      color: SC.colors.red,
      shape: [[1, 0], [-0.75, 0.68], [-0.45, 0], [-0.75, -0.68]]
    },
    fast: {
      radius: 12,
      speed: 148,
      hp: 1,
      color: SC.colors.orange,
      shape: [[1, 0], [-0.4, 0.65], [-1, 0], [-0.4, -0.65]]
    },
    tank: {
      radius: 22,
      speed: 62,
      hp: 3,
      color: SC.colors.magenta,
      shape: [[0, -1], [0.85, -0.35], [0.85, 0.35], [0, 1], [-0.85, 0.35], [-0.85, -0.35]]
    },
    shooter: {
      radius: 18,
      speed: 68,
      hp: 2,
      color: SC.colors.yellow,
      shape: [[1, 0], [0, 0.75], [-0.85, 0], [0, -0.75]]
    }
  };

  class Enemy {
    constructor(x, y, level = 1, type = 'chaser') {
      this.type = enemyDefs[type] ? type : 'chaser';
      const def = enemyDefs[this.type];
      this.x = x;
      this.y = y;
      this.radius = def.radius;
      this.speed = def.speed + Math.min(30, level * 3);
      this.hp = def.hp;
      this.dead = false;
      this.angle = 0;
      this.flash = 0;
      this.color = def.color;
      this.shape = def.shape;
      this.shootTimer = 0.9 + Math.random() * 0.8;
    }

    update(dt, game) {
      this.flash = Math.max(0, this.flash - dt * 8);
      const dx = game.player.x - this.x;
      const dy = game.player.y - this.y;
      const dir = SC.normalize(dx, dy);

      this.angle = Math.atan2(dir.y, dir.x);
      const distance = Math.hypot(dx, dy);
      const speedScale = this.type === 'shooter' && distance < 220 ? 0.25 : 1;
      this.x += dir.x * this.speed * speedScale * dt;
      this.y += dir.y * this.speed * speedScale * dt;

      if (this.type === 'shooter') {
        this.shootTimer -= dt;
        if (this.shootTimer <= 0 && distance < 420) {
          this.shootTimer = 1.35 + Math.random() * 0.55;
          game.spawnEnemyBullet(this.x, this.y, this.angle);
        }
      }
    }

    hit(game) {
      this.hp -= 1;
      this.flash = 1;
      SC.effects.burst(game, this.x, this.y, this.color, 7);
      if (this.hp <= 0) this.kill(game);
    }

    kill(game) {
      this.dead = true;
      game.score += this.type === 'tank' ? 90 : this.type === 'shooter' ? 80 : 50;
      SC.effects.burst(game, this.x, this.y, this.color, 20);
    }
  }

  class EnemyBullet {
    constructor(x, y, angle) {
      this.x = x;
      this.y = y;
      this.angle = angle;
      this.vx = Math.cos(angle) * 190;
      this.vy = Math.sin(angle) * 190;
      this.radius = 5;
      this.life = 3.8;
    }

    update(dt) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.life -= dt;
      return this.life > 0 && this.x > -40 && this.x < SC.W + 40 && this.y > -40 && this.y < SC.H + 40;
    }
  }

  function pickType(level) {
    if (level >= 6 && Math.random() < 0.28) return 'shooter';
    if (level >= 4 && Math.random() < 0.25) return 'tank';
    if (level >= 2 && Math.random() < 0.38) return 'fast';
    return 'chaser';
  }

  SC.createEnemyAtEdge = function createEnemyAtEdge(game, level = 1, type = null) {
    const side = Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;

    if (side === 0) {
      x = Math.random() * SC.W;
      y = -32;
    } else if (side === 1) {
      x = SC.W + 32;
      y = Math.random() * SC.H;
    } else if (side === 2) {
      x = Math.random() * SC.W;
      y = SC.H + 32;
    } else {
      x = -32;
      y = Math.random() * SC.H;
    }

    return new Enemy(x, y, level, type || pickType(level));
  };

  SC.enemyDefs = enemyDefs;
  SC.Enemy = Enemy;
  SC.EnemyBullet = EnemyBullet;
})();

