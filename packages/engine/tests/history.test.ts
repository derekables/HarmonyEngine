import { describe, it, expect } from "vitest";
import { createHistory, apply, undo, redo } from "../src/runtime/history";
import { SongState } from "../src/models/SongState";
import { InsertNoteCommand } from "../src/commands/Command";

const emptyState: SongState = {
  id: "test-song",
  notes: {},
  tracks: {},
  timeline: {
    tempoMap: [],
    timeSignatureMap: [],
  },
};

describe("history system", () => {
  it("should apply commands and update state", () => {
    const history = createHistory(emptyState);

    const command: InsertNoteCommand = {
      id: "cmd-1",
      type: "insert_note",
      timestamp: Date.now(),
      note: {
        id: "n1",
        pitch: { step: "C", octave: 4 },
        onset: { measure: 1, beat: 1 },
        duration: { beats: 1 },
        velocity: 100,
      },
    };

    const result = apply(history, command);

    expect(result.state.notes["n1"]).toBeDefined();
  });

  it("should undo last command", () => {
    const history = createHistory(emptyState);

    const command: InsertNoteCommand = {
      id: "cmd-1",
      type: "insert_note",
      timestamp: Date.now(),
      note: {
        id: "n1",
        pitch: { step: "C", octave: 4 },
        onset: { measure: 1, beat: 1 },
        duration: { beats: 1 },
        velocity: 100,
      },
    };

    const applied = apply(history, command);
    const undone = undo(applied.history);

    expect(undone.state.notes["n1"]).toBeUndefined();
  });

  it("should redo command", () => {
    const history = createHistory(emptyState);

    const command: InsertNoteCommand = {
      id: "cmd-1",
      type: "insert_note",
      timestamp: Date.now(),
      note: {
        id: "n1",
        pitch: { step: "C", octave: 4 },
        onset: { measure: 1, beat: 1 },
        duration: { beats: 1 },
        velocity: 100,
      },
    };

    const applied = apply(history, command);
    const undone = undo(applied.history);
    const redone = redo(undone.history);

    expect(redone.state.notes["n1"]).toBeDefined();
  });
});