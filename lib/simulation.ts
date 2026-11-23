export type SimulationState = {
  time: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  energy: number;
  running: boolean;
};
export interface SimulationAdapter {
  id: 'drag' | 'robot' | 'string';
  update: (state: SimulationState, dt: number) => SimulationState;
}
export const adapters: Record<SimulationAdapter['id'], SimulationAdapter> = {
  drag: {
    id: 'drag',
    update: (s, dt) => ({
      ...s,
      time: s.time + dt,
      x: s.x + (s.targetX - s.x) * Math.min(1, dt * 10),
      y: s.y + (s.targetY - s.y) * Math.min(1, dt * 10),
      energy: Math.hypot(s.targetX - s.x, s.targetY - s.y),
    }),
  },
  robot: {
    id: 'robot',
    update: (s, dt) => ({
      ...s,
      time: s.time + dt,
      x: s.x + (s.targetX - s.x) * Math.min(1, dt * 4),
      y: s.y + (s.targetY - s.y) * Math.min(1, dt * 4),
      energy: Math.hypot(s.targetX - s.x, s.targetY - s.y),
    }),
  },
  string: {
    id: 'string',
    update: (s, dt) => ({
      ...s,
      time: s.time + dt,
      energy: s.energy * Math.exp(-dt * 2),
      x: s.targetX,
      y: s.targetY,
    }),
  },
};
export const initialSimulation = (): SimulationState => ({
  time: 0,
  x: 50,
  y: 45,
  targetX: 50,
  targetY: 45,
  energy: 0,
  running: false,
});
export class SimulationCore {
  state = initialSimulation();
  private frame = 0;
  private last = 0;
  private disposed = false;
  constructor(
    private adapter: SimulationAdapter,
    private output: (state: SimulationState) => void,
  ) {}
  input(x: number, y: number) {
    if (this.disposed) return;
    this.state = {
      ...this.state,
      targetX: Math.max(5, Math.min(95, x)),
      targetY: Math.max(5, Math.min(90, y)),
      energy: 40,
    };
    this.output({ ...this.state });
  }
  start() {
    if (this.state.running || this.disposed) return;
    this.state.running = true;
    this.last = 0;
    this.frame = requestAnimationFrame(this.tick);
  }
  private tick = (now: number) => {
    if (!this.state.running || this.disposed) return;
    const dt = this.last ? Math.min((now - this.last) / 1000, 0.05) : 0;
    this.last = now;
    this.state = this.adapter.update(this.state, dt);
    this.output({ ...this.state });
    this.frame = requestAnimationFrame(this.tick);
  };
  pause() {
    this.state.running = false;
    cancelAnimationFrame(this.frame);
    this.output({ ...this.state });
  }
  reset() {
    this.pause();
    this.state = initialSimulation();
    this.output({ ...this.state });
  }
  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
  }
}
