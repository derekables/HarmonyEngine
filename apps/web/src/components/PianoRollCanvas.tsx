import React, { useRef, useEffect } from "react";
import type { SongState } from "@harmony-engine/core";

/**
 * First minimal piano roll renderer.
 * Renders notes as simple rectangles on a canvas.
 */

function pitchToY(pitch: any): number {
  return (pitch.octave || 0) * 50 + (pitch.step?.charCodeAt(0) || 0);
}

function timeToX(pos: any): number {
  return (pos.measure || 0) * 200 + (pos.beat || 0) * 40;
}

export default function PianoRollCanvas({ state }: { state: SongState }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    Object.values(state.notes).forEach((note: any) => {
      const x = timeToX(note.onset);
      const y = pitchToY(note.pitch);
      const w = note.duration.beats * 40;
      const h = 20;

      ctx.fillStyle = "#4ade80";
      ctx.fillRect(x, y, w, h);
    });
  }, [state]);

  return <canvas ref={ref} width={1200} height={600} />;
}
