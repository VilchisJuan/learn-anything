"use client";

import { useState } from "react";
import { motion } from "framer-motion";

// Scale: 0.55 SVG px per real cm
const SCALE = 0.55;
const SVG_W = 560;
const SVG_H = 260;
const BASELINE = SVG_H - 30; // y of the ground line

interface Species {
  name: string;
  species: string;
  diameterCm: number;
  period: string;
  color: string;
  fact: string;
}

const AMMONITES: Species[] = [
  {
    name: "Hatchling",
    species: "protoconch",
    diameterCm: 0.1,
    period: "any",
    color: "#475569",
    fact: "Ammonites hatched from tiny eggs about 0.5 mm across — smaller than a grain of rice.",
  },
  {
    name: "Dactylioceras",
    species: "Dactylioceras commune",
    diameterCm: 7,
    period: "Jurassic",
    color: "#f59e0b",
    fact: "One of the most common Jurassic ammonites. Found abundantly in the Yorkshire coast and Germany.",
  },
  {
    name: "Asteroceras",
    species: "Asteroceras obtusum",
    diameterCm: 20,
    period: "Jurassic",
    color: "#f97316",
    fact: "A classic Lias ammonite from Dorset, known for its distinctive ribbing and prominent keel.",
  },
  {
    name: "Titanites",
    species: "Titanites giganteus",
    diameterCm: 53,
    period: "Late Jurassic",
    color: "#dc2626",
    fact: "One of the largest Jurassic ammonites. The type specimen was found in Portland, Dorset, UK.",
  },
  {
    name: "Parapuzosia",
    species: "Parapuzosia seppenradensis",
    diameterCm: 180,
    period: "Late Cretaceous",
    color: "#0891b2",
    fact: "The largest known ammonite — 1.8 metres! Found in Germany in 1895. It would have weighed several hundred kilograms.",
  },
];

// Human for comparison
const HUMAN_HEIGHT_CM = 175;

// Compute x positions: place circles in order, each touching the previous
function layout() {
  // Use a minimum visual radius so tiny ones are still visible
  const minR = 4;
  const gap = 14;
  let x = 16;
  return AMMONITES.map((sp) => {
    const r = Math.max(minR, (sp.diameterCm / 2) * SCALE);
    const cx = x + r;
    x = cx + r + gap;
    const cy = BASELINE - r;
    return { ...sp, r, cx, cy };
  });
}

const LAID_OUT = layout();
// Human position: after the last ammonite
const HUMAN_X = LAID_OUT[LAID_OUT.length - 1].cx + LAID_OUT[LAID_OUT.length - 1].r + 22;
const HUMAN_H = HUMAN_HEIGHT_CM * SCALE; // px

// Draw a simple stick-figure silhouette
function HumanSilhouette({ x, h }: { x: number; h: number }) {
  const headR = h * 0.08;
  const bodyTop = BASELINE - h + headR * 2 + 2;
  const bodyBottom = BASELINE - h * 0.38;
  const shoulderY = bodyTop + headR * 0.5;
  const hipY = bodyBottom;
  const footY = BASELINE;
  return (
    <g opacity="0.4">
      {/* head */}
      <circle cx={x} cy={BASELINE - h + headR} r={headR} fill="#94a3b8" />
      {/* body */}
      <line x1={x} y1={bodyTop + headR * 0.9} x2={x} y2={hipY} stroke="#94a3b8" strokeWidth="2" />
      {/* arms */}
      <line x1={x - h * 0.14} y1={shoulderY + h * 0.04} x2={x + h * 0.14} y2={shoulderY + h * 0.04} stroke="#94a3b8" strokeWidth="2" />
      {/* legs */}
      <line x1={x} y1={hipY} x2={x - h * 0.10} y2={footY} stroke="#94a3b8" strokeWidth="2" />
      <line x1={x} y1={hipY} x2={x + h * 0.10} y2={footY} stroke="#94a3b8" strokeWidth="2" />
      {/* label */}
      <text x={x} y={BASELINE + 14} fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="monospace">
        Human
      </text>
      <text x={x} y={BASELINE + 24} fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="monospace">
        175 cm
      </text>
    </g>
  );
}

