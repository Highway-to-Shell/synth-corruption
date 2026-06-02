(function () {
  'use strict';

  const SC = window.SC;

  SC.ENEMY_RADIUS = 16;

  class Enemy {
    constructor(x, y, level = 1) {
      this.x = x;
      this.y = y;
      this.radius = SC.ENEMY_RADIUS;
      this.speed = Math.min(150, 78 + level * 7);
      this.hp = level >= 4 ? 2 : 1;
      this.dead = false;
      this.angle = 0;
      this.flash = 0;
      this.color = level >= 4 ? SC.colors.magenta : SC.colors.red;
      this.shape = [[1, 0], [-0.75, 0.68], [-0.45, 0], [-0.75, -0.68]];
    }

    update(dt, game) {
      this.flash = Math.max(0, this.flash - dt * 8);
      const dx = game.player.x - this.x;
      const dy = game.player.y - this.y;
      const dir = SC.normalize(dx, dy);

      this.angle = Math.atan2(dir.y, dir.x);
      this.x += dir.x * this.speed * dt;
      this.y += dir.y * this.speed * dt;
    }

    hit(game) {
      this.hp -= 1;
      this.flash = 1;
      SC.effects.burst(game, this.x, this.y, this.color, 7);
      if (this.hp <= 0) this.kill(game);
    }

    kill(game) {
      this.dead = true;
      game.score += 50;
      SC.effects.burst(game, this.x, this.y, this.color, 20);
    }
  }

  SC.createEnemyAtEdge = function createEnemyAtEdge(game, level = 1) {
    const side = Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;

    if (side === 0) {
      x = Math.random() * SC.W;
      y = -SC.ENEMY_RADIUS;
    } else if (side === 1) {
      x = SC.W + SC.ENEMY_RADIUS;
      y = Math.random() * SC.H;
    } else if (side === 2) {
      x = Math.random() * SC.W;
      y = SC.H + SC.ENEMY_RADIUS;
    } else {
      x = -SC.ENEMY_RADIUS;
      y = Math.random() * SC.H;
    }

    return new Enemy(x, y, level);
  };

  SC.Enemy = Enemy;
})();

