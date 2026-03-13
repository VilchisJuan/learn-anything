"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DepthZone {
  id: string;
  name: string;
  minDepth: number; // metres
  maxDepth: number;
  color: string;
  bgColor: string;
  description: string;
}

interface AmmoniteDepthEntry {
  id: string;
  name: string;
  genus: string;
  minDepth: number;
  maxDepth: number;
  color: string;
  suture: "goniatitic" | "ceratitic" | "ammonitic";
  shell: string;
  info: string;
}

const DEPTH_ZONES: DepthZone[] = [
  {
    id: "sunlight",
    name: "Sunlight Zone",
    minDepth: 0, maxDepth: 200,
    color: "#0ea5e9",
    bgColor: "#0ea5e915",
    description: "Full photosynthesis, warm water, highest biological productivity.",
  },
  {
    id: "twilight",
    name: "Twilight Zone",
    minDepth: 200, maxDepth: 1000,
    color: "#1d4ed8",
    bgColor: "#1d4ed810",
    description: "Dim light, cold water, little photosynthesis. Many vertical migrants.",
  },
  {
    id: "midnight",
    name: "Midnight Zone",
    minDepth: 1000, maxDepth: 4000,
    color: "#1e1b4b",
    bgColor: "#1e1b4b20",
    description: "Total darkness, near-freezing, extreme pressure.",
  },
];

const MAX_DEPTH = 600; // show up to 600m (ammonite range)

const AMMONITES: AmmoniteDepthEntry[] = [
  {
    id: "dact",
    name: "Dactylioceras",
    genus: "D. commune",
    minDepth: 10, maxDepth: 100,
    color: "#fbbf24",
    suture: "ammonitic",
    shell: "evolute, ribbed",
    info: "Common in shallow Jurassic seas. Found alongside ammonite mass-mortality beds suggesting nearshore environments.",
  },
  {
    id: "hild",
    name: "Hildoceras",
    genus: "H. bifrons",
    minDepth: 50, maxDepth: 200,
    color: "#f97316",
    suture: "ammonitic",
    shell: "involute, keeled",
    info: "Lived in open-water environments at mid-range depths. The keel may have aided streamlining for active swimming.",
  },
  {
    id: "pher",
    name: "Pherasmoceras",
    genus: "Pherasmoceras",
    minDepth: 100, maxDepth: 300,
    color: "#a78bfa",
    suture: "ammonitic",
    shell: "depressed, smooth",
    info: "Smooth involute shell suggests open-ocean, deeper-water habits. Complex sutures indicate tolerance for higher pressure.",
  },
  {
    id: "peris",
    name: "Perisphinctes",
    genus: "Perisphinctes sp.",
    minDepth: 20, maxDepth: 150,
    color: "#34d399",
    suture: "ammonitic",
    shell: "evolute, widely ribbed",
    info: "Large evolute ammonite found in reef-associated and open-water facies. Wide umbilicus suggests shallower water.",
  },
  {
    id: "papi",
    name: "Parapuzosia",
    genus: "P. seppenradensis",
    minDepth: 50, maxDepth: 400,
    color: "#0891b2",
    suture: "ammonitic",
    shell: "huge, involute",
    info: "The largest known ammonite. Its exceptional suture complexity suggests it could survive substantial depths — perhaps 300–400m.",
  },
  {
    id: "nipp",
    name: "Nipponites",
    genus: "N. mirabilis",
    minDepth: 0, maxDepth: 80,
    color: "#f87171",
    suture: "ammonitic",
    shell: "uncoiled, irregular",
    info: "Bizarre uncoiled heteromorph. Probably a slow drift-feeder in calm, shallow-to-mid water. Its shape would have been hydrodynamically stable in low-current environments.",
  },
];

// SVG layout
const SVG_W = 340;
const SVG_H = 300;
const DEPTH_PAD_TOP = 20;
const DEPTH_PAD_BOTTOM = 20;
const DEPTH_COL_W = 110; // width of depth column on left
const AMMONITE_COL_START = DEPTH_COL_W + 10;
const AMMONITE_COL_W = SVG_W - AMMONITE_COL_START - 10;

function depthToY(depth: number): number {
  return DEPTH_PAD_TOP + (depth / MAX_DEPTH) * (SVG_H - DEPTH_PAD_TOP - DEPTH_PAD_BOTTOM);
}

const AMMONITE_TRACK_W = 20;
const AMMONITE_SPACING = AMMONITE_COL_W / AMMONITES.length;

const SUTURE_COLORS = { goniatitic: "#f59e0b", ceratitic: "#7c3aed", ammonitic: "#0891b2" };

