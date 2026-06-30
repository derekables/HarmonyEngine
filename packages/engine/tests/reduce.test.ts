import { describe, it, expect } from "vitest";
import { reduce } from "../src/runtime/reduce";
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

describe("reduce()", () => {
  it("should insert a note into state", () => {
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

    const next = reduce(emptyState, command);

    expect(Object.keys(next.notes)).toHaveLength(1);
    expect(next.notes["n1"]).toBeDefined();
  });

  it("should delete a note", () => {
    const stateWithNote: SongState = {
      ...emptyState,
      notes: {
        n1: {
          id: "n1",
          pitch: { step: "C", octave: 4 },
          onset: { measure: 1, beat: 1 },
          duration: { beats: 1 },
          velocity: 100,
        },
      },
    };

    const command = {
      id: "cmd-2",
      type: "delete_note",
      timestamp: Date.now(),
      noteId: "n1",
    } as const;

    const next = reduce(stateWithNote, command);

    expect(next.notes["n1"]).toBeUndefined();
  });

  it("should modify a note immutably", () => {
    const stateWithNote: SongState = {
      ...emptyState,
      notes: {
        n1: {
          id: "n1",
          pitch: { step: "C", octave: 4 },
          onset: { measure: 1, beat: 1 },
          duration: { beats: 1 },
          velocity: 100,
        },
      },
    };

    const command = {
      id: "cmd-3",
      type: "modify_note",
      timestamp: Date.now(),
      noteId: "n1",
      changes: { velocity: 50 },
    } as const;

    const next = reduce(stateWithNote, command);

    expect(next.notes["n1"].velocity).toBe(50);
    expect(next.notes["n1"].velocity).not.toBe(100);
  });
});