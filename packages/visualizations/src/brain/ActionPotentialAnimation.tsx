"use client";

import { useState, useEffect, useRef } from "react";
import { PlaybackControls } from "../shared/PlaybackControls";

// ─── Phase Data ────────────────────────────────────────────────────────────────

interface Phase {
  id: string;
  label: string;
  description: string;
  naStatus: "closed" | "opening" | "open" | "inactivating" | "closed";
  kStatus: "closed" | "closed" | "opening" | "open" | "closing";
  color: string;
}

const PHASES: Phase[] = [
  {
    id: "resting",
    label: "Resting State",
    description:
      "The neuron is at rest. The membrane potential is –70 mV — maintained by the Na⁺/K⁺ pump which continuously moves 3 Na⁺ out and 2 K⁺ in, keeping the inside negative.",
    naStatus: "closed",
    kStatus: "closed",
    color: "#60a5fa",
  },
  {
    id: "threshold",
    label: "Threshold Reached",
    description:
      "Incoming signals depolarize the membrane to –55 mV — the threshold. At this point, voltage-gated Na⁺ channels are triggered to open. This is a point of no return.",
    naStatus: "opening",
    kStatus: "closed",
    color: "#fbbf24",
  },
  {
    id: "depolarization",
    label: "Depolarization",
    description:
      "Na⁺ channels fly open. Sodium ions flood INTO the cell (high outside concentration + negative interior = strong driving force). Voltage rockets from –55 mV to +40 mV in under 1 ms.",
    naStatus: "open",
    kStatus: "closed",
    color: "#f87171",
  },
  {
    id: "repolarization",
    label: "Repolarization",
    description:
      "Na⁺ channels rapidly inactivate (blocked by their own inactivation gate). K⁺ channels open — potassium flows OUT, restoring negative charge inside. Voltage falls back toward –70 mV.",
    naStatus: "inactivating",
    kStatus: "open",
    color: "#34d399",
  },
  {
    id: "hyperpolarization",
    label: "Hyperpolarization",
    description:
      "K⁺ channels are slow to close. Too much K⁺ exits, driving voltage briefly below resting level to –80 mV. During this 'refractory period', another action potential cannot fire.",
    naStatus: "closed",
    kStatus: "closing",
    color: "#a78bfa",
  },
  {
    id: "recovery",
    label: "Recovery / Resting",
    description:
      "K⁺ channels fully close. The Na⁺/K⁺ pump restores ion gradients over ~1–2 ms. The neuron is ready to fire again. The entire action potential lasts only about 2–3 milliseconds.",
    naStatus: "closed",
    kStatus: "closed",
    color: "#60a5fa",
  },
];

// ─── Voltage Curve Data ────────────────────────────────────────────────────────
// x = 0..1 (normalized time), y = mV

function voltageAtT(t: number): number {
  // Resting: t 0–0.1 → -70
  if (t <= 0.1) return -70;
  // Rise to threshold: t 0.1–0.2 → -70 to -55
  if (t <= 0.2) return -70 + 15 * ((t - 0.1) / 0.1);
  // Depolarization: t 0.2–0.35 → -55 to +40
  if (t <= 0.35) return -55 + 95 * ((t - 0.2) / 0.15);
  // Repolarization: t 0.35–0.6 → +40 to -70
  if (t <= 0.6) return 40 - 110 * ((t - 0.35) / 0.25);
  // Hyperpolarization: t 0.6–0.72 → -70 to -80
  if (t <= 0.72) return -70 - 10 * ((t - 0.6) / 0.12);
  // Recovery: t 0.72–1.0 → -80 to -70
  return -80 + 10 * ((t - 0.72) / 0.28);
}

// Phase boundary t values (matches the curve above)
const PHASE_T_ENDS = [0.1, 0.2, 0.35, 0.6, 0.72, 1.0];

// SVG chart constants
const W = 500;
const H = 200;
const PAD_L = 52;
const PAD_R = 16;
const PAD_T = 18;
const PAD_B = 28;
const CW = W - PAD_L - PAD_R;
const CH = H - PAD_T - PAD_B;

const MV_MIN = -90;
const MV_MAX = 50;

function xFromT(t: number) {
  return PAD_L + t * CW;
}
function yFromMv(mv: number) {
  return PAD_T + (1 - (mv - MV_MIN) / (MV_MAX - MV_MIN)) * CH;
}

// Pre-compute full path
const N_POINTS = 200;
const FULL_POINTS = Array.from({ length: N_POINTS + 1 }, (_, i) => {
  const t = i / N_POINTS;
  return { t, mv: voltageAtT(t), x: xFromT(t), y: yFromMv(voltageAtT(t)) };
});

