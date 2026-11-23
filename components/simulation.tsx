'use client';
import { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Move } from 'lucide-react';
import { SimulationCore, adapters, initialSimulation } from '@/lib/simulation';
export default function Simulation({
  kind,
  disabled = false,
}: {
  kind: 'drag' | 'robot' | 'string';
  disabled?: boolean;
}) {
  const [state, setState] = useState(initialSimulation);
  const core = useRef<SimulationCore | null>(null);
  const audio = useRef<AudioContext | null>(null);
  useEffect(() => {
    const engine = new SimulationCore(adapters[kind], setState);
    core.current = engine;
    setState(initialSimulation());
    return () => {
      engine.dispose();
      void audio.current?.close();
      audio.current = null;
    };
  }, [kind]);
  function input(e: React.PointerEvent<HTMLDivElement>) {
    if (disabled) return;
    const r = e.currentTarget.getBoundingClientRect();
    core.current?.input(
      ((e.clientX - r.left) / r.width) * 100,
      ((e.clientY - r.top) / r.height) * 100,
    );
    if (!core.current?.state.running) core.current?.start();
  }
  function pluck(index: number) {
    if (disabled) return;
    core.current?.input(15 + index * 14, 50);
    core.current?.start();
    try {
      const ctx = audio.current ?? new AudioContext();
      audio.current = ctx;
      void ctx.resume();
      const o = ctx.createOscillator(),
        g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = [196, 220, 261.63, 293.66, 329.63, 392][index];
      g.gain.setValueAtTime(0.14, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 1);
    } catch {
      /* Visual simulation remains available without audio. */
    }
  }
  return (
    <div className="simulation">
      <div className="sim-top">
        <span>
          <span className={state.running ? 'live-dot' : 'idle-dot'} />
          {kind === 'robot'
            ? 'ROBOT ARM LAB'
            : kind === 'string'
              ? 'STRING RESONANCE'
              : 'MOTION PLAYGROUND'}
        </span>
        <span>2D · {state.running ? 'RUNNING' : 'PAUSED'}</span>
      </div>
      <div
        className="sim-stage"
        role="group"
        aria-label="시뮬레이션 조작 영역"
        tabIndex={disabled ? -1 : 0}
        onPointerDown={(e) => {
          if (kind !== 'string') {
            e.currentTarget.setPointerCapture(e.pointerId);
            input(e);
          }
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1 && kind !== 'string') input(e);
        }}
        onKeyDown={(e) => {
          if (disabled) return;
          const delta: Record<string, [number, number]> = {
            ArrowLeft: [-5, 0],
            ArrowRight: [5, 0],
            ArrowUp: [0, -5],
            ArrowDown: [0, 5],
          };
          if (delta[e.key]) {
            e.preventDefault();
            const [x, y] = delta[e.key];
            core.current?.input(state.targetX + x, state.targetY + y);
            core.current?.start();
          }
        }}
      >
        <div className="sim-grid" />
        {kind === 'robot' ? (
          <svg viewBox="0 0 500 260" role="img" aria-label="목표점을 따라 움직이는 로봇 팔">
            <ellipse cx="250" cy="231" rx="90" ry="12" fill="currentColor" opacity=".06" />
            <path d="M218 230h64l-8-22h-48z" fill="var(--lp-muted)" />
            <line
              x1="250"
              y1="210"
              x2={150 + state.x * 1.4}
              y2={150 - state.y * 0.7}
              stroke="var(--lp-border)"
              strokeWidth="26"
              strokeLinecap="round"
            />
            <line
              x1={150 + state.x * 1.4}
              y1={150 - state.y * 0.7}
              x2={state.x * 4.4 + 30}
              y2={state.y * 1.8 + 10}
              stroke="var(--lp-primary)"
              strokeWidth="19"
              strokeLinecap="round"
            />
            <circle cx="250" cy="210" r="15" fill="var(--lp-primary)" />
            <circle
              cx={150 + state.x * 1.4}
              cy={150 - state.y * 0.7}
              r="14"
              fill="var(--lp-surface)"
              stroke="var(--lp-primary)"
              strokeWidth="5"
            />
            <circle
              cx={state.x * 4.4 + 30}
              cy={state.y * 1.8 + 10}
              r="10"
              fill="var(--lp-primary)"
            />
            <circle
              cx={state.targetX * 4.4 + 30}
              cy={state.targetY * 1.8 + 10}
              r="18"
              stroke="var(--lp-primary)"
              strokeDasharray="3 5"
              fill="none"
              opacity=".4"
            />
          </svg>
        ) : kind === 'string' ? (
          <div className="strings">
            {['솔', '라', '도', '레', '미', '솔'].map((n, i) => (
              <button
                key={i}
                aria-label={n + ' 현 연주'}
                disabled={disabled}
                onClick={() => pluck(i)}
              >
                <span
                  style={{
                    transform: `translateX(${Math.sin(state.time * 40 + i) * state.energy * (Math.abs(state.x - (15 + i * 14)) < 5 ? 1 : 0.05)}px)`,
                  }}
                />
                <small>{n}</small>
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="sim-orbit" />
            <div
              className="sim-target"
              style={{ left: state.targetX + '%', top: state.targetY + '%' }}
            />
            <div className="sim-ball" style={{ left: state.x + '%', top: state.y + '%' }}>
              <Move size={24} />
            </div>
          </>
        )}
        <span className="sim-hint">
          {disabled
            ? '미리보기에서 직접 조작해 보세요'
            : kind === 'string'
              ? '현을 누르면 소리와 진동이 발생합니다'
              : '드래그하거나 방향키로 목표점을 움직이세요'}
        </span>
      </div>
      <div className="sim-controls">
        <button
          disabled={disabled}
          onClick={() => (state.running ? core.current?.pause() : core.current?.start())}
        >
          {state.running ? <Pause size={14} /> : <Play size={14} />}{' '}
          {state.running ? '일시정지' : '시작'}
        </button>
        <button
          disabled={disabled}
          aria-label="시뮬레이션 초기화"
          onClick={() => core.current?.reset()}
        >
          <RotateCcw size={14} />
        </button>
        <div className="sim-stats">
          <span>
            X <b>{state.x.toFixed(1)}</b>
          </span>
          <span>
            Y <b>{state.y.toFixed(1)}</b>
          </span>
          <span>
            TIME <b>{state.time.toFixed(1)}s</b>
          </span>
        </div>
      </div>
    </div>
  );
}
