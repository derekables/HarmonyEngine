import { Transport } from "./Transport";

/**
 * Playhead = visual representation of transport time.
 * Converts musical time → pixel position.
 */

export class Playhead {
  private transport: Transport;
  private listeners: (() => void)[] = [];

  constructor(transport: Transport) {
    this.transport = transport;

    const tick = () => {
      if (this.transport.getState().isPlaying) {
        this.emit();
      }
      requestAnimationFrame(tick);
    };

    tick();
  }

  subscribe(fn: () => void) {
    this.listeners.push(fn);
  }

  private emit() {
    this.listeners.forEach((l) => l());
  }

  /**
   * Simple mapping: measure → pixels
   */
  timeToX(measure: number, beat: number) {
    return measure * 200 + beat * 40;
  }

  /**
   * Current playhead X position (very early model)
   */
  getX() {
    const state = this.transport.getState();

    if (!state.isPlaying) return 0;

    const elapsedMs = performance.now() - state.startTime;
    const beats = (elapsedMs / 1000) * (state.bpm / 60);

    const measure = Math.floor(beats / 4);
    const beat = beats % 4;

    return this.timeToX(measure, beat);
  }
}
