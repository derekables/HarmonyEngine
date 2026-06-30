import { useCallback } from "react";
import type { Command } from "@harmony-engine/core";

/**
 * Thin command dispatch hook.
 * In the future this will support middleware, AI hooks, logging, etc.
 */
export function useCommandDispatch(engine: any) {
  return useCallback(
    (command: Command) => {
      engine.dispatch(command);
    },
    [engine]
  );
}
