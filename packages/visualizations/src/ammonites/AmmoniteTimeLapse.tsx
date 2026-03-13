"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Period {
  name: string;
  start: number; // Ma
  end: number;   // Ma
  color: string;
  status: string;
  badge: string;
  badgeColor: string;
}

const PERIODS: Period[] = [
  {
    name: "Devonian",
    start: 419, end: 359,
    color: "#c2410c",
    status: "First ammonoids appear, evolving from straight-shelled bactritoids. Early forms had simple goniatitic sutures.",
    badge: "Origin",
    badgeColor: "#34d399",
  },
  {
    name: "Carboniferous",
    start: 359, end: 299,
    color: "#059669",
    status: "Goniatites diversify and dominate the seas. Hundreds of species fill every marine niche worldwide.",
    badge: "Growth",
    badgeColor: "#60a5fa",
  },
  {
    name: "Permian",
    start: 299, end: 252,
    color: "#d97706",
    status: "Near-total extinction at 252 Ma — only ~2 genera survive the Great Dying. Then: explosive recovery.",
    badge: "Crisis",
    badgeColor: "#f87171",
  },
  {
    name: "Triassic",
    start: 252, end: 201,
    color: "#7c3aed",
    status: "From 2 survivors, ammonoids diversify into hundreds of genera in under 5 million years. True ammonites evolve.",
    badge: "Recovery",
    badgeColor: "#a78bfa",
  },
  {
    name: "Jurassic",
    start: 201, end: 145,
    color: "#2563eb",
    status: "Golden age — peak global diversity. Tens of thousands of species, from coin-sized to 2-metre giants.",
    badge: "Peak",
    badgeColor: "#fbbf24",
  },
  {
    name: "Cretaceous",
    start: 145, end: 66,
    color: "#0891b2",
    status: "Heteromorphs with bizarre uncoiled shells flourish. All ammonites wiped out by the Chicxulub asteroid at 66 Ma.",
    badge: "Extinction",
    badgeColor: "#f87171",
  },
];

const DIVERSITY = [20, 45, 15, 70, 100, 75];
const TOTAL_MA = 419 - 66;
// Minimum pixel width for the whole strip — keeps text readable; scrolls on small screens
const STRIP_MIN_W = 520;

export function AmmoniteTimeLapse() {
  const [active, setActive] = useState<string | null>(null);
  const activePeriod = PERIODS.find((p) => p.name === active) ?? null;

  function toggle(name: string) {
    setActive((prev) => (prev === name ? null : name));
  }

  return (
    <div className="my-8 rounded-xl border border-border bg-[#111] overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">334 Million Years of Ammonite History</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Each band is proportional to its real duration — tap a period to explore
        </p>
      </div>

      <div className="p-4 sm:p-5 flex flex-col gap-3">
        {/* Scrollable wrapper — on narrow screens the strip scrolls horizontally */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div style={{ minWidth: STRIP_MIN_W }}>
            {/* Diversity wave */}
            <div className="relative h-10 overflow-hidden rounded mb-3">
              <svg viewBox="0 0 1000 40" preserveAspectRatio="none" className="w-full h-full">
                {PERIODS.map((p, i) => {
                  const x = ((419 - p.start) / TOTAL_MA) * 1000;
                  const w = ((p.start - p.end) / TOTAL_MA) * 1000;
                  const h = (DIVERSITY[i] / 100) * 36 + 2;
                  return (
                    <rect
                      key={p.name}
                      x={x} y={40 - h}
                      width={w} height={h}
                      fill={p.color + (active === p.name ? "55" : "28")}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-x-0 bottom-0 text-[9px] text-muted-foreground/30 font-mono flex justify-between px-1 pointer-events-none">
                <span>high diversity →</span>
                <span>low</span>
              </div>
            </div>

            {/* Period strip */}
            <div className="flex rounded-lg overflow-hidden h-16 border border-border/40">
              {PERIODS.map((p, i) => {
                const width = ((p.start - p.end) / TOTAL_MA) * 100;
                const isActive = active === p.name;
                return (
                  <motion.button
                    key={p.name}
                    className="relative flex flex-col justify-center px-2 overflow-hidden transition-colors text-left"
                    style={{
                      width: `${width}%`,
                      minWidth: 0,
                      backgroundColor: p.color + (isActive ? "45" : "18"),
                      borderRight: i < PERIODS.length - 1 ? `1px solid ${p.color}35` : undefined,
                    }}
                    onClick={() => toggle(p.name)}
                    whileHover={{ backgroundColor: p.color + "32" }}
                    transition={{ duration: 0.12 }}
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-[3px]"
                      style={{ backgroundColor: isActive ? p.color : p.color + "80" }}
                    />
                    <span
                      className="text-[10px] font-semibold truncate leading-tight"
                      style={{ color: isActive ? p.color : "#94a3b8" }}
                    >
                      {p.name}
                    </span>
                    <span className="text-[9px] text-muted-foreground/50 font-mono truncate leading-tight mt-0.5">
                      {p.start}–{p.end} Ma
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="activeDot"
                        className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Ma axis */}
            <div className="flex justify-between text-[9px] text-muted-foreground/35 font-mono mt-1 px-0.5">
              <span>419 Ma</span>
              <span>← older · newer →</span>
              <span>66 Ma</span>
            </div>
          </div>
        </div>

        {/* Info panel — always outside the scroll area so it's full width */}
        <AnimatePresence mode="wait">
          {activePeriod ? (
            <motion.div
              key={activePeriod.name}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="flex gap-3 rounded-lg border border-border bg-[#0a0a0a] p-4"
            >
              <div
                className="w-1 self-stretch rounded-full shrink-0"
                style={{ backgroundColor: activePeriod.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1.5">
                  <span className="text-sm font-semibold text-foreground">{activePeriod.name}</span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {activePeriod.start}–{activePeriod.end} Ma
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    · {activePeriod.start - activePeriod.end} Ma span
                  </span>
                  <span
                    className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0"
                    style={{ color: activePeriod.badgeColor, backgroundColor: activePeriod.badgeColor + "20" }}
                  >
                    {activePeriod.badge}
                  </span>
                </div>
                <p className="text-xs text-foreground/75 leading-5">{activePeriod.status}</p>
              </div>
            </motion.div>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-xs text-muted-foreground/40 text-center py-1"
            >
              Tap any period to see what happened
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
