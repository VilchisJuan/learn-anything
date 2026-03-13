"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Heteromorph shapes rendered as SVG paths ──────────────────────────────────

// Gyrocone: open planispiral — coils don't touch (like a loose watch spring)
function GyroconePath({ color, cx = 55, cy = 55 }: { color: string; cx?: number; cy?: number }) {
  const B = 0.09; // very low expansion — nearly same radius per whorl
  const A = 30 / Math.exp(B * 4 * Math.PI);
  const pts = Array.from({ length: 200 }, (_, i) => {
    const t = (i / 199) * 3.5 * Math.PI;
    const r = A * Math.exp(B * t) + 14; // offset so whorls don't touch
    const x = cx + r * Math.cos(t);
    const y = cy - r * Math.sin(t);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return <path d={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />;
}

// Ancylocone: hook-shaped — a few coils then unfurling into a straight/curved shaft
function AncyloconePath({ color, cx = 55, cy = 58 }: { color: string; cx?: number; cy?: number }) {
  // Coiled part
  const B = 0.18, A = 8;
  const coil = Array.from({ length: 80 }, (_, i) => {
    const t = (i / 79) * 2.2 * Math.PI;
    const r = A * Math.exp(B * t);
    const x = cx + r * Math.cos(t);
    const y = cy - r * Math.sin(t);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  });
  // Straight hook extending from last coil point
  const lastT = 2.2 * Math.PI;
  const lastR = A * Math.exp(B * lastT);
  const lx = cx + lastR * Math.cos(lastT);
  const ly = cy - lastR * Math.sin(lastT);
  // Hook curves upward
  const hook = `M${lx.toFixed(1)},${ly.toFixed(1)} C${(lx - 10).toFixed(1)},${(ly + 18).toFixed(1)} ${(lx + 14).toFixed(1)},${(ly + 28).toFixed(1)} ${(lx + 26).toFixed(1)},${(ly + 12).toFixed(1)}`;
  return (
    <>
      <path d={coil.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d={hook} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </>
  );
}

// Turrilitone: helicoidal — 3D screw shape, shown as tapering spiral going up
function TurrilitonePath({ color, cx = 55, cy = 70 }: { color: string; cx?: number; cy?: number }) {
  const turns = 4;
  const pts = Array.from({ length: 200 }, (_, i) => {
    const t = (i / 199) * turns * Math.PI * 2;
    const r = 18 - (i / 199) * 12; // tapering radius
    const x = cx + r * Math.cos(t);
    const y = cy - (i / 199) * 60 - r * 0.3 * Math.sin(t); // vertical offset + slight oscillation
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return <path d={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />;
}

// Baculite: straight rod with a tiny protoconch at one end
function BaculitePath({ color, cx = 55, cy = 80 }: { color: string; cx?: number; cy?: number }) {
  // Tiny coiled start (protoconch)
  const proto = Array.from({ length: 40 }, (_, i) => {
    const t = (i / 39) * 1.5 * Math.PI;
    const r = 5 + i * 0.05;
    const x = cx + r * Math.cos(t + Math.PI);
    const y = cy - r * Math.sin(t + Math.PI);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  });
  // Straight shaft with slight taper
  const shaft = `M${cx},${cy - 8} L${cx},${(cy - 8 - 58).toFixed(1)}`;
  // Slight curvature lines showing septa
  const septa = Array.from({ length: 9 }, (_, i) => {
    const sy = cy - 10 - i * 6;
    return `M${(cx - 5).toFixed(1)},${sy.toFixed(1)} Q${cx},${(sy - 2).toFixed(1)} ${(cx + 5).toFixed(1)},${sy.toFixed(1)}`;
  });
  return (
    <>
      <path d={proto.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d={shaft} fill="none" stroke={color} strokeWidth="4.5" strokeLinecap="round" opacity="0.4" />
      <path d={shaft} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {septa.map((d, i) => <path key={i} d={d} fill="none" stroke={color} strokeWidth="0.8" opacity="0.6" />)}
    </>
  );
}

// Nipponites: chaotic 3D knot — random-looking but regular
function NipponitesPath({ color, cx = 55, cy = 55 }: { color: string; cx?: number; cy?: number }) {
  // Lissajous-like path to suggest tangled 3D coiling
  const pts = Array.from({ length: 300 }, (_, i) => {
    const t = (i / 299) * 5 * Math.PI;
    const r = 28;
    const x = cx + r * Math.cos(t) * Math.cos(t * 0.37);
    const y = cy + r * Math.sin(t) * Math.cos(t * 0.47 + 0.7);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return <path d={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />;
}

// ─── Data ──────────────────────────────────────────────────────────────────────
interface Heteromorph {
  id: string;
  name: string;
  type: string;
  period: string;
  example: string;
  color: string;
  description: string;
  lifestyle: string;
  why: string;
  facts: string[];
}

const HETEROMORPHS: Heteromorph[] = [
  {
    id: "gyrocone",
    name: "Gyrocone",
    type: "Open planispiral",
    period: "Triassic–Cretaceous",
    example: "Crioceras, Australiceras",
    color: "#fbbf24",
    description: "The coils don't touch each other — unlike a normal ammonite where each whorl overlaps the previous. The result is an open, unfurling spiral. Hydrodynamically stable but slow.",
    lifestyle: "Likely drifted at moderate depths, tentacles trailing passively for prey.",
    why: "Uncoiling may have been a response to niche shifts — less need for fast swimming, more benefit from passive drift feeding.",
    facts: ["Still planispiral (all in one plane)", "Whorls separate with gaps between", "Found worldwide in Cretaceous deposits"],
  },
  {
    id: "ancylocone",
    name: "Ancylocone",
    type: "Hook-shaped",
    period: "Early–Late Cretaceous",
    example: "Ancyloceras, Scaphites",
    color: "#f97316",
    description: "Begins as a normal coiled ammonite for a few whorls, then straightens and curves into a hook. The hook end is where the adult animal lived. Scaphites is the most famous example.",
    lifestyle: "Probably lived near the seafloor, the hook holding the aperture oriented downward to catch bottom-dwelling prey.",
    why: "Sexual dimorphism: microconchs often show more extreme uncoiling than macroconchs of the same species.",
    facts: ["Begins coiled, ends as a hook", "Scaphites common in Cretaceous chalk", "Hook may have anchored aperture near seafloor"],
  },
  {
    id: "turrilitone",
    name: "Turrilitone",
    type: "Helicoidal (screw-like)",
    period: "Mid–Late Cretaceous",
    example: "Turrilites, Mariella",
    color: "#a78bfa",
    description: "Instead of coiling in a flat plane, the shell spirals upward like a snail or a corkscrew. The tallest known Turrilites reached 15 cm. This 3D coiling is entirely unlike a nautilus.",
    lifestyle: "Orientation uncertain — the shell may have hung vertically or been carried horizontally. Probably a slow swimmer or drifter.",
    why: "Convergent evolution with gastropods (snails), though ammonites and snails are only distantly related.",
    facts: ["True 3D helical coiling", "Convergent with gastropod shell form", "Cretaceous chalk marker fossil"],
  },
  {
    id: "baculite",
    name: "Baculite",
    type: "Orthocone (straight rod)",
    period: "Late Cretaceous",
    example: "Baculites compressus, B. aquilaensis",
    color: "#34d399",
    description: "A tiny coiled protoconch followed by a very long straight tube. Baculites could reach 2 metres. The sutures are among the most complex of any ammonite — allowing the straight shell to withstand deep pressure.",
    lifestyle: "Probably oriented vertically in the water column, drifting and catching plankton. Extremely abundant in the Western Interior Seaway of North America.",
    why: "The straight form appears repeatedly across geological time — it's a remarkably stable shape for a passive drifting predator.",
    facts: ["Can exceed 2 metres in length", "Tiny coiled start (protoconch)", "Most complex sutures of any ammonite", "Mass mortality deposits of thousands found"],
  },
  {
    id: "nipponites",
    name: "Nipponites",
    type: "Nostoceratone (3D knot)",
    period: "Late Cretaceous",
    example: "Nipponites mirabilis",
    color: "#f87171",
    description: "The most bizarre of all ammonites — the shell reverses direction repeatedly, creating a 3D tangle that looks completely chaotic. Described as 'the most irregular cephalopod known.' Yet its growth is completely regular: a repeating U-shape.",
    lifestyle: "Almost certainly a slow drift feeder, passively floating near the surface with tentacles spread. Its shape would be hydrodynamically stable in gentle currents.",
    why: "Mathematical analysis shows Nipponites' shell is actually a regular pattern of linked U-bends — it only appears random. Its bizarre form may have served for buoyancy rather than swimming.",
    facts: ["Appears random but is mathematically regular", "3D 'knot' of repeating U-bends", "Named from Japanese fossil finds", "Probably floated like a plankton trap"],
  },
];

const SVG_RENDERERS: Record<string, (props: { color: string }) => React.ReactElement> = {
  gyrocone:    ({ color }) => <svg viewBox="0 0 110 110" className="w-full h-full"><GyroconePath color={color} /></svg>,
  ancylocone:  ({ color }) => <svg viewBox="0 0 110 110" className="w-full h-full"><AncyloconePath color={color} /></svg>,
  turrilitone: ({ color }) => <svg viewBox="0 0 110 110" className="w-full h-full"><TurrilitonePath color={color} /></svg>,
  baculite:    ({ color }) => <svg viewBox="0 0 110 110" className="w-full h-full"><BaculitePath color={color} /></svg>,
  nipponites:  ({ color }) => <svg viewBox="0 0 110 110" className="w-full h-full"><NipponitesPath color={color} /></svg>,
};

// ─── Component ─────────────────────────────────────────────────────────────────
export function HeteromorphGallery() {
  const [active, setActive] = useState<string>(HETEROMORPHS[0].id);
  const entry = HETEROMORPHS.find((h) => h.id === active)!;

  return (
    <div className="my-8 rounded-xl border border-border bg-[#111] overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Heteromorph Shell Forms</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Ammonites that abandoned the coiled shell — five bizarre body plans</p>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Selector tabs */}
        <div className="flex md:flex-col border-b md:border-b-0 md:border-r border-border bg-[#0a0a0a] shrink-0 overflow-x-auto md:overflow-x-visible">
          {HETEROMORPHS.map((h) => (
            <button
              key={h.id}
              onClick={() => setActive(h.id)}
              className={`flex flex-col items-center gap-1 px-4 py-3 text-left transition-colors border-b md:border-b-0 md:border-r-2 shrink-0 ${
                active === h.id
                  ? "border-current bg-[#111]"
                  : "border-transparent hover:bg-[#111]/50"
              }`}
              style={active === h.id ? { borderColor: h.color } : {}}
            >
              <span className="text-xs font-semibold" style={{ color: active === h.id ? h.color : "#64748b" }}>
                {h.name}
              </span>
              <span className="text-[9px] text-muted-foreground hidden md:block">{h.type}</span>
            </button>
          ))}
        </div>

        {/* Main content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
            className="flex-1 flex flex-col sm:flex-row bg-[#0d0d0d]"
          >
            {/* SVG */}
            <div className="flex items-center justify-center p-6 shrink-0 sm:w-44">
              <div className="w-28 h-28" style={{ filter: `drop-shadow(0 0 8px ${entry.color}40)` }}>
                {SVG_RENDERERS[entry.id]?.({ color: entry.color })}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 p-5 flex flex-col gap-4 border-t sm:border-t-0 sm:border-l border-border">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-bold text-foreground">{entry.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground">{entry.type}</span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <span className="text-[10px] text-muted-foreground italic">{entry.example}</span>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <span className="text-[10px] text-muted-foreground">{entry.period}</span>
                </div>
              </div>

              <p className="text-xs text-foreground/80 leading-5">{entry.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-md bg-[#111] border border-border p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Lifestyle</p>
                  <p className="text-xs text-foreground/70 leading-5">{entry.lifestyle}</p>
                </div>
                <div className="rounded-md bg-[#111] border border-border p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Why uncoil?</p>
                  <p className="text-xs text-foreground/70 leading-5">{entry.why}</p>
                </div>
              </div>

              <ul className="flex flex-col gap-1">
                {entry.facts.map((f) => (
                  <li key={f} className="text-[10px] text-foreground/65 flex items-start gap-1.5">
                    <span style={{ color: entry.color }} className="mt-px">›</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
