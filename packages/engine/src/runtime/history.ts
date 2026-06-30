import { SongState } from "../models/SongState";
import { Command } from "../commands/Command";
import { reduce } from "./reduce";

export type CommandHistory = {
  initialState: SongState;
  past: Command[];
  future: Command[];
};

/**
 * Rebuilds SongState deterministically from initial state + command list
 */
function replay(initial: SongState, commands: Command[]): SongState {
  return commands.reduce((state, cmd) => reduce(state, cmd), initial);
}

export function createHistory(initialState: SongState): CommandHistory {
  return {
    initialState,
    past: [],
    future: [],
  };
}

export function apply(history: CommandHistory, command: Command): {
  history: CommandHistory;
  state: SongState;
} {
  const newPast = [...history.past, command];
  const newHistory: CommandHistory = {
    initialState: history.initialState,
    past: newPast,
    future: [], // clear redo stack on new action
  };

  return {
    history: newHistory,
    state: replay(history.initialState, newPast),
  };
}

export function undo(history: CommandHistory): {
  history: CommandHistory;
  state: SongState;
} {
  if (history.past.length === 0) {
    return {
      history,
      state: replay(history.initialState, history.past),
    };
  }

  const newPast = history.past.slice(0, -1);
  const last = history.past[history.past.length - 1];

  const newHistory: CommandHistory = {
    initialState: history.initialState,
    past: newPast,
    future: [last, ...history.future],
  };

  return {
    history: newHistory,
    state: replay(history.initialState, newPast),
  };
}

export function redo(history: CommandHistory): {
  history: CommandHistory;
  state: SongState;
} {
  if (history.future.length === 0) {
    return {
      history,
      state: replay(history.initialState, history.past),
    };
  }

  const [next, ...rest] = history.future;

  const newPast = [...history.past, next];

  const newHistory: CommandHistory = {
    initialState: history.initialState,
    past: newPast,
    future: rest,
  };

  return {
    history: newHistory,
    state: replay(history.initialState, newPast),
  };
}
