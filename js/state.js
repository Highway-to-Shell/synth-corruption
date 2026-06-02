(function () {
  'use strict';

  const SC = window.SC = window.SC || {};

  SC.STATES = Object.freeze({
    SPLASH: 'splash',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAMEOVER: 'gameover'
  });

  class StateMachine {
    constructor(initialState = SC.STATES.SPLASH) {
      this.current = initialState;
      this.previous = null;
    }

    is(state) {
      return this.current === state;
    }

    set(nextState) {
      if (!Object.values(SC.STATES).includes(nextState)) {
        throw new Error(`Unknown game state: ${nextState}`);
      }
      this.previous = this.current;
      this.current = nextState;
    }

    startGame() {
      this.set(SC.STATES.PLAYING);
    }

    endGame() {
      this.set(SC.STATES.GAMEOVER);
    }

    togglePause() {
      if (this.is(SC.STATES.PLAYING)) {
        this.set(SC.STATES.PAUSED);
      } else if (this.is(SC.STATES.PAUSED)) {
        this.set(SC.STATES.PLAYING);
      }
    }
  }

  SC.StateMachine = StateMachine;
})();

