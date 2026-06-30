# Harmony Engine — Implementation Checklist (ENGINE_SPEC → Build Plan)

This document converts ENGINE_SPEC.md into a strict file-by-file implementation sequence for TypeScript.

---

# Phase 1 — Foundation (Types Layer)

## Step 1: Core Models
Create in `packages/engine/src/models/`

- [ ] Note.ts
  - id: string
  - pitch: Pitch
  - onset: TimePosition
  - duration: Duration
  - velocity: number
  - articulation?: Articulation

- [ ] Pitch.ts
  - step (C–B)
  - accidental
  - octave

- [ ] TimePosition.ts
  - measure
  - beat (fractional allowed)

- [ ] Duration.ts
  - beats (fractional allowed)

- [ ] Track.ts
  - id
  - role (semantic only)
  - visibility
  - filter (optional)

- [ ] SongState.ts
  - notes: Record<string, Note>
  - tracks: Record<string, Track>
  - timeline

---

# Phase 2 — Command System

## Step 2: Commands
Create in `packages/engine/src/commands/`

- [ ] Command.ts (base interface)
- [ ] InsertNoteCommand
- [ ] DeleteNoteCommand
- [ ] ModifyNoteCommand

Rules:
- Must be serializable
- Must be deterministic
- No side effects

---

# Phase 3 — Runtime Engine

## Step 3: Reducer Core
Create in `packages/engine/src/runtime/`

- [ ] reduce.ts
  - function reduce(state, command)
  - MUST be pure
  - MUST return new immutable state

- [ ] applyCommand.ts
- [ ] undo.ts
- [ ] redo.ts

---

# Phase 4 — Timeline System

Create in `packages/engine/src/time/`

- [ ] TempoEvent.ts
- [ ] TimeSignatureEvent.ts
- [ ] timelineReducer.ts

Rules:
- No tick-based time
- All time is musical (measure/beat)

---

# Phase 5 — Track System

Create in `packages/engine/src/tracks/`

- [ ] trackFilter.ts
- [ ] trackSelectors.ts

Rules:
- Tracks MUST NOT own notes
- Tracks are semantic views only

---

# Phase 6 — Engine Entry Point

Create:

- [ ] `packages/engine/src/index.ts`
  - exports all public API

---

# Phase 7 — Required Behavior Validation

## Must be true:

- [ ] SongState can be fully reconstructed from command history
- [ ] Reducer is deterministic
- [ ] Notes are globally unique and not duplicated per track
- [ ] Undo restores exact previous state
- [ ] Redo restores forward state

---

# Phase 8 — Test Requirements

Create tests for:

- [ ] insert note
- [ ] delete note
- [ ] modify note
- [ ] undo
- [ ] redo
- [ ] reducer determinism
- [ ] immutability guarantees

---

# Phase 9 — Forbidden Patterns

DO NOT implement:

- UI logic
- Audio playback
- MIDI dependencies
- class-based state mutation
- tick-based timing
- DOM interaction

---

# Phase 10 — Success Criteria

Engine is valid only if:

- Runs standalone (no UI)
- Fully deterministic from command log
- Passes all reducer tests
- Maintains strict separation of concerns

---

# END CHECKLIST
