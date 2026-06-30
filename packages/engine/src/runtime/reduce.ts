import { SongState } from "../models/SongState";
import { Command } from "../commands/Command";

/**
 * Pure reducer for Harmony Engine.
 *
 * RULES:
 * - MUST be pure
 * - MUST NOT mutate state
 * - MUST return new SongState
 */
export function reduce(state: SongState, command: Command): SongState {
  switch (command.type) {
    case "insert_note": {
      const note = command.note;

      return {
        ...state,
        notes: {
          ...state.notes,
          [note.id]: note,
        },
      };
    }

    case "delete_note": {
      const nextNotes = { ...state.notes };
      delete nextNotes[command.noteId];

      return {
        ...state,
        notes: nextNotes,
      };
    }

    case "modify_note": {
      const existing = state.notes[command.noteId];
      if (!existing) return state;

      const updated = {
        ...existing,
        ...command.changes,
      };

      return {
        ...state,
        notes: {
          ...state.notes,
          [command.noteId]: updated,
        },
      };
    }

    default:
      return state;
  }
}
