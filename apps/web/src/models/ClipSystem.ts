import type { SongState } from "@harmony-engine/core";
import type { Clip } from "./Clip";

/**
 * ClipSystem = logic layer for grouping / managing clips
 * on top of raw note-based SongState.
 */

export class ClipSystem {
  private state: SongState;

  constructor(state: SongState) {
    this.state = state;
  }

  /**
   * Create a clip from selected note IDs
   */
  createClip(noteIds: string[], startMeasure = 0, startBeat = 0): Clip {
    const clip: Clip = {
      id: `clip-${Date.now()}`,
      start: {
        measure: startMeasure,
        beat: startBeat,
      },
      lengthBeats: this.calculateLength(noteIds),
      noteIds,
      name: "New Clip",
      loop: false,
    };

    return clip;
  }

  /**
   * Calculate clip length from contained notes
   */
  private calculateLength(noteIds: string[]): number {
    const notes = noteIds
      .map((id) => (this.state.notes as any)[id])
      .filter(Boolean);

    let maxEnd = 0;

    for (const note of notes) {
      const start = note.onset.measure * 4 + note.onset.beat;
      const end = start + note.duration.beats;

      if (end > maxEnd) maxEnd = end;
    }

    return maxEnd;
  }

  /**
   * Future: move clip (all notes shift together)
   */
  moveClip(_clip: Clip, _newMeasure: number, _newBeat: number) {
    // placeholder for next phase
  }

  /**
   * Future: split clip at beat
   */
  splitClip(_clip: Clip, _beat: number) {
    // placeholder for DAW-style editing
  }
}
