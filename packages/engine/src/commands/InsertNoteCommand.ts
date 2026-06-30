import { Note } from "../models/Note";
import { BaseCommand } from "./Command";

export type InsertNoteCommand = BaseCommand & {
  type: "insert_note";
  note: Note;
};
