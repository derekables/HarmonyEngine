export type Note = {
  id: string;

  pitch: Pitch;
  onset: TimePosition;
  duration: Duration;
  velocity: number;

  articulation?: Articulation;
};

// Imported types will be defined in their own files
export type Pitch = any;
export type TimePosition = any;
export type Duration = any;

export type Articulation =
  | "none"
  | "staccato"
  | "legato"
  | "slide"
  | "bend"
  | "hammer_on"
  | "pull_off";
