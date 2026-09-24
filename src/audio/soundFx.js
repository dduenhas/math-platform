// Web Audio API Synthesizer - 100% self-contained, no external MP3 dependencies

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.activeOscillator = null;
    this.activeGain = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setEnabled(val) {
    this.enabled = !!val;
    if (!this.enabled && this.activeOscillator) {
      this.stopContinuousTone();
    }
  }

  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {
      // AudioContext might be blocked until user gesture
    }
  }

  playSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const now = this.ctx.currentTime + i * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.35);
      });
    } catch (e) {}
  }

  playLevelUp() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51]; // A major arpeggio
      notes.forEach((freq, i) => {
        const now = this.ctx.currentTime + i * 0.09;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.45);
      });
    } catch (e) {}
  }

  playWarp() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.18);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.3);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  playLaser() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(990, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.15);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  // Continuous Sine Wave Synthesizer (for Real-Time Audio Demo in Trig Lab)
  startContinuousTone(frequency = 440) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    if (this.activeOscillator) {
      this.updateContinuousTone(frequency);
      return;
    }

    try {
      const now = this.ctx.currentTime;
      this.activeOscillator = this.ctx.createOscillator();
      this.activeGain = this.ctx.createGain();

      this.activeOscillator.type = 'sine';
      this.activeOscillator.frequency.setValueAtTime(frequency, now);

      this.activeGain.gain.setValueAtTime(0.001, now);
      this.activeGain.gain.linearRampToValueAtTime(0.1, now + 0.05);

      this.activeOscillator.connect(this.activeGain);
      this.activeGain.connect(this.ctx.destination);

      this.activeOscillator.start(now);
    } catch (e) {}
  }

  updateContinuousTone(frequency = 440) {
    if (this.activeOscillator && this.ctx) {
      try {
        this.activeOscillator.frequency.setTargetAtTime(frequency, this.ctx.currentTime, 0.03);
      } catch (e) {}
    }
  }

  stopContinuousTone() {
    if (this.activeOscillator && this.ctx && this.activeGain) {
      try {
        const now = this.ctx.currentTime;
        this.activeGain.gain.linearRampToValueAtTime(0.0001, now + 0.05);
        setTimeout(() => {
          if (this.activeOscillator) {
            this.activeOscillator.stop();
            this.activeOscillator.disconnect();
            this.activeOscillator = null;
          }
        }, 60);
      } catch (e) {
        this.activeOscillator = null;
      }
    }
  }
}

export const soundFx = new SoundSystem();
