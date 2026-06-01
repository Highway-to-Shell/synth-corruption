(function () {
  'use strict';

  const SC = window.SC;

  class Game {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.time = 0;
      this.state = 'splash';
    }

    update(dt) {
      this.time += dt;
    }
  }

  SC.Game = Game;
})();

