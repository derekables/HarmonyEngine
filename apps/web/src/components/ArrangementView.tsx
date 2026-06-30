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

export default function ArrangementView() {
  const [arr, setArr] = useState<Arrangement | null>(null);
  const dragRef = useRef<{ clipId: string | null; offsetX: number }>({
    clipId: null,
    offsetX: 0,
  });

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

  function onMouseDown(e: React.MouseEvent, clip: Clip) {
    const rect = (e.target as HTMLDivElement).getBoundingClientRect();
    const x = e.clientX - rect.left;

    dragRef.current.clipId = clip.id;
    dragRef.current.offsetX = x;
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragRef.current.clipId || !arr) return;

    const state = (window as any).__ENGINE_STATE__;
    if (!state?.arrangement) return;

    const clip = state.arrangement.clips[dragRef.current.clipId];
    if (!clip) return;

    const containerX = e.clientX;
    const newBeat = xToBeats(containerX - dragRef.current.offsetX);

    const measure = Math.floor(newBeat / 4);
    const beat = newBeat % 4;

    clip.start = { measure, beat };

    (window as any).__ENGINE_STATE__.arrangement = {
      ...state.arrangement,
    };

    setArr({ ...state.arrangement });
  }

  function onMouseUp() {
    dragRef.current.clipId = null;
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
