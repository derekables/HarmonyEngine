import { Note } from "../models/Note";

export type Command =
  | InsertNoteCommand
  | DeleteNoteCommand
  | ModifyNoteCommand;

export type BaseCommand = {
  id: string;
  type: string;
  timestamp: number;
};

export type InsertNoteCommand = BaseCommand & {
  type: "insert_note";
  note: Note;
};

export type DeleteNoteCommand = BaseCommand & {
  type: "delete_note";
  noteId: string;
};

export type ModifyNoteCommand = BaseCommand & {
  type: "modify_note";
  noteId: string;
  changes: Partial<Note>;
};
