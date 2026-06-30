import type { Note } from "../models/Note";
import type { NoteScheduler } from "./NoteScheduler";

/**
 * AUDIO ENGINE (WEB AUDIO BINDING LAYER)
 * -------------------------------------
 * Connects NoteScheduler → WebAudio API
 *
 * This is the first layer where Harmony Engine becomes AUDIBLE.
 */

export interface AudioEngineOptions {
  volume?: number;
}

export class AudioEngine {
  private ctx: AudioContext;
  private volumeNode: GainNode;
  private started = false;

  constructor(options?: AudioEngineOptions) {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    this.volumeNode = this.ctx.createGain();
    this.volumeNode.gain.value = options?.volume ?? 0.5;
    this.volumeNode.connect(this.ctx.destination);
  }

  /**
   * Convert abstract pitch → frequency (A4=440 reference)
   * NOTE: This is a simplified mapping layer.
   */
  private pitchToFrequency(pitch: number): number {
    return 440 * Math.pow(2, (pitch - 69) / 12);
  }

  /**
   * Play a single Note using a simple oscillator synth
   */
  playNote(note: Note) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = this.pitchToFrequency(note.pitch);

    const now = this.ctx.currentTime;
    const startTime = now;
    const endTime = now + note.durationBeats * 0.5; // TEMP BPM scaling placeholder

    gain.gain.setValueAtTime(note.velocity, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, endTime);

    osc.connect(gain);
    gain.connect(this.volumeNode);

    osc.start(startTime);
    osc.stop(endTime);
  }

  /**
   * Bind scheduler → audio engine callback
   */
  bindScheduler(scheduler: NoteScheduler) {
    scheduler.setCallback((note) => {
      this.playNote(note);
    });
  }

  /**
   * Resume audio context (required by browsers)
   */
  async start() {
    if (!this.started) {
      await this.ctx.resume();
      this.started = true;
    }
  }
}