function buildPath(points: typeof FULL_POINTS, upToT: number): string {
  const pts = points.filter((p) => p.t <= upToT);
  if (pts.length < 2) return "";
  return pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");
}

// Reference lines
const REFERENCE_MVS = [
  { mv: 40, label: "+40 mV", color: "#f87171" },
  { mv: 0, label: "0 mV", color: "#64748b" },
  { mv: -55, label: "–55 mV (threshold)", color: "#fbbf24" },
  { mv: -70, label: "–70 mV (rest)", color: "#60a5fa" },
  { mv: -80, label: "–80 mV", color: "#a78bfa" },
];

// ─── Ion Channel Badge ─────────────────────────────────────────────────────────

function IonBadge({
  ion,
  status,
}: {
  ion: string;
  status: string;
}) {
  const isOpen = status === "open" || status === "opening";
  const isInactivating = status === "inactivating";
  const isClosing = status === "closing";

  let bg = "bg-muted/40";
  let textColor = "text-muted-foreground";
  let dotColor = "#475569";
  let label = "Closed";

  if (isOpen) {
    bg = "bg-green-500/15";
    textColor = "text-green-400";
    dotColor = "#4ade80";
    label = "Open";
  } else if (isInactivating) {
    bg = "bg-orange-500/15";
    textColor = "text-orange-400";
    dotColor = "#fb923c";
    label = "Inactivating";
  } else if (isClosing) {
    bg = "bg-yellow-500/15";
    textColor = "text-yellow-400";
    dotColor = "#facc15";
    label = "Closing";
  } else if (status === "opening") {
    bg = "bg-green-500/15";
    textColor = "text-green-400";
    dotColor = "#4ade80";
    label = "Opening";
  }

  return (
    <div
      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-mono border border-border ${bg}`}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: dotColor }}
      />
      <span className={textColor}>
        <span className="text-muted-foreground mr-1">{ion}</span>
        {label}
      </span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ActionPotentialAnimation() {
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1200);
  const [animT, setAnimT] = useState(0); // 0..1 continuous animation progress
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number | null>(null);

  // Phase → t range
  const phaseStartT = phase === 0 ? 0 : PHASE_T_ENDS[phase - 1];
  const phaseEndT = PHASE_T_ENDS[phase];

  // Set animT to end of current phase for display
  useEffect(() => {
    setAnimT(phaseEndT);
  }, [phaseEndT]);

  const currentPhase = PHASES[phase];

  function reset() {
    setPhase(0);
    setPlaying(false);
    setAnimT(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  function togglePlay() {
    if (phase >= PHASES.length - 1) {
      setPhase(0);
      setAnimT(0);
      setPlaying(true);
    } else {
      setPlaying((p) => !p);
    }
  }

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setPhase((p) => {
          if (p >= PHASES.length - 1) {
            setPlaying(false);
            return p;
          }
          return p + 1;
        });
      }, speed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, speed]);

  // Animated dot at current voltage
  const currentT = phaseEndT;
  const dotX = xFromT(currentT);
  const dotY = yFromMv(voltageAtT(currentT));

  const displayT = Math.min(phaseEndT, animT + 0.001);
  const linePath = buildPath(FULL_POINTS, displayT);

  // Area under curve (filled)
  const areaPath =
    linePath +
    ` L${xFromT(displayT)},${yFromMv(MV_MIN)} L${xFromT(0)},${yFromMv(MV_MIN)} Z`;

  return (
    <div className="my-8 rounded-xl border border-border bg-[#111] overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">
          Action Potential Animation
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Membrane voltage (mV) over time — step through each phase
        </p>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Chart */}
        <div className="flex-1 bg-[#0d0d0d] p-4 flex flex-col gap-3">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            style={{ height: 220 }}
          >
            {/* Reference lines */}
            {REFERENCE_MVS.map(({ mv, label, color }) => (
              <g key={mv}>
                <line
                  x1={PAD_L}
                  y1={yFromMv(mv)}
                  x2={W - PAD_R}
                  y2={yFromMv(mv)}
                  stroke={color}
                  strokeWidth="0.8"
                  strokeDasharray="5,4"
                  opacity="0.4"
                />
                <text
                  x={PAD_L - 4}
                  y={yFromMv(mv) + 3.5}
                  fill={color}
                  fontSize="7.5"
                  textAnchor="end"
                  opacity="0.8"
                >
                  {label.split(" ")[0]}
                </text>
              </g>
            ))}

            {/* Y axis label */}
            <text
              x={8}
              y={H / 2}
              fill="#475569"
              fontSize="8"
              textAnchor="middle"
              transform={`rotate(-90, 8, ${H / 2})`}
            >
              Voltage (mV)
            </text>

            {/* X axis label */}
            <text
              x={W / 2}
              y={H - 4}
              fill="#475569"
              fontSize="8"
              textAnchor="middle"
            >
              Time (≈ 3 ms total)
            </text>

            {/* Phase background regions */}
            {PHASES.map((ph, i) => {
              const x1 = xFromT(i === 0 ? 0 : PHASE_T_ENDS[i - 1]);
              const x2 = xFromT(PHASE_T_ENDS[i]);
              const isActive = phase === i;
              return (
                <rect
                  key={ph.id}
                  x={x1}
                  y={PAD_T}
                  width={x2 - x1}
                  height={CH}
                  fill={isActive ? ph.color + "12" : "transparent"}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Area fill */}
            {linePath && (
              <path d={areaPath} fill={currentPhase.color + "15"} />
            )}

            {/* Voltage curve */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke={currentPhase.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Current phase label at top of region */}
            {PHASES.map((ph, i) => {
              if (i > phase) return null;
              const x1 = xFromT(i === 0 ? 0 : PHASE_T_ENDS[i - 1]);
              const x2 = xFromT(PHASE_T_ENDS[i]);
              const cx = (x1 + x2) / 2;
              return (
                <text
                  key={ph.id}
                  x={cx}
                  y={PAD_T + 10}
                  fill={i === phase ? ph.color : ph.color + "50"}
                  fontSize="7.5"
                  textAnchor="middle"
                  fontWeight={i === phase ? "bold" : "normal"}
                >
                  {ph.label.split(" ")[0]}
                </text>
              );
            })}

            {/* Current point dot */}
            <circle
              cx={dotX}
              cy={dotY}
              r="5"
              fill={currentPhase.color}
              opacity="0.9"
            />
            <circle
              cx={dotX}
              cy={dotY}
              r="10"
              fill="none"
              stroke={currentPhase.color}
              strokeWidth="1"
              opacity="0.4"
            />

            {/* Voltage readout */}
            <text
              x={dotX + 14}
              y={dotY + 4}
              fill={currentPhase.color}
              fontSize="9"
              fontFamily="ui-monospace, monospace"
            >
              {voltageAtT(currentT).toFixed(0)} mV
            </text>
          </svg>

          {/* Ion channel badges */}
          <div className="flex items-center gap-2 px-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground mr-1">
              Ion channels:
            </span>
            <IonBadge ion="Na⁺" status={currentPhase.naStatus} />
            <IonBadge ion="K⁺" status={currentPhase.kStatus} />
          </div>

          <PlaybackControls
            isPlaying={playing}
            onTogglePlay={togglePlay}
            onStepBack={() => {
              setPlaying(false);
              setPhase((p) => Math.max(0, p - 1));
            }}
            onStepForward={() => {
              setPlaying(false);
              setPhase((p) => Math.min(PHASES.length - 1, p + 1));
            }}
            onReset={reset}
            disableBack={phase === 0}
            disableFwd={phase === PHASES.length - 1}
            speed={speed}
            onSpeedChange={setSpeed}
            minMs={300}
            maxMs={3000}
            accentColor={currentPhase.color}
          >
            {/* Phase dots */}
            <div className="flex gap-1 mx-2">
              {PHASES.map((ph, i) => (
                <button
                  key={ph.id}
                  onClick={() => {
                    setPlaying(false);
                    setPhase(i);
                  }}
                  className="rounded-full transition-all"
                  style={{
                    width: i === phase ? 20 : 6,
                    height: 6,
                    backgroundColor: i <= phase ? ph.color : "#1e293b",
                  }}
                  title={ph.label}
                />
              ))}
            </div>
            <span className="ml-auto text-xs text-muted-foreground font-mono">
              {phase + 1}/{PHASES.length}
            </span>
          </PlaybackControls>
        </div>

        {/* Phase description panel */}
        <div className="lg:w-72 border-t lg:border-t-0 lg:border-l border-border bg-[#0a0a0a] p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: currentPhase.color }}
            />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Phase {phase + 1} of {PHASES.length}
            </span>
          </div>

          <h4
            className="text-sm font-semibold"
            style={{ color: currentPhase.color }}
          >
            {currentPhase.label}
          </h4>

          <p className="text-xs text-foreground/80 leading-5 flex-1">
            {currentPhase.description}
          </p>

          {/* Reference mV guide */}
          <div className="rounded-md border border-border bg-muted/10 p-3 space-y-1.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              Voltage reference
            </p>
            {REFERENCE_MVS.map(({ mv, label, color }) => (
              <div key={mv} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-0.5 shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[11px] font-mono text-foreground/70">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
