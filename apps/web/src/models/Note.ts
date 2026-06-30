export type NoteID = string;

/**
 * Harmony Engine Core Concept:
 * A Note is a GLOBAL TRUTH OBJECT.
 * It is not tied to MIDI ticks, piano roll grid systems, or instrument representation.
 * It exists as an abstract musical event in time-space.
 */
export interface Note {
  id: NoteID;

  /** Pitch is abstract (NOT MIDI). Future mappings decide interpretation. */
  pitch: number;

  /** Start time in beats (absolute timeline position). */
  startBeats: number;

  /** Duration in beats. */
  durationBeats: number;

  /** Normalized velocity 0..1 */
  velocity: number;

  /** Optional semantic tags for AI/harmony analysis */
  tags?: string[];

  /** Instrument-agnostic voice label */
  voice?: string;
}

/**
 * Design Principle:
 * Notes are immutable truth objects.
 * All transformations produce new instances.
 */
