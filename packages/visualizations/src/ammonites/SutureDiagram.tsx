"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Suture Patterns ──────────────────────────────────────────────────────────
// Suture lines are where septa meet the outer shell wall.
// Three major types correspond to geological periods and ammonoid groups.

interface SutureType {
  id: string;
  name: string;
  group: string;
  period: string;
  color: string;
  description: string;
  facts: string[];
  // SVG path for the suture pattern (one period of the suture)
  path: string;
}

// Each suture is drawn on a 300×80 viewBox — one "ripple" across the wall
// X = along the shell wall (0→300), Y = depth of fold (40 = midline)

// Goniatitic: simple angular zigzag — saddles rounded, lobes angular
function goniaticPath(): string {
  const pts: [number, number][] = [];
  for (let x = 0; x <= 300; x += 2) {
    const t = (x / 300) * 4 * Math.PI; // 2 full cycles
    // Simple wave with slight asymmetry — saddles wide/rounded, lobes narrow/angular
    const saddle = Math.max(0, Math.sin(t)) * 28;
    const lobe = Math.min(0, Math.sin(t)) * 22;
    pts.push([x, 40 - saddle - lobe]);
  }
  return pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
}

// Ceratitic: saddles smooth/rounded, lobes serrated (subdivided)
function ceraticPath(): string {
  const pts: [number, number][] = [];
  for (let x = 0; x <= 300; x += 1) {
    const t = (x / 300) * 4 * Math.PI;
    const base = Math.sin(t);
    let y: number;
    if (base >= 0) {
      // Saddle: smooth rounded
      y = 40 - base * 28;
    } else {
      // Lobe: serrated with sub-lobes
      const serrate = Math.sin(t * 5) * 0.3 * Math.abs(base);
      y = 40 - (base + serrate) * 22;
    }
    pts.push([x, y]);
  }
  return pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
}

// Ammonitic: both saddles AND lobes highly subdivided (fractal-like)
function ammoniticPath(): string {
  const pts: [number, number][] = [];
  for (let x = 0; x <= 300; x += 0.8) {
    const t = (x / 300) * 4 * Math.PI;
    const base = Math.sin(t);
    // Add multiple levels of sub-folding
    const sub1 = Math.sin(t * 4) * 0.35;
    const sub2 = Math.sin(t * 10) * 0.12;
    const sub3 = Math.sin(t * 20) * 0.04;
    const combined = base + sub1 * Math.sign(base) + sub2 * Math.sign(base) + sub3;
    const amp = base >= 0 ? 30 : 26;
    pts.push([x, 40 - combined * amp]);
  }
  return pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
}

const SUTURE_TYPES: SutureType[] = [
  {
    id: "goniatitic",
    name: "Goniatitic",
    group: "Goniatitida",
    period: "Devonian – Permian",
    color: "#f59e0b",
    description: "Simple angular zigzag pattern — the earliest suture style",
    facts: [
      "The oldest and simplest ammonoid suture pattern.",
      "Saddles (convex bends) are smooth and rounded.",
      "Lobes (concave bends) are simple angular points — no sub-folding.",
      "Found on goniatites and early ammonoids from the Devonian through Permian.",
      "The simple geometry means thinner septa — limited depth pressure resistance.",
    ],
    path: goniaticPath(),
  },
  {
    id: "ceratitic",
    name: "Ceratitic",
    group: "Ceratitida",
    period: "Permian – Triassic",
    color: "#7c3aed",
    description: "Smooth saddles + serrated lobes — intermediate complexity",
    facts: [
      "Characteristic of Triassic ammonoids (ceratites).",
      "Saddles remain smooth and rounded like goniatitic sutures.",
      "Lobes are subdivided into smaller crenulations (serrations).",
      "The extra folding adds surface area and structural strength.",
      "This design allowed deeper-water habitats than goniatitic predecessors.",
    ],
    path: ceraticPath(),
  },
  {
    id: "ammonitic",
    name: "Ammonitic",
    group: "Ammonitida",
    period: "Triassic – Cretaceous",
    color: "#0891b2",
    description: "Highly complex fractal-like folding — maximum strength",
    facts: [
      "Both saddles AND lobes are intensely subdivided at multiple scales.",
      "The pattern resembles a fractal — sub-folds upon sub-folds.",
      "Dramatically increases the septum's surface area, making it far stronger.",
      "Likely enabled ammonites to dive deeper and exploit a wider range of depths.",
      "Characteristic of true ammonites (Ammonitida) from the Mesozoic.",
      "The most complex sutures belong to Cretaceous heteromorphs and giant ammonites.",
    ],
    path: ammoniticPath(),
  },
];

