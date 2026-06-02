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
      this.highScore = this.loadHighScore();
      this.resetRun();
    }

    loadHighScore() {
      try {
        return Number(localStorage.getItem('synth-corruption-high-score') || 0);
      } catch (_) {
        return 0;
      }
    }

    saveHighScore() {
      if (this.score <= this.highScore) return;
      this.highScore = Math.floor(this.score);
      try {
        localStorage.setItem('synth-corruption-high-score', String(this.highScore));
      } catch (_) {}
    }

    resetRun() {
      this.score = 0;
      this.bullets = [];
      this.enemies = [];
      this.particles = [];
      this.enemyTimer = 1.2;
      this.spawnLevel = 1;
      this.player.reset();
    }

    startRun() {
      this.resetRun();
      this.states.startGame();
    }

    endRun() {
      if (!this.states.is(SC.STATES.PLAYING)) return;
      this.saveHighScore();
      this.states.endGame();
      SC.effects.burst(this, this.player.x, this.player.y, SC.colors.cyan, 42);
    }

    spawnBullet(x, y, angle) {
      this.bullets.push(new SC.Bullet(x, y, angle));
    }

    spawnEnemy() {
      this.enemies.push(SC.createEnemyAtEdge(this, this.spawnLevel));
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

      if (this.states.is(SC.STATES.GAMEOVER)) {
        SC.effects.updateParticles(this, dt);
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
      const worldDt = dt * (this.player.warping ? 0.45 : 1);
      this.score += dt * 100;
      this.spawnLevel = 1 + Math.floor(this.score / 900);

      this.player.update(dt, this);
      this.updateBullets(dt);
      this.updateEnemies(worldDt);
      this.updateSpawns(worldDt);
      SC.effects.updateParticles(this, dt);
      this.handleCollisions();
    }

    updateBullets(dt) {
      for (let i = this.bullets.length - 1; i >= 0; i--) {
        if (!this.bullets[i].update(dt)) this.bullets.splice(i, 1);
      }
    }

    updateEnemies(dt) {
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const enemy = this.enemies[i];
        enemy.update(dt, this);
        if (enemy.dead) this.enemies.splice(i, 1);
      }
    }

    updateSpawns(dt) {
      this.enemyTimer -= dt;
      if (this.enemyTimer > 0) return;
      this.spawnEnemy();
      this.enemyTimer = Math.max(0.45, 1.25 - this.spawnLevel * 0.08);
    }

    handleCollisions() {
      for (const enemy of this.enemies) {
        if (Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y) < this.player.radius + enemy.radius * 0.8) {
          this.endRun();
          return;
        }
      }

      for (let i = this.bullets.length - 1; i >= 0; i--) {
        const bullet = this.bullets[i];
        let hit = false;

        for (const enemy of this.enemies) {
          if (!enemy.dead && Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y) < bullet.radius + enemy.radius) {
            enemy.hit(this);
            hit = true;
            break;
          }
        }

        if (hit) this.bullets.splice(i, 1);
      }
    }
  }

  SC.Game = Game;
})();

