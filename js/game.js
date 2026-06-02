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
      this.wave = 1;
      this.banner = '';
      this.bannerTimer = 0;
      this.bullets = [];
      this.enemies = [];
      this.enemyBullets = [];
      this.cores = [];
      this.spawns = [];
      this.corruption = new Map();
      this.particles = [];
      this.enemyTimer = 1.2;
      this.coreTimer = 2.8;
      this.spawnLevel = 1;
      this.player.reset();
    }

    showBanner(text, seconds = 1.6) {
      this.banner = text;
      this.bannerTimer = seconds;
    }

    startRun() {
      this.resetRun();
      this.states.startGame();
      this.showBanner('DESTROY RED CORES', 1.8);
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

    spawnEnemyNear(x, y, level = this.spawnLevel) {
      const angle = SC.rand(Math.PI * 2);
      const distance = SC.rand(80, 36);
      const enemy = new SC.Enemy(
        SC.clamp(x + Math.cos(angle) * distance, 20, SC.W - 20),
        SC.clamp(y + Math.sin(angle) * distance, 20, SC.H - 20),
        level
      );
      this.enemies.push(enemy);
    }

    queueCore(kind = 'seed', cx = null, cy = null, delay = 0.75) {
      const cellX = cx ?? SC.irand(SC.COLS - 3, 2);
      const cellY = cy ?? SC.irand(SC.ROWS - 3, 2);
      this.spawns.push(new SC.SpawnEffect(kind, cellX, cellY, delay));
      this.showBanner('CORE INCOMING', 1.2);
    }

    isPlayerOnCorruption() {
      const cx = Math.floor(this.player.x / SC.GRID);
      const cy = Math.floor(this.player.y / SC.GRID);
      return this.corruption.has(SC.cellKey(cx, cy));
    }

    update(dt) {
      this.time += dt;
      if (this.bannerTimer > 0) this.bannerTimer -= dt;

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
      this.updateCores(worldDt);
      this.updatePressure(worldDt);
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
      for (let i = this.spawns.length - 1; i >= 0; i--) {
        const spawn = this.spawns[i];
        spawn.update(dt, this);
        if (spawn.done) this.spawns.splice(i, 1);
      }
    }

    updateCores(dt) {
      for (let i = this.cores.length - 1; i >= 0; i--) {
        const core = this.cores[i];
        core.update(dt, this);
        if (core.dead) this.cores.splice(i, 1);
      }
    }

    updatePressure(dt) {
      this.enemyTimer -= dt;
      if (this.enemyTimer <= 0) {
        this.spawnEnemy();
        this.enemyTimer = Math.max(0.45, 1.25 - this.spawnLevel * 0.08);
      }

      this.coreTimer -= dt;
      if (this.coreTimer <= 0) {
        this.queueCore(this.spawnLevel >= 3 ? 'nest' : 'seed');
        this.coreTimer = Math.max(6, 10 - this.spawnLevel * 0.5);
      }
    }

    handleCollisions() {
      for (const enemy of this.enemies) {
        if (Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y) < this.player.radius + enemy.radius * 0.8) {
          this.endRun();
          return;
        }
      }

      for (const core of this.cores) {
        if (Math.hypot(this.player.x - core.x, this.player.y - core.y) < this.player.radius + core.radius * 0.8) {
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

        if (!hit) {
          for (const core of this.cores) {
            if (!core.dead && Math.hypot(bullet.x - core.x, bullet.y - core.y) < bullet.radius + core.radius) {
              core.hit(this);
              hit = true;
              break;
            }
          }
        }

        if (hit) this.bullets.splice(i, 1);
      }
    }
  }

  SC.Game = Game;
})();

