import { Note } from "../models/Note";
import { BaseCommand } from "./Command";

export type ModifyNoteCommand = BaseCommand & {
  type: "modify_note";
  noteId: string;
  changes: Partial<Note>;
};
