import { BaseCommand } from "./Command";

export type DeleteNoteCommand = BaseCommand & {
  type: "delete_note";
  noteId: string;
};
