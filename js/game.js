(function () {
  'use strict';

  const SC = window.SC;

  const triggerPlan = [
    { score: 450, run: game => game.showBanner('DESTROY RED CORES', 1.6) },
    { score: 950, run: game => game.queueCore('seed', 5, 4, 0.6) },
    { score: 2100, run: game => { game.wave = 2; game.showBanner('WAVE 2', 1.5); game.queueCore('seed', 14, 10, 0.6); } },
    { score: 3600, run: game => game.queueCore('nest', 10, 7, 0.6) },
    { score: 5600, run: game => { game.wave = 3; game.showBanner('WAVE 3', 1.5); game.queueCore('nest', 4, 11, 0.6); } }
  ];

  class Game {
    constructor(visibleCanvas, bufferCanvas) {
      this.canvas = visibleCanvas;
      this.ctx = visibleCanvas.getContext('2d');
      this.bufferCanvas = bufferCanvas || document.createElement('canvas');
      this.bufferCanvas.width = SC.W;
      this.bufferCanvas.height = SC.H;
      this.bufferCtx = this.bufferCanvas.getContext('2d');
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
      this.enemyBullets = [];
      this.enemies = [];
      this.cores = [];
      this.spawns = [];
      this.corruption = new Map();
      this.particles = [];
      this.camera = { x: 0, y: 0 };
      this.glitch = 0;
      this.enemyTimer = 1.2;
      this.coreTimer = 8;
      this.spawnLevel = 1;
      this.slowFrames = 0;
      this.lowQuality = false;
      this.triggers = triggerPlan.map(trigger => ({ ...trigger, done: false }));
      this.player.reset();
      this.snapCamera();
    }

    showBanner(text, seconds = 1.6) {
      this.banner = text;
      this.bannerTimer = seconds;
      this.glitch = Math.max(this.glitch, 0.35);
    }

    startRun() {
      this.resetRun();
      this.states.startGame();
      this.showBanner('SURVIVE', 1.2);
    }

    endRun() {
      if (!this.states.is(SC.STATES.PLAYING)) return;
      this.saveHighScore();
      this.states.endGame();
      this.glitch = Math.max(this.glitch, 1.1);
      SC.effects.burst(this, this.player.x, this.player.y, SC.colors.cyan, 42);
    }

    spawnBullet(x, y, angle) {
      if (this.bullets.length >= 96) this.bullets.shift();
      this.bullets.push(new SC.Bullet(x, y, angle));
    }

    spawnEnemyBullet(x, y, angle) {
      if (this.enemyBullets.length >= 64) return;
      this.enemyBullets.push(new SC.EnemyBullet(x, y, angle));
    }

    spawnEnemy() {
      if (this.enemies.length >= 38) return;
      this.enemies.push(SC.createEnemyAtEdge(this, this.spawnLevel));
    }

    spawnEnemyNear(x, y, level = this.spawnLevel, type = null) {
      if (this.enemies.length >= 38) return;
      const angle = SC.rand(Math.PI * 2);
      const distance = SC.rand(88, 42);
      this.enemies.push(new SC.Enemy(
        SC.clamp(x + Math.cos(angle) * distance, 20, SC.WORLD_W - 20),
        SC.clamp(y + Math.sin(angle) * distance, 20, SC.WORLD_H - 20),
        level,
        type
      ));
    }

    queueCore(kind = 'seed', cx = null, cy = null, delay = 0.75) {
      if (this.cores.length + this.spawns.length >= 3) return;
      const cellX = cx ?? SC.irand(SC.COLS - 3, 2);
      const cellY = cy ?? SC.irand(SC.ROWS - 3, 2);
      this.spawns.push(new SC.SpawnEffect(kind, cellX, cellY, delay));
      this.glitch = Math.max(this.glitch, 0.75);
      this.showBanner('CORE INCOMING', 1.2);
    }

    isPlayerOnCorruption() {
      const cx = Math.floor(this.player.x / SC.GRID);
      const cy = Math.floor(this.player.y / SC.GRID);
      return this.corruption.has(SC.cellKey(cx, cy));
    }

    update(dt) {
      if (dt > 0.045) this.slowFrames++;
      else this.slowFrames = Math.max(0, this.slowFrames - 1);
      this.lowQuality = this.slowFrames > 20;

      this.time += dt;
      this.glitch = Math.max(0, this.glitch - dt * 0.7);
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
      this.updateEnemyBullets(worldDt);
      this.updateEnemies(worldDt);
      this.updateSpawns(worldDt);
      this.updateCores(worldDt);
      this.updateTriggers();
      this.updatePressure(worldDt);
      SC.effects.updateParticles(this, dt);
      this.trimCollections();
      this.handleCollisions();
      this.updateCamera();
    }

    snapCamera() {
      const target = this.cameraTarget();
      this.camera.x = target.x;
      this.camera.y = target.y;
    }

    cameraTarget() {
      return {
        x: SC.WORLD_W <= SC.W ? (SC.W - SC.WORLD_W) / 2 : SC.clamp(SC.W / 2 - this.player.x, SC.W - SC.WORLD_W, 0),
        y: SC.WORLD_H <= SC.H ? (SC.H - SC.WORLD_H) / 2 : SC.clamp(SC.H / 2 - this.player.y, SC.H - SC.WORLD_H, 0)
      };
    }

    updateCamera() {
      const target = this.cameraTarget();
      this.camera.x += (target.x - this.camera.x) * 0.18;
      this.camera.y += (target.y - this.camera.y) * 0.18;
    }

    updateTriggers() {
      for (const trigger of this.triggers) {
        if (!trigger.done && this.score >= trigger.score) {
          trigger.done = true;
          trigger.run(this);
        }
      }
    }

    updateBullets(dt) {
      for (let i = this.bullets.length - 1; i >= 0; i--) {
        if (!this.bullets[i].update(dt)) this.bullets.splice(i, 1);
      }
    }

    updateEnemyBullets(dt) {
      for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
        if (!this.enemyBullets[i].update(dt)) this.enemyBullets.splice(i, 1);
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
      if (this.enemyTimer <= 0 && this.enemies.length < 32) {
        this.spawnEnemy();
        this.enemyTimer = Math.max(0.42, 1.22 - this.wave * 0.12);
      }

      if (this.score < 1800) return;
      this.coreTimer -= dt;
      if (this.coreTimer <= 0) {
        this.queueCore(this.wave >= 2 ? 'nest' : 'seed');
        this.coreTimer = Math.max(7.5, 13 - this.wave * 1.4);
      }
    }

    trimCollections() {
      if (this.bullets.length > 96) this.bullets.splice(0, this.bullets.length - 96);
      if (this.enemyBullets.length > 64) this.enemyBullets.splice(0, this.enemyBullets.length - 64);
      if (this.enemies.length > 38) this.enemies.splice(0, this.enemies.length - 38);
      if (this.particles.length > 140) this.particles.splice(0, this.particles.length - 140);
    }

    handleCollisions() {
      for (const enemy of this.enemies) {
        if (Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y) < this.player.radius + enemy.radius * 0.8) {
          this.endRun();
          return;
        }
      }

      for (const shot of this.enemyBullets) {
        if (Math.hypot(this.player.x - shot.x, this.player.y - shot.y) < this.player.radius + shot.radius) {
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

