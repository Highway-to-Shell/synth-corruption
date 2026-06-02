(function () {
  'use strict';

  const SC = window.SC;

  class Game {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.time = 0;
      this.states = new SC.StateMachine(SC.STATES.SPLASH);
      this.score = 0;
      this.highScore = 0;
    }

    update(dt) {
      this.time += dt;
    }
  }

  SC.Game = Game;
})();

