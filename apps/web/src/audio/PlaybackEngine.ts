import type { SongState } from "@harmony-engine/core";

/**
 * Very early WebAudio playback engine.
 * Converts SongState → simple oscillator tones.
 */

const NOTE_FREQUENCIES: Record<string, number> = {
  C: 261.63,
  D: 293.66,
  E: 329.63,
  F: 349.23,
  G: 392.0,
  A: 440.0,
  B: 493.88,
};

function pitchToFreq(pitch: any): number {
  const base = NOTE_FREQUENCIES[pitch.step] || 440;
  const octave = pitch.octave || 4;
  return base * Math.pow(2, octave - 4);
}

export class PlaybackEngine {
  private ctx: AudioContext;
  private isPlaying = false;

  constructor() {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  play(state: SongState) {
    if (this.isPlaying) return;
    this.isPlaying = true;

    const now = this.ctx.currentTime;

    Object.values(state.notes).forEach((note: any) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = pitchToFreq(note.pitch);

      osc.frequency.value = freq;
      osc.type = "sine";

      const startTime = now + (note.onset.measure * 2 + note.onset.beat * 0.5);
      const duration = note.duration.beats * 0.5;

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });

    setTimeout(() => {
      this.isPlaying = false;
    }, 5000);
  }
}
