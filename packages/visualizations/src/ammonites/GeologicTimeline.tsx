"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Data ─────────────────────────────────────────────────────────────────────

interface TimelineEvent {
  ma: number; // millions of years ago
  label: string;
  type: "origin" | "extinction" | "diversification" | "note";
  detail: string;
}

interface Period {
  name: string;
  start: number; // Ma
  end: number;   // Ma
  color: string;
  bgColor: string;
  diversity: number; // relative 0–100
  summary: string;
  detail: string;
  events: TimelineEvent[];
}

const PERIODS: Period[] = [
  {
    name: "Devonian",
    start: 419,
    end: 359,
    color: "#c2410c",
    bgColor: "#7c2d1220",
    diversity: 20,
    summary: "First ammonoids arise from bactritoid ancestors",
    detail:
      "Ammonoids first appeared in the Early Devonian (~400 Ma), evolving from straight-shelled bactritoids. Early forms had simple goniatitic sutures. The Devonian marine seas teemed with fish and early cephalopods — ammonoids were just getting started.",
    events: [
      { ma: 400, label: "First ammonoids", type: "origin", detail: "Agoniatitida — earliest known ammonoid group — appear in Devonian seas." },
      { ma: 364, label: "Late Devonian extinction", type: "extinction", detail: "Multiple pulses of extinction wipe out ~75% of all species. Many ammonoid families survive but diversity drops sharply." },
    ],
  },
  {
    name: "Carboniferous",
    start: 359,
    end: 299,
    color: "#059669",
    bgColor: "#05966920",
    diversity: 40,
    summary: "Goniatites dominate the seas",
    detail:
      "Ammonoids recovered from the Late Devonian crisis and diversified strongly throughout the Carboniferous. Goniatites with their simple, angular sutures were the dominant group. By the Late Carboniferous, hundreds of species filled marine niches worldwide.",
    events: [
      { ma: 340, label: "Goniatite peak", type: "diversification", detail: "Goniatites diversify explosively, filling the ecological void left by Devonian extinctions." },
    ],
  },
  {
    name: "Permian",
    start: 299,
    end: 252,
    color: "#d97706",
    bgColor: "#d9770620",
    diversity: 55,
    summary: "Ceratites evolve; then near total wipeout",
    detail:
      "The Permian saw the evolution of ceratitic sutures — more complex than goniatitic, with rounded saddles and serrated lobes. Ammonoids continued to diversify until the catastrophic End-Permian extinction (252 Ma), which eliminated 96% of all marine species. Only a handful of ammonoid lineages survived.",
    events: [
      { ma: 270, label: "Ceratites appear", type: "diversification", detail: "Ceratitic suture pattern evolves, enabling shells to withstand greater depth pressures." },
      { ma: 252, label: "End-Permian extinction", type: "extinction", detail: "The \"Great Dying\" — worst mass extinction in Earth's history. Only ~2 ammonoid genera survive. 96% of marine species lost." },
    ],
  },
  {
    name: "Triassic",
    start: 252,
    end: 201,
    color: "#7c3aed",
    bgColor: "#7c3aed20",
    diversity: 70,
    summary: "Explosive recovery — ammonites return",
    detail:
      "From just a few survivors, ammonoids diversified explosively in the Early Triassic — one of the fastest radiations in the fossil record. Ceratites became hugely diverse. By the Middle Triassic, ammonoid diversity rivaled pre-extinction levels. However, another mass extinction at 201 Ma again crashed populations.",
    events: [
      { ma: 250, label: "Triassic radiation", type: "diversification", detail: "Starting from ~2 survivor lineages, ammonoids diversify into hundreds of genera within ~5 million years." },
      { ma: 235, label: "First ammonites", type: "origin", detail: "True ammonites (Order Ammonitida, with complex ammonitic sutures) appear for the first time." },
      { ma: 201, label: "End-Triassic extinction", type: "extinction", detail: "Another major extinction event linked to massive volcanism (CAMP). Ammonoid diversity crashes again." },
    ],
  },
  {
    name: "Jurassic",
    start: 201,
    end: 145,
    color: "#2563eb",
    bgColor: "#2563eb20",
    diversity: 95,
    summary: "Golden age — peak diversity worldwide",
    detail:
      "The Jurassic was the golden age of ammonites. They recovered rapidly after the End-Triassic extinction and achieved their greatest diversity. Tens of thousands of species existed, ranging from coin-sized to giants over 2 meters across. Ammonitic sutures became extraordinarily complex. They inhabited every marine environment from shallow reefs to deep oceans.",
    events: [
      { ma: 195, label: "Jurassic radiation", type: "diversification", detail: "Ammonites diversify rapidly into virtually every marine niche. Ammonitic sutures become highly complex." },
      { ma: 170, label: "Peak diversity", type: "diversification", detail: "Maximum global ammonite diversity — hundreds of coexisting families worldwide." },
    ],
  },
  {
    name: "Cretaceous",
    start: 145,
    end: 66,
    color: "#0891b2",
    bgColor: "#0891b220",
    diversity: 80,
    summary: "Heteromorphs flourish; extinction at 66 Ma",
    detail:
      "Cretaceous ammonites were still highly diverse but saw the rise of heteromorphs — species with uncoiled, bizarre shell shapes: hook-shaped, turreted, helical, even paperclip-shaped. These were not diseased or deformed — they were highly successful specialized adaptations. At 66 Ma, the K-Pg asteroid impact ended the ammonites entirely. Not a single species survived.",
    events: [
      { ma: 130, label: "Heteromorph explosion", type: "diversification", detail: "Uncoiled heteromorph ammonites diversify enormously — hooks, spirals, helices, and bizarre paperclip shapes." },
      { ma: 66, label: "K-Pg extinction", type: "extinction", detail: "Chicxulub asteroid impact + Deccan Traps volcanism. All ammonites extinct. Nautiloids survive." },
    ],
  },
];

