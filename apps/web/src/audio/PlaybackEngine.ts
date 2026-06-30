import type { SongState } from "@harmony-engine/core";
import { Transport } from "./Transport";

/**
 * PlaybackEngine is now transport-driven.
 * Converts SongState → scheduled audio using a clock system.
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
  private transport: Transport;
  private scheduled = new Set<string>();

  constructor(transport: Transport) {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.transport = transport;

    const tick = () => {
      if (this.transport.getState().isPlaying) {
        this.process();
      }
      requestAnimationFrame(tick);
    };

    tick();
  }

  private process() {
    // placeholder for real-time scheduling window
  }

  play(state: SongState) {
    const now = this.ctx.currentTime;

    Object.values(state.notes).forEach((note: any) => {
      const key = note.id;
      if (this.scheduled.has(key)) return;
      this.scheduled.add(key);

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.frequency.value = pitchToFreq(note.pitch);
      osc.type = "sine";

      const startTime = now + this.transport.beatsToSeconds(
        note.onset.measure * 4 + note.onset.beat
      );

      const duration = this.transport.beatsToSeconds(note.duration.beats);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }
}
