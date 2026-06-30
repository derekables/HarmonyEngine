/**
 * Clip = a compositional container of notes.
 *
 * Instead of interacting with individual notes directly,
 * DAW systems operate on clips (regions of time).
 */

export type ClipId = string;

export interface Clip {
  id: ClipId;

  /** Start position in musical time */
  start: {
    measure: number;
    beat: number;
  };

  /** Length of clip in beats */
  lengthBeats: number;

  /** Notes contained in this clip (by reference) */
  noteIds: string[];

  /** Optional grouping metadata */
  name?: string;
  color?: string;

  /** Whether clip is loopable */
  loop?: boolean;
}

/**
 * Convert clip start → absolute beat position
 */
export function clipStartToBeats(clip: Clip): number {
  return clip.start.measure * 4 + clip.start.beat;
}

/**
 * Check if a beat is inside a clip range
 */
export function isBeatInClip(beat: number, clip: Clip): boolean {
  const start = clipStartToBeats(clip);
  return beat >= start && beat < start + clip.lengthBeats;
}