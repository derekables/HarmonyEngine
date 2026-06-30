export type TimePosition = {
  measure: number;
  beat: number;
};

/**
 * Pure helper for future musical math operations.
 * No tick-based assumptions are allowed in the engine.
 */
export const compareTimePosition = (
  a: TimePosition,
  b: TimePosition
): number => {
  if (a.measure !== b.measure) return a.measure - b.measure;
  return a.beat - b.beat;
};
