import type { Note } from "../models/Note";

/**
 * NOTE SCHEDULER SYSTEM (CORE ENGINE LAYER)
 * ----------------------------------------
 * This system converts abstract NOTE truth objects into real-time scheduled events.
 *
 * It is NOT MIDI-based.
 * It is NOT tick-based.
 * It is BEAT-ABSOLUTE TIME driven.
 */

export type SchedulerCallback = (note: Note, time: number) => void;

export interface SchedulerOptions {
  /** beats per minute of the transport */
  bpm: number;

  /** lookahead window in seconds for scheduling future notes */
  lookaheadSeconds?: number;

  /** scheduling resolution (ms loop interval) */
  tickRateMs?: number;
}

function beatsToSeconds(beats: number, bpm: number) {
  return (60 / bpm) * beats;
}

function secondsToBeats(seconds: number, bpm: number) {
  return (seconds / 60) * bpm;
}

/**
 * The NoteScheduler is responsible for:
 * - converting beat time -> audio time
 * - pre-scheduling notes into a near-future execution queue
 * - ensuring timing stability under UI jitter
 */
export class NoteScheduler {
  private bpm: number;
  private lookaheadSeconds: number;
  private tickRateMs: number;

  private notes: Note[] = [];
  private callback?: SchedulerCallback;

  private interval?: any;
  private startTime: number = 0;
  private startBeat: number = 0;

  constructor(options: SchedulerOptions) {
    this.bpm = options.bpm;
    this.lookaheadSeconds = options.lookaheadSeconds ?? 0.25;
    this.tickRateMs = options.tickRateMs ?? 25;
  }

  /** Load or replace note buffer */
  setNotes(notes: Note[]) {
    this.notes = [...notes].sort((a, b) => a.startBeats - b.startBeats);
  }

  /** Attach playback callback */
  setCallback(cb: SchedulerCallback) {
    this.callback = cb;
  }

  /** Start scheduling engine */
  start() {
    this.startTime = performance.now() / 1000;
    this.startBeat = 0;

    this.interval = setInterval(() => this.tick(), this.tickRateMs);
  }

  /** Stop scheduler */
  stop() {
    if (this.interval) clearInterval(this.interval);
  }

  /** Current playback time in seconds */
  private getCurrentTimeSeconds() {
    return performance.now() / 1000 - this.startTime;
  }

  /** Convert real time -> beat position */
  private getCurrentBeat() {
    const seconds = this.getCurrentTimeSeconds();
    return this.startBeat + secondsToBeats(seconds, this.bpm);
  }

  /** Core scheduling loop */
  private tick() {
    if (!this.callback) return;

    const nowBeat = this.getCurrentBeat();
    const horizonBeats = nowBeat + secondsToBeats(this.lookaheadSeconds, this.bpm);

    for (const note of this.notes) {
      if (note.startBeats >= nowBeat && note.startBeats < horizonBeats) {
        const delaySeconds = beatsToSeconds(note.startBeats - nowBeat, this.bpm);

        setTimeout(() => {
          this.callback?.(note, performance.now());
        }, Math.max(0, delaySeconds * 1000));
      }
    }
  }
}
