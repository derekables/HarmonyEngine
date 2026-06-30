// Harmony Engine — Public API Entry Point
// This file defines the stable external surface of the engine.

export type { SongState, TempoEvent, TimeSignatureEvent } from "./models/SongState";
export type { Note, Pitch, TimePosition, Duration, Articulation } from "./models/Note";
export type { Track } from "./models/Track";

export type {
  Command,
  InsertNoteCommand,
  DeleteNoteCommand,
  ModifyNoteCommand,
} from "./commands/Command";

export { reduce } from "./runtime/reduce";
export { applyCommand } from "./runtime/applyCommand";
export { createHistory, apply, undo, redo } from "./runtime/history";

/**
 * Harmony Engine Public Contract:
 *
 * - All mutations happen via Commands
 * - State is deterministic and replayable
 * - No UI / Audio / MIDI dependencies
 *
 * This is the only import surface external systems should use.
 */