// Total time range
const MA_START = 420;
const MA_END = 60;
const TOTAL_MA = MA_START - MA_END;

function pct(ma: number) { return ((MA_START - ma) / TOTAL_MA) * 100; }

const EVENT_ICONS: Record<TimelineEvent["type"], string> = {
  origin: "◆",
  extinction: "✕",
  diversification: "▲",
  note: "•",
};
const EVENT_COLORS: Record<TimelineEvent["type"], string> = {
  origin: "#34d399",
  extinction: "#f87171",
  diversification: "#60a5fa",
  note: "#94a3b8",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function GeologicTimeline() {
  const [activePeriod, setActivePeriod] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<TimelineEvent | null>(null);

  const period = PERIODS.find((p) => p.name === activePeriod);

  return (
    <div className="my-8 rounded-xl border border-border bg-[#111] overflow-hidden select-none">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Ammonite Evolution Timeline</h3>
        <p className="text-xs text-muted-foreground mt-0.5">400 million years of history — click a period to explore</p>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Time axis label */}
        <div className="flex justify-between text-[10px] text-muted-foreground font-mono px-0.5">
          <span>420 Ma</span>
          <span>← millions of years ago →</span>
          <span>66 Ma</span>
        </div>

        {/* Period bars */}
        <div className="relative flex flex-col gap-1.5">
          {PERIODS.map((p) => {
            const left = pct(p.start);
            const width = pct(p.end) - pct(p.start);
            const isActive = activePeriod === p.name;

            return (
              <div key={p.name} className="relative h-10 rounded overflow-hidden bg-[#0d0d0d] border border-border/50">
                {/* Period fill */}
                <button
                  className="absolute h-full rounded transition-opacity"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    backgroundColor: p.color + (isActive ? "50" : "30"),
                    borderRight: `2px solid ${p.color}60`,
                  }}
                  onClick={() => {
                    setActivePeriod(isActive ? null : p.name);
                    setActiveEvent(null);
                  }}
                />

                {/* Diversity bar */}
                <div
                  className="absolute bottom-0 rounded-sm pointer-events-none"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    height: `${p.diversity * 0.4}%`,
                    backgroundColor: p.color + "80",
                  }}
                />

                {/* Period label */}
                <span
                  className="absolute inset-y-0 flex items-center px-2 text-[11px] font-medium pointer-events-none"
                  style={{
                    left: `${left}%`,
                    color: isActive ? p.color : "#94a3b8",
                  }}
                >
                  {p.name}
                </span>

                {/* Events */}
                {p.events.map((ev) => (
                  <button
                    key={ev.label}
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-[9px] font-bold z-10 hover:scale-125 transition-transform"
                    style={{
                      left: `${pct(ev.ma)}%`,
                      transform: "translateX(-50%) translateY(-50%)",
                      color: EVENT_COLORS[ev.type],
                      backgroundColor: EVENT_COLORS[ev.type] + "25",
                      border: `1px solid ${EVENT_COLORS[ev.type]}60`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveEvent(activeEvent?.label === ev.label ? null : ev);
                    }}
                    title={ev.label}
                  >
                    {EVENT_ICONS[ev.type]}
                  </button>
                ))}
              </div>
            );
          })}

          {/* Ma tick marks */}
          <div className="relative h-4">
            {[420, 400, 380, 360, 340, 320, 300, 280, 260, 240, 220, 200, 180, 160, 140, 120, 100, 80, 66].map((ma) => (
              <span
                key={ma}
                className="absolute text-[9px] text-muted-foreground/50 font-mono"
                style={{ left: `${pct(ma)}%`, transform: "translateX(-50%)" }}
              >
                {ma}
              </span>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-[10px] text-muted-foreground">
          {Object.entries(EVENT_ICONS).map(([type, icon]) => (
            <span key={type} className="flex items-center gap-1.5">
              <span style={{ color: EVENT_COLORS[type as keyof typeof EVENT_COLORS] }}>{icon}</span>
              <span className="capitalize">{type}</span>
            </span>
          ))}
        </div>

        {/* Info panel */}
        <AnimatePresence mode="wait">
          {activeEvent ? (
            <motion.div
              key={activeEvent.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="rounded-lg border border-border bg-[#0a0a0a] p-4 flex gap-3"
            >
              <span className="text-xl shrink-0" style={{ color: EVENT_COLORS[activeEvent.type] }}>
                {EVENT_ICONS[activeEvent.type]}
              </span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-foreground">{activeEvent.label}</h4>
                  <span className="text-xs text-muted-foreground font-mono">{activeEvent.ma} Ma</span>
                </div>
                <p className="text-xs text-foreground/75 leading-5">{activeEvent.detail}</p>
              </div>
            </motion.div>
          ) : period ? (
            <motion.div
              key={period.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="rounded-lg border border-border bg-[#0a0a0a] p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: period.color }} />
                <h4 className="text-sm font-semibold text-foreground">{period.name}</h4>
                <span className="text-xs text-muted-foreground font-mono ml-auto">{period.start}–{period.end} Ma</span>
              </div>
              <p className="text-xs font-medium text-muted-foreground mb-2">{period.summary}</p>
              <p className="text-xs text-foreground/75 leading-5">{period.detail}</p>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-lg border border-border/50 bg-[#0a0a0a] p-4 text-center text-xs text-muted-foreground"
            >
              Click a colored period bar to see details, or click an event marker (◆ ✕ ▲) for key moments.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