export function SutureDiagram() {
  const [active, setActive] = useState<string>("goniatitic");

  const current = SUTURE_TYPES.find((s) => s.id === active)!;

  return (
    <div className="my-8 rounded-xl border border-border bg-[#111] overflow-hidden select-none">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Suture Pattern Evolution</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Sutures are where the septum meets the shell wall — their complexity increased over 350 million years
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {SUTURE_TYPES.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
              active === s.id
                ? "bg-[#0d0d0d] border-b-2 -mb-px"
                : "text-muted-foreground hover:text-foreground"
            }`}
            style={active === s.id ? { borderBottomColor: s.color, color: s.color } : {}}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Suture SVG */}
        <div className="flex-1 flex flex-col items-center justify-center gap-2 bg-[#0d0d0d] p-6">
          {/* Context label */}
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Suture pattern (unrolled view)</div>

          {/* All three shown for comparison */}
          <div className="w-full flex flex-col gap-3">
            {SUTURE_TYPES.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <span
                  className="text-[10px] font-mono w-20 shrink-0"
                  style={{ color: s.id === active ? s.color : "#475569" }}
                >
                  {s.name}
                </span>
                <svg
                  viewBox="0 0 300 80"
                  className="flex-1 rounded"
                  style={{
                    height: s.id === active ? 70 : 44,
                    background: s.id === active ? "#111" : "transparent",
                    border: s.id === active ? `1px solid ${s.color}30` : "1px solid transparent",
                    transition: "height 0.2s ease",
                  }}
                >
                  {/* Midline */}
                  <line x1="0" y1="40" x2="300" y2="40" stroke="#ffffff08" strokeWidth="1" />
                  {/* Shell wall area */}
                  <rect x="0" y="0" width="300" height="40" fill="#ffffff03" />

                  {/* Suture path */}
                  <AnimatePresence>
                    <motion.path
                      key={s.id}
                      d={s.path}
                      fill="none"
                      stroke={s.id === active ? s.color : "#475569"}
                      strokeWidth={s.id === active ? 2 : 1}
                      opacity={s.id === active ? 1 : 0.4}
                    />
                  </AnimatePresence>

                  {s.id === active && (
                    <>
                      {/* Saddle label */}
                      <text x="50" y="10" fill={s.color + "90"} fontSize="8" fontFamily="monospace" textAnchor="middle">saddle</text>
                      <text x="200" y="10" fill={s.color + "90"} fontSize="8" fontFamily="monospace" textAnchor="middle">saddle</text>
                      {/* Lobe label */}
                      <text x="130" y="74" fill={s.color + "90"} fontSize="8" fontFamily="monospace" textAnchor="middle">lobe</text>
                    </>
                  )}
                </svg>
              </div>
            ))}
          </div>

          {/* Complexity arrow */}
          <div className="w-full flex items-center gap-2 mt-3">
            <span className="text-[10px] text-muted-foreground/50">Simple</span>
            <div className="flex-1 h-px bg-gradient-to-r from-amber-500/50 via-violet-500/50 to-cyan-500/50" />
            <span className="text-[10px] text-muted-foreground/50">Complex</span>
          </div>
        </div>

        {/* Info panel */}
        <div className="md:w-72 border-t md:border-t-0 md:border-l border-border bg-[#0a0a0a] p-5 flex flex-col gap-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col gap-3"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: current.color }} />
                  <span className="text-sm font-semibold text-foreground">{current.name}</span>
                </div>
                <div className="text-[10px] font-mono text-muted-foreground">{current.group}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{current.period}</div>
              </div>

              <p className="text-xs text-muted-foreground italic">{current.description}</p>

              <ul className="space-y-2">
                {current.facts.map((fact, i) => (
                  <li key={i} className="flex gap-2 text-xs text-foreground/75 leading-5">
                    <span className="shrink-0 text-muted-foreground/40 mt-0.5">→</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
