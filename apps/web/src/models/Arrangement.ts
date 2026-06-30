/**
 * Arrangement = top-level timeline structure of a song.
 *
 * This is the DAW-style representation of how clips are laid out in time.
 */

import type { Clip } from "./Clip";

export type ArrangementId = string;

export interface Track {
  id: string;
  name: string;
  clipIds: string[];
  muted?: boolean;
  solo?: boolean;
}

export interface Arrangement {
  id: ArrangementId;

  /** Ordered timeline of clips (global timeline) */
  clipIds: string[];

  /** Tracks group clips into lanes (Ableton-style structure) */
  tracks: Record<string, Track>;

  /** Clip definitions (flattened registry) */
  clips: Record<string, Clip>;

  /** Tempo override (future expansion for automation) */
  bpm?: number;
}

/**
 * Create a minimal empty arrangement
 */
export function createEmptyArrangement(): Arrangement {
  return {
    id: "arrangement-1",
    clipIds: [],
    tracks: {},
    clips: {},
    bpm: 120,
  };
}

/**
 * Add clip to arrangement
 */
export function addClipToArrangement(arr: Arrangement, clip: Clip, trackId?: string) {
  arr.clips[clip.id] = clip;
  arr.clipIds.push(clip.id);

  if (trackId) {
    if (!arr.tracks[trackId]) {
      arr.tracks[trackId] = {
        id: trackId,
        name: `Track ${trackId}`,
        clipIds: [],
      };
    }

    arr.tracks[trackId].clipIds.push(clip.id);
  }

  return arr;
}
