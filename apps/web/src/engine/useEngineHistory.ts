import { useMemo, useState } from "react";
import type { SongState } from "@harmony-engine/core";
import { createHistory, apply, undo, redo } from "@harmony-engine/core";

/**
 * React hook that owns the Harmony Engine history state.
 * This is the single source of truth for UI projection.
 */
export function useEngineHistory(initialState: SongState) {
  const [history, setHistory] = useState(() => createHistory(initialState));
  const [state, setState] = useState(initialState);

  const api = useMemo(() => {
    return {
      state,
      history,

      dispatch(command: any) {
        const result = apply(history, command);
        setHistory(result.history);
        setState(result.state);
      },

      undo() {
        const result = undo(history);
        setHistory(result.history);
        setState(result.state);
      },

      redo() {
        const result = redo(history);
        setHistory(result.history);
        setState(result.state);
      },
    };
  }, [history, state]);

  return api;
}
