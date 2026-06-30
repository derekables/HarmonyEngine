/**
 * Duration is expressed in musical beats.
 * No tick-based or MIDI timing assumptions are allowed.
 */
export type Duration = {
  beats: number;
};

/**
 * Pure helper for future duration math operations.
 * Must remain free of time-grid assumptions.
 */
export const addDurations = (a: Duration, b: Duration): Duration => {
  return { beats: a.beats + b.beats };
};
