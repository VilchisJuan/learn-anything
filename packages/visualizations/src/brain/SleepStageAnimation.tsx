"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { ReactElement } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────

type SleepStage = "Wake" | "REM" | "N1" | "N2" | "N3";

interface StageInfo {
  label: string;
  description: string;
  eyeMovement: string;
  muscleTone: string;
  dreaming: string;
  percentage: string;
  color: string;
  yIndex: number; // 0 = Wake (top), 4 = N3 (bottom)
  waveFreq: number;   // Hz for visualization
  waveAmp: number;    // relative amplitude 0-1
  waveType: "beta" | "theta" | "spindle" | "delta" | "rem";
}

const STAGE_INFO: Record<SleepStage, StageInfo> = {
  Wake: {
    label: "Awake",
    description: "Fully conscious state. Brain is highly active processing sensory input.",
    eyeMovement: "Rapid, voluntary",
    muscleTone: "Full tone",
    dreaming: "No",
    percentage: "~5%",
    color: "#f87171",
    yIndex: 0,
    waveFreq: 20,
    waveAmp: 0.25,
    waveType: "beta",
  },
  REM: {
    label: "REM Sleep",
    description: "Rapid Eye Movement sleep. Vivid dreaming, memory consolidation, emotional processing.",
    eyeMovement: "Rapid, random (REMs)",
    muscleTone: "Atonia (paralyzed)",
    dreaming: "Vivid, narrative dreams",
    percentage: "~25%",
    color: "#a78bfa",
    yIndex: 1,
    waveFreq: 15,
    waveAmp: 0.3,
    waveType: "rem",
  },
  N1: {
    label: "N1 — Light Sleep",
    description: "Transition from wakefulness. Hypnic jerks may occur. Easily awakened.",
    eyeMovement: "Slow, rolling",
    muscleTone: "Reduced",
    dreaming: "Hypnagogic hallucinations possible",
    percentage: "~5%",
    color: "#fbbf24",
    yIndex: 2,
    waveFreq: 6,
    waveAmp: 0.5,
    waveType: "theta",
  },
  N2: {
    label: "N2 — Core Sleep",
    description: "True sleep onset. Sleep spindles and K-complexes suppress external awareness.",
    eyeMovement: "None",
    muscleTone: "Further reduced",
    dreaming: "Fragmented, thought-like",
    percentage: "~45%",
    color: "#34d399",
    yIndex: 3,
    waveFreq: 13,
    waveAmp: 0.4,
    waveType: "spindle",
  },
  N3: {
    label: "N3 — Deep Sleep",
    description: "Slow-wave sleep. Physical restoration, immune function, memory consolidation for facts.",
    eyeMovement: "None",
    muscleTone: "Very low",
    dreaming: "Rare, non-vivid",
    percentage: "~20%",
    color: "#60a5fa",
    yIndex: 4,
    waveFreq: 2,
    waveAmp: 0.95,
    waveType: "delta",
  },
};

// Hypnogram: [timeHours, stage]
const HYPNOGRAM: [number, SleepStage][] = [
  [0.0,  "Wake"],
  [0.1,  "N1"],
  [0.25, "N2"],
  [0.5,  "N3"],
  [1.5,  "N2"],
  [1.75, "REM"],
  [2.0,  "N2"],
  [2.5,  "N3"],
  [3.5,  "N2"],
  [3.75, "REM"],
  [4.25, "N2"],
  [4.75, "REM"],
  [5.25, "N1"],
  [5.5,  "N2"],
  [5.75, "REM"],
  [6.25, "N1"],
  [6.5,  "N2"],
  [6.75, "REM"],
  [7.5,  "N1"],
  [7.75, "Wake"],
  [8.0,  "Wake"],
];

const TOTAL_HOURS = 8;
const SPEED_OPTIONS = [1, 5, 10, 30] as const;

// SVG chart dimensions
const CW = 560; // chart width
const CH = 160; // chart height
const PAD_L = 48;
const PAD_R = 16;
const PAD_T = 12;
const PAD_B = 24;
const CHART_W = CW - PAD_L - PAD_R;
const CHART_H = CH - PAD_T - PAD_B;
const Y_STAGES: SleepStage[] = ["Wake", "REM", "N1", "N2", "N3"];

function stageToY(stage: SleepStage): number {
  const idx = Y_STAGES.indexOf(stage);
  return PAD_T + (idx / (Y_STAGES.length - 1)) * CHART_H;
}

