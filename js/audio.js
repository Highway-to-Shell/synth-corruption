(function () {
  'use strict';

  const SC = window.SC;

  const audio = SC.audio = {
    ctx: null,
    master: null,
    enabled: true,

    init() {
      if (!this.enabled || this.ctx) return;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.07;
      this.master.connect(this.ctx.destination);
    },

    beep(freq = 240, duration = 0.06, type = 'square', gain = 1) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx || !this.master) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const amp = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq * 0.6), now + duration);
      amp.gain.setValueAtTime(0.0001, now);
      amp.gain.exponentialRampToValueAtTime(0.28 * gain, now + 0.006);
      amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(amp);
      amp.connect(this.master);
      osc.start(now);
      osc.stop(now + duration + 0.03);
    },

    fire() {
      this.beep(560 + Math.random() * 90, 0.045, 'square', 0.55);
    },

    dash() {
      this.beep(260, 0.16, 'sine', 0.8);
    }
  };

  window.addEventListener('pointerdown', () => audio.init(), { once: true });
  window.addEventListener('keydown', () => audio.init(), { once: true });
})();

