# ENGINE_SPEC.md — Harmony Engine Implementation Specification (v1)

## Overview
This document defines the implementable core of Harmony Engine. It translates the architectural model into concrete data structures, rules, and command behaviors suitable for direct implementation by Codex or any engineering system.

---

# 1. Core Design Principles (Non-Negotiable)

1. Music is represented as a **canonical, representation-agnostic model**.
2. Notes are **global truth objects** within a Song.
3. Time is **musical, not tick-based**.
4. Tracks are **semantic views, not containers**.
5. UI, notation, tab, and playback are all **projections of the same data**.
6. All mutations occur via **Commands (no direct state mutation)**.
7. Song state is fully derivable from **command history**.

---

# 2. Core Data Model

## 2.1 Song

```ts
Song {
  id: string
  metadata: SongMetadata
  timeline: Timeline
  tracks: Track[]
  versionHistory: VersionEntry[]
  globalState: GlobalState
}
```

---

## 2.2 Note (GLOBAL TRUTH OBJECT)

Notes exist globally in the Song and are NOT owned by Tracks.

```ts
Note {
  id: string

  pitch: Pitch
  onset: TimePosition
  duration: Duration
  velocity: number // 0.0 - 1.0

  articulation?: Articulation
  voice?: string
}
```

### Constraints
- Notes are immutable; edits create new instances via commands.
- Notes do not store instrument, tab, or notation data.
- Notes are referenced by Tracks via queries or filters.

---

## 2.3 Pitch

```ts
Pitch {
  step: "C" | "D" | "E" | "F" | "G" | "A" | "B"
  accidental?: "sharp" | "flat" | "natural"
  octave: number
}
```

---

## 2.4 TimePosition (Musical Time)

```ts
TimePosition {
  measure: number
  beat: number // fractional allowed
}
```

---

## 2.5 Duration

```ts
Duration {
  beats: number // fractional allowed
}
```

---

## 2.6 Track (Semantic View Layer)

Tracks do NOT own notes.

```ts
Track {
  id: string
  name?: string
  role: "melody" | "harmony" | "bass" | "rhythm" | "percussion" | "aux" | "custom"
  visibility: "visible" | "hidden"

  filter?: TrackFilter
}
```

### Track Behavior
- Tracks define **how notes are grouped or viewed**
- Tracks may filter notes by:
  - pitch range
  - voice
  - tagging
  - AI grouping
- Tracks do NOT store notes

---

## 2.7 Timeline

```ts
Timeline {
  tempoMap: TempoEvent[]
  timeSignatureMap: TimeSignatureEvent[]
}
```

---

## 2.8 Tempo

```ts
TempoEvent {
  position: TimePosition
  bpm: number
}
```

---

## 2.9 Time Signature

```ts
TimeSignatureEvent {
  position: TimePosition
  numerator: number
  denominator: number
}
```

---

# 3. Command System (CORE MUTATION MODEL)

All changes to Song state occur via commands.

## 3.1 Base Command

```ts
Command {
  id: string
  type: string
  timestamp: number
}
```

---

## 3.2 Example Commands

### Insert Note
```ts
InsertNoteCommand {
  type: "insert_note"
  note: Note
}
```

### Delete Note
```ts
DeleteNoteCommand {
  type: "delete_note"
  noteId: string
}
```

### Modify Note
```ts
ModifyNoteCommand {
  type: "modify_note"
  noteId: string
  changes: Partial<Note>
}
```

---

## 3.3 Command Rules

- Commands are **reversible** where possible
- Commands are stored in order
- Song state is derived from replaying commands

---

# 4. State Model

## 4.1 Song State is Derived

```ts
SongState = reduce(CommandHistory)
```

No direct persistence of final state is required.

---

# 5. Rendering System

Rendering is strictly read-only.

```ts
RendererInput = SongState
```

Renderers include:
- Tab View
- Notation View
- Piano Roll View
- Playback Engine

---

# 6. Views

Views are projections of the same Song.

Rules:
- Views do NOT mutate data directly
- Views emit Commands

---

# 7. Instrument Mapping (NON-CORE)

```ts
InstrumentMapping {
  trackId: string
  instrumentId: string
}
```

- Exists outside core musical truth
- Used only for playback/rendering

---

# 8. Persistence

Supported formats:
- Native Harmony JSON
- Future: MIDI export
- Future: MusicXML export

Persistence stores:
- Command history OR
- Snapshot + replay log

---

# 9. AI Integration Model

AI MUST NOT mutate state directly.

AI outputs:
- Command sequences only

---

# 10. Validation Rules

- No Track owns Notes
- No UI state exists in engine
- No tick-based timing allowed in core model
- All time is musical

---

# 11. Future Extensions (Reserved)

- Polytemporal layers
- Non-Western rhythmic systems
- Real-time collaboration
- Plugin-defined TrackRoles

---

# END OF SPEC