function hourToX(h: number): number {
  return PAD_L + (h / TOTAL_HOURS) * CHART_W;
}

function getCurrentStage(timeHours: number): SleepStage {
  let stage: SleepStage = "Wake";
  for (let i = 0; i < HYPNOGRAM.length; i++) {
    if (HYPNOGRAM[i][0] <= timeHours) {
      stage = HYPNOGRAM[i][1];
    } else {
      break;
    }
  }
  return stage;
}

function buildHypnogramPath(): string {
  let d = "";
  for (let i = 0; i < HYPNOGRAM.length; i++) {
    const [h, stage] = HYPNOGRAM[i];
    const x = hourToX(h);
    const y = stageToY(stage);
    if (i === 0) {
      d += `M ${x} ${y}`;
    } else {
      // Step function: go to new Y first, then extend X
      const prevY = stageToY(HYPNOGRAM[i - 1][1]);
      d += ` L ${x} ${prevY} L ${x} ${y}`;
    }
  }
  return d;
}

const HYPNOGRAM_PATH = buildHypnogramPath();

// ─── Brainwave preview ────────────────────────────────────────────────────────

const WAVE_W = 560;
const WAVE_H = 80;

function drawBrainwave(
  ctx: CanvasRenderingContext2D,
  stage: SleepStage,
  phase: number
) {
  const info = STAGE_INFO[stage];
  ctx.clearRect(0, 0, WAVE_W, WAVE_H);

  const midY = WAVE_H / 2;
  const amp = info.waveAmp * (WAVE_H * 0.38);
  const freq = info.waveFreq;
  const color = info.color;

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 8;
  ctx.shadowColor = color;
  ctx.beginPath();

  for (let x = 0; x <= WAVE_W; x += 1) {
    const t = (x / WAVE_W) * 4 * Math.PI * (freq / 8) + phase;
    let y: number;

    if (info.waveType === "delta") {
      y = midY - Math.sin(t) * amp;
    } else if (info.waveType === "theta") {
      y = midY - Math.sin(t) * amp * (0.8 + 0.2 * Math.sin(t * 0.5));
    } else if (info.waveType === "spindle") {
      // Sleep spindles: bursts of 12-14 Hz
      const burst = Math.pow(Math.sin(t * 0.08), 2);
      y = midY - Math.sin(t) * amp * burst;
    } else if (info.waveType === "beta") {
      // Irregular beta
      y = midY - (Math.sin(t) * amp * 0.7 + Math.sin(t * 1.7) * amp * 0.3);
    } else {
      // REM: mixed with sawtooth component
      const saw = ((t % (2 * Math.PI)) / Math.PI) - 1;
      y = midY - (Math.sin(t) * amp * 0.6 + saw * amp * 0.25);
    }

    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Draw baseline
  ctx.strokeStyle = "#ffffff08";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, midY);
  ctx.lineTo(WAVE_W, midY);
  ctx.stroke();
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function SleepStageAnimation() {
  const [timeHours, setTimeHours] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1); // default 5x
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const playingRef = useRef(false);
  const speedRef = useRef<number>(SPEED_OPTIONS[1]);

  const currentStage = getCurrentStage(timeHours);
  const info = STAGE_INFO[currentStage];

  // Keep refs in sync
  useEffect(() => { timeRef.current = timeHours; }, [timeHours]);
  useEffect(() => { playingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { speedRef.current = SPEED_OPTIONS[speedIdx]; }, [speedIdx]);

  // Animation loop
  const animate = useCallback((timestamp: number) => {
    if (lastTimestampRef.current === null) {
      lastTimestampRef.current = timestamp;
    }
    const dt = (timestamp - lastTimestampRef.current) / 1000; // seconds
    lastTimestampRef.current = timestamp;

    // Advance time: 1 real second = speed * (8 hours / 60) simulated minutes
    // speed 1x: 1s = 1 sim-min  → 1 night takes ~480s (8 min real)
    // speed 5x: 1s = 5 sim-min  → 1 night takes ~96s
    // speed 10x: 1s = 10 sim-min
    if (playingRef.current) {
      const hoursPerSecond = speedRef.current / 60;
      timeRef.current = Math.min(TOTAL_HOURS, timeRef.current + dt * hoursPerSecond);
      setTimeHours(timeRef.current);
      if (timeRef.current >= TOTAL_HOURS) {
        playingRef.current = false;
        setIsPlaying(false);
      }
    }

    // Advance wave phase
    const stage = getCurrentStage(timeRef.current);
    const stageInfo = STAGE_INFO[stage];
    phaseRef.current += dt * stageInfo.waveFreq * 0.5;

    // Draw canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) drawBrainwave(ctx, stage, phaseRef.current);
    }

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [animate]);

  function handleTogglePlay() {
    if (timeHours >= TOTAL_HOURS) {
      timeRef.current = 0;
      setTimeHours(0);
      lastTimestampRef.current = null;
      setIsPlaying(true);
    } else {
      setIsPlaying((p) => !p);
    }
  }

  function handleReset() {
    timeRef.current = 0;
    setTimeHours(0);
    lastTimestampRef.current = null;
    setIsPlaying(false);
  }

  function handleScrub(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value);
    timeRef.current = val;
    setTimeHours(val);
    lastTimestampRef.current = null;
  }

  const cursorX = hourToX(timeHours);
  const progress = timeHours / TOTAL_HOURS;

  return (
    <div className="my-8 rounded-xl border border-border bg-[#111] overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Sleep Stage Hypnogram</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          A full night of sleep — 5 stages across 8 hours with live brainwave preview
        </p>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Left: Chart + Wave */}
        <div className="flex-1 bg-[#0d0d0d] flex flex-col gap-0">
          {/* Hypnogram */}
          <div className="p-4 pb-2">
            <svg
              viewBox={`0 0 ${CW} ${CH}`}
              className="w-full"
              style={{ height: 180 }}
            >
              {/* Grid lines */}
              {Y_STAGES.map((s) => (
                <line
                  key={s}
                  x1={PAD_L}
                  y1={stageToY(s)}
                  x2={CW - PAD_R}
                  y2={stageToY(s)}
                  stroke="#ffffff07"
                  strokeWidth="1"
                />
              ))}
              {/* X axis hour marks */}
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                <g key={h}>
                  <line
                    x1={hourToX(h)}
                    y1={PAD_T}
                    x2={hourToX(h)}
                    y2={CH - PAD_B}
                    stroke="#ffffff05"
                    strokeWidth="1"
                  />
                  <text x={hourToX(h)} y={CH - 6} fill="#475569" fontSize="9" textAnchor="middle">
                    {h}h
                  </text>
                </g>
              ))}

              {/* Y axis labels */}
              {Y_STAGES.map((s) => (
                <text
                  key={s}
                  x={PAD_L - 5}
                  y={stageToY(s) + 4}
                  fill={STAGE_INFO[s].color}
                  fontSize="9"
                  textAnchor="end"
                  fontWeight="600"
                >
                  {s}
                </text>
              ))}

              {/* REM bands (highlight) */}
              {(() => {
                const bands: ReactElement[] = [];
                let inRem = false;
                let startX = 0;
                for (let i = 0; i < HYPNOGRAM.length; i++) {
                  const [h, stage] = HYPNOGRAM[i];
                  if (stage === "REM" && !inRem) {
                    inRem = true;
                    startX = hourToX(h);
                  } else if (stage !== "REM" && inRem) {
                    inRem = false;
                    const endX = hourToX(HYPNOGRAM[i][0]);
                    bands.push(
                      <rect
                        key={`rem-${i}`}
                        x={startX}
                        y={PAD_T}
                        width={endX - startX}
                        height={CHART_H}
                        fill={STAGE_INFO.REM.color}
                        opacity={0.04}
                      />
                    );
                  }
                }
                return bands;
              })()}

              {/* Hypnogram path */}
              <path
                d={HYPNOGRAM_PATH}
                fill="none"
                stroke="#475569"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />

              {/* Progress fill */}
              {timeHours > 0 && (
                <path
                  d={(() => {
                    let d = "";
                    for (let i = 0; i < HYPNOGRAM.length; i++) {
                      const [h, stage] = HYPNOGRAM[i];
                      if (h > timeHours) break;
                      const x = hourToX(h);
                      const y = stageToY(stage);
                      if (i === 0) {
                        d += `M ${x} ${y}`;
                      } else {
                        const prevY = stageToY(HYPNOGRAM[i - 1][1]);
                        d += ` L ${x} ${prevY} L ${x} ${y}`;
                      }
                    }
                    // Add cursor position
                    const curStage = getCurrentStage(timeHours);
                    d += ` L ${cursorX} ${stageToY(curStage)}`;
                    return d;
                  })()}
                  fill="none"
                  stroke={info.color}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
              )}

              {/* Cursor */}
              <line
                x1={cursorX}
                y1={PAD_T - 4}
                x2={cursorX}
                y2={CH - PAD_B}
                stroke={info.color}
                strokeWidth="1.5"
                strokeDasharray="3 2"
              />
              <circle cx={cursorX} cy={stageToY(currentStage)} r="5" fill={info.color} />
              <circle cx={cursorX} cy={stageToY(currentStage)} r="9" fill={info.color} opacity={0.2} />
            </svg>
          </div>

          {/* Scrubber */}
          <div className="px-4 pb-2">
            <input
              type="range"
              min={0}
              max={TOTAL_HOURS}
              step={0.01}
              value={timeHours}
              onChange={handleScrub}
              className="w-full h-1"
              style={{ accentColor: info.color } as React.CSSProperties}
            />
          </div>

          {/* Brainwave canvas */}
          <div className="px-4 pb-2">
            <div className="text-[10px] text-muted-foreground mb-1.5 px-0.5">
              Live brainwave — {currentStage === "N2" ? "Sleep spindles (12–14 Hz)" :
                currentStage === "N3" ? "Delta waves (0.5–4 Hz)" :
                currentStage === "REM" ? "Mixed / sawtooth waves" :
                currentStage === "N1" ? "Theta waves (4–8 Hz)" :
                "Beta waves (13–30 Hz)"}
            </div>
            <div className="rounded-lg border border-border bg-[#080808] overflow-hidden">
              <canvas
                ref={canvasRef}
                width={WAVE_W}
                height={WAVE_H}
                className="w-full block"
                style={{ height: 80 }}
              />
            </div>
          </div>

          {/* Playback controls */}
          <div className="px-4 py-3 border-t border-border flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-sm rounded-md bg-muted hover:bg-muted/80 text-foreground border border-border"
            >
              Reset
            </button>
            <button
              onClick={handleTogglePlay}
              className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isPlaying ? "Pause" : timeHours >= TOTAL_HOURS ? "Replay" : "Play"}
            </button>

            <div className="flex items-center gap-1 ml-auto">
              <span className="text-[10px] text-muted-foreground mr-1">Speed</span>
              {SPEED_OPTIONS.map((s, i) => (
                <button
                  key={s}
                  onClick={() => setSpeedIdx(i)}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    speedIdx === i
                      ? "border-border bg-muted text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s}×
                </button>
              ))}
            </div>

            <span className="text-xs font-mono text-muted-foreground ml-2 shrink-0">
              {Math.floor(timeHours)}h {Math.round((timeHours % 1) * 60).toString().padStart(2, "0")}m
            </span>
          </div>
        </div>

        {/* Right: Stage info */}
        <div className="lg:w-64 border-t lg:border-t-0 lg:border-l border-border bg-[#0a0a0a] flex flex-col p-4 gap-4">
          <div>
            <div
              className="text-xs font-bold px-2 py-1 rounded-md inline-block mb-2"
              style={{ backgroundColor: info.color + "22", color: info.color }}
            >
              {currentStage}
            </div>
            <div className="text-sm font-semibold text-foreground mb-1" style={{ color: info.color }}>
              {info.label}
            </div>
            <p className="text-xs text-foreground/70 leading-5">{info.description}</p>
          </div>

          <div className="flex flex-col gap-2 text-xs">
            {[
              { label: "Eye Movement", value: info.eyeMovement },
              { label: "Muscle Tone", value: info.muscleTone },
              { label: "Dreaming", value: info.dreaming },
              { label: "% of Sleep", value: info.percentage },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-2">
                <span className="text-muted-foreground shrink-0">{label}</span>
                <span className="text-foreground/80 text-right">{value}</span>
              </div>
            ))}
          </div>

          {/* Stage legend */}
          <div className="border-t border-border pt-3 mt-auto">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">All Stages</div>
            <div className="flex flex-col gap-1.5">
              {Y_STAGES.map((s) => (
                <div
                  key={s}
                  className="flex items-center gap-2 text-[10px]"
                  style={{ opacity: currentStage === s ? 1 : 0.45 }}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: STAGE_INFO[s].color }}
                  />
                  <span style={{ color: STAGE_INFO[s].color }}>{s}</span>
                  <span className="text-muted-foreground ml-auto">{STAGE_INFO[s].percentage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-muted">
        <div
          className="h-full transition-none"
          style={{ width: `${progress * 100}%`, backgroundColor: info.color }}
        />
      </div>
    </div>
  );
}
