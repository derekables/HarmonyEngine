export type TrackRole =
  | "melody"
  | "harmony"
  | "bass"
  | "rhythm"
  | "percussion"
  | "aux"
  | "custom";

export type TrackVisibility = "visible" | "hidden";

export type Track = {
  id: string;
  name?: string;

  role: TrackRole;
  visibility: TrackVisibility;

  /**
   * Tracks do NOT own notes.
   * They define semantic views over global Note state.
   */
  filter?: TrackFilter;
};

/**
 * Placeholder for future semantic filtering system.
 * Examples: pitch range, voice grouping, AI tagging, etc.
 */
export type TrackFilter = any;
