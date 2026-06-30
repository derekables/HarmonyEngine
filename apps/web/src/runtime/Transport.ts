import type { NoteScheduler } from "./NoteScheduler";

/**
 * TRANSPORT SYNCHRONIZATION SYSTEM
 * --------------------------------
 * The Transport is the MASTER CLOCK of Harmony Engine.
 *
 * It defines:
 * - Play / Pause / Stop
 * - Global beat position
 * - Tempo (BPM)
 * - Synchronization source for Scheduler + UI
 */

export type TransportState = "stopped" | "playing" | "paused";

export interface TransportOptions {
  bpm: number;
}

export type TransportListener = (state: Transport) => void;

export class Transport {
  private state: TransportState = "stopped";
  private bpm: number;

  private startTimestamp = 0;
  private pausedAtBeat = 0;

  private listeners: Set<TransportListener> = new Set();

  constructor(options: TransportOptions) {
    this.bpm = options.bpm;
  }

  /** seconds → beats */
  private secondsToBeats(seconds: number): number {
    return (seconds / 60) * this.bpm;
  }

  /** beats → seconds */
  private beatsToSeconds(beats: number): number {
    return (60 / this.bpm) * beats;
  }

  /** current real-time beat position */
  getCurrentBeat(): number {
    if (this.state === "playing") {
      const now = performance.now() / 1000;
      const elapsed = now - this.startTimestamp;
      return this.pausedAtBeat + this.secondsToBeats(elapsed);
    }
    return this.pausedAtBeat;
  }

  getState(): TransportState {
    return this.state;
  }

  setBpm(bpm: number) {
    this.bpm = bpm;
    this.emit();
  }

  /** start playback */
  play() {
    if (this.state === "playing") return;

    this.state = "playing";
    this.startTimestamp = performance.now() / 1000;
    this.emit();
  }

  /** pause playback */
  pause() {
    if (this.state !== "playing") return;

    this.pausedAtBeat = this.getCurrentBeat();
    this.state = "paused";
    this.emit();
  }

  /** stop and reset */
  stop() {
    this.state = "stopped";
    this.pausedAtBeat = 0;
    this.emit();
  }

  /** seek to a beat position */
  seek(beat: number) {
    this.pausedAtBeat = beat;

    if (this.state === "playing") {
      this.startTimestamp = performance.now() / 1000;
    }

    this.emit();
  }

  /** subscribe UI / scheduler to changes */
  subscribe(listener: TransportListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    for (const l of this.listeners) {
      l(this);
    }
  }

  /**
   * Bind transport to scheduler
   * This ensures scheduler uses authoritative beat clock
   */
  bindScheduler(scheduler: NoteScheduler) {
    scheduler["startBeat"] = 0;
    scheduler["startTime"] = performance.now() / 1000;
  }
}
