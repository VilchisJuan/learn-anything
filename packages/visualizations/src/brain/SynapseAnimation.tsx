"use client";

import { useState, useEffect, useRef } from "react";
import { PlaybackControls } from "../shared/PlaybackControls";

// ─── Step Data ─────────────────────────────────────────────────────────────────

interface SynapseStep {
  id: string;
  label: string;
  description: string;
}

const STEPS: SynapseStep[] = [
  {
    id: "resting",
    label: "Resting State",
    description:
      "The presynaptic terminal is at rest. Synaptic vesicles (containing neurotransmitters) are docked near the active zone membrane. Voltage-gated Ca²⁺ channels are closed.",
  },
  {
    id: "ap-arrives",
    label: "Action Potential Arrives",
    description:
      "An action potential arrives at the presynaptic terminal, depolarizing the membrane. This opens voltage-gated Ca²⁺ channels, causing calcium ions to rush into the terminal.",
  },
  {
    id: "vesicles-move",
    label: "Vesicles Move to Membrane",
    description:
      "The Ca²⁺ influx triggers SNARE proteins to pull synaptic vesicles toward the presynaptic membrane. The vesicles dock tightly against the active zone.",
  },
  {
    id: "exocytosis",
    label: "Exocytosis (Vesicle Fusion)",
    description:
      "Vesicles fuse with the presynaptic membrane and burst open — releasing thousands of neurotransmitter molecules into the synaptic cleft. This process takes only ~1 ms.",
  },
  {
    id: "diffusion",
    label: "Neurotransmitters Diffuse",
    description:
      "Neurotransmitter molecules (e.g. glutamate, dopamine, GABA) diffuse across the 20–40 nm synaptic cleft. The small distance ensures rapid, efficient crossing.",
  },
  {
    id: "binding",
    label: "Receptor Binding",
    description:
      "Neurotransmitters bind to specific receptors on the postsynaptic membrane. Each receptor type only binds specific molecules — like a lock and key. Bound receptors open ion channels.",
  },
  {
    id: "reuptake",
    label: "Reuptake & Clearance",
    description:
      "To terminate the signal, transporter proteins on the presynaptic terminal (and nearby glial cells) reabsorb neurotransmitters. Remaining molecules are broken down by enzymes. Many antidepressants (SSRIs) block serotonin reuptake transporters.",
  },
];

// ─── SVG Layout Constants ──────────────────────────────────────────────────────
// viewBox 0 0 500 320
// Presynaptic: top half (y: 0–120)
// Cleft: y 120–160
// Postsynaptic: y 160–210

const SVG_W = 500;
const SVG_H = 320;

// Terminal outline
const TERM_X = 100;
const TERM_W = 300;
const TERM_Y = 20;
const TERM_H = 110;

// Cleft
const CLEFT_Y1 = 132;
const CLEFT_Y2 = 160;

// Postsynaptic
const POST_Y = 160;
const POST_H = 50;

// Vesicle positions (at rest) — 6 vesicles
const BASE_VESICLES = [
  { id: 0, cx: 180, cy: 75, r: 12 },
  { id: 1, cx: 215, cy: 60, r: 12 },
  { id: 2, cx: 250, cy: 75, r: 12 },
  { id: 3, cx: 285, cy: 60, r: 12 },
  { id: 4, cx: 320, cy: 75, r: 12 },
  { id: 5, cx: 355, cy: 60, r: 11 },
];

// Docked vesicle positions (moved to membrane)
const DOCKED_VESICLES = [
  { id: 0, cx: 180, cy: 118, r: 12 },
  { id: 1, cx: 210, cy: 118, r: 12 },
  { id: 2, cx: 245, cy: 118, r: 12 },
  { id: 3, cx: 280, cy: 118, r: 12 },
  { id: 4, cx: 315, cy: 118, r: 12 },
  { id: 5, cx: 350, cy: 118, r: 11 },
];

// NT molecules — distributed across cleft
const NT_MOLECULES_BASE = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  // spread across cleft x range, y spread between cleft y1 and y2
  cx: 155 + (i % 8) * 26 + (Math.floor(i / 8) % 2 === 0 ? 0 : 13),
  cy: CLEFT_Y1 + 4 + Math.floor(i / 8) * 9,
}));

