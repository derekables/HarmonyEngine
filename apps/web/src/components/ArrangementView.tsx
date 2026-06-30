import React, { useEffect, useMemo, useState } from "react";
import type { Arrangement } from "../models/Arrangement";
import type { Clip } from "../models/Clip";

/**
 * ArrangementView = DAW timeline UI
 * Renders tracks + clips as horizontal blocks.
 */

function beatsToX(beats: number) {
  return beats * 40;
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

  useEffect(() => {
    const tick = () => {
      const state = (window as any).__ENGINE_STATE__;
      if (state?.arrangement) {
        setArr(state.arrangement);
      }
    };

    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  }, []);

  if (!arr) {
    return <div style={{ padding: 10 }}>No arrangement loaded</div>;
  }

  return (
    <div style={{ overflowX: "auto", whiteSpace: "nowrap", height: "100%" }}>
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
