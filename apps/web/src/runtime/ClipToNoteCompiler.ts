import type { Clip } from "../models/Clip";
import type { Note } from "../models/Note";

/**
 * CLIP → NOTE COMPILER SYSTEM
 * --------------------------
 * Bridges STRUCTURE (Clips) → TRUTH (Notes)
 */

export interface CompilerContext {
  bpm: number;
  pitchBase?: number;
  voice?: string;
}

function generateId(prefix: string = "note") {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function defaultPitchFromClip(clip: Clip): number {
  let hash = 0;
  for (let i = 0; i < clip.id.length; i++) {
    hash = (hash * 31 + clip.id.charCodeAt(i)) % 12;
  }
  return 60 + hash * 2;
}

export class ClipToNoteCompiler {
  compileClip(clip: Clip, ctx: CompilerContext): Note[] {
    const pitch = defaultPitchFromClip(clip);
    const startBeats = clip.start.measure * 4 + clip.start.beat;

    const note: Note = {
      id: generateId("note"),
      pitch: ctx.pitchBase ? pitch + ctx.pitchBase : pitch,
      startBeats,
      durationBeats: clip.lengthBeats,
      velocity: 0.8,
      voice: ctx.voice ?? "default",
      tags: ["clip-derived"],
    };

    return [note];
  }

  compileArrangement(arrangement: { clips: Record<string, Clip> }, ctx: CompilerContext): Note[] {
    const notes: Note[] = [];
    for (const clip of Object.values(arrangement.clips)) {
      notes.push(...this.compileClip(clip, ctx));
    }
    return notes;
  }
}
