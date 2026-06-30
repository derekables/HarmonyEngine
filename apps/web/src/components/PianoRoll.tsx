import React, { useEffect, useMemo, useState } from "react";
import type { Note } from "../models/Note";

const PX_PER_BEAT = 40;
const PITCH_HEIGHT = 12;
const PITCH_MIN = 40;
const PITCH_MAX = 84;

function beatToX(beat: number) {
  return beat * PX_PER_BEAT;
}

function pitchToY(pitch: number) {
  return (PITCH_MAX - pitch) * PITCH_HEIGHT;
}

/**
 * PIANO ROLL SYSTEM (NOTE-LEVEL UI BINDING)
 * ----------------------------------------
 * Renders Notes as spatial objects in time (X) and pitch (Y)
 *
 * This is the first UI layer that operates directly on MUSICAL TRUTH.
 */
export default function PianoRoll() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const id = setInterval(() => {
      const state = (window as any).__ENGINE_STATE__;

      if (!state) return;

      const compiled = state.notes as Note[] | undefined;

      if (compiled) {
        setNotes([...compiled]);
      }
    }, 50);

    return () => clearInterval(id);
  }, []);

  const rendered = useMemo(() => {
    return notes.map((n) => {
      const x = beatToX(n.startBeats);
      const y = pitchToY(n.pitch);
      const w = n.durationBeats * PX_PER_BEAT;
      const h = 10;

      return (
        <div
          key={n.id}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: w,
            height: h,
            background: "#7ab7ff",
            borderRadius: 3,
            opacity: 0.9,
          }}
          title={`pitch: ${n.pitch}, start: ${n.startBeats}`}
        />
      );
    });
  }, [notes]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: 600,
        background: "#111",
        overflow: "auto",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: `${PX_PER_BEAT}px ${PITCH_HEIGHT}px`,
          pointerEvents: "none",
        }}
      />

      {rendered}
    </div>
  );
}