export function AmmoniteSizeComparison() {
  const [active, setActive] = useState<number | null>(null);

  const activeSpecies = active !== null ? LAID_OUT[active] : null;

  return (
    <div className="my-8 rounded-xl border border-border bg-[#111] overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Size Comparison</h3>
        <p className="text-xs text-muted-foreground mt-0.5">From hatchling to 1.8-metre giant — click any shell to learn more</p>
      </div>

      <div className="flex flex-col">
        <div className="bg-[#0d0d0d] overflow-x-auto">
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={SVG_W} height={SVG_H} style={{ minWidth: SVG_W }}>
            {/* Ground line */}
            <line x1={0} y1={BASELINE} x2={SVG_W} y2={BASELINE} stroke="#1e293b" strokeWidth="1" />

            {/* Scale bar */}
            <g>
              <line x1={10} y1={SVG_H - 8} x2={10 + 100 * SCALE} y2={SVG_H - 8} stroke="#334155" strokeWidth="1" />
              <line x1={10} y1={SVG_H - 12} x2={10} y2={SVG_H - 4} stroke="#334155" strokeWidth="1" />
              <line x1={10 + 100 * SCALE} y1={SVG_H - 12} x2={10 + 100 * SCALE} y2={SVG_H - 4} stroke="#334155" strokeWidth="1" />
              <text x={10 + 50 * SCALE} y={SVG_H - 1} fill="#475569" fontSize="8" textAnchor="middle" fontFamily="monospace">100 cm</text>
            </g>

            {/* Human silhouette */}
            <HumanSilhouette x={HUMAN_X} h={HUMAN_H} />

            {/* Ammonites */}
            {LAID_OUT.map((sp, i) => (
              <g
                key={sp.name}
                className="cursor-pointer"
                onClick={() => setActive(active === i ? null : i)}
              >
                {/* Spiral approximation: concentric circle with inner ring */}
                <circle
                  cx={sp.cx} cy={sp.cy} r={sp.r}
                  fill={active === i ? sp.color + "40" : sp.color + "20"}
                  stroke={sp.color}
                  strokeWidth={active === i ? 2 : 1}
                />
                {sp.r > 8 && (
                  <circle
                    cx={sp.cx} cy={sp.cy} r={sp.r * 0.55}
                    fill="none"
                    stroke={sp.color}
                    strokeWidth="0.7"
                    opacity="0.5"
                  />
                )}
                {sp.r > 16 && (
                  <circle
                    cx={sp.cx} cy={sp.cy} r={sp.r * 0.3}
                    fill="none"
                    stroke={sp.color}
                    strokeWidth="0.5"
                    opacity="0.35"
                  />
                )}

                {/* Hover ring */}
                {active === i && (
                  <circle cx={sp.cx} cy={sp.cy} r={sp.r + 4} fill="none" stroke={sp.color} strokeWidth="1" opacity="0.3" />
                )}

                {/* Label */}
                <text
                  x={sp.cx} y={sp.cy + sp.r + 12}
                  fill={active === i ? sp.color : "#64748b"}
                  fontSize="9"
                  textAnchor="middle"
                  fontFamily="monospace"
                  fontWeight={active === i ? "bold" : "normal"}
                >
                  {sp.name}
                </text>
                <text
                  x={sp.cx} y={sp.cy + sp.r + 22}
                  fill="#475569"
                  fontSize="8"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {sp.diameterCm < 1 ? `${sp.diameterCm * 10} mm` : `${sp.diameterCm} cm`}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Info strip */}
        <div className="min-h-[64px] px-5 py-3 border-t border-border bg-[#0a0a0a] flex items-center">
          {activeSpecies ? (
            <motion.div
              key={activeSpecies.name}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 items-start"
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: activeSpecies.color }} />
              <div>
                <span className="text-xs font-semibold text-foreground">{activeSpecies.name}</span>
                <span className="text-xs text-muted-foreground ml-2 italic">{activeSpecies.species}</span>
                <span className="text-xs text-muted-foreground ml-2">· {activeSpecies.period}</span>
                <p className="text-xs text-foreground/70 leading-5 mt-0.5">{activeSpecies.fact}</p>
              </div>
            </motion.div>
          ) : (
            <p className="text-xs text-muted-foreground">Click any ammonite to see facts. All sizes shown to the same scale relative to the human silhouette.</p>
          )}
        </div>
      </div>
    </div>
  );
}