export function DepthRangeChart() {
  const [active, setActive] = useState<string | null>(null);
  const activeEntry = AMMONITES.find((a) => a.id === active);

  return (
    <div className="my-8 rounded-xl border border-border bg-[#111] overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Depth Range by Species</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Estimated depth ranges based on shell morphology, suture complexity, and facies analysis — click any bar</p>
      </div>

      <div className="flex flex-col md:flex-row">
        <div className="flex-1 bg-[#0d0d0d] flex items-center justify-center p-3">
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="max-w-full" style={{ maxHeight: SVG_H }}>
            {/* Ocean depth gradient background */}
            <defs>
              <linearGradient id="oceanGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.18" />
                <stop offset="40%" stopColor="#1d4ed8" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#0f0a2e" stopOpacity="0.25" />
              </linearGradient>
            </defs>
            <rect x={0} y={DEPTH_PAD_TOP} width={SVG_W} height={SVG_H - DEPTH_PAD_TOP - DEPTH_PAD_BOTTOM} fill="url(#oceanGrad)" />

            {/* Depth zone bands */}
            {DEPTH_ZONES.filter((z) => z.minDepth < MAX_DEPTH).map((zone) => {
              const y1 = depthToY(zone.minDepth);
              const y2 = depthToY(Math.min(zone.maxDepth, MAX_DEPTH));
              return (
                <g key={zone.id}>
                  <rect x={0} y={y1} width={DEPTH_COL_W - 2} height={y2 - y1} fill={zone.bgColor} />
                  <line x1={0} y1={y1} x2={SVG_W} y2={y1} stroke={zone.color} strokeWidth="0.5" opacity="0.3" strokeDasharray="3,3" />
                  <text x={4} y={y1 + 11} fill={zone.color} fontSize="8" fontFamily="monospace" opacity="0.8">{zone.name}</text>
                </g>
              );
            })}

            {/* Depth tick labels */}
            {[0, 100, 200, 300, 400, 500, 600].map((d) => (
              <g key={d}>
                <line x1={DEPTH_COL_W - 6} y1={depthToY(d)} x2={DEPTH_COL_W - 2} y2={depthToY(d)} stroke="#334155" strokeWidth="1" />
                <text x={DEPTH_COL_W - 10} y={depthToY(d) + 4} fill="#475569" fontSize="8" textAnchor="end" fontFamily="monospace">{d}m</text>
              </g>
            ))}

            {/* Ammonite bars */}
            {AMMONITES.map((am, i) => {
              const x = AMMONITE_COL_START + i * AMMONITE_SPACING + (AMMONITE_SPACING - AMMONITE_TRACK_W) / 2;
              const y1 = depthToY(am.minDepth);
              const y2 = depthToY(am.maxDepth);
              const isActive = active === am.id;
              return (
                <g key={am.id} className="cursor-pointer" onClick={() => setActive(active === am.id ? null : am.id)}>
                  {/* Bar */}
                  <rect
                    x={x} y={y1}
                    width={AMMONITE_TRACK_W} height={y2 - y1}
                    fill={am.color + (isActive ? "60" : "30")}
                    stroke={am.color}
                    strokeWidth={isActive ? 2 : 1}
                    rx="3"
                    className="transition-all duration-150"
                  />
                  {/* Suture dot */}
                  <circle
                    cx={x + AMMONITE_TRACK_W / 2} cy={y1 + (y2 - y1) / 2}
                    r="4"
                    fill={SUTURE_COLORS[am.suture]}
                    opacity="0.8"
                  />
                  {/* Label */}
                  <text
                    x={x + AMMONITE_TRACK_W / 2} y={y2 + 12}
                    fill={isActive ? am.color : "#64748b"}
                    fontSize="7.5"
                    textAnchor="middle"
                    fontFamily="monospace"
                    fontWeight={isActive ? "bold" : "normal"}
                  >
                    {am.name.slice(0, 7)}
                  </text>
                </g>
              );
            })}

            {/* Surface label */}
            <text x={4} y={DEPTH_PAD_TOP - 5} fill="#94a3b8" fontSize="8" fontFamily="monospace">← sea surface</text>
          </svg>
        </div>

        {/* Info panel */}
        <div className="md:w-60 border-t md:border-t-0 md:border-l border-border bg-[#0a0a0a] p-4 flex flex-col gap-3 min-h-[160px]">
          <AnimatePresence mode="wait">
            {activeEntry ? (
              <motion.div
                key={activeEntry.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: activeEntry.color }} />
                  <span className="text-xs font-semibold text-foreground">{activeEntry.name}</span>
                </div>
                <div className="text-[10px] font-mono text-muted-foreground italic">{activeEntry.genus}</div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground">
                    {activeEntry.minDepth}–{activeEntry.maxDepth} m depth
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded border border-border" style={{ color: SUTURE_COLORS[activeEntry.suture] }}>
                    {activeEntry.suture}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground">{activeEntry.shell}</div>
                <p className="text-xs text-foreground/75 leading-5">{activeEntry.info}</p>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-2 flex-1 justify-center"
              >
                <p className="text-xs text-muted-foreground">Click a bar to see depth range details.</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(SUTURE_COLORS).map(([type, color]) => (
                    <span key={type} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      {type}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground/60 mt-1">Coloured dots = suture type (proxy for depth tolerance)</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
