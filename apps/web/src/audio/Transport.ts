import type { SongState } from "@harmony-engine/core";

/**
 * Transport system = time controller for playback.
 * This is the missing piece that turns one-shot playback into a DAW.
 */

export type TransportState = {
  isPlaying: boolean;
  bpm: number;
  startTime: number;
  currentTime: number;
};

export class Transport {
  private state: TransportState;
  private listeners: (() => void)[] = [];

  constructor(bpm = 120) {
    this.state = {
      isPlaying: false,
      bpm,
      startTime: 0,
      currentTime: 0,
    };
  }

  subscribe(fn: () => void) {
    this.listeners.push(fn);
  }

  private emit() {
    this.listeners.forEach((l) => l());
  }

  play() {
    this.state.isPlaying = true;
    this.state.startTime = performance.now();
    this.emit();
  }

  stop() {
    this.state.isPlaying = false;
    this.state.currentTime = 0;
    this.emit();
  }

  pause() {
    this.state.isPlaying = false;
    this.emit();
  }

  setBpm(bpm: number) {
    this.state.bpm = bpm;
    this.emit();
  }

  getState() {
    return this.state;
  }

  /**
   * Converts musical time into seconds based on BPM.
   */
  beatsToSeconds(beats: number) {
    return (60 / this.state.bpm) * beats;
  }
}
