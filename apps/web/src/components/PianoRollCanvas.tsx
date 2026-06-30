import React, { useRef, useEffect, useState } from "react";
import type { SongState } from "@harmony-engine/core";

/**
 * Upgraded Piano Roll Canvas
 * - grid rendering
 * - selection state
 * - click-to-note preview hooks (future drag/resize)
 */

function pitchToY(pitch: any): number {
  return (pitch.octave || 0) * 50 + (pitch.step?.charCodeAt(0) || 0);
}

function timeToX(pos: any): number {
  return (pos.measure || 0) * 200 + (pos.beat || 0) * 40;
}

function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 1;

  // vertical grid (time)
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // horizontal grid (pitch)
  for (let y = 0; y < height; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

export default function PianoRollCanvas({ state }: { state: SongState }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // grid first
    drawGrid(ctx, canvas.width, canvas.height);

    // notes
    Object.values(state.notes).forEach((note: any) => {
      const x = timeToX(note.onset);
      const y = pitchToY(note.pitch);
      const w = note.duration.beats * 40;
      const h = 20;

      ctx.fillStyle = note.id === selectedId ? "#60a5fa" : "#4ade80";
      ctx.fillRect(x, y, w, h);
    });
  }, [state, selectedId]);

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // selection hit test (very rough)
    const hit = Object.values(state.notes as any).find((note: any) => {
      const nx = timeToX(note.onset);
      const ny = pitchToY(note.pitch);
      const w = note.duration.beats * 40;
      const h = 20;

      return x >= nx && x <= nx + w && y >= ny && y <= ny + h;
    });

    setSelectedId(hit ? (hit as any).id : null);
  }

  return (
    <canvas
      ref={ref}
      width={1200}
      height={600}
      onClick={handleClick}
      style={{ cursor: "crosshair" }}
    />
  );
}
