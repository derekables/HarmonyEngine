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
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const dragRef = useRef<{
    noteId: string | null;
    offsetX: number;
    offsetY: number;
    startPointerX: number;
    startPointerY: number;
    baseSnapshot: Map<string, { startBeats: number; pitch: number }>;
  }>({
    noteId: null,
    offsetX: 0,
    offsetY: 0,
    startPointerX: 0,
    startPointerY: 0,
    baseSnapshot: new Map(),
  });

  useEffect(() => {
    const id = setInterval(() => {
      const state = (window as any).__ENGINE_STATE__;
      if (!state) return;
      const compiled = state.notes as Note[] | undefined;
      if (compiled) setNotes([...compiled]);
    }, 50);
    return () => clearInterval(id);
  }, []);

  function updateNotes(next: Note[]) {
    const state = (window as any).__ENGINE_STATE__;
    if (!state) return;
    state.notes = next;
    setNotes([...next]);
  }

  function commitUpdate(updated: Note) {
    updateNotes(notes.map(n => n.id === updated.id ? updated : n));
  }

  function updateGroup(dxBeats: number, dyPitch: number) {
    const next = notes.map(n => {
      if (!selected.has(n.id)) return n;
      const base = dragRef.current.baseSnapshot.get(n.id);
      if (!base) return n;
      return {
        ...n,
        startBeats: Math.max(0, base.startBeats + dxBeats),
        pitch: Math.min(PITCH_MAX, Math.max(PITCH_MIN, base.pitch + dyPitch)),
      };
    });
    updateNotes(next);
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragRef.current.noteId) return;

    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dxBeats = xToBeat(x) - xToBeat(dragRef.current.startPointerX);
    const dyPitch = yToPitch(dragRef.current.startPointerY) - yToPitch(y);

    const active = notes.find(n => n.id === dragRef.current.noteId);
    if (!active) return;

    const isGroup = selected.size > 1 && selected.has(active.id);

    if (isGroup) {
      updateGroup(dxBeats, dyPitch);
      return;
    }

    commitUpdate({
      ...active,
      startBeats: Math.max(0, active.startBeats + dxBeats),
      pitch: Math.min(PITCH_MAX, Math.max(PITCH_MIN, active.pitch + dyPitch)),
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

      const isSelected = selected.has(n.id);

      return (
        <div
          key={n.id}
          onMouseDown={(e) => {
            const additive = e.shiftKey || e.metaKey || e.ctrlKey;

            setSelected(prev => {
              const next = new Set(prev);
              if (!additive) next.clear();
              if (next.has(n.id)) next.delete(n.id);
              else next.add(n.id);
              return next;
            });

            dragRef.current.noteId = n.id;
            dragRef.current.startPointerX = e.clientX;
            dragRef.current.startPointerY = e.clientY;

            dragRef.current.baseSnapshot.clear();
            const targets = selected.has(n.id) ? selected : new Set([n.id]);

            for (const note of notes) {
              if (targets.has(note.id)) {
                dragRef.current.baseSnapshot.set(note.id, {
                  startBeats: note.startBeats,
                  pitch: note.pitch,
                });
              }
            }
          }}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: w,
            height: 10,
            background: isSelected ? "#ffd166" : "#7ab7ff",
            borderRadius: 3,
            opacity: 0.95,
            cursor: "grab",
            outline: isSelected ? "2px solid white" : "none",
          }}
          title={`pitch: ${n.pitch}, start: ${n.startBeats}`}
        />
      );
    });
  }, [notes, selected]);

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
