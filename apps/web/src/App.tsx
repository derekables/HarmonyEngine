import React from "react";

/**
 * Harmony Engine UI Root
 *
 * This is the first compositional shell for the web UI.
 * It will host:
 * - Piano Roll View
 * - Tab View
 * - Future transport / playback controls
 */

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "10px", borderBottom: "1px solid #333" }}>
        <h1>Harmony Engine</h1>
      </header>

      <main style={{ flex: 1, display: "flex" }}>
        {/* Piano Roll Area (placeholder for now) */}
        <div style={{ flex: 2, borderRight: "1px solid #333" }}>
          <h2 style={{ padding: 10 }}>Piano Roll</h2>
        </div>

        {/* Tab View Area (placeholder for now) */}
        <div style={{ flex: 1 }}>
          <h2 style={{ padding: 10 }}>Tab View</h2>
        </div>
      </main>
    </div>
  );
}
