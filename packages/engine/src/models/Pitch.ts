export type Step = "C" | "D" | "E" | "F" | "G" | "A" | "B";

export type Accidental = "sharp" | "flat" | "natural";

export type Pitch = {
  step: Step;
  accidental?: Accidental;
  octave: number;
};

/**
 * Optional helper for future numeric conversion (e.g. MIDI-free frequency mapping).
 * Kept pure and optional to avoid locking into MIDI assumptions.
 */
export const pitchToString = (p: Pitch): string => {
  return `${p.step}${p.accidental ?? ""}${p.octave}`;
};
