"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw } from "lucide-react";

// ─── Data: species diversity 90 Ma → 63 Ma ────────────────────────────────────
// Ammonites vs Nautiloids across the K-Pg boundary at 66 Ma

interface DataPoint {
  ma: number;       // millions of years ago
  ammonite: number; // relative diversity 0–100
  nautiloid: number;
  label?: string;
  event?: string;
}

const DATA: DataPoint[] = [
  { ma: 90, ammonite: 85,  nautiloid: 30 },
  { ma: 85, ammonite: 87,  nautiloid: 29 },
  { ma: 80, ammonite: 83,  nautiloid: 28 },
  { ma: 76, ammonite: 78,  nautiloid: 27, label: "Latest Cretaceous", event: "Ammonite diversity already declining slightly — climate stress?" },
  { ma: 72, ammonite: 72,  nautiloid: 27 },
  { ma: 70, ammonite: 68,  nautiloid: 26 },
  { ma: 68, ammonite: 60,  nautiloid: 26, event: "Deccan Traps volcanism begins — major CO₂ and SO₂ emissions destabilize marine chemistry" },
  { ma: 67, ammonite: 52,  nautiloid: 25 },
  { ma: 66.5, ammonite: 40, nautiloid: 24 },
  { ma: 66.1, ammonite: 30, nautiloid: 23, label: "Months before impact" },
  { ma: 66.043, ammonite: 0, nautiloid: 18, label: "K-Pg Boundary (66 Ma)", event: "Chicxulub asteroid strikes Yucatán — 10 km impactor. Global firestorm, impact winter, ocean acidification. ALL ammonites extinct within days to years." },
  { ma: 65.8, ammonite: 0, nautiloid: 16, event: "Impact winter — global darkness collapses ocean food chains. Planktonic larvae (ammonite strategy) have nothing to eat." },
  { ma: 65, ammonite: 0, nautiloid: 14, label: "~1 Ma after impact", event: "Seas slowly recover. Nautiloids survive with benthic (deep-water) eggs that don't rely on surface plankton." },
  { ma: 64, ammonite: 0, nautiloid: 13 },
  { ma: 63, ammonite: 0, nautiloid: 12, label: "Paleocene recovery" },
];

const MA_MIN = 90;
const MA_MAX = 63;
const IMPACT_MA = 66.043;

const W = 480, H = 160, PAD_L = 40, PAD_R = 20, PAD_T = 16, PAD_B = 30;
const CHART_W = W - PAD_L - PAD_R;
const CHART_H = H - PAD_T - PAD_B;

function xPos(ma: number) { return PAD_L + ((MA_MIN - ma) / (MA_MIN - MA_MAX)) * CHART_W; }
function yPos(v: number)  { return PAD_T + (1 - v / 100) * CHART_H; }

function buildLine(points: DataPoint[], key: "ammonite" | "nautiloid"): string {
  return points.map((d, i) =>
    `${i === 0 ? "M" : "L"}${xPos(d.ma).toFixed(2)},${yPos(d[key]).toFixed(2)}`
  ).join(" ");
}

