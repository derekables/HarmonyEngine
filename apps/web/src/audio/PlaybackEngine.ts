import type { SongState } from "@harmony-engine/core";
import { Transport } from "./Transport";

/**
 * PlaybackEngine is transport + clip aware.
 * Clips now define what regions are allowed to sound.
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

function noteStartBeats(note: any): number {
  return note.onset.measure * 4 + note.onset.beat;
}

export class PlaybackEngine {
  private ctx: AudioContext;
  private transport: Transport;
  private scheduled = new Set<string>();

  constructor(transport: Transport) {
    this.transport = transport;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    const tick = () => {
      if (this.transport.getState().isPlaying) {
        this.process();
      }
      requestAnimationFrame(tick);
    };

    tick();
  }

  private isNoteInClip(note: any, clips: any[]): boolean {
    if (!clips || clips.length === 0) return true;

    const noteBeat = noteStartBeats(note);

    return clips.some((clip) => {
      const clipStart = clip.start.measure * 4 + clip.start.beat;
      const clipEnd = clipStart + clip.lengthBeats;

      if (clip.noteIds && clip.noteIds.length > 0) {
        return clip.noteIds.includes(note.id);
      }

      return noteBeat >= clipStart && noteBeat < clipEnd;
    });
  }

  private process() {
    const state = (window as any).__ENGINE_STATE__;
    if (!state) return;

    const now = this.ctx.currentTime;
    const transportState = this.transport.getState();

    const beatDuration = 60 / transportState.bpm;

    const currentBeat =
      ((performance.now() - transportState.startTime) / 1000) *
      (transportState.bpm / 60);

    const lookaheadBeats = 0.25 / beatDuration;
    const windowEnd = currentBeat + lookaheadBeats;

    const clips = (state as any).clips || [];

    Object.values(state.notes).forEach((note: any) => {
      const noteKey = note.id;

      const noteBeat = noteStartBeats(note);

      if (!this.isNoteInClip(note, clips)) return;

      if (noteBeat < currentBeat || noteBeat > windowEnd) return;

      if (this.scheduled.has(noteKey)) return;
      this.scheduled.add(noteKey);

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.frequency.value = pitchToFreq(note.pitch);
      osc.type = "sine";

      const startTime =
        now + (noteBeat - currentBeat) * beatDuration;

      const duration = this.transport.beatsToSeconds(note.duration.beats);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        startTime + duration
      );

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }

  play(_state: SongState) {
    // legacy no-op (real-time engine drives playback)
  }
}
