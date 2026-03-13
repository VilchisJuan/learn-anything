"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Math ─────────────────────────────────────────────────────────────────────
const CX = 195, CY = 195;
const TARGET_R = 150; // outer radius always scales to this px
const MAX_THETA = 4 * Math.PI; // 2 full revolutions displayed

function computeA(B: number) { return TARGET_R / Math.exp(B * MAX_THETA); }
function shellR(theta: number, A: number, B: number) { return A * Math.exp(B * theta); }
function pt(theta: number, A: number, B: number): [number, number] {
  const r = shellR(theta, A, B);
  return [CX + r * Math.cos(theta), CY - r * Math.sin(theta)];
}

function buildPath(t1: number, t2: number, A: number, B: number, n = 150): string {
  return Array.from({ length: n + 1 }, (_, i) => {
    const [x, y] = pt(t1 + (t2 - t1) * (i / n), A, B);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

// Closed fill region for outermost whorl (outer arc t1→t2, then inner wall reversed)
function whorlFill(A: number, B: number, n = 100): string {
  const t1 = 2 * Math.PI, t2 = MAX_THETA;
  const outer = Array.from({ length: n + 1 }, (_, i) => {
    const [x, y] = pt(t1 + (t2 - t1) * (i / n), A, B);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const inner = Array.from({ length: n + 1 }, (_, i) => {
    // inner wall = outer wall of prev whorl
    const t = t2 - (t2 - t1) * (i / n);
    const r = shellR(t - 2 * Math.PI, A, B);
    const x = CX + r * Math.cos(t);
    const y = CY - r * Math.sin(t);
    return `L${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return [...outer, ...inner, "Z"].join(" ");
}

// Inner whorls fill
function innerWhorlFill(A: number, B: number, n = 100): string {
  const outer = Array.from({ length: n + 1 }, (_, i) => {
    const [x, y] = pt((i / n) * 2 * Math.PI, A, B);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  });
  // inner boundary: shrink by one whorl's worth
  const inner = Array.from({ length: n + 1 }, (_, i) => {
    const t = 2 * Math.PI - (i / n) * 2 * Math.PI;
    const r = Math.max(2, shellR(t, A, B) * Math.exp(-2 * Math.PI * B));
    return `L${(CX + r * Math.cos(t)).toFixed(1)},${(CY - r * Math.sin(t)).toFixed(1)}`;
  });
  return [...outer, ...inner, "Z"].join(" ");
}

// ─── Species reference points ─────────────────────────────────────────────────
interface SpeciesRef { name: string; B: number; wer: number; note: string; }
const SPECIES_REFS: SpeciesRef[] = [
  { name: "Goniatites",     B: 0.12, wer: 2.13, note: "Very evolute — Carboniferous goniatite" },
  { name: "Dactylioceras",  B: 0.17, wer: 2.91, note: "Evolute — classic Jurassic ammonite" },
  { name: "Perisphinctes",  B: 0.19, wer: 3.29, note: "Moderately evolute — Jurassic giant" },
  { name: "Asteroceras",    B: 0.22, wer: 3.97, note: "Typical ammonite coiling" },
  { name: "Hildoceras",     B: 0.26, wer: 5.15, note: "Involute — inner whorls mostly hidden" },
  { name: "Placenticeras",  B: 0.30, wer: 6.59, note: "Highly involute — Cretaceous" },
];

function werFromB(B: number) { return Math.exp(2 * Math.PI * B); }

// ─── Component ────────────────────────────────────────────────────────────────
export function ShellParameterExplorer() {
  const [B, setB] = useState(0.22);
  const wer = werFromB(B);

  const closestSpecies = SPECIES_REFS.reduce((best, s) =>
    Math.abs(s.B - B) < Math.abs(best.B - B) ? s : best
  );

  const { outerPath, innerWallPath, whorlFillPath, innerFillPath, umbR } = useMemo(() => {
    const A = computeA(B);
    return {
      outerPath:     buildPath(0, MAX_THETA, A, B),
      innerWallPath: buildPath(2 * Math.PI, MAX_THETA, A, B).replace("M", "M").replace(
        /^M[\d.]+,[\d.]+/,
        (() => {
          const r = shellR(0, A, B);
          return `M${(CX + r * Math.cos(2 * Math.PI)).toFixed(1)},${(CY - r * Math.sin(2 * Math.PI)).toFixed(1)}`;
        })()
      ),
      whorlFillPath: whorlFill(A, B),
      innerFillPath: innerWhorlFill(A, B),
      umbR: shellR(0, A, B), // umbilicus radius
    };
  }, [B]);

  // Build inner wall properly
  const innerWall = useMemo(() => {
    const A = computeA(B);
    return Array.from({ length: 101 }, (_, i) => {
      const t = 2 * Math.PI + (i / 100) * 2 * Math.PI;
      const r = shellR(t - 2 * Math.PI, A, B);
      const x = CX + r * Math.cos(t);
      const y = CY - r * Math.sin(t);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
  }, [B]);

  const umbPct = Math.round((umbR / TARGET_R) * 100);

  return (
    <div className="my-8 rounded-xl border border-border bg-[#111] overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Shell Parameter Explorer</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Drag the slider to change the Whorl Expansion Ratio and watch the shell shape update in real time
        </p>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* SVG */}
        <div className="flex-1 bg-[#0d0d0d] flex items-center justify-center p-4">
          <svg viewBox="0 0 390 390" className="max-w-full" style={{ maxHeight: 340 }}>
            {/* Inner whorls fill */}
            <path d={innerFillPath} fill="#1e293b" opacity="0.7" />

            {/* Outermost whorl fill */}
            <path d={whorlFillPath} fill="#f59e0b15" />

            {/* Outer shell wall */}
            <path d={outerPath} fill="none" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />

            {/* Inner wall of outermost whorl */}
            <path d={innerWall} fill="none" stroke="#64748b" strokeWidth="1.2" />

            {/* Umbilicus circle */}
            <circle cx={CX} cy={CY} r={umbR} fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="3,2" />

            {/* Aperture dot */}
            {(() => {
              const A = computeA(B);
              const [ax, ay] = pt(MAX_THETA, A, B);
              return (
                <g>
                  <circle cx={ax} cy={ay} r="5" fill="#fbbf24" opacity="0.9" />
                  <text x={ax + 8} y={ay + 4} fill="#fbbf24" fontSize="9" fontFamily="monospace">aperture</text>
                </g>
              );
            })()}

            {/* Umbilicus label */}
            <text x={CX} y={CY + 4} fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="monospace">
              ⌀{umbPct}%
            </text>

            {/* Septa lines — sample 6 septa in phragmocone */}
            {Array.from({ length: 6 }, (_, i) => {
              const A = computeA(B);
              const t = 2 * Math.PI + (i / 6) * 1.8 * Math.PI;
              const [ox, oy] = pt(t, A, B);
              const r2 = shellR(t - 2 * Math.PI, A, B);
              const ix = CX + r2 * Math.cos(t);
              const iy = CY - r2 * Math.sin(t);
              return <line key={i} x1={ox} y1={oy} x2={ix} y2={iy} stroke="#a78bfa" strokeWidth="1" opacity="0.5" />;
            })}
          </svg>
        </div>

        {/* Controls + info */}
        <div className="lg:w-72 border-t lg:border-t-0 lg:border-l border-border bg-[#0a0a0a] p-5 flex flex-col gap-5">
          {/* WER display */}
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold text-amber-400">{wer.toFixed(2)}</span>
              <span className="text-xs text-muted-foreground">WER (Whorl Expansion Ratio)</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Each new whorl is <strong className="text-foreground">{wer.toFixed(1)}×</strong> larger than the previous one
            </p>
          </div>

          {/* Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Evolute (open)</span>
              <span>Involute (closed)</span>
            </div>
            <input
              type="range"
              min={0.09}
              max={0.35}
              step={0.005}
              value={B}
              onChange={(e) => setB(Number(e.target.value))}
              className="w-full accent-amber-400 h-1.5"
            />
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>WER 1.8</span>
              <span>WER 9.0</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded bg-[#111] border border-border p-2">
              <div className="text-muted-foreground mb-0.5">Umbilicus</div>
              <div className="font-mono text-foreground">{umbPct}% of diameter</div>
              <div className="text-muted-foreground text-[9px]">{umbPct > 15 ? "evolute" : umbPct > 6 ? "moderate" : "involute"}</div>
            </div>
            <div className="rounded bg-[#111] border border-border p-2">
              <div className="text-muted-foreground mb-0.5">Spiral const B</div>
              <div className="font-mono text-foreground">{B.toFixed(3)}</div>
              <div className="text-muted-foreground text-[9px]">r = A·e^(B·θ)</div>
            </div>
          </div>

          {/* Closest species */}
          <AnimatePresence mode="wait">
            <motion.div
              key={closestSpecies.name}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="rounded-md border border-amber-500/20 bg-amber-500/5 p-3"
            >
              <p className="text-[10px] text-amber-400/70 mb-1">Closest real species</p>
              <p className="text-xs font-semibold text-foreground italic">{closestSpecies.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{closestSpecies.note}</p>
            </motion.div>
          </AnimatePresence>

          {/* Species reference dots */}
          <div className="flex flex-col gap-1">
            <p className="text-[10px] text-muted-foreground mb-1">Species reference</p>
            {SPECIES_REFS.map((s) => (
              <button
                key={s.name}
                onClick={() => setB(s.B)}
                className={`flex items-center gap-2 text-left px-2 py-1 rounded text-[10px] transition-colors ${
                  closestSpecies.name === s.name ? "bg-amber-400/10 text-amber-300" : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                }`}
              >
                <span className="font-mono w-8 shrink-0">{s.wer.toFixed(1)}×</span>
                <span className="italic">{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
