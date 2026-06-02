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

