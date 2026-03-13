"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, SkipBack, SkipForward } from "lucide-react";

const SPEEDS = [0.5, 1, 2, 4] as const;
type Speed = typeof SPEEDS[number];
const BASE_INTERVAL = 1200; // ms at 1x

// Logarithmic spiral: r = A · e^(B·θ)
const A = 12, B = 0.20;
const CX = 195, CY = 195;

function pt(theta: number): [number, number] {
  const r = A * Math.exp(B * theta);
  return [CX + r * Math.cos(theta), CY - r * Math.sin(theta)];
}

// Build SVG path for one chamber (outer arc t1→t2, then inner arc reversed)
function chamberPath(t1: number, t2: number, n = 60): string {
  const fwd = Array.from({ length: n + 1 }, (_, i) => {
    const t = t1 + (t2 - t1) * (i / n);
    const [x, y] = pt(t);
    return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const back = Array.from({ length: n + 1 }, (_, i) => {
    const t = t2 - (t2 - t1) * (i / n);
    const r2 = A * Math.exp(B * (t - 2 * Math.PI));
    const [x, y] = [CX + r2 * Math.cos(t), CY - r2 * Math.sin(t)];
    return `L${x.toFixed(2)},${y.toFixed(2)}`;
  });
  return [...fwd, ...back, "Z"].join(" ");
}

// Center dot path for umbilicus
function umbilicusPath(): string {
  const pts: string[] = [];
  for (let i = 0; i <= 80; i++) {
    const t = (i / 80) * 2 * Math.PI;
    const r = A * Math.exp(B * t) * 0.32;
    const x = CX + r * Math.cos(t);
    const y = CY - r * Math.sin(t);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return pts.join(" ") + " Z";
}

// The chambers: 6 phragmocone + 1 body chamber (unlabelled septa)
// Each chamber spans ~0.28π radians, starting at 2π (inner whorl boundary)
const N_CHAMBERS = 7;
const CHAMBER_START = 2 * Math.PI;
const BODY_CHAMBER_IDX = 6; // last one is body chamber
const CHAMBER_STEP = (1.8 * Math.PI) / (N_CHAMBERS - 1); // ~0.3π each

const CHAMBERS = Array.from({ length: N_CHAMBERS }, (_, i) => {
  const t1 = CHAMBER_START + i * CHAMBER_STEP;
  const t2 = CHAMBER_START + (i + 1) * CHAMBER_STEP;
  return { t1, t2, isBody: i === BODY_CHAMBER_IDX - 1 };
});

// Also the inner whorl
const INNER_WHORL = { t1: 0, t2: 2 * Math.PI };

const COLORS = [
  "#92400e50", "#78350f50", "#7c2d1250",
  "#b4530950", "#9a341250", "#7c2d1250",
  "#06554060", // body chamber
];

interface GrowthStep {
  label: string;
  description: string;
  formula: string;
  theta: number;
  r: number;
}

// Steps correspond to: inner whorl + 6 chambers appearing
function buildSteps(): GrowthStep[] {
  const steps: GrowthStep[] = [
    {
      label: "Protoconch",
      description: "The ammonite begins as a tiny coiled protoconch — the starting chamber secreted from the embryo.",
      formula: "r = A · e^(B · 0)",
      theta: 0,
      r: A,
    },
  ];

  // Inner whorl
  steps.push({
    label: "Inner Whorls",
    description: "The shell coils inward, completing the first revolution and establishing the umbilicus.",
    formula: `r = ${A} · e^(${B}·2π) = ${(A * Math.exp(B * 2 * Math.PI)).toFixed(1)}`,
    theta: 2 * Math.PI,
    r: A * Math.exp(B * 2 * Math.PI),
  });

  CHAMBERS.forEach((ch, i) => {
    const rVal = A * Math.exp(B * ch.t2);
    steps.push({
      label: ch.isBody ? "Body Chamber" : `Chamber ${i + 1}`,
      description: ch.isBody
        ? "The final body chamber seals the phragmocone. The animal lives here, extending its tentacles through the aperture."
        : `A new septum is secreted. The previous chamber is sealed, gas is pumped in via the siphuncle, and the animal moves forward.`,
      formula: `r = ${A} · e^(${B}·${(ch.t2 / Math.PI).toFixed(2)}π) = ${rVal.toFixed(1)}`,
      theta: ch.t2,
      r: rVal,
    });
  });

  return steps;
}

const STEPS = buildSteps();
const TOTAL_STEPS = STEPS.length;

export function ShellGrowthAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setStep((s) => {
          if (s >= TOTAL_STEPS - 1) { setPlaying(false); return s; }
          return s + 1;
        });
      }, BASE_INTERVAL / speed);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, speed]);

  function reset() { setStep(0); setPlaying(false); }
  function togglePlay() {
    if (step >= TOTAL_STEPS - 1) { setStep(0); setPlaying(true); } else setPlaying((p) => !p);
  }
  function stepBack() { setPlaying(false); setStep((s) => Math.max(0, s - 1)); }
  function stepForward() { setPlaying(false); setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1)); }
  function cycleSpeed() {
    setSpeed((s) => {
      const idx = SPEEDS.indexOf(s);
      return SPEEDS[(idx + 1) % SPEEDS.length];
    });
  }

  const current = STEPS[step];
  // Number of chambers to show: step 0 = nothing, step 1 = inner whorl, step 2+ = chambers
  const showInnerWhorl = step >= 1;
  const chambersVisible = Math.max(0, step - 1);

  return (
    <div className="my-8 rounded-xl border border-border bg-[#111] overflow-hidden select-none">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Shell Growth Animation</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Watch the shell grow chamber by chamber following a logarithmic spiral</p>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* SVG */}
        <div className="flex-1 flex items-center justify-center bg-[#0d0d0d] p-4">
          <svg viewBox="0 0 390 390" className="max-w-full" style={{ maxHeight: 442 }}>
            {/* Umbilicus bg */}
            <AnimatePresence>
              {showInnerWhorl && (
                <motion.path
                  key="umbilicus"
                  d={umbilicusPath()}
                  fill="#1e293b"
                  stroke="#334155"
                  strokeWidth="1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                />
              )}
            </AnimatePresence>

            {/* Chambers */}
            <AnimatePresence>
              {CHAMBERS.slice(0, chambersVisible).map((ch, i) => (
                <motion.path
                  key={`ch-${i}`}
                  d={chamberPath(ch.t1, ch.t2)}
                  fill={COLORS[i]}
                  stroke="#ffffff18"
                  strokeWidth="1"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  style={{ transformOrigin: `${CX}px ${CY}px` }}
                />
              ))}
            </AnimatePresence>

            {/* Outer shell wall — draw up to current theta */}
            {(() => {
              if (step === 0) return null;
              const tEnd = step === 1 ? 2 * Math.PI : CHAMBERS[Math.min(chambersVisible - 1, CHAMBERS.length - 1)].t2;
              const pts = Array.from({ length: 120 }, (_, i) => {
                const t = (i / 119) * tEnd;
                const [x, y] = pt(t);
                return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
              }).join(" ");
              return <path d={pts} fill="none" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />;
            })()}

            {/* Current radius indicator */}
            {step > 0 && (() => {
              const [ex, ey] = pt(current.theta);
              return (
                <motion.g
                  key={step}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <circle cx={ex} cy={ey} r="5" fill="#fbbf24" opacity="0.9" />
                  <circle cx={ex} cy={ey} r="10" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.4" />
                </motion.g>
              );
            })()}

            {/* Center dot */}
            <circle cx={CX} cy={CY} r="3" fill="#475569" />

            {/* Step indicator dots */}
            <g>
              {STEPS.map((_, i) => (
                <circle
                  key={i}
                  cx={20 + i * 22}
                  cy={375}
                  r="4"
                  fill={i <= step ? "#fbbf24" : "#334155"}
                  className="cursor-pointer"
                  onClick={() => { setPlaying(false); setStep(i); }}
                />
              ))}
            </g>
          </svg>
        </div>

        {/* Info panel */}
        <div className="md:w-64 border-t md:border-t-0 md:border-l border-border bg-[#0a0a0a] p-5 flex flex-col gap-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col gap-3"
            >
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Step {step + 1} / {TOTAL_STEPS}</span>
                <h4 className="text-sm font-semibold text-foreground mt-1">{current.label}</h4>
              </div>
              <p className="text-xs text-foreground/75 leading-5">{current.description}</p>

              {/* Formula */}
              <div className="rounded-md bg-[#111] border border-border p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Spiral equation</p>
                <p className="font-mono text-[11px] text-amber-300">{current.formula}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">r = radius from center</p>
              </div>

              {/* Growth bar */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Shell progress</p>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full bg-amber-400 rounded-full"
                    animate={{ width: `${((step) / (TOTAL_STEPS - 1)) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="px-5 py-3 border-t border-border flex items-center gap-2 bg-[#0a0a0a]">
        <button onClick={reset} className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="Reset">
          <RotateCcw size={14} />
        </button>
        <button onClick={stepBack} className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="Step back" disabled={step === 0}>
          <SkipBack size={14} />
        </button>
        <button
          onClick={togglePlay}
          className={`p-1.5 rounded transition-colors ${playing ? "text-amber-400 bg-amber-400/10" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button onClick={stepForward} className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="Step forward" disabled={step === TOTAL_STEPS - 1}>
          <SkipForward size={14} />
        </button>
        <div className="flex gap-1 mx-1">
          {STEPS.map((s, i) => (
            <button
              key={i}
              onClick={() => { setPlaying(false); setStep(i); }}
              className={`h-1.5 rounded-full transition-all ${i <= step ? "bg-amber-400" : "bg-muted"}`}
              style={{ width: i === step ? 20 : 6 }}
              title={s.label}
            />
          ))}
        </div>
        <button
          onClick={cycleSpeed}
          className="ml-auto text-[10px] font-mono px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:border-amber-400/50 transition-colors"
          title="Change speed"
        >
          {speed}×
        </button>
        <span className="text-xs text-muted-foreground font-mono">{step + 1}/{TOTAL_STEPS}</span>
      </div>
    </div>
  );
}
