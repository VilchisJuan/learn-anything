"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Wave definitions ──────────────────────────────────────────────────────────

interface WaveConfig {
  id: string;
  name: string;
  freqRange: string;
  freqHz: number;       // Representative Hz for animation speed
  baseAmplitude: number; // 0–1 relative
  color: string;
  glowColor: string;
  state: string;
  description: string;
  waveType: "sine" | "irregular" | "sawtooth";
}

const WAVES: WaveConfig[] = [
  {
    id: "delta",
    name: "Delta",
    freqRange: "0.5–4 Hz",
    freqHz: 2,
    baseAmplitude: 0.88,
    color: "#60a5fa",
    glowColor: "#3b82f6",
    state: "Deep Sleep / Healing",
    description: "Slowest, highest amplitude. Dominant during dreamless deep sleep and crucial for physical restoration and immune function.",
    waveType: "sine",
  },
  {
    id: "theta",
    name: "Theta",
    freqRange: "4–8 Hz",
    freqHz: 6,
    baseAmplitude: 0.65,
    color: "#a78bfa",
    glowColor: "#7c3aed",
    state: "Drowsiness / Meditation / Creativity",
    description: "Associated with deep relaxation, REM sleep, meditation, and creative insight. The threshold between conscious and subconscious.",
    waveType: "sine",
  },
  {
    id: "alpha",
    name: "Alpha",
    freqRange: "8–13 Hz",
    freqHz: 10,
    baseAmplitude: 0.48,
    color: "#34d399",
    glowColor: "#059669",
    state: "Relaxed Alertness / Eyes Closed",
    description: "The brain's idle rhythm. Present when relaxed with eyes closed. Increases with meditation and decreases with active thinking.",
    waveType: "sine",
  },
  {
    id: "beta",
    name: "Beta",
    freqRange: "13–30 Hz",
    freqHz: 20,
    baseAmplitude: 0.32,
    color: "#fb923c",
    glowColor: "#ea580c",
    state: "Active Thinking / Focus / Stress",
    description: "Normal waking consciousness. Active during problem-solving, decision-making, and focused mental activity. Excess linked to anxiety.",
    waveType: "irregular",
  },
  {
    id: "gamma",
    name: "Gamma",
    freqRange: "30–100 Hz",
    freqHz: 40,
    baseAmplitude: 0.18,
    color: "#f87171",
    glowColor: "#dc2626",
    state: "Peak Cognition / Perception Binding",
    description: "Fastest brain wave. Associated with peak cognitive processing, cross-regional brain synchrony, and the binding of sensory information.",
    waveType: "sine",
  },
];

// Mental states: [waveId → amplitude multiplier 0–1]
interface MentalState {
  id: string;
  label: string;
  amplitudes: Record<string, number>;
  description: string;
  dominant: string[];
}

const MENTAL_STATES: MentalState[] = [
  {
    id: "deep_sleep",
    label: "Deep Sleep",
    dominant: ["delta"],
    amplitudes: { delta: 1.0, theta: 0.2, alpha: 0.05, beta: 0.03, gamma: 0.02 },
    description: "Slow-wave sleep (N3). Delta dominates — brain in restoration mode.",
  },
  {
    id: "light_sleep",
    label: "Light Sleep",
    dominant: ["theta"],
    amplitudes: { delta: 0.3, theta: 1.0, alpha: 0.2, beta: 0.08, gamma: 0.03 },
    description: "N1/N2 sleep stages. Theta waves are primary with some delta.",
  },
  {
    id: "drowsy",
    label: "Drowsy",
    dominant: ["alpha", "theta"],
    amplitudes: { delta: 0.1, theta: 0.7, alpha: 0.8, beta: 0.15, gamma: 0.05 },
    description: "Hypnagogic state — transitioning to sleep. Alpha slowing to theta.",
  },
  {
    id: "relaxed",
    label: "Relaxed",
    dominant: ["alpha"],
    amplitudes: { delta: 0.05, theta: 0.3, alpha: 1.0, beta: 0.2, gamma: 0.05 },
    description: "Eyes closed, calm. Alpha is the idle rhythm of the relaxed brain.",
  },
  {
    id: "alert",
    label: "Alert",
    dominant: ["beta", "alpha"],
    amplitudes: { delta: 0.02, theta: 0.2, alpha: 0.5, beta: 0.9, gamma: 0.25 },
    description: "Eyes open, attentive. Beta rises as alpha decreases (alpha blocking).",
  },
  {
    id: "focused",
    label: "Focused",
    dominant: ["beta"],
    amplitudes: { delta: 0.02, theta: 0.15, alpha: 0.2, beta: 1.0, gamma: 0.45 },
    description: "Sustained concentration on a task. Beta at peak with rising gamma.",
  },
  {
    id: "peak",
    label: "Peak Performance",
    dominant: ["gamma", "beta"],
    amplitudes: { delta: 0.02, theta: 0.3, alpha: 0.3, beta: 0.8, gamma: 1.0 },
    description: "Flow state / peak cognition. Gamma synchrony binds information across the brain.",
  },
];