// Receptor positions on postsynaptic membrane
const RECEPTORS = [
  { id: 0, cx: 170, bound: false },
  { id: 1, cx: 210, bound: false },
  { id: 2, cx: 250, bound: false },
  { id: 3, cx: 290, bound: false },
  { id: 4, cx: 330, bound: false },
  { id: 5, cx: 370, bound: false },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function Receptor({
  cx,
  bound,
  open,
}: {
  cx: number;
  bound: boolean;
  open: boolean;
}) {
  const color = bound ? "#34d399" : "#475569";
  const fillOpacity = bound ? 0.3 : 0.15;
  // Channel opening: two pillars that spread apart when open
  const spread = open ? 7 : 3;
  return (
    <g>
      {/* Left pillar */}
      <rect
        x={cx - spread - 5}
        y={POST_Y}
        width={5}
        height={POST_H - 5}
        rx="2"
        fill={color}
        fillOpacity={fillOpacity + 0.3}
        stroke={color}
        strokeWidth="0.8"
        className="transition-all duration-500"
      />
      {/* Right pillar */}
      <rect
        x={cx + spread}
        y={POST_Y}
        width={5}
        height={POST_H - 5}
        rx="2"
        fill={color}
        fillOpacity={fillOpacity + 0.3}
        stroke={color}
        strokeWidth="0.8"
        className="transition-all duration-500"
      />
      {/* Binding site top */}
      <path
        d={`M ${cx - spread - 5} ${POST_Y} Q ${cx} ${POST_Y - 10} ${cx + spread + 5} ${POST_Y}`}
        fill={color}
        fillOpacity={fillOpacity}
        stroke={color}
        strokeWidth="1"
        className="transition-all duration-500"
      />
      {/* Bound NT indicator */}
      {bound && (
        <circle
          cx={cx}
          cy={POST_Y - 6}
          r="4"
          fill="#34d399"
          opacity="0.9"
          className="transition-all duration-300"
        />
      )}
    </g>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SynapseAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1500);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStep = STEPS[step];

  // Derived visual state from step
  const apFlash = step === 1;
  const vesiclesDocked = step >= 2;
  const exocytosis = step >= 3;
  const showNTInCleft = step >= 4 && step < 6;
  const showNTBinding = step >= 5;
  const showReuptake = step >= 6;
  const receptorsBound = step >= 5;
  const channelsOpen = step >= 5 && step < 6;

  // Vesicle positions
  const vesicles = vesiclesDocked ? DOCKED_VESICLES : BASE_VESICLES;
  // After exocytosis, hide some vesicles
  const visibleVesicles = exocytosis ? vesicles.slice(3) : vesicles;

  function reset() {
    setStep(0);
    setPlaying(false);
  }

  function togglePlay() {
    if (step >= STEPS.length - 1) {
      setStep(0);
      setPlaying(true);
    } else {
      setPlaying((p) => !p);
    }
  }

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setStep((s) => {
          if (s >= STEPS.length - 1) {
            setPlaying(false);
            return s;
          }
          return s + 1;
        });
      }, speed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, speed]);

  // Ca2+ ion positions (appear on step 1)
  const caIons = [
    { cx: 155, cy: 95 },
    { cx: 370, cy: 90 },
    { cx: 145, cy: 110 },
    { cx: 385, cy: 108 },
  ];

  // Reuptake arrows
  const reuptakeArrows = [
    { x: 175, y: CLEFT_Y1 + 10 },
    { x: 360, y: CLEFT_Y1 + 10 },
  ];

  return (
    <div className="my-8 rounded-xl border border-border bg-[#111] overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">
          Synaptic Transmission
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Animated diagram of chemical synaptic transmission — step by step
        </p>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* SVG */}
        <div className="flex-1 bg-[#0d0d0d] p-4 flex items-center justify-center">
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="max-w-full"
            style={{ maxHeight: 380 }}
          >
            {/* ── Presynaptic Terminal ─────────────────────── */}
            <rect
              x={TERM_X}
              y={TERM_Y}
              width={TERM_W}
              height={TERM_H}
              rx="18"
              fill={apFlash ? "#1e3a5f" : "#111827"}
              stroke={apFlash ? "#60a5fa" : "#334155"}
              strokeWidth={apFlash ? "2.5" : "1.5"}
              className="transition-all duration-300"
            />

            {/* AP flash ring */}
            {apFlash && (
              <>
                <rect
                  x={TERM_X - 6}
                  y={TERM_Y - 6}
                  width={TERM_W + 12}
                  height={TERM_H + 12}
                  rx="22"
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="2"
                  opacity="0.5"
                  style={{
                    animation: "ping 1s ease-out infinite",
                  }}
                />
              </>
            )}

            <text
              x={TERM_X + TERM_W / 2}
              y={TERM_Y + 16}
              fill="#475569"
              fontSize="9"
              textAnchor="middle"
              fontFamily="ui-monospace, monospace"
            >
              PRESYNAPTIC TERMINAL
            </text>

            {/* Mitochondrion (energy source) */}
            <ellipse
              cx={145}
              cy={65}
              rx={28}
              ry={14}
              fill="#b45309"
              fillOpacity="0.3"
              stroke="#b45309"
              strokeWidth="1"
              opacity="0.6"
            />
            <text
              x={145}
              y={68}
              fill="#b45309"
              fontSize="7"
              textAnchor="middle"
            >
              mito.
            </text>

            {/* Ca2+ channel markers */}
            {[TERM_X + 14, TERM_X + TERM_W - 14].map((x, i) => (
              <g key={i}>
                <rect
                  x={x - 6}
                  y={TERM_Y + TERM_H - 16}
                  width={12}
                  height={16}
                  rx="3"
                  fill={step >= 1 ? "#60a5fa" : "#1e293b"}
                  stroke={step >= 1 ? "#60a5fa" : "#334155"}
                  strokeWidth="1"
                  className="transition-all duration-300"
                />
                <text
                  x={x}
                  y={TERM_Y + TERM_H - 4}
                  fill={step >= 1 ? "#93c5fd" : "#475569"}
                  fontSize="6"
                  textAnchor="middle"
                >
                  Ca²⁺
                </text>
              </g>
            ))}

            {/* Ca2+ ions entering */}
            {step === 1 &&
              caIons.map((ion, i) => (
                <g key={i}>
                  <circle
                    cx={ion.cx}
                    cy={ion.cy}
                    r="5"
                    fill="#60a5fa"
                    opacity="0.8"
                  />
                  <text
                    x={ion.cx}
                    y={ion.cy + 3}
                    fill="white"
                    fontSize="5"
                    textAnchor="middle"
                  >
                    Ca
                  </text>
                </g>
              ))}

            {/* Vesicles */}
            {visibleVesicles.map((v) => (
              <g key={v.id} className="transition-all duration-500">
                <circle
                  cx={v.cx}
                  cy={v.cy}
                  r={v.r}
                  fill="#7c3aed"
                  fillOpacity="0.35"
                  stroke="#a78bfa"
                  strokeWidth="1.2"
                />
                {/* NT dots inside vesicle */}
                {[
                  [-3, -2],
                  [3, -2],
                  [0, 3],
                ].map(([dx, dy], j) => (
                  <circle
                    key={j}
                    cx={v.cx + dx}
                    cy={v.cy + dy}
                    r={1.5}
                    fill="#c4b5fd"
                    opacity="0.8"
                  />
                ))}
              </g>
            ))}

            {/* Exocytosis burst effect */}
            {exocytosis && (
              <>
                {[180, 215, 250].map((cx, i) => (
                  <g key={i}>
                    <circle
                      cx={cx}
                      cy={CLEFT_Y1 - 2}
                      r="14"
                      fill="none"
                      stroke="#a78bfa"
                      strokeWidth="1"
                      opacity="0.4"
                    />
                    <circle
                      cx={cx}
                      cy={CLEFT_Y1 - 2}
                      r="8"
                      fill="#7c3aed"
                      fillOpacity="0.25"
                      stroke="#a78bfa"
                      strokeWidth="0.8"
                    />
                  </g>
                ))}
              </>
            )}

            {/* ── Synaptic Cleft ───────────────────────────── */}
            <rect
              x={TERM_X}
              y={CLEFT_Y1}
              width={TERM_W}
              height={CLEFT_Y2 - CLEFT_Y1}
              fill="#0f172a"
              stroke="none"
            />
            {/* cleft labels */}
            <text
              x={82}
              y={(CLEFT_Y1 + CLEFT_Y2) / 2 + 3}
              fill="#334155"
              fontSize="8"
              textAnchor="end"
              fontFamily="ui-monospace, monospace"
            >
              CLEFT
            </text>
            <text
              x={82}
              y={(CLEFT_Y1 + CLEFT_Y2) / 2 + 13}
              fill="#1e293b"
              fontSize="7"
              textAnchor="end"
            >
              ~30 nm
            </text>

            {/* NT molecules in cleft */}
            {showNTInCleft &&
              NT_MOLECULES_BASE.slice(0, showNTBinding ? 12 : 28).map((m) => (
                <circle
                  key={m.id}
                  cx={m.cx}
                  cy={m.cy}
                  r="3"
                  fill="#c4b5fd"
                  opacity="0.85"
                  className="transition-all duration-500"
                />
              ))}

            {/* Reuptake arrows */}
            {showReuptake &&
              reuptakeArrows.map((a, i) => (
                <g key={i}>
                  <path
                    d={`M ${a.x} ${a.y + 20} L ${a.x} ${a.y}`}
                    stroke="#a78bfa"
                    strokeWidth="1.5"
                    markerEnd="url(#arrowUp)"
                    strokeDasharray="3,2"
                    opacity="0.7"
                  />
                  {/* reuptake transporter */}
                  <rect
                    x={a.x - 8}
                    y={TERM_Y + TERM_H - 8}
                    width={16}
                    height={12}
                    rx="3"
                    fill="#4c1d95"
                    stroke="#a78bfa"
                    strokeWidth="0.8"
                    opacity="0.7"
                  />
                  <text
                    x={a.x}
                    y={TERM_Y + TERM_H + 1}
                    fill="#c4b5fd"
                    fontSize="5.5"
                    textAnchor="middle"
                  >
                    reup.
                  </text>
                </g>
              ))}

            {/* ── Postsynaptic Membrane ────────────────────── */}
            <rect
              x={TERM_X}
              y={POST_Y}
              width={TERM_W}
              height={POST_H}
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="1.5"
              rx="4"
            />
            <text
              x={TERM_X + TERM_W / 2}
              y={POST_Y + POST_H + 14}
              fill="#475569"
              fontSize="9"
              textAnchor="middle"
              fontFamily="ui-monospace, monospace"
            >
              POSTSYNAPTIC MEMBRANE
            </text>

            {/* Receptors */}
            {RECEPTORS.map((rec) => (
              <Receptor
                key={rec.id}
                cx={rec.cx}
                bound={receptorsBound}
                open={channelsOpen}
              />
            ))}

            {/* Ion flow into post-synaptic cell */}
            {channelsOpen && (
              <>
                {RECEPTORS.slice(0, 4).map((rec, i) => (
                  <g key={i}>
                    <text
                      x={rec.cx}
                      y={POST_Y + POST_H - 8}
                      fill="#34d399"
                      fontSize="7"
                      textAnchor="middle"
                      opacity="0.7"
                    >
                      Na⁺↓
                    </text>
                  </g>
                ))}
              </>
            )}

            {/* ── Step progress indicator ──────────────────── */}
            <g>
              {STEPS.map((s, i) => (
                <circle
                  key={i}
                  cx={TERM_X + 20 + i * 42}
                  cy={SVG_H - 18}
                  r="5"
                  fill={i <= step ? "#a78bfa" : "#1e293b"}
                  stroke={i === step ? "#a78bfa" : "#334155"}
                  strokeWidth={i === step ? "2" : "1"}
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => {
                    setPlaying(false);
                    setStep(i);
                  }}
                />
              ))}
            </g>

            {/* Arrow defs */}
            <defs>
              <marker
                id="arrowUp"
                markerWidth="6"
                markerHeight="6"
                refX="3"
                refY="6"
                orient="auto"
              >
                <path d="M0,6 L3,0 L6,6" fill="#a78bfa" />
              </marker>
            </defs>

            {/* AP label */}
            {step >= 1 && (
              <g>
                <text
                  x={TERM_X + TERM_W + 8}
                  y={65}
                  fill="#60a5fa"
                  fontSize="8"
                  fontFamily="ui-monospace, monospace"
                  opacity="0.8"
                >
                  ← AP
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Step Info Panel */}
        <div className="lg:w-72 border-t lg:border-t-0 lg:border-l border-border bg-[#0a0a0a] p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full shrink-0 bg-violet-400" />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Step {step + 1} of {STEPS.length}
            </span>
          </div>
          <h4 className="text-sm font-semibold text-foreground">
            {currentStep.label}
          </h4>
          <p className="text-xs text-foreground/80 leading-5 flex-1">
            {currentStep.description}
          </p>

          {/* Visual legend */}
          <div className="rounded-md border border-border bg-muted/10 p-3 space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Legend
            </p>
            {[
              { color: "#a78bfa", label: "Synaptic vesicles" },
              { color: "#c4b5fd", label: "Neurotransmitter molecules" },
              { color: "#34d399", label: "Bound receptors (open)" },
              { color: "#475569", label: "Unbound receptors (closed)" },
              { color: "#60a5fa", label: "Ca²⁺ ions / AP signal" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[11px] text-foreground/70">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PlaybackControls
        isPlaying={playing}
        onTogglePlay={togglePlay}
        onStepBack={() => {
          setPlaying(false);
          setStep((s) => Math.max(0, s - 1));
        }}
        onStepForward={() => {
          setPlaying(false);
          setStep((s) => Math.min(STEPS.length - 1, s + 1));
        }}
        onReset={reset}
        disableBack={step === 0}
        disableFwd={step === STEPS.length - 1}
        speed={speed}
        onSpeedChange={setSpeed}
        minMs={400}
        maxMs={3000}
        accentColor="#a78bfa"
      >
        <div className="flex gap-1 mx-2">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => {
                setPlaying(false);
                setStep(i);
              }}
              className="rounded-full transition-all"
              style={{
                width: i === step ? 20 : 6,
                height: 6,
                backgroundColor: i <= step ? "#a78bfa" : "#1e293b",
              }}
              title={s.label}
            />
          ))}
        </div>
        <span className="ml-auto text-xs text-muted-foreground font-mono">
          {step + 1}/{STEPS.length}
        </span>
      </PlaybackControls>
    </div>
  );
}
