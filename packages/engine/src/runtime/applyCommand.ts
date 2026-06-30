import { SongState } from "../models/SongState";
import { Command } from "../commands/Command";
import { reduce } from "./reduce";

/**
 * Thin dispatcher layer over reducer.
 * Keeps architecture extensible for future middleware, logging, AI hooks.
 */
export function applyCommand(state: SongState, command: Command): SongState {
  return reduce(state, command);
}
