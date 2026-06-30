import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Note } from "../models/Note";

const PX_PER_BEAT = 40;
const PITCH_HEIGHT = 12;
const PITCH_MIN = 40;
const PITCH_MAX = 84;

function beatToX(beat: number) {
  return beat * PX_PER_BEAT;
}

function xToBeat(x: number) {
  return x / PX_PER_BEAT;
}

function pitchToY(pitch: number) {
  return (PITCH_MAX - pitch) * PITCH_HEIGHT;
}

function yToPitch(y: number) {
  return Math.round(PITCH_MAX - y / PITCH_HEIGHT);
}

export default function PianoRoll() {
  const [notes, setNotes] = useState<Note[]>([]);

  const dragRef = useRef<{
    noteId: string | null;
    offsetX: number;
    offsetY: number;
  }>({ noteId: null, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    const id = setInterval(() => {
      const state = (window as any).__ENGINE_STATE__;
      if (!state) return;
      const compiled = state.notes as Note[] | undefined;
      if (compiled) setNotes([...compiled]);
    }, 50);
    return () => clearInterval(id);
  }, []);

  function updateNote(updated: Note) {
    const state = (window as any).__ENGINE_STATE__;
    if (!state?.notes) return;

    const next = state.notes.map((n: Note) =>
      n.id === updated.id ? updated : n
    );

    state.notes = next;
    setNotes([...next]);
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragRef.current.noteId) return;

    const state = (window as any).__ENGINE_STATE__;
    if (!state?.notes) return;

    const note = state.notes.find((n: Note) => n.id === dragRef.current.noteId);
    if (!note) return;

    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newBeat = Math.max(0, xToBeat(x));
    const newPitch = Math.min(PITCH_MAX, Math.max(PITCH_MIN, yToPitch(y)));

    updateNote({
      ...note,
      startBeats: newBeat,
      pitch: newPitch,
    });
  }

  function onMouseUp() {
    dragRef.current.noteId = null;
  }

  const rendered = useMemo(() => {
    return notes.map((n) => {
      const x = beatToX(n.startBeats);
      const y = pitchToY(n.pitch);
      const w = n.durationBeats * PX_PER_BEAT;

      return (
        <div
          key={n.id}
          onMouseDown={(e) => {
            dragRef.current.noteId = n.id;
            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
            dragRef.current.offsetX = e.clientX - rect.left;
            dragRef.current.offsetY = e.clientY - rect.top;
          }}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: w,
            height: 10,
            background: "#7ab7ff",
            borderRadius: 3,
            opacity: 0.9,
            cursor: "grab",
          }}
          title={`pitch: ${n.pitch}, start: ${n.startBeats}`}
        />
      );
    });
  }, [notes]);

  return (
    <div
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
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
