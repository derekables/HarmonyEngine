import React, { useMemo } from "react";
import { useEngineHistory } from "./engine/useEngineHistory";
import PianoRollCanvas from "./components/PianoRollCanvas";
import { useCommandDispatch } from "./engine/useCommandDispatch";
import type { SongState } from "@harmony-engine/core";
import { PlaybackEngine } from "./audio/PlaybackEngine";
import { Transport } from "./audio/Transport";
import ArrangementView from "./components/ArrangementView";

/**
 * Temporary factory for initial song state.
 * Will later be moved into engine core.
 */
function createEmptySongState(): SongState {
  return {
    id: "song-1",
    notes: {},
    tracks: {},
    timeline: {
      tempoMap: [],
      timeSignatureMap: [],
    },
  };
}

export default function App() {
  const initialState = useMemo(() => createEmptySongState(), []);

  const engine = useEngineHistory(initialState);
  const dispatch = useCommandDispatch(engine);

  const transport = useMemo(() => new Transport(120), []);
  const player = useMemo(() => new PlaybackEngine(transport), [transport]);

  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const measure = Math.floor(x / 200);
    const beat = Math.floor((x % 200) / 40);

    const octave = Math.floor(y / 50);
    const steps = ["C", "D", "E", "F", "G", "A", "B"];
    const step = steps[Math.max(0, Math.min(6, Math.floor(y / 30) % 7))];

    const note = {
      id: `note-${Date.now()}`,
      pitch: { step, octave },
      onset: { measure, beat },
      duration: { beats: 1 },
      velocity: 100,
    };

    dispatch({
      id: `cmd-${Date.now()}`,
      type: "insert_note",
      timestamp: Date.now(),
      note,
    } as any);
  }

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <header style={{ padding: 10, borderBottom: "1px solid #333", display: "flex", gap: 10 }}>
        <button onClick={() => engine.undo()}>Undo</button>
        <button onClick={() => engine.redo()}>Redo</button>

        <button
          onClick={() => {
            transport.play();
            player.play(engine.state);
          }}
        >
          Play
        </button>

        <button onClick={() => transport.pause()}>Pause</button>
        <button onClick={() => transport.stop()}>Stop</button>
      </header>

      <main style={{ display: "flex", height: "calc(100vh - 40px)" }}>
        <div style={{ flex: 2 }}>
          <ArrangementView />
        </div>

        <div style={{ flex: 1 }}>
          <PianoRollCanvas state={engine.state} />
        </div>
      </main>

      <div
        onClick={handleCanvasClick}
        style={{
          position: "absolute",
          top: 40,
          left: 0,
          width: "70%",
          height: "calc(100vh - 40px)",
        }}
      />
    </div>
  );
}