function buildArea(points: DataPoint[], key: "ammonite" | "nautiloid"): string {
  const top = buildLine(points, key);
  const last = points[points.length - 1];
  const first = points[0];
  return `${top} L${xPos(last.ma)},${yPos(0)} L${xPos(first.ma)},${yPos(0)} Z`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ExtinctionEvent() {
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  const [animStep, setAnimStep] = useState<number>(DATA.length - 1);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setAnimStep((s) => {
          if (s >= DATA.length - 1) { setPlaying(false); return s; }
          return s + 1;
        });
      }, 350);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing]);

  function reset() { setAnimStep(0); setPlaying(false); }
  function togglePlay() {
    if (animStep >= DATA.length - 1) { setAnimStep(0); setPlaying(true); }
    else setPlaying((p) => !p);
  }

  const visibleData = DATA.slice(0, animStep + 1);
  const activeInfo = hoveredPoint ?? DATA[animStep];

  return (
    <div className="my-8 rounded-xl border border-border bg-[#111] overflow-hidden select-none">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">The K-Pg Extinction Event</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Ammonites vs Nautiloids — 90 Ma to 63 Ma — click Play to animate
        </p>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Chart */}
        <div className="flex-1 bg-[#0d0d0d] p-4 flex flex-col gap-2">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((v) => (
              <g key={v}>
                <line x1={PAD_L} y1={yPos(v)} x2={W - PAD_R} y2={yPos(v)} stroke="#ffffff08" strokeWidth="1" />
                <text x={PAD_L - 4} y={yPos(v) + 4} fill="#475569" fontSize="8" textAnchor="end">{v}%</text>
              </g>
            ))}

            {/* X axis labels */}
            {[90, 80, 70, 66, 63].map((ma) => (
              <text key={ma} x={xPos(ma)} y={H - 4} fill="#475569" fontSize="8" textAnchor="middle">{ma} Ma</text>
            ))}

            {/* Impact line */}
            <line
              x1={xPos(IMPACT_MA)} y1={PAD_T}
              x2={xPos(IMPACT_MA)} y2={H - PAD_B}
              stroke="#f87171"
              strokeWidth="1.5"
              strokeDasharray="4,3"
            />
            <text x={xPos(IMPACT_MA) + 3} y={PAD_T + 10} fill="#f87171" fontSize="8">K-Pg</text>

            {/* Ammonite area */}
            {visibleData.length > 1 && (
              <motion.path
                key={`amm-area-${animStep}`}
                d={buildArea(visibleData, "ammonite")}
                fill="#f59e0b18"
                animate={{ opacity: 1 }}
                initial={{ opacity: 0 }}
              />
            )}
            {/* Nautiloid area */}
            {visibleData.length > 1 && (
              <path d={buildArea(visibleData, "nautiloid")} fill="#34d39918" />
            )}

            {/* Ammonite line */}
            {visibleData.length > 1 && (
              <motion.path
                d={buildLine(visibleData, "ammonite")}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {/* Nautiloid line */}
            {visibleData.length > 1 && (
              <path
                d={buildLine(visibleData, "nautiloid")}
                fill="none"
                stroke="#34d399"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data point hover targets */}
            {DATA.map((d, i) => (
              <circle
                key={i}
                cx={xPos(d.ma)}
                cy={yPos(d.ammonite)}
                r="8"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(d)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            ))}

            {/* Current point indicators */}
            {visibleData.length > 0 && (() => {
              const last = visibleData[visibleData.length - 1];
              return (
                <g>
                  <circle cx={xPos(last.ma)} cy={yPos(last.ammonite)} r="4" fill="#f59e0b" />
                  <circle cx={xPos(last.ma)} cy={yPos(last.nautiloid)} r="4" fill="#34d399" />
                </g>
              );
            })()}

            {/* Legend */}
            <g>
              <circle cx={PAD_L + 4} cy={PAD_T + 4} r="4" fill="#f59e0b" />
              <text x={PAD_L + 12} y={PAD_T + 8} fill="#f59e0b" fontSize="8">Ammonites</text>
              <circle cx={PAD_L + 80} cy={PAD_T + 4} r="4" fill="#34d399" />
              <text x={PAD_L + 88} y={PAD_T + 8} fill="#34d399" fontSize="8">Nautiloids</text>
            </g>
          </svg>

          {/* Controls */}
          <div className="flex items-center gap-2 pt-1">
            <button onClick={reset} className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <RotateCcw size={13} />
            </button>
            <button
              onClick={togglePlay}
              className={`p-1.5 rounded transition-colors ${playing ? "text-red-400 bg-red-400/10" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
            >
              {playing ? <Pause size={13} /> : <Play size={13} />}
            </button>
            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden mx-1">
              <motion.div
                className="h-full bg-red-400/70 rounded-full"
                animate={{ width: `${(animStep / (DATA.length - 1)) * 100}%` }}
                transition={{ duration: 0.25 }}
              />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">{DATA[animStep].ma} Ma</span>
          </div>
        </div>

        {/* Info panel */}
        <div className="lg:w-72 border-t lg:border-t-0 lg:border-l border-border bg-[#0a0a0a] p-5 flex flex-col gap-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeInfo.ma}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-3 flex-1"
            >
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {activeInfo.label ?? `${activeInfo.ma} Ma`}
                </span>
                <div className="flex items-center gap-4 mt-2">
                  <div>
                    <div className="text-[10px] text-amber-400/70 mb-0.5">Ammonites</div>
                    <div className="text-xl font-bold" style={{ color: activeInfo.ammonite === 0 ? "#f87171" : "#f59e0b" }}>
                      {activeInfo.ammonite}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-400/70 mb-0.5">Nautiloids</div>
                    <div className="text-xl font-bold text-emerald-400">{activeInfo.nautiloid}%</div>
                  </div>
                </div>
              </div>

              {activeInfo.event && (
                <div className={`rounded-md border p-3 text-xs leading-5 ${
                  activeInfo.ma <= IMPACT_MA + 0.1 && activeInfo.ma >= IMPACT_MA - 0.1
                    ? "border-red-500/40 bg-red-500/10 text-red-200"
                    : "border-border bg-muted/20 text-foreground/75"
                }`}>
                  {activeInfo.event}
                </div>
              )}

              {/* Why nautiloids survived */}
              {animStep >= DATA.findIndex((d) => d.ma <= IMPACT_MA) && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200 leading-5"
                >
                  <strong className="block mb-1">Why nautiloids survived:</strong>
                  Nautiloids lay large, yolk-rich eggs on the seafloor. Their juveniles could survive without surface plankton.
                  Ammonites had tiny planktonic larvae — when the impact winter destroyed surface productivity, their young had nothing to eat.
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
