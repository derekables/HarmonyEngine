import React, { useEffect, useRef, useState } from "react";
import type { Arrangement } from "../models/Arrangement";
import type { Clip } from "../models/Clip";

function beatsToX(beats: number) {
  return beats * 40;
}

function xToBeats(x: number) {
  return x / 40;
}

function clipToX(clip: Clip) {
  const start = clip.start.measure * 4 + clip.start.beat;
  return beatsToX(start);
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

export default function ArrangementView() {
  const [arr, setArr] = useState<Arrangement | null>(null);

  const dragRef = useRef<{
    clipId: string | null;
    offsetX: number;
    mode: "move" | "resize";
    duplicate: boolean;
  }>({ clipId: null, offsetX: 0, mode: "move", duplicate: false });

  useEffect(() => {
    const tick = () => {
      const state = (window as any).__ENGINE_STATE__;
      if (state?.arrangement) {
        setArr({ ...state.arrangement });
      }
    };

    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  }, []);

  function detectMode(e: React.MouseEvent, clip: Clip) {
    const rect = (e.target as HTMLDivElement).getBoundingClientRect();
    const x = e.clientX - rect.left;

    const width = clipWidth(clip);

    if (width - x < 10) return "resize";
    return "move";
  }

  function onMouseDown(e: React.MouseEvent, clip: Clip) {
    const state = (window as any).__ENGINE_STATE__;
    if (!state?.arrangement) return;

    const rect = (e.target as HTMLDivElement).getBoundingClientRect();
    const x = e.clientX - rect.left;

    const mode = detectMode(e, clip);

    dragRef.current.offsetX = x;
    dragRef.current.mode = mode;
    dragRef.current.duplicate = e.ctrlKey || e.metaKey || e.altKey;

    let activeClip = clip;

    // DUPLICATION
    if (dragRef.current.duplicate) {
      const newClip = cloneClip(clip);

      state.arrangement.clips[newClip.id] = newClip;

      const track = Object.values(state.arrangement.tracks).find(t =>
        t.clipIds.includes(clip.id)
      );

      if (track) {
        track.clipIds.push(newClip.id);
      }

      activeClip = newClip;

      (window as any).__ENGINE_STATE__.arrangement = {
        ...state.arrangement,
      };

      setArr({ ...state.arrangement });
    }

    dragRef.current.clipId = activeClip.id;
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragRef.current.clipId || !arr) return;

    const state = (window as any).__ENGINE_STATE__;
    if (!state?.arrangement) return;

    const clip = state.arrangement.clips[dragRef.current.clipId];
    if (!clip) return;

    const containerX = e.clientX;
    const newBeat = xToBeats(containerX - dragRef.current.offsetX);

    if (dragRef.current.mode === "move") {
      const measure = Math.floor(newBeat / 4);
      const beat = newBeat % 4;
      clip.start = { measure, beat };
    }

    if (dragRef.current.mode === "resize") {
      const startBeat = clip.start.measure * 4 + clip.start.beat;
      const newLength = Math.max(0.25, newBeat - startBeat);
      clip.lengthBeats = newLength;
    }

    (window as any).__ENGINE_STATE__.arrangement = {
      ...state.arrangement,
    };

    setArr({ ...state.arrangement });
  }

  function onMouseUp() {
    dragRef.current.clipId = null;
    dragRef.current.duplicate = false;
  }

  if (!arr) {
    return <div style={{ padding: 10 }}>No arrangement loaded</div>;
  }

  return (
    <div
      style={{ overflowX: "auto", whiteSpace: "nowrap", height: "100%" }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      <div style={{ position: "relative", minHeight: 400 }}>
        {Object.values(arr.tracks).map((track) => (
          <div
            key={track.id}
            style={{
              position: "relative",
              height: 60,
              borderBottom: "1px solid #333",
            }}
          >
            {track.clipIds.map((clipId) => {
              const clip = arr.clips[clipId];
              if (!clip) return null;

              const isResizing = dragRef.current.clipId === clip.id && dragRef.current.mode === "resize";

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
                    cursor: isResizing ? "ew-resize" : "grab",
                    userSelect: "none",
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
