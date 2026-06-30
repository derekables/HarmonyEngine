import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

/**
 * Harmony Engine Web Entry Point
 *
 * This is where the deterministic engine is mounted into React.
 */

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
