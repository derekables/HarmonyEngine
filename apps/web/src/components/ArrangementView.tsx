import React, { useEffect, useRef, useState } from "react";
import type { Arrangement } from "../models/Arrangement";
import type { Clip } from "../models/Clip";

const SNAP_GRID = 0.25;
const MAGNETIC_THRESHOLD = 0.2;
const PX_PER_BEAT = 40;

function beatsToX(beats: number) {
  return beats * PX_PER_BEAT;
}

function xToBeats(x: number) {
  return x / PX_PER_BEAT;
}

function snap(value: number, grid: number = SNAP_GRID) {
  return Math.round(value / grid) * grid;
}

function clipToBeats(clip: Clip) {
  return clip.start.measure * 4 + clip.start.beat;
}

function clipToX(clip: Clip) {
  return beatsToX(clipToBeats(clip));
}

function clipWidth(clip: Clip) {
  return beatsToX(clip.lengthBeats);
}

function cloneClip(clip: Clip): Clip {
  return {
    ...clip,
    id: `clip-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: clip.name ? `${clip.name} copy` : "Clip copy",
  };
}

function getMagneticPoints(arr: Arrangement, excludeId?: string): number[] {
  const pts: number[] = [];
  Object.values(arr.clips).forEach((c) => {
    if (c.id === excludeId) return;
    const start = clipToBeats(c);
    const end = start + c.lengthBeats;
    pts.push(start, end);
  });
  return pts;
}

function applyMagnetism(value: number, points: number[]): number {
  let closest = value;
  let minDist = MAGNETIC_THRESHOLD;
  for (const p of points) {
    const d = Math.abs(p - value);
    if (d < minDist) {
      minDist = d;
      closest = p;
    }
  }
  return closest;
}

export default function ArrangementView() {
  const [arr, setArr] = useState<Arrangement | null>(null);

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [box, setBox] = useState<null | { x1: number; y1: number; x2: number; y2: number }>(null);

  const dragRef = useRef<{
    clipId: string | null;
    offsetX: number;
    mode: "move" | "resize";
    duplicate: boolean;
  }>({ clipId: null, offsetX: 0, mode: "move", duplicate: false });

  useEffect(() => {
    const id = setInterval(() => {
      const state = (window as any).__ENGINE_STATE__;
      if (state?.arrangement) setArr({ ...state.arrangement });
    }, 50);
    return () => clearInterval(id);
  }, []);

  function detectMode(e: React.MouseEvent, clip: Clip) {
    const rect = (e.target as HTMLDivElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = clipWidth(clip);
    return width - x < 10 ? "resize" : "move";
  }

  function toggleSelect(id: string, additive: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (!additive) next.clear();
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function onMouseDown(e: React.MouseEvent, clip?: Clip) {
    const state = (window as any).__ENGINE_STATE__;
    if (!state?.arrangement) return;

    if (!clip) {
      setBox({ x1: e.clientX, y1: e.clientY, x2: e.clientX, y2: e.clientY });
      return;
    }

    const additive = e.shiftKey || e.ctrlKey || e.metaKey;
    toggleSelect(clip.id, additive);

    const rect = (e.target as HTMLDivElement).getBoundingClientRect();
    const x = e.clientX - rect.left;

    dragRef.current.offsetX = x;
    dragRef.current.mode = detectMode(e, clip);
    dragRef.current.duplicate = e.ctrlKey || e.metaKey || e.altKey;

    let active = clip;

    if (dragRef.current.duplicate) {
      const c = cloneClip(clip);
      state.arrangement.clips[c.id] = c;
      const track = Object.values(state.arrangement.tracks).find(t => t.clipIds.includes(clip.id));
      if (track) track.clipIds.push(c.id);
      active = c;
      (window as any).__ENGINE_STATE__.arrangement = { ...state.arrangement };
    }

    dragRef.current.clipId = active.id;
  }

  function onMouseMove(e: React.MouseEvent) {
    if (box) {
      setBox((b) => (b ? { ...b, x2: e.clientX, y2: e.clientY } : b));
      return;
    }

    if (!dragRef.current.clipId || !arr) return;

    const state = (window as any).__ENGINE_STATE__;
    if (!state?.arrangement) return;

    const clip = state.arrangement.clips[dragRef.current.clipId];
    if (!clip) return;

    const rawBeat = xToBeats(e.clientX - dragRef.current.offsetX);
    const grid = snap(rawBeat);
    const beat = applyMagnetism(grid, getMagneticPoints(state.arrangement, clip.id));

    if (dragRef.current.mode === "move") {
      const snapped = snap(beat, 1);
      clip.start = { measure: Math.floor(snapped / 4), beat: snapped % 4 };
    }

    if (dragRef.current.mode === "resize") {
      const start = clip.start.measure * 4 + clip.start.beat;
      clip.lengthBeats = Math.max(0.25, snap(beat - start));
    }

    (window as any).__ENGINE_STATE__.arrangement = { ...state.arrangement };
    setArr({ ...state.arrangement });
  }

  function onMouseUp() {
    if (box && arr) {
      const minX = Math.min(box.x1, box.x2);
      const maxX = Math.max(box.x1, box.x2);
      const minY = Math.min(box.y1, box.y2);
      const maxY = Math.max(box.y1, box.y2);

      const hit = new Set<string>();

      Object.values(arr.tracks).forEach((track, ti) => {
        track.clipIds.forEach((id) => {
          const clip = arr.clips[id];
          if (!clip) return;

          const x = clipToX(clip);
          const y = ti * 60 + 10;
          const w = clipWidth(clip);
          const h = 40;

          if (x < maxX && x + w > minX && y < maxY && y + h > minY) {
            hit.add(clip.id);
          }
        });
      });

      setSelected(hit);
    }

    setBox(null);
    dragRef.current.clipId = null;
    dragRef.current.duplicate = false;
  }

  if (!arr) return <div style={{ padding: 10 }}>No arrangement loaded</div>;

  return (
    <div
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseDown={(e) => onMouseDown(e)}
      style={{ overflowX: "auto", whiteSpace: "nowrap", height: "100%" }}
    >
      {box && (
        <div
          style={{
            position: "fixed",
            left: Math.min(box.x1, box.x2),
            top: Math.min(box.y1, box.y2),
            width: Math.abs(box.x2 - box.x1),
            height: Math.abs(box.y2 - box.y1),
            border: "1px dashed #7ab7ff",
            background: "rgba(122,183,255,0.15)",
            pointerEvents: "none"
          }}
        />
      )}

      <div style={{ position: "relative", minHeight: 400 }}>
        {Object.values(arr.tracks).map((track, ti) => (
          <div key={track.id} style={{ position: "relative", height: 60, borderBottom: "1px solid #333" }}>
            {track.clipIds.map((id) => {
              const clip = arr.clips[id];
              if (!clip) return null;

              const isSel = selected.has(clip.id);

              return (
                <div
                  key={clip.id}
                  onMouseDown={(e) => onMouseDown(e, clip)}
                  style={{
                    position: "absolute",
                    left: clipToX(clip),
                    width: clipWidth(clip),
                    height: 40,
                    top: 10,
                    background: clip.color || "#3a6ea5",
                    borderRadius: 4,
                    color: "white",
                    fontSize: 12,
                    padding: 4,
                    cursor: "grab",
                    outline: isSel ? "2px solid #7ab7ff" : "none",
                    userSelect: "none"
                  }}
                >
                  {clip.name || "Clip"}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
