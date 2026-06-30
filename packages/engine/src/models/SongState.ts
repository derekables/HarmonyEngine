import { Note } from "./Note";
import { Track } from "./Track";
import { TimePosition } from "./TimePosition";

export type TempoEvent = {
  position: TimePosition;
  bpm: number;
};

export type TimeSignatureEvent = {
  position: TimePosition;
  numerator: number;
  denominator: number;
};

export type SongState = {
  id: string;

  notes: Record<string, Note>;
  tracks: Record<string, Track>;

  timeline: {
    tempoMap: TempoEvent[];
    timeSignatureMap: TimeSignatureEvent[];
  };

  globalState?: {
    version: number;
  };
};