// ─── Canvas wave drawing ───────────────────────────────────────────────────────

const ROW_H = 80;
const CANVAS_W = 600;
const WAVE_PADDING = 12;

function drawWave(
  ctx: CanvasRenderingContext2D,
  wave: WaveConfig,
  rowY: number,
  phase: number,
  amplitudeMult: number
) {
  const midY = rowY + ROW_H / 2;
  const amp = wave.baseAmplitude * amplitudeMult * (ROW_H / 2 - WAVE_PADDING);
  const freq = wave.freqHz;

  // Background row
  ctx.fillStyle = amplitudeMult > 0.4 ? wave.color + "08" : "#00000000";
  ctx.fillRect(0, rowY, CANVAS_W, ROW_H);

  // Separator line
  ctx.strokeStyle = "#ffffff06";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, rowY + ROW_H);
  ctx.lineTo(CANVAS_W, rowY + ROW_H);
  ctx.stroke();

  // Baseline
  ctx.strokeStyle = "#ffffff05";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, midY);
  ctx.lineTo(CANVAS_W, midY);
  ctx.stroke();

  if (amplitudeMult < 0.015) return;

  // Glow pass
  ctx.save();
  ctx.strokeStyle = wave.color;
  ctx.lineWidth = amplitudeMult > 0.5 ? 3 : 1.5;
  ctx.shadowBlur = amplitudeMult > 0.5 ? 12 : 4;
  ctx.shadowColor = wave.glowColor;
  ctx.globalAlpha = Math.max(0.1, amplitudeMult);

  ctx.beginPath();
  for (let x = 0; x <= CANVAS_W; x += 1) {
    const t = (x / CANVAS_W) * 6 * Math.PI * (freq / 10) + phase;
    let y: number;

    if (wave.waveType === "irregular") {
      y = midY - (Math.sin(t) * amp * 0.7 + Math.sin(t * 1.618) * amp * 0.2 + Math.sin(t * 2.7) * amp * 0.1);
    } else if (wave.waveType === "sawtooth") {
      const saw = 2 * ((t / (2 * Math.PI)) % 1) - 1;
      y = midY - saw * amp;
    } else {
      y = midY - Math.sin(t) * amp;
    }

    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function BrainwaveVisualizer() {
  const [selectedState, setSelectedState] = useState<string>("relaxed");
  const [hoveredWave, setHoveredWave] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phasesRef = useRef<Record<string, number>>({
    delta: 0, theta: 0, alpha: 0, beta: 0, gamma: 0,
  });
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const stateRef = useRef(selectedState);

  useEffect(() => { stateRef.current = selectedState; }, [selectedState]);

  const animate = useCallback((ts: number) => {
    if (lastTsRef.current === null) lastTsRef.current = ts;
    const dt = Math.min((ts - lastTsRef.current) / 1000, 0.05);
    lastTsRef.current = ts;

    // Advance phases
    for (const wave of WAVES) {
      phasesRef.current[wave.id] = (phasesRef.current[wave.id] ?? 0) + dt * wave.freqHz * 0.35;
    }

    // Draw
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, CANVAS_W, WAVES.length * ROW_H);
        const mentalState = MENTAL_STATES.find((s) => s.id === stateRef.current)!;
        WAVES.forEach((wave, i) => {
          const mult = mentalState.amplitudes[wave.id] ?? 0;
          drawWave(ctx, wave, i * ROW_H, phasesRef.current[wave.id], mult);
        });
      }
    }

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [animate]);

  const activeState = MENTAL_STATES.find((s) => s.id === selectedState)!;

  return (
    <div className="my-8 rounded-xl border border-border bg-[#111] overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Brainwave Visualizer</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          All 5 brain oscillations — select a mental state to see which waves dominate
        </p>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Main canvas area */}
        <div className="flex-1 bg-[#0d0d0d]">
          {/* Wave rows with labels */}
          <div className="relative">
            {/* Left labels overlay */}
            <div
              className="absolute left-0 top-0 bottom-0 flex flex-col"
              style={{ width: 120, zIndex: 1, pointerEvents: "none" }}
            >
              {WAVES.map((wave) => {
                const isActive = activeState.dominant.includes(wave.id);
                const mult = activeState.amplitudes[wave.id] ?? 0;
                return (
                  <div
                    key={wave.id}
                    className="flex flex-col justify-center px-2"
                    style={{
                      height: ROW_H,
                      opacity: mult < 0.1 ? 0.3 : 1,
                    }}
                  >
                    <span
                      className="text-xs font-bold leading-none"
                      style={{ color: wave.color }}
                    >
                      {wave.name}
                      {isActive && (
                        <span
                          className="ml-1 text-[8px] px-1 py-0.5 rounded"
                          style={{ backgroundColor: wave.color + "22", color: wave.color }}
                        >
                          dominant
                        </span>
                      )}
                    </span>
                    <span className="text-[9px] text-muted-foreground mt-0.5">{wave.freqRange}</span>
                  </div>
                );
              })}
            </div>

            {/* Right labels overlay */}
            <div
              className="absolute right-0 top-0 bottom-0 flex flex-col"
              style={{ width: 120, zIndex: 1, pointerEvents: "none" }}
            >
              {WAVES.map((wave) => {
                const mult = activeState.amplitudes[wave.id] ?? 0;
                return (
                  <div
                    key={wave.id}
                    className="flex flex-col justify-center px-2 text-right"
                    style={{ height: ROW_H, opacity: mult < 0.1 ? 0.3 : 1 }}
                  >
                    <span className="text-[9px] text-muted-foreground leading-tight">{wave.state}</span>
                  </div>
                );
              })}
            </div>

            {/* Canvas */}
            <div className="mx-[120px] overflow-hidden">
              <canvas
                ref={canvasRef}
                width={CANVAS_W}
                height={WAVES.length * ROW_H}
                className="w-full block"
                style={{ height: WAVES.length * ROW_H }}
              />
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="lg:w-64 border-t lg:border-t-0 lg:border-l border-border bg-[#0a0a0a] flex flex-col">
          {/* Mental state selector */}
          <div className="p-4 border-b border-border">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Mental State</div>
            <div className="flex flex-col gap-1">
              {MENTAL_STATES.map((state) => (
                <button
                  key={state.id}
                  onClick={() => setSelectedState(state.id)}
                  className={`text-left px-3 py-2 rounded-md text-xs transition-all ${
                    selectedState === state.id
                      ? "bg-muted border border-border text-foreground"
                      : "hover:bg-muted/40 text-muted-foreground border border-transparent hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {state.dominant.map((wId) => {
                        const w = WAVES.find((w) => w.id === wId)!;
                        return (
                          <span
                            key={wId}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: w.color }}
                          />
                        );
                      })}
                    </div>
                    {state.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* State description */}
          <div className="p-4 flex-1">
            <div className="text-xs font-semibold text-foreground mb-1">{activeState.label}</div>
            <p className="text-xs text-foreground/70 leading-5 mb-4">{activeState.description}</p>

            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Wave Intensity</div>
            <div className="flex flex-col gap-2">
              {WAVES.map((wave) => {
                const mult = activeState.amplitudes[wave.id] ?? 0;
                return (
                  <div key={wave.id} className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-medium w-10 shrink-0"
                      style={{ color: wave.color }}
                    >
                      {wave.name}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${mult * 100}%`,
                          backgroundColor: wave.color,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground w-6 text-right">
                      {Math.round(mult * 100)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Wave detail on hover / static info */}
          <div className="border-t border-border p-4">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">About Brainwaves</div>
            <div className="flex flex-col gap-2">
              {WAVES.map((wave) => (
                <button
                  key={wave.id}
                  onMouseEnter={() => setHoveredWave(wave.id)}
                  onMouseLeave={() => setHoveredWave(null)}
                  className="text-left"
                >
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: wave.color }} />
                    <span style={{ color: wave.color }}>{wave.name}</span>
                    <span className="text-muted-foreground">{wave.freqRange}</span>
                  </div>
                  {hoveredWave === wave.id && (
                    <p className="mt-1 text-[10px] text-foreground/70 leading-4 pl-3.5">
                      {wave.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
